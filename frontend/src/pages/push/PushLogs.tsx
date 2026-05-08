import React, { useState } from 'react';
import { Table, Tag, Card, Typography, Space, Select, Button, Drawer, Descriptions, Empty, message } from 'antd';
import { ReloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { usePushStore } from '../../stores/pushStore';
import type { PushLog, PushLogStatus } from '../../types/push';
import dayjs from 'dayjs';

const PushLogs: React.FC = () => {
  const logs = usePushStore((s) => s.logs);
  const clearLogs = usePushStore((s) => s.clearLogs);

  const [statusFilter, setStatusFilter] = useState<PushLogStatus | ''>('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<PushLog | undefined>();

  const filteredLogs = logs.filter((l) => {
    return !statusFilter || l.status === statusFilter;
  });

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (ts: string) => dayjs(ts).format('YYYY-MM-DD HH:mm:ss'),
    },
    { title: '规则名称', dataIndex: 'ruleName', key: 'ruleName', width: 160 },
    { title: '推送通道', dataIndex: 'channelName', key: 'channelName', width: 150 },
    { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: PushLogStatus) => (
        <Tag color={status === 'success' ? 'success' : 'error'}>
          {status === 'success' ? '成功' : '失败'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      render: (_: unknown, record: PushLog) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedLog(record);
            setDetailOpen(true);
          }}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>推送日志</Typography.Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
            刷新
          </Button>
          {logs.length > 0 && (
            <Button danger icon={<DeleteOutlined />} onClick={async () => {
              try {
                await clearLogs();
              } catch {
                message.error('清空失败');
              }
            }}>
              清空日志
            </Button>
          )}
        </Space>
      </div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="全部状态"
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || '')}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value="success">成功</Select.Option>
            <Select.Option value="failed">失败</Select.Option>
          </Select>
        </Space>
        <Table
          dataSource={filteredLogs}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      <Drawer
        title="推送日志详情"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        width={560}
      >
        {selectedLog ? (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="时间">{dayjs(selectedLog.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            <Descriptions.Item label="规则名称">{selectedLog.ruleName}</Descriptions.Item>
            <Descriptions.Item label="推送通道">{selectedLog.channelName}</Descriptions.Item>
            <Descriptions.Item label="设备名称">{selectedLog.deviceName}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedLog.status === 'success' ? 'success' : 'error'}>
                {selectedLog.status === 'success' ? '成功' : '失败'}
              </Tag>
            </Descriptions.Item>
            {selectedLog.errorMsg && (
              <Descriptions.Item label="错误信息">
                <span style={{ color: '#ff4d4f' }}>{selectedLog.errorMsg}</span>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="推送内容">
              <div style={{
                background: '#f5f5f5',
                padding: 12,
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                maxHeight: 300,
                overflow: 'auto',
              }}>
                {selectedLog.content}
              </div>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty />
        )}
      </Drawer>
    </div>
  );
};

export default PushLogs;
