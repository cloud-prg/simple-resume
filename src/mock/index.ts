import { ContactType, EducationType, ExperienceType, ResumeProps } from "@/types";

export const MOCK_CONTACT: ContactType = {
    name: 'Youshan Li',
    phone: "180-9891-3296", // 假设这些是示例数据
    email: "liyoushan3@gmail.com",
    address: "", // 可选属性，可以为空
    career: "前端开发",
};

export const MOCK_EDUCATION: EducationType = {
    degree: "本科",
    major: "电子信息科学与技术",
    school: "中国矿业大学",
    startDate: "2011.9",
    endDate: "2015.6",
};

export const MOCK_EXPERIENCE: ExperienceType[] = [
    {
        company: "RibirX",
        project: "Ribir GUI 框架",
        career: "客户端开发工程师",
        startDate: "2023.3",
        endDate: "至今", // 假设至今仍然在职
        keywords: ["Rust", "Cross-platform GUI"],
        workContent: [
            "负责参与 Rust GUI 框架 Ribir 的开发和维护工作",
            "开源项目地址：https://github.com/RibirX/Ribir"
        ],
        summary: ["项目正在积极开发中，具体工作内容和总结待补充"]
    },
    // 其他工作经历可以按照上面的格式继续添加
];

export const MOCK_RESUME: ResumeProps = {
    contact: MOCK_CONTACT,
    education: MOCK_EDUCATION,
    experience: MOCK_EXPERIENCE,
};