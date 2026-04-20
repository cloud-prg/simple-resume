/**
 * 同源「免费模型助手」前后端契约（SSE 使用浏览器 EventSource，见 MDN）。
 *
 * ## 1) 准备会话（非流式）
 * `POST /api/assistant/prepare`
 * Content-Type: application/json
 *
 * 请求体（开发 mock）：
 * ```json
 * { "provider": "mock", "prompt": "用户输入的纯文本" }
 * ```
 *
 * 响应 200：
 * ```json
 * { "sessionId": "<uuid>" }
 * ```
 *
 * 服务端将 prompt 与 provider 绑定到短时 session（内存/Redis），供下一步 SSE 拉流。
 *
 * ## 2) 流式输出（SSE）
 * `GET /api/assistant/stream?sessionId=<uuid>`
 * Accept: text/event-stream
 *
 * 使用 `new EventSource("/api/assistant/stream?sessionId=...")`（相对路径，同源）。
 *
 * 事件：
 * - 默认 `message`：payload 为 JSON 字符串：`{ "delta": "增量文本" }`
 * - `event: done`：流结束，data 可为 `{}`
 *
 * 错误：HTTP 非 2xx 或连接异常时 EventSource 触发 `error`；前端应提示并可重试。
 *
 * 说明：当前项目也支持浏览器端直连用户自填的 OpenAI 兼容接口；该契约仅保留给 Vite 开发 mock 使用。
 */

export type AssistantProviderId = "mock";

export type PrepareAssistantBody = {
    provider: AssistantProviderId;
    prompt: string;
};

export type PrepareAssistantResponse = {
    sessionId: string;
};

export type AssistantStreamDelta = {
    delta: string;
};
