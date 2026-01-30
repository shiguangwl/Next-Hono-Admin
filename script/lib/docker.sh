#!/bin/bash
# Docker 镜像构建、传输、部署操作库

# 构建 Docker 镜像
build_image() {
    if $DRY_RUN; then
        log_dry "将执行: docker build --platform linux/amd64 -t $IMAGE_NAME:$IMAGE_TAG ."
        return 0
    fi

    log_info "构建 Docker 镜像 [$IMAGE_NAME:$IMAGE_TAG]..."

    local dockerfile="${PROJECT_DIR}/Dockerfile"
    [[ ! -f "$dockerfile" ]] && log_error "Dockerfile 不存在: $dockerfile"

    local build_start=$(date +%s)

    (cd "$PROJECT_DIR" && docker build --platform linux/amd64 -t "$IMAGE_NAME:$IMAGE_TAG" -f Dockerfile .) || \
        log_error "镜像构建失败"

    local build_end=$(date +%s)
    local build_duration=$((build_end - build_start))

    local image_size=$(docker image inspect "$IMAGE_NAME:$IMAGE_TAG" --format='{{.Size}}' 2>/dev/null)
    local formatted_size=$(format_size "$image_size")

    show_separator "$GREEN"
    log_info "🔨 构建完成统计"
    log_info "   镜像名称: $IMAGE_NAME:$IMAGE_TAG"
    log_info "   镜像大小: $formatted_size"
    log_info "   构建耗时: $(format_time $build_duration)"
    show_separator "$GREEN"
}

# 传输镜像到远程服务器
transfer_image() {
    log_progress "正在压缩镜像..."

    local temp_file="/tmp/docker-image-$$.tar.gz"
    docker save "$IMAGE_NAME:$IMAGE_TAG" | gzip -1 > "$temp_file"

    local compressed_size=$(get_file_size "$temp_file")
    local formatted_size=$(format_size "$compressed_size")
    
    log_progress "开始传输镜像 [压缩后大小: $formatted_size]"
    echo ""

    local start_time=$(date +%s)
    local transfer_status=0

    # 使用 pv 显示进度（如果可用）
    if command -v pv &>/dev/null; then
        pv -s "$compressed_size" -p -t -e -a -N "传输进度" "$temp_file" | \
            ssh_pipe "gunzip | docker load" || transfer_status=$?
    else
        log_warn "传输中（无进度显示）..."
        cat "$temp_file" | ssh_pipe "gunzip | docker load" || transfer_status=$?
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local speed=0
    [[ $duration -gt 0 ]] && speed=$((compressed_size / duration))

    rm -f "$temp_file"

    echo ""
    show_separator "$GREEN"
    log_info "📦 传输完成统计"
    log_info "   总大小: $formatted_size"
    log_info "   耗时:   $(format_time $duration)"
    log_info "   平均速度: $(format_size $speed)/s"
    show_separator "$GREEN"

    return $transfer_status
}

# 推送镜像
push_image() {
    if $DRY_RUN; then
        log_dry "将执行: 传输镜像 $IMAGE_NAME:$IMAGE_TAG 到 $SSH_HOST"
        return 0
    fi

    log_info "推送镜像到远程服务器..."
    transfer_image || log_error "镜像传输失败"
    log_info "镜像推送完成"
}

# 清理旧镜像
cleanup_old_images() {
    if $DRY_RUN; then
        log_dry "将执行: 清理远程旧镜像（保留最近 $IMAGE_RETENTION_COUNT 个）"
        return 0
    fi

    log_info "清理旧镜像版本（保留最近 $IMAGE_RETENTION_COUNT 个）..."

    ssh_cmd "docker images $IMAGE_NAME --format '{{.Tag}}' | grep -v '^latest$' | grep -v '^$IMAGE_TAG$' | tail -n +$IMAGE_RETENTION_COUNT | xargs -r -I {} docker rmi $IMAGE_NAME:{} 2>/dev/null || true"

    log_info "清理未使用的镜像..."
    ssh_cmd "docker image prune -f 2>/dev/null || true"
}

# 检查 Docker 依赖
check_docker_dependencies() {
    command -v docker &>/dev/null || log_error "本地未安装 Docker"
    
    # pv（可选，用于进度显示）
    if ! command -v pv &>/dev/null; then
        log_warn "未安装 pv，将使用备用进度显示"
    fi
}

