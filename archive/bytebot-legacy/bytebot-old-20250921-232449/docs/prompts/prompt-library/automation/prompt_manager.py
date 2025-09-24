#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
提示词库自动化管理工具
功能：自动创建、更新和维护提示词库文件
作者：敏捷项目团队
版本：1.0.0
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import yaml

class PromptLibraryManager:
    """提示词库管理器"""
    
    def __init__(self, base_path: str = None):
        """初始化管理器
        
        Args:
            base_path: 提示词库根目录路径
        """
        self.base_path = Path(base_path) if base_path else Path(__file__).parent.parent
        self.config_path = self.base_path / "automation" / "config.yaml"
        self.template_path = self.base_path / "automation" / "templates"
        self.load_config()
        
    def load_config(self):
        """加载配置文件"""
        if self.config_path.exists():
            with open(self.config_path, 'r', encoding='utf-8') as f:
                self.config = yaml.safe_load(f)
        else:
            self.config = self.get_default_config()
            self.save_config()
    
    def get_default_config(self) -> Dict:
        """获取默认配置"""
        return {
            "categories": {
                "business": ["需求分析", "方案设计", "开发实现", "质量保证", "部署运维", "项目管理"],
                "function": ["问题诊断", "方案生成", "代码操作", "工具使用", "知识管理"],
                "technical": ["前端技术", "后端技术", "DevOps", "AI_ML", "安全技术"]
            },
            "template": {
                "quality_stars": 5,
                "default_usage_count": 0,
                "auto_increment_id": True
            },
            "triggers": {
                "keywords": ["牛逼", "很好", "确认", "认可"],
                "patterns": [
                    r"确认.*需求",
                    r"认可.*方案",
                    r"同意.*设计"
                ]
            }
        }
    
    def save_config(self):
        """保存配置文件"""
        os.makedirs(self.config_path.parent, exist_ok=True)
        with open(self.config_path, 'w', encoding='utf-8') as f:
            yaml.dump(self.config, f, default_flow_style=False, allow_unicode=True)
    
    def generate_prompt_id(self) -> str:
        """生成提示词ID"""
        # 获取现有提示词数量
        existing_files = list(self.base_path.rglob("*提示词_*.md"))
        max_id = 0
        
        for file in existing_files:
            match = re.search(r'提示词_(\d+)\.md$', file.name)
            if match:
                max_id = max(max_id, int(match.group(1)))
        
        return f"{max_id + 1:03d}"
    
    def create_prompt_file(self, 
                          content: str,
                          title: str,
                          business_category: str,
                          function_category: str,
                          technical_category: str,
                          tags: List[str],
                          keywords: List[str],
                          scenarios: List[str]) -> str:
        """创建提示词文件
        
        Returns:
            创建的文件路径
        """
        prompt_id = self.generate_prompt_id()
        filename = f"{title}提示词_{prompt_id}.md"
        
        # 确定文件路径（优先业务分类）
        file_path = self.base_path / "业务分类" / business_category / filename
        
        # 创建目录
        os.makedirs(file_path.parent, exist_ok=True)
        
        # 生成文件内容
        file_content = self.generate_file_content(
            content, title, business_category, function_category, 
            technical_category, tags, keywords, scenarios, prompt_id
        )
        
        # 写入文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(file_content)
        
        # 更新索引
        self.update_indexes(filename, business_category, function_category, 
                          technical_category, tags, keywords)
        
        return str(file_path)
    
    def generate_file_content(self, content: str, title: str, 
                            business_cat: str, function_cat: str, 
                            technical_cat: str, tags: List[str], 
                            keywords: List[str], scenarios: List[str], 
                            prompt_id: str) -> str:
        """生成提示词文件内容"""
        tags_str = " ".join([f"#{tag}" for tag in tags])
        keywords_str = "\n- ".join(keywords)
        scenarios_str = "\n- ".join(scenarios)
        
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return f"""# {title}提示词

## 提示词内容
```
{content}
```

## 分类信息
- **业务分类**: {business_cat}
- **功能分类**: {function_cat}
- **技术分类**: {technical_cat}
- **标签**: {tags_str}

## 质量评估
- **创新性**: ⭐⭐⭐⭐ (4/5) - 自动生成的高质量提示词
- **实用性**: ⭐⭐⭐⭐⭐ (5/5) - 基于实际需求生成
- **通用性**: ⭐⭐⭐⭐ (4/5) - 具有良好的复用性
- **综合评分**: 4.3/5

## 应用场景
- {scenarios_str}

## 关键词
- {keywords_str}

## 效果评估
- **问题解决**: 自动化生成，提高效率
- **实施效果**: 基于用户确认的需求生成
- **用户反馈**: 待收集
- **复用价值**: 高 - 可作为类似需求的参考模板

## 相关提示词
- 待关联

## 使用统计
- **收录时间**: {current_time}
- **使用次数**: 0
- **最后使用**: 未使用
- **用户评分**: 待评估

## 优化建议
- 根据实际使用效果进行调优
- 收集用户反馈进行改进
- 定期更新以适应新需求

## 使用示例
### 基础用法
```
{content}
```

### 扩展用法
- 可根据具体场景调整参数
- 支持与其他提示词组合使用

## 变体提示词
- 标准版：适用于常规场景
- 详细版：适用于复杂需求
- 简化版：适用于快速处理
"""
    
    def update_indexes(self, filename: str, business_cat: str, 
                      function_cat: str, technical_cat: str, 
                      tags: List[str], keywords: List[str]):
        """更新索引文件"""
        # 更新标签索引
        self.update_tag_index(tags)
        
        # 更新关键词索引
        self.update_keyword_index(keywords)
        
        # 更新使用频率统计
        self.update_usage_stats(business_cat, function_cat, technical_cat)
    
    def update_tag_index(self, tags: List[str]):
        """更新标签索引"""
        index_path = self.base_path / "索引文件" / "标签索引.md"
        if not index_path.exists():
            return
        
        # 读取现有内容并更新
        # 这里简化处理，实际应该解析现有内容并更新统计
        pass
    
    def update_keyword_index(self, keywords: List[str]):
        """更新关键词索引"""
        index_path = self.base_path / "索引文件" / "关键词索引.md"
        if not index_path.exists():
            return
        
        # 读取现有内容并更新
        # 这里简化处理，实际应该解析现有内容并更新统计
        pass
    
    def update_usage_stats(self, business_cat: str, function_cat: str, technical_cat: str):
        """更新使用频率统计"""
        stats_path = self.base_path / "索引文件" / "使用频率统计.md"
        if not stats_path.exists():
            return
        
        # 读取现有内容并更新
        # 这里简化处理，实际应该解析现有内容并更新统计
        pass
    
    def detect_trigger(self, user_input: str) -> bool:
        """检测触发条件
        
        Args:
            user_input: 用户输入内容
            
        Returns:
            是否触发自动生成
        """
        # 关键词检测
        for keyword in self.config["triggers"]["keywords"]:
            if keyword in user_input:
                return True
        
        # 模式匹配
        for pattern in self.config["triggers"]["patterns"]:
            if re.search(pattern, user_input):
                return True
        
        return False
    
    def extract_requirements(self, conversation_history: List[str]) -> Dict:
        """从对话历史中提取需求信息
        
        Args:
            conversation_history: 对话历史记录
            
        Returns:
            提取的需求信息
        """
        # 简化实现，实际应该使用NLP技术进行智能提取
        requirements = {
            "title": "自动生成需求",
            "content": "基于用户确认的需求自动生成的提示词",
            "business_category": "项目管理",
            "function_category": "方案生成",
            "technical_category": "AI_ML",
            "tags": ["自动生成", "需求确认", "项目管理"],
            "keywords": ["需求", "确认", "自动生成"],
            "scenarios": ["需求确认后的自动化处理", "项目沟通协作", "提示词复用"]
        }
        
        # 从最近的对话中提取关键信息
        recent_content = " ".join(conversation_history[-5:])  # 取最近5条
        
        # 简单的关键词提取（实际应该使用更复杂的NLP算法）
        if "需求分析" in recent_content:
            requirements["business_category"] = "需求分析"
        elif "方案设计" in recent_content:
            requirements["business_category"] = "方案设计"
        elif "开发实现" in recent_content:
            requirements["business_category"] = "开发实现"
        
        return requirements
    
    def auto_generate_prompt(self, conversation_history: List[str]) -> Optional[str]:
        """自动生成提示词
        
        Args:
            conversation_history: 对话历史记录
            
        Returns:
            生成的提示词文件路径，如果未触发则返回None
        """
        # 检测最后一条消息是否触发
        if not conversation_history or not self.detect_trigger(conversation_history[-1]):
            return None
        
        # 提取需求信息
        requirements = self.extract_requirements(conversation_history)
        
        # 生成提示词内容
        prompt_content = self.generate_prompt_content(requirements, conversation_history)
        
        # 创建提示词文件
        file_path = self.create_prompt_file(
            content=prompt_content,
            title=requirements["title"],
            business_category=requirements["business_category"],
            function_category=requirements["function_category"],
            technical_category=requirements["technical_category"],
            tags=requirements["tags"],
            keywords=requirements["keywords"],
            scenarios=requirements["scenarios"]
        )
        
        return file_path
    
    def generate_prompt_content(self, requirements: Dict, conversation_history: List[str]) -> str:
        """生成提示词内容
        
        Args:
            requirements: 需求信息
            conversation_history: 对话历史
            
        Returns:
            生成的提示词内容
        """
        # 基于需求和对话历史生成提示词
        # 这里是简化实现，实际应该使用更智能的生成算法
        
        base_template = "请帮我处理以下需求：[具体需求描述]。需要包括："
        
        if requirements["business_category"] == "需求分析":
            base_template += "1）需求范围和边界 2）用户故事和验收标准 3）技术可行性评估 4）风险识别和应对策略"
        elif requirements["business_category"] == "方案设计":
            base_template += "1）技术方案设计 2）架构选型 3）实现路径 4）风险评估"
        elif requirements["business_category"] == "开发实现":
            base_template += "1）代码实现 2）单元测试 3）集成测试 4）文档编写"
        elif requirements["business_category"] == "项目管理":
            base_template += "1）项目规划 2）任务分解 3）进度跟踪 4）风险管控 5）团队协作"
        else:
            base_template += "1）问题分析 2）解决方案 3）实施计划 4）效果评估"
        
        return base_template


def main():
    """主函数 - 用于测试"""
    manager = PromptLibraryManager()
    
    # 测试自动生成
    test_conversation = [
        "我需要一个用户管理系统",
        "包括用户注册、登录、权限管理",
        "需要支持多角色权限控制",
        "这个方案很好，我确认这个需求"
    ]
    
    result = manager.auto_generate_prompt(test_conversation)
    if result:
        print(f"自动生成提示词文件：{result}")
    else:
        print("未检测到触发条件")


if __name__ == "__main__":
    main()