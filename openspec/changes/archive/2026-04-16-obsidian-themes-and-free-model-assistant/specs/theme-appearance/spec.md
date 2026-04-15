## ADDED Requirements

### Requirement: 用户可以在三种全局外观模式之间切换

系统 SHALL 提供三种互斥的全局外观模式：`light`（主色偏蓝）、`sepia`（主色偏淡黄/米色纸张）、`dark`（主色偏紫）。用户 SHALL 能通过显式 UI 控件在三种模式之间切换，且切换后整站主要背景、主文本、边框与强调色随模式更新。

#### Scenario: 从浅色切换到米色再切换到深色

- **WHEN** 用户在外观控件上依次选择 `light`、`sepia`、`dark`
- **THEN** 页面根容器应用的视觉令牌分别体现蓝倾向主色、淡黄倾向主色与紫倾向主色，并且任意时刻仅一种模式生效

### Requirement: 外观选择必须在刷新后保持一致

系统 SHALL 将用户当前外观模式持久化到浏览器本地存储（例如 `localStorage`），并在应用启动时读取以恢复模式。

#### Scenario: 刷新页面后保持米色模式

- **WHEN** 用户已选择 `sepia` 并刷新页面
- **THEN** 应用初始化完成后仍处于 `sepia` 模式且视觉令牌与刷新前一致

### Requirement: 外观系统必须满足基础可读性对比

系统 SHALL 确保在三种模式下，主正文与背景之间的对比度满足 WCAG AA 对常规文本的最低要求（或在不达标时提供更高对比的替代文本样式开关作为后续增量；本需求首版 SHALL 以 AA 为设计验收目标）。

#### Scenario: 深色模式下正文可读

- **WHEN** 用户处于 `dark` 模式并浏览简历正文区域
- **THEN** 主正文颜色与背景色的对比度达到或高于 WCAG AA 针对常规文本的阈值

### Requirement: Ant Design 组件外观必须与全局令牌对齐

系统 SHALL 通过 Ant Design `ConfigProvider` 的 `theme` token（或等效机制）将按钮、输入框、分割线、Modal 等常用组件映射到当前外观令牌，避免出现未覆盖的默认亮色孤岛。

#### Scenario: 打开 Modal 时与当前主题一致

- **WHEN** 用户在 `dark` 模式下打开任意使用 Ant Design `Modal` 的界面
- **THEN** `Modal` 背景、标题与正文颜色与 `dark` 令牌一致而非强制浅色默认
