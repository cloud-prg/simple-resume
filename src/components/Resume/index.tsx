import type {
    EducationType,
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
};

function formatEduRange(edu: EducationType): string {
    const a = (edu.startDate || '').replace(/\//g, '.');
    const b = (edu.endDate || '').replace(/\//g, '.');
    if (a && b) return `${a}-${b}`;
    return a || b || '';
}

function renderAge(age?: string): string | null {
    if (!age?.trim()) return null;
    const t = age.trim();
    return t.includes('岁') ? `年龄：${t}` : `年龄：${t}岁`;
}

function hasText(value?: string | null): boolean {
    return typeof value === 'string' && value.trim().length > 0;
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
): React.ReactNode {
    const { workHistory, projectExperience, skills, education } = data;
    const { degree, major, school, description, startDate, endDate } = education;

    switch (id) {
        case 'workHistory':
            if (!workHistory?.length) return null;
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
                        {workHistory.map((job, idx) => (
                            <WorkBlock
                                key={`${job.company}-${idx}`}
                                job={job}
                                index={idx}
                                inlineEditable={inlineEditable}
                                onInlineEdit={onInlineEdit}
                            />
                        ))}
                    </section>
                </PreviewHot>
            );
        case 'projectExperience':
            if (!projectExperience?.length) return null;
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
                        {projectExperience.map((pj, idx) => (
                            <ProjectBlock
                                key={`${pj.name}-${idx}`}
                                project={pj}
                                index={idx}
                                inlineEditable={inlineEditable}
                                onInlineEdit={onInlineEdit}
                            />
                        ))}
                    </section>
                </PreviewHot>
            );
        case 'education':
            if (![school, degree, major, startDate, endDate, description].some(hasText)) return null;
            return (
                <PreviewHot key="education" active={!!interactive} formPath="education" onActivate={onActivate}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>教育经历</h2>
                        <hr className={styles.rule} />
                        <div className={styles.eduRow}>
                            <span className={styles.eduSchool}>
                                <InlineEditableText
                                    active={inlineEditable}
                                    formPath="education.school"
                                    value={school}
                                    placeholder="点击填写学校"
                                    onCommit={onInlineEdit}
                                />
                            </span>
                            <span className={styles.eduMid}>
                                <InlineEditableText
                                    active={inlineEditable}
                                    formPath="education.degree"
                                    value={degree}
                                    placeholder="学历"
                                    onCommit={onInlineEdit}
                                />
                                {(hasText(degree) || inlineEditable) && (hasText(major) || inlineEditable) && '　'}
                                <InlineEditableText
                                    active={inlineEditable}
                                    formPath="education.major"
                                    value={major}
                                    placeholder="专业"
                                    onCommit={onInlineEdit}
                                />
                            </span>
                            <span className={styles.eduDates}>
                                <InlineEditableText
                                    active={inlineEditable}
                                    formPath="education.startDate"
                                    value={startDate}
                                    placeholder="开始时间"
                                    onCommit={onInlineEdit}
                                />
                                <span className={styles.inlineSeparator}>-</span>
                                <InlineEditableText
                                    active={inlineEditable}
                                    formPath="education.endDate"
                                    value={endDate}
                                    placeholder="结束时间"
                                    onCommit={onInlineEdit}
                                />
                            </span>
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
        case 'skills':
            if (!skills?.length || !skills.some((s) => hasText(s?.value) || inlineEditable)) return null;
            return (
                <PreviewHot key="skills" active={!!interactive} formPath="skills" onActivate={onActivate}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>专业技能</h2>
                        <hr className={styles.rule} />
                        <ul className={styles.squareList}>
                            {skills.map((s, i) =>
                                hasText(s?.value) || inlineEditable ? (
                                    <li key={i}>
                                        <InlineEditableText
                                            active={inlineEditable}
                                            formPath={`skills.${i}.value`}
                                            value={s?.value}
                                            placeholder="点击填写技能"
                                            onCommit={onInlineEdit}
                                            multiline
                                            rows={3}
                                        />
                                    </li>
                                ) : null,
                            )}
                        </ul>
                    </section>
                </PreviewHot>
            );
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
    const { previewInteractive, onPreviewFieldRequest, inlineEditable, onInlineFieldChange, ...resume } = props;
    const { mode: appAppearance } = useAppearance();
    const { contact, sectionOrder, theme: themeRaw } = resume;
    const { name, phone, email, career, age } = contact;
    const ageLabel = renderAge(age);
    const bodyOrder = sectionOrder?.length ? sectionOrder : DEFAULT_SECTION_ORDER;
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
                    <h1 className={styles.name}>
                        <InlineEditableText
                            active={!!inlineEditable}
                            formPath="contact.name"
                            value={name}
                            placeholder="点击填写姓名"
                            onCommit={onInlineFieldChange}
                        />
                    </h1>
                    <div className={`${styles.metaRow} ${metaAlign}`}>
                        {(ageLabel || inlineEditable) && (
                            <InlineEditableText
                                active={!!inlineEditable}
                                formPath="contact.age"
                                value={age}
                                displayValue={ageLabel ?? undefined}
                                placeholder="点击填写年龄"
                                onCommit={onInlineFieldChange}
                            />
                        )}
                        {(phone || inlineEditable) && (
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
                        {(email || inlineEditable) && (
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
                {(career || inlineEditable) && (
                    <PreviewHot
                        active={!!previewInteractive}
                        formPath="contact.career"
                        onActivate={onPreviewFieldRequest}
                    >
                        <div className={styles.intention}>
                            求职意向：
                            <InlineEditableText
                                active={!!inlineEditable}
                                formPath="contact.career"
                                value={career}
                                placeholder="点击填写求职意向"
                                onCommit={onInlineFieldChange}
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
}) {
    const { job, index, inlineEditable, onInlineEdit } = props;
    if (!job.company && !job.role && !job.dateRange) return null;
    const visibleBullets = (job.bullets ?? []).filter((bullet) => hasText(bullet?.value) || inlineEditable);
    return (
        <div>
            <div className={styles.workHead}>
                <div className={styles.workCompany}>
                    <InlineEditableText
                        active={inlineEditable}
                        formPath={`workHistory.${index}.company`}
                        value={job.company}
                        placeholder="公司名称"
                        onCommit={onInlineEdit}
                    />
                </div>
                <div className={styles.workRole}>
                    <InlineEditableText
                        active={inlineEditable}
                        formPath={`workHistory.${index}.role`}
                        value={job.role}
                        placeholder="岗位名称"
                        onCommit={onInlineEdit}
                    />
                </div>
                <div className={styles.workWhen}>
                    <InlineEditableText
                        active={inlineEditable}
                        formPath={`workHistory.${index}.dateRange`}
                        value={job.dateRange}
                        placeholder="在职时间"
                        onCommit={onInlineEdit}
                    />
                </div>
            </div>
            {visibleBullets.length > 0 && (
                <ul className={styles.squareList}>
                    {(job.bullets ?? []).map((b, i) =>
                        hasText(b?.value) || inlineEditable ? (
                            <li key={i}>
                                <InlineEditableText
                                    active={inlineEditable}
                                    formPath={`workHistory.${index}.bullets.${i}.value`}
                                    value={b?.value}
                                    placeholder="点击填写工作要点"
                                    onCommit={onInlineEdit}
                                    multiline
                                    rows={2}
                                />
                            </li>
                        ) : null,
                    )}
                </ul>
            )}
            {(hasText(job.techStack) || inlineEditable) && !job.hideTechStack && (
                <p className={styles.techLine}>
                    <span className={styles.techLabel}>主要技术栈：</span>
                    <InlineEditableText
                        active={inlineEditable}
                        formPath={`workHistory.${index}.techStack`}
                        value={job.techStack}
                        placeholder="点击填写主要技术栈"
                        onCommit={onInlineEdit}
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
}) {
    const { project, index, inlineEditable, onInlineEdit } = props;
    if (!project.name && !project.dateRange) return null;
    const resultsList = normalizeProjectResults(project.results);
    const mainWorkList = project.mainWork ?? [];
    return (
        <div className={styles.projectBlock}>
            <div className={styles.projectHead}>
                <span className={styles.projectName}>
                    <InlineEditableText
                        active={inlineEditable}
                        formPath={`projectExperience.${index}.name`}
                        value={project.name}
                        placeholder="项目名称"
                        onCommit={onInlineEdit}
                    />
                </span>
                <span className={styles.projectWhen}>
                    <InlineEditableText
                        active={inlineEditable}
                        formPath={`projectExperience.${index}.dateRange`}
                        value={project.dateRange}
                        placeholder="项目时间"
                        onCommit={onInlineEdit}
                    />
                </span>
            </div>
            {(hasText(project.introduction) || inlineEditable) && (
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
            {mainWorkList.some((m) => hasText(m?.value) || inlineEditable) && (
                <>
                    <div className={styles.subLabel}>主要工作：</div>
                    <ol className={styles.numbered}>
                        {mainWorkList.map((m, i) =>
                            hasText(m?.value) || inlineEditable ? (
                                <li key={i}>
                                    <InlineEditableText
                                        active={inlineEditable}
                                        formPath={`projectExperience.${index}.mainWork.${i}.value`}
                                        value={m?.value}
                                        placeholder="点击填写主要工作"
                                        onCommit={onInlineEdit}
                                        multiline
                                        rows={3}
                                    />
                                </li>
                            ) : null,
                        )}
                    </ol>
                </>
            )}
            {resultsList.some((r) => hasText(r?.value) || inlineEditable) && (
                <>
                    <div className={styles.subLabel}>项目成果：</div>
                    <ul className={styles.squareList}>
                        {resultsList.map((r, i) =>
                            hasText(r?.value) || inlineEditable ? (
                                <li key={i}>
                                    <InlineEditableText
                                        active={inlineEditable}
                                        formPath={`projectExperience.${index}.results.${i}.value`}
                                        value={r?.value}
                                        placeholder="点击填写项目成果"
                                        onCommit={onInlineEdit}
                                        multiline
                                        rows={3}
                                    />
                                </li>
                            ) : null,
                        )}
                    </ul>
                </>
            )}
        </div>
    );
}

export default Index;
