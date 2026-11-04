import {
  ApiError,
  handle,
  json,
  normalizeTitle,
  parseStoredPayload,
  readEditToken,
  readJsonBody,
  readResumeId,
  requireDb,
  serializePayload,
  tokensMatch,
} from "../../_shared/resumeApi";

type StoredResume = {
  id: string;
  edit_token: string;
  title: string | null;
  payload: string;
  created_at: string;
  updated_at: string;
};

export const onRequestGet = handle(async ({ params, env }) => {
  const db = requireDb(env);
  const id = readResumeId(params);
  const row = await db
    .prepare("SELECT id, title, payload, created_at, updated_at FROM resumes WHERE id = ?")
    .bind(id)
    .first<Omit<StoredResume, "edit_token">>();

  if (!row) {
    throw new ApiError(404, "简历不存在");
  }

  return json({
    id: row.id,
    title: row.title,
    payload: parseStoredPayload(row.payload),
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
});

export const onRequestPut = handle(async ({ request, params, env }) => {
  const db = requireDb(env);
  const id = readResumeId(params);
  const body = await readJsonBody(request);
  const existing = await db
    .prepare("SELECT id, edit_token, title, created_at FROM resumes WHERE id = ?")
    .bind(id)
    .first<Pick<StoredResume, "id" | "edit_token" | "title" | "created_at">>();

  if (!existing) {
    throw new ApiError(404, "简历不存在");
  }

  const token = readEditToken(request, body);
  if (!token || !(await tokensMatch(token, existing.edit_token))) {
    throw new ApiError(401, "编辑令牌无效");
  }

  if (!("payload" in body)) {
    throw new ApiError(400, "缺少 payload");
  }
  const payload = serializePayload(body.payload);
  const title = Object.prototype.hasOwnProperty.call(body, "title")
    ? normalizeTitle(body.title)
    : existing.title;

  await db
    .prepare("UPDATE resumes SET payload = ?, title = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(payload, title, id)
    .run();

  const updated = await db
    .prepare("SELECT id, title, created_at, updated_at FROM resumes WHERE id = ?")
    .bind(id)
    .first<Pick<StoredResume, "id" | "title" | "created_at" | "updated_at">>();

  if (!updated) {
    throw new Error("update succeeded but row is missing");
  }

  return json({
    id: updated.id,
    title: updated.title,
    created_at: updated.created_at,
    updated_at: updated.updated_at,
  });
});
