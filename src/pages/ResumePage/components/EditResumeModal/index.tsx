import React, { useCallback, useMemo } from 'react';
import FormRender, { useForm } from 'form-render';
import schema from './schema';
import type { ResumeBodySectionId, ResumeProps } from '@/types';
import { Modal, Button, message, Select } from 'antd';
import { MOCK_TEMPLATE_LIST } from '@/mock';
import { DEFAULT_SECTION_ORDER, migrateResume, migrateResumeList } from '@/util/resumeMigrate';

const SECTION_LABEL: Record<ResumeBodySectionId, string> = {
    skills: '专业技能',
    workHistory: '工作经历',
    projectExperience: '项目经历',
    education: '教育经历',
};

interface IProps {
    children: React.ReactNode;
    data: ResumeProps;
    mode?: 'create' | 'edit';
    onChange: (data: ResumeProps) => void;
    onSuccess: () => void;
}

const Index: React.FC<IProps> = (props) => {
    const { mode = 'edit' } = props;
    const form = useForm();
    const [open, setOpen] = React.useState(false);
    const [sectionOrder, setSectionOrder] = React.useState<ResumeBodySectionId[]>([...DEFAULT_SECTION_ORDER]);

    const moveSection = (from: number, to: number) => {
        if (to < 0 || to >= sectionOrder.length) return;
        setSectionOrder((prev) => {
            const next = [...prev];
            const [id] = next.splice(from, 1);
            next.splice(to, 0, id);
            return next;
        });
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

    const onFinish = (formData: ResumeProps) => {
        props.onChange(migrateResume({ ...formData, sectionOrder }));
        props.onSuccess();
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
    }

    const handleOk = async () => {
        try {
            await form.validateFields();
            form.submit();
        } catch (e) {
            message.error('请填写完整信息')
        }
    }

    const RenderTitle = useCallback(() => {
        const prefix = `${mode === 'edit' ? '编辑' : '新建'}`

        return <div className='flex gap-[12px] items-center'>
            <span >{prefix}</span>
            {mode === 'create' && <div className='text-sm flex gap-[12px] items-center'>
                <span>(模版选择:)</span>
                <Select className='w-[160px]' onChange={(value) => {
                    const m = migrateResume(templateList[value as number]);
                    form.setValues(m);
                    setSectionOrder(m.sectionOrder ?? [...DEFAULT_SECTION_ORDER]);
                }}>
                    {templateList.map((item, index) => {
                        return <Select.Option key={item.name} value={index}>{item.name}</Select.Option>
                    })}
                </Select>
            </div>}
        </div>
    }, [form, mode, templateList])

    return (
        <>
            {mode === 'edit' && <Button type="primary" ghost onClick={() => { setOpen(true); }}>{props.children}</Button>}
            {mode === 'create' && <div onClick={() => { setOpen(true) }}>{props.children}</div>}
            <Modal
                afterOpenChange={(visible) => {
                    if (!visible) return;
                    if (mode === 'edit') {
                        const m = migrateResume(props.data);
                        form.setValues(m);
                        setSectionOrder(m.sectionOrder ?? [...DEFAULT_SECTION_ORDER]);
                    } else {
                        setSectionOrder([...DEFAULT_SECTION_ORDER]);
                    }
                }}
                destroyOnClose
                styles={{
                    header: {
                        paddingBottom: '12px'
                    }
                }}
                title={<RenderTitle />}
                width={'80%'}
                open={open}
                cancelText="取消"
                okText={mode === 'edit' ? '保存' : '创建'}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <div className="mb-4 rounded border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="mb-2 text-sm font-medium text-gray-700">版面顺序（从上至下）</div>
                    <div className="flex flex-col gap-1">
                        {sectionOrder.map((id, idx) => (
                            <div key={id} className="flex items-center gap-2 text-sm">
                                <span className="min-w-0 flex-1 truncate">{SECTION_LABEL[id]}</span>
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
                            </div>
                        ))}
                    </div>
                </div>
                <FormRender
                    className="resume-edit-form"
                    form={form}
                    schema={schema}
                    onFinish={onFinish}
                    footer={false}
                    labelWidth={100}
                    labelAlign='left'
                />
            </Modal>
        </>
    );
}

export default Index;