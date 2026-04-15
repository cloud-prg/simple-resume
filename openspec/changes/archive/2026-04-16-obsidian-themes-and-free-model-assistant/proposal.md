## Why

当前简历编辑与浏览交互在视觉层次、氛围与可发现性上偏「工具默认态」，缺少像 Obsidian 那样可切换的沉浸式阅读/写作体验；同时用户希望在站内用常见免费模型（如 MiniMax、通义千问等）获得即时辅助，但缺少结构化入口与可预期的流式体验。

## What Changes

- 引入三种全局外观模式（浅色 / 米色 / 深色），整体色系参考 Obsidian 的克制对比与纸张感，但按产品要求分别以蓝、淡黄、紫作为各模式的主色倾向。
- 用设计令牌（CSS 变量 + 少量组件级映射）驱动背景、文本、边框、强调色与 Ant Design 主题对齐，避免硬编码散落。
- 新增「免费模型助手」入口，以弹窗（Modal/Drawer 形态）承载对话；支持在预设的免费模型提供方之间切换（至少覆盖 MiniMax 与 Qwen 两类集成路径）。
- 助手回答采用服务端推送的 SSE 流式输出；浏览器侧使用 Web 标准的 `EventSource`（MDN 所述 API）消费事件流，并处理完成、错误与中断。
- 为密钥/端点配置提供明确的安全边界：默认通过同源后端代理转发第三方 API，不把用户密钥写进前端仓库。

## Capabilities

### New Capabilities

- `theme-appearance`: 全局三种外观模式与主色语义、持久化与无障碍对比底线。
- `assistant-chat-modal`: 弹窗内助手交互、模型选择、SSE（`EventSource`）流式渲染与生命周期管理。

### Modified Capabilities

- 无（`openspec/specs/` 当前无既有能力规格）。

## Impact

- 前端：`src/` 下页面与简历组件样式、可能的根布局/ConfigProvider、Tailwind/CSS 模块与 `public/tailwind-jit.css` 的令牌扩展。
- 构建与部署：若引入同源 SSE 代理，需要 `vite` 开发代理与生产环境（`deploy.sh` 所指向的静态托管/边缘函数）协调；类型定义与 ESLint 规则可能新增网络相关模块。
- 依赖：优先使用浏览器内置 `EventSource`；如需自定义请求头，评估轻量 polyfill 或改为 `fetch`+ReadableStream（本变更默认以 MDN `EventSource` 为准，代理层需兼容标准 SSE 响应）。
