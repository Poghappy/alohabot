#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
提示词库CLI管理工具
提供命令行接口来管理提示词库的创建、更新、搜索等功能
"""

import click
import json
import sys
from pathlib import Path
from typing import List, Optional
from prompt_manager import PromptLibraryManager

# 添加当前目录到Python路径
sys.path.insert(0, str(Path(__file__).parent))

@click.group()
@click.option('--base-path', default=None, help='提示词库根目录路径')
@click.pass_context
def cli(ctx, base_path):
    """提示词库管理CLI工具"""
    ctx.ensure_object(dict)
    ctx.obj['manager'] = PromptLibraryManager(base_path)

@cli.command()
@click.option('--title', required=True, help='提示词标题')
@click.option('--content', required=True, help='提示词内容')
@click.option('--business', required=True, help='业务分类')
@click.option('--function', required=True, help='功能分类')
@click.option('--technical', required=True, help='技术分类')
@click.option('--tags', help='标签列表，用逗号分隔')
@click.option('--keywords', help='关键词列表，用逗号分隔')
@click.option('--scenarios', help='应用场景列表，用逗号分隔')
@click.pass_context
def create(ctx, title, content, business, function, technical, tags, keywords, scenarios):
    """创建新的提示词"""
    manager = ctx.obj['manager']
    
    # 解析列表参数
    tags_list = [tag.strip() for tag in tags.split(',')] if tags else []
    keywords_list = [kw.strip() for kw in keywords.split(',')] if keywords else []
    scenarios_list = [sc.strip() for sc in scenarios.split(',')] if scenarios else []
    
    try:
        file_path = manager.create_prompt_file(
            content=content,
            title=title,
            business_category=business,
            function_category=function,
            technical_category=technical,
            tags=tags_list,
            keywords=keywords_list,
            scenarios=scenarios_list
        )
        click.echo(f"✅ 成功创建提示词文件: {file_path}")
    except Exception as e:
        click.echo(f"❌ 创建失败: {str(e)}", err=True)
        sys.exit(1)

@cli.command()
@click.option('--conversation', required=True, help='对话历史JSON文件路径')
@click.pass_context
def auto_generate(ctx, conversation):
    """基于对话历史自动生成提示词"""
    manager = ctx.obj['manager']
    
    try:
        # 读取对话历史
        with open(conversation, 'r', encoding='utf-8') as f:
            conversation_data = json.load(f)
        
        if isinstance(conversation_data, list):
            conversation_history = conversation_data
        else:
            conversation_history = conversation_data.get('messages', [])
        
        # 自动生成
        file_path = manager.auto_generate_prompt(conversation_history)
        
        if file_path:
            click.echo(f"✅ 自动生成提示词文件: {file_path}")
        else:
            click.echo("ℹ️ 未检测到触发条件，未生成提示词")
            
    except FileNotFoundError:
        click.echo(f"❌ 对话历史文件不存在: {conversation}", err=True)
        sys.exit(1)
    except Exception as e:
        click.echo(f"❌ 自动生成失败: {str(e)}", err=True)
        sys.exit(1)

@cli.command()
@click.option('--text', required=True, help='要检测的文本')
@click.pass_context
def detect(ctx, text):
    """检测文本是否触发自动生成条件"""
    manager = ctx.obj['manager']
    
    is_triggered = manager.detect_trigger(text)
    
    if is_triggered:
        click.echo("✅ 检测到触发条件")
    else:
        click.echo("❌ 未检测到触发条件")

@cli.command()
@click.option('--keyword', help='搜索关键词')
@click.option('--category', help='分类筛选')
@click.option('--tag', help='标签筛选')
@click.pass_context
def search(ctx, keyword, category, tag):
    """搜索提示词"""
    manager = ctx.obj['manager']
    
    # 简化的搜索实现
    base_path = manager.base_path
    results = []
    
    # 遍历所有提示词文件
    for file_path in base_path.rglob("*提示词_*.md"):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 简单的关键词匹配
            if keyword and keyword.lower() not in content.lower():
                continue
            
            # 分类筛选
            if category and category not in content:
                continue
            
            # 标签筛选
            if tag and f"#{tag}" not in content:
                continue
            
            results.append({
                'file': str(file_path.relative_to(base_path)),
                'title': file_path.stem.replace('提示词_', '').split('_')[0]
            })
            
        except Exception as e:
            continue
    
    if results:
        click.echo(f"🔍 找到 {len(results)} 个匹配的提示词:")
        for result in results:
            click.echo(f"  - {result['title']} ({result['file']})")
    else:
        click.echo("❌ 未找到匹配的提示词")

@cli.command()
@click.pass_context
def list_categories(ctx):
    """列出所有分类"""
    manager = ctx.obj['manager']
    config = manager.config
    
    click.echo("📋 可用分类:")
    
    click.echo("\n🏢 业务分类:")
    for cat in config['categories']['business']:
        click.echo(f"  - {cat}")
    
    click.echo("\n⚙️ 功能分类:")
    for cat in config['categories']['function']:
        click.echo(f"  - {cat}")
    
    click.echo("\n🔧 技术分类:")
    for cat in config['categories']['technical']:
        click.echo(f"  - {cat}")

@cli.command()
@click.pass_context
def stats(ctx):
    """显示提示词库统计信息"""
    manager = ctx.obj['manager']
    base_path = manager.base_path
    
    # 统计文件数量
    total_files = len(list(base_path.rglob("*提示词_*.md")))
    
    # 按分类统计
    business_stats = {}
    function_stats = {}
    technical_stats = {}
    
    for category in manager.config['categories']['business']:
        count = len(list((base_path / "业务分类" / category).glob("*提示词_*.md")))
        if count > 0:
            business_stats[category] = count
    
    for category in manager.config['categories']['function']:
        count = len(list((base_path / "功能分类" / category).glob("*提示词_*.md")))
        if count > 0:
            function_stats[category] = count
    
    for category in manager.config['categories']['technical']:
        count = len(list((base_path / "技术分类" / category).glob("*提示词_*.md")))
        if count > 0:
            technical_stats[category] = count
    
    click.echo("📊 提示词库统计信息:")
    click.echo(f"\n📁 总提示词数量: {total_files}")
    
    if business_stats:
        click.echo("\n🏢 业务分类统计:")
        for cat, count in business_stats.items():
            click.echo(f"  - {cat}: {count}")
    
    if function_stats:
        click.echo("\n⚙️ 功能分类统计:")
        for cat, count in function_stats.items():
            click.echo(f"  - {cat}: {count}")
    
    if technical_stats:
        click.echo("\n🔧 技术分类统计:")
        for cat, count in technical_stats.items():
            click.echo(f"  - {cat}: {count}")

@cli.command()
@click.option('--config-file', help='配置文件路径')
@click.pass_context
def validate(ctx, config_file):
    """验证提示词库完整性"""
    manager = ctx.obj['manager']
    base_path = manager.base_path
    
    errors = []
    warnings = []
    
    # 检查目录结构
    required_dirs = [
        "业务分类", "功能分类", "技术分类", "索引文件", "automation"
    ]
    
    for dir_name in required_dirs:
        dir_path = base_path / dir_name
        if not dir_path.exists():
            errors.append(f"缺少必需目录: {dir_name}")
    
    # 检查索引文件
    index_files = ["标签索引.md", "关键词索引.md", "使用频率统计.md"]
    for file_name in index_files:
        file_path = base_path / "索引文件" / file_name
        if not file_path.exists():
            warnings.append(f"缺少索引文件: {file_name}")
    
    # 检查提示词文件格式
    prompt_files = list(base_path.rglob("*提示词_*.md"))
    for file_path in prompt_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查必需字段
            required_sections = ["## 提示词内容", "## 分类信息", "## 质量评估"]
            for section in required_sections:
                if section not in content:
                    warnings.append(f"文件 {file_path.name} 缺少必需部分: {section}")
                    
        except Exception as e:
            errors.append(f"无法读取文件 {file_path.name}: {str(e)}")
    
    # 输出结果
    if errors:
        click.echo("❌ 发现错误:")
        for error in errors:
            click.echo(f"  - {error}")
    
    if warnings:
        click.echo("\n⚠️ 发现警告:")
        for warning in warnings:
            click.echo(f"  - {warning}")
    
    if not errors and not warnings:
        click.echo("✅ 提示词库验证通过")
    
    # 返回错误码
    if errors:
        sys.exit(1)

@cli.command()
@click.pass_context
def init(ctx):
    """初始化提示词库目录结构"""
    manager = ctx.obj['manager']
    base_path = manager.base_path
    
    # 创建目录结构
    directories = [
        "业务分类/需求分析",
        "业务分类/方案设计", 
        "业务分类/开发实现",
        "业务分类/质量保证",
        "业务分类/部署运维",
        "业务分类/项目管理",
        "功能分类/问题诊断",
        "功能分类/方案生成",
        "功能分类/代码操作",
        "功能分类/工具使用",
        "功能分类/知识管理",
        "技术分类/前端技术",
        "技术分类/后端技术",
        "技术分类/DevOps",
        "技术分类/AI_ML",
        "技术分类/安全技术",
        "索引文件",
        "automation",
        "logs",
        "backups"
    ]
    
    created_dirs = []
    for dir_path in directories:
        full_path = base_path / dir_path
        if not full_path.exists():
            full_path.mkdir(parents=True, exist_ok=True)
            created_dirs.append(dir_path)
    
    if created_dirs:
        click.echo("✅ 成功创建目录结构:")
        for dir_path in created_dirs:
            click.echo(f"  - {dir_path}")
    else:
        click.echo("ℹ️ 目录结构已存在")
    
    # 创建基础索引文件
    index_files = {
        "README.md": "# 提示词库\n\n这是一个自动化管理的提示词库。\n",
        "索引文件/标签索引.md": "# 标签索引\n\n## 标签使用统计\n\n",
        "索引文件/关键词索引.md": "# 关键词索引\n\n## 已收录关键词\n\n",
        "索引文件/使用频率统计.md": "# 使用频率统计\n\n## 总体统计\n\n"
    }
    
    created_files = []
    for file_path, content in index_files.items():
        full_path = base_path / file_path
        if not full_path.exists():
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            created_files.append(file_path)
    
    if created_files:
        click.echo("\n✅ 成功创建基础文件:")
        for file_path in created_files:
            click.echo(f"  - {file_path}")

if __name__ == '__main__':
    cli()