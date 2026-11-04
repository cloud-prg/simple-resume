-- Resume JSON stored by Pages Functions.
-- Already applied to the remote D1 database `simple-resume`
-- (221a394c-6106-4a97-9566-e28048f516e9). Safe to re-run locally:
--   npx wrangler d1 execute simple-resume --local --file=schema.sql

CREATE TABLE IF NOT EXISTS resumes (
  id TEXT PRIMARY KEY,
  edit_token TEXT NOT NULL,
  title TEXT,
  payload TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
