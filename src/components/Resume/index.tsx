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
    /** 为 true 时预览区可点击，打开编辑并滚动到对应表单项 */
    previewInteractive?: boolean;
    /** 点击预览区块时传出表单字段路径（供 form-render scrollToPath） */
    onPreviewFieldRequest?: (formPath: string) => void;
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
            onClick={(e) => {
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
    onActivate?: (formPath: string) => void,
): React.ReactNode {
    const { workHistory, projectExperience, skills, education } = data;
    const { degree, major, school, description } = education;

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
                            <WorkBlock key={`${job.company}-${idx}`} job={job} />
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
                            <ProjectBlock key={`${pj.name}-${idx}`} project={pj} />
                        ))}
                    </section>
                </PreviewHot>
            );
        case 'education':
            if (!school) return null;
            return (
                <PreviewHot key="education" active={!!interactive} formPath="education" onActivate={onActivate}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>教育经历</h2>
                        <hr className={styles.rule} />
                        <div className={styles.eduRow}>
                            <span className={styles.eduSchool}>{school}</span>
                            <span className={styles.eduMid}>
                                {[degree, major].filter(Boolean).join('　')}
                            </span>
                            <span className={styles.eduDates}>{formatEduRange(education)}</span>
                        </div>
                        {description?.trim() && <p className={styles.paragraph}>{description}</p>}
                    </section>
                </PreviewHot>
            );
        case 'skills':
            if (!skills?.length || !skills.some((s) => s?.value?.trim())) return null;
            return (
                <PreviewHot key="skills" active={!!interactive} formPath="skills" onActivate={onActivate}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>专业技能</h2>
                        <hr className={styles.rule} />
                        <ul className={styles.squareList}>
                            {skills.map((s, i) =>
                                s?.value?.trim() ? (
                                    <li key={i}>{s.value}</li>
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
    const { previewInteractive, onPreviewFieldRequest, ...resume } = props;
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
                    <h1 className={styles.name}>{name || '姓名'}</h1>
                    <div className={`${styles.metaRow} ${metaAlign}`}>
                        {ageLabel && <span>{ageLabel}</span>}
                        {phone && (
                            <span className={styles.metaItem}>
                                <img className={styles.metaIcon} src={PhoneSvg} alt="" />
                                <span>{phone}</span>
                            </span>
                        )}
                        {email && (
                            <span className={styles.metaItem}>
                                <img className={styles.metaIcon} src={EmailSvg} alt="" />
                                <span>{email}</span>
                            </span>
                        )}
                    </div>
                </PreviewHot>
                {career && (
                    <PreviewHot
                        active={!!previewInteractive}
                        formPath="contact.career"
                        onActivate={onPreviewFieldRequest}
                    >
                        <div className={styles.intention}>
                            求职意向：<span>{career}</span>
                        </div>
                    </PreviewHot>
                )}
            </header>

            {bodyOrder.map((id) =>
                renderBodySection(id, resume, !!previewInteractive, onPreviewFieldRequest),
            )}
        </div>
    );
};

function WorkBlock({ job }: { job: WorkHistoryType }) {
    if (!job.company && !job.role && !job.dateRange) return null;
    return (
        <div>
            <div className={styles.workHead}>
                <div className={styles.workCompany}>{job.company}</div>
                <div className={styles.workRole}>{job.role}</div>
                <div className={styles.workWhen}>{job.dateRange}</div>
            </div>
            {job.bullets && job.bullets.some((b) => b?.value?.trim()) && (
                <ul className={styles.squareList}>
                    {job.bullets.map((b, i) =>
                        b?.value?.trim() ? <li key={i}>{b.value}</li> : null,
                    )}
                </ul>
            )}
            {job.techStack?.trim() && !job.hideTechStack && (
                <p className={styles.techLine}>
                    <span className={styles.techLabel}>主要技术栈：</span>
                    {job.techStack}
                </p>
            )}
        </div>
    );
}

function ProjectBlock({ project }: { project: ProjectExperienceType }) {
    if (!project.name && !project.dateRange) return null;
    const resultsList = normalizeProjectResults(project.results);
    return (
        <div className={styles.projectBlock}>
            <div className={styles.projectHead}>
                <span className={styles.projectName}>{project.name}</span>
                <span className={styles.projectWhen}>{project.dateRange}</span>
            </div>
            {project.introduction?.trim() && (
                <>
                    <div className={styles.subLabel}>项目介绍：</div>
                    <p className={styles.paragraph}>{project.introduction}</p>
                </>
            )}
            {project.mainWork && project.mainWork.some((m) => m?.value?.trim()) && (
                <>
                    <div className={styles.subLabel}>主要工作：</div>
                    <ol className={styles.numbered}>
                        {project.mainWork.map((m, i) =>
                            m?.value?.trim() ? <li key={i}>{m.value}</li> : null,
                        )}
                    </ol>
                </>
            )}
            {resultsList.some((r) => r?.value?.trim()) && (
                <>
                    <div className={styles.subLabel}>项目成果：</div>
                    <ul className={styles.squareList}>
                        {resultsList.map((r, i) =>
                            r?.value?.trim() ? <li key={i}>{r.value}</li> : null,
                        )}
                    </ul>
                </>
            )}
        </div>
    );
}

export default Index;
