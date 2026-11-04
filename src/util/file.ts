import { ResumeProps } from '@/types';
import { message } from 'antd';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';
import FileSaver from 'file-saver';
import { parseResumeJsonText } from './resumeJson';

export function exportJsonToTxt(data: ResumeProps, filename = 'data') {
    const json = JSON.stringify(data, null, 2); // 使用2作为缩进，使JSON格式化
    const file = new File([json], `${filename}.txt`, { type: "text/plain;charset=utf-8" });
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
                const json = parseResumeJsonText(text);
                message.success('导入成功');
                resolve(json as ResumeProps);
            } catch (error) {
                message.error('无效JSON文件');
                reject(error);
            }
        };
        reader.onerror = function () {
            message.error('读取文件失败');
            // console.error('Error reading file');
        };
        reader.readAsText(file);
    })
}