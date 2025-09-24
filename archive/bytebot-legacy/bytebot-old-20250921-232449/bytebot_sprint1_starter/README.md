# Bytebot Sprint-1 Starter (Logo/Icon/UI + Trae IDE Agent)
- /agent: 智能体系统提示、工具清单、路由、策略
- /design: 设计 Tokens、Logo 概念、Icon 模板与预览
- /eval: 样本与规则（请扩充至每项 ≥20 条）
- /scripts: Lint/对比度校验与占位脚本
- /ci: 门禁阈值配置

建议流程：
1) 填写品牌简报，运行 brand_brief_parse → generate_logo → asset_lint
2) 批量生成 Icon 与 App 图标 → 运行 asset_lint 与对比度检查
3) 编译 UI Tokens 与组件预览 → 运行 accessibility_check
4) 跑 /eval 下样本 → 按 /ci/gates.yaml 做门禁
