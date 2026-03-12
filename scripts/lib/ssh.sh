#!/bin/bash
# SSH 和 SCP 操作封装

# SSH 连接选项
# accept-new: 首次连接自动接受并记录主机密钥，后续连接严格校验（防 MITM）
_ssh_opts="-o StrictHostKeyChecking=accept-new -o ConnectTimeout=30 -o ServerAliveInterval=60"

# 构建 SSH 认证参数
_build_ssh_auth() {
    if [[ -n "${SSH_PASSWORD:-}" ]]; then
        echo "sshpass -p $SSH_PASSWORD"
    fi
}

# 构建 SSH 密钥参数
_build_ssh_key_opt() {
    if [[ -n "${SSH_KEY_PATH:-}" ]]; then
        echo "-i $SSH_KEY_PATH"
    fi
}

# 执行远程 SSH 命令（也支持管道输入）
ssh_cmd() {
    local cmd=$1
    local key_opt
    key_opt=$(_build_ssh_key_opt)

    if [[ -n "${SSH_PASSWORD:-}" ]]; then
        sshpass -p "$SSH_PASSWORD" ssh $_ssh_opts -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    else
        ssh $_ssh_opts $key_opt -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    fi
}

# 复制文件到远程服务器
scp_cmd() {
    local src=$1
    local dest=$2
    local key_opt
    key_opt=$(_build_ssh_key_opt)

    if [[ -n "${SSH_PASSWORD:-}" ]]; then
        sshpass -p "$SSH_PASSWORD" scp $_ssh_opts -P "$SSH_PORT" "$src" "$SSH_USER@$SSH_HOST:$dest"
    else
        scp $_ssh_opts $key_opt -P "$SSH_PORT" "$src" "$SSH_USER@$SSH_HOST:$dest"
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
