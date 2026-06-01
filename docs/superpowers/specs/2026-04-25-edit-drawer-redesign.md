# 编辑弹窗改为左侧抽屉设计文档

## 目标
将现有简历编辑弹窗（`EditResumeModal`，基于 Ant Design `Modal`）改为从左侧滑出的抽屉（`Drawer`），并在编辑状态下隐藏左侧模板列表，使抽屉与右侧预览区并排占满整个屏幕。

## 现状
- 页面布局：`aside.sidebar`（260px，固定） + `main`（flex:1，预览区）。
- 编辑组件：`EditResumeModal`，内部包裹一个 `Modal`，居中弹出，宽度约 `min(920px, 92vw)`。
- `Modal` 通过 `afterOpenChange` 初始化表单数据，支持局部编辑（`focusRoot`）和完整编辑两种模式。
- 编辑入口有两个："编辑简历" 按钮（完整编辑）和 预览区双击（局部编辑）。

## 设计

### 1. 布局行为
- **非编辑态**：保持现有布局。左侧 sidebar 显示模板列表和操作按钮，右侧为预览区。
- **编辑态**：左侧 sidebar 隐藏；`Drawer` 从左侧滑出；右侧预览区自动撑满剩余空间。
- **宽度规则**：
  - Drawer 宽度：`max(320px, 20vw)`。
  - 预览区宽度：`calc(100vw - max(320px, 20vw))`。
- 两者之和刚好等于 `100vw`，无水平滚动条（除非 Drawer 内表单内容溢出）。

### 2. Drawer 组件
- 使用 Ant Design `Drawer`，`placement="left"`，`mask={false}`（无遮罩，实现并排效果）。
- `destroyOnClose` 保持与现有 Modal 一致，关闭时重置表单。
- 内部结构与现有 Modal 保持一致：页眉（标题 + 模版选择器）、可滚动表单区、底部操作栏（取消/保存）。
- `afterOpenChange` 逻辑从原 Modal 平移，用于初始化表单数据和滚动定位。

### 3. 状态管理
- `ResumePage` 新增状态：
  - `drawerOpen: boolean` — 控制 Drawer 显隐。
  - `drawerMode: 'create' | 'edit'` — 区分新建和编辑。
  - `drawerFocusRoot: ResumeFormRootKey | null` — 局部编辑时聚焦的根区块。
- 当 `drawerOpen === true` 时，`aside.sidebar` 添加隐藏样式（`display: none` 或 `width: 0`）。
- `EditResumeModalHandle` 的 `openEdit` 方法保留，用于预览区双击触发。

### 4. 动画与过渡
- sidebar 隐藏和 Drawer 滑入需同步，避免视觉闪跳。
- 给 sidebar 增加 CSS transition（`width`、`opacity`、`display`），使隐藏过程平滑。
- Drawer 使用 Antd 自带滑入动画。

### 5. 组件职责调整
- 重命名 `EditResumeModal` → `EditResumeDrawer`（文件路径同步调整）。
- 内部不再使用 `Modal`，改用 `Drawer`。
- 样式文件 `index.module.css` 同步更新：移除 Modal 相关样式类，新增 Drawer 内部布局类。
- `ResumePage` 中所有对 `EditResumeModal` 的引用改为 `EditResumeDrawer`。

### 6. 边界情况
- **键盘 ESC**：Antd Drawer 默认支持 ESC 关闭，行为与 Modal 一致。
- **窗口 resize**：`20vw` 为动态值，resize 时 Drawer 和预览区自动重新计算。
- **极小屏（<320px）**：Drawer 保底 320px，此时预览区可能部分被挤出视口，允许横向滚动（极端场景，当前项目未针对移动端优化）。

## 不涉及
- 预览区内容不变，不调整打印逻辑。
- AI 助手弹窗（`AssistantModal`）不受本次改动影响。
- 表单 schema（`schema.ts`）和表单逻辑（`mergeResumePartial`、`ColorHexField` 等）完全复用，不改。

## 改动文件
1. `src/pages/ResumePage/components/EditResumeModal/index.tsx` → `src/pages/ResumePage/components/EditResumeDrawer/index.tsx`
2. `src/pages/ResumePage/components/EditResumeModal/index.module.css` → `src/pages/ResumePage/components/EditResumeDrawer/index.module.css`
3. `src/pages/ResumePage/index.tsx`
4. `src/pages/ResumePage/index.module.css`
