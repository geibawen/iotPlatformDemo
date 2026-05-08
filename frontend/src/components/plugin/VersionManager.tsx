import React, { useState, useMemo, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Upload, message, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { usePluginStore } from '../../stores/pluginStore';
import type { PluginVersion, VersionStatus } from '../../types/plugin';
import { VERSION_STATUS_LABELS } from '../../types/plugin';
import dayjs from 'dayjs';

interface VersionManagerProps {
  pluginId: string;
}

const VERSION_STATUS_COLORS: Record<VersionStatus, string> = {
  draft: 'default',
  waiting_test: 'warning',
  testing: 'processing',
  approved: 'success',
  rejected: 'error',
  online: 'cyan',
  offline: 'default',
};

const DEV_NEXT_STATUS: Partial<Record<VersionStatus, VersionStatus>> = {
  draft: 'waiting_test',
  approved: 'online',
  online: 'offline',
  offline: 'online',
};

const DEV_ACTION_LABELS: Partial<Record<VersionStatus, string>> = {
  draft: '提交测试',
  approved: '上线发布',
  online: '下线',
  offline: '重新上线',
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const VersionManager: React.FC<VersionManagerProps> = ({ pluginId }) => {
  const allVersions = usePluginStore((s) => s.versions);
  const versions = useMemo(() => allVersions.filter((v) => v.pluginId === pluginId), [allVersions, pluginId]);
  const loadVersions = usePluginStore((s) => s.loadVersions);
  const addVersion = usePluginStore((s) => s.addVersion);
  const updateVersion = usePluginStore((s) => s.updateVersion);
  const deleteVersion = usePluginStore((s) => s.deleteVersion);

  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadVersions(pluginId);
  }, [pluginId, loadVersions]);

  const handleCreate = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    if (!uploadFile) {
      message.error('请上传插件包');
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('version', values.version);
      formData.append('releaseNotes', values.releaseNotes || '');
      formData.append('file', uploadFile);
      await addVersion(pluginId, formData);
      message.success('版本创建成功');
      setModalOpen(false);
      form.resetFields();
      setUploadFile(null);
    } catch {
      message.error('创建失败');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (id: string, currentStatus: VersionStatus) => {
    const next = DEV_NEXT_STATUS[currentStatus];
    if (next) {
      try {
        await updateVersion(id, { status: next });
        message.success(`版本已更新为"${VERSION_STATUS_LABELS[next]}"`);
      } catch {
        message.error('操作失败');
      }
    }
  };

  const columns = [
    { title: '版本号', dataIndex: 'version', key: 'version', width: 120 },
    { title: '文件名', dataIndex: 'fileName', key: 'fileName', width: 220 },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 120,
      render: (size: number) => formatFileSize(size),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: VersionStatus) => (
        <Tag color={VERSION_STATUS_COLORS[status]}>{VERSION_STATUS_LABELS[status]}</Tag>
      ),
    },
    {
      title: '发布说明',
      dataIndex: 'releaseNotes',
      key: 'releaseNotes',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: PluginVersion) => (
        <Space>
          {DEV_NEXT_STATUS[record.status] && (
            <Popconfirm
              title={`确认${DEV_ACTION_LABELS[record.status]}？`}
              onConfirm={() => handleStatusChange(record.id, record.status)}
            >
              <Button size="small" type="primary">
                {DEV_ACTION_LABELS[record.status]}
              </Button>
            </Popconfirm>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && (
            <Popconfirm title="确认删除此版本？" onConfirm={async () => {
              try {
                await deleteVersion(record.id);
                message.success('版本已删除');
              } catch {
                message.error('删除失败');
              }
            }}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const sortedVersions = [...versions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
          新建版本
        </Button>
      </div>
      <Table
        dataSource={sortedVersions}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
      />

      <Modal
        title="新建版本"
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setUploadFile(null);
          setUploading(false);
        }}
        confirmLoading={uploading}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="version"
            label="版本号"
            rules={[
              { required: true, message: '请输入版本号' },
              { pattern: /^\d+\.\d+\.\d+$/, message: '请使用语义化版本号格式 (如 1.0.0)' },
            ]}
          >
            <Input placeholder="如：1.2.0" />
          </Form.Item>
          <Form.Item name="releaseNotes" label="发布说明">
            <Input.TextArea placeholder="描述此版本的更新内容" rows={4} />
          </Form.Item>
          <Form.Item label="上传 RN 插件包" required>
            <Upload
              beforeUpload={(file) => {
                setUploadFile(file);
                return false;
              }}
              onRemove={() => setUploadFile(null)}
              maxCount={1}
              fileList={uploadFile ? [{ uid: '-1', name: uploadFile.name, status: 'done' }] : []}
              accept=".zip,.tar.gz,.tgz,.bundle"
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VersionManager;
