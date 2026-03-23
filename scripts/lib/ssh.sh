#!/bin/bash
# SSH 和 SCP 操作封装（基于 ControlMaster 连接复用）

# SSH 基础选项
_ssh_opts="-o StrictHostKeyChecking=accept-new -o ConnectTimeout=30 -o ServerAliveInterval=60"

# ControlMaster socket 路径
_SSH_CTRL_SOCKET=""
_SSH_CTRL_ACTIVE=false

# 构建 SSH 密钥参数
_build_ssh_key_opt() {
    if [[ -n "${SSH_KEY_PATH:-}" ]]; then
        echo "-i $SSH_KEY_PATH"
    fi
}

# 启动 SSH ControlMaster 持久连接（整个部署周期只认证一次）
start_ssh_control() {
    _SSH_CTRL_SOCKET="/tmp/ssh-deploy-$$-${SSH_HOST}"

    local key_opt
    key_opt=$(_build_ssh_key_opt)
    local ctrl_opts="$_ssh_opts -o ControlMaster=yes -o ControlPath=$_SSH_CTRL_SOCKET -o ControlPersist=300 -fN"

    if [[ -n "${SSH_PASSWORD:-}" ]]; then
        sshpass -p "$SSH_PASSWORD" ssh $ctrl_opts $key_opt -p "$SSH_PORT" "$SSH_USER@$SSH_HOST"
    else
        ssh $ctrl_opts $key_opt -p "$SSH_PORT" "$SSH_USER@$SSH_HOST"
    fi

    if [[ $? -eq 0 ]] && [[ -S "$_SSH_CTRL_SOCKET" ]]; then
        _SSH_CTRL_ACTIVE=true
    else
        log_warn "ControlMaster 启动失败，将使用独立连接"
    fi
}

# 关闭 SSH ControlMaster 连接
stop_ssh_control() {
    if $_SSH_CTRL_ACTIVE && [[ -S "$_SSH_CTRL_SOCKET" ]]; then
        ssh -o ControlPath="$_SSH_CTRL_SOCKET" -O exit "$SSH_USER@$SSH_HOST" 2>/dev/null || true
        _SSH_CTRL_ACTIVE=false
    fi
    rm -f "$_SSH_CTRL_SOCKET" 2>/dev/null || true
}

# 构建当前 SSH 连接选项（自动选择复用或独立连接）
_get_ssh_opts() {
    if $_SSH_CTRL_ACTIVE && [[ -S "$_SSH_CTRL_SOCKET" ]]; then
        echo "$_ssh_opts -o ControlPath=$_SSH_CTRL_SOCKET"
    else
        echo "$_ssh_opts"
    fi
}

# 执行远程 SSH 命令（也支持管道输入）
ssh_cmd() {
    local cmd=$1
    local opts
    opts=$(_get_ssh_opts)

    if $_SSH_CTRL_ACTIVE; then
        ssh $opts -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    elif [[ -n "${SSH_PASSWORD:-}" ]]; then
        sshpass -p "$SSH_PASSWORD" ssh $opts -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    else
        local key_opt
        key_opt=$(_build_ssh_key_opt)
        ssh $opts $key_opt -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    fi
}

# 复制文件到远程服务器
scp_cmd() {
    local src=$1
    local dest=$2
    local opts
    opts=$(_get_ssh_opts)

    if $_SSH_CTRL_ACTIVE; then
        scp $opts -P "$SSH_PORT" "$src" "$SSH_USER@$SSH_HOST:$dest"
    elif [[ -n "${SSH_PASSWORD:-}" ]]; then
        sshpass -p "$SSH_PASSWORD" scp $opts -P "$SSH_PORT" "$src" "$SSH_USER@$SSH_HOST:$dest"
    else
        local key_opt
        key_opt=$(_build_ssh_key_opt)
        scp $opts $key_opt -P "$SSH_PORT" "$src" "$SSH_USER@$SSH_HOST:$dest"
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

# 测试 SSH 连接（同时建立 ControlMaster 复用连接）
test_ssh_connection() {
    if $DRY_RUN; then
        log_dry "将测试 SSH 连接: $SSH_USER@$SSH_HOST:$SSH_PORT"
        return 0
    fi

    log_info "测试 SSH 连接..."
    start_ssh_control
    ssh_cmd "echo 'SSH 连接成功'" >/dev/null || log_error "SSH 连接失败，请检查配置"
}
