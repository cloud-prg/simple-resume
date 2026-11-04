/** About 1MB. D1 row limit is 2MB; this rejects oversized resume JSON before the query. */
export const MAX_BODY_BYTES = 1_000_000;

const ID_PATTERN = /^[A-Za-z0-9-]{8,80}$/;

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function json(data: unknown, status = 200): Response {
  return Response.json(data, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return json({ error: error.message }, error.status);
  }
  const message = error instanceof Error ? error.message : "unknown";
  console.error(JSON.stringify({ message: "resume api failure", error: message }));
  return json({ error: "服务器错误" }, 500);
}

export function handle(
  fn: (context: EventContext<Env, string, Record<string, unknown>>) => Promise<Response>,
): PagesFunction<Env> {
  return async (context) => {
    try {
      return await fn(context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const size = Number(declared);
    if (!Number.isFinite(size) || size < 0) {
      throw new ApiError(400, "无效的 Content-Length");
    }
    if (size > MAX_BODY_BYTES) {
      throw new ApiError(413, "简历内容超过 1MB 上限");
    }
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw new ApiError(400, "请求体不能为空");
  }

  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new ApiError(413, "简历内容超过 1MB 上限");
    }
    chunks.push(value);
  }
  if (total === 0) {
    throw new ApiError(400, "请求体不能为空");
  }

  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(buffer));
  } catch {
    throw new ApiError(400, "请求体不是合法 JSON");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new ApiError(400, "请求体必须是 JSON 对象");
  }
  return parsed as Record<string, unknown>;
}

export function serializePayload(payload: unknown): string {
  let encoded: string;
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    if (!trimmed) {
      throw new ApiError(400, "payload 不能为空");
    }
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new ApiError(400, "payload 字符串必须是 JSON 对象");
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(400, "payload 字符串不是合法 JSON");
    }
    encoded = trimmed;
  } else if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new ApiError(400, "payload 必须是 JSON 对象或 JSON 字符串");
  } else {
    encoded = JSON.stringify(payload);
  }

  if (new TextEncoder().encode(encoded).byteLength > MAX_BODY_BYTES) {
    throw new ApiError(413, "简历内容超过 1MB 上限");
  }
  return encoded;
}

export function parseStoredPayload(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

/** Missing title stays null. Blank strings are stored as null. */
export function normalizeTitle(title: unknown): string | null {
  if (title === undefined || title === null) return null;
  if (typeof title !== "string") {
    throw new ApiError(400, "title 必须是字符串");
  }
  const trimmed = title.trim();
  if (trimmed.length > 200) {
    throw new ApiError(400, "title 不能超过 200 个字符");
  }
  return trimmed || null;
}

export function readResumeId(params: EventContext<Env, string, unknown>["params"]): string {
  const raw = params.id;
  const id = Array.isArray(raw) ? raw[0] : raw;
  if (typeof id !== "string" || !ID_PATTERN.test(id)) {
    throw new ApiError(400, "无效的简历 ID");
  }
  return id;
}

export function readEditToken(request: Request, body: Record<string, unknown>): string | null {
  const header = request.headers.get("X-Edit-Token")?.trim();
  if (header) return header;
  if (typeof body.edit_token === "string" && body.edit_token.trim()) {
    return body.edit_token.trim();
  }
  return null;
}

export async function tokensMatch(provided: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(providedHash, expectedHash);
}

export function randomEditToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function requireDb(env: Env): D1Database {
  if (!env.DB) {
    throw new ApiError(500, "未绑定 D1 数据库");
  }
  return env.DB;
}

export type ResumeMeta = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export async function readMeta(db: D1Database, id: string): Promise<ResumeMeta | null> {
  return db
    .prepare("SELECT id, title, created_at, updated_at FROM resumes WHERE id = ?")
    .bind(id)
    .first<ResumeMeta>();
}
