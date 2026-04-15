import type {
    EducationType,
    ProjectExperienceType,
    ResumeBodySectionId,
    ResumeProps,
    WorkHistoryType,
} from '@/types';
import { DEFAULT_SECTION_ORDER, normalizeProjectResults } from '@/util/resumeMigrate';
import React from 'react';
import EmailSvg from '@/assets/email.svg';
import PhoneSvg from '@/assets/phone.svg';
import styles from './index.module.css';

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

function renderBodySection(
    id: ResumeBodySectionId,
    props: ResumeProps,
): React.ReactNode {
    const { workHistory, projectExperience, skills, education } = props;
    const { degree, major, school, description } = education;

    switch (id) {
        case 'workHistory':
            if (!workHistory?.length) return null;
            return (
                <section key="workHistory" className={styles.section}>
                    <h2 className={styles.sectionTitle}>工作经历</h2>
                    <hr className={styles.rule} />
                    {workHistory.map((job, idx) => (
                        <WorkBlock key={`${job.company}-${idx}`} job={job} />
                    ))}
                </section>
            );
        case 'projectExperience':
            if (!projectExperience?.length) return null;
            return (
                <section key="projectExperience" className={styles.section}>
                    <h2 className={styles.sectionTitle}>项目经历</h2>
                    <hr className={styles.rule} />
                    {projectExperience.map((pj, idx) => (
                        <ProjectBlock key={`${pj.name}-${idx}`} project={pj} />
                    ))}
                </section>
            );
        case 'education':
            if (!school) return null;
            return (
                <section key="education" className={styles.section}>
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
            );
        case 'skills':
            if (!skills?.length || !skills.some((s) => s?.value?.trim())) return null;
            return (
                <section key="skills" className={styles.section}>
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
            );
        default:
            return null;
    }
}

const Index: React.FC<ResumeProps> = (props) => {
    const { contact, sectionOrder } = props;
    const { name, phone, email, career, age } = contact;
    const ageLabel = renderAge(age);
    const order = sectionOrder?.length ? sectionOrder : DEFAULT_SECTION_ORDER;

    return (
        <div className={styles.root}>
            <header className={styles.header}>
                <h1 className={styles.name}>{name || '姓名'}</h1>
                <div className={styles.metaRow}>
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
                {career && (
                    <div className={styles.intention}>
                        求职意向：<span>{career}</span>
                    </div>
                )}
            </header>

            {order.map((id) => renderBodySection(id, props))}
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
