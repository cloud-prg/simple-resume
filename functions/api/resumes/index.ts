import {
  ApiError,
  handle,
  json,
  normalizeTitle,
  randomEditToken,
  readJsonBody,
  readMeta,
  requireDb,
  serializePayload,
} from "../../_shared/resumeApi";

/** Capability probe for the SPA. Does not list or create resumes. */
export const onRequestGet = handle(async () => json({ ok: true }));

export const onRequestPost = handle(async ({ request, env }) => {
  const db = requireDb(env);
  const body = await readJsonBody(request);
  if (!("payload" in body)) {
    throw new ApiError(400, "缺少 payload");
  }
  const payload = serializePayload(body.payload);
  const title = normalizeTitle(body.title);
  const id = crypto.randomUUID();
  const editToken = randomEditToken();

  await db
    .prepare(
      `INSERT INTO resumes (id, edit_token, title, payload, created_at, updated_at)
       VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
    )
    .bind(id, editToken, title, payload)
    .run();

  const meta = await readMeta(db, id);
  if (!meta) {
    throw new Error("insert succeeded but row is missing");
  }

  return json(
    {
      id: meta.id,
      edit_token: editToken,
      title: meta.title,
      created_at: meta.created_at,
      updated_at: meta.updated_at,
    },
    201,
  );
});
