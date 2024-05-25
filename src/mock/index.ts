import { ContactType, EducationType, ExperienceType, ResumeProps } from "@/types";

export const MOCK_CONTACT: ContactType = {
    name: '张三',
    phone: "123-341-3596", // 假设这些是示例数据
    email: "zhangsan@gmail.com",
    address: "", // 可选属性，可以为空
    career: "xx开发",
    location: "杭州"
};

export const MOCK_EDUCATION: EducationType = {
    degree: "本科",
    major: "计算机科学与技术",
    school: "浙江大学",
    startDate: "2001/09",
    endDate: "2005/06",
};

export const MOCK_EXPERIENCE: ExperienceType[] = [
    {
        company: "Google",
        project: "Open AI",
        career: "AI工程师",
        startDate: "2022/05",
        endDate: "2024/05",
        keywords: ["Stable Diffusion", "Comfy UI"],
        workContent: [{value: "负责参与AI模型的开发和优化"}],
        summary: [{value:"项目正在积极开发中，具体工作内容和总结待补充"}]
    },
    // 其他工作经历可以按照上面的格式继续添加
];

export const MOCK_RESUME: ResumeProps = {
    contact: MOCK_CONTACT,
    education: MOCK_EDUCATION,
    experience: [
        ...MOCK_EXPERIENCE,
    ],
};