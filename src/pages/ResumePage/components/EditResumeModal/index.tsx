import React from 'react';
import FormRender, { useForm } from 'form-render';
import schema from './schema';
import { ResumeProps } from '@/types';
import { Modal, Button, message } from 'antd';
import KeywordsList from '../KeywordsList';

interface IProps {
    children: React.ReactNode;
    data: ResumeProps;
    onChange: (data: ResumeProps) => void;
}

const Index: React.FC<IProps> = (props) => {
    const form = useForm();
    const [open, setOpen] = React.useState(false);

    const onFinish = (formData: ResumeProps) => {
        props.onChange(formData);
        message.success('编辑已保存');
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

    return (
        <>
            <Button type="primary" ghost onClick={() => { setOpen(true); }}>{props.children}</Button>
            <Modal
                afterOpenChange={(visible) => {
                    if (visible) {
                        form.setValues(props.data)
                    }
                }}
                destroyOnClose
                title="编辑表单"
                width={'80%'}
                open={open}
                cancelText="取消"
                okText="编辑"
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <FormRender
                    form={form}
                    schema={schema}
                    onFinish={onFinish}
                    footer={false}
                    labelWidth={90}
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