import type {
    ExperienceType,
    ProjectExperienceType,
    ResumeBodySectionId,
    ResumeProps,
    WorkHistoryType,
} from '@/types';

/** 默认把专业技能放在最前，其余保持常见顺序 */
export const DEFAULT_SECTION_ORDER: ResumeBodySectionId[] = [
    'skills',
    'workHistory',
    'projectExperience',
    'education',
];

const SECTION_IDS = new Set<ResumeBodySectionId>(DEFAULT_SECTION_ORDER);

function normalizeSectionOrder(raw: unknown): ResumeBodySectionId[] {
    const out: ResumeBodySectionId[] = [];
    if (Array.isArray(raw)) {
        for (const x of raw) {
            if (typeof x === 'string' && SECTION_IDS.has(x as ResumeBodySectionId) && !out.includes(x as ResumeBodySectionId)) {
                out.push(x as ResumeBodySectionId);
            }
        }
    }
    for (const id of DEFAULT_SECTION_ORDER) {
        if (!out.includes(id)) out.push(id);
    }
    return out;
}

/**
 * 教育经历月份控件需要 `YYYY/MM`；纯年份或 `YYYY-M` 等需归一化，否则 Ant DatePicker 会显示 Invalid Date。
 */
function normalizeEduMonthString(raw: unknown, role: 'start' | 'end'): string {
    if (raw == null) return '';
    if (typeof raw === 'object' && raw !== null && typeof (raw as { format?: (f: string) => string }).format === 'function') {
        const d = raw as { format: (f: string) => string };
        return d.format('YYYY/MM');
    }
    const s = String(raw).trim();
    if (!s) return '';
    if (/^\d{4}$/.test(s)) {
        return role === 'start' ? `${s}/09` : `${s}/06`;
    }
    const ym = s.match(/^(\d{4})[-/](\d{1,2})$/);
    if (ym) {
        return `${ym[1]}/${ym[2].padStart(2, '0')}`;
    }
    const iso = s.match(/^(\d{4})-(\d{2})-\d{2}/);
    if (iso) {
        return `${iso[1]}/${iso[2]}`;
    }
    if (/^\d{4}\/\d{2}$/.test(s)) return s;
    return s;
}

const emptyResume = (): ResumeProps => ({
    name: '新模板',
    contact: {
        name: '',
        phone: '',
        email: '',
        career: '',
        age: '',
        location: '',
    },
    education: {
        school: '',
        degree: '',
        major: '',
        startDate: '',
        endDate: '',
        description: '',
    },
    workHistory: [],
    projectExperience: [],
    skills: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
});

function fromLegacyExperience(exp: ExperienceType[]): WorkHistoryType[] {
    return exp.map((e) => ({
        company: e.company || '',
        role: e.career || '',
        dateRange: [e.startDate, e.endDate].filter(Boolean).join('-').replace(/\//g, '.'),
        bullets: (e.workContent || []).map((w) => ({ value: w?.value || '' })),
        techStack: Array.isArray(e.keywords) ? e.keywords.join('，') : '',
        hideTechStack: false,
    }));
}

function normalizeWorkHistoryItem(raw: WorkHistoryType): WorkHistoryType {
    return {
        ...raw,
        hideTechStack: raw.hideTechStack === true,
    };
}

/** 旧版项目成果为整段 string，新版为分点列表；预览与迁移共用 */
export function normalizeProjectResults(raw: unknown): { value: string }[] {
    if (Array.isArray(raw)) {
        return raw.map((item) => {
            if (typeof item === 'string') return { value: item };
            if (item && typeof item === 'object' && 'value' in item) {
                const v = (item as { value?: unknown }).value;
                return { value: typeof v === 'string' ? v : '' };
            }
            return { value: '' };
        });
    }
    if (typeof raw === 'string') {
        const t = raw.trim();
        if (!t) return [];
        const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length > 1) return lines.map((value) => ({ value }));
        return [{ value: t }];
    }
    return [];
}

function normalizeProjectExperienceItem(raw: ProjectExperienceType): ProjectExperienceType {
    return {
        ...raw,
        results: normalizeProjectResults(raw.results),
    };
}

/** 将本地存储或导入的任意结构规范为当前 ResumeProps */
export function migrateResume(raw: unknown): ResumeProps {
    if (!raw || typeof raw !== 'object') {
        return emptyResume();
    }
    const d = raw as Record<string, unknown>;

    const contact = {
        ...(typeof d.contact === 'object' && d.contact ? (d.contact as object) : {}),
    } as ResumeProps['contact'];

    const educationRaw = {
        ...(typeof d.education === 'object' && d.education ? (d.education as object) : {}),
    } as ResumeProps['education'];
    const education = {
        ...educationRaw,
        startDate: normalizeEduMonthString(educationRaw.startDate, 'start'),
        endDate: normalizeEduMonthString(educationRaw.endDate, 'end'),
    };

    let skills: { value: string }[] = [];
    if (Array.isArray(d.skills) && d.skills.length) {
        const first = d.skills[0] as unknown;
        if (typeof first === 'string') {
            skills = (d.skills as string[]).map((s) => ({ value: s }));
        } else {
            skills = (d.skills as { value: string }[]).map((s) => ({
                value: typeof s?.value === 'string' ? s.value : '',
            }));
        }
    }

    let workHistory = Array.isArray(d.workHistory)
        ? (d.workHistory as WorkHistoryType[]).map(normalizeWorkHistoryItem)
        : [];
    let projectExperience = Array.isArray(d.projectExperience)
        ? (d.projectExperience as ProjectExperienceType[]).map(normalizeProjectExperienceItem)
        : [];

    const legacy = Array.isArray(d.experience) ? (d.experience as ExperienceType[]) : [];
    const shouldMigrateLegacy =
        legacy.length > 0 && workHistory.length === 0 && projectExperience.length === 0;

    if (shouldMigrateLegacy) {
        workHistory = fromLegacyExperience(legacy);
    }

    const sectionOrder = normalizeSectionOrder(d.sectionOrder);

    return {
        name: typeof d.name === 'string' && d.name ? d.name : emptyResume().name,
        contact: { ...emptyResume().contact, ...contact },
        education: { ...emptyResume().education, ...education },
        workHistory,
        projectExperience,
        skills,
        sectionOrder,
    };
}

export function migrateResumeList(list: unknown): ResumeProps[] {
    if (!Array.isArray(list)) {
        return [];
    }
    return list.map((item) => migrateResume(item));
}
