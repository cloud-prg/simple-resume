import type { ResumeProps } from '@/types';
import { migrateResume } from '@/util/resumeMigrate';

export const AI_SETTINGS_KEY = 'simple-resume.assistant-settings';

export type ResumeAiMode = 'custom' | 'mock';
export type ResumeAiInputMode = 'instruction' | 'content';
export type ResumeAiSettings = {
    mode: ResumeAiMode;
    apiKey: string;
    baseUrl: string;
    model: string;
};

export type RequestResumeAiOptions = {
    settings: ResumeAiSettings;
    inputMode: ResumeAiInputMode;
    input: string;
    resume: ResumeProps;
    signal?: AbortSignal;
};

const DEFAULT_SETTINGS: ResumeAiSettings = {
    mode: import.meta.env.DEV ? 'mock' : 'custom',
    apiKey: '',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: '',
};

const RESUME_KEYS = new Set([
    'name',
    'contact',
    'education',
    'workHistory',
    'projectExperience',
    'skills',
    'sectionTitles',
    'sectionLabels',
    'customSections',
    'sectionOrder',
    'hiddenSections',
    'theme',
    'experience',
]);

type ChatMessage = {
    role: 'system' | 'user';
    content: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeBaseUrl(baseUrl: string): string {
    return baseUrl.trim().replace(/\/+$/, '');
}

function resolveChatCompletionUrl(baseUrl: string): string {
    const normalized = normalizeBaseUrl(baseUrl);
    return normalized.endsWith('/chat/completions')
        ? normalized
        : `${normalized}/chat/completions`;
}

function extractErrorMessage(payload: unknown): string | null {
    if (!isRecord(payload)) return null;
    const error = payload.error;
    if (typeof error === 'string' && error.trim()) return error;
    if (isRecord(error) && typeof error.message === 'string' && error.message.trim()) {
        return error.message;
    }
    if (typeof payload.message === 'string' && payload.message.trim()) {
        return payload.message;
    }
    return null;
}

function extractAssistantReply(payload: unknown): string {
    if (!isRecord(payload) || !Array.isArray(payload.choices) || payload.choices.length === 0) {
        return '';
    }

    const first = payload.choices[0];
    if (!isRecord(first)) return '';

    const message = isRecord(first.message) ? first.message : null;
    const content = message?.content ?? first.text;
    if (typeof content === 'string') return content.trim();
    if (!Array.isArray(content)) return '';

    return content
        .map((item) => {
            if (typeof item === 'string') return item;
            if (isRecord(item) && typeof item.text === 'string') return item.text;
            return '';
        })
        .join('')
        .trim();
}

function normalizeRequestError(error: unknown): Error {
    if (error instanceof DOMException && error.name === 'AbortError') {
        return error;
    }
    if (error instanceof TypeError) {
        return new Error('请求失败，请检查 Base URL、网络连通性，或目标接口是否允许浏览器跨域访问。');
    }
    if (error instanceof Error && error.message.trim()) {
        return error;
    }
    return new Error('请求失败，请稍后重试。');
}

export function isResumeAiMockAvailable(): boolean {
    return import.meta.env.DEV;
}

export function readResumeAiSettings(): ResumeAiSettings {
    try {
        const raw = localStorage.getItem(AI_SETTINGS_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        const parsed = JSON.parse(raw) as Partial<ResumeAiSettings>;
        return {
            mode: parsed.mode === 'mock' && isResumeAiMockAvailable() ? 'mock' : 'custom',
            apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : DEFAULT_SETTINGS.apiKey,
            baseUrl: typeof parsed.baseUrl === 'string' ? parsed.baseUrl : DEFAULT_SETTINGS.baseUrl,
            model: typeof parsed.model === 'string' ? parsed.model : DEFAULT_SETTINGS.model,
        };
    } catch {
        return DEFAULT_SETTINGS;
    }
}

function buildPrompt(inputMode: ResumeAiInputMode, input: string, resume: ResumeProps): string {
    const operation = inputMode === 'instruction'
        ? '根据用户要求修改当前简历，未提到的字段必须原样保留。'
        : '把用户粘贴的简历内容转换成当前简历结构；无法从文本确定的字段请保留当前简历中的值。';

    return [
        '你是简历数据转换器，不是聊天助手。',
        operation,
        '只输出一个完整、合法的 JSON 对象，不要输出 Markdown 代码围栏、解释、注释或额外文字。',
        'JSON 必须兼容 ResumeProps，顶层至少包含 name、contact、education、workHistory、projectExperience、skills。',
        '数组字段必须使用当前简历的结构：skills 使用 {"value":"..."}，工作和项目要点使用 {"value":"..."}。',
        '必须保留未修改的主题、模块排序、隐藏模块和自定义模块。',
        'CURRENT_RESUME_JSON_BEGIN',
        JSON.stringify(resume),
        'CURRENT_RESUME_JSON_END',
        'USER_INPUT_BEGIN',
        input.trim(),
        'USER_INPUT_END',
    ].join('\n');
}

function buildMessages(inputMode: ResumeAiInputMode, input: string, resume: ResumeProps): ChatMessage[] {
    return [
        {
            role: 'system',
            content: '你负责把用户的简历修改意图或简历文本可靠地转换为 JSON。严格遵守用户消息中的输出格式。',
        },
        {
            role: 'user',
            content: buildPrompt(inputMode, input, resume),
        },
    ];
}

async function requestCustomReply(
    settings: ResumeAiSettings,
    messages: ChatMessage[],
    signal?: AbortSignal,
): Promise<string> {
    const apiKey = settings.apiKey.trim();
    const baseUrl = settings.baseUrl.trim();
    const model = settings.model.trim();
    if (!apiKey || !baseUrl || !model) {
        throw new Error('请先填写 API Key、Base URL 和 Model。');
    }

    try {
        const response = await fetch(resolveChatCompletionUrl(baseUrl), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.1,
            }),
            signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
            throw new Error(extractErrorMessage(payload) ?? `请求失败：${response.status}`);
        }
        const reply = extractAssistantReply(payload);
        if (!reply) {
            throw new Error('模型没有返回可解析的内容，请检查模型是否支持文本输出。');
        }
        return reply;
    } catch (error) {
        throw normalizeRequestError(error);
    }
}

async function requestMockReply(prompt: string, signal?: AbortSignal): Promise<string> {
    if (!isResumeAiMockAvailable()) {
        throw new Error('开发 Mock 仅在本地开发环境可用，请切换到自定义 API 模式。');
    }

    let sessionId = '';
    try {
        const response = await fetch('/api/assistant/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider: 'resume-json-mock', prompt }),
            signal,
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !isRecord(payload) || typeof payload.sessionId !== 'string') {
            throw new Error(extractErrorMessage(payload) ?? `开发 Mock 请求失败：${response.status}`);
        }
        sessionId = payload.sessionId;
    } catch (error) {
        throw normalizeRequestError(error);
    }

    return new Promise((resolve, reject) => {
        const eventSource = new EventSource(`/api/assistant/stream?sessionId=${encodeURIComponent(sessionId)}`);
        let reply = '';
        let settled = false;

        const cleanup = () => {
            eventSource.close();
            signal?.removeEventListener('abort', handleAbort);
        };
        const finish = (callback: () => void) => {
            if (settled) return;
            settled = true;
            cleanup();
            callback();
        };
        const handleAbort = () => finish(() => reject(new DOMException('请求已停止', 'AbortError')));

        if (signal?.aborted) {
            handleAbort();
            return;
        }
        signal?.addEventListener('abort', handleAbort, { once: true });

        eventSource.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data) as { delta?: unknown };
                if (typeof parsed.delta === 'string') reply += parsed.delta;
            } catch {
                reply += event.data;
            }
        };
        eventSource.addEventListener('done', () => finish(() => resolve(reply.trim())));
        eventSource.onerror = () => finish(() => reject(new Error('开发 Mock 流连接中断。')));
    });
}

function mergeResumeRecords(base: Record<string, unknown>, patch: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = { ...base };
    Object.entries(patch).forEach(([key, value]) => {
        if (isRecord(out[key]) && isRecord(value)) {
            out[key] = mergeResumeRecords(out[key] as Record<string, unknown>, value);
        } else {
            out[key] = value;
        }
    });
    return out;
}

function extractJsonPayload(text: string): unknown {
    const cleaned = text
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();

    try {
        return JSON.parse(cleaned);
    } catch {
        // Some models prepend a short sentence. Scan the first balanced JSON object in that case.
    }

    const start = cleaned.indexOf('{');
    if (start < 0) return null;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < cleaned.length; index += 1) {
        const char = cleaned[index];
        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === '\\') {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }
        if (char === '"') {
            inString = true;
        } else if (char === '{') {
            depth += 1;
        } else if (char === '}') {
            depth -= 1;
            if (depth === 0) {
                try {
                    return JSON.parse(cleaned.slice(start, index + 1));
                } catch {
                    return null;
                }
            }
        }
    }
    return null;
}

export function parseResumeAiResponse(text: string, baseResume: ResumeProps): ResumeProps {
    const payload = extractJsonPayload(text);
    const candidate = isRecord(payload) && isRecord(payload.resume) ? payload.resume : payload;
    if (!isRecord(candidate) || !Object.keys(candidate).some((key) => RESUME_KEYS.has(key))) {
        throw new Error('模型返回的内容不是有效的简历 JSON，请重试或调整模型配置。');
    }

    return migrateResume(
        mergeResumeRecords(migrateResume(baseResume) as unknown as Record<string, unknown>, candidate),
    );
}

export async function requestResumeAi({
    settings,
    inputMode,
    input,
    resume,
    signal,
}: RequestResumeAiOptions): Promise<ResumeProps> {
    const trimmedInput = input.trim();
    if (!trimmedInput) {
        throw new Error(inputMode === 'instruction' ? '请描述你想修改的内容。' : '请粘贴要转换的简历内容。');
    }

    const messages = buildMessages(inputMode, trimmedInput, migrateResume(resume));
    const reply = settings.mode === 'mock'
        ? await requestMockReply(messages[1].content, signal)
        : await requestCustomReply(settings, messages, signal);
    return parseResumeAiResponse(reply, resume);
}
