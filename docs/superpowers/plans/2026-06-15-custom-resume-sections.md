# Custom Resume Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add configurable fixed-section titles/labels and user-created custom resume sections with plain/titled list modes.

**Architecture:** Keep the existing fixed resume modules intact and add a small customization layer around them. `migrateResume` remains the single compatibility boundary for localStorage, import, mock, and path-based updates.

**Tech Stack:** React 18, TypeScript, Vite, Ant Design, form-render, CSS Modules.

---

### Task 1: Types And Migration

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/util/resumeMigrate.ts`
- Modify: `src/mock/index.ts`

- [ ] **Step 1: Add resume section types**

Add fixed section title/label maps, custom section item types, and a mixed `ResumeSectionId`.

- [ ] **Step 2: Normalize new fields in migration**

Add defaults and sanitizers for `sectionTitles`, `sectionLabels`, `customSections`, mixed `sectionOrder`, and mixed `hiddenSections`.

- [ ] **Step 3: Add mock coverage**

Add one sample custom section to `MOCK_RESUME` so preview, form editing, migration, print, and export paths can be manually verified.

### Task 2: Edit Modal Controls

**Files:**
- Modify: `src/pages/ResumePage/components/EditResumeModal/schema.ts`
- Modify: `src/pages/ResumePage/components/EditResumeModal/index.tsx`
- Modify: `src/pages/ResumePage/components/EditResumeModal/index.module.css`

- [ ] **Step 1: Add schema fields**

Add form-render schema for fixed section title overrides, visible secondary label overrides, and `customSections`.

- [ ] **Step 2: Upgrade section order panel**

Render fixed and custom modules together, support up/down/hide/show, and allow deleting custom modules.

- [ ] **Step 3: Preserve partial edit behavior**

Merge `sectionTitles`, `sectionLabels`, and `customSections` only from full edit; fixed-section partial edits continue to merge only their focused root.

### Task 3: Resume Preview Rendering

**Files:**
- Modify: `src/components/Resume/index.tsx`
- Modify: `src/components/Resume/index.module.css`

- [ ] **Step 1: Render title and label overrides**

Replace hard-coded fixed section titles and visible labels with default-backed helpers.

- [ ] **Step 2: Render custom sections**

Support `custom:<id>` in body order. Render `plain` mode as a square list and `titled` mode as title/description blocks.

- [ ] **Step 3: Wire inline editing**

Use existing path-based callbacks for custom section item text and deletion.

### Task 4: Verification

**Files:**
- No source file ownership; run checks from repo root.

- [ ] **Step 1: Build**

Run: `npm run build`

Expected: TypeScript and Vite production build complete successfully.

- [ ] **Step 2: Lint**

Run: `npm run lint`

Expected: ESLint exits with zero warnings.

- [ ] **Step 3: Manual smoke**

Run: `npm run dev`

Expected: editor opens, custom module appears in preview, fixed titles can be renamed, custom section modes can switch without losing data.
