import { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Progress, message, Popconfirm } from 'antd';
import { PlusOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { useFirmwareStore } from '../../stores/firmwareStore';
import { useProductStore } from '../../stores/productStore';
import { OTA_STRATEGY_LABELS, OTA_TASK_STATUS_LABELS } from '@iot-platform/shared';
import type { OtaTask } from '@iot-platform/shared';

const statusColors: Record<string, string> = {
  pending: 'default',
  running: 'processing',
  paused: 'warning',
  completed: 'success',
};

export default function OtaTaskList() {
  const { firmwares, otaTasks, loading, fetchFirmwares, fetchOtaTasks, addOtaTask, startOtaTask, pauseOtaTask, deleteOtaTask } = useFirmwareStore();
  const { products } = useProductStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFirmwares();
    fetchOtaTasks();
  }, []);

  const handleAdd = async () => {
    const values = await form.validateFields();
    await addOtaTask(values);
    message.success('OTA任务创建成功');
    setModalOpen(false);
    form.resetFields();
  };

  const columns = [
    { title: '任务名称', dataIndex: 'name', key: 'name' },
    {
      title: '产品', dataIndex: 'productId', key: 'productId',
      render: (pid: string) => products.find((p) => p.id === pid)?.name || pid,
    },
    {
      title: '目标固件', dataIndex: 'firmwareId', key: 'firmwareId',
      render: (fid: string) => firmwares.find((f) => f.id === fid)?.version || fid,
    },
    {
      title: '升级策略', dataIndex: 'strategy', key: 'strategy',
      render: (s: string) => OTA_STRATEGY_LABELS[s as keyof typeof OTA_STRATEGY_LABELS] || s,
    },
    {
      title: '进度', key: 'progress',
      render: (_: unknown, r: OtaTask) => {
        const pct = r.totalDevices > 0 ? Math.round((r.upgradedDevices / r.totalDevices) * 100) : 0;
        return <Progress percent={pct} size="small" format={() => `${r.upgradedDevices}/${r.totalDevices}`} />;
      },
    },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={statusColors[s]}>{OTA_TASK_STATUS_LABELS[s as keyof typeof OTA_TASK_STATUS_LABELS]}</Tag>,
    },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: OtaTask) => (
        <Space>
          {record.status === 'pending' && <Button size="small" icon={<PlayCircleOutlined />} onClick={() => startOtaTask(record.id)}>启动</Button>}
          {record.status === 'running' && <Button size="small" icon={<PauseCircleOutlined />} onClick={() => pauseOtaTask(record.id)}>暂停</Button>}
          {record.status === 'paused' && <Button size="small" icon={<PlayCircleOutlined />} onClick={() => startOtaTask(record.id)}>继续</Button>}
          <Popconfirm title="确认删除?" onConfirm={() => deleteOtaTask(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="OTA 升级任务"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>创建任务</Button>}
      >
        <Table dataSource={otaTasks} columns={columns} rowKey="id" loading={loading} />
      </Card>

      <Modal title="创建 OTA 任务" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="任务名称" rules={[{ required: true }]}>
            <Input placeholder="如：灯泡 v1.3.0 全量升级" />
          </Form.Item>
          <Form.Item name="productId" label="产品" rules={[{ required: true }]}>
            <Select placeholder="选择产品">
              {products.map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="firmwareId" label="目标固件" rules={[{ required: true }]}>
            <Select placeholder="选择固件版本">
              {firmwares.map((f) => <Select.Option key={f.id} value={f.id}>{f.version} ({f.fileName})</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="strategy" label="升级策略" rules={[{ required: true }]}>
            <Select placeholder="选择策略">
              <Select.Option value="force">强制升级</Select.Option>
              <Select.Option value="silent">静默升级</Select.Option>
              <Select.Option value="prompt">提示升级</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetScope" label="目标范围" initialValue="all">
            <Select>
              <Select.Option value="all">全部设备</Select.Option>
              <Select.Option value="specified">指定版本</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
