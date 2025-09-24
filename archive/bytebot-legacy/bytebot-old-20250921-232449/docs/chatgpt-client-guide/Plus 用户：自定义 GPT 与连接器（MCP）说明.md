# ChatGPT Plus 用户：自定义 GPT（GPTs）与连接器（MCP）说明（官方信息整理）

本文面向 ChatGPT Plus 个人用户，聚焦两块能力：
- 自定义 GPT（GPTs，包括自定义 Actions）
- 连接器 Connectors（含自定义连接器，基于 MCP 协议）

请以文末“官方参考”链接为准，功能会随版本迭代而变更。

---

## 一、自定义 GPT（GPTs）

- 可用性（Plus）：官方发布说明显示，构建自定义 GPT（含自定义 Actions）的能力面向付费用户开放，并明确“GPTs with Custom Actions”在 Web 端对 Plus/Pro/Team 等付费计划开放，企业和教育版分阶段推出。
- 支持模型：官方发布说明中提到，自定义 GPT 支持选择多种模型，且“GPTs with Custom Actions”当前支持 GPT‑4o 与 4.1。

实际使用要点：
1) 进入 https://chatgpt.com/gpts（或产品内“Explore GPTs”/“创建”入口），按照向导为 GPT 配置名称、指令、知识、隐私等。
2) 在“Actions/自定义操作”中，可基于 OpenAPI 规范描述外部 HTTP API（用于非 MCP 的自定义 API 集成）。
3) 保存并测试 GPT；如涉及 OAuth/密钥等鉴权，请按界面提示配置。


## 二、连接器（Connectors）与 MCP

连接器用于把第三方应用与 ChatGPT 连接起来（如 Google Drive、GitHub、SharePoint 等），以便在聊天或深度研究中检索与引用相关内容。连接器支持“聊天内联使用”“深度研究”“同步索引”等模式。

- Plus 用户可用性：官方帮助文档标明，连接器按计划开放，Plus 在非某些受限地区可使用。若你位于 EEA/瑞士/英国等受限地区，可能暂不可用（以帮助中心的计划可用性表为准）。
- 自定义连接器（MCP）：官方明确“自定义连接器”面向 ChatGPT Pro 以及 Business/Enterprise/Edu 工作区开放。该能力使用 Model Context Protocol（MCP），可把 ChatGPT 连接到你自建的三方应用与内部系统。注意：自定义连接器为面向开发者的功能，需满足 MCP 技术规范。

实际使用要点（内置连接器，Plus 用户）：
1) 设置路径：个人资料 → Settings → Connectors → 选择目标应用 → Connect，完成 OAuth 等授权。
2) 在聊天中使用：新建对话 → Tools → 选择“Use connectors”或“Deep research”，勾选一个或多个数据源后提问；返回内容会带可点击引用。
3) 同步索引（Synced connectors）：在设置中选择需要预先索引的范围，完成后 ChatGPT 可在相关问答中自动引用索引内容（也可在提示中显式包含/排除）。
4) 自动使用（仅部分连接器）：官方说明当连接 Gmail/日历/通讯录后，在支持的版本中可在对话中自动引用，无需每次手动勾选（可在 Settings → Connectors 中关闭自动使用）。

常见问题：
- 连接自定义连接器报未授权？官方说明这通常是你的 MCP 实现未满足技术要求所致。请对照 MCP 规范进行修正。
- 自定义连接器与普通连接器的区别？前者允许你通过 MCP 接入自建或未在列表中的系统；后者是官方提供的现成应用连接。


## 三、MCP（Model Context Protocol）一览

- 作用：标准化 ChatGPT（客户端）与外部“工具/数据源”（服务端）之间的通信协议，用来暴露“资源/工具/提示/内存”等能力。
- 开发门槛：需要按 MCP 规范实现服务端（可本地或远程部署），并在 ChatGPT 中以“自定义连接器”方式接入（当前此能力面向 Pro 与组织版）。
- 规范与示例：请参考官方 MCP 文档与示例仓库，确保服务端符合握手、会话、资源与工具描述等要求。


## 四、给 Plus 用户的结论与建议

- 你可以：
  - 在 Plus 账号下创建与使用“自定义 GPT（GPTs）”，并为其配置自定义 Actions（非 MCP，基于 OpenAPI 的外部 HTTP API）。
  - 在地区允许时使用官方内置连接器，把常见应用（如 Google Drive、GitHub）接入对话或深度研究流程。

- 你不能（当前官方口径）：
  - 在 Plus 计划下直接使用“自定义连接器（MCP）”把自建系统连入 ChatGPT；该能力面向 Pro 或组织版（Business/Enterprise/Edu）。

- 迁移路径：
  - 若你需要把公司/内部系统作为“自定义连接器”供 ChatGPT 使用，请考虑升级至 ChatGPT Pro 或组织工作区（Business/Enterprise/Edu），并按 MCP 规范落地你的服务端后接入。
  - 若仅需调用外部 HTTP API，优先考虑在“自定义 GPT”的 Actions 中按 OpenAPI 方式集成，通常更易上手。


## 官方参考
- Connectors in ChatGPT（功能与计划可用性、自定义连接器与 MCP 链接、使用方法、常见报错）：
  https://help.openai.com/en/articles/11487775-connectors-in-chatgpt
- ChatGPT — Release Notes（关于 GPTs 与 Custom Actions 的开放范围与模型支持等）：
  https://help.openai.com/en/articles/6825453-chatgpt-release-notes
- ChatGPT Business（原 Team）— Release Notes（关于 GPTs 入口、连接器在组织计划中的启用等）：
  https://help.openai.com/en/articles/11391654-chatgpt-team-release-notes
- Model Context Protocol（MCP）规范：
  https://platform.openai.com/docs/mcp