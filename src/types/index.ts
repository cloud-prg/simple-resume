export type ContactType = Partial<{
    name: string;
    phone: string;
    email: string;
    address: string;
    career: string;
    location: string;
}>

export type EducationType = Partial<{
    degree: string;
    major: string;
    school: string;
    startDate: string;
    endDate: string;
}>

export type ExperienceType = Partial<{
    company: string;
    project: string;
    career: string;
    startDate: string;
    endDate: string;
    keywords: string[];
    workContent: { value: string }[];
    summary: { value: string }[];
}>

export interface ResumeProps {
    name: string;
    contact: ContactType;
    education: EducationType;
    experience: ExperienceType[];
}