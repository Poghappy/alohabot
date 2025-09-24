# ChatGPT 客户端教学 · 手册索引（合并结构）

本索引将现有零散文档“合并”为一套统一的手册结构，便于按章节系统学习与检索。
如需生成“一份合并版单文件手册（全部内容整合到一个 .md）”，告诉我，我可在本目录新增并自动编排目录与交叉引用。

更新时间：2025-09-15

---

## 一、基础与权限（从这里开始）
- [ChatGPT Plus 权限与功能（官方说明补充）.md](./ChatGPT%20Plus%20%25E6%259D%2583%25E9%2599%2590%25E4%25B8%258E%25E5%258A%259F%25E8%2583%25BD%25EF%25BC%2588%25E5%25AE%2598%25E6%2596%25B9%25E8%25AF%25B4%25E6%2598%258E%25E8%25A1%25A5%25E5%2585%2585%25EF%25BC%2589.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-plus)
- [Plus 用户：自定义 GPT 与连接器（MCP）说明.md](./Plus%20%25E7%2594%25A8%25E6%2588%25B7%25EF%25BC%259A%25E8%2587%25AA%25E5%25AE%259A%25E4%25B9%2589%20GPT%20%25E4%25B8%258E%25E8%25BF%259E%25E6%258E%25A5%25E5%2599%25A8%25EF%25BC%2588MCP%25EF%25BC%2589%25E8%25AF%25B4%25E6%2598%258E.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-custom-gpt-mcp)

建议阅读顺序：先理解你账号的“可用功能和限制”，再了解“Plus 在 GPTs/连接器（MCP）方面的边界与可行路径”。

---

## 二、GPTs 与 Actions 入门
- [GPT 操作入门.md](./GPT%20%25E6%2593%258D%25E4%25BD%259C%25E5%2585%25A5%25E9%2597%25A8.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-getting-started)
- [GPT 操作.md](./GPT%20%25E6%2593%258D%25E4%25BD%259C.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-overview)

包含：创建自定义 GPT、配置系统指令与知识、启用/调试 Actions 的基础流程与注意事项。

---

## 三、Actions 深入与场景
- [GPT Actions 制作说明.md](./GPT%20Actions%20%25E5%2588%25B6%25E4%25BD%259C%25E8%25AF%25B4%25E6%2598%258E.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-guidance)
- [GPT Actions 库.md](./GPT%20Actions%20%25E5%25BA%2593.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-library)
- [GPT Action 身份验证.md](./GPT%20Action%20%25E8%25BA%25AB%25E4%25BB%25BD%25E9%25AA%258C%25E8%25AF%2581.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-auth)
- [使用 GPT 操作发送和返回文件.md](./%25E4%25BD%25BF%25E7%2594%25A8%20GPT%20%25E6%2593%258D%25E4%25BD%259C%25E5%258F%2591%25E9%2580%2581%25E5%2592%258C%25E8%25BF%2594%25E5%259B%259E%25E6%2596%2587%25E4%25BB%25B6.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-files)
- [使用 GPT 操作进行数据检索.md](./%25E4%25BD%25BF%25E7%2594%25A8%20GPT%20%25E6%2593%258D%25E4%25BD%259C%25E8%25BF%259B%25E8%25A1%258C%25E6%2595%25B0%25E6%258D%25AE%25E6%25A3%2580%25E7%25B4%25A2.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-retrieval)

包含：
- OpenAPI 定义的 Actions 设计要点与调试技巧
- 常见鉴权（API Key / OAuth）配置
- 文件上传/下载、二进制与流式处理
- 结构化检索、分页、错误处理与重试策略

---

## 四、MCP 与自建扩展（开发者）
- [为 ChatGPT 和 API 集成构建 MCP 服务器.md](./%25E4%25B8%25BA%20ChatGPT%20%25E5%2592%258C%20API%20%25E9%259B%2586%25E6%2588%2590%25E6%259E%2584%25E5%25BB%25BA%20MCP%20%25E6%259C%258D%25E5%258A%25A1%25E5%2599%25A8.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-mcp-server)
- [ChatGPT 开发者模式.md](./ChatGPT%20%25E5%25BC%2580%25E5%258F%2591%25E8%2580%2585%25E6%25A8%25A1%25E5%25BC%258F.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-developer-mode)

说明：
- Plus 计划下不可直接使用“自定义连接器（MCP）”接入自建系统；如需该能力，考虑升级到 Pro 或组织版（Business/Enterprise/Edu）。
- 若仅需访问外部 HTTP API，优先用 GPT Actions（更易落地）。

---

## 五、建议阅读路线（从零到进阶）
1. 基础与权限 → Plus 在 GPTs/连接器（MCP）边界
2. GPT 操作入门 → GPT 操作
3. Actions 制作说明 → Actions 库（参考实现）
4. 鉴权与安全（API Key / OAuth）
5. 文件与数据检索等专项能力
6. 需要企业级/自建系统接入 → MCP 服务器与开发者模式

---

## 六、术语与对照
- GPTs：自定义 GPT（含系统指令、知识、Actions 等）
- Actions：基于 OpenAPI 的外部 HTTP API 调用能力（非 MCP）
- Connectors：官方内置连接器（如 Google Drive/GitHub/SharePoint 等）
- 自定义连接器：基于 MCP 接入自建/第三方系统（当前不面向 Plus）
- 深度研究（Deep research）：跨源长时推理与带引用输出，可结合连接器使用

---

## 七、目录一览（清单）
- [ChatGPT Plus 权限与功能（官方说明补充）.md](./ChatGPT%20Plus%20%25E6%259D%2583%25E9%2599%2590%25E4%25B8%258E%25E5%258A%259F%25E8%2583%25BD%25EF%25BC%2588%25E5%25AE%2598%25E6%2596%25B9%25E8%25AF%25B4%25E6%2598%258E%25E8%25A1%25A5%25E5%2585%2585%25EF%25BC%2589.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-plus)
- [Plus 用户：自定义 GPT 与连接器（MCP）说明.md](./Plus%20%25E7%2594%25A8%25E6%2588%25B7%25EF%25BC%259A%25E8%2587%25AA%25E5%25AE%259A%25E4%25B9%2589%20GPT%20%25E4%25B8%258E%25E8%25BF%259E%25E6%258E%25A5%25E5%2599%25A8%25EF%25BC%2588MCP%25EF%25BC%2589%25E8%25AF%25B4%25E6%2598%258E.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-custom-gpt-mcp)
- [GPT 操作入门.md](./GPT%20%25E6%2593%258D%25E4%25BD%259C%25E5%2585%25A5%25E9%2597%25A8.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-getting-started)
- [GPT 操作.md](./GPT%20%25E6%2593%258D%25E4%25BD%259C.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-overview)
- [GPT Actions 制作说明.md](./GPT%20Actions%20%25E5%2588%25B6%25E4%25BD%259C%25E8%25AF%25B4%25E6%2598%258E.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-guidance)
- [GPT Actions 库.md](./GPT%20Actions%20%25E5%25BA%2593.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-library)
- [GPT Action 身份验证.md](./GPT%20Action%20%25E8%25BA%25AB%25E4%25BB%25BD%25E9%259A%258C%25E8%25AF%2581.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-auth)
- [使用 GPT 操作发送和返回文件.md](./%25E4%25BD%25BF%25E7%2594%25A8%20GPT%20%25E6%2593%258D%25E4%25BD%259C%25E5%258F%2591%25E9%2580%2581%25E5%2592%258C%25E8%25BF%2594%25E5%259B%259E%25E6%2596%2587%25E4%25BB%25B6.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-files)
- [使用 GPT 操作进行数据检索.md](./%25E4%25BD%25BF%25E7%2594%25A8%20GPT%20%25E6%2593%258D%25E4%25BD%259C%25E8%25BF%259B%25E8%25A1%258C%25E6%2595%25B0%25E6%258D%25AE%25E6%25A3%2580%25E7%25B4%25A2.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-actions-retrieval)
- [为 ChatGPT 和 API 集成构建 MCP 服务器.md](./%25E4%25B8%25BA%20ChatGPT%20%25E5%2592%258C%20API%20%25E9%259B%2586%25E6%2588%2590%25E6%259E%2584%25E5%25BB%25BA%20MCP%20%25E6%259C%258D%25E5%258A%25A1%25E5%2599%25A8.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-mcp-server)
- [ChatGPT 开发者模式.md](./ChatGPT%20%25E5%25BC%2580%25E5%258F%2591%25E8%2580%2585%25E6%25A8%25A1%25E5%25BC%258F.md) — [在合并手册中查看](./ChatGPT%20客户端教学·合并手册.md#sec-developer-mode)

---

备注：
- 本索引不更改原文档内容，仅在阅读层面“合并编排”。
- 若需统一标题、编号、术语等规范，我可以批量重命名并在不破坏链接的前提下建立映射表（需你确认）。