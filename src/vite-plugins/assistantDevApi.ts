import type { IncomingMessage } from "node:http";
import type { Plugin } from "vite";
import { randomUUID } from "node:crypto";

type SessionPayload = { provider: string; prompt: string };

const sessions = new Map<string, SessionPayload>();

function parseJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        req.on("data", (c) => chunks.push(Buffer.from(c)));
        req.on("end", () => {
            try {
                const raw = Buffer.concat(chunks).toString("utf8");
                resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
            } catch (e) {
                reject(e);
            }
        });
        req.on("error", reject);
    });
}

/**
 * 开发环境同源助手 API：POST 准备会话 + GET SSE 流（供 EventSource 使用）。
 * 生产构建不包含此插件；需自行部署与 README 契约一致的 BFF。
 */
export function assistantDevApiPlugin(): Plugin {
    return {
        name: "simple-resume-assistant-dev-api",
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                const url = req.url ? new URL(req.url, "http://local") : null;
                const pathname = url?.pathname ?? "";

                if (req.method === "POST" && pathname === "/api/assistant/prepare") {
                    try {
                        const body = await parseJsonBody(req);
                        const provider = String(body.provider ?? "minimax");
                        const prompt = String(body.prompt ?? "");
                        const id = randomUUID();
                        sessions.set(id, { provider, prompt });
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.end(JSON.stringify({ sessionId: id }));
                    } catch {
                        res.statusCode = 400;
                        res.end();
                    }
                    return;
                }

                if (req.method === "GET" && pathname === "/api/assistant/stream") {
                    const sessionId = url?.searchParams.get("sessionId") ?? "";
                    const session = sessions.get(sessionId);
                    if (!session) {
                        res.statusCode = 404;
                        res.end("session not found");
                        return;
                    }
                    sessions.delete(sessionId);

                    res.statusCode = 200;
                    res.setHeader("Content-Type", "text/event-stream");
                    res.setHeader("Cache-Control", "no-cache, no-transform");
                    res.setHeader("Connection", "keep-alive");
                    if (typeof (res as { flushHeaders?: () => void }).flushHeaders === "function") {
                        (res as { flushHeaders: () => void }).flushHeaders();
                    }

                    const header = `[${session.provider}] 开发占位回复：\n\n`;
                    const tail =
                        "\n\n（生产环境请部署同源代理，将请求转发至 MiniMax / 通义千问等 API，并设置 VITE_ASSISTANT_ENABLED。）";
                    const text = `${header}${session.prompt.slice(0, 2000)}${session.prompt.length > 2000 ? "…" : ""}${tail}`;
                    let i = 0;
                    const tick = () => {
                        if (i < text.length) {
                            const delta = text.slice(i, i + 3);
                            i += delta.length;
                            res.write(`data: ${JSON.stringify({ delta })}\n\n`);
                            setTimeout(tick, 18);
                        } else {
                            res.write(`event: done\ndata: {}\n\n`);
                            res.end();
                        }
                    };
                    tick();
                    return;
                }

                next();
            });
        },
    };
}
