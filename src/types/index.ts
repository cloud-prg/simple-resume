export type ContactType = Partial<{
    name: string;
    phone: string;
    email: string;
    address: string;
    career: string;
    location: string;
    /** 年龄展示，如 "27" 或 "27岁" */
    age: string;
}>;

export type EducationType = Partial<{
    degree: string;
    major: string;
    school: string;
    startDate: string;
    endDate: string;
    /** 教育阶段补充说明（社团、职务等） */
    description: string;
}>;

/** 工作经历（公司任职），要点列表与表单 simpleList 对齐 */
export type WorkHistoryType = Partial<{
    company: string;
    role: string;
    dateRange: string;
    bullets: { value: string }[];
    techStack: string;
    /** 为 true 时预览与打印中不展示「主要技术栈」一行（表单里仍可填写） */
    hideTechStack?: boolean;
}>;

/** 项目经历 */
export type ProjectExperienceType = Partial<{
    name: string;
    dateRange: string;
    introduction: string;
    mainWork: { value: string }[];
    /** 项目成果，分点与表单 simpleList 对齐 */
    results: { value: string }[];
}>;

/** 旧版数据结构，仅用于导入迁移 */
export type ExperienceType = Partial<{
    company: string;
    project: string;
    career: string;
    startDate: string;
    endDate: string;
    keywords: string[];
    workContent: { value: string }[];
    summary: { value: string }[];
}>;

/** 简历正文模块（不含页眉个人信息），顺序可配置 */
export type ResumeBodySectionId = 'skills' | 'workHistory' | 'projectExperience' | 'education';

/** 页眉个人信息区域水平对齐 */
export type ResumeHeaderLayout = 'left' | 'center' | 'right';

/** 预览与打印中的标题配色与页眉版式 */
export interface ResumeTheme {
    /** 一级标题色（简历姓名） */
    heading1Color?: string;
    /** 二级标题色（如「工作经历」等分块标题） */
    heading2Color?: string;
    /** 三级标题色（子标题、项目名称等强调色） */
    heading3Color?: string;
    /** 页眉个人信息对齐 */
    headerLayout?: ResumeHeaderLayout;
}

export interface ResumeProps {
    name: string;
    contact: ContactType;
    education: EducationType;
    workHistory: WorkHistoryType[];
    projectExperience: ProjectExperienceType[];
    /** 专业技能，每条一行展示 */
    skills: { value: string }[];
    /** 各经历区块在预览中的先后，缺省时由迁移逻辑补全 */
    sectionOrder?: ResumeBodySectionId[];
    /** 标题颜色与页眉布局等展示配置 */
    theme?: ResumeTheme;
    /** @deprecated 旧字段，迁移用 */
    experience?: ExperienceType[];
}
