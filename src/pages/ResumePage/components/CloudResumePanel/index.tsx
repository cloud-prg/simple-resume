import { isResumeLikeObject, parseResumeJsonText } from '@/util/resumeJson';
import {
    clearCloudCredentials,
    cloudShareHint,
    CloudApiError,
    createCloudResume,
    detectCloudApi,
    loadCloudResume,
    readCloudCredentials,
    updateCloudResume,
    writeCloudCredentials,
    type CloudCredentials,
} from '@/util/cloudResume';
import type { ResumeProps } from '@/types';
import { CloudDownloadOutlined, CloudUploadOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Typography, message } from 'antd';
import React from 'react';
import styles from '../../index.module.css';

type CloudResumePanelProps = {
    resume: ResumeProps;
    onImport: (data: Record<string, unknown>) => void;
};

type CloudAvailability = 'checking' | 'ready' | 'unavailable';

function resumeTitle(resume: ResumeProps): string {
    return resume.name ?? '';
}

function asResumeRecord(payload: unknown): Record<string, unknown> | null {
    let value = payload;
    if (typeof value === 'string') {
        try {
            value = parseResumeJsonText(value);
        } catch {
            return null;
        }
    }
    return isResumeLikeObject(value) ? value : null;
}

const CloudResumePanel: React.FC<CloudResumePanelProps> = ({ resume, onImport }) => {
    const [availability, setAvailability] = React.useState<CloudAvailability>('checking');
    const [credentials, setCredentials] = React.useState<CloudCredentials | null>(() => readCloudCredentials());
    const [saving, setSaving] = React.useState(false);
    const [loadOpen, setLoadOpen] = React.useState(false);
    const [loadId, setLoadId] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [savedId, setSavedId] = React.useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;
        detectCloudApi().then((ok) => {
            if (!cancelled) setAvailability(ok ? 'ready' : 'unavailable');
        });
        return () => {
            cancelled = true;
        };
    }, []);

    const remember = (next: CloudCredentials) => {
        writeCloudCredentials(next);
        setCredentials(next);
    };

    const persist = async (existing: CloudCredentials | null) => {
        const title = resumeTitle(resume);
        if (existing) {
            const saved = await updateCloudResume(existing, resume, title);
            remember(existing);
            setSavedId(saved.id);
            return;
        }
        const created = await createCloudResume(resume, title);
        remember({ id: created.id, editToken: created.editToken });
        setSavedId(created.id);
    };

    const handleSave = async () => {
        if (availability === 'checking') {
            message.info('正在检测云端接口');
            return;
        }
        if (availability !== 'ready') {
            message.warning('云端保存需要部署到 Cloudflare Pages，当前站点没有可用的云端接口');
            return;
        }

        const existing = readCloudCredentials();
        if (existing) {
            const confirmed = await new Promise<boolean>((resolve) => {
                Modal.confirm({
                    title: '更新云端简历',
                    content: `将用当前模板「${resume.name || '未命名'}」覆盖云端 ID ${existing.id}。`,
                    okText: '更新',
                    cancelText: '取消',
                    onOk: () => resolve(true),
                    onCancel: () => resolve(false),
                });
            });
            if (!confirmed) return;
        }

        setSaving(true);
        try {
            await persist(existing);
            message.success(existing ? '云端简历已更新' : '已保存到云端');
        } catch (error) {
            reportSaveError(error, Boolean(existing));
        } finally {
            setSaving(false);
        }
    };

    const reportSaveError = (error: unknown, hadCredentials: boolean) => {
        if (error instanceof CloudApiError && error.status === 401 && hadCredentials) {
            clearCloudCredentials();
            setCredentials(null);
            message.error('本机编辑令牌已失效，已清除。请再点一次「保存到云端」以另存为新副本');
            return;
        }
        if (error instanceof CloudApiError && (error.status === 0 || error.message === '云端接口不可用')) {
            setAvailability('unavailable');
            message.warning('云端保存需要部署到 Cloudflare Pages，当前站点没有可用的云端接口');
            return;
        }
        message.error(error instanceof Error ? error.message : '保存到云端失败');
    };

    const handleLoad = async () => {
        const id = loadId.trim();
        if (!id) {
            message.error('请输入云端 ID');
            return;
        }
        if (availability === 'checking') {
            message.info('正在检测云端接口');
            return;
        }
        if (availability !== 'ready') {
            message.warning('从云端加载需要部署到 Cloudflare Pages，当前站点没有可用的云端接口');
            return;
        }

        setLoading(true);
        try {
            const remote = await loadCloudResume(id);
            const record = asResumeRecord(remote.payload);
            if (!record) {
                message.error('云端数据不是可导入的简历 JSON');
                return;
            }
            onImport(record);
            setLoadOpen(false);
            setLoadId('');
            message.success('已从云端加载为新模板');
        } catch (error) {
            if (error instanceof CloudApiError && (error.status === 0 || error.message === '云端接口不可用')) {
                setAvailability('unavailable');
                message.warning('从云端加载需要部署到 Cloudflare Pages，当前站点没有可用的云端接口');
                return;
            }
            message.error(error instanceof Error ? error.message : '从云端加载失败');
        } finally {
            setLoading(false);
        }
    };

    const copyHint = async () => {
        if (!savedId) return;
        try {
            await navigator.clipboard.writeText(cloudShareHint(savedId));
            message.success('加载说明已复制');
        } catch {
            message.error('复制失败，请允许剪贴板权限后重试');
        }
    };

    const buttonClass = availability === 'ready' ? styles.btnOutline : `${styles.btnOutline} ${styles.btnMuted}`;

    return (
        <>
            <div className={buttonClass} onClick={saving ? undefined : handleSave}>
                <CloudUploadOutlined />
                <span>{saving ? '保存中…' : '保存到云端'}</span>
            </div>
            <div className={buttonClass} onClick={() => setLoadOpen(true)}>
                <CloudDownloadOutlined />
                <span>从云端加载</span>
            </div>
            {availability === 'unavailable' && (
                <p className={styles.hint}>
                    云端保存需要部署到 Cloudflare Pages。当前站点没有 /api/resumes，本地导入导出仍然可用。
                </p>
            )}
            {availability === 'ready' && credentials && (
                <p className={styles.hint}>
                    本机可更新云端 ID：{credentials.id}
                </p>
            )}

            <Modal
                title="已保存到云端"
                open={Boolean(savedId)}
                onCancel={() => setSavedId(null)}
                footer={[
                    <Button key="copy" onClick={copyHint}>复制加载说明</Button>,
                    <Button key="ok" type="primary" onClick={() => setSavedId(null)}>知道了</Button>,
                ]}
            >
                <p>把下面的 ID 发到其他设备，对方在「从云端加载」中输入即可读取。编辑令牌只留在当前浏览器，用于以后更新，不会出现在分享内容里。</p>
                {savedId && (
                    <Typography.Paragraph copyable={{ text: savedId }} style={{ marginBottom: 0 }}>
                        {savedId}
                    </Typography.Paragraph>
                )}
            </Modal>

            <Modal
                title="从云端加载"
                open={loadOpen}
                onCancel={() => setLoadOpen(false)}
                okText="加载"
                cancelText="取消"
                confirmLoading={loading}
                onOk={handleLoad}
                destroyOnClose
            >
                <p className={styles.hint} style={{ marginTop: 0 }}>
                    输入保存时得到的云端 ID。加载后会按现有导入流程新增一份本地模板。
                </p>
                <Input
                    autoFocus
                    value={loadId}
                    placeholder="云端 ID"
                    onChange={(event) => setLoadId(event.target.value)}
                />
            </Modal>
        </>
    );
};

export default CloudResumePanel;
