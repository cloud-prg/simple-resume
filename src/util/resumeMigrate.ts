import type {
    CustomResumeSection,
    CustomResumeSectionItem,
    CustomSectionDisplayMode,
    ExperienceType,
    ProjectExperienceType,
    ResumeBodySectionId,
    ResumeSectionId,
    ResumeSectionLabelKey,
    ResumeSectionLabelMap,
    ResumeSectionTitleMap,
    ResumeHeaderLayout,
    ResumeProps,
    ResumeTheme,
    WorkHistoryType,
} from '@/types';

/** 标题与页眉默认主题（可被单份简历覆盖） */
export const DEFAULT_RESUME_THEME: ResumeTheme = {
    heading1Color: '#0f172a',
    heading2Color: '#111827',
    heading3Color: '#1e40af',
    headerLayout: 'center',
};

function normalizeTheme(raw: unknown): ResumeTheme {
    const base: ResumeTheme = { ...DEFAULT_RESUME_THEME };
    if (!raw || typeof raw !== 'object') {
        return base;
    }
    const t = raw as Record<string, unknown>;
    const layout = t.headerLayout;
    const headerLayout: ResumeHeaderLayout =
        layout === 'left' || layout === 'right' || layout === 'center' ? layout : 'center';
    const pickColor = (v: unknown, fallback: string) =>
        typeof v === 'string' && v.trim() ? v.trim() : fallback;
    return {
        heading1Color: pickColor(t.heading1Color, base.heading1Color!),
        heading2Color: pickColor(t.heading2Color, base.heading2Color!),
        heading3Color: pickColor(t.heading3Color, base.heading3Color!),
        headerLayout,
    };
}

/** 默认把个人优势放在最前，其余保持常见顺序 */
export const DEFAULT_SECTION_ORDER: ResumeBodySectionId[] = [
    'skills',
    'workHistory',
    'projectExperience',
    'education',
];

export const DEFAULT_SECTION_TITLES: Record<ResumeBodySectionId, string> = {
    skills: '个人优势',
    workHistory: '工作经历',
    projectExperience: '项目经历',
    education: '教育经历',
};

export const DEFAULT_SECTION_LABELS: Record<ResumeSectionLabelKey, string> = {
    'workHistory.techStack': '主要技术栈',
    'projectExperience.introduction': '项目介绍',
    'projectExperience.mainWork': '主要工作',
    'projectExperience.results': '项目成果',
};

const SECTION_IDS = new Set<ResumeBodySectionId>(DEFAULT_SECTION_ORDER);
const SECTION_LABEL_KEYS = new Set<ResumeSectionLabelKey>(
    Object.keys(DEFAULT_SECTION_LABELS) as ResumeSectionLabelKey[],
);

function makeCustomSectionRef(id: string): `custom:${string}` {
    return `custom:${id}`;
}

function isCustomSectionRef(value: string): value is `custom:${string}` {
    return value.startsWith('custom:') && value.slice('custom:'.length).trim().length > 0;
}

function normalizeSectionOrder(raw: unknown, customSections: CustomResumeSection[]): ResumeSectionId[] {
    const out: ResumeSectionId[] = [];
    const customRefs = new Set(customSections.map((section) => makeCustomSectionRef(section.id)));
    if (Array.isArray(raw)) {
        for (const x of raw) {
            if (typeof x === 'string' && SECTION_IDS.has(x as ResumeBodySectionId) && !out.includes(x as ResumeBodySectionId)) {
                out.push(x as ResumeBodySectionId);
            } else if (typeof x === 'string' && isCustomSectionRef(x) && customRefs.has(x) && !out.includes(x)) {
                out.push(x);
            }
        }
    }
    for (const id of DEFAULT_SECTION_ORDER) {
        if (!out.includes(id)) out.push(id);
    }
    for (const section of customSections) {
        const ref = makeCustomSectionRef(section.id);
        if (!out.includes(ref)) out.push(ref);
    }
    return out;
}

function normalizeHiddenSections(raw: unknown, customSections: CustomResumeSection[]): ResumeSectionId[] {
    const out: ResumeSectionId[] = [];
    const customRefs = new Set(customSections.map((section) => makeCustomSectionRef(section.id)));
    if (!Array.isArray(raw)) {
        return out;
    }
    for (const x of raw) {
        if (typeof x === 'string' && SECTION_IDS.has(x as ResumeBodySectionId) && !out.includes(x as ResumeBodySectionId)) {
            out.push(x as ResumeBodySectionId);
        } else if (typeof x === 'string' && isCustomSectionRef(x) && customRefs.has(x) && !out.includes(x)) {
            out.push(x);
        }
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
    sectionTitles: {},
    sectionLabels: {},
    customSections: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
    hiddenSections: [],
    theme: { ...DEFAULT_RESUME_THEME },
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

function normalizeString(raw: unknown): string {
    return typeof raw === 'string' ? raw : '';
}

function normalizeIdPart(raw: unknown, fallback: string): string {
    const source = typeof raw === 'string' && raw.trim() ? raw.trim() : fallback;
    const sanitized = source
        .replace(/^custom:/, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48);
    return sanitized || fallback;
}

function normalizeSectionTitles(raw: unknown): ResumeSectionTitleMap {
    const out: ResumeSectionTitleMap = {};
    if (!raw || typeof raw !== 'object') return out;
    const map = raw as Record<string, unknown>;
    for (const id of DEFAULT_SECTION_ORDER) {
        const value = map[id];
        if (typeof value === 'string' && value.trim()) {
            out[id] = value.trim();
        }
    }
    return out;
}

function normalizeSectionLabels(raw: unknown): ResumeSectionLabelMap {
    const out: ResumeSectionLabelMap = {};
    if (!raw || typeof raw !== 'object') return out;
    const map = raw as Record<string, unknown>;
    for (const key of SECTION_LABEL_KEYS) {
        const value = map[key];
        if (typeof value === 'string' && value.trim()) {
            out[key] = value.trim();
        }
    }
    return out;
}

function normalizeCustomSectionItem(raw: unknown): CustomResumeSectionItem {
    if (!raw || typeof raw !== 'object') {
        return { value: normalizeString(raw) };
    }
    const item = raw as Record<string, unknown>;
    return {
        value: normalizeString(item.value),
        title: normalizeString(item.title),
        description: normalizeString(item.description),
    };
}

function normalizeCustomSections(raw: unknown): CustomResumeSection[] {
    if (!Array.isArray(raw)) return [];
    const usedIds = new Set<string>();
    return raw.map((entry, index) => {
        const source = entry && typeof entry === 'object' ? (entry as Record<string, unknown>) : {};
        let id = normalizeIdPart(source.id, `section-${index + 1}`);
        if (usedIds.has(id)) {
            id = normalizeIdPart(`${id}-${index + 1}`, `section-${index + 1}`);
        }
        usedIds.add(id);

        const displayMode: CustomSectionDisplayMode =
            source.displayMode === 'titled' ? 'titled' : 'plain';
        const items = Array.isArray(source.items)
            ? source.items.map(normalizeCustomSectionItem)
            : [];

        return {
            id,
            title: typeof source.title === 'string' && source.title.trim() ? source.title.trim() : '自定义模块',
            displayMode,
            items,
        };
    });
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
    const projectExperience = Array.isArray(d.projectExperience)
        ? (d.projectExperience as ProjectExperienceType[]).map(normalizeProjectExperienceItem)
        : [];
    const customSections = normalizeCustomSections(d.customSections);

    const legacy = Array.isArray(d.experience) ? (d.experience as ExperienceType[]) : [];
    const shouldMigrateLegacy =
        legacy.length > 0 && workHistory.length === 0 && projectExperience.length === 0;

    if (shouldMigrateLegacy) {
        workHistory = fromLegacyExperience(legacy);
    }

    const sectionTitles = normalizeSectionTitles(d.sectionTitles);
    const sectionLabels = normalizeSectionLabels(d.sectionLabels);
    const sectionOrder = normalizeSectionOrder(d.sectionOrder, customSections);
    const hiddenSections = normalizeHiddenSections(d.hiddenSections, customSections);
    const theme = normalizeTheme(d.theme);

    return {
        name: typeof d.name === 'string' && d.name ? d.name : emptyResume().name,
        contact: { ...emptyResume().contact, ...contact },
        education: { ...emptyResume().education, ...education },
        workHistory,
        projectExperience,
        skills,
        sectionTitles,
        sectionLabels,
        customSections,
        sectionOrder,
        hiddenSections,
        theme,
    };
}

export function migrateResumeList(list: unknown): ResumeProps[] {
    if (!Array.isArray(list)) {
        return [];
    }
    return list.map((item) => migrateResume(item));
}
