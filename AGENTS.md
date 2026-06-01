# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Simple Resume — an online resume editor with a "preview-first" approach. Left panel manages templates and structured forms; right panel provides real-time preview with inline editing (WYSIWYG). Data is localStorage-only by default. AI assistant supports both dev mock and user-provided OpenAI-compatible endpoints.

## Tech Stack

- React 18 + TypeScript + Vite 5
- Ant Design + `form-render`
- CSS Modules + Tailwind CSS (utility class helper)

## Common Commands

```bash
# Development server (port 4300, includes AI mock API)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Deploy dist/ to GitHub Pages (gh-pages branch)
npm run deploy
```

## High-Level Architecture

### 1. Resume Data Flow & Dual-Channel Editing

The entire app centers around a single `ResumeProps` type (`src/types/index.ts`). `ResumePage` (`src/pages/ResumePage/index.tsx`) holds `resumeList` in React state and persists it to `localStorage` under key `resumeList`.

There are two editing paths that both mutate the same state:

- **Preview inline editing**: The `Resume` component (`src/components/Resume/index.tsx`) renders the resume and, when `inlineEditable` is true, wraps text nodes with `InlineEditableText`. Changes commit through `onInlineFieldChange` / `onInlineListInsert` / `onInlineListRemove` callbacks, which reach `ResumePage` and call path-based utilities in `src/util/resumePath.ts` (`updateResumeValueAtPath`, `insertResumeListItemAtPath`, `removeResumeListItemAtPath`). These utilities deep-clone via `JSON.parse(JSON.stringify(...))`, mutate by dot-path, then re-run `migrateResume`.
- **Form editing**: `EditResumeModal` (`src/pages/ResumePage/components/EditResumeModal/index.tsx`) uses `form-render` with a JSON schema (`schema.ts`). It supports both full-form mode and partial mode: when the user double-clicks a preview section, `onPreviewFieldRequest` fires with a form path, the modal opens scoped to that root section only (`focusRoot`), and the OK button merges the partial form data back into the full resume via `mergeResumePartial`. The modal also exposes an imperative `openEdit({ scrollToField })` handle so the preview can deep-link into a specific field.

### 2. Resume Data Migration

All data entering the system — from `localStorage`, file import, or mock — must pass through `migrateResume` (`src/util/resumeMigrate.ts`). This layer:

- Normalizes old `experience[]` into `workHistory[]`
- Converts plain string arrays to `{ value: string }[]` for skills
- Converts legacy string `results` into bullet-point arrays for projects
- Normalizes education date strings to `YYYY/MM` (required by Ant DatePicker)
- Fills missing `sectionOrder` and `theme` with defaults

When modifying `ResumeProps` fields, always update `migrateResume` to handle backward compatibility so existing user localStorage data doesn't break.

### 3. Print (No DOM-to-PDF)

The app deliberately avoids PDF libraries. `ResumePage.handlePrint` opens a new window, writes the preview's `innerHTML`, and injects two stylesheets inline:

- `theme.css` (imported as `?raw`)
- `Resume/index.module.css` (imported as `?inline`)

It then schedules `window.print()` behind double `requestAnimationFrame` plus `onload` to ensure fonts and layout are stable before the print dialog opens. If print fails silently, it's usually a popup blocker.

### 4. AI Assistant Dual-Mode Architecture

`AssistantModal` (`src/components/AssistantModal/index.tsx`) supports two mutually exclusive modes:

- **Dev mock** (development only): A Vite plugin `assistantDevApiPlugin` (`src/vite-plugins/assistantDevApi.ts`) registers two endpoints on the dev server: `POST /api/assistant/prepare` and `GET /api/assistant/stream` (SSE). The modal uses `EventSource` to consume the stream. This plugin is only loaded when `mode === 'development'` in `vite.config.ts`.
- **Custom API**: Users provide their own `API Key`, `Base URL`, and `Model` in the UI. The browser sends a standard `fetch` to `/chat/completions`. The target endpoint must allow CORS. Credentials are stored in `localStorage` under key `simple-resume.assistant-settings` and are never exported with resumes.

The modal defaults to `mock` in dev and `custom` in production builds.

### 5. Theme System (Two Layers)

- **App appearance** (`AppearanceContext`, `src/theme/appearance.ts`): global light/sepia/dark mode. Persisted to `localStorage` (`sr-appearance`), applied via `document.documentElement.dataset.theme`.
- **Resume theme** (`ResumeProps.theme`): per-resume heading colors and header alignment. In `Resume` component, these are injected as CSS custom properties (`--resume-h1`, etc.) on the root style object. When the app appearance is `dark`, these inline colors are intentionally omitted to avoid clashing with dark-mode text variables.

### 6. Build & Deploy Notes

- `vite.config.ts` sets `base: './'` for GitHub Pages compatibility.
- A custom Vite plugin runs `autoGenerateTailwindJIT()` on `buildStart` to ensure `public/tailwind-jit.css` exists.
- Manual chunks split `react` and `antd`.
- `deploy.sh` force-pushes `dist/` to the `gh-pages` branch.

## Key File Map

| Purpose | File |
|---|---|
| Resume data type | `src/types/index.ts` |
| Data migration (must touch when schema changes) | `src/util/resumeMigrate.ts` |
| Path-based state updates for inline editing | `src/util/resumePath.ts` |
| Preview + inline editing renderer | `src/components/Resume/index.tsx` |
| Main page (state, localStorage, print) | `src/pages/ResumePage/index.tsx` |
| Form modal (form-render) | `src/pages/ResumePage/components/EditResumeModal/index.tsx` |
| AI assistant modal | `src/components/AssistantModal/index.tsx` |
| Dev AI mock plugin | `src/vite-plugins/assistantDevApi.ts` |
| Import / export utilities | `src/util/file.ts` |
| Default / mock resume data | `src/mock/index.ts` |
