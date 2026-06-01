# Empty Field Visibility And Form List Width Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hide empty resume fields and empty resume sections from the preview while keeping them editable from the left-side structured form, and make form-render list item controls expand to the remaining modal width.

**Architecture:** Treat empty-field visibility as a pure rendering concern inside `Resume` so persisted resume data and migrations stay unchanged. Use small content-detection helpers that preserve original array indexes for inline-edit form paths, then tighten global form-render CSS overrides for `simpleList` layout inside the resume edit modal.

**Tech Stack:** React 18, TypeScript, Vite 5, CSS Modules, Ant Design, form-render.

---

## File Structure

- Modify: `src/components/Resume/index.tsx`
  - Add pure visibility helpers near `hasText`.
  - Hide empty fields, empty list items, empty blocks, and empty top-level sections in preview and print output.
  - Preserve original array indexes when filtering visible list content so inline-edit paths still target the correct form data.
- Modify: `src/styles/index.css`
  - Strengthen existing `.resume-edit-form .fr-list-simple` layout overrides.
  - Make each simpleList panel and field consume the remaining row width instead of keeping form-render's default `min-width: 220px` behavior.
- No type or migration changes are required.
  - The feature does not add persisted fields.
  - Existing localStorage data remains valid.
  - Existing `hiddenSections` remains an explicit manual hide layer.
- Verification:
  - Run `npm run lint`.
  - Run `npm run build`.
  - Run `npm run dev` for manual browser checks.

## Behavior Rules

- Empty string, whitespace-only string, `null`, and `undefined` are empty.
- A list is empty when it has no item whose `value` has visible text.
- Header contact items render only when their values have visible text.
- `求职意向` renders only when `contact.career` has visible text.
- `个人优势` renders only when `skills` has at least one non-empty item.
- `工作经历` renders only when at least one work item has visible content.
- `项目经历` renders only when at least one project item has visible content.
- `教育经历` renders only when at least one education field has visible text.
- Empty subfields inside otherwise visible sections are skipped.
- Preview inline placeholders are not shown for fields that are hidden because they are empty.
- Hidden empty fields remain editable through the left-side `编辑简历` modal because the underlying data and schema are unchanged.

---

### Task 1: Add Visibility Helpers

**Files:**
- Modify: `src/components/Resume/index.tsx`

- [ ] **Step 1: Add indexed visibility helpers after `hasText`**

Add this code immediately after the existing `hasText` function:

```ts
type IndexedItem<T> = {
    item: T;
    index: number;
};

function hasListText(list?: { value?: string | null }[] | null): boolean {
    return Array.isArray(list) && list.some((item) => hasText(item?.value));
}

function visibleIndexedListItems<T extends { value?: string | null }>(
    list?: T[] | null,
): IndexedItem<T>[] {
    return Array.isArray(list)
        ? list
              .map((item, index) => ({ item, index }))
              .filter(({ item }) => hasText(item?.value))
        : [];
}

function hasWorkContent(job?: WorkHistoryType | null): boolean {
    if (!job) return false;
    return [job.company, job.role, job.dateRange, job.techStack].some(hasText) || hasListText(job.bullets);
}

function hasProjectContent(project?: ProjectExperienceType | null): boolean {
    if (!project) return false;
    return (
        [project.name, project.dateRange, project.introduction].some(hasText) ||
        hasListText(project.mainWork) ||
        hasListText(normalizeProjectResults(project.results))
    );
}
```

- [ ] **Step 2: Run build to verify helper types**

Run:

```bash
npm run build
```

Expected: TypeScript completes and Vite prints a successful production build.

- [ ] **Step 3: Commit**

```bash
git add src/components/Resume/index.tsx
git commit -m "refactor: add resume visibility helpers"
```

---

### Task 2: Hide Empty Top-Level Sections

**Files:**
- Modify: `src/components/Resume/index.tsx`

- [ ] **Step 1: Update `workHistory` section filtering**

Replace the current `workHistory` branch guard:

```ts
if (!workHistory?.length) return null;
```

with:

```ts
const visibleWorkHistory = (workHistory ?? [])
    .map((job, index) => ({ job, index }))
    .filter(({ job }) => hasWorkContent(job));
if (!visibleWorkHistory.length) return null;
```

Replace the `workHistory.map` render block with:

```tsx
{visibleWorkHistory.map(({ job, index }) => (
    <WorkBlock
        key={`${job.company || 'work'}-${index}`}
        job={job}
        index={index}
        inlineEditable={inlineEditable}
        onInlineEdit={onInlineEdit}
        onInlineListInsert={onInlineListInsert}
        onInlineListRemove={onInlineListRemove}
    />
))}
```

- [ ] **Step 2: Update `projectExperience` section filtering**

Replace the current `projectExperience` branch guard:

```ts
if (!projectExperience?.length) return null;
```

with:

```ts
const visibleProjectExperience = (projectExperience ?? [])
    .map((project, index) => ({ project, index }))
    .filter(({ project }) => hasProjectContent(project));
if (!visibleProjectExperience.length) return null;
```

Replace the `projectExperience.map` render block with:

```tsx
{visibleProjectExperience.map(({ project, index }) => (
    <ProjectBlock
        key={`${project.name || 'project'}-${index}`}
        project={project}
        index={index}
        inlineEditable={inlineEditable}
        onInlineEdit={onInlineEdit}
        onInlineListInsert={onInlineListInsert}
        onInlineListRemove={onInlineListRemove}
    />
))}
```

- [ ] **Step 3: Update `skills` section filtering**

Replace the current `skills` branch setup:

```ts
const canSeedSkills = inlineEditable && !!onInlineListInsert;
if ((!skills?.length && !canSeedSkills) || (skills?.length && !skills.some((s) => hasText(s?.value) || inlineEditable))) {
    return null;
}
const skillRows = skills ?? [];
```

with:

```ts
const skillRows = visibleIndexedListItems(skills);
if (!skillRows.length) return null;
```

Replace the skills list rendering with:

```tsx
{skillRows.map(({ item: s, index: originalIndex }) => (
    <li key={originalIndex} className={styles.listRow}>
        <div className={styles.listRowMain}>
            <InlineEditableText
                active={inlineEditable}
                formPath={`skills.${originalIndex}.value`}
                value={s?.value}
                placeholder="点击填写优势"
                onCommit={onInlineEdit}
                multiline
                rows={3}
            />
            {inlineEditable && onInlineListRemove && skillRows.length > 1 ? (
                <button
                    type="button"
                    className={styles.listRowAction}
                    onClick={(e) => {
                        e.stopPropagation();
                        onInlineListRemove('skills', originalIndex);
                    }}
                >
                    删除
                </button>
            ) : null}
        </div>
    </li>
))}
```

Delete the `＋ 添加优势` preview button block from the skills section. Empty or new skills should be added from `编辑简历`.

- [ ] **Step 4: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: lint has no errors and the production build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/Resume/index.tsx
git commit -m "feat: hide empty resume sections"
```

---

### Task 3: Hide Empty Work Fields

**Files:**
- Modify: `src/components/Resume/index.tsx`

- [ ] **Step 1: Update `WorkBlock` guard and bullet list**

Replace:

```ts
const { job, index, inlineEditable, onInlineEdit, onInlineListInsert, onInlineListRemove } = props;
if (!job.company && !job.role && !job.dateRange) return null;
const bullets = job.bullets ?? [];
const bulletPath = `workHistory.${index}.bullets`;
const visibleBullets = bullets.filter((bullet) => hasText(bullet?.value) || inlineEditable);
```

with:

```ts
const { job, index, inlineEditable, onInlineEdit, onInlineListRemove } = props;
if (!hasWorkContent(job)) return null;
const bullets = visibleIndexedListItems(job.bullets);
```

- [ ] **Step 2: Render only non-empty work header fields**

Replace the body of `<div className={styles.workHead}>...</div>` with:

```tsx
{hasText(job.company) && (
    <div className={styles.workCompany}>
        <InlineEditableText
            active={inlineEditable}
            formPath={`workHistory.${index}.company`}
            value={job.company}
            placeholder="公司名称"
            onCommit={onInlineEdit}
        />
    </div>
)}
{hasText(job.role) && (
    <div className={styles.workRole}>
        <InlineEditableText
            active={inlineEditable}
            formPath={`workHistory.${index}.role`}
            value={job.role}
            placeholder="岗位名称"
            onCommit={onInlineEdit}
        />
    </div>
)}
{hasText(job.dateRange) && (
    <div className={styles.workWhen}>
        <InlineEditableText
            active={inlineEditable}
            formPath={`workHistory.${index}.dateRange`}
            value={job.dateRange}
            placeholder="在职时间"
            onCommit={onInlineEdit}
        />
    </div>
)}
```

- [ ] **Step 3: Render only non-empty work bullets while keeping original indexes**

Replace the bullet list render block with:

```tsx
{bullets.length > 0 && (
    <ul className={styles.squareList}>
        {bullets.map(({ item: b, index: bulletIndex }) => (
            <li key={bulletIndex} className={styles.listRow}>
                <div className={styles.listRowMain}>
                    <InlineEditableText
                        active={inlineEditable}
                        formPath={`workHistory.${index}.bullets.${bulletIndex}.value`}
                        value={b?.value}
                        placeholder="点击填写工作要点"
                        onCommit={onInlineEdit}
                        multiline
                        rows={2}
                    />
                    {inlineEditable && onInlineListRemove && bullets.length > 1 ? (
                        <button
                            type="button"
                            className={styles.listRowAction}
                            onClick={(e) => {
                                e.stopPropagation();
                                onInlineListRemove(`workHistory.${index}.bullets`, bulletIndex);
                            }}
                        >
                            删除
                        </button>
                    ) : null}
                </div>
            </li>
        ))}
    </ul>
)}
```

Delete the `＋ 添加要点` preview button block. New work bullets should be added from `编辑简历`.

- [ ] **Step 4: Hide empty tech stack**

Replace:

```tsx
{(hasText(job.techStack) || inlineEditable) && !job.hideTechStack && (
```

with:

```tsx
{hasText(job.techStack) && !job.hideTechStack && (
```

- [ ] **Step 5: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: lint has no errors and the production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/Resume/index.tsx
git commit -m "feat: hide empty work fields"
```

---

### Task 4: Hide Empty Project Fields

**Files:**
- Modify: `src/components/Resume/index.tsx`

- [ ] **Step 1: Update `ProjectBlock` guard and lists**

Replace:

```ts
const { project, index, inlineEditable, onInlineEdit, onInlineListInsert, onInlineListRemove } = props;
if (!project.name && !project.dateRange) return null;
const resultsList = normalizeProjectResults(project.results);
const mainWorkList = project.mainWork ?? [];
const mainWorkPath = `projectExperience.${index}.mainWork`;
const resultsPath = `projectExperience.${index}.results`;
```

with:

```ts
const { project, index, inlineEditable, onInlineEdit, onInlineListRemove } = props;
if (!hasProjectContent(project)) return null;
const resultsList = visibleIndexedListItems(normalizeProjectResults(project.results));
const mainWorkList = visibleIndexedListItems(project.mainWork);
```

- [ ] **Step 2: Render only non-empty project header fields**

Replace the body of `<div className={styles.projectHead}>...</div>` with:

```tsx
{hasText(project.name) && (
    <span className={styles.projectName}>
        <InlineEditableText
            active={inlineEditable}
            formPath={`projectExperience.${index}.name`}
            value={project.name}
            placeholder="项目名称"
            onCommit={onInlineEdit}
        />
    </span>
)}
{hasText(project.dateRange) && (
    <span className={styles.projectWhen}>
        <InlineEditableText
            active={inlineEditable}
            formPath={`projectExperience.${index}.dateRange`}
            value={project.dateRange}
            placeholder="项目时间"
            onCommit={onInlineEdit}
        />
    </span>
)}
```

- [ ] **Step 3: Hide empty project introduction**

Replace:

```tsx
{(hasText(project.introduction) || inlineEditable) && (
```

with:

```tsx
{hasText(project.introduction) && (
```

- [ ] **Step 4: Render only non-empty main-work items**

Replace the main-work list render block with:

```tsx
{mainWorkList.length > 0 && (
    <>
        <div className={styles.subLabel}>主要工作：</div>
        <ol className={styles.numbered}>
            {mainWorkList.map(({ item: m, index: workIndex }) => (
                <li key={workIndex} className={styles.listRow}>
                    <div className={styles.listRowMain}>
                        <InlineEditableText
                            active={inlineEditable}
                            formPath={`projectExperience.${index}.mainWork.${workIndex}.value`}
                            value={m?.value}
                            placeholder="点击填写主要工作"
                            onCommit={onInlineEdit}
                            multiline
                            rows={3}
                        />
                        {inlineEditable && onInlineListRemove && mainWorkList.length > 1 ? (
                            <button
                                type="button"
                                className={styles.listRowAction}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onInlineListRemove(`projectExperience.${index}.mainWork`, workIndex);
                                }}
                            >
                                删除
                            </button>
                        ) : null}
                    </div>
                </li>
            ))}
        </ol>
    </>
)}
```

Delete the `＋ 添加主要工作` preview button block. New main-work items should be added from `编辑简历`.

- [ ] **Step 5: Render only non-empty result items**

Replace the results list render block with:

```tsx
{resultsList.length > 0 && (
    <>
        <div className={styles.subLabel}>项目成果：</div>
        <ul className={styles.squareList}>
            {resultsList.map(({ item: r, index: resultIndex }) => (
                <li key={resultIndex} className={styles.listRow}>
                    <div className={styles.listRowMain}>
                        <InlineEditableText
                            active={inlineEditable}
                            formPath={`projectExperience.${index}.results.${resultIndex}.value`}
                            value={r?.value}
                            placeholder="点击填写项目成果"
                            onCommit={onInlineEdit}
                            multiline
                            rows={3}
                        />
                        {inlineEditable && onInlineListRemove && resultsList.length > 1 ? (
                            <button
                                type="button"
                                className={styles.listRowAction}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onInlineListRemove(`projectExperience.${index}.results`, resultIndex);
                                }}
                            >
                                删除
                            </button>
                        ) : null}
                    </div>
                </li>
            ))}
        </ul>
    </>
)}
```

Delete the `＋ 添加项目成果` preview button block. New result items should be added from `编辑简历`.

- [ ] **Step 6: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: lint has no errors and the production build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/components/Resume/index.tsx
git commit -m "feat: hide empty project fields"
```

---

### Task 5: Hide Empty Header And Education Fields

**Files:**
- Modify: `src/components/Resume/index.tsx`

- [ ] **Step 1: Hide empty contact rows in the header**

In the main `Index` component, replace these conditions:

```tsx
{(ageLabel || inlineEditable) && (
{(phone || inlineEditable) && (
{(email || inlineEditable) && (
{(career || inlineEditable) && (
```

with:

```tsx
{ageLabel && (
{hasText(phone) && (
{hasText(email) && (
{hasText(career) && (
```

- [ ] **Step 2: Render only non-empty education fields**

Inside the `education` branch, keep the existing section guard:

```ts
if (![school, degree, major, startDate, endDate, description].some(hasText)) return null;
```

Replace the education row content with:

```tsx
{hasText(school) && (
    <span className={styles.eduSchool}>
        <InlineEditableText
            active={inlineEditable}
            formPath="education.school"
            value={school}
            placeholder="点击填写学校"
            onCommit={onInlineEdit}
        />
    </span>
)}
{(hasText(degree) || hasText(major)) && (
    <span className={styles.eduMid}>
        {hasText(degree) && (
            <InlineEditableText
                active={inlineEditable}
                formPath="education.degree"
                value={degree}
                placeholder="学历"
                onCommit={onInlineEdit}
            />
        )}
        {hasText(degree) && hasText(major) && '　'}
        {hasText(major) && (
            <InlineEditableText
                active={inlineEditable}
                formPath="education.major"
                value={major}
                placeholder="专业"
                onCommit={onInlineEdit}
            />
        )}
    </span>
)}
{(hasText(startDate) || hasText(endDate)) && (
    <span className={styles.eduDates}>
        {hasText(startDate) && (
            <InlineEditableText
                active={inlineEditable}
                formPath="education.startDate"
                value={startDate}
                placeholder="开始时间"
                onCommit={onInlineEdit}
            />
        )}
        {hasText(startDate) && hasText(endDate) && <span className={styles.inlineSeparator}>-</span>}
        {hasText(endDate) && (
            <InlineEditableText
                active={inlineEditable}
                formPath="education.endDate"
                value={endDate}
                placeholder="结束时间"
                onCommit={onInlineEdit}
            />
        )}
    </span>
)}
```

Keep the existing description guard:

```tsx
{hasText(description) && (
```

- [ ] **Step 3: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: lint has no errors and the production build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/Resume/index.tsx
git commit -m "feat: hide empty header and education fields"
```

---

### Task 6: Expand Edit Modal List Controls

**Files:**
- Modify: `src/styles/index.css`

- [ ] **Step 1: Replace the simpleList layout override block**

Replace the current block from:

```css
/* form-render simpleList 默认 inline-block，在弹窗里会挤在左侧；改为占满表单项宽度 */
.resume-edit-form .fr-list-simple {
```

through the mobile `@media (max-width: 640px)` block with:

```css
/* form-render simpleList 默认 inline-block 且子项 min-width:220px；弹窗内需要占满剩余宽度 */
.resume-edit-form .fr-list-simple,
.resume-edit-form .fr-list-simple-background {
    display: block;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}

.resume-edit-form .fr-list-simple .fr-list-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    width: 100%;
    min-width: 0;
}

.resume-edit-form .fr-list-simple .fr-list-item > .fr-panel {
    display: block;
    flex: 1 1 0;
    width: auto;
    min-width: 0;
    max-width: 100%;
}

.resume-edit-form .fr-list-simple .fr-list-item .fr-inline-container {
    display: flex;
    flex: 1 1 0;
    width: 100%;
    min-width: 0;
    max-width: 100%;
}

.resume-edit-form .fr-list-simple .fr-list-item .fr-inline-field {
    display: block;
    flex: 1 1 0;
    width: auto;
    min-width: 0;
    max-width: 100%;
    margin-right: 0;
}

.resume-edit-form .fr-list-simple .fr-list-item .fr-field,
.resume-edit-form .fr-list-simple .fr-list-item .ant-form-item,
.resume-edit-form .fr-list-simple .fr-list-item .ant-form-item-row,
.resume-edit-form .fr-list-simple .fr-list-item .ant-form-item-control,
.resume-edit-form .fr-list-simple .fr-list-item .ant-form-item-control-input,
.resume-edit-form .fr-list-simple .fr-list-item .ant-form-item-control-input-content {
    width: 100%;
    min-width: 0;
    max-width: 100%;
}

.resume-edit-form .fr-list-simple .fr-list-item .ant-input,
.resume-edit-form .fr-list-simple .fr-list-item textarea.ant-input {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}

.resume-edit-form .fr-list-simple .fr-list-item-operate {
    flex: 0 0 auto;
}

@media (max-width: 640px) {
    .resume-edit-form .fr-list-simple .fr-list-item {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .resume-edit-form .fr-list-simple .fr-list-item > .fr-panel {
        flex-basis: 100%;
    }

    .resume-edit-form .fr-list-simple .fr-list-item-operate {
        width: 100%;
        justify-content: flex-end;
    }
}
```

- [ ] **Step 2: Run lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: lint has no errors and the production build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/styles/index.css
git commit -m "fix: expand resume form list controls"
```

---

### Task 7: Manual Verification

**Files:**
- No code changes.

- [ ] **Step 1: Start the app**

Run:

```bash
npm run dev
```

Expected: Vite starts the app on port `4300` or the next available port.

- [ ] **Step 2: Verify hidden empty preview content**

In the browser:

1. Open the app.
2. Click `编辑简历`.
3. Clear all values from `个人优势`.
4. Save.
5. Confirm the `个人优势` preview section is not displayed.
6. Click `编辑简历` again.
7. Confirm the empty `个人优势` values are still editable in the modal.

- [ ] **Step 3: Verify empty list items inside populated sections**

In the browser:

1. Click `编辑简历`.
2. In `工作经历`, keep `公司` filled and clear every `工作要点`.
3. Save.
4. Confirm `工作经历` still displays because `公司` has text.
5. Confirm the empty `工作要点` list does not display.
6. Reopen `编辑简历`.
7. Confirm the cleared `工作要点` controls remain editable in the modal.

- [ ] **Step 4: Verify form list width**

In the browser:

1. Click `编辑简历`.
2. Go to `工作经历` -> `工作要点`.
3. Confirm each input expands across the available row width and the operate buttons stay at the right.
4. Go to `项目经历` -> `主要工作` and `项目成果`.
5. Confirm each textarea expands across the available row width.
6. Resize the browser below `640px`.
7. Confirm the operate buttons wrap below the control and align right without clipping the textarea.

- [ ] **Step 5: Stop the dev server**

Press `Ctrl+C` in the terminal running Vite.

---

## Self-Review

- Spec coverage: the plan covers hidden empty fields, hidden empty sections, continued editing through the modal, and list-control width expansion inside the modal.
- Placeholder scan: no unfinished placeholder instructions remain.
- Type consistency: helper names and form path strings are consistent across tasks; visible list filtering preserves original indexes.
