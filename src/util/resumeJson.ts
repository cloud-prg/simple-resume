/** 顶层出现任一字段即视为简历对象，其余宽松结构交给 migrateResume */
const RESUME_FIELD_KEYS = [
    'name',
    'contact',
    'education',
    'workHistory',
    'projectExperience',
    'skills',
    'experience',
    'sectionTitles',
    'sectionLabels',
    'customSections',
    'sectionOrder',
    'hiddenSections',
    'theme',
] as const;

function stripBom(raw: string): string {
    return raw.replace(/^\uFEFF/, '').trim();
}

/** 去掉模型常见的 ```json 围栏；没有围栏时原样返回 */
function unwrapFence(text: string): string {
    const fenced = text.match(/```(?:json|JSON)?\s*\n?([\s\S]*?)\n?```/);
    if (fenced?.[1]) {
        return fenced[1].trim();
    }
    return text.trim();
}

function sliceOuterJson(text: string): string {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
        return text.slice(start, end + 1);
    }
    return text;
}

/**
 * 解析粘贴或文件中的 JSON。
 * 允许未缩进的 JSON，也允许被 Markdown 代码块或少量说明文字包住。
 */
export function parseResumeJsonText(raw: string): unknown {
    const primary = unwrapFence(stripBom(raw));
    try {
        return JSON.parse(primary);
    } catch (error) {
        const sliced = sliceOuterJson(primary);
        if (sliced !== primary) {
            return JSON.parse(sliced);
        }
        throw error;
    }
}

/** 能解析时返回缩进后的 JSON，否则返回 null */
export function tryPrettyPrintJson(raw: string): string | null {
    if (!raw.trim()) return null;
    try {
        return JSON.stringify(parseResumeJsonText(raw), null, 2);
    } catch {
        return null;
    }
}

/** 根节点必须是对象，且至少带一个简历字段 */
export function isResumeLikeObject(value: unknown): value is Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return RESUME_FIELD_KEYS.some((key) => key in record);
}
