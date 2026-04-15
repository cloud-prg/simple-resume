const listItem = {
    type: "object",
    properties: {
        value: {
            type: "string",
            widget: "input",
            props: {
                style: { width: "100%", minWidth: 0, boxSizing: "border-box" },
            },
            placeholder: "请输入内容",
        },
    },
};

const listItemLong = {
    type: "object",
    properties: {
        value: {
            type: "string",
            widget: "textArea",
            props: {
                rows: 3,
                style: { width: "100%", minWidth: 0, boxSizing: "border-box" },
            },
            placeholder: "请输入内容",
        },
    },
};

const resumeFormSchema = {
    displayType: "row",
    column: 3,
    properties: {
        name: {
            type: "string",
            title: "模板名称",
            widget: "input",
            required: true,
            props: { maxLength: 24 },
            placeholder: "用于侧栏区分多份简历",
        },
        theme: {
            type: "object",
            title: "版式与主题",
            properties: {
                headerLayout: {
                    title: "页眉个人信息对齐",
                    type: "string",
                    widget: "select",
                    enum: ["left", "center", "right"],
                    enumNames: ["居左", "居中", "居右"],
                    default: "center",
                },
                heading1Color: {
                    title: "一级标题色（姓名）",
                    type: "string",
                    widget: "colorHex",
                    default: "#0f172a",
                },
                heading2Color: {
                    title: "二级标题色（分块标题）",
                    type: "string",
                    widget: "colorHex",
                    default: "#111827",
                },
                heading3Color: {
                    title: "三级标题色（子标题/强调）",
                    type: "string",
                    widget: "colorHex",
                    default: "#1e40af",
                },
            },
        },
        contact: {
            type: "object",
            title: "个人信息",
            properties: {
                name: {
                    title: "姓名",
                    type: "string",
                    widget: "input",
                    required: true,
                    placeholder: "简历标题姓名",
                },
                age: {
                    title: "年龄",
                    type: "string",
                    widget: "input",
                    placeholder: "如 27 或 27岁",
                },
                phone: {
                    title: "电话",
                    type: "string",
                    widget: "input",
                    required: true,
                    placeholder: "手机号",
                },
                email: {
                    title: "邮箱",
                    type: "string",
                    widget: "input",
                    required: true,
                    placeholder: "邮箱",
                },
                career: {
                    title: "求职意向",
                    type: "string",
                    widget: "input",
                    required: true,
                    placeholder: "如：前端开发工程师",
                },
                location: {
                    title: "城市",
                    type: "string",
                    widget: "input",
                    placeholder: "可选",
                },
                address: {
                    title: "地址",
                    type: "string",
                    widget: "input",
                    placeholder: "可选",
                },
            },
        },
        education: {
            type: "object",
            title: "教育经历",
            properties: {
                school: {
                    title: "学校",
                    type: "string",
                    widget: "input",
                    required: true,
                    placeholder: "学校名称",
                },
                degree: {
                    title: "学历",
                    type: "string",
                    widget: "input",
                    required: true,
                    placeholder: "如：本科",
                },
                major: {
                    title: "专业",
                    type: "string",
                    widget: "input",
                    required: true,
                    placeholder: "专业名称",
                },
                startDate: {
                    title: "开始时间",
                    type: "string",
                    widget: "datePicker",
                    props: { format: "YYYY/MM", picker: "month" },
                    placeholder: "入学",
                },
                endDate: {
                    title: "结束时间",
                    type: "string",
                    widget: "datePicker",
                    props: { format: "YYYY/MM", picker: "month" },
                    required: true,
                    placeholder: "毕业",
                },
                description: {
                    title: "在校说明",
                    type: "string",
                    widget: "textArea",
                    props: { rows: 3, style: { width: "100%" } },
                    placeholder: "社团、项目、职务等补充说明",
                },
            },
        },
        workHistory: {
            type: "array",
            title: "工作经历",
            span: 24,
            items: {
                type: "object",
                column: 1,
                properties: {
                    company: {
                        title: "公司",
                        type: "string",
                        widget: "input",
                        required: true,
                        placeholder: "公司名称",
                    },
                    role: {
                        title: "职位",
                        type: "string",
                        widget: "input",
                        required: true,
                        placeholder: "岗位名称",
                    },
                    dateRange: {
                        title: "时间",
                        type: "string",
                        widget: "input",
                        required: true,
                        placeholder: "如 2022.06-至今",
                    },
                    bullets: {
                        title: "工作要点",
                        type: "array",
                        widget: "simpleList",
                        props: { hasBackground: true },
                        items: listItem,
                    },
                    techStack: {
                        title: "主要技术栈",
                        type: "string",
                        widget: "textArea",
                        props: { rows: 2, style: { width: "100%" } },
                        placeholder: "逗号或顿号分隔，如 React、TypeScript",
                    },
                    hideTechStack: {
                        title: "简历中不展示主要技术栈",
                        type: "boolean",
                        default: false,
                    },
                },
            },
        },
        projectExperience: {
            type: "array",
            title: "项目经历",
            span: 24,
            items: {
                type: "object",
                column: 1,
                properties: {
                    name: {
                        title: "项目名称",
                        type: "string",
                        widget: "input",
                        required: true,
                        placeholder: "项目名",
                    },
                    dateRange: {
                        title: "项目时间",
                        type: "string",
                        widget: "input",
                        required: true,
                        placeholder: "如 2025.10-至今",
                    },
                    introduction: {
                        title: "项目介绍",
                        type: "string",
                        widget: "textArea",
                        props: { rows: 4, style: { width: "100%" } },
                        placeholder: "背景、规模、用户群体等",
                    },
                    mainWork: {
                        title: "主要工作",
                        type: "array",
                        widget: "simpleList",
                        props: { hasBackground: true },
                        items: listItemLong,
                    },
                    results: {
                        title: "项目成果",
                        type: "array",
                        widget: "simpleList",
                        props: { hasBackground: true },
                        items: listItemLong,
                    },
                },
            },
        },
        skills: {
            type: "array",
            title: "专业技能",
            span: 24,
            widget: "simpleList",
            props: { hasBackground: true },
            items: listItemLong,
        },
    },
};

/** 表单 schema 顶层字段（与预览点击映射一致） */
export type ResumeFormRootKey =
    | "name"
    | "theme"
    | "contact"
    | "education"
    | "workHistory"
    | "projectExperience"
    | "skills";

const ROOT_KEYS = new Set<string>([
    "name",
    "theme",
    "contact",
    "education",
    "workHistory",
    "projectExperience",
    "skills",
]);

/** 将表单字段路径映射为 schema 顶层 key；无法识别时返回 null（展示完整表单） */
export function formPathToRootKey(path?: string): ResumeFormRootKey | null {
    if (!path || typeof path !== "string") return null;
    const head = path.split(".")[0];
    if (ROOT_KEYS.has(head)) return head as ResumeFormRootKey;
    return null;
}

/** 仅保留某一顶层区块的 schema，供「点预览局部编辑」使用 */
export function pickResumeFormRootSection(rootKey: ResumeFormRootKey | null) {
    if (!rootKey) return resumeFormSchema;
    const props = resumeFormSchema.properties as Record<string, unknown>;
    const fragment = props[rootKey];
    if (!fragment) return resumeFormSchema;
    return {
        displayType: resumeFormSchema.displayType,
        column: resumeFormSchema.column,
        properties: { [rootKey]: JSON.parse(JSON.stringify(fragment)) },
    };
}

export default resumeFormSchema;
