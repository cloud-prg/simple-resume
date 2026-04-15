import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Button, Drawer, Grid, Input, Modal, Select, Space, Typography } from "antd";
import type { AssistantProviderId } from "@/api/assistantContract";
import type { PrepareAssistantResponse } from "@/api/assistantContract";

const { Text } = Typography;

function isAssistantEnabled(): boolean {
    if (import.meta.env.DEV) return true;
    return import.meta.env.VITE_ASSISTANT_ENABLED === "true";
}

export type AssistantModalProps = {
    open: boolean;
    onClose: () => void;
};

export const AssistantModal: React.FC<AssistantModalProps> = ({ open, onClose }) => {
    const screens = Grid.useBreakpoint();
    const useDrawer = !screens.md;

    const [provider, setProvider] = useState<AssistantProviderId>("minimax");
    const [input, setInput] = useState("");
    const [reply, setReply] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "streaming" | "done" | "error">(
        "idle",
    );
    const [errorText, setErrorText] = useState<string | null>(null);

    const esRef = useRef<EventSource | null>(null);
    const streamFinishedRef = useRef(false);

    const closeStream = useCallback(() => {
        if (esRef.current) {
            esRef.current.close();
            esRef.current = null;
        }
    }, []);

    const resetForNewChat = useCallback(() => {
        closeStream();
        setReply("");
        setStatus("idle");
        setErrorText(null);
    }, [closeStream]);

    useEffect(() => {
        if (!open) {
            closeStream();
            setInput("");
            setReply("");
            setStatus("idle");
            setErrorText(null);
        }
    }, [open, closeStream]);

    useEffect(() => {
        return () => closeStream();
    }, [closeStream]);

    const handleStop = useCallback(() => {
        closeStream();
        if (status === "streaming" || status === "loading") {
            setStatus("idle");
        }
    }, [closeStream, status]);

    const handleSend = useCallback(async () => {
        if (!isAssistantEnabled()) {
            setErrorText("当前部署未启用助手代理。开发环境可使用 Vite 内置接口；生产请在网关配置 /api/assistant 并设置 VITE_ASSISTANT_ENABLED=true。");
            setStatus("error");
            return;
        }
        const prompt = input.trim();
        if (!prompt) return;

        closeStream();
        streamFinishedRef.current = false;
        setReply("");
        setErrorText(null);
        setStatus("loading");

        let sessionId: string;
        try {
            const res = await fetch("/api/assistant/prepare", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider, prompt }),
            });
            if (!res.ok) {
                throw new Error(`prepare failed: ${res.status}`);
            }
            const data = (await res.json()) as PrepareAssistantResponse;
            sessionId = data.sessionId;
            if (!sessionId) throw new Error("missing sessionId");
        } catch (e) {
            setErrorText(e instanceof Error ? e.message : "准备会话失败");
            setStatus("error");
            return;
        }

        const url = `/api/assistant/stream?sessionId=${encodeURIComponent(sessionId)}`;
        const es = new EventSource(url);
        esRef.current = es;
        setStatus("streaming");

        es.onmessage = (ev) => {
            try {
                const parsed = JSON.parse(ev.data) as { delta?: string };
                if (parsed.delta) {
                    setReply((r) => r + parsed.delta);
                }
            } catch {
                setReply((r) => r + ev.data);
            }
        };

        es.addEventListener("done", () => {
            streamFinishedRef.current = true;
            closeStream();
            setStatus("done");
        });

        es.onerror = () => {
            closeStream();
            if (streamFinishedRef.current) return;
            setStatus("error");
            setErrorText((prev) => prev ?? "连接中断或服务器错误");
        };
    }, [closeStream, input, provider]);

    const onProviderChange = (v: AssistantProviderId) => {
        closeStream();
        setProvider(v);
        setReply("");
        setStatus("idle");
        setErrorText(null);
    };

    const content = (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            {!isAssistantEnabled() && (
                <Alert
                    type="warning"
                    showIcon
                    message="助手未启用"
                    description="静态托管默认无同源 /api。开发环境可直接试用；生产需 BFF 与 VITE_ASSISTANT_ENABLED=true。"
                />
            )}
            <div>
                <Text type="secondary">模型提供方</Text>
                <Select<AssistantProviderId>
                    style={{ width: "100%", marginTop: 6 }}
                    value={provider}
                    onChange={onProviderChange}
                    options={[
                        { label: "MiniMax", value: "minimax" },
                        { label: "通义千问", value: "qwen" },
                    ]}
                />
            </div>
            <div>
                <Text type="secondary">问题</Text>
                <Input.TextArea
                    style={{ marginTop: 6 }}
                    rows={3}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="输入要向模型提问的内容…"
                    disabled={status === "streaming" || status === "loading"}
                />
            </div>
            <Space wrap>
                <Button
                    type="primary"
                    onClick={handleSend}
                    loading={status === "loading"}
                    disabled={status === "streaming" || !input.trim()}
                >
                    发送
                </Button>
                <Button
                    danger
                    onClick={handleStop}
                    disabled={status !== "streaming" && status !== "loading"}
                >
                    停止
                </Button>
                <Button onClick={resetForNewChat}>清空回复</Button>
            </Space>
            {errorText && status === "error" && <Alert type="error" message={errorText} />}
            <div>
                <Text type="secondary">回复</Text>
                <div
                    style={{
                        marginTop: 6,
                        minHeight: 120,
                        maxHeight: 280,
                        overflow: "auto",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid var(--sr-border)",
                        background: "var(--sr-surface-muted)",
                        whiteSpace: "pre-wrap",
                        fontSize: 13,
                    }}
                >
                    {reply || (status === "streaming" ? "…" : "（尚无内容）")}
                </div>
            </div>
        </Space>
    );

    const title = "免费模型助手";

    if (useDrawer) {
        return (
            <Drawer title={title} placement="bottom" height="85%" open={open} onClose={onClose}>
                {content}
            </Drawer>
        );
    }

    return (
        <Modal title={title} open={open} onCancel={onClose} footer={null} width={560} destroyOnClose>
            {content}
        </Modal>
    );
};
