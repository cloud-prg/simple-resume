import Resume from "@/components/Resume";
import { MOCK_RESUME, MOCK_RESUME_LIST } from "@/mock";
import React, { useMemo, useRef } from "react";
import EditResumeModal, { type EditResumeModalHandle } from "./components/EditResumeModal";
import { Button, Popconfirm, Upload, UploadFile, message } from 'antd'
import GithubCorner from "@/components/GithubCorner";
import { GITHUB_URL } from "@/constant";
/** 与 Resume 使用的 index.module.css 同源，编译后带 hash 的类名与 innerHTML 一致，用于打印窗口内联注入 */
import resumeCssForPrint from '@/components/Resume/index.module.css?inline';
import themeCssForPrint from '@/styles/theme.css?raw';
import { ResumeProps } from "@/types";
import { DeleteOutlined, ExportOutlined, ImportOutlined, RobotOutlined } from "@ant-design/icons";
import { AppearanceSwitcher } from "@/components/AppearanceSwitcher";
import { AssistantModal } from "@/components/AssistantModal";
import styles from './index.module.css'
import { exportJsonToTxt, importJsonFromTxt } from "@/util/file";
import { migrateResume, migrateResumeList } from "@/util/resumeMigrate";
import { UploadChangeParam } from "antd/es/upload";
import { flushSync } from "react-dom";

const Index = () => {
    const printRef = useRef<HTMLDivElement>(null);
    const editModalRef = useRef<EditResumeModalHandle>(null);
    const rawList = JSON?.parse?.(localStorage.getItem('resumeList') || '[]');
    const migratedList = migrateResumeList(Array.isArray(rawList) ? rawList : []);
    const [resumeList, setResumeList] = React.useState<ResumeProps[]>(
        migratedList.length > 0 ? migratedList : migrateResumeList(MOCK_RESUME_LIST),
    );
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [triggerImport, setTriggerImport] = React.useState(false);
    const [assistantOpen, setAssistantOpen] = React.useState(false);

    const resume = useMemo(() => {
        return resumeList?.[activeIndex] || migrateResume(MOCK_RESUME);
    }, [activeIndex, resumeList])

    React.useEffect(() => {
        localStorage.setItem("resumeList", JSON?.stringify?.(resumeList));
    }, [resumeList])

    React.useEffect(() => {
        if (triggerImport) {
            setActiveIndex(resumeList.length - 1)
            setTriggerImport(false)
        }
    }, [triggerImport, resumeList.length])

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

        const rawTheme = document.documentElement.dataset.theme || "light";
        const appearance = rawTheme === "sepia" || rawTheme === "dark" ? rawTheme : "light";
        doc.open();
        doc.write(
            `<!DOCTYPE html><html lang="zh-CN" data-theme="${appearance}"><head><meta charset="utf-8"><title>打印简历</title>`,
        );
        doc.write(`<base href="${baseHref}">`);
        doc.write(`<style type="text/css" data-theme-print>${themeCssForPrint}</style>`);
        doc.write(`<style type="text/css" data-resume-print>${resumeCssForPrint}</style>`);
        doc.write('</head><body style="margin:0">');
        doc.write(printContent.innerHTML);
        doc.write('</body></html>');
        doc.close();

        printWindow.requestAnimationFrame(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        });
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
        let newActive = 0;
        flushSync(() => {
            setResumeList((prev) => {
                const nextData = migrateResume(data);
                const dup = prev.filter((item) => item.name === nextData.name).length > 0;
                if (dup) {
                    nextData.name = `${nextData.name}(1)`;
                }
                const next = [...prev, nextData];
                newActive = next.length - 1;
                return next;
            });
        });
        setActiveIndex(newActive);
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

    return (
        <div className={styles.shell}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.labelCaps}>Workspace</div>
                    <h1 className={styles.pageTitle}>简历编辑</h1>
                    <p className={styles.pageLead}>
                        左侧维护模板与内容，右侧实时预览；点击预览可快速打开编辑并定位字段。
                    </p>
                    <div className={styles.themeRow}>
                        <span className={styles.themeRowLabel}>外观</span>
                        <AppearanceSwitcher />
                    </div>
                </div>

                <div className={styles.sidebarScroll}>
                    <section>
                        <div className={styles.sectionHeading}>操作</div>
                        <div className={styles.stack}>
                            <EditResumeModal
                                ref={editModalRef}
                                data={resume}
                                onSuccess={() => {
                                    message.success('编辑已保存');
                                }}
                                onChange={handleEdit}
                            >
                                编辑简历
                            </EditResumeModal>
                            <Button type="primary" className="shadow-sm" onClick={handlePrint}>
                                打印简历
                            </Button>
                            <Button icon={<RobotOutlined />} onClick={() => setAssistantOpen(true)}>
                                模型助手
                            </Button>
                            <div onClick={handleExport} className={styles.btnOutline}>
                                <ExportOutlined />
                                <span>导出 JSON</span>
                            </div>
                            <div className={`${styles["json-upload"]} ${styles.btnOutline}`}>
                                <Upload accept=".txt" action="" showUploadList={false} onChange={handleUploadChange}>
                                    <ImportOutlined />
                                    <span className="ml-1">导入 JSON</span>
                                </Upload>
                            </div>
                        </div>
                        <p className={styles.hint}>
                            若打印无响应，请检查浏览器弹窗拦截或换用 Chrome。
                        </p>
                    </section>

                    <section className={styles.sectionGrow}>
                        <div className={styles.sectionHeadingRow}>
                            <div className={styles.sectionHeading}>模板</div>
                            <span className={styles.pill}>
                                {resumeList.length} 份
                            </span>
                        </div>
                        <div className={styles.stack}>
                            {resumeList.length > 0 &&
                                resumeList.map((item, index) => (
                                    <div
                                        className={`group ${styles.listItem} ${activeIndex === index ? styles.listItemActive : ""}`}
                                        key={index}
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                                        {resumeList.length > 1 && (
                                            <Popconfirm
                                                title="删除模板"
                                                description="确定删除该模板吗?"
                                                getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
                                                onConfirm={(e) => {
                                                    e?.stopPropagation();
                                                    e?.preventDefault();
                                                    handleDelete(index);
                                                }}
                                                onCancel={(e) => {
                                                    e?.stopPropagation();
                                                    e?.preventDefault();
                                                }}
                                                okText="确定"
                                                cancelText="取消"
                                            >
                                                <DeleteOutlined
                                                    className={`${styles['delete-icon']} shrink-0 text-base text-slate-400 transition group-hover:text-slate-500 hover:!text-red-500`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                    }}
                                                />
                                            </Popconfirm>
                                        )}
                                    </div>
                                ))}

                            <EditResumeModal
                                mode="create"
                                data={resume}
                                onSuccess={() => {
                                    message.success('创建成功');
                                }}
                                onChange={handleCreate}
                            >
                                <div className={styles.btnDashed}>
                                    <span>＋ 新建模板</span>
                                </div>
                            </EditResumeModal>
                        </div>
                    </section>
                </div>
            </aside>

            <main className={styles.main}>
                <div className={styles.previewHeader}>
                    <div>
                        <div className={styles.labelCaps}>Preview</div>
                        <h2 className={styles.previewTitle}>效果预览</h2>
                        <p className={styles.previewHint}>点击简历区块可在编辑弹窗中定位到对应表单项</p>
                    </div>
                    <GithubCorner href={GITHUB_URL} />
                </div>

                <div ref={printRef} className={styles.previewCard}>
                    <div className={styles.previewInner}>
                        <Resume
                            {...resume}
                            previewInteractive
                            onPreviewFieldRequest={(path) => {
                                editModalRef.current?.openEdit({ scrollToField: path });
                            }}
                        />
                    </div>
                </div>
            </main>

            <AssistantModal open={assistantOpen} onClose={() => setAssistantOpen(false)} />
        </div>
    );
}

export default Index;
