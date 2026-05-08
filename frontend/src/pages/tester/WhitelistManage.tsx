import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { usePluginStore } from '../../stores/pluginStore';
import { WHITELIST_TYPE_LABELS } from '@iot-platform/shared';
import type { WhitelistEntry } from '@iot-platform/shared';
import { api } from '../../api/client';

export default function WhitelistManage() {
  const { plugins, fetchPlugins } = usePluginStore();
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchWhitelist = async () => {
    setLoading(true);
    try {
      const data = await api.get<WhitelistEntry[]>('/whitelist');
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlugins();
    fetchWhitelist();
  }, []);

  const handleAdd = async () => {
    const values = await form.validateFields();
    await api.post('/whitelist', values);
    message.success('白名单添加成功');
    setModalOpen(false);
    form.resetFields();
    fetchWhitelist();
  };

  const handleDelete = async (id: string) => {
    await api.del(`/whitelist/${id}`);
    message.success('已移除');
    fetchWhitelist();
  };

  const columns = [
    {
      title: '插件', dataIndex: 'pluginId', key: 'pluginId',
      render: (pid: string) => plugins.find((p) => p.id === pid)?.name || pid,
    },
    {
      title: '类型', dataIndex: 'type', key: 'type',
      render: (t: string) => WHITELIST_TYPE_LABELS[t as keyof typeof WHITELIST_TYPE_LABELS] || t,
    },
    { title: '标识', dataIndex: 'identifier', key: 'identifier' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '添加时间', dataIndex: 'createdAt', key: 'createdAt', render: (t: string) => new Date(t).toLocaleString() },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: WhitelistEntry) => (
        <Space>
          <Popconfirm title="确认移除?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>移除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="白名单管理"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加白名单</Button>}
      >
        <Table dataSource={entries} columns={columns} rowKey="id" loading={loading} />
      </Card>

      <Modal title="添加白名单" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="pluginId" label="插件" rules={[{ required: true }]}>
            <Select placeholder="选择插件">
              {plugins.map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="类型" initialValue="user">
            <Select>
              <Select.Option value="user">用户</Select.Option>
              <Select.Option value="device">设备</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="identifier" label="标识" rules={[{ required: true }]}>
            <Input placeholder="用户ID 或 设备ID" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="备注名称" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
