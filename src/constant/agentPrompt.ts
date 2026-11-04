/** 供网页 Agent 填写的简历 JSON 骨架，字段与 ResumeProps 对齐 */
const RESUME_JSON_SKELETON = {
    name: "模板名称，建议不超过 24 字，例如：张三-前端",
    contact: {
        name: "姓名",
        phone: "手机号",
        email: "邮箱",
        address: "通讯地址，没有则留空字符串",
        career: "求职意向或当前职位",
        location: "所在城市",
        age: "年龄，如 27 或 27岁",
    },
    education: {
        school: "学校",
        degree: "学历，如 本科",
        major: "专业",
        startDate: "2017/09",
        endDate: "2021/06",
        description: "在校经历补充，没有则留空字符串",
    },
    workHistory: [
        {
            company: "公司名称",
            role: "职位",
            dateRange: "2022.06-至今",
            bullets: [{ value: "工作要点，一条一个对象" }],
            techStack: "主要技术栈，用顿号分隔，没有则留空字符串",
            hideTechStack: false,
        },
    ],
    projectExperience: [
        {
            name: "项目名称",
            dateRange: "2024.03-2024.12",
            introduction: "项目介绍",
            mainWork: [{ value: "主要工作，一条一个对象" }],
            results: [{ value: "项目成果，一条一个对象" }],
        },
    ],
    skills: [{ value: "个人优势或专业技能，一条一个对象" }],
    sectionTitles: {
        skills: "个人优势",
        workHistory: "工作经历",
        projectExperience: "项目经历",
        education: "教育经历",
    },
    sectionLabels: {
        "workHistory.techStack": "主要技术栈",
        "projectExperience.introduction": "项目介绍",
        "projectExperience.mainWork": "主要工作",
        "projectExperience.results": "项目成果",
    },
    customSections: [
        {
            id: "extra",
            title: "自定义模块标题",
            displayMode: "plain",
            items: [{ value: "无标题列表时填写 value" }],
        },
    ],
    sectionOrder: ["skills", "workHistory", "projectExperience", "education", "custom:extra"],
    hiddenSections: [],
    theme: {
        heading1Color: "#0f172a",
        heading2Color: "#111827",
        heading3Color: "#1e40af",
        headerLayout: "center",
    },
};

/**
 * 复制到 ChatGPT / Claude 等网页 Agent 的中文引导提示词。
 * 不包含任何 API Key，只约束输出为可导入的简历 JSON。
 */
export const RESUME_AGENT_PROMPT = `你是简历结构化助手。请把用户提供的材料整理成 Simple Resume 可直接导入的 JSON。

用户会提供这些内容（可能写在本条消息里，也可能随后补充；缺哪一项就留空，不要编造）：
- 专业技能与个人优势
- 教育经历
- 工作经历
- 项目经历
- 其他个人信息（姓名、电话、邮箱、地址、求职意向、年龄、所在地等）

请把上述材料整理成下面这份 JSON 的形状，并只返回 JSON：
- 只输出一个 JSON 对象，不要写解释、标题或前后说明。
- 可以用 \`\`\`json 代码块包裹；除此之外不要输出别的文字。
- 字段名必须与骨架完全一致，不要改名，不要把数组写成纯字符串。
- 没有的信息用空字符串 "" 或空数组 []，不要使用 null。
- 不要输出 experience 这个旧字段。

结构约束：
- name：侧栏里的模板名称，可以和姓名相同，建议不超过 24 个字。contact.name 才是姓名。
- contact：name、phone、email、address、career、location、age，全部是字符串。
- education：单个对象，不是数组。字段为 school、degree、major、startDate、endDate、description。日期使用 YYYY/MM。若有多段教育，只保留最高学历，其余写进 description。
- workHistory：数组。每项含 company、role、dateRange、bullets、techStack、hideTechStack。dateRange 形如 2022.06-至今 或 2022.06-2024.03。bullets 是 { "value": "一条要点" } 的数组。hideTechStack 为 true 时表示不展示技术栈。
- projectExperience：数组。每项含 name、dateRange、introduction、mainWork、results。mainWork 与 results 都是 { "value": "一条内容" } 的数组。
- skills：个人优势，数组，每项是 { "value": "一条优势或技能" }。
- sectionTitles：可选。只允许这些键：skills、workHistory、projectExperience、education，用来覆盖一级标题。
- sectionLabels：可选。只允许这些键：workHistory.techStack、projectExperience.introduction、projectExperience.mainWork、projectExperience.results。
- customSections：可选自定义模块。每项含 id、title、displayMode、items。displayMode 只能是 plain 或 titled。plain 的 items 填 value；titled 的 items 填 title 和 description。没有自定义模块时设为 []。
- sectionOrder：正文模块顺序。固定模块只能是 skills、workHistory、projectExperience、education。自定义模块写成 "custom:模块id"，例如 id 为 extra 时写 "custom:extra"。
- hiddenSections：需要在预览中隐藏的模块，取值规则与 sectionOrder 相同。不隐藏则为 []。
- theme：可选。heading1Color、heading2Color、heading3Color 为颜色值；headerLayout 只能是 left、center 或 right。

请按这个骨架填写（把占位文字换成用户材料；用户没提到的经历不要虚构）：

${JSON.stringify(RESUME_JSON_SKELETON, null, 2)}

如果用户材料已经在对话中，现在就只输出 JSON。如果还没有材料，请用一句话请用户贴上专业技能、教育经历、工作经历、项目经历和其他个人信息。`;
