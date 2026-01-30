#!/bin/bash
# 通用函数库 - 日志输出和工具函数

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 日志函数
log_info()     { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()     { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()    { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }
log_progress() { echo -e "${CYAN}[PROGRESS]${NC} $1"; }
log_dry()      { echo -e "${BLUE}[DRY-RUN]${NC} $1"; }

# 格式化文件大小
format_size() {
    local bytes=$1
    if [[ -z "$bytes" || "$bytes" == "0" ]]; then
        echo "0 B"
        return
    fi
    if [[ $bytes -ge 1073741824 ]]; then
        printf "%.2f GB" "$(echo "scale=2; $bytes/1073741824" | bc)"
    elif [[ $bytes -ge 1048576 ]]; then
        printf "%.2f MB" "$(echo "scale=2; $bytes/1048576" | bc)"
    elif [[ $bytes -ge 1024 ]]; then
        printf "%.2f KB" "$(echo "scale=2; $bytes/1024" | bc)"
    else
        echo "$bytes B"
    fi
}

# 格式化时间
format_time() {
    local seconds=$1
    if [[ $seconds -ge 3600 ]]; then
        printf "%dh %dm %ds" $((seconds/3600)) $((seconds%3600/60)) $((seconds%60))
    elif [[ $seconds -ge 60 ]]; then
        printf "%dm %ds" $((seconds/60)) $((seconds%60))
    else
        printf "%ds" $seconds
    fi
}

# 获取文件大小（跨平台）
get_file_size() {
    local file=$1
    if [[ "$OSTYPE" == "darwin"* ]]; then
        stat -f%z "$file" 2>/dev/null
    else
        stat -c%s "$file" 2>/dev/null
    fi
}

# 显示分隔线
show_separator() {
    echo -e "${1:-$GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 显示标题
show_title() {
    local title=$1
    local color=${2:-$BLUE}
    echo ""
    echo -e "${color}════════════════════════════════════════${NC}"
    echo -e "${color}    $title${NC}"
    echo -e "${color}════════════════════════════════════════${NC}"
    echo ""
}

