import React, { useCallback, useImperativeHandle, useMemo, forwardRef } from 'react';
import FormRender, { useForm } from 'form-render';
import schema, {
    formPathToRootKey,
    pickResumeFormRootSection,
    type ResumeFormRootKey,
} from './schema';
import type { CustomResumeSection, ResumeBodySectionId, ResumeProps, ResumeSectionId } from '@/types';
import { Modal, Button, message, Select, ColorPicker, Input } from 'antd';
import { MOCK_TEMPLATE_LIST } from '@/mock';
import {
    DEFAULT_SECTION_ORDER,
    DEFAULT_SECTION_TITLES,
    migrateResume,
    migrateResumeList,
} from '@/util/resumeMigrate';
import modalStyles from './index.module.css';

const FIXED_SECTION_IDS = new Set<ResumeBodySectionId>(DEFAULT_SECTION_ORDER);

const ROOT_SECTION_LABEL: Record<ResumeFormRootKey, string> = {
    name: '模板名称',
    theme: '版式与主题',
    sectionTitles: '一级标题',
    sectionLabels: '二级标签',
    contact: '个人信息',
    education: '教育经历',
    workHistory: '工作经历',
    projectExperience: '项目经历',
    skills: '个人优势',
    customSections: '自定义模块',
};

/** 局部保存：把当前表单片段合并回完整简历 */
function mergeResumePartial(
    base: ResumeProps,
    root: ResumeFormRootKey,
    patch: Record<string, unknown>,
): ResumeProps {
    const b = migrateResume(base);
    const out: ResumeProps = { ...b };
    if (root === 'name' && typeof patch.name === 'string') {
        out.name = patch.name;
    } else if (root === 'theme' && patch.theme && typeof patch.theme === 'object') {
        out.theme = { ...b.theme, ...(patch.theme as ResumeProps['theme']) };
    } else if (root === 'sectionTitles' && patch.sectionTitles && typeof patch.sectionTitles === 'object') {
        out.sectionTitles = { ...b.sectionTitles, ...(patch.sectionTitles as ResumeProps['sectionTitles']) };
    } else if (root === 'sectionLabels' && patch.sectionLabels && typeof patch.sectionLabels === 'object') {
        out.sectionLabels = { ...b.sectionLabels, ...(patch.sectionLabels as ResumeProps['sectionLabels']) };
    } else if (root === 'contact' && patch.contact && typeof patch.contact === 'object') {
        out.contact = { ...b.contact, ...(patch.contact as ResumeProps['contact']) };
    } else if (root === 'education' && patch.education && typeof patch.education === 'object') {
        out.education = { ...b.education, ...(patch.education as ResumeProps['education']) };
    } else if (root === 'workHistory' && Array.isArray(patch.workHistory)) {
        out.workHistory = patch.workHistory as ResumeProps['workHistory'];
    } else if (root === 'projectExperience' && Array.isArray(patch.projectExperience)) {
        out.projectExperience = patch.projectExperience as ResumeProps['projectExperience'];
    } else if (root === 'skills' && Array.isArray(patch.skills)) {
        out.skills = patch.skills as ResumeProps['skills'];
    } else if (root === 'customSections' && Array.isArray(patch.customSections)) {
        out.customSections = patch.customSections as ResumeProps['customSections'];
    }
    return migrateResume(out);
}

/** 取色 + 文本输入，供 form-render 注册为 colorHex */
function ColorHexField(props: {
    value?: string;
    onChange?: (v: string) => void;
    disabled?: boolean;
}) {
    const { value, onChange, disabled } = props;
    const hex = typeof value === 'string' && value.trim() ? value.trim() : '#0f172a';
    return (
        <div className="flex flex-wrap items-center gap-2">
            <ColorPicker
                value={hex}
                disabled={disabled}
                showText
                onChange={(c) => onChange?.(c.toHexString())}
            />
            <Input
                style={{ width: 120 }}
                value={hex}
                disabled={disabled}
                onChange={(e) => onChange?.(e.target.value)}
            />
        </div>
    );
}

const formWidgets = {
    colorHex: ColorHexField,
};

function customSectionRef(id: string): `custom:${string}` {
    return `custom:${id}`;
}

function isFixedSectionId(id: ResumeSectionId): id is ResumeBodySectionId {
    return FIXED_SECTION_IDS.has(id as ResumeBodySectionId);
}

function getSectionLabel(id: ResumeSectionId, customSections: CustomResumeSection[]): string {
    if (isFixedSectionId(id)) return DEFAULT_SECTION_TITLES[id];
    const customId = id.slice('custom:'.length);
    return customSections.find((section) => section.id === customId)?.title || '自定义模块';
}

function createCustomSection(index: number): CustomResumeSection {
    const id = `custom-${Date.now().toString(36)}-${index + 1}`;
    return {
        id,
        title: '自定义模块',
        displayMode: 'plain',
        items: [{ value: '', title: '', description: '' }],
    };
}

export type EditResumeModalHandle = {
    /** 打开编辑弹窗；从预览进入时可带字段路径，仅展示对应区块 */
    openEdit: (options?: { scrollToField?: string }) => void;
};

interface IProps {
    children: React.ReactNode;
    data: ResumeProps;
    mode?: 'create' | 'edit';
    onChange: (data: ResumeProps) => void;
    onSuccess: () => void;
}

const EditResumeModal = forwardRef<EditResumeModalHandle, IProps>(function EditResumeModal(props, ref) {
    const { mode = 'edit' } = props;
    const form = useForm();
    const [open, setOpen] = React.useState(false);
    const [sectionOrder, setSectionOrder] = React.useState<ResumeSectionId[]>([...DEFAULT_SECTION_ORDER]);
    const [hiddenSections, setHiddenSections] = React.useState<ResumeSectionId[]>([]);
    const [customSections, setCustomSections] = React.useState<CustomResumeSection[]>([]);
    /** 从预览点入时为某一顶层区块；null 表示完整表单 */
    const [focusRoot, setFocusRoot] = React.useState<ResumeFormRootKey | null>(null);
    const pendingScrollPath = React.useRef<string | undefined>();

    useImperativeHandle(
        ref,
        () => ({
            openEdit: (opts) => {
                if (mode !== 'edit') return;
                const root = formPathToRootKey(opts?.scrollToField);
                setFocusRoot(root);
                pendingScrollPath.current = root ? undefined : opts?.scrollToField;
                setOpen(true);
            },
        }),
        [mode],
    );

    const activeSchema = useMemo(() => {
        if (mode !== 'edit' || !focusRoot) return schema;
        return pickResumeFormRootSection(focusRoot);
    }, [mode, focusRoot]);

    const moveSection = (from: number, to: number) => {
        if (to < 0 || to >= sectionOrder.length) return;
        setSectionOrder((prev) => {
            const next = [...prev];
            const [id] = next.splice(from, 1);
            next.splice(to, 0, id);
            return next;
        });
    };

    const toggleSectionHidden = (id: ResumeSectionId) => {
        setHiddenSections((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
        );
    };

    const syncCustomSections = (nextSections: CustomResumeSection[]) => {
        const normalized = migrateResume({ ...props.data, customSections: nextSections }).customSections ?? [];
        setCustomSections(normalized);
        form.setValues({
            ...(form.getValues() as Record<string, unknown>),
            customSections: normalized,
        });
        setSectionOrder((prev) => {
            const refs = new Set(normalized.map((section) => customSectionRef(section.id)));
            const next = prev.filter((id) => isFixedSectionId(id) || refs.has(id));
            for (const section of normalized) {
                const ref = customSectionRef(section.id);
                if (!next.includes(ref)) next.push(ref);
            }
            return next;
        });
        setHiddenSections((prev) =>
            prev.filter((id) => isFixedSectionId(id) || refsFromSections(normalized).has(id)),
        );
    };

    const refsFromSections = (sections: CustomResumeSection[]) =>
        new Set<ResumeSectionId>(sections.map((section) => customSectionRef(section.id)));

    const addCustomSection = () => {
        syncCustomSections([...customSections, createCustomSection(customSections.length)]);
    };

    const removeCustomSection = (id: string) => {
        syncCustomSections(customSections.filter((section) => section.id !== id));
    };

    const localResumeList = migrateResumeList(JSON?.parse?.(localStorage.getItem('resumeList') || '[]'));

    const templateList: ResumeProps[] = useMemo(() => {
        const combineObj: Record<string, ResumeProps> = [...MOCK_TEMPLATE_LIST.map(migrateResume), ...localResumeList].reduce(
            (acc, cur) => {
                acc[cur.name] = cur;
                return acc;
            },
            {} as Record<string, ResumeProps>,
        );

        return Object.values(combineObj);
    }, [localResumeList]);

    const onFinish = (formData: Record<string, unknown>) => {
        let merged: ResumeProps;
        if (mode === 'edit' && focusRoot) {
            merged = mergeResumePartial(props.data, focusRoot, formData);
            merged = { ...merged, sectionOrder, hiddenSections };
        } else {
            merged = migrateResume({ ...formData, sectionOrder, hiddenSections } as ResumeProps);
        }
        props.onChange(merged);
        props.onSuccess();
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const handleOk = async () => {
        try {
            await form.validateFields();
            form.submit();
        } catch (e) {
            message.error('请填写完整信息');
        }
    };

    const scrollFormToPath = (path: string) => {
        window.setTimeout(() => {
            try {
                const xform = form as unknown as { scrollToPath?: (p: string) => void };
                xform.scrollToPath?.(path);
            } catch {
                /* noop */
            }
        }, 220);
    };

    const RenderTitle = useCallback(() => {
        const prefix = `${mode === 'edit' ? '编辑' : '新建'}`;
        const scope =
            mode === 'edit' && focusRoot ? (
                <span className={modalStyles.titleScope}>· {ROOT_SECTION_LABEL[focusRoot]}</span>
            ) : null;

        return (
            <div className="flex flex-wrap items-center gap-3">
                <span className="font-medium">
                    {prefix}简历
                    {scope}
                </span>
                {mode === 'create' && (
                    <div className={modalStyles.templateRow}>
                        <span>基于模版</span>
                        <Select
                            className="min-w-[160px]"
                            placeholder="选模版"
                            onChange={(value) => {
                                const m = migrateResume(templateList[value as number]);
                                form.setValues(m);
                                setSectionOrder(m.sectionOrder ?? [...DEFAULT_SECTION_ORDER]);
                                setHiddenSections(m.hiddenSections ?? []);
                                setCustomSections(m.customSections ?? []);
                            }}
                        >
                            {templateList.map((item, index) => (
                                <Select.Option key={item.name} value={index}>
                                    {item.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>
                )}
            </div>
        );
    }, [form, mode, templateList, focusRoot]);

    const isPartialEdit = mode === 'edit' && !!focusRoot;

    return (
        <>
            {mode === 'edit' && (
                <Button
                    type="primary"
                    ghost
                    onClick={() => {
                        pendingScrollPath.current = undefined;
                        setFocusRoot(null);
                        setOpen(true);
                    }}
                >
                    {props.children}
                </Button>
            )}
            {mode === 'create' && <div onClick={() => setOpen(true)}>{props.children}</div>}
            <Modal
                afterOpenChange={(visible) => {
                    if (!visible) {
                        setFocusRoot(null);
                        pendingScrollPath.current = undefined;
                        return;
                    }
                    if (mode === 'edit') {
                        const m = migrateResume(props.data);
                        form.setValues(m);
                        setSectionOrder(m.sectionOrder ?? [...DEFAULT_SECTION_ORDER]);
                        setHiddenSections(m.hiddenSections ?? []);
                        setCustomSections(m.customSections ?? []);
                        const path = pendingScrollPath.current;
                        pendingScrollPath.current = undefined;
                        if (path) {
                            scrollFormToPath(path);
                        }
                    } else {
                        setSectionOrder([...DEFAULT_SECTION_ORDER]);
                        setHiddenSections([]);
                        setCustomSections([]);
                    }
                }}
                destroyOnClose
                styles={{
                    content: {
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'calc(100vh - 96px)',
                        padding: 0,
                        overflow: 'hidden',
                        background: 'var(--sr-surface)',
                    },
                    header: {
                        flexShrink: 0,
                        padding: '16px 24px 12px',
                        margin: 0,
                        background: 'var(--sr-surface)',
                        borderBottom: '1px solid var(--sr-border)',
                    },
                    body: {
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '16px 24px',
                        background: 'var(--sr-surface)',
                        scrollbarColor: 'var(--sr-border-strong) var(--sr-surface-muted)',
                    },
                    footer: {
                        flexShrink: 0,
                        margin: 0,
                        padding: '12px 24px',
                        background: 'var(--sr-surface)',
                        borderTop: '1px solid var(--sr-border)',
                    },
                }}
                title={<RenderTitle />}
                width="min(920px, 92vw)"
                open={open}
                cancelText="取消"
                okText={mode === 'edit' ? '保存' : '创建'}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                {isPartialEdit && (
                    <div className={modalStyles.partialHint}>
                        <span>仅展示与预览点击相关的区块，保存后会写回整份简历。</span>
                        <Button
                            type="link"
                            size="small"
                            className="p-0"
                            onClick={() => {
                                if (!focusRoot) return;
                                const draft = mergeResumePartial(
                                    props.data,
                                    focusRoot,
                                    form.getValues() as Record<string, unknown>,
                                );
                                setFocusRoot(null);
                                queueMicrotask(() => {
                                    form.setValues(migrateResume(draft));
                                });
                            }}
                        >
                            展开全部字段
                        </Button>
                    </div>
                )}
                {!isPartialEdit && (
                    <div className={modalStyles.sectionOrderPanel}>
                        <div className={modalStyles.sectionOrderTitle}>版面顺序（从上至下）</div>
                        <div className="flex flex-col gap-1">
                            {sectionOrder.map((id, idx) => (
                                <div
                                    key={id}
                                    className={`${modalStyles.sectionOrderRow} ${hiddenSections.includes(id) ? modalStyles.sectionOrderRowHidden : ''}`}
                                >
                                    <span className="min-w-0 flex-1 truncate">
                                        {getSectionLabel(id, customSections)}
                                    </span>
                                    {hiddenSections.includes(id) && (
                                        <span className={modalStyles.sectionHiddenBadge}>已隐藏</span>
                                    )}
                                    <Button size="small" type="link" disabled={idx === 0} onClick={() => moveSection(idx, idx - 1)}>
                                        上移
                                    </Button>
                                    <Button
                                        size="small"
                                        type="link"
                                        disabled={idx === sectionOrder.length - 1}
                                        onClick={() => moveSection(idx, idx + 1)}
                                    >
                                        下移
                                    </Button>
                                    <Button size="small" type="link" onClick={() => toggleSectionHidden(id)}>
                                        {hiddenSections.includes(id) ? '显示' : '隐藏'}
                                    </Button>
                                    {!isFixedSectionId(id) && (
                                        <Button
                                            size="small"
                                            type="link"
                                            danger
                                            onClick={() => removeCustomSection(id.slice('custom:'.length))}
                                        >
                                            删除
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button size="small" type="dashed" className={modalStyles.sectionAddBtn} onClick={addCustomSection}>
                            新增自定义模块
                        </Button>
                    </div>
                )}
                <FormRender
                    className="resume-edit-form"
                    form={form}
                    schema={activeSchema}
                    widgets={formWidgets}
                    onFinish={onFinish}
                    footer={false}
                    labelWidth={112}
                    labelAlign="left"
                />
            </Modal>
        </>
    );
});

EditResumeModal.displayName = 'EditResumeModal';

export default EditResumeModal;
