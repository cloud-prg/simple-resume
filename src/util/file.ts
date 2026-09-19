import { ResumeProps } from '@/types';
import { message } from 'antd';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';
import FileSaver from 'file-saver';

export type ResumeExportFormat = 'txt' | 'md' | 'json';

const DEFAULT_SECTION_TITLES = {
    skills: '个人优势',
    workHistory: '工作经历',
    projectExperience: '项目经历',
    education: '教育经历',
} as const;

function joinDefinedValues(values: Array<string | undefined>, separator = ' | ') {
    return values.filter(Boolean).join(separator);
}

function formatBulletList(items?: { value?: string }[], prefix = '- ') {
    return (items ?? [])
        .map((item) => item.value?.trim())
        .filter(Boolean)
        .map((value) => `${prefix}${value}`)
        .join('\n');
}

function buildResumeTxt(data: ResumeProps) {
    const lines: string[] = [];
    const appendBlock = (title: string, content: string[]) => {
        const filtered = content.filter(Boolean);
        if (filtered.length === 0) {
            return;
        }
        lines.push(title);
        lines.push(...filtered);
        lines.push('');
    };

    appendBlock('模板信息', [`模板名称：${data.name}`]);

    appendBlock('个人信息', [
        `姓名：${data.contact?.name ?? ''}`,
        `求职方向：${data.contact?.career ?? ''}`,
        `电话：${data.contact?.phone ?? ''}`,
        `邮箱：${data.contact?.email ?? ''}`,
        `地址：${data.contact?.address ?? ''}`,
        `地点：${data.contact?.location ?? ''}`,
        `年龄：${data.contact?.age ?? ''}`,
    ]);

    appendBlock(data.sectionTitles?.education || DEFAULT_SECTION_TITLES.education, [
        joinDefinedValues([data.education?.school, data.education?.degree, data.education?.major]),
        joinDefinedValues([data.education?.startDate, data.education?.endDate], ' - '),
        data.education?.description ?? '',
    ]);

    appendBlock(
        data.sectionTitles?.skills || DEFAULT_SECTION_TITLES.skills,
        (data.skills ?? []).map((item) => item.value?.trim() || '').filter(Boolean),
    );

    appendBlock(
        data.sectionTitles?.workHistory || DEFAULT_SECTION_TITLES.workHistory,
        (data.workHistory ?? []).flatMap((item) => {
            const block = [
                joinDefinedValues([item.company, item.role], ' | '),
                item.dateRange ?? '',
                item.techStack ? `技术栈：${item.techStack}` : '',
                formatBulletList(item.bullets),
            ].filter(Boolean);
            return block.length > 0 ? [...block, ''] : [];
        }),
    );

    appendBlock(
        data.sectionTitles?.projectExperience || DEFAULT_SECTION_TITLES.projectExperience,
        (data.projectExperience ?? []).flatMap((item) => {
            const block = [
                item.name ?? '',
                item.dateRange ?? '',
                item.introduction ? `简介：${item.introduction}` : '',
                item.mainWork?.length ? '主要工作：' : '',
                formatBulletList(item.mainWork),
                item.results?.length ? '项目成果：' : '',
                formatBulletList(item.results),
            ].filter(Boolean);
            return block.length > 0 ? [...block, ''] : [];
        }),
    );

    (data.customSections ?? []).forEach((section) => {
        appendBlock(
            section.title || '自定义模块',
            (section.items ?? []).flatMap((item) => {
                if (section.displayMode === 'titled') {
                    return [joinDefinedValues([item.title, item.description], '：')];
                }
                return [item.value ?? ''];
            }).filter(Boolean),
        );
    });

    return lines.join('\n').trim();
}

function buildResumeMarkdown(data: ResumeProps) {
    const lines: string[] = [`# ${data.contact?.name || data.name || '简历'}`, ''];
    const contactLine = joinDefinedValues([
        data.contact?.career,
        data.contact?.phone,
        data.contact?.email,
        data.contact?.location || data.contact?.address,
        data.contact?.age,
    ]);
    if (contactLine) {
        lines.push(contactLine, '');
    }

    const pushSection = (title: string, sectionLines: string[]) => {
        const filtered = sectionLines.filter(Boolean);
        if (filtered.length === 0) {
            return;
        }
        lines.push(`## ${title}`, '', ...filtered, '');
    };

    pushSection(data.sectionTitles?.education || DEFAULT_SECTION_TITLES.education, [
        joinDefinedValues(
            [
                data.education?.school,
                joinDefinedValues([data.education?.degree, data.education?.major], ' · '),
                joinDefinedValues([data.education?.startDate, data.education?.endDate], ' - '),
            ],
            ' | ',
        ),
        data.education?.description ?? '',
    ]);

    pushSection(
        data.sectionTitles?.skills || DEFAULT_SECTION_TITLES.skills,
        (data.skills ?? []).map((item) => item.value?.trim()).filter(Boolean).map((item) => `- ${item}`),
    );

    pushSection(
        data.sectionTitles?.workHistory || DEFAULT_SECTION_TITLES.workHistory,
        (data.workHistory ?? []).flatMap((item) => {
            const block = [
                `### ${joinDefinedValues([item.company, item.role], ' | ') || '工作经历'}`,
                item.dateRange ?? '',
                item.techStack ? `技术栈：${item.techStack}` : '',
                formatBulletList(item.bullets),
            ].filter(Boolean);
            return block.length > 0 ? [...block, ''] : [];
        }),
    );

    pushSection(
        data.sectionTitles?.projectExperience || DEFAULT_SECTION_TITLES.projectExperience,
        (data.projectExperience ?? []).flatMap((item) => {
            const block = [
                `### ${item.name || '项目经历'}`,
                item.dateRange ?? '',
                item.introduction ?? '',
                item.mainWork?.length ? '主要工作：' : '',
                formatBulletList(item.mainWork),
                item.results?.length ? '项目成果：' : '',
                formatBulletList(item.results),
            ].filter(Boolean);
            return block.length > 0 ? [...block, ''] : [];
        }),
    );

    (data.customSections ?? []).forEach((section) => {
        pushSection(
            section.title || '自定义模块',
            (section.items ?? []).flatMap((item) => {
                if (section.displayMode === 'titled') {
                    return [`- ${joinDefinedValues([item.title, item.description], '：')}`];
                }
                return item.value ? [`- ${item.value}`] : [];
            }),
        );
    });

    return lines.join('\n').trim();
}

export function exportResumeFile(data: ResumeProps, format: ResumeExportFormat, filename = 'resume') {
    const exportMap: Record<ResumeExportFormat, { content: string; type: string; extension: string }> = {
        txt: {
            content: buildResumeTxt(data),
            type: 'text/plain;charset=utf-8',
            extension: 'txt',
        },
        md: {
            content: buildResumeMarkdown(data),
            type: 'text/markdown;charset=utf-8',
            extension: 'md',
        },
        json: {
            content: JSON.stringify(data, null, 2),
            type: 'application/json;charset=utf-8',
            extension: 'json',
        },
    };
    const current = exportMap[format];
    const file = new File([current.content], `${filename}.${current.extension}`, { type: current.type });
    FileSaver.saveAs(file);
}

// Adapt Antd Upload
export function importJsonFromTxt(
    event: UploadChangeParam<UploadFile>,
): Promise<ResumeProps | string> {
    return new Promise((resolve, reject) => {
        const file = event?.file?.originFileObj;
        if (!file) {
            console.error('文件未选择');
            reject(new Error("no file"));
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e: ProgressEvent<FileReader>) {
            const text = e.target?.result;
            if (typeof text !== "string") {
                message.error("读取文件失败");
                reject(new Error("invalid file read result"));
                return;
            }
            try {
                const json = JSON.parse(text);
                message.success('导入成功');
                resolve(json);
                // 在这里处理导入的JSON数据
            } catch (error) {
                message.error('无效JSON文件');
                reject(error);
                // console.error('Failed to parse JSON', error);
            }
        };
        reader.onerror = function () {
            message.error('读取文件失败');
            // console.error('Error reading file');
        };
        reader.readAsText(file);
    })
}
