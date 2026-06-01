import type {
    ProjectExperienceType,
    ResumeBodySectionId,
    ResumeProps,
    WorkHistoryType,
} from '@/types';
import {
    DEFAULT_RESUME_THEME,
    DEFAULT_SECTION_ORDER,
    normalizeProjectResults,
} from '@/util/resumeMigrate';
import React from 'react';
import EmailSvg from '@/assets/email.svg';
import PhoneSvg from '@/assets/phone.svg';
import { useAppearance } from '@/context/AppearanceContext';
import styles from './index.module.css';

export type ResumeViewProps = ResumeProps & {
    /** 为 true 时，双击区块空白处可打开结构化表单编辑 */
    previewInteractive?: boolean;
    /** 点击预览区块时传出表单字段路径（供 form-render scrollToPath） */
    onPreviewFieldRequest?: (formPath: string) => void;
    /** 为 true 时，文本节点可在预览中直接修改 */
    inlineEditable?: boolean;
    /** 预览中的字段级修改回调 */
    onInlineFieldChange?: (formPath: string, value: string) => void;
    /** 预览中向列表路径插入一项（path 指向数组，如 workHistory.0.bullets） */
    onInlineListInsert?: (path: string, item: unknown, index?: number) => void;
    /** 预览中按下标删除列表项 */
    onInlineListRemove?: (path: string, index: number) => void;
};

function renderAge(age?: string): string | null {
    if (!age?.trim()) return null;
    const t = age.trim();
    return t.includes('岁') ? `年龄：${t}` : `年龄：${t}岁`;
}

function hasText(value?: string | null): boolean {
    return typeof value === 'string' && value.trim().length > 0;
}

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

function InlineEditableText(props: {
    active: boolean;
    value?: string;
    formPath: string;
    onCommit?: (formPath: string, value: string) => void;
    placeholder: string;
    multiline?: boolean;
    rows?: number;
    className?: string;
    displayValue?: string;
}) {
    const {
        active,
        value,
        formPath,
        onCommit,
        placeholder,
        multiline,
        rows = 3,
        className,
        displayValue,
    } = props;
    const [editing, setEditing] = React.useState(false);
    const [draft, setDraft] = React.useState(value ?? '');
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const editingRef = React.useRef(false);

    React.useEffect(() => {
        if (!editing) {
            setDraft(value ?? '');
        }
    }, [editing, value]);

    React.useEffect(() => {
        const editor = multiline ? textareaRef.current : inputRef.current;
        if (!editing || !editor) return;
        editor.focus();
        if ('select' in editor && typeof editor.select === 'function' && !multiline) {
            editor.select();
        }
    }, [editing, multiline]);

    const startEdit = (event: React.MouseEvent<HTMLElement>) => {
        if (!active) return;
        event.stopPropagation();
        editingRef.current = true;
        setDraft(value ?? '');
        setEditing(true);
    };

    const commit = () => {
        if (!editingRef.current) return;
        editingRef.current = false;
        setEditing(false);
        onCommit?.(formPath, draft);
    };

    const cancel = () => {
        if (!editingRef.current) return;
        editingRef.current = false;
        setDraft(value ?? '');
        setEditing(false);
    };

    if (editing) {
        if (multiline) {
            return (
                <textarea
                    ref={textareaRef}
                    rows={rows}
                    value={draft}
                    className={`${styles.inlineEditor} ${styles.inlineEditorArea}${className ? ` ${className}` : ''}`}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => setDraft(event.target.value)}
                    onBlur={commit}
                    onKeyDown={(event) => {
                        event.stopPropagation();
                        if (event.key === 'Escape') {
                            event.preventDefault();
                            cancel();
                        }
                        if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                            event.preventDefault();
                            commit();
                        }
                    }}
                />
            );
        }

        return (
            <input
                ref={inputRef}
                value={draft}
                className={`${styles.inlineEditor}${className ? ` ${className}` : ''}`}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setDraft(event.target.value)}
                onBlur={commit}
                onKeyDown={(event) => {
                    event.stopPropagation();
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        cancel();
                    }
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        commit();
                    }
                }}
            />
        );
    }

    const text = hasText(value) ? displayValue ?? value ?? '' : placeholder;

    return (
        <span
            role={active ? 'button' : undefined}
            tabIndex={active ? 0 : undefined}
            className={`${styles.inlineEditable} ${active ? styles.inlineEditableActive : ''} ${
                hasText(value) ? '' : styles.inlineEditableEmpty
            }${className ? ` ${className}` : ''}`}
            onClick={startEdit}
            onDoubleClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
                if (!active) return;
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    editingRef.current = true;
                    setDraft(value ?? '');
                    setEditing(true);
                }
            }}
        >
            {text}
        </span>
    );
}

function PreviewHot(props: {
    active: boolean;
    formPath: string;
    onActivate?: (formPath: string) => void;
    children: React.ReactNode;
    className?: string;
}) {
    const { active, formPath, onActivate, children, className } = props;
    if (!active) {
        return <>{children}</>;
    }
    return (
        <div
            role="button"
            tabIndex={0}
            className={`${styles.previewHot} ${styles.previewHotActive}${className ? ` ${className}` : ''}`}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onActivate?.(formPath);
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onActivate?.(formPath);
                }
            }}
        >
            {children}
        </div>
    );
}

function renderBodySection(
    id: ResumeBodySectionId,
    data: ResumeProps,
    interactive: boolean,
    inlineEditable: boolean,
    onActivate?: (formPath: string) => void,
    onInlineEdit?: (formPath: string, value: string) => void,
    onInlineListRemove?: (path: string, index: number) => void,
): React.ReactNode {
    const { workHistory, projectExperience, skills, education } = data;
    const { degree, major, school, description, startDate, endDate } = education;

    switch (id) {
        case 'workHistory': {
            const visibleWorkHistory = (workHistory ?? [])
                .map((job, index) => ({ job, index }))
                .filter(({ job }) => hasWorkContent(job));
            if (!visibleWorkHistory.length) return null;
            return (
                <PreviewHot
                    key="workHistory"
                    active={!!interactive}
                    formPath="workHistory"
                    onActivate={onActivate}
                >
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>工作经历</h2>
                        <hr className={styles.rule} />
                        {visibleWorkHistory.map(({ job, index }) => (
                            <WorkBlock
                                key={`${job.company || 'work'}-${index}`}
                                job={job}
                                index={index}
                                inlineEditable={inlineEditable}
                                onInlineEdit={onInlineEdit}
                                onInlineListRemove={onInlineListRemove}
                            />
                        ))}
                    </section>
                </PreviewHot>
            );
        }
        case 'projectExperience': {
            const visibleProjectExperience = (projectExperience ?? [])
                .map((project, index) => ({ project, index }))
                .filter(({ project }) => hasProjectContent(project));
            if (!visibleProjectExperience.length) return null;
            return (
                <PreviewHot
                    key="projectExperience"
                    active={!!interactive}
                    formPath="projectExperience"
                    onActivate={onActivate}
                >
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>项目经历</h2>
                        <hr className={styles.rule} />
                        {visibleProjectExperience.map(({ project, index }) => (
                            <ProjectBlock
                                key={`${project.name || 'project'}-${index}`}
                                project={project}
                                index={index}
                                inlineEditable={inlineEditable}
                                onInlineEdit={onInlineEdit}
                                onInlineListRemove={onInlineListRemove}
                            />
                        ))}
                    </section>
                </PreviewHot>
            );
        }
        case 'education':
            if (![school, degree, major, startDate, endDate, description].some(hasText)) return null;
            return (
                <PreviewHot key="education" active={!!interactive} formPath="education" onActivate={onActivate}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>教育经历</h2>
                        <hr className={styles.rule} />
                        <div className={styles.eduRow}>
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
                                    {hasText(startDate) && hasText(endDate) && (
                                        <span className={styles.inlineSeparator}>-</span>
                                    )}
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
                        </div>
                        {hasText(description) && (
                            <p className={styles.paragraph}>
                                <InlineEditableText
                                    active={inlineEditable}
                                    formPath="education.description"
                                    value={description}
                                    placeholder="点击填写在校说明"
                                    onCommit={onInlineEdit}
                                    multiline
                                    rows={4}
                                    className={styles.inlineBlock}
                                />
                            </p>
                        )}
                    </section>
                </PreviewHot>
            );
        case 'skills': {
            const skillRows = visibleIndexedListItems(skills);
            if (!skillRows.length) return null;
            return (
                <PreviewHot key="skills" active={!!interactive} formPath="skills" onActivate={onActivate}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>个人优势</h2>
                        <hr className={styles.rule} />
                        <ul className={styles.squareList}>
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
                        </ul>
                    </section>
                </PreviewHot>
            );
        }
        default:
            return null;
    }
}

const headerAlignClass = {
    left: styles.headerAlignLeft,
    center: styles.headerAlignCenter,
    right: styles.headerAlignRight,
} as const;

const metaRowAlignClass = {
    left: styles.metaRowLeft,
    center: styles.metaRowCenter,
    right: styles.metaRowRight,
} as const;

const Index: React.FC<ResumeViewProps> = (props) => {
    const {
        previewInteractive,
        onPreviewFieldRequest,
        inlineEditable,
        onInlineFieldChange,
        onInlineListRemove,
        ...resume
    } = props;
    const { mode: appAppearance } = useAppearance();
    const { contact, sectionOrder, hiddenSections, theme: themeRaw } = resume;
    const { name, phone, email, career, age } = contact;
    const ageLabel = renderAge(age);
    const hiddenSectionSet = new Set(hiddenSections ?? []);
    const bodyOrder = (sectionOrder?.length ? sectionOrder : DEFAULT_SECTION_ORDER).filter(
        (id) => !hiddenSectionSet.has(id),
    );
    const theme = { ...DEFAULT_RESUME_THEME, ...themeRaw };
    const layout = theme.headerLayout ?? 'center';
    const headerAlign = headerAlignClass[layout] ?? styles.headerAlignCenter;
    const metaAlign = metaRowAlignClass[layout] ?? styles.metaRowCenter;

    /** 深色应用外观下不用简历内联标题色（多为黑/深蓝），否则盖住 html 上的浅色标题变量 */
    const rootStyle: React.CSSProperties =
        appAppearance === "dark"
            ? {}
            : {
                  ["--resume-h1" as string]:
                      theme.heading1Color ?? DEFAULT_RESUME_THEME.heading1Color,
                  ["--resume-h2" as string]:
                      theme.heading2Color ?? DEFAULT_RESUME_THEME.heading2Color,
                  ["--resume-h3" as string]:
                      theme.heading3Color ?? DEFAULT_RESUME_THEME.heading3Color,
              };

    return (
        <div className={styles.root} style={rootStyle}>
            <header className={`${styles.header} ${headerAlign}`}>
                <PreviewHot
                    active={!!previewInteractive}
                    formPath="contact"
                    onActivate={onPreviewFieldRequest}
                >
                    {hasText(name) && (
                        <h1 className={styles.name}>
                            <InlineEditableText
                                active={!!inlineEditable}
                                formPath="contact.name"
                                value={name}
                                placeholder="点击填写姓名"
                                onCommit={onInlineFieldChange}
                            />
                        </h1>
                    )}
                    <div className={`${styles.metaRow} ${metaAlign}`}>
                        {ageLabel && (
                            <InlineEditableText
                                active={!!inlineEditable}
                                formPath="contact.age"
                                value={age}
                                displayValue={ageLabel ?? undefined}
                                placeholder="点击填写年龄"
                                onCommit={onInlineFieldChange}
                            />
                        )}
                        {hasText(phone) && (
                            <span className={styles.metaItem}>
                                <img className={styles.metaIcon} src={PhoneSvg} alt="" />
                                <InlineEditableText
                                    active={!!inlineEditable}
                                    formPath="contact.phone"
                                    value={phone}
                                    placeholder="点击填写电话"
                                    onCommit={onInlineFieldChange}
                                />
                            </span>
                        )}
                        {hasText(email) && (
                            <span className={styles.metaItem}>
                                <img className={styles.metaIcon} src={EmailSvg} alt="" />
                                <InlineEditableText
                                    active={!!inlineEditable}
                                    formPath="contact.email"
                                    value={email}
                                    placeholder="点击填写邮箱"
                                    onCommit={onInlineFieldChange}
                                />
                            </span>
                        )}
                    </div>
                </PreviewHot>
                {hasText(career) && (
                    <PreviewHot
                        active={!!previewInteractive}
                        formPath="contact.career"
                        onActivate={onPreviewFieldRequest}
                    >
                        <div className={styles.intention}>
                            <span className={styles.intentionLabel}>求职意向：</span>
                            <InlineEditableText
                                active={!!inlineEditable}
                                formPath="contact.career"
                                value={career}
                                placeholder="点击填写求职意向"
                                onCommit={onInlineFieldChange}
                                className={styles.inlineFill}
                            />
                        </div>
                    </PreviewHot>
                )}
            </header>

            {bodyOrder.map((id) =>
                renderBodySection(
                    id,
                    resume,
                    !!previewInteractive,
                    !!inlineEditable,
                    onPreviewFieldRequest,
                    onInlineFieldChange,
                    onInlineListRemove,
                ),
            )}
        </div>
    );
};

function WorkBlock(props: {
    job: WorkHistoryType;
    index: number;
    inlineEditable: boolean;
    onInlineEdit?: (formPath: string, value: string) => void;
    onInlineListRemove?: (path: string, index: number) => void;
}) {
    const { job, index, inlineEditable, onInlineEdit, onInlineListRemove } = props;
    if (!hasWorkContent(job)) return null;
    const bullets = visibleIndexedListItems(job.bullets);
    return (
        <div>
            <div className={styles.workHead}>
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
            </div>
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
            {hasText(job.techStack) && !job.hideTechStack && (
                <p className={styles.techLine}>
                    <span className={styles.techLabel}>主要技术栈：</span>
                    <InlineEditableText
                        active={inlineEditable}
                        formPath={`workHistory.${index}.techStack`}
                        value={job.techStack}
                        placeholder="点击填写主要技术栈"
                        onCommit={onInlineEdit}
                        className={styles.inlineFill}
                    />
                </p>
            )}
        </div>
    );
}

function ProjectBlock(props: {
    project: ProjectExperienceType;
    index: number;
    inlineEditable: boolean;
    onInlineEdit?: (formPath: string, value: string) => void;
    onInlineListRemove?: (path: string, index: number) => void;
}) {
    const { project, index, inlineEditable, onInlineEdit, onInlineListRemove } = props;
    if (!hasProjectContent(project)) return null;
    const resultsList = visibleIndexedListItems(normalizeProjectResults(project.results));
    const mainWorkList = visibleIndexedListItems(project.mainWork);
    return (
        <div className={styles.projectBlock}>
            <div className={styles.projectHead}>
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
            </div>
            {hasText(project.introduction) && (
                <>
                    <div className={styles.subLabel}>项目介绍：</div>
                    <p className={styles.paragraph}>
                        <InlineEditableText
                            active={inlineEditable}
                            formPath={`projectExperience.${index}.introduction`}
                            value={project.introduction}
                            placeholder="点击填写项目介绍"
                            onCommit={onInlineEdit}
                            multiline
                            rows={4}
                            className={styles.inlineBlock}
                        />
                    </p>
                </>
            )}
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
        </div>
    );
}

export default Index;
