#!/bin/bash
# 通用远程部署脚本: 本地构建镜像 -> 传输到远程 -> Docker Compose 部署
# 用法详见: ./deploy.sh --help

export DOCKER_BUILDKIT=1
set -euo pipefail

# 脚本目录和项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="${SCRIPT_DIR}/.deploy.env"
DRY_RUN=false
ROLLBACK=false

# M8: 临时文件追踪 + 中断清理
TEMP_FILES=()
cleanup_on_exit() {
    stop_ssh_control 2>/dev/null || true
    for f in ${TEMP_FILES[@]+"${TEMP_FILES[@]}"}; do
        rm -f "$f" 2>/dev/null
    done
}
trap cleanup_on_exit EXIT INT TERM

# 加载库文件
source "${SCRIPT_DIR}/lib/common.sh"
source "${SCRIPT_DIR}/lib/ssh.sh"
source "${SCRIPT_DIR}/lib/docker.sh"

# 帮助信息
show_help() {
    cat <<EOF
用法: $(basename "$0") [选项]
选项:
  -c, --config FILE    指定配置文件路径 (默认: .deploy.env)
  -d, --dry-run        预演模式，不实际执行部署
  -r, --rollback       回滚到上一次成功部署的版本
  -h, --help           显示此帮助信息
示例:
  $(basename "$0") --config .deploy.prod.env    # 使用 prod 配置
  $(basename "$0") --dry-run                    # 预演模式
EOF
    exit 0
}

# 参数解析
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -r|--rollback)
                ROLLBACK=true
                shift
                ;;
            -h|--help)
                show_help
                ;;
            *)
                log_error "未知参数: $1\n使用 --help 查看帮助"
                ;;
        esac
    done
}

# 配置加载
load_config() {
    log_info "加载配置文件: $CONFIG_FILE"

    [[ ! -f "$CONFIG_FILE" ]] && log_error "配置文件不存在: $CONFIG_FILE\n请复制 .deploy.env.example 为 .deploy.env 并填写配置"

    # shellcheck source=/dev/null
    source "$CONFIG_FILE"

    # 设置默认值
    SSH_PORT="${SSH_PORT:-22}"
    IMAGE_TAG="${IMAGE_TAG:-$(date +%Y%m%d%H%M%S)}"
    IMAGE_RETENTION_COUNT="${IMAGE_RETENTION_COUNT:-5}"
    COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
    ENV_FILES="${ENV_FILES:-.env.production}"
    APP_PORT="${APP_PORT:-3000}"
    CONTAINER_NAME="${CONTAINER_NAME:-app}"
    COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-}"
    DOCKER_NETWORK="${DOCKER_NETWORK:-}"
    COMPOSE_VARS="${COMPOSE_VARS:-IMAGE_NAME IMAGE_TAG APP_PORT CONTAINER_NAME}"

    # 验证必填项
    [[ -z "${SSH_HOST:-}" ]] && log_error "缺少必填配置: SSH_HOST"
    [[ -z "${SSH_USER:-}" ]] && log_error "缺少必填配置: SSH_USER"
    [[ -z "${REMOTE_DIR:-}" ]] && log_error "缺少必填配置: REMOTE_DIR"
    [[ -z "${IMAGE_NAME:-}" ]] && log_error "缺少必填配置: IMAGE_NAME"

    # 验证文件存在
    local compose_path="${PROJECT_DIR}/${COMPOSE_FILE}"
    [[ ! -f "$compose_path" ]] && log_error "Compose 文件不存在: $compose_path"

    # 验证环境文件
    IFS=',' read -ra env_array <<< "$ENV_FILES"
    for env_file in "${env_array[@]}"; do
        env_file=$(echo "$env_file" | xargs)
        local env_path="${PROJECT_DIR}/${env_file}"
        [[ ! -f "$env_path" ]] && log_error "环境文件不存在: $env_path"
    done

    local net_info=""
    [[ -n "$DOCKER_NETWORK" ]] && net_info=", 网络: ${DOCKER_NETWORK}"
    log_info "配置验证通过 [镜像: ${IMAGE_NAME}:${IMAGE_TAG}, 容器: ${CONTAINER_NAME}, 端口: ${APP_PORT}${net_info}]"
}

# 构建 compose 命令选项（-p / -f 参数）
get_compose_opts() {
    local opts=""
    [[ -n "$COMPOSE_PROJECT_NAME" ]] && opts="$opts -p $COMPOSE_PROJECT_NAME"
    [[ -n "$DOCKER_NETWORK" ]] && opts="$opts -f docker-compose.yml -f docker-compose.network.yml"
    echo "$opts"
}

# 准备远程环境
prepare_remote() {
    if $DRY_RUN; then
        log_dry "将执行: 上传 compose 和环境配置到 $SSH_HOST:$REMOTE_DIR"
        return 0
    fi

    log_info "准备远程部署环境..."

    # 创建远程目录
    ssh_cmd "mkdir -p $REMOTE_DIR" || log_error "创建远程目录失败"

    # 上传 compose 文件
    local compose_path="${PROJECT_DIR}/${COMPOSE_FILE}"
    log_info "上传 compose 配置: $COMPOSE_FILE"
    scp_cmd "$compose_path" "$REMOTE_DIR/docker-compose.yml" || log_error "上传 docker-compose.yml 失败"

    # 上传环境配置文件并设置安全权限
    # docker-compose.yml 固定引用 .env.production，需将环境文件重命名上传
    IFS=',' read -ra env_array <<< "$ENV_FILES"
    for env_file in "${env_array[@]}"; do
        env_file=$(echo "$env_file" | xargs)
        local env_path="${PROJECT_DIR}/${env_file}"
        local remote_name=".env.production"
        log_info "上传环境配置: $env_file -> $remote_name"
        scp_cmd "$env_path" "$REMOTE_DIR/$remote_name" || log_error "上传 $env_file 失败"
        ssh_cmd "chmod 600 $REMOTE_DIR/$remote_name" || log_warn "设置 $remote_name 权限失败"
    done

    # 生成网络 override 文件
    if [[ -n "$DOCKER_NETWORK" ]]; then
        generate_network_override "$DOCKER_NETWORK" "$REMOTE_DIR"
    fi

    log_info "远程部署文件准备完成"
}

# M6: 保存当前部署版本（回滚用）
save_deploy_tag() {
    ssh_cmd "echo '$IMAGE_TAG' > $REMOTE_DIR/.last_deploy_tag" 2>/dev/null || true
}

# M6: 读取上一次部署版本
get_last_deploy_tag() {
    ssh_cmd "cat $REMOTE_DIR/.last_deploy_tag 2>/dev/null" 2>/dev/null || echo ""
}

# M6: 回滚到上一版本
rollback() {
    log_info "开始回滚..."

    local last_tag
    last_tag=$(get_last_deploy_tag)

    if [[ -z "$last_tag" ]]; then
        log_error "没有找到上一次部署记录，无法回滚"
    fi

    if [[ "$last_tag" == "$IMAGE_TAG" ]]; then
        log_error "上一次部署版本与当前版本相同: $last_tag"
    fi

    log_info "回滚到版本: $IMAGE_NAME:$last_tag"

    # 验证远程镜像存在
    if ! ssh_cmd "docker image inspect $IMAGE_NAME:$last_tag >/dev/null 2>&1"; then
        log_error "回滚目标镜像不存在: $IMAGE_NAME:$last_tag"
    fi

    # 切换到旧版本
    IMAGE_TAG="$last_tag"
    deploy
    check_status
}

# 根据 COMPOSE_VARS 配置构建 compose 环境变量
build_compose_env_vars() {
    local env_str=""
    for var in $COMPOSE_VARS; do
        local value="${!var}"
        [[ -n "$value" ]] && env_str+="${var}=${value} "
    done
    echo "$env_str"
}

# 执行部署
deploy() {
    if $DRY_RUN; then
        log_dry "将执行: docker compose up -d (镜像: $IMAGE_NAME:$IMAGE_TAG)"
        return 0
    fi

    log_info "部署应用..."

    local compose_opts
    compose_opts=$(get_compose_opts)

    local env_vars
    env_vars=$(build_compose_env_vars)

    ssh_cmd "cd $REMOTE_DIR && $env_vars docker compose $compose_opts up -d --pull never --remove-orphans" || log_error "部署失败"
}

# 检查状态
check_status() {
    if $DRY_RUN; then
        log_dry "将执行: 检查部署状态"
        return 0
    fi

    log_info "检查部署状态..."

    local max_wait=30
    local waited=0
    local compose_opts
    compose_opts=$(get_compose_opts)

    while [[ $waited -lt $max_wait ]]; do
        if ssh_cmd "cd $REMOTE_DIR && docker compose $compose_opts ps 2>/dev/null | grep -qE '(Up|running)'"; then
            ssh_cmd "cd $REMOTE_DIR && docker compose $compose_opts ps"
            return 0
        fi
        sleep 2
        waited=$((waited + 2))
        echo -ne "\r${CYAN}[PROGRESS]${NC} 等待容器启动... ${waited}s/${max_wait}s"
    done

    echo ""
    log_error "部署超时或失败，请检查日志:\n  ssh $SSH_USER@$SSH_HOST 'cd $REMOTE_DIR && docker compose $compose_opts logs --tail=50'"
}

# 主流程
main() {
    parse_args "$@"

    cd "$PROJECT_DIR" || log_error "无法进入项目目录: $PROJECT_DIR"

    local script_start=$(date +%s)

    if $ROLLBACK; then
        show_title "⏪ 回滚部署"
        load_config
        check_ssh_dependencies
        test_ssh_connection
        rollback
    else
        local title="🚀 通用远程部署脚本"
        $DRY_RUN && title="🔍 部署预演模式 (Dry Run)"
        show_title "$title"
        load_config
        check_docker_dependencies
        check_ssh_dependencies
        test_ssh_connection
        build_image
        push_image
        prepare_remote
        deploy
        $DRY_RUN || save_deploy_tag
        cleanup_old_images
        check_status
    fi

    local script_end=$(date +%s)
    local total_duration=$((script_end - script_start))

    echo ""
    show_separator "$GREEN"
    if $DRY_RUN; then
        log_info "🔍 预演完成（未实际执行任何操作）"
    elif $ROLLBACK; then
        log_info "⏪ 回滚完成！"
    else
        log_info "🎉 部署完成！"
    fi
    log_info "   镜像: $IMAGE_NAME:$IMAGE_TAG"
    log_info "   容器: $CONTAINER_NAME"
    log_info "   端口: $APP_PORT"
    [[ -n "$DOCKER_NETWORK" ]] && log_info "   网络: $DOCKER_NETWORK"
    log_info "   总耗时: $(format_time $total_duration)"
    show_separator "$GREEN"
    echo ""
}

main "$@"
