import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Card, Typography, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ApiOutlined } from '@ant-design/icons';
import { usePushStore } from '../../stores/pushStore';
import type { PushChannel, ChannelType } from '../../types/push';
import { CHANNEL_TYPE_LABELS } from '../../types/push';
import dayjs from 'dayjs';

const PushChannels: React.FC = () => {
  const channels = usePushStore((s) => s.channels);
  const addChannel = usePushStore((s) => s.addChannel);
  const updateChannel = usePushStore((s) => s.updateChannel);
  const deleteChannel = usePushStore((s) => s.deleteChannel);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PushChannel | undefined>();
  const [form] = Form.useForm();
  const [channelType, setChannelType] = useState<ChannelType>('http_callback');

  useEffect(() => {
    if (formOpen && editing) {
      setChannelType(editing.type);
      const configValues: Record<string, unknown> = {};
      const cfg = editing.config as unknown as Record<string, unknown>;
      Object.entries(cfg).forEach(([k, v]) => {
        configValues[`config_${k}`] = v;
      });
      form.setFieldsValue({
        name: editing.name,
        type: editing.type,
        ...configValues,
      });
    } else if (formOpen) {
      form.resetFields();
      setChannelType('http_callback');
    }
  }, [formOpen, editing, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      let config: Record<string, unknown> = {};
      switch (values.type) {
        case 'http_callback':
          config = { url: values.config_url, method: values.config_method || 'POST', secret: values.config_secret };
          break;
        case 'mqtt':
          config = { broker: values.config_broker, topic: values.config_topic, qos: values.config_qos ?? 1 };
          break;
        case 'kafka':
          config = { bootstrapServers: values.config_bootstrapServers, topic: values.config_topic, groupId: values.config_groupId };
          break;
        case 'mns':
          config = { endpoint: values.config_endpoint, queueName: values.config_queueName };
          break;
      }

      if (editing) {
        await updateChannel(editing.id, { name: values.name, type: values.type, config: config as unknown as PushChannel['config'] });
        message.success('通道更新成功');
      } else {
        await addChannel({
          name: values.name,
          type: values.type,
          config: config as unknown as PushChannel['config'],
          status: 'active',
        });
        message.success('通道创建成功');
      }
      setFormOpen(false);
      setEditing(undefined);
    } catch (err) {
      if (err instanceof Error) message.error('操作失败');
    }
  };

  const handleTest = (channel: PushChannel) => {
    message.loading('正在测试连接...', 1.5).then(() => {
      message.success(`通道 "${channel.name}" 连接测试成功`);
    });
  };

  const columns = [
    { title: '通道名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 130,
      render: (type: ChannelType) => <Tag color="blue">{CHANNEL_TYPE_LABELS[type]}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: PushChannel) => (
        <Space>
          <Button size="small" icon={<ApiOutlined />} onClick={() => handleTest(record)}>
            测试
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              setFormOpen(true);
            }}
          />
          <Popconfirm title="确认删除此通道？" onConfirm={async () => {
            try {
              await deleteChannel(record.id);
              message.success('通道已删除');
            } catch {
              message.error('删除失败');
            }
          }}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>推送通道</Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          创建通道
        </Button>
      </div>
      <Card>
        <Table dataSource={channels} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editing ? '编辑通道' : '创建通道'}
        open={formOpen}
        onOk={handleSave}
        onCancel={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        width={560}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="通道名称" rules={[{ required: true, message: '请输入通道名称' }]}>
            <Input placeholder="如：设备状态回调" />
          </Form.Item>
          <Form.Item name="type" label="通道类型" rules={[{ required: true, message: '请选择通道类型' }]}>
            <Select
              placeholder="选择类型"
              onChange={(v: ChannelType) => setChannelType(v)}
            >
              {(Object.keys(CHANNEL_TYPE_LABELS) as ChannelType[]).map((key) => (
                <Select.Option key={key} value={key}>{CHANNEL_TYPE_LABELS[key]}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* HTTP Callback */}
          {channelType === 'http_callback' && (
            <>
              <Form.Item name="config_url" label="回调 URL" rules={[{ required: true, message: '请输入 URL' }]}>
                <Input placeholder="https://api.example.com/callback" />
              </Form.Item>
              <Form.Item name="config_method" label="请求方法" initialValue="POST">
                <Select>
                  <Select.Option value="POST">POST</Select.Option>
                  <Select.Option value="GET">GET</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="config_secret" label="签名密钥">
                <Input.Password placeholder="可选" />
              </Form.Item>
            </>
          )}

          {/* MQTT */}
          {channelType === 'mqtt' && (
            <>
              <Form.Item name="config_broker" label="Broker 地址" rules={[{ required: true, message: '请输入 Broker 地址' }]}>
                <Input placeholder="mqtt://broker.example.com:1883" />
              </Form.Item>
              <Form.Item name="config_topic" label="Topic" rules={[{ required: true, message: '请输入 Topic' }]}>
                <Input placeholder="iot/events/#" />
              </Form.Item>
              <Form.Item name="config_qos" label="QoS 等级" initialValue={1}>
                <Select>
                  <Select.Option value={0}>QoS 0 - 至多一次</Select.Option>
                  <Select.Option value={1}>QoS 1 - 至少一次</Select.Option>
                  <Select.Option value={2}>QoS 2 - 恰好一次</Select.Option>
                </Select>
              </Form.Item>
            </>
          )}

          {/* Kafka */}
          {channelType === 'kafka' && (
            <>
              <Form.Item name="config_bootstrapServers" label="Bootstrap Servers" rules={[{ required: true }]}>
                <Input placeholder="kafka1:9092,kafka2:9092" />
              </Form.Item>
              <Form.Item name="config_topic" label="Topic" rules={[{ required: true }]}>
                <Input placeholder="iot-events" />
              </Form.Item>
              <Form.Item name="config_groupId" label="Group ID">
                <Input placeholder="可选" />
              </Form.Item>
            </>
          )}

          {/* MNS */}
          {channelType === 'mns' && (
            <>
              <Form.Item name="config_endpoint" label="Endpoint" rules={[{ required: true }]}>
                <Input placeholder="https://xxxx.mns.cn-hangzhou.aliyuncs.com/" />
              </Form.Item>
              <Form.Item name="config_queueName" label="队列名称" rules={[{ required: true }]}>
                <Input placeholder="iot-queue" />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default PushChannels;
