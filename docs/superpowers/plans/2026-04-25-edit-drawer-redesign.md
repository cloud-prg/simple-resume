# 编辑弹窗改左侧抽屉实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将简历编辑弹窗（`EditResumeModal`）改为从左侧滑出的抽屉（`EditResumeDrawer`），编辑状态下隐藏左侧模板列表，抽屉与右侧预览区并排占满屏幕。

**Architecture:** `ResumePage` 新增 `drawerOpen` 状态控制 sidebar 显隐和 Drawer 开关；`EditResumeDrawer` 内部使用 Antd `Drawer` 替代 `Modal`，宽度 `max(320px, 20vw)`，无遮罩；预览区自动撑满剩余空间。

**Tech Stack:** React 18, TypeScript, Vite, Ant Design (Drawer, Button, Select, ColorPicker, Input, message), form-render, CSS Modules

---

## 文件结构映射

| 文件 | 操作 | 职责 |
|---|---|---|
| `src/pages/ResumePage/components/EditResumeDrawer/index.tsx` | 新建（从旧文件迁移改写） | 抽屉组件：标题、表单、底部操作栏 |
| `src/pages/ResumePage/components/EditResumeDrawer/index.module.css` | 新建（从旧文件迁移改写） | 抽屉内部样式 |
| `src/pages/ResumePage/components/EditResumeModal/index.tsx` | 删除 | 旧弹窗组件 |
| `src/pages/ResumePage/components/EditResumeModal/index.module.css` | 删除 | 旧弹窗样式 |
| `src/pages/ResumePage/index.tsx` | 修改 | 主页面：引入 Drawer、新增状态、控制 sidebar 显隐 |
| `src/pages/ResumePage/index.module.css` | 修改 | 主页面样式：sidebar 隐藏过渡、main 宽度自适应 |

---

### Task 1: 新建 EditResumeDrawer 目录并复制旧文件

**Files:**
- Create: `src/pages/ResumePage/components/EditResumeDrawer/index.tsx`
- Create: `src/pages/ResumePage/components/EditResumeDrawer/index.module.css`

- [ ] **Step 1: 复制旧组件文件到 Drawer 目录**

```bash
cp src/pages/ResumePage/components/EditResumeModal/index.tsx src/pages/ResumePage/components/EditResumeDrawer/index.tsx
cp src/pages/ResumePage/components/EditResumeModal/index.module.css src/pages/ResumePage/components/EditResumeDrawer/index.module.css
```

- [ ] **Step 2: 提交新建文件**

```bash
git add src/pages/ResumePage/components/EditResumeDrawer/
git commit -m "chore: copy EditResumeModal to EditResumeDrawer (pre-refactor)"
```

---

### Task 2: 将 Modal 改为 Drawer

**Files:**
- Modify: `src/pages/ResumePage/components/EditResumeDrawer/index.tsx`

当前文件导入的是 `Modal`，需要改为 `Drawer`，并调整所有相关 props 和样式。

- [ ] **Step 1: 替换导入和类型名称**

把文件中所有 `EditResumeModal` 改为 `EditResumeDrawer`，`EditResumeModalHandle` 改为 `EditResumeDrawerHandle`。导入从 `Modal` 改为 `Drawer`。

```tsx
// 修改前
import { Modal, Button, message, Select, ColorPicker, Input } from 'antd';
// 修改后
import { Drawer, Button, message, Select, ColorPicker, Input } from 'antd';

// 修改前
export type EditResumeModalHandle = {
// 修改后
export type EditResumeDrawerHandle = {

// 修改前
const EditResumeModal = forwardRef<EditResumeModalHandle, IProps>(function EditResumeModal(props, ref) {
// 修改后
const EditResumeDrawer = forwardRef<EditResumeDrawerHandle, IProps>(function EditResumeDrawer(props, ref) {
```

- [ ] **Step 2: 替换 Modal 为 Drawer**

把 JSX 中的 `<Modal>...</Modal>` 替换为 `<Drawer>...</Drawer>`，并调整 props。

```tsx
// 移除这些 Modal 专属 props:
// width="min(920px, 92vw)"
// cancelText="取消"
// okText={mode === 'edit' ? '保存' : '创建'}
// onOk={handleOk}
// onCancel={handleCancel}

// 替换为 Drawer props:
<Drawer
    placement="left"
    mask={false}
    width="max(320px, 20vw)"
    open={open}
    onClose={handleCancel}
    // afterOpenChange、destroyOnClose、styles 保持不变
>
    {/* 内部内容完全不变 */}
</Drawer>
```

注意：`Drawer` 没有 `onOk` 和 `cancelText/okText`，所以底部操作栏需要我们自己放在 Drawer 的 children 里。

- [ ] **Step 3: 把底部操作栏内联到 Drawer children 末尾**

在 `FormRender` 组件之后、Drawer 结束标签之前，插入底部按钮区：

```tsx
<div className={modalStyles.drawerFooter}>
    <Button onClick={handleCancel}>取消</Button>
    <Button type="primary" onClick={handleOk}>
        {mode === 'edit' ? '保存' : '创建'}
    </Button>
</div>
```

- [ ] **Step 4: 更新 displayName 和 export**

```tsx
EditResumeDrawer.displayName = 'EditResumeDrawer';
export default EditResumeDrawer;
```

- [ ] **Step 5: 提交**

```bash
git add src/pages/ResumePage/components/EditResumeDrawer/index.tsx
git commit -m "feat: replace Modal with Drawer in EditResumeDrawer"
```

---

### Task 3: 更新 Drawer 样式

**Files:**
- Modify: `src/pages/ResumePage/components/EditResumeDrawer/index.module.css`

- [ ] **Step 1: 新增 drawerFooter 样式**

在文件末尾追加：

```css
.drawerFooter {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 12px;
    border-top: 1px solid var(--sr-border);
    margin-top: 16px;
}
```

保留文件中现有的 `.titleScope`、`.templateRow`、`.partialHint`、`.sectionOrderPanel`、`.sectionOrderTitle`、`.sectionOrderRow` 等样式不动。

- [ ] **Step 2: 提交**

```bash
git add src/pages/ResumePage/components/EditResumeDrawer/index.module.css
git commit -m "style: add drawerFooter styles"
```

---

### Task 4: 更新 ResumePage 引入 Drawer 并新增状态

**Files:**
- Modify: `src/pages/ResumePage/index.tsx`

- [ ] **Step 1: 替换导入路径和类型名**

```tsx
// 修改前
import EditResumeModal, { type EditResumeModalHandle } from "./components/EditResumeModal";
// 修改后
import EditResumeDrawer, { type EditResumeDrawerHandle } from "./components/EditResumeDrawer";
```

- [ ] **Step 2: 替换 ref 类型**

```tsx
// 修改前
const editModalRef = useRef<EditResumeModalHandle>(null);
// 修改后
const editModalRef = useRef<EditResumeDrawerHandle>(null);
```

- [ ] **Step 3: 替换两处 JSX 中的组件名**

文件中共有两处 `<EditResumeModal>...</EditResumeModal>`，全部改为 `<EditResumeDrawer>...</EditResumeDrawer>`。props 保持不变。

```tsx
// 第一处（编辑简历按钮）
<EditResumeDrawer
    ref={editModalRef}
    data={resume}
    onSuccess={() => {
        message.success('编辑已保存');
    }}
    onChange={handleEdit}
>
    编辑简历
</EditResumeDrawer>

// 第二处（新建模板按钮）
<EditResumeDrawer
    mode="create"
    data={resume}
    onSuccess={() => {
        message.success('创建成功');
    }}
    onChange={handleCreate}
>
    <div className={styles.btnDashed}>
        <span>＋ 新建模板</span>
    </div>
</EditResumeDrawer>
```

- [ ] **Step 4: 提交**

```bash
git add src/pages/ResumePage/index.tsx
git commit -m "refactor: use EditResumeDrawer in ResumePage"
```

---

### Task 5: 新增编辑态布局控制（sidebar 显隐 + 过渡动画）

**Files:**
- Modify: `src/pages/ResumePage/index.tsx`
- Modify: `src/pages/ResumePage/index.module.css`

当前 `ResumePage` 没有状态能感知 Drawer 是否打开。`EditResumeDrawer` 的 `open` 状态是内部封装的。为了让父组件知道何时隐藏 sidebar，需要在 `ResumePage` 增加 `drawerOpen` 状态。

**方案：** `ResumePage` 新增 `drawerOpen` 状态，传给 `EditResumeDrawer` 的 `open` 属性，由 `ResumePage` 统一控制。`EditResumeDrawer` 的 imperative `openEdit` 方法改为通过回调通知父组件打开。

但这样改动较大。更简单的方案：保持 `EditResumeDrawer` 内部自管理 `open` 状态，同时暴露一个 `onOpenChange` 回调给父组件，让父组件知道 Drawer 开关状态。

- [ ] **Step 1: 给 EditResumeDrawer 增加 onOpenChange 回调**

在 `src/pages/ResumePage/components/EditResumeDrawer/index.tsx` 中：

```tsx
interface IProps {
    children: React.ReactNode;
    data: ResumeProps;
    mode?: 'create' | 'edit';
    onChange: (data: ResumeProps) => void;
    onSuccess: () => void;
    onOpenChange?: (open: boolean) => void;  // 新增
}
```

在 `setOpen` 的地方同步调用 `onOpenChange`。可以把 `setOpen` 包装一下：

```tsx
const setOpenWrapped = useCallback((next: boolean) => {
    setOpen(next);
    props.onOpenChange?.(next);
}, [props.onOpenChange]);
```

然后把文件中所有 `setOpen(` 替换为 `setOpenWrapped(`。

注意：`useImperativeHandle` 里的 `setOpen(true)` 也要改为 `setOpenWrapped(true)`；`handleCancel` 里的 `setOpen(false)` 也要改；`onFinish` 里的 `setOpen(false)` 也要改。

- [ ] **Step 2: 在 ResumePage 新增 drawerOpen 状态并绑定**

```tsx
const [drawerOpen, setDrawerOpen] = React.useState(false);
```

传给两处 `EditResumeDrawer`：

```tsx
<EditResumeDrawer
    ref={editModalRef}
    data={resume}
    onSuccess={() => { message.success('编辑已保存'); }}
    onChange={handleEdit}
    onOpenChange={setDrawerOpen}   // 新增
>
```

```tsx
<EditResumeDrawer
    mode="create"
    data={resume}
    onSuccess={() => { message.success('创建成功'); }}
    onChange={handleCreate}
    onOpenChange={setDrawerOpen}   // 新增
>
```

- [ ] **Step 3: 给 aside 和 main 加条件类名**

在 `ResumePage` 的 JSX 中：

```tsx
<aside className={`${styles.sidebar} ${drawerOpen ? styles.sidebarHidden : ''}`}>
```

```tsx
<main className={`${styles.main} ${drawerOpen ? styles.mainEditing : ''}`}>
```

- [ ] **Step 4: 在 index.module.css 新增样式**

```css
.sidebarHidden {
    display: none;
}

.mainEditing {
    padding-left: 0;
}
```

注意：当前 `.main` 有 `padding: 1.5rem`，在编辑态时不需要去掉 padding，因为右侧预览区本来就需要 padding。但如果想要抽屉和预览区之间无间隙，可以在 `.mainEditing` 中调整。不过 Drawer 是 `position: fixed` 的，它不会占据文档流空间，所以 `.main` 的宽度本来就是 `100vw` 减去 sidebar 的 260px。当 sidebar 隐藏后，`.main` 会自动撑满整个宽度。Drawer 浮在上面，所以不需要额外调整 `.main` 的宽度。

等一下，Antd Drawer 默认是 `position: fixed`，它会脱离文档流。所以即使 sidebar 隐藏了，`.main` 会撑满 100vw，但 Drawer 会浮在最左侧覆盖一部分。这正是我们要的效果。

所以 `.mainEditing` 可能不需要额外样式。但如果想要更紧凑，可以保留空类名作为扩展点。

**修正：** 不需要 `.mainEditing`，只需要 `.sidebarHidden`。

- [ ] **Step 5: 提交**

```bash
git add src/pages/ResumePage/components/EditResumeDrawer/index.tsx
git add src/pages/ResumePage/index.tsx
git add src/pages/ResumePage/index.module.css
git commit -m "feat: sidebar hides when edit drawer opens"
```

---

### Task 6: 删除旧 Modal 组件文件

**Files:**
- Delete: `src/pages/ResumePage/components/EditResumeModal/index.tsx`
- Delete: `src/pages/ResumePage/components/EditResumeModal/index.module.css`

- [ ] **Step 1: 删除旧目录**

```bash
rm -rf src/pages/ResumePage/components/EditResumeModal
```

- [ ] **Step 2: 提交**

```bash
git add src/pages/ResumePage/components/EditResumeModal
git commit -m "chore: remove old EditResumeModal"
```

---

### Task 7: 验证构建

- [ ] **Step 1: 运行类型检查**

```bash
npx tsc --noEmit
```

Expected: 无错误。

- [ ] **Step 2: 运行构建**

```bash
npm run build
```

Expected: 构建成功，无错误。

- [ ] **Step 3: 运行 lint**

```bash
npm run lint
```

Expected: 无错误。

- [ ] **Step 4: 提交**

```bash
git commit -m "chore: verify build after drawer refactor" --allow-empty
```

---

## Self-Review Checklist

1. **Spec coverage：**
   - [x] 左侧 Drawer 替代 Modal — Task 2
   - [x] 编辑态隐藏 sidebar — Task 5
   - [x] Drawer 宽度 `max(320px, 20vw)` — Task 2
   - [x] 预览区撑满剩余空间 — Task 5（sidebar 隐藏后 .main 自动撑满）
   - [x] 保留表单逻辑和局部编辑 — Task 2（Drawer children 内容不变）
   - [x] 支持新建和编辑两种模式 — Task 2（mode prop 不变）

2. **Placeholder scan：** 无 TBD/TODO，无模糊描述。

3. **类型一致性：**
   - `EditResumeDrawerHandle` 在 Task 2 中定义，Task 4 中导入使用，一致。
   - `onOpenChange` 在 Task 5 Step 1 定义，Step 2 传入，一致。

---

## 执行选项

Plan complete and saved to `docs/superpowers/plans/2026-04-25-edit-drawer-redesign.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
