## Context

`simple-resume` 是基于 React 18、Vite 5、Ant Design 5 与 Tailwind 3 的单页应用，当前 UI 以默认浅色组件风格为主。用户希望获得 Obsidian 式的克制对比与「纸张/夜间」氛围，并在站内通过弹窗使用免费模型流式回答。浏览器侧明确要求使用 MDN 文档中的 `EventSource` 处理 SSE。

## Goals / Non-Goals

**Goals:**

- 提供三种可切换的全局外观：`light`（主色偏蓝）、`sepia`（主色偏淡黄/米色纸张）、`dark`（主色偏紫），并在刷新后保持用户选择。
- 以 CSS 变量作为单一事实来源，映射到页面背景、文本、分隔线与 Ant Design `ConfigProvider` 的 token，使简历阅读区与编辑控件在三种模式下视觉一致。
- 提供弹窗式「免费模型助手」，支持在至少两种集成路径（MiniMax、Qwen）之间切换；模型输出通过同源 SSE 端点流式增量展示。
- 使用 `EventSource` 监听标准 `message`/`error` 生命周期，关闭弹窗或切换模型时释放连接，避免悬挂请求。

**Non-Goals:**

- 不在前端仓库硬编码第三方 API Key；不承诺具体免费额度或账号注册流程（由用户在各平台自行完成）。
- 不实现多轮工具调用、RAG、文件上传等高级 Agent 能力。
- 不把主题系统扩展到导出 PDF/图片像素级 WYSIWYG 校验（仅保证 Web 端观感）。

## Decisions

1. **主题实现：CSS 变量 + Ant Design Token 映射**  
   - **理由**：与现有 Tailwind/CSS Modules 共存成本最低，可渐进替换硬编码色值。  
   - **备选**：仅 Tailwind `darkMode: class` 双主题 — 不足以表达三种模式与「米色纸张」语义。

2. **模式命名与主色语义**  
   - `light`：冷灰背景 + 蓝色强调（链接、主按钮、聚焦环）。  
   - `sepia`：低饱和暖纸背景 + 淡黄主色（强调与选中态），文本保持足够对比。  
   - `dark`：近黑背景 + 紫色强调与柔和边框高光，避免纯霓虹高饱和。  
   - **备选**：完全复刻 Obsidian 官方色板 — 与用户对「蓝/黄/紫」主色要求冲突，故不采用。

3. **持久化：`localStorage` 键**  
   - 例如 `sr-appearance=light|sepia|dark`，在根组件初始化读取并写入 `document.documentElement` 的 `data-theme` 或类名。  
   - **备选**：仅存 session — 用户期望刷新保留，故不采用。

4. **SSE 与 `EventSource` 约束**  
   - 前端仅连接同源相对路径（如 `/api/assistant/stream`），由部署环境或开发服务器将请求转发至 MiniMax/Qwen 的 HTTP API，并把上游流转换为标准 `text/event-stream`。  
   - **理由**：`EventSource` 不支持任意自定义请求头；同源代理可用 Cookie 或短生命周期会话标识，避免把密钥暴露给浏览器全局。  
   - **备选**：`fetch` + `ReadableStream` — 用户明确要求 `EventSource`，故不作为主路径。

5. **弹窗形态**  
   - 使用 Ant Design `Modal`（或 `Drawer` 在窄屏回退）承载聊天区、模型下拉、消息列表与输入框；打开时挂载流式区域，关闭时 `EventSource.close()`。  
   - **备选**：全屏页面路由 — 与「弹窗呈现」需求不符。

## Risks / Trade-offs

- **[Risk] `EventSource` 无法设置 `Authorization` 头** → **Mitigation**：代理层使用服务端保存的密钥或用户在后端配置的环境变量；若必须用户自带 Key，提供后端「临时会话」交换或仅限开发模式的本地代理说明，不在规格中默认可用不安全的 query 传密钥。  
- **[Risk] 静态托管（纯 CDN）无法驻留 SSE 代理** → **Mitigation**：`deploy.sh` 文档化需要边缘函数/轻量 BFF；开发期用 `vite.server.proxy`。  
- **[Risk] 主题与 AntD 组件细节漂移** → **Mitigation**：集中 `themeTokens.ts` 映射，关键页面人工目视回归三种模式。  
- **[Trade-off] 流式 Markdown 渲染复杂度** → 首版可用纯文本累加，后续再引入受限 Markdown。

## Migration Plan

1. 在开发环境加入 SSE 代理桩或 Mock，确保 `EventSource` 可本地验证。  
2. 合并主题令牌与根 `ConfigProvider` 后发布；旧用户默认 `light`，不破坏数据模型。  
3. 若生产尚无代理，助手入口可 `disabled` 并提示部署依赖（实现阶段在 `tasks.md` 中细化开关策略）。

## Open Questions

- 生产环境最终由哪一类运行时承载代理（例如 Cloudflare Worker、自建 Node、或现有网关）需与 `deploy.sh` 目标平台对齐；本设计保持接口层中立。
