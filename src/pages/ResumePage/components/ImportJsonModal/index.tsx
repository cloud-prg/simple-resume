import { isResumeLikeObject, parseResumeJsonText, tryPrettyPrintJson } from '@/util/resumeJson';
import { Alert, Button, Input, Modal, message } from 'antd';
import React from 'react';

type ImportJsonModalProps = {
    open: boolean;
    onClose: () => void;
    onImport: (data: Record<string, unknown>) => void;
};

const ImportJsonModal: React.FC<ImportJsonModalProps> = ({ open, onClose, onImport }) => {
    const [text, setText] = React.useState('');
    const [error, setError] = React.useState('');

    const handleFormat = () => {
        const pretty = tryPrettyPrintJson(text);
        if (!pretty) {
            const nextError = '无法解析 JSON，请检查括号、引号和逗号';
            setError(nextError);
            message.error('无法解析 JSON');
            return;
        }
        setText(pretty);
        setError('');
        message.success('已格式化');
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const pasted = event.clipboardData.getData('text');
        const el = event.currentTarget;
        const replacingAll = el.selectionStart === 0 && el.selectionEnd === el.value.length;
        if (el.value && !replacingAll) return;

        const pretty = tryPrettyPrintJson(pasted);
        if (!pretty) return;

        event.preventDefault();
        setText(pretty);
        setError('');
    };

    const handleImport = () => {
        if (!text.trim()) {
            setError('请先粘贴简历 JSON');
            message.error('请先粘贴 JSON');
            return;
        }

        let parsed: unknown;
        try {
            parsed = parseResumeJsonText(text);
        } catch {
            setError('无法解析 JSON。未格式化也可以导入，但内容必须是合法 JSON。');
            message.error('无法解析 JSON');
            return;
        }

        if (!isResumeLikeObject(parsed)) {
            setError('JSON 已解析，但不是简历数据。需要一个对象，并包含姓名、联系方式、经历或技能等字段。');
            message.error('JSON 不符合简历结构');
            return;
        }

        onImport(parsed);
        message.success('导入成功');
        setText('');
        setError('');
        onClose();
    };

    return (
        <Modal
            title="粘贴 JSON 导入"
            open={open}
            onCancel={onClose}
            width={720}
            destroyOnClose={false}
            footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <Button onClick={handleFormat}>格式化</Button>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button onClick={onClose}>取消</Button>
                        <Button type="primary" onClick={handleImport}>
                            导入
                        </Button>
                    </div>
                </div>
            }
        >
            <p style={{ marginTop: 0, marginBottom: 12, color: 'var(--sr-text-secondary)', lineHeight: 1.6 }}>
                把网页 Agent 生成的简历 JSON 粘贴到下方。未缩进的 JSON 也可以导入；内容能解析时会自动整理成缩进格式。也可以保留代码块标记。
            </p>
            <Input.TextArea
                value={text}
                placeholder='例如 {"name":"我的简历","contact":{"name":"张三"},"skills":[{"value":"熟悉 React"}]}'
                autoSize={{ minRows: 14, maxRows: 22 }}
                onChange={(event) => {
                    setText(event.target.value);
                    if (error) setError('');
                }}
                onPaste={handlePaste}
                style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                    fontSize: 13,
                }}
            />
            {error ? <Alert style={{ marginTop: 12 }} type="error" showIcon message={error} /> : null}
        </Modal>
    );
};

export default ImportJsonModal;
