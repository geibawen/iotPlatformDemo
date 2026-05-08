import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Card, Typography, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { usePushStore } from '../../stores/pushStore';
import type { MessageTemplate, TemplateFormat } from '../../types/push';
import dayjs from 'dayjs';

const VARIABLES = [
  { key: '${deviceName}', label: '设备名称' },
  { key: '${productName}', label: '产品名称' },
  { key: '${value}', label: '属性值' },
  { key: '${propertyName}', label: '属性名称' },
  { key: '${triggerTime}', label: '触发时间' },
];

const MessageTemplates: React.FC = () => {
  const templates = usePushStore((s) => s.templates);
  const addTemplate = usePushStore((s) => s.addTemplate);
  const updateTemplate = usePushStore((s) => s.updateTemplate);
  const deleteTemplate = usePushStore((s) => s.deleteTemplate);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | undefined>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    if (formOpen && editing) {
      form.setFieldsValue({
        name: editing.name,
        format: editing.format,
        content: editing.content,
        description: editing.description,
      });
    } else if (formOpen) {
      form.resetFields();
    }
  }, [formOpen, editing, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateTemplate(editing.id, values);
        message.success('模板更新成功');
      } else {
        await addTemplate(values);
        message.success('模板创建成功');
      }
      setFormOpen(false);
      setEditing(undefined);
    } catch (err) {
      if (err instanceof Error) message.error('操作失败');
    }
  };

  const handlePreview = (template: MessageTemplate) => {
    let content = template.content;
    content = content
      .replace(/\$\{deviceName\}/g, '客厅灯泡-A1')
      .replace(/\$\{productName\}/g, '智能灯泡 Pro')
      .replace(/\$\{value\}/g, '42.5')
      .replace(/\$\{propertyName\}/g, '温度')
      .replace(/\$\{triggerTime\}/g, dayjs().format('YYYY-MM-DD HH:mm:ss'));
    setPreviewContent(content);
    setPreviewOpen(true);
  };

  const insertVariable = (variable: string) => {
    const current = form.getFieldValue('content') || '';
    form.setFieldsValue({ content: current + variable });
  };

  const columns = [
    { title: '模板名称', dataIndex: 'name', key: 'name' },
    {
      title: '格式',
      dataIndex: 'format',
      key: 'format',
      width: 80,
      render: (format: TemplateFormat) => (
        <Tag color={format === 'json' ? 'blue' : 'default'}>{format.toUpperCase()}</Tag>
      ),
    },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
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
      render: (_: unknown, record: MessageTemplate) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
            预览
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              setFormOpen(true);
            }}
          />
          <Popconfirm title="确认删除此模板？" onConfirm={async () => {
            try {
              await deleteTemplate(record.id);
              message.success('模板已删除');
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
        <Typography.Title level={4} style={{ margin: 0 }}>消息模板</Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          创建模板
        </Button>
      </div>
      <Card>
        <Table dataSource={templates} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editing ? '编辑模板' : '创建模板'}
        open={formOpen}
        onOk={handleSave}
        onCancel={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
        width={640}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="模板名称" rules={[{ required: true, message: '请输入模板名称' }]}>
            <Input placeholder="如：设备上线通知" />
          </Form.Item>
          <Form.Item name="format" label="格式" rules={[{ required: true }]} initialValue="json">
            <Select>
              <Select.Option value="json">JSON</Select.Option>
              <Select.Option value="text">纯文本</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="模板用途描述" />
          </Form.Item>
          <div style={{ marginBottom: 8 }}>
            <span style={{ marginRight: 8, color: '#666' }}>插入变量：</span>
            {VARIABLES.map((v) => (
              <Tag
                key={v.key}
                color="blue"
                style={{ cursor: 'pointer', marginBottom: 4 }}
                onClick={() => insertVariable(v.key)}
              >
                {v.label} {v.key}
              </Tag>
            ))}
          </div>
          <Form.Item name="content" label="模板内容" rules={[{ required: true, message: '请输入模板内容' }]}>
            <Input.TextArea rows={6} placeholder='如：{"event":"device_online","device":"${deviceName}"}' />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="消息预览"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={560}
      >
        <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 6, fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {previewContent}
        </div>
        <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
          * 预览使用示例数据替换变量，实际推送时将使用真实设备数据
        </div>
      </Modal>
    </div>
  );
};

export default MessageTemplates;
