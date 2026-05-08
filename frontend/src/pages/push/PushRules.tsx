import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Switch, Popconfirm, message, Card, Typography, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { usePushStore } from '../../stores/pushStore';
import { useProductStore } from '../../stores/productStore';
import type { PushRule, TriggerType, ConditionOperator } from '../../types/push';
import { TRIGGER_TYPE_LABELS } from '../../types/push';
import dayjs from 'dayjs';

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '==', label: '==' },
  { value: '!=', label: '!=' },
];

const PushRules: React.FC = () => {
  const rules = usePushStore((s) => s.rules);
  const channels = usePushStore((s) => s.channels);
  const templates = usePushStore((s) => s.templates);
  const addRule = usePushStore((s) => s.addRule);
  const updateRule = usePushStore((s) => s.updateRule);
  const deleteRule = usePushStore((s) => s.deleteRule);
  const products = useProductStore((s) => s.products);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PushRule | undefined>();
  const [form] = Form.useForm();

  useEffect(() => {
    if (formOpen && editing) {
      form.setFieldsValue({
        name: editing.name,
        productId: editing.productId,
        triggerType: editing.triggerType,
        conditions: editing.conditions || [],
        channelId: editing.channelId,
        templateId: editing.templateId,
      });
    } else if (formOpen) {
      form.resetFields();
    }
  }, [formOpen, editing, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await updateRule(editing.id, values);
        message.success('规则更新成功');
      } else {
        await addRule({
          ...values,
          conditions: values.conditions || [],
          enabled: true,
        });
        message.success('规则创建成功');
      }
      setFormOpen(false);
      setEditing(undefined);
    } catch (err) {
      if (err instanceof Error) message.error('操作失败');
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await updateRule(id, { enabled });
      message.success(enabled ? '规则已启用' : '规则已禁用');
    } catch {
      message.error('操作失败');
    }
  };

  const columns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    {
      title: '关联产品',
      dataIndex: 'productId',
      key: 'productId',
      width: 150,
      render: (pid: string) => {
        const p = products.find((prod) => prod.id === pid);
        return p ? p.name : '-';
      },
    },
    {
      title: '触发类型',
      dataIndex: 'triggerType',
      key: 'triggerType',
      width: 120,
      render: (type: TriggerType) => <Tag>{TRIGGER_TYPE_LABELS[type]}</Tag>,
    },
    {
      title: '推送通道',
      dataIndex: 'channelId',
      key: 'channelId',
      width: 150,
      render: (cid: string) => {
        const c = channels.find((ch) => ch.id === cid);
        return c ? c.name : '-';
      },
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean, record: PushRule) => (
        <Switch checked={enabled} onChange={(v) => handleToggle(record.id, v)} size="small" />
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
      width: 140,
      render: (_: unknown, record: PushRule) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              setFormOpen(true);
            }}
          />
          <Popconfirm title="确认删除此规则？" onConfirm={async () => {
            try {
              await deleteRule(record.id);
              message.success('规则已删除');
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
        <Typography.Title level={4} style={{ margin: 0 }}>推送规则</Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          创建规则
        </Button>
      </div>
      <Card>
        <Table dataSource={rules} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editing ? '编辑规则' : '创建规则'}
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
          <Form.Item name="name" label="规则名称" rules={[{ required: true, message: '请输入规则名称' }]}>
            <Input placeholder="如：温度超限告警" />
          </Form.Item>
          <Form.Item name="productId" label="关联产品" rules={[{ required: true, message: '请选择产品' }]}>
            <Select placeholder="选择产品">
              {products.map((p) => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="triggerType" label="触发类型" rules={[{ required: true, message: '请选择触发类型' }]}>
            <Select placeholder="选择触发类型">
              {(Object.keys(TRIGGER_TYPE_LABELS) as TriggerType[]).map((key) => (
                <Select.Option key={key} value={key}>{TRIGGER_TYPE_LABELS[key]}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="触发条件">
            <Form.List name="conditions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                      <Form.Item {...field} name={[field.name, 'field']} noStyle rules={[{ required: true }]}>
                        <Input placeholder="属性标识符" style={{ width: 160 }} />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'operator']} noStyle rules={[{ required: true }]}>
                        <Select placeholder="运算符" style={{ width: 80 }}>
                          {OPERATORS.map((op) => (
                            <Select.Option key={op.value} value={op.value}>{op.label}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'value']} noStyle rules={[{ required: true }]}>
                        <Input placeholder="阈值" style={{ width: 120 }} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: '#ff4d4f' }} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add({ field: '', operator: '>', value: '' })} icon={<PlusOutlined />} size="small">
                    添加条件
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item name="channelId" label="推送通道" rules={[{ required: true, message: '请选择推送通道' }]}>
            <Select placeholder="选择推送通道">
              {channels.map((c) => (
                <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="templateId" label="消息模板" rules={[{ required: true, message: '请选择消息模板' }]}>
            <Select placeholder="选择消息模板">
              {templates.map((t) => (
                <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PushRules;
