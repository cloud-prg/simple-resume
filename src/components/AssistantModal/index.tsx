import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Drawer, Grid, Input, Modal, Segmented, Space, Typography } from "antd";
import type { PrepareAssistantResponse } from "@/api/assistantContract";
import type { ResumeProps } from "@/types";

const { Text } = Typography;

const ASSISTANT_SETTINGS_KEY = "simple-resume.assistant-settings";

type AssistantMode = "custom" | "mock";
type AssistantStatus = "idle" | "loading" | "streaming" | "done" | "error";
type AssistantAction = "ask" | "score" | "check";
type ChatMessage = {
    role: "system" | "user" | "assistant";
    content: string;
};

type AssistantSettings = {
    mode: AssistantMode;
    apiKey: string;
    baseUrl: string;
    model: string;
};

const DEFAULT_SETTINGS: AssistantSettings = {
    mode: import.meta.env.DEV ? "mock" : "custom",
    apiKey: "",
    baseUrl: "",
    model: "",
};

function isMockModeAvailable(): boolean {
    return import.meta.env.DEV;
}

function readAssistantSettings(): AssistantSettings {
    try {
        const raw = localStorage.getItem(ASSISTANT_SETTINGS_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        const parsed = JSON.parse(raw) as Partial<AssistantSettings>;
        const mode = parsed.mode === "mock" && isMockModeAvailable() ? "mock" : "custom";
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            mode,
            apiKey: typeof parsed.apiKey === "string" ? parsed.apiKey : "",
            baseUrl: typeof parsed.baseUrl === "string" ? parsed.baseUrl : "",
            model: typeof parsed.model === "string" ? parsed.model : "",
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.trim().replace(/\/+$/, "");
}

function resolveChatCompletionUrl(baseUrl: string): string {
    const normalized = normalizeBaseUrl(baseUrl);
    return normalized.endsWith("/chat/completions")
        ? normalized
        : `${normalized}/chat/completions`;
}

function extractErrorMessage(payload: unknown): string | null {
    if (!payload || typeof payload !== "object") return null;
    if ("error" in payload) {
        const error = (payload as { error?: unknown }).error;
        if (typeof error === "string") return error;
        if (error && typeof error === "object" && "message" in error) {
            const message = (error as { message?: unknown }).message;
            if (typeof message === "string" && message.trim()) return message;
        }
    }
    if ("message" in payload) {
        const message = (payload as { message?: unknown }).message;
        if (typeof message === "string" && message.trim()) return message;
    }
    return null;
}

function extractAssistantReply(payload: unknown): string {
    if (!payload || typeof payload !== "object") {
        return "";
    }

    const choices = (payload as { choices?: unknown }).choices;
    if (!Array.isArray(choices) || !choices.length) {
        return "";
    }

    const first = choices[0];
    if (!first || typeof first !== "object") {
        return "";
    }

    const message = (first as { message?: unknown }).message;
    if (!message || typeof message !== "object") {
        return "";
    }

    const content = (message as { content?: unknown }).content;
    if (typeof content === "string") {
        return content.trim();
    }

    if (Array.isArray(content)) {
        return content
            .map((item) => {
                if (typeof item === "string") return item;
                if (!item || typeof item !== "object") return "";
                if ("text" in item) {
                    const text = (item as { text?: unknown }).text;
                    if (typeof text === "string") return text;
                }
                return "";
            })
            .join("")
            .trim();
    }

    return "";
}

function normalizeAssistantError(error: unknown): string {
    if (error instanceof DOMException && error.name === "AbortError") {
        return "请求已停止";
    }
    if (error instanceof TypeError) {
        return "请求失败，请检查 Base URL、网络连通性，或目标接口是否允许浏览器跨域访问。";
    }
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }
    return "请求失败，请稍后重试";
}

function buildQuestionMessages(question: string, resume: ResumeProps): ChatMessage[] {
    const resumeJson = JSON.stringify(resume, null, 2);
    return [
        {
            role: "system",
            content:
                "你是中文简历助手。请结合用户提供的简历内容回答问题；如果问题与简历无关，也可以直接回答，但优先结合简历场景给建议。",
        },
        {
            role: "user",
            content: `当前简历 JSON：\n${resumeJson}\n\n用户问题：\n${question}\n\n请用中文回答，尽量直接、清晰、可执行。`,
        },
    ];
}

function buildScoreMessages(resume: ResumeProps): ChatMessage[] {
    const resumeJson = JSON.stringify(resume, null, 2);
    return [
        {
            role: "system",
            content:
                "你是一名资深中文简历顾问，请从候选人简历质量和岗位表达效果两个维度给出客观评估。",
        },
        {
            role: "user",
            content: `请对下面这份简历打分，并严格按以下结构输出：\n1. 总分（100 分制）\n2. 维度评分：内容完整度、表达清晰度、岗位匹配度、项目说服力、量化成果\n3. 3 个优点\n4. 5 个改进建议\n5. 1 段 120 字以内的总结\n\n简历 JSON：\n${resumeJson}`,
        },
    ];
}

export type AssistantModalProps = {
    open: boolean;
    onClose: () => void;
    resume: ResumeProps;
};

export const AssistantModal: React.FC<AssistantModalProps> = ({ open, onClose, resume }) => {
    const screens = Grid.useBreakpoint();
    const useDrawer = !screens.md;

    const [settings, setSettings] = useState<AssistantSettings>(() => readAssistantSettings());
    const [input, setInput] = useState("");
    const [reply, setReply] = useState("");
    const [status, setStatus] = useState<AssistantStatus>("idle");
    const [errorText, setErrorText] = useState<string | null>(null);
    const [lastAction, setLastAction] = useState<AssistantAction | null>(null);

    const esRef = useRef<EventSource | null>(null);
    const abortRef = useRef<AbortController | null>(null);
    const streamFinishedRef = useRef(false);

    const closePendingRequest = useCallback(() => {
        if (esRef.current) {
            esRef.current.close();
            esRef.current = null;
        }
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(ASSISTANT_SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        if (!isMockModeAvailable() && settings.mode === "mock") {
            setSettings((prev) => ({ ...prev, mode: "custom" }));
        }
    }, [settings.mode]);

    useEffect(() => {
        if (!open) {
            closePendingRequest();
            setInput("");
            setReply("");
            setStatus("idle");
            setErrorText(null);
            setLastAction(null);
        }
    }, [open, closePendingRequest]);

    useEffect(() => {
        return () => closePendingRequest();
    }, [closePendingRequest]);

    const updateSettings = (patch: Partial<AssistantSettings>) => {
        setSettings((prev) => ({ ...prev, ...patch }));
    };

    const resetReply = useCallback(() => {
        closePendingRequest();
        setReply("");
        setStatus("idle");
        setErrorText(null);
        setLastAction(null);
    }, [closePendingRequest]);

    const handleStop = useCallback(() => {
        closePendingRequest();
        if (status === "streaming" || status === "loading") {
            setStatus("idle");
            setErrorText(null);
        }
    }, [closePendingRequest, status]);

    const runMockRequest = useCallback(async (prompt: string) => {
        if (!isMockModeAvailable()) {
            setErrorText("开发 Mock 仅在本地开发环境可用，请切换到自定义 API 模式。");
            setStatus("error");
            return;
        }

        closePendingRequest();
        streamFinishedRef.current = false;
        setReply("");
        setErrorText(null);
        setStatus("loading");

        let sessionId = "";
        try {
            const res = await fetch("/api/assistant/prepare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider: "mock", prompt }),
            });
            if (!res.ok) {
                throw new Error(`prepare failed: ${res.status}`);
            }
            const data = (await res.json()) as PrepareAssistantResponse;
            sessionId = data.sessionId;
            if (!sessionId) {
                throw new Error("missing sessionId");
            }
        } catch (error) {
            setErrorText(normalizeAssistantError(error));
            setStatus("error");
            return;
        }

        const es = new EventSource(`/api/assistant/stream?sessionId=${encodeURIComponent(sessionId)}`);
        esRef.current = es;
        setStatus("streaming");

        es.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data) as { delta?: string };
                if (parsed.delta) {
                    setReply((current) => current + parsed.delta);
                }
            } catch {
                setReply((current) => current + event.data);
            }
        };

        es.addEventListener("done", () => {
            streamFinishedRef.current = true;
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }
            setStatus("done");
        });

        es.onerror = () => {
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }
            if (streamFinishedRef.current) return;
            setStatus("error");
            setErrorText((prev) => prev ?? "连接中断或本地开发接口异常");
        };
    }, [closePendingRequest]);

    const runCustomRequest = useCallback(
        async (messages: ChatMessage[], action: AssistantAction) => {
            const apiKey = settings.apiKey.trim();
            const baseUrl = settings.baseUrl.trim();
            const model = settings.model.trim();

            if (!apiKey || !baseUrl || !model) {
                setErrorText("请先填写 API Key、Base URL 和 Model。");
                setStatus("error");
                return;
            }

            closePendingRequest();
            setReply("");
            setErrorText(null);
            setStatus("loading");

            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const response = await fetch(resolveChatCompletionUrl(baseUrl), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: action === "score" ? 0.35 : 0.7,
                    }),
                    signal: controller.signal,
                });

                const payload = await response.json().catch(() => null);
                if (!response.ok) {
                    throw new Error(extractErrorMessage(payload) ?? `请求失败：${response.status}`);
                }

                const nextReply = extractAssistantReply(payload);
                setReply(nextReply || "模型已响应，但没有返回可显示的文本内容。");
                setStatus("done");
            } catch (error) {
                if (controller.signal.aborted) {
                    setStatus("idle");
                    return;
                }
                setErrorText(normalizeAssistantError(error));
                setStatus("error");
            } finally {
                if (abortRef.current === controller) {
                    abortRef.current = null;
                }
            }
        },
        [closePendingRequest, settings.apiKey, settings.baseUrl, settings.model],
    );

    const handleAsk = useCallback(async () => {
        const question = input.trim();
        if (!question) return;

        setLastAction("ask");
        if (settings.mode === "mock") {
            await runMockRequest(
                `【自由提问】\n请围绕这份简历回答用户问题。\n\n简历 JSON：\n${JSON.stringify(resume, null, 2)}\n\n用户问题：\n${question}`,
            );
            return;
        }

        await runCustomRequest(buildQuestionMessages(question, resume), "ask");
    }, [input, resume, runCustomRequest, runMockRequest, settings.mode]);

    const handleScore = useCallback(async () => {
        setLastAction("score");
        if (settings.mode === "mock") {
            await runMockRequest(
                `【简历评分】\n请对这份简历做评分。\n\n简历 JSON：\n${JSON.stringify(resume, null, 2)}`,
            );
            return;
        }

        await runCustomRequest(buildScoreMessages(resume), "score");
    }, [resume, runCustomRequest, runMockRequest, settings.mode]);

    const handleCheckConnection = useCallback(async () => {
        setLastAction("check");
        await runCustomRequest(
            [
                {
                    role: "system",
                    content: "你是连接检测助手。",
                },
                {
                    role: "user",
                    content: "如果你收到了这条消息，请只回复“连接成功”。",
                },
            ],
            "check",
        );
    }, [runCustomRequest]);

    const actionLabel =
        lastAction === "ask" ? "自由提问" : lastAction === "score" ? "简历评分" : lastAction === "check" ? "连接测试" : null;

    const content = (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Alert
                type="info"
                showIcon
                message="本地配置"
                description="API Key 只保存在当前浏览器的 localStorage，不会跟随简历导出。若目标服务不支持浏览器跨域访问，请改走你自己的后端代理。"
            />

            {isMockModeAvailable() ? (
                <div>
                    <Text type="secondary">调用模式</Text>
                    <div style={{ marginTop: 6 }}>
                        <Segmented<AssistantMode>
                            value={settings.mode}
                            onChange={(value) => {
                                closePendingRequest();
                                updateSettings({ mode: value });
                                setReply("");
                                setErrorText(null);
                                setStatus("idle");
                            }}
                            options={[
                                { label: "自定义 API", value: "custom" },
                                { label: "开发 Mock", value: "mock" },
                            ]}
                        />
                    </div>
                </div>
            ) : (
                <Alert
                    type="warning"
                    showIcon
                    message="当前环境仅支持自定义 API"
                    description="请填写兼容 OpenAI Chat Completions 的接口地址、模型名和 API Key。"
                />
            )}

            {settings.mode === "custom" ? (
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                    <div>
                        <Text type="secondary">API Key</Text>
                        <Input.Password
                            style={{ marginTop: 6 }}
                            value={settings.apiKey}
                            placeholder="sk-..."
                            onChange={(event) => updateSettings({ apiKey: event.target.value })}
                        />
                    </div>
                    <div>
                        <Text type="secondary">Base URL</Text>
                        <Input
                            style={{ marginTop: 6 }}
                            value={settings.baseUrl}
                            placeholder="https://your-endpoint/v1"
                            onChange={(event) => updateSettings({ baseUrl: event.target.value })}
                        />
                    </div>
                    <div>
                        <Text type="secondary">Model</Text>
                        <Input
                            style={{ marginTop: 6 }}
                            value={settings.model}
                            placeholder="gpt-4.1-mini / qwen-plus / 你的模型名"
                            onChange={(event) => updateSettings({ model: event.target.value })}
                        />
                    </div>
                    <Button
                        onClick={handleCheckConnection}
                        loading={status === "loading" && lastAction === "check"}
                        disabled={status === "loading" || status === "streaming"}
                    >
                        验证连接
                    </Button>
                </Space>
            ) : (
                <Alert
                    type="success"
                    showIcon
                    message="开发 Mock 已启用"
                    description="当前模式会走 Vite 本地 mock，只用于前端联调演示，不会真正请求外部模型。"
                />
            )}

            <div>
                <Text type="secondary">问题</Text>
                <Input.TextArea
                    style={{ marginTop: 6 }}
                    rows={4}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="输入要向助手提的问题，助手会自动结合当前简历内容作答。"
                    disabled={status === "loading" || status === "streaming"}
                />
            </div>

            <Space wrap>
                <Button
                    type="primary"
                    onClick={handleAsk}
                    loading={status === "loading" && lastAction === "ask"}
                    disabled={status === "loading" || status === "streaming" || !input.trim()}
                >
                    提问
                </Button>
                <Button
                    onClick={handleScore}
                    loading={status === "loading" && lastAction === "score"}
                    disabled={status === "loading" || status === "streaming"}
                >
                    简历评分
                </Button>
                <Button
                    danger
                    onClick={handleStop}
                    disabled={status !== "loading" && status !== "streaming"}
                >
                    停止
                </Button>
                <Button onClick={resetReply}>清空回复</Button>
            </Space>

            {errorText && status === "error" && <Alert type="error" message={errorText} />}

            <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <Text type="secondary">回复</Text>
                    {actionLabel && <Text type="secondary">当前任务：{actionLabel}</Text>}
                </div>
                <div
                    style={{
                        marginTop: 6,
                        minHeight: 160,
                        maxHeight: 320,
                        overflow: "auto",
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--sr-border)",
                        background: "var(--sr-surface-muted)",
                        whiteSpace: "pre-wrap",
                        fontSize: 13,
                        lineHeight: 1.7,
                    }}
                >
                    {reply || (status === "streaming" ? "正在生成中…" : "（尚无内容）")}
                </div>
            </div>
        </Space>
    );

    const title = "AI 助手";

    if (useDrawer) {
        return (
            <Drawer title={title} placement="bottom" height="88%" open={open} onClose={onClose}>
                {content}
            </Drawer>
        );
    }

    return (
        <Modal title={title} open={open} onCancel={onClose} footer={null} width={640} destroyOnClose>
            {content}
        </Modal>
    );
};
