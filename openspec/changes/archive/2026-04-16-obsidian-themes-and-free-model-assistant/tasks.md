## 1. 主题令牌与全局切换

- [x] 1.1 在全局样式层定义 `light` / `sepia` / `dark` 三套 CSS 变量（背景、表面、主文、次文、边框、主色、强调、聚焦环），主色分别偏蓝、淡黄、紫，并挂在 `document.documentElement` 的 `data-theme`（或等价类名）上切换。
- [x] 1.2 实现外观切换 UI（分段控件或下拉）与 `localStorage` 持久化键读写，应用启动时恢复模式。
- [x] 1.3 用 Ant Design `ConfigProvider` 将 token 映射到按钮、输入、Modal、Typography 等高频组件，目视检查三种模式下无「默认浅色孤岛」。
- [x] 1.4 梳理 `Resume` 相关 CSS Modules / Tailwind 硬编码颜色，改为引用 CSS 变量或语义类，确保阅读区在三种模式下对比度达标。

## 2. 助手弹窗与模型选择

- [x] 2.1 新增助手入口（主导航或简历页工具条），点击打开 `Modal`（窄屏可评估 `Drawer`）布局：消息列表、输入框、发送、停止、提供方选择（`minimax` / `qwen`）。
- [x] 2.2 定义前端到同源代理的请求契约（非流式：创建会话/发送用户消息 ID；流式：SSE URL 与事件 payload 形状），在 README 或代码注释中写清示例。
- [x] 2.3 使用 `EventSource` 连接相对路径 SSE，在 `message` 回调中拼接助手文本；在 `error` 与完成事件中更新 UI 状态。
- [x] 2.4 在关闭弹窗、切换提供方、点击停止时调用 `EventSource.close()` 并清理临时状态，避免重复订阅。
- [x] 2.5 确认生产与开发代理策略：`vite` 开发代理、部署脚本或边缘函数中至少一种可工作的 SSE 转发；若代理未配置则禁用发送并提示部署依赖。

## 3. 验证与收尾

- [x] 3.1 手工回归：三种主题下简历编辑、预览、弹窗打开/关闭、流式输出中断与错误提示。
- [x] 3.2 运行 `pnpm/npm run lint` 与 `build`，修复新增类型与 ESLint 问题。
