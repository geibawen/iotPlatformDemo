import { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, message, Popconfirm } from 'antd';
import { PlusOutlined, SendOutlined } from '@ant-design/icons';
import { useAppPushStore } from '../../stores/appPushStore';
import { useProductStore } from '../../stores/productStore';
import { APP_PUSH_STATUS_LABELS, APP_PUSH_TYPE_LABELS, APP_PUSH_TARGET_LABELS } from '@iot-platform/shared';
import type { AppPushMessage } from '@iot-platform/shared';

const statusColors: Record<string, string> = {
  draft: 'default',
  scheduled: 'processing',
  sending: 'warning',
  sent: 'success',
  failed: 'error',
};

export default function AppPushMessages() {
  const { messages, loading, fetchMessages, addMessage, sendMessage, deleteMessage } = useAppPushStore();
  const { products } = useProductStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { fetchMessages(); }, []);

  const handleAdd = async () => {
    const values = await form.validateFields();
    const data: Partial<AppPushMessage> = {
      title: values.title,
      content: values.content,
      type: values.type,
      targetType: values.targetType,
      targetProductIds: values.targetProductIds,
      scheduledAt: values.scheduledAt?.toISOString(),
    };
    await addMessage(data);
    message.success('消息创建成功');
    setModalOpen(false);
    form.resetFields();
  };

  const handleSend = async (id: string) => {
    await sendMessage(id);
    message.success('消息已发送');
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title' },
    {
      title: '类型', dataIndex: 'type', key: 'type',
      render: (t: string) => APP_PUSH_TYPE_LABELS[t as keyof typeof APP_PUSH_TYPE_LABELS] || t,
    },
    {
      title: '目标', dataIndex: 'targetType', key: 'targetType',
      render: (t: string) => APP_PUSH_TARGET_LABELS[t as keyof typeof APP_PUSH_TARGET_LABELS] || t,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={statusColors[s]}>{APP_PUSH_STATUS_LABELS[s as keyof typeof APP_PUSH_STATUS_LABELS]}</Tag>,
    },
    {
      title: '送达/打开', key: 'stats',
      render: (_: unknown, r: AppPushMessage) => `${r.statistics.delivered}/${r.statistics.opened}`,
    },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: AppPushMessage) => (
        <Space>
          {(record.status === 'draft' || record.status === 'scheduled') && (
            <Button size="small" type="primary" icon={<SendOutlined />} onClick={() => handleSend(record.id)}>发送</Button>
          )}
          <Popconfirm title="确认删除?" onConfirm={() => deleteMessage(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="App 消息推送"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>创建消息</Button>}
      >
        <Table dataSource={messages} columns={columns} rowKey="id" loading={loading} />
      </Card>

      <Modal title="创建推送消息" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)} destroyOnClose width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input placeholder="消息标题" />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="消息内容" />
          </Form.Item>
          <Form.Item name="type" label="消息类型" initialValue="notification">
            <Select>
              <Select.Option value="notification">通知消息</Select.Option>
              <Select.Option value="marketing">营销推送</Select.Option>
              <Select.Option value="alert">告警推送</Select.Option>
              <Select.Option value="system">系统消息</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetType" label="推送目标" initialValue="all">
            <Select>
              <Select.Option value="all">全部用户</Select.Option>
              <Select.Option value="product">按产品</Select.Option>
              <Select.Option value="device_group">按设备组</Select.Option>
              <Select.Option value="specified">指定用户</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetProductIds" label="目标产品" dependencies={['targetType']}>
            <Select mode="multiple" placeholder="选择产品" allowClear>
              {products.map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="scheduledAt" label="定时发送">
            <DatePicker showTime placeholder="留空则立即发送" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
