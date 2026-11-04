const STORAGE_KEY = 'simple-resume.cloud-resume';

export type CloudCredentials = {
    id: string;
    editToken: string;
};

export type CloudResumeMeta = {
    id: string;
    title: string | null;
    created_at: string;
    updated_at: string;
    editToken?: string;
};

export class CloudApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'CloudApiError';
        this.status = status;
    }
}

/** Resolve API paths against Vite base so GitHub Pages subdirectory and site-root deploys both work. */
export function cloudApiUrl(path: string): string {
    const base = new URL(import.meta.env.BASE_URL || './', window.location.href);
    return new URL(path.replace(/^\//, ''), base).toString();
}

export function readCloudCredentials(): CloudCredentials | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<CloudCredentials>;
        if (typeof parsed.id !== 'string' || typeof parsed.editToken !== 'string') return null;
        if (!parsed.id || !parsed.editToken) return null;
        return { id: parsed.id, editToken: parsed.editToken };
    } catch {
        return null;
    }
}

export function writeCloudCredentials(credentials: CloudCredentials) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
}

export function clearCloudCredentials() {
    localStorage.removeItem(STORAGE_KEY);
}

export function cloudShareHint(id: string): string {
    return [
        `云端简历 ID：${id}`,
        '在 Simple Resume 中点击「从云端加载」，输入该 ID 即可读取这份简历。',
        '编辑令牌只保存在保存时使用的浏览器里，用于更新同一份云端简历，不会随 ID 分享。',
    ].join('\n');
}

async function readError(response: Response): Promise<string> {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        try {
            const data = (await response.json()) as { error?: unknown };
            if (typeof data.error === 'string' && data.error.trim()) return data.error;
        } catch {
            // Fall through to status-based messages.
        }
    } else {
        return '云端接口不可用';
    }
    if (response.status === 413) return '简历内容超过 1MB 上限';
    if (response.status === 404) return '简历不存在';
    if (response.status === 401) return '编辑令牌无效';
    return '云端接口请求失败';
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(cloudApiUrl(path), {
            ...init,
            cache: 'no-store',
            headers: {
                accept: 'application/json',
                ...(init?.headers ?? {}),
            },
        });
    } catch {
        throw new CloudApiError(0, '无法连接云端接口');
    }

    if (!response.ok) {
        throw new CloudApiError(response.status, await readError(response));
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        throw new CloudApiError(response.status, '云端接口不可用');
    }
    return (await response.json()) as T;
}

/** True only when Pages Functions answer. Static GitHub Pages returns HTML and is treated as unavailable. */
export async function detectCloudApi(): Promise<boolean> {
    try {
        const data = await requestJson<{ ok?: boolean }>('api/resumes');
        return data.ok === true;
    } catch {
        return false;
    }
}

export async function createCloudResume(payload: unknown, title?: string): Promise<CloudResumeMeta & { editToken: string }> {
    const data = await requestJson<{
        id: string;
        edit_token: string;
        title?: string | null;
        created_at: string;
        updated_at: string;
    }>('api/resumes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ payload, title }),
    });
    return {
        id: data.id,
        editToken: data.edit_token,
        title: data.title ?? null,
        created_at: data.created_at,
        updated_at: data.updated_at,
    };
}

export async function updateCloudResume(
    credentials: CloudCredentials,
    payload: unknown,
    title?: string,
): Promise<CloudResumeMeta> {
    return requestJson<CloudResumeMeta>(`api/resumes/${encodeURIComponent(credentials.id)}`, {
        method: 'PUT',
        headers: {
            'content-type': 'application/json',
            'X-Edit-Token': credentials.editToken,
        },
        body: JSON.stringify({ payload, title }),
    });
}

export async function loadCloudResume(id: string): Promise<{ id: string; title: string | null; payload: unknown }> {
    const trimmed = id.trim();
    return requestJson(`api/resumes/${encodeURIComponent(trimmed)}`);
}
