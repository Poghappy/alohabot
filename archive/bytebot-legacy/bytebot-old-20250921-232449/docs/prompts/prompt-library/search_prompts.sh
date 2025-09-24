#!/bin/bash

# 提示词库检索脚本
# 使用方法: ./search_prompts.sh [选项] [关键词]

PROMPT_DIR="$(dirname "$0")"

# 显示帮助信息
show_help() {
    echo "提示词库检索工具"
    echo ""
    echo "使用方法:"
    echo "  $0 [选项] [关键词]"
    echo ""
    echo "选项:"
    echo "  -h, --help          显示帮助信息"
    echo "  -l, --list          列出所有提示词"
    echo "  -s, --stats         显示统计信息"
    echo "  -t, --tags          按标签搜索"
    echo "  -c, --category      按分类搜索 (business|function|tech)"
    echo "  -k, --keyword       按关键词搜索"
    echo "  -r, --recent        显示最近添加的提示词"
    echo ""
    echo "示例:"
    echo "  $0 -k 项目管理        # 搜索包含'项目管理'的提示词"
    echo "  $0 -t '#DevOps'       # 搜索DevOps标签的提示词"
    echo "  $0 -c business        # 列出所有业务分类的提示词"
    echo "  $0 -l                 # 列出所有提示词"
}

# 列出所有提示词
list_all() {
    echo "=== 所有提示词 ==="
    find "$PROMPT_DIR" -name "*.md" -not -path "*/索引文件/*" -not -name "README.md" | while read file; do
        title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
        category=$(dirname "$file" | sed "s|$PROMPT_DIR/||")
        echo "[$category] $title"
        echo "  文件: $file"
        echo ""
    done
}

# 显示统计信息
show_stats() {
    echo "=== 提示词库统计 ==="
    echo "总提示词数: $(find "$PROMPT_DIR" -name "*.md" -not -path "*/索引文件/*" -not -name "README.md" | wc -l)"
    echo ""
    echo "分类统计:"
    echo "  业务分类: $(find "$PROMPT_DIR/业务分类" -name "*.md" 2>/dev/null | wc -l)"
    echo "  功能分类: $(find "$PROMPT_DIR/功能分类" -name "*.md" 2>/dev/null | wc -l)"
    echo "  技术分类: $(find "$PROMPT_DIR/技术分类" -name "*.md" 2>/dev/null | wc -l)"
    echo ""
    if [ -f "$PROMPT_DIR/索引文件/使用频率统计.md" ]; then
        echo "详细统计信息请查看: $PROMPT_DIR/索引文件/使用频率统计.md"
    fi
}

# 按标签搜索
search_by_tag() {
    local tag="$1"
    echo "=== 标签搜索: $tag ==="
    grep -r "$tag" "$PROMPT_DIR" --include="*.md" -l | while read file; do
        if [[ "$file" != *"/索引文件/"* ]]; then
            title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
            category=$(dirname "$file" | sed "s|$PROMPT_DIR/||")
            echo "[$category] $title"
            echo "  文件: $file"
            echo ""
        fi
    done
}

# 按分类搜索
search_by_category() {
    local category="$1"
    case $category in
        "business"|"业务")
            category_dir="$PROMPT_DIR/业务分类"
            ;;
        "function"|"功能")
            category_dir="$PROMPT_DIR/功能分类"
            ;;
        "tech"|"技术")
            category_dir="$PROMPT_DIR/技术分类"
            ;;
        *)
            echo "错误: 未知分类 '$category'"
            echo "支持的分类: business(业务), function(功能), tech(技术)"
            return 1
            ;;
    esac
    
    echo "=== 分类搜索: $category ==="
    if [ -d "$category_dir" ]; then
        find "$category_dir" -name "*.md" | while read file; do
            title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
            subcategory=$(dirname "$file" | sed "s|$category_dir/||")
            echo "[$subcategory] $title"
            echo "  文件: $file"
            echo ""
        done
    else
        echo "分类目录不存在: $category_dir"
    fi
}

# 按关键词搜索
search_by_keyword() {
    local keyword="$1"
    echo "=== 关键词搜索: $keyword ==="
    grep -r "$keyword" "$PROMPT_DIR" --include="*.md" -l | while read file; do
        if [[ "$file" != *"/索引文件/"* ]]; then
            title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
            category=$(dirname "$file" | sed "s|$PROMPT_DIR/||")
            echo "[$category] $title"
            echo "  文件: $file"
            # 显示匹配的行
            echo "  匹配内容:"
            grep -n "$keyword" "$file" | head -3 | sed 's/^/    /'
            echo ""
        fi
    done
}

# 显示最近添加的提示词
show_recent() {
    echo "=== 最近添加的提示词 ==="
    find "$PROMPT_DIR" -name "*.md" -not -path "*/索引文件/*" -not -name "README.md" -exec ls -lt {} + | head -10 | while read line; do
        file=$(echo "$line" | awk '{print $NF}')
        if [ -f "$file" ]; then
            title=$(grep "^# " "$file" | head -1 | sed 's/^# //')
            category=$(dirname "$file" | sed "s|$PROMPT_DIR/||")
            date=$(echo "$line" | awk '{print $6, $7, $8}')
            echo "[$category] $title (添加时间: $date)"
            echo "  文件: $file"
            echo ""
        fi
    done
}

# 主程序
main() {
    case "$1" in
        "-h"|"--help")
            show_help
            ;;
        "-l"|"--list")
            list_all
            ;;
        "-s"|"--stats")
            show_stats
            ;;
        "-t"|"--tags")
            if [ -z "$2" ]; then
                echo "错误: 请提供标签名称"
                exit 1
            fi
            search_by_tag "$2"
            ;;
        "-c"|"--category")
            if [ -z "$2" ]; then
                echo "错误: 请提供分类名称"
                exit 1
            fi
            search_by_category "$2"
            ;;
        "-k"|"--keyword")
            if [ -z "$2" ]; then
                echo "错误: 请提供关键词"
                exit 1
            fi
            search_by_keyword "$2"
            ;;
        "-r"|"--recent")
            show_recent
            ;;
        "")
            show_help
            ;;
        *)
            # 默认按关键词搜索
            search_by_keyword "$1"
            ;;
    esac
}

main "$@"