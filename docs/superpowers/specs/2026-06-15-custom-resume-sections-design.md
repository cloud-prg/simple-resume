# 自定义简历标题与正文模块设计文档

## 目标

让简历正文更灵活：

- 固定正文模块的一级标题可改名，例如“工作经历”改为“任职经历”。
- 固定模块中预览可见的二级标签可改名，例如“主要技术栈”“项目介绍”“主要工作”“项目成果”。
- 用户可创建自定义一级模块，并在模块内填写列表内容。
- 自定义模块支持两种展示模式：无标题列表模式和标题模式；两种模式可来回切换且不丢旧内容。

## 现状

- 正文模块固定为 `skills`、`workHistory`、`projectExperience`、`education`。
- `ResumeProps.sectionOrder` 和 `hiddenSections` 只接受固定模块 id。
- 预览标题硬编码在 `src/components/Resume/index.tsx`：
  - 一级标题：工作经历、项目经历、教育经历、个人优势。
  - 二级标签：主要技术栈、项目介绍、主要工作、项目成果。
- 编辑弹窗的版面顺序面板只渲染固定模块，表单 schema 也只包含固定模块字段。
- 所有导入、localStorage、mock 数据都经过 `migrateResume` 归一化。

## 设计

### 1. 数据模型

扩展 `ResumeProps`，保留现有固定模块结构：

- `sectionTitles?: Partial<Record<FixedSectionId, string>>`
  - 固定模块一级标题覆盖。
  - 空字符串或缺失时使用默认标题。
- `sectionLabels?: Partial<Record<SectionLabelKey, string>>`
  - 固定模块二级标签覆盖。
  - 第一版只覆盖预览中显式展示的标签：
    - `workHistory.techStack`
    - `projectExperience.introduction`
    - `projectExperience.mainWork`
    - `projectExperience.results`
- `customSections?: CustomResumeSection[]`
  - 用户创建的自定义正文模块。

自定义模块结构：

```ts
type CustomSectionDisplayMode = 'plain' | 'titled';

interface CustomResumeSection {
  id: string;
  title: string;
  displayMode: CustomSectionDisplayMode;
  items: CustomResumeSectionItem[];
}

interface CustomResumeSectionItem {
  value?: string;
  title?: string;
  description?: string;
}
```

展示规则：

- `plain` 模式展示 `items[].value`。
- `titled` 模式展示 `items[].title` 和 `items[].description`。
- 切换 `displayMode` 时不自动转换字段，也不删除另一套字段；用户切回原模式时原内容仍保留。

### 2. 模块 id 与排序隐藏

将正文排序和隐藏 id 扩展为统一的 `ResumeSectionId`：

- 固定模块仍使用原 id：`skills`、`workHistory`、`projectExperience`、`education`。
- 自定义模块使用 `custom:<id>`。

`sectionOrder` 保存固定模块和自定义模块的混合顺序。迁移时：

- 旧数据没有 `sectionOrder` 时补齐默认固定模块顺序。
- 旧数据有 `sectionOrder` 时保留合法固定模块 id。
- 对每个存在的自定义模块，若 `sectionOrder` 中缺少 `custom:<id>`，追加到末尾。
- 删除或不存在的自定义模块 id 会从 `sectionOrder` 和 `hiddenSections` 中剔除。

### 3. 迁移兼容

`migrateResume` 负责所有入口的兼容：

- 补齐 `sectionTitles`、`sectionLabels`、`customSections` 默认值。
- 清理空标题覆盖，避免空字符串覆盖默认标题。
- 规范自定义模块：
  - 缺失 id 时生成稳定 id。
  - 缺失标题时使用“自定义模块”。
  - 非法 `displayMode` 回退为 `plain`。
  - `items` 统一为数组，字段统一为字符串。
- 继续兼容旧 `experience`、旧 `skills`、旧 `projectExperience.results` 等现有迁移逻辑。

### 4. 编辑入口

在 `EditResumeModal` 的完整编辑模式中增加两个配置区：

- 标题配置
  - 固定模块一级标题输入。
  - 固定模块二级标签输入。
- 自定义模块管理
  - 新增模块。
  - 删除模块。
  - 修改模块标题。
  - 切换无标题列表模式 / 标题模式。
  - 编辑模块列表项。

现有版面顺序面板升级为混合模块面板：

- 固定模块和自定义模块一起显示。
- 支持上移、下移、隐藏、显示。
- 自定义模块额外支持删除。

局部编辑行为：

- 双击固定模块仍打开对应固定模块片段。
- 双击自定义模块打开自定义模块管理区，聚焦对应模块。
- 如果 `form-render` 对动态聚焦支持有限，第一版允许打开完整编辑弹窗并滚动到自定义模块区域。

### 5. 预览渲染

`Resume` 渲染正文时：

- 根据混合 `sectionOrder` 逐个渲染固定模块或自定义模块。
- 固定模块标题从 `sectionTitles` 取值，缺失时使用默认标题。
- 固定模块二级标签从 `sectionLabels` 取值，缺失时使用默认标签。
- 自定义模块：
  - 标题使用模块 `title`。
  - `plain` 模式渲染为与个人优势相近的无序列表。
  - `titled` 模式渲染为标题加描述的条目块。
  - 空模块不在预览和打印中展示。

内联编辑：

- 固定模块标题和二级标签第一版通过编辑弹窗修改，不做预览内联标题编辑。
- 自定义模块内容可复用现有 path 更新工具：
  - `customSections.<index>.items.<index>.value`
  - `customSections.<index>.items.<index>.title`
  - `customSections.<index>.items.<index>.description`
- 删除列表项沿用 `onInlineListRemove`。

### 6. 导入导出与打印

- 导入导出仍使用当前 JSON 流程，不新增外部格式。
- 打印使用预览 `innerHTML`，自定义模块复用现有简历 CSS 类，确保打印样式自动跟随。
- 不导出 AI 助手配置，保持现有安全边界。

### 7. 测试与验证

最快验证命令：

```bash
npm run build
```

若构建通过，再运行：

```bash
npm run lint
```

需要覆盖的行为：

- 旧 localStorage 数据迁移后仍能正常渲染。
- 固定模块一级标题、二级标签为空时回退默认值。
- 自定义模块新增、删除、排序、隐藏、切换模式后数据不丢失。
- 自定义模块在预览、打印 HTML、导入导出中保持一致。

## 不涉及

- 不支持自定义模块的复杂字段，如日期、图片、表格、富文本。
- 不允许用户改表单字段名，例如“公司”“职位”“项目名称”。
- 不重构固定模块为完全通用 section schema。
- 不改变 AI 助手、部署脚本和 PDF/打印实现策略。

## 改动文件

预计改动：

1. `src/types/index.ts`
2. `src/util/resumeMigrate.ts`
3. `src/util/resumePath.ts`
4. `src/components/Resume/index.tsx`
5. `src/components/Resume/index.module.css`
6. `src/pages/ResumePage/components/EditResumeModal/index.tsx`
7. `src/pages/ResumePage/components/EditResumeModal/index.module.css`
8. `src/pages/ResumePage/components/EditResumeModal/schema.ts`
9. `src/mock/index.ts`
