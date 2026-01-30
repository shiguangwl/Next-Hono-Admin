#!/bin/bash
# SSH 和 SCP 操作封装

# SSH 连接选项
_ssh_opts="-o StrictHostKeyChecking=no -o ConnectTimeout=30 -o ServerAliveInterval=60"

# 执行远程 SSH 命令
ssh_cmd() {
    local cmd=$1
    if [[ -n "${SSH_PASSWORD:-}" ]]; then
        sshpass -p "$SSH_PASSWORD" ssh $_ssh_opts -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    elif [[ -n "${SSH_KEY_PATH:-}" ]]; then
        ssh $_ssh_opts -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    else
        ssh $_ssh_opts -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    fi
}

# 通过管道传输数据到远程执行
ssh_pipe() {
    local cmd=$1
    if [[ -n "${SSH_PASSWORD:-}" ]]; then
        sshpass -p "$SSH_PASSWORD" ssh $_ssh_opts -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    elif [[ -n "${SSH_KEY_PATH:-}" ]]; then
        ssh $_ssh_opts -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    else
        ssh $_ssh_opts -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    fi
}

# 复制文件到远程服务器
scp_cmd() {
    local src=$1
    local dest=$2
    if [[ -n "${SSH_PASSWORD:-}" ]]; then
        sshpass -p "$SSH_PASSWORD" scp $_ssh_opts -P "$SSH_PORT" "$src" "$SSH_USER@$SSH_HOST:$dest"
    elif [[ -n "${SSH_KEY_PATH:-}" ]]; then
        scp $_ssh_opts -i "$SSH_KEY_PATH" -P "$SSH_PORT" "$src" "$SSH_USER@$SSH_HOST:$dest"
    else
        scp $_ssh_opts -P "$SSH_PORT" "$src" "$SSH_USER@$SSH_HOST:$dest"
    fi
}

# 检查 SSH 依赖
check_ssh_dependencies() {
    if [[ -n "${SSH_PASSWORD:-}" ]] && ! command -v sshpass &>/dev/null; then
        log_warn "使用密码认证但未安装 sshpass，尝试安装..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install hudochenkov/sshpass/sshpass || log_error "安装 sshpass 失败"
        elif [[ -f /etc/debian_version ]]; then
            sudo apt-get update && sudo apt-get install -y sshpass || log_error "安装 sshpass 失败"
        else
            log_error "请手动安装 sshpass"
        fi
    fi
}

# 测试 SSH 连接
test_ssh_connection() {
    if $DRY_RUN; then
        log_dry "将测试 SSH 连接: $SSH_USER@$SSH_HOST:$SSH_PORT"
        return 0
    fi

    log_info "测试 SSH 连接..."
    ssh_cmd "echo 'SSH 连接成功'" >/dev/null || log_error "SSH 连接失败，请检查配置"
}
