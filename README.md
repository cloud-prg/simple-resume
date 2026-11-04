# Simple Resume

一个面向“预览即结果”的在线简历编辑器。

和常见的纯表单式简历工具不同，这个项目把编辑体验放在最终视觉结果上：左侧负责模板与结构管理，右侧负责实时预览，用户既可以走结构化表单编辑，也可以直接在预览区对可见内容进行所见即改。对于需要频繁微调排版、措辞和版本差异的求职场景，这种交互会比单纯填表更高效。

## 在线体验

- Demo: [Simple Resume Online](https://cloud-prg.github.io/simple-resume/)

## 项目定位

这个项目并不只是“把简历内容渲染成一张页面”，而是尝试解决下面几个真实问题：

- 传统表单编辑和最终排版之间有明显割裂，改完内容还要反复切回预览确认。
- 一份简历往往需要按不同岗位快速派生多个版本，手工复制粘贴成本高。
- 第三方导出库在样式、分页、排版一致性上经常不稳定，调试成本高于收益。
- AI 能帮用户做内容诊断，但大多数简历工具并没有把“内容编辑”和“模型辅助”放在一个工作流里。

## 核心亮点

- 预览优先：编辑区与结果区并存，减少“改了什么”和“最终长什么样”之间的心智切换。
- 双通道编辑：简单文本支持预览内直接修改，复杂结构仍保留表单编辑，兼顾效率与稳定性。
- 多模板管理：本地可维护多份简历模板，适合针对不同岗位快速切换版本。
- 本地优先：数据默认保存在浏览器 `localStorage`，无账号、无后端也能直接使用。
- AI 助手可插拔：支持开发 mock，也支持用户自行填写 `API Key / Base URL / Model` 调用兼容 OpenAI Chat Completions 的模型接口。
- 打印友好：直接使用浏览器原生打印能力，避免 DOM-to-PDF 类库常见的样式丢失与布局偏移问题。

## 功能清单

### 1. 简历编辑

- 左侧模板列表支持多份简历切换、创建与删除。
- 结构化表单支持维护个人信息、教育经历、工作经历、项目经历、个人优势等模块。
- 预览区支持直接点击文本进行细粒度修改，适合快速改措辞、时间、公司名、项目描述等内容。
- 对于主题、区块顺序、复杂列表结构等场景，仍可通过表单弹窗集中编辑。

### 2. 简历版本管理

- 简历数据默认保存在浏览器本地。
- 支持导出当前简历为文本文件（JSON 内容）。
- 支持从导出的文本文件重新导入，便于备份、迁移和版本分支管理。
- 在 Cloudflare Pages 部署上，可以把当前简历 JSON 保存到 D1，并凭云端 ID 在其他设备加载。GitHub Pages 静态站点仍只使用本地导入导出。

### 3. 视觉与主题

- 内置全局外观切换，支持浅色 / 米色 / 深色三种主题。
- 简历内部支持独立的标题配色与页眉对齐配置。
- 预览和打印使用统一样式源，尽量保证浏览器中看到的结果和打印结果一致。

### 4. AI 助手

- 支持“自由提问”：结合当前简历内容向模型提问，例如优化建议、岗位匹配分析、项目描述润色方向等。
- 支持“一键简历评分”：从完整度、表达清晰度、岗位匹配度、项目说服力、量化成果等维度给出结构化反馈。
- 开发环境内置 mock 流式接口，方便前端联调。
- 正式使用时可由用户自行填写模型配置，无需把第三方密钥写死在仓库中。

## 技术方案

### 前端栈

- React 18
- TypeScript
- Vite 5
- Ant Design
- `form-render`
- CSS Modules
- Tailwind CSS（工具类辅助）

### 关键实现思路

- 预览组件与表单数据共用同一份简历结构，避免“双份状态”带来的同步问题。
- 本地存储的旧数据通过迁移逻辑统一收敛到当前 `ResumeProps` 结构，降低后续迭代成本。
- 打印功能不依赖第三方截图 / PDF 库，而是把预览区 HTML 与样式直接注入新窗口，调用浏览器原生打印。
- AI 助手在开发环境通过 Vite 插件提供 mock 接口；在真实场景下，走用户自定义的兼容接口，降低接入门槛。

## 快速开始

### 运行环境

- 推荐 Node.js 18+

### 安装依赖

```bash
npm install
```

### 启动开发环境

```bash
npm run dev
```

默认会启动 Vite 开发服务器，开发模式下可以直接使用本地 mock 的 AI 助手接口。

### 构建生产版本

```bash
npm run build
```

### 本地预览构建结果

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## AI 助手接入说明

项目当前支持两种模式：

### 1. 开发 Mock

- 仅开发环境可用。
- 无需配置密钥，便于前端联调弹窗交互与流式输出表现。
- 由 Vite 插件提供 `/api/assistant/prepare` 与 `/api/assistant/stream` 本地 mock。

### 2. 自定义 API

在页面中打开“AI 助手”后，填写以下内容即可：

- `API Key`
- `Base URL`
- `Model`

推荐理解为“兼容 OpenAI Chat Completions 的接口配置”：

- `Base URL` 示例：`https://api.openai.com/v1`
- `Model` 示例：`gpt-4.1-mini`

注意事项：

- 当前实现由浏览器直接发起请求，因此目标接口必须允许跨域访问（CORS）。
- `API Key` 只保存在当前浏览器的 `localStorage` 中，不会写入仓库，也不会跟随简历导出。
- 如果你的模型服务不允许浏览器直连，更稳妥的做法是通过你自己的后端代理转发请求。

## Cloudflare Pages 与 D1

GitHub Pages 部署保持不变：`.github/workflows/deploy-pages.yml` 与 `deploy.sh` 仍然只发布 Vite 的 `dist/`。Cloudflare 是额外的托管和 API 路径。

这里选用 **Cloudflare Pages Functions**（`functions/`），而不是 Workers Static Assets。原因是应用本身就是 Vite 静态 SPA，路由使用 `createHashRouter`，不需要单独的资源 Worker。`wrangler.jsonc` 的 `pages_build_output_dir` 指向同一个 `dist/`，因此两套托管可以共用 `npm run build` 的产物。

`vite.config.ts` 的 `base` 保持相对路径 `./`。它在 GitHub Pages 的 `/simple-resume/` 子路径和 Cloudflare Pages 站点根路径上都能加载资源，不需要额外的 `VITE_*` 变量。不要把 `base` 改成 `/`，否则现有 GitHub Pages 的资源路径会失效。

### 绑定

`wrangler.jsonc` 已写入：

- 账号：`bbbf35cc99b519983f6d2af9ad970c05`
- D1 绑定名：`DB`
- 数据库名：`simple-resume`
- 数据库 ID：`221a394c-6106-4a97-9566-e28048f516e9`
- 预览部署使用同一套已创建的数据库

远程表结构已经建好。仓库里的 `schema.sql` 供本地开发和对照，不需要再创建远程数据库。本地初始化：

```bash
npx wrangler d1 execute simple-resume --local --file=schema.sql
```

Pages 本地开发连的是本地 D1，不能直接打到远程库。

### 接口

同源 JSON，不需要登录：

- `GET /api/resumes`：仅用于检测接口是否存在，返回 `{ "ok": true }`，不会列出简历。
- `POST /api/resumes`：创建记录，返回 `id` 与 `edit_token`。
- `GET /api/resumes/:id`：按 ID 读取简历，不返回 `edit_token`。
- `PUT /api/resumes/:id`：请求头 `X-Edit-Token`（或 body 里的 `edit_token`）匹配后更新。

请求体超过约 1MB 会拒绝。页面把最近一次的 `id` 和 `edit_token` 放在 `localStorage` 键 `simple-resume.cloud-resume` 中，因此同一浏览器可以更新；其他设备只要有 ID 就能加载。纯静态站点请求不到该接口时，按钮会提示需要 Cloudflare Pages，本地导入导出和 Agent 提示词不受影响。

### 部署

命令行：

```bash
npm install
npm run build
npx wrangler pages deploy dist --project-name simple-resume
```

也可以用 Git 连接 Cloudflare Pages（需要 V2 build system，这样才会读取 `wrangler.jsonc` 里的 D1 绑定）：

- 构建命令：`npm run build`
- 输出目录：`dist`
- 根目录：仓库根目录

本地同时预览静态页和 Functions：

```bash
npm run build
npm run pages:dev
```

## 目录结构

```text
functions/                       # Cloudflare Pages Functions，/api/resumes
schema.sql                       # D1 表结构（远程库已应用）
wrangler.jsonc                   # Pages 输出目录与 D1 绑定
src/
├── components/
│   ├── AssistantModal/          # AI 助手弹窗
│   └── Resume/                  # 简历预览与预览内编辑
├── pages/
│   └── ResumePage/              # 主编辑页
├── mock/                        # 默认简历与模板数据
├── util/
│   ├── file.ts                  # 导入导出
│   └── resumeMigrate.ts         # 简历数据迁移与规范化
├── context/                     # 外观主题上下文
└── vite-plugins/                # 开发态 AI mock 插件
```

## 为什么没有使用第三方 DOM-to-PDF 库

这不是“少做一步”，而是一个明确的工程取舍。

很多 DOM-to-PDF / HTML-to-canvas 类库在以下场景中容易出现问题：

- 字体和间距与浏览器真实渲染不一致
- 复杂布局被压扁或错位
- 样式丢失，尤其是主题和模块化样式
- 调试成本很高，最后仍然需要针对特定浏览器反复修补

对于简历这种对版式稳定性要求很高的页面，直接依赖浏览器原生打印往往是更稳、更省时的方案。因此这个项目优先保证“浏览器中看到的结果”和“打印输出”尽可能一致，而不是引入一层额外的不确定性。

## 这个项目适合展示什么能力

如果你把它作为作品集项目，它能够体现的不只是 UI 搭建能力，还包括：

- 产品体验思考：为什么要做预览优先、为什么要保留双通道编辑
- 前端状态设计：结构化数据、预览渲染、本地存储、迁移逻辑之间如何保持一致
- 工程权衡：什么时候该用库，什么时候该依赖浏览器原生能力
- 可扩展性设计：AI 助手采用 mock + 自定义接口双模式，便于演示与落地

## License

仅供学习与个人项目展示参考。
