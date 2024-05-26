import { ContactType, EducationType, ExperienceType, ResumeProps } from "@/types";

export const MOCK_CONTACT: ContactType = {
    name: '张三',
    phone: "123-341-3596", // 假设这些是示例数据
    email: "zhangsan@gmail.com",
    address: "", // 可选属性，可以为空
    career: "xx开发",
    location: "杭州"
};

export const MOCK_CONTACT_1: ContactType = {
    name: '李四',
    phone: "123-456-7890",
    email: "lisi123@gmail.com",
    address: "上海市浦东新区",
    career: "前端开发",
    location: "上海"
};

export const MOCK_CONTACT_2: ContactType = {
    name: '王五',
    phone: "987-654-3210",
    email: "wangwu456@gmail.com",
    address: "北京市海淀区",
    career: "后端开发",
    location: "北京"
};

export const MOCK_CONTACT_3: ContactType = {
    name: '赵六',
    phone: "555-666-7777",
    email: "zhaoliu789@gmail.com",
    address: "广州市天河区",
    career: "全栈开发",
    location: "广州"
};

export const MOCK_CONTACT_4: ContactType = {
    name: '孙七',
    phone: "111-222-3333",
    email: "sunqi321@gmail.com",
    address: "深圳市南山区",
    career: "数据科学家",
    location: "深圳"
};

export const MOCK_EDUCATION: EducationType = {
    degree: "本科",
    major: "计算机科学与技术",
    school: "浙江大学",
    startDate: "2001/09",
    endDate: "2005/06",
};

export const MOCK_EDUCATION_1: EducationType = {
    degree: "硕士",
    major: "软件工程",
    school: "复旦大学",
    startDate: "2015/09",
    endDate: "2018/06",
};

export const MOCK_EDUCATION_2: EducationType = {
    degree: "博士",
    major: "人工智能",
    school: "清华大学",
    startDate: "2010/09",
    endDate: "2015/06",
};

export const MOCK_EDUCATION_3: EducationType = {
    degree: "本科",
    major: "信息安全",
    school: "中山大学",
    startDate: "2008/09",
    endDate: "2012/06",
};

export const MOCK_EDUCATION_4: EducationType = {
    degree: "硕士",
    major: "数据分析",
    school: "武汉大学",
    startDate: "2013/09",
    endDate: "2016/06",
};

export const MOCK_EXPERIENCE: ExperienceType[] = [
    {
        company: "Google",
        project: "Open AI",
        career: "AI工程师",
        startDate: "2022/05",
        endDate: "2024/05",
        keywords: ["Stable Diffusion", "Comfy UI", "Machine Learning", "Deep Learning"],
        workContent: [
            { value: "负责参与AI模型的开发和优化" },
            { value: "使用深度学习技术改进自然语言处理算法" },
            { value: "设计并实现了一个稳定的图像生成模型" },
            { value: "与跨职能团队合作，将AI技术集成到产品中" }
        ],
        summary: [
            { value: "项目正在积极开发中，具体工作内容和总结待补充" },
            { value: "成功提升了AI模型在特定任务上的性能和准确性" },
            { value: "通过实验和迭代，优化了模型的训练效率和推理速度" },
            { value: "为团队引入了新的研究思路和技术，推动了项目的创新" }
        ]
    },
]

export const MOCK_EXPERIENCE_1: ExperienceType[] = [
    {
        company: "阿里巴巴",
        project: "淘宝",
        career: "前端工程师",
        startDate: "2018/07",
        endDate: "2020/06",
        keywords: ["React", "Redux", "Webpack", "Babel"],
        workContent: [
            { value: "负责淘宝首页的前端开发和维护" },
            { value: "优化页面加载速度，通过代码分割和懒加载技术" },
            { value: "实现响应式设计，确保移动端和桌面端的兼容性" },
            { value: "与设计师紧密合作，确保设计稿的准确实现" }
        ],
        summary: [
            { value: "提升了页面加载速度和用户交互体验" },
            { value: "通过代码审查和重构，提高了代码质量和可维护性" },
            { value: "成功实现了多个新功能，如商品筛选和智能推荐" },
            { value: "参与团队技术分享，提高了团队整体的前端开发水平" }
        ]
    },
];

export const MOCK_EXPERIENCE_2: ExperienceType[] = [
    {
        company: "腾讯",
        project: "微信",
        career: "后端工程师",
        startDate: "2015/07",
        endDate: "2017/06",
        keywords: ["Node.js", "Express", "MongoDB", "Redis"],
        workContent: [
            { value: "负责微信后端服务的开发和维护" },
            { value: "设计并实现了高并发的消息推送系统" },
            { value: "优化数据库查询，提高了数据访问效率" },
            { value: "参与编写技术文档，确保代码的可读性和可维护性" }
        ],
        summary: [
            { value: "优化了服务器响应时间和系统稳定性" },
            { value: "通过引入缓存机制，减少了数据库的压力" },
            { value: "实现了用户行为分析功能，为产品决策提供了数据支持" },
            { value: "提升了团队的协作效率，通过代码审查和定期的技术讨论" }
        ]
    },
];

export const MOCK_EXPERIENCE_3: ExperienceType[] = [
    {
        company: "百度",
        project: "搜索引擎",
        career: "全栈工程师",
        startDate: "2012/07",
        endDate: "2015/06",
        keywords: ["Python", "Django", "Elasticsearch", "Docker"],
        workContent: [
            { value: "开发和维护百度搜索引擎的后端服务" },
            { value: "实现了搜索引擎的分布式爬虫系统" },
            { value: "优化搜索引擎的索引构建流程，提高了搜索效率" },
            { value: "负责前端页面的性能优化和用户交互设计" }
        ],
        summary: [
            { value: "提高了搜索结果的准确性和响应速度" },
            { value: "通过引入机器学习算法，提升了搜索结果的相关性" },
            { value: "实现了用户个性化搜索体验，增加了用户粘性" },
            { value: "参与团队的技术决策，推动了多项技术改进" }
        ]
    },
];

export const MOCK_EXPERIENCE_4: ExperienceType[] = [
    {
        company: "字节跳动",
        project: "抖音",
        career: "数据科学家",
        startDate: "2016/07",
        endDate: "2019/06",
        keywords: ["数据分析", "机器学习", "Spark", "TensorFlow"],
        workContent: [
            { value: "负责抖音用户行为数据分析" },
            { value: "构建了用户画像系统，为精准营销提供支持" },
            { value: "开发了推荐算法，提高了用户内容匹配度" },
            { value: "设计并实施了A/B测试，验证产品功能的效果" }
        ],
        summary: [
            { value: "通过数据分析优化了推荐算法，提升了用户满意度" },
            { value: "实现了多维度的用户行为分析，为产品迭代提供了依据" },
            { value: "构建的数据可视化平台，帮助团队更好地理解用户行为" },
            { value: "带领数据团队完成了多个重要项目，提升了团队的数据处理能力" }
        ]
    },
];

export const MOCK_RESUME: ResumeProps = {
    name: '模板',
    contact: MOCK_CONTACT,
    education: MOCK_EDUCATION,
    experience: MOCK_EXPERIENCE,
};


export const MOCK_RESUME_1: ResumeProps = {
    name: '模板',
    contact: MOCK_CONTACT_1,
    education: MOCK_EDUCATION_1,
    experience: MOCK_EXPERIENCE_1,
};

export const MOCK_RESUME_2: ResumeProps = {
    name: '模板',
    contact: MOCK_CONTACT_2,
    education: MOCK_EDUCATION_2,
    experience: MOCK_EXPERIENCE_2,
};

export const MOCK_RESUME_3: ResumeProps = {
    name: '模板',
    contact: MOCK_CONTACT_3,
    education: MOCK_EDUCATION_3,
    experience: MOCK_EXPERIENCE_3,
};

export const MOCK_RESUME_4: ResumeProps = {
    name: '模板',
    contact: MOCK_CONTACT_4,
    education: MOCK_EDUCATION_4,
    experience: MOCK_EXPERIENCE_4,
};

export const MOCK_RESUME_LIST: ResumeProps[] = [
    MOCK_RESUME,
    MOCK_RESUME_1,
    MOCK_RESUME_2,
    MOCK_RESUME_3,
    MOCK_RESUME_4,
].map(item=>({...item, name: item.experience[0].company + item.name}));