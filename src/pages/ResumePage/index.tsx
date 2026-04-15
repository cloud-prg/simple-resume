import Resume from "@/components/Resume";
import { MOCK_RESUME, MOCK_RESUME_LIST } from "@/mock";
import React, { useMemo, useRef } from "react";
import EditResumeModal from "./components/EditResumeModal";
import { Button, Popconfirm, Upload, UploadFile, message } from 'antd'
import GithubCorner from "@/components/GithubCorner";
import { GITHUB_URL } from "@/constant";
import resumePrintCssUrl from '@/components/Resume/resume-print.css?url';
import { ResumeProps } from "@/types";
import { DeleteOutlined, DownloadOutlined, ExportOutlined, ImportOutlined } from "@ant-design/icons";
import styles from './index.module.css'
import { exportJsonToTxt, importJsonFromTxt } from "@/util/file";
import { migrateResume, migrateResumeList } from "@/util/resumeMigrate";
import { UploadChangeParam } from "antd/es/upload";
import { flushSync } from "react-dom";

const Index = () => {
    const printRef = useRef<HTMLDivElement>(null);
    const rawList = JSON?.parse?.(localStorage.getItem('resumeList') || '[]');
    const migratedList = migrateResumeList(Array.isArray(rawList) ? rawList : []);
    const [resumeList, setResumeList] = React.useState<ResumeProps[]>(
        migratedList.length > 0 ? migratedList : migrateResumeList(MOCK_RESUME_LIST),
    );
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [triggerImport, setTriggerImport] = React.useState(false);

    const resume = useMemo(() => {
        return resumeList?.[activeIndex] || [];
    }, [activeIndex, resumeList])

    React.useEffect(() => {
        localStorage.setItem("resumeList", JSON?.stringify?.(resumeList));
    }, [resumeList])

    React.useEffect(() => {
        if (triggerImport) {
            setActiveIndex(resumeList.length - 1)
            setTriggerImport(false)
        }
    }, [triggerImport])

    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=1200,height=900');
        if (!printWindow) {
            message.warning('请允许弹出窗口后再试打印');
            return;
        }

        const doc = printWindow.document;
        const baseHref = new URL(import.meta.env.BASE_URL || '/', window.location.origin).href;
        const resumeCssHref = new URL(resumePrintCssUrl, window.location.href).href;

        doc.open();
        doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>打印简历</title>');
        doc.write(`<base href="${baseHref}">`);
        doc.write(`<link rel="stylesheet" href="${resumeCssHref}">`);
        doc.write('</head><body style="margin:0">');
        doc.write(printContent.innerHTML);
        doc.write('</body></html>');
        doc.close();

        let printed = false;
        const runPrintOnce = () => {
            if (printed) return;
            printed = true;
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };

        const link = doc.querySelector('link[rel="stylesheet"]') as HTMLLinkElement | null;
        if (link) {
            link.addEventListener('load', runPrintOnce);
            link.addEventListener('error', runPrintOnce);
            window.setTimeout(runPrintOnce, 1500);
        } else {
            window.setTimeout(runPrintOnce, 0);
        }
    };


    const handleEdit = (data: ResumeProps) => {
        setResumeList(prev => {
            return prev?.map?.((item, index) => {
                if (index === activeIndex) {
                    return data;
                }
                return item;
            })
        })
    }

    const handleCreate = (data: ResumeProps) => {
        flushSync(() => {
            setResumeList(prev => {
                const hasSameName = prev.filter(item => item.name === data.name).length > 0;
                hasSameName && (data.name = `${data.name}(1)`)
                return [...prev, data]
            })
            // setActiveIndex(resumeList.length - 1)
        })
    }

    const handleDelete = (itemIndex: number) => {
        if (activeIndex >= resumeList.length - 1) {
            setActiveIndex(Math.max(0, resumeList.length - 2))
        }

        setResumeList(prev => {
            const next = prev.filter((item, index) => {
                return index !== itemIndex
            })
            return next
        })

        message.success('删除成功');
    }

    const handleExport = () => {
        try {
            exportJsonToTxt(resumeList[activeIndex], resumeList[activeIndex].name)
            message.success('导出成功');
        } catch (e) {
            message.error('导出失败');
        }
    }

    const handleUploadChange = async (e: UploadChangeParam<UploadFile>) => {
        const { status } = e.file;
        if (status === 'uploading') { return; }
        const res: ResumeProps | string = await importJsonFromTxt(e);
        if (typeof res === 'object') {
            handleCreate(migrateResume(res));
            setTriggerImport(true)
        }
    }

    return <div className="h-screen w-full flex">
        {/* sidebar */}
        <div className="flex flex-col gap-[24px] px-[12px] py-[8px] h-full w-[240px] border">
            {/* controller region */}
            <div className="flex flex-col gap-[12px]">
                <span className="text-3xl font-bold">编辑区</span>
                <span className="text-xs text-gray-400">⚠️:若点击打印简历无反应,请检查浏览器拦截或换用chrome</span>
                <div className="flex flex-col gap-[10px]">
                    <EditResumeModal
                        data={resume}
                        onSuccess={() => {
                            message.success('编辑已保存');
                        }}
                        onChange={handleEdit} >编辑简历</EditResumeModal>
                    <Button onClick={handlePrint} type="primary">打印简历</Button>
                    <div onClick={handleExport} className={`flex items-center justify-center gap-[8px] text-[14px]
                               cursor-pointer border border-dotted border-purple-400 text-purple-400
                               hover:bg-purple-100 rounded-[4px] px-[8px] py-[4px]`}>
                        <ExportOutlined />
                        <span>导出Json</span>
                    </div>
                    <div className={`${styles['json-upload']} flex items-center justify-center gap-[8px] text-[14px]
                               cursor-pointer border border-dotted border-purple-400 text-purple-400
                               hover:bg-purple-100 rounded-[4px]`}>
                        <Upload accept=".txt" action="" showUploadList={false} onChange={handleUploadChange}>
                            <ImportOutlined />
                            <span className="ml-[8px]">导入Json</span>
                        </Upload>
                    </div>
                </div>
            </div>
            {/* template region */}
            <div className="flex flex-col gap-[12px]">
                <span className="text-3xl font-bold">自定义模板</span>
                <div className="flex flex-col gap-[10px]">
                    {resumeList.length > 0 && resumeList?.map?.((item, index) => {
                        return <div className={`${styles['list-item']} ${activeIndex === index ? "border-primary-2" : ""} text-[14px] flex items-center justify-between hover:bg-gray-100 cursor-pointer border border-gray-300 rounded-[4px] px-[8px] py-[4px]`} key={index} onClick={() => {
                            setActiveIndex(index);
                        }}>
                            <span className={`${activeIndex === index && "text-primary-2"}`}>{item.name}</span>
                            {
                                resumeList.length > 1 &&
                                <Popconfirm
                                    title="删除模板"
                                    description="确定删除该模板吗?"
                                    getPopupContainer={(triggerNode: any) => {
                                        return triggerNode.parentNode;
                                    }}
                                    onConfirm={(e) => {
                                        e?.stopPropagation();
                                        e?.preventDefault();
                                        handleDelete(index)
                                    }}
                                    onCancel={(e) => {
                                        e?.stopPropagation();
                                        e?.preventDefault();
                                    }}
                                    okText="确定"
                                    cancelText="取消"
                                >
                                    <DeleteOutlined className={`${styles['delete-icon']} text-[16px] text-gray-400 hover:text-red-500`} onClick={(e) => {
                                        e?.stopPropagation();
                                        e?.preventDefault();
                                    }} />
                                </Popconfirm>
                            }
                        </div>
                    })}

                    <EditResumeModal mode='create' data={resume}
                        onSuccess={() => {
                            message.success('创建成功');
                        }}
                        onChange={handleCreate} >
                        <div className={`flex items-center justify-center text-[14px]
                               cursor-pointer border border-dotted border-primary-2 text-primary-2
                               hover:bg-primary-bg rounded-[4px] px-[8px] py-[4px]`}>
                            <span>+ 新建模板</span>
                        </div>
                    </EditResumeModal>
                </div>
            </div>
        </div>
        {/* content */}
        <div className="flex-1 flex flex-col px-[36px] py-[8px]">
            <div className="flex items-center justify-between">
                <span className="text-3xl font-bold mb-[12px]">效果预览</span>
                <GithubCorner href={GITHUB_URL} />
            </div>
            <div ref={printRef} className="h-full w-full overflow-scroll">
                <Resume
                    {...resume}
                />
            </div>
        </div>

    </div >
}

export default Index;