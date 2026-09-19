import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Collapse, Input, Modal, Segmented, Space, Typography, message } from 'antd';
import type { ResumeProps } from '@/types';
import {
    AI_SETTINGS_KEY,
    isResumeAiMockAvailable,
    readResumeAiSettings,
    requestResumeAi,
    type ResumeAiInputMode,
    type ResumeAiSettings,
} from '@/api/resumeAi';

const { Text } = Typography;

type AiImportModalProps = {
    open: boolean;
    resume: ResumeProps;
    onClose: () => void;
    onApply: (resume: ResumeProps) => void;
};

type AiImportStatus = 'idle' | 'loading' | 'error';

export const AiImportModal: React.FC<AiImportModalProps> = ({ open, resume, onClose, onApply }) => {
    const [settings, setSettings] = useState<ResumeAiSettings>(() => readResumeAiSettings());
    const [inputMode, setInputMode] = useState<ResumeAiInputMode>('instruction');
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<AiImportStatus>('idle');
    const [errorText, setErrorText] = useState('');
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
    }, [settings]);

    useEffect(() => {
        if (!isResumeAiMockAvailable() && settings.mode === 'mock') {
            setSettings((current) => ({ ...current, mode: 'custom' }));
        }
    }, [settings.mode]);

    useEffect(() => {
        if (!open) {
            abortRef.current?.abort();
            abortRef.current = null;
            setInput('');
            setStatus('idle');
            setErrorText('');
        }
    }, [open]);

    useEffect(() => () => abortRef.current?.abort(), []);

    const updateSettings = (patch: Partial<ResumeAiSettings>) => {
        setSettings((current) => ({ ...current, ...patch }));
    };

    const handleClose = () => {
        abortRef.current?.abort();
        abortRef.current = null;
        onClose();
    };

    const handleSubmit = async () => {
        if (!input.trim()) {
            setErrorText(inputMode === 'instruction' ? '请描述你想修改的内容。' : '请粘贴要转换的简历内容。');
            setStatus('error');
            return;
        }

        abortRef.current?.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setStatus('loading');
        setErrorText('');

        try {
            const nextResume = await requestResumeAi({
                settings,
                inputMode,
                input,
                resume,
                signal: controller.signal,
            });
            onApply(nextResume);
            message.success('AI 导入成功');
            onClose();
        } catch (error) {
            if (controller.signal.aborted) return;
            setStatus('error');
            setErrorText(error instanceof Error ? error.message : 'AI 导入失败，请稍后重试。');
        } finally {
            if (abortRef.current === controller) {
                abortRef.current = null;
            }
            if (!controller.signal.aborted) {
                setStatus((current) => current === 'error' ? current : 'idle');
            }
        }
    };

    const settingsPanel = (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {isResumeAiMockAvailable() && (
                <div>
                    <Text type="secondary">调用模式</Text>
                    <div style={{ marginTop: 6 }}>
                        <Segmented<ResumeAiSettings['mode']>
                            value={settings.mode}
                            onChange={(value) => updateSettings({ mode: value })}
                            options={[
                                { label: '自定义 API', value: 'custom' },
                                { label: '开发 Mock', value: 'mock' },
                            ]}
                        />
                    </div>
                </div>
            )}
            {settings.mode === 'custom' ? (
                <>
                    <div>
                        <Text type="secondary">API Key</Text>
                        <Input.Password
                            style={{ marginTop: 6 }}
                            value={settings.apiKey}
                            placeholder="只保存在当前浏览器，不会导出"
                            onChange={(event) => updateSettings({ apiKey: event.target.value })}
                        />
                    </div>
                    <div>
                        <Text type="secondary">Base URL</Text>
                        <Input
                            style={{ marginTop: 6 }}
                            value={settings.baseUrl}
                            placeholder="https://openrouter.ai/api/v1"
                            onChange={(event) => updateSettings({ baseUrl: event.target.value })}
                        />
                    </div>
                    <div>
                        <Text type="secondary">Model</Text>
                        <Input
                            style={{ marginTop: 6 }}
                            value={settings.model}
                            placeholder="填入提供商标注的免费模型名（常见后缀：:free）"
                            onChange={(event) => updateSettings({ model: event.target.value })}
                        />
                    </div>
                    <Text type="secondary">
                        支持 OpenAI Chat Completions 兼容接口。免费额度、模型名称和跨域能力由对应服务商决定。
                    </Text>
                </>
            ) : (
                <Alert
                    type="success"
                    showIcon
                    message="开发 Mock 已启用"
                    description="仅用于本地联调，会返回当前简历 JSON，不会请求外部模型。"
                />
            )}
        </Space>
    );

    return (
        <Modal
            title="AI 导入简历"
            open={open}
            onCancel={handleClose}
            onOk={handleSubmit}
            okText="转换并导入"
            cancelText="取消"
            confirmLoading={status === 'loading'}
            destroyOnClose
            width={680}
        >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Alert
                    type="info"
                    showIcon
                    message="AI 会读取当前模板并生成完整 ResumeProps JSON"
                    description="转换成功后会直接覆盖当前模板；API Key 只保存在浏览器 localStorage，不会进入简历导出文件。"
                />

                <div>
                    <Text type="secondary">处理方式</Text>
                    <div style={{ marginTop: 6 }}>
                        <Segmented<ResumeAiInputMode>
                            block
                            value={inputMode}
                            onChange={(value) => {
                                setInputMode(value);
                                setErrorText('');
                                setStatus('idle');
                            }}
                            options={[
                                { label: '按描述修改当前简历', value: 'instruction' },
                                { label: '粘贴内容转换为简历', value: 'content' },
                            ]}
                        />
                    </div>
                </div>

                <Input.TextArea
                    rows={8}
                    value={input}
                    onChange={(event) => {
                        setInput(event.target.value);
                        if (status === 'error') setStatus('idle');
                    }}
                    disabled={status === 'loading'}
                    placeholder={inputMode === 'instruction'
                        ? '例如：把求职方向改成前端工程师；在最新工作经历中补充 React、TypeScript，并把项目成果改成量化表达。'
                        : '粘贴你已经修改好的简历文本，AI 会把它转换成当前模板可导入的 JSON。'}
                />

                <Collapse
                    items={[{ key: 'settings', label: '模型连接设置（首次使用需要配置）', children: settingsPanel }]}
                    defaultActiveKey={settings.mode === 'custom' && (!settings.apiKey || !settings.model) ? ['settings'] : []}
                />

                {errorText && status === 'error' && <Alert type="error" showIcon message={errorText} />}

                <Button type="primary" block onClick={handleSubmit} loading={status === 'loading'}>
                    转换并导入当前模板
                </Button>
            </Space>
        </Modal>
    );
};
