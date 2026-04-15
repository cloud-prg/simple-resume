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
import './resume-print.css';

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
                <section key="workHistory" className="resume-doc__section">
                    <h2 className="resume-doc__sectionTitle">工作经历</h2>
                    <hr className="resume-doc__rule" />
                    {workHistory.map((job, idx) => (
                        <WorkBlock key={`${job.company}-${idx}`} job={job} />
                    ))}
                </section>
            );
        case 'projectExperience':
            if (!projectExperience?.length) return null;
            return (
                <section key="projectExperience" className="resume-doc__section">
                    <h2 className="resume-doc__sectionTitle">项目经历</h2>
                    <hr className="resume-doc__rule" />
                    {projectExperience.map((pj, idx) => (
                        <ProjectBlock key={`${pj.name}-${idx}`} project={pj} />
                    ))}
                </section>
            );
        case 'education':
            if (!school) return null;
            return (
                <section key="education" className="resume-doc__section">
                    <h2 className="resume-doc__sectionTitle">教育经历</h2>
                    <hr className="resume-doc__rule" />
                    <div className="resume-doc__eduRow">
                        <span className="resume-doc__eduSchool">{school}</span>
                        <span className="resume-doc__eduMid">
                            {[degree, major].filter(Boolean).join('　')}
                        </span>
                        <span className="resume-doc__eduDates">{formatEduRange(education)}</span>
                    </div>
                    {description?.trim() && <p className="resume-doc__paragraph">{description}</p>}
                </section>
            );
        case 'skills':
            if (!skills?.length || !skills.some((s) => s?.value?.trim())) return null;
            return (
                <section key="skills" className="resume-doc__section">
                    <h2 className="resume-doc__sectionTitle">专业技能</h2>
                    <hr className="resume-doc__rule" />
                    <ul className="resume-doc__squareList">
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
        <div className="resume-doc">
            <header className="resume-doc__header">
                <h1 className="resume-doc__name">{name || '姓名'}</h1>
                <div className="resume-doc__metaRow">
                    {ageLabel && <span>{ageLabel}</span>}
                    {phone && (
                        <span className="resume-doc__metaItem">
                            <img className="resume-doc__metaIcon" src={PhoneSvg} alt="" />
                            <span>{phone}</span>
                        </span>
                    )}
                    {email && (
                        <span className="resume-doc__metaItem">
                            <img className="resume-doc__metaIcon" src={EmailSvg} alt="" />
                            <span>{email}</span>
                        </span>
                    )}
                </div>
                {career && (
                    <div className="resume-doc__intention">
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
            <div className="resume-doc__workHead">
                <div className="resume-doc__workCompany">{job.company}</div>
                <div className="resume-doc__workRole">{job.role}</div>
                <div className="resume-doc__workWhen">{job.dateRange}</div>
            </div>
            {job.bullets && job.bullets.some((b) => b?.value?.trim()) && (
                <ul className="resume-doc__squareList">
                    {job.bullets.map((b, i) =>
                        b?.value?.trim() ? <li key={i}>{b.value}</li> : null,
                    )}
                </ul>
            )}
            {job.techStack?.trim() && !job.hideTechStack && (
                <p className="resume-doc__techLine">
                    <span className="resume-doc__techLabel">主要技术栈：</span>
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
        <div className="resume-doc__projectBlock">
            <div className="resume-doc__projectHead">
                <span className="resume-doc__projectName">{project.name}</span>
                <span className="resume-doc__projectWhen">{project.dateRange}</span>
            </div>
            {project.introduction?.trim() && (
                <>
                    <div className="resume-doc__subLabel">项目介绍：</div>
                    <p className="resume-doc__paragraph">{project.introduction}</p>
                </>
            )}
            {project.mainWork && project.mainWork.some((m) => m?.value?.trim()) && (
                <>
                    <div className="resume-doc__subLabel">主要工作：</div>
                    <ol className="resume-doc__numbered">
                        {project.mainWork.map((m, i) =>
                            m?.value?.trim() ? <li key={i}>{m.value}</li> : null,
                        )}
                    </ol>
                </>
            )}
            {resultsList.some((r) => r?.value?.trim()) && (
                <>
                    <div className="resume-doc__subLabel">项目成果：</div>
                    <ul className="resume-doc__squareList">
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
