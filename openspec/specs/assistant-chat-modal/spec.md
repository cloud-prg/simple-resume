## ADDED Requirements

### Requirement: 用户可以通过弹窗打开并与免费模型助手交互

系统 SHALL 在主要界面提供入口，打开一个弹窗式助手界面，其中包含消息列表、文本输入与发送动作。助手 SHALL 定位为「免费模型」场景，预置至少两种提供方选项：`minimax` 与 `qwen`（展示名可为「MiniMax」「通义千问」），用户 MUST 能在发送前选择其一。

#### Scenario: 打开弹窗并看到模型选择

- **WHEN** 用户点击（或等价操作）助手入口
- **THEN** 系统显示弹窗，其中包含模型提供方选择控件且默认选中一个合法提供方

### Requirement: 助手回答 MUST 通过浏览器 EventSource 消费 SSE 流

前端 SHALL 使用 Web 标准 `EventSource`（参见 MDN 文档）连接同源 SSE 端点以接收模型输出增量。连接 URL MUST 为相对路径，不包含第三方原始域名，以避免 CORS 与密钥暴露问题。

#### Scenario: 发送问题后建立 SSE 并增量展示

- **WHEN** 用户在弹窗中输入问题并发送，且后端返回 `Content-Type: text/event-stream` 的合规 SSE 响应
- **THEN** 前端创建 `EventSource` 实例，随着 `message` 事件到达将文本增量渲染到助手回答区域

### Requirement: 弹窗关闭或切换提供方时必须终止 SSE

系统 SHALL 在用户关闭弹窗、切换模型提供方或主动点击「停止」时调用 `EventSource.close()`（或等价确保连接不再接收事件），并停止 UI 上的流式更新。

#### Scenario: 关闭弹窗释放连接

- **WHEN** 用户在流式输出尚未结束时关闭弹窗
- **THEN** `EventSource` 连接被关闭且不再接收事件，且再次打开弹窗时不会自动复用旧连接除非用户重新发送

### Requirement: 流式消费必须处理错误与完成态

系统 SHALL 订阅 `EventSource` 的 `error` 事件，并在解析到服务端约定的完成事件或连接正常结束时，向用户展示可理解的完成或失败状态，且允许用户再次发送。

#### Scenario: 网络错误时给出提示

- **WHEN** SSE 连接因网络或服务器错误而触发 `error` 事件
- **THEN** 助手区域显示失败提示，且输入区保持可用以便用户重试（除非实现上明确进入只读故障态）

### Requirement: 密钥与第三方端点不得硬编码进前端产物

系统 SHALL NOT 将 MiniMax 或 Qwen 的私有 API Key 写入前端源代码或构建产物。所有携带密钥的请求 MUST 由同源代理或服务器组件完成。

#### Scenario: 审查构建产物不含密钥常量

- **WHEN** 对生产构建产物执行静态字符串审查（例如搜索典型密钥前缀）
- **THEN** 不存在硬编码的第三方 API Key 常量供浏览器直接读取
