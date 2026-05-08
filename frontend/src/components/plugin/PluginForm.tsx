import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Transfer } from 'antd';
import type { Plugin, PluginPlatform } from '../../types/plugin';
import { PLUGIN_PLATFORM_LABELS } from '../../types/plugin';
import { useProductStore } from '../../stores/productStore';
import type { TransferItem } from 'antd/es/transfer';

interface PluginFormProps {
  open: boolean;
  initialValues?: Plugin;
  onOk: (values: Partial<Plugin>) => void;
  onCancel: () => void;
}

const PluginForm: React.FC<PluginFormProps> = ({ open, initialValues, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const products = useProductStore((s) => s.products);
  const isEdit = !!initialValues?.id;

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
        platform: initialValues.platform,
        productIds: initialValues.productIds || [],
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch {
      // validation
    }
  };

  const productDataSource: TransferItem[] = products.map((p) => ({
    key: p.id,
    title: p.name,
    description: p.description,
  }));

  return (
    <Modal
      title={isEdit ? '编辑插件' : '创建插件'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={700}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="插件名称" rules={[{ required: true, message: '请输入插件名称' }]}>
          <Input placeholder="如：智能灯控插件" maxLength={50} />
        </Form.Item>
        <Form.Item name="description" label="插件描述">
          <Input.TextArea placeholder="描述插件功能" rows={3} maxLength={200} />
        </Form.Item>
        <Form.Item name="platform" label="支持平台" rules={[{ required: true, message: '请选择平台' }]}>
          <Select placeholder="选择平台">
            {(Object.keys(PLUGIN_PLATFORM_LABELS) as PluginPlatform[]).map((key) => (
              <Select.Option key={key} value={key}>{PLUGIN_PLATFORM_LABELS[key]}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="productIds" label="关联产品" valuePropName="targetKeys">
          <Transfer
            dataSource={productDataSource}
            titles={['可选产品', '已关联']}
            render={(item) => item.title || ''}
            listStyle={{ width: 280, height: 240 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PluginForm;
