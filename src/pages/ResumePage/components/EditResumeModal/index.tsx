import React, { useCallback, useMemo } from 'react';
import FormRender, { useForm } from 'form-render';
import schema from './schema';
import { ResumeProps } from '@/types';
import { Modal, Button, message, Select } from 'antd';
import KeywordsList from '../KeywordsList';
import { MOCK_TEMPLATE_LIST } from '@/mock';

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

    const localResumeList = JSON?.parse?.(localStorage.getItem('resumeList') || '[]');

    const templateList: ResumeProps[] = useMemo(() => {
        const combineObj: Record<string, ResumeProps> = [...MOCK_TEMPLATE_LIST, ...localResumeList].reduce((acc, cur) => {
            acc[cur.name] = cur
            return acc;
        }, {})

        return Object.values(combineObj)
    }, [localResumeList])

    const onFinish = (formData: ResumeProps) => {
        props.onChange(formData);
        props.onSuccess()
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
                    form.setValues(templateList[value])
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
                    if (visible && mode === 'edit') {
                        form.setValues(props.data)
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
                <FormRender
                    form={form}
                    schema={schema}
                    onFinish={onFinish}
                    footer={false}
                    labelWidth={100}
                    labelAlign='left'
                    widgets={{
                        keywordsList: KeywordsList
                    }}
                />
            </Modal>
        </>
    );
}

export default Index;