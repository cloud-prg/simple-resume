import { ContactType, ResumeProps, WorkHistoryType, ProjectExperienceType } from "@/types";

const WH_EXAMPLE: WorkHistoryType = {
    company: "星辰科技有限公司",
    role: "前端开发工程师",
    dateRange: "2022.06-至今",
    bullets: [
        { value: "负责核心业务模块的前端开发与迭代，保障版本按时交付与线上稳定。" },
        { value: "参与前端工程化建设，包括组件库沉淀、构建与发布流程优化。" },
        { value: "与产品、设计、后端协作推进需求评审与技术方案落地。" },
    ],
    techStack: "React、Ant Design、Redux、TypeScript、Webpack、Node.js",
};

const PJ_COLLAB: ProjectExperienceType = {
    name: "企业协作白板系统",
    dateRange: "2025.10-至今",
    introduction:
        "企业级在线协作白板，支持多人实时编辑、会议与演示场景，服务内部与外部客户团队。",
    mainWork: [
        {
            value:
                "多人协作与会议系统：优化协同冲突处理与状态同步策略，降低复杂场景下的延迟与卡顿。",
        },
        {
            value:
                "渲染与交互：对大量图元场景做分块与缓存策略，提升缩放、拖拽时的流畅度。",
        },
        {
            value: "工程化：沉淀可复用模块，完善错误监控与开发调试体验。",
        },
    ],
    results: [
        { value: "支撑多个业务线接入，覆盖内部与外部客户协作场景。" },
        { value: "为后续商业化与规模化推广打下基础。" },
    ],
};

const PJ_DEVICE: ProjectExperienceType = {
    name: "智能设备管理终端",
    dateRange: "2024.03-2024.12",
    introduction: "门店场景下的 Pad 控制端应用，面向店员与运维人员提供设备管理与数据看板。",
    mainWork: [
        { value: "搭建跨端技术栈与 Monorepo 结构，统一业务模块与工具方法。" },
        { value: "接入异常监控与自定义 DevTools，缩短线上问题定位时间。" },
        { value: "与硬件团队联调 Socket 信令，保障弱网环境下的指令可靠性。" },
    ],
    results: [
        { value: "覆盖多家线下门店试点，验证门店场景下的稳定性与可用性。" },
        { value: "支撑业务侧运营数据闭环。" },
    ],
};

const EDU_EXAMPLE = {
    school: "示例理工大学",
    degree: "本科",
    major: "软件工程",
    startDate: "2017",
    endDate: "2021",
    description: "在校期间加入学生研发团队，参与 Web 开发相关课题与竞赛。",
} satisfies ResumeProps["education"];

const SKILLS_DEFAULT = [
    { value: "熟悉 JavaScript（ES5/ES6+），熟练使用 React 及相关技术栈开发中大型 Web 应用。" },
    { value: "熟悉前端工程化、组件化与常见性能优化手段，具备 Node.js 与服务端协作经验。" },
    { value: "具备良好的沟通协作能力，习惯撰写技术文档并参与代码评审。" },
];

export const MOCK_CONTACT: ContactType = {
    name: "示例用户",
    age: "27",
    phone: "13800138000",
    email: "example@demo.com",
    career: "前端开发工程师",
    location: "示例城市",
};

export const MOCK_CONTACT_1: ContactType = {
    name: "用户A",
    age: "28",
    phone: "13800001111",
    email: "usera@example.com",
    career: "前端开发工程师",
    location: "城市A",
};

export const MOCK_CONTACT_2: ContactType = {
    name: "用户B",
    age: "30",
    phone: "13900002222",
    email: "userb@example.com",
    career: "后端开发工程师",
    location: "城市B",
};

export const MOCK_CONTACT_3: ContactType = {
    name: "用户C",
    age: "26",
    phone: "13700003333",
    email: "userc@example.com",
    career: "全栈开发工程师",
    location: "城市C",
};

export const MOCK_CONTACT_4: ContactType = {
    name: "用户D",
    age: "29",
    phone: "13600004444",
    email: "userd@example.com",
    career: "数据工程师",
    location: "城市D",
};

const WH_COMPANY_A: WorkHistoryType = {
    company: "A科技公司",
    role: "前端工程师",
    dateRange: "2019.07-2022.05",
    bullets: [
        { value: "负责电商业务线活动页与营销组件开发。" },
        { value: "推动搭建活动搭建平台，降低运营配置成本。" },
    ],
    techStack: "React、Rax、微前端、TypeScript",
};

const WH_COMPANY_B: WorkHistoryType = {
    company: "B科技公司",
    role: "后台开发工程师",
    dateRange: "2016.07-2019.06",
    bullets: [
        { value: "负责内部效率工具的后端接口与数据服务。" },
        { value: "参与服务治理与缓存架构优化。" },
    ],
    techStack: "Go、MySQL、Redis、Kubernetes",
};

const WH_COMPANY_C: WorkHistoryType = {
    company: "C科技公司",
    role: "全栈工程师",
    dateRange: "2020.03-至今",
    bullets: [
        { value: "负责增长业务相关 Web 与 Node 服务。" },
        { value: "参与 A/B 实验平台前端模块维护。" },
    ],
    techStack: "React、Vue、Node.js、GraphQL",
};

const WH_COMPANY_D: WorkHistoryType = {
    company: "D科技公司",
    role: "研发工程师",
    dateRange: "2017.07-2020.02",
    bullets: [
        { value: "参与搜索相关内部系统的前后端开发。" },
        { value: "数据可视化看板搭建与维护。" },
    ],
    techStack: "Python、Django、React、ECharts",
};

const PJ_SIMPLE: ProjectExperienceType = {
    name: "示例项目 A",
    dateRange: "2023.01-2023.12",
    introduction: "示例项目介绍，用于演示项目经历区块排版与换行效果。",
    mainWork: [
        { value: "需求分析与模块拆分：输出技术方案并推动评审落地。" },
        { value: "核心功能实现：完成主流程开发与联调自测。" },
    ],
    results: [{ value: "按期交付并稳定运行。" }, { value: "通过验收并进入维护阶段。" }],
};

export const MOCK_RESUME: ResumeProps = {
    name: "默认模板",
    contact: MOCK_CONTACT,
    education: EDU_EXAMPLE,
    workHistory: [WH_EXAMPLE],
    projectExperience: [PJ_COLLAB, PJ_DEVICE],
    skills: SKILLS_DEFAULT,
};

export const MOCK_RESUME_1: ResumeProps = {
    name: "模板",
    contact: MOCK_CONTACT_1,
    education: {
        degree: "硕士",
        major: "软件工程",
        school: "示例大学A",
        startDate: "2015",
        endDate: "2018",
        description: "研究方向为 Web 系统与分布式应用。",
    },
    workHistory: [WH_COMPANY_A],
    projectExperience: [PJ_SIMPLE],
    skills: [{ value: "熟悉 React 与前端工程化。" }, { value: "熟悉 TypeScript 与单元测试。" }],
};

export const MOCK_RESUME_2: ResumeProps = {
    name: "模板",
    contact: MOCK_CONTACT_2,
    education: {
        degree: "本科",
        major: "计算机科学与技术",
        school: "示例大学B",
        startDate: "2012",
        endDate: "2016",
        description: "主修计算机系统与网络相关课程。",
    },
    workHistory: [WH_COMPANY_B],
    projectExperience: [PJ_SIMPLE],
    skills: [{ value: "熟悉 Go 与云原生基础组件。" }, { value: "熟悉 MySQL 与 Redis 调优。" }],
};

export const MOCK_RESUME_3: ResumeProps = {
    name: "模板",
    contact: MOCK_CONTACT_3,
    education: {
        degree: "本科",
        major: "信息安全",
        school: "示例大学C",
        startDate: "2008",
        endDate: "2012",
        description: "参与网络安全与系统安全相关课题。",
    },
    workHistory: [WH_COMPANY_C],
    projectExperience: [PJ_SIMPLE],
    skills: [{ value: "熟悉前后端开发与 API 设计。" }, { value: "了解微服务与消息队列。" }],
};

export const MOCK_RESUME_4: ResumeProps = {
    name: "模板",
    contact: MOCK_CONTACT_4,
    education: {
        degree: "硕士",
        major: "统计学",
        school: "示例大学D",
        startDate: "2013",
        endDate: "2016",
        description: "侧重数据分析与建模方法。",
    },
    workHistory: [WH_COMPANY_D],
    projectExperience: [PJ_SIMPLE],
    skills: [{ value: "熟悉 Python 与数据处理流水线。" }, { value: "熟悉可视化与报表开发。" }],
};

export const MOCK_TEMPLATE_LIST: ResumeProps[] = [MOCK_RESUME_1, MOCK_RESUME_2, MOCK_RESUME_3, MOCK_RESUME_4].map(
    (item) => ({
        ...item,
        name: `${item.workHistory[0]?.company || ""}${item.name}`,
    }),
);

export const MOCK_RESUME_LIST: ResumeProps[] = [MOCK_RESUME];