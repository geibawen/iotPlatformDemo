import { useEffect } from 'react';
import { Card, Table, Tag, Button, Space, message } from 'antd';
import { usePluginStore } from '../../stores/pluginStore';
import { VERSION_STATUS_LABELS } from '@iot-platform/shared';
import type { PluginVersion } from '@iot-platform/shared';
import { api } from '../../api/client';

const statusColors: Record<string, string> = {
  draft: 'default',
  waiting_test: 'warning',
  testing: 'processing',
  approved: 'success',
  rejected: 'error',
  online: 'cyan',
  offline: 'default',
};

export default function TesterPluginList() {
  const { plugins, versions, fetchPlugins, loadVersions } = usePluginStore();

  useEffect(() => {
    fetchPlugins().then(() => {});
  }, []);

  useEffect(() => {
    plugins.forEach((p) => loadVersions(p.id));
  }, [plugins]);

  const testableVersions = versions.filter((v) =>
    v.status === 'waiting_test' || v.status === 'testing'
  );

  const handleStatusChange = async (versionId: string, newStatus: string) => {
    try {
      await api.put(`/plugins/versions/${versionId}/status`, { status: newStatus });
      message.success('状态更新成功');
      plugins.forEach((p) => loadVersions(p.id));
    } catch (err: any) {
      message.error(err.message || '操作失败');
    }
  };

  const columns = [
    {
      title: '插件', dataIndex: 'pluginId', key: 'pluginId',
      render: (pid: string) => plugins.find((p) => p.id === pid)?.name || pid,
    },
    { title: '版本号', dataIndex: 'version', key: 'version' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={statusColors[s]}>{VERSION_STATUS_LABELS[s as keyof typeof VERSION_STATUS_LABELS]}</Tag>,
    },
    { title: '发布说明', dataIndex: 'releaseNotes', key: 'releaseNotes', ellipsis: true },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: PluginVersion) => (
        <Space>
          {record.status === 'waiting_test' && (
            <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, 'testing')}>
              开始测试
            </Button>
          )}
          {record.status === 'testing' && (
            <>
              <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, 'approved')}>
                测试通过
              </Button>
              <Button size="small" danger onClick={() => handleStatusChange(record.id, 'rejected')}>
                测试不通过
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card title="插件版本测试">
      <Table dataSource={testableVersions} columns={columns} rowKey="id" />
    </Card>
  );
}
