# Link
- [Simple Resume Online](https://cloud-prg.github.io/simple-resume/)

# Introduction
- Based on xRender, antd, react, tailwindcss
- Easy to use, customize and deploy

## Appearance (Obsidian-inspired)
- Three global themes: **浅色**（蓝主色）、**米色**（淡黄纸张）、**深色**（紫主色），在简历页侧栏「外观」中切换，并写入 `localStorage`（键 `sr-appearance`）。

## Free model assistant (SSE + EventSource)
- 简历页侧栏 **模型助手**：弹窗内选择 **MiniMax** 或 **通义千问**，通过同源 `POST /api/assistant/prepare` 换取 `sessionId`，再用浏览器 [`EventSource`](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) 连接 `GET /api/assistant/stream?sessionId=...` 接收 `text/event-stream`。
- **开发**：Vite 内置占位 API 与模拟流，无需密钥即可联调。
- **生产**：静态页本身无法代理第三方；需在托管侧提供同源 `/api/assistant/*` BFF，并在构建时设置 `VITE_ASSISTANT_ENABLED=true` 以启用发送按钮。契约说明见 `src/api/assistantContract.ts`。

# Keywords
- React
- Ant Design
- Tailwind CSS
- xRender

# Why not use third-party dom-to-pdf libraries?
The effects displayed by third-party libraries often result in lost styles or layout misalignment. In terms of time cost, it's more efficient to use native capabilities rather than debugging library bugs.
