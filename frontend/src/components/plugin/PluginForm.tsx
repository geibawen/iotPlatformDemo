import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Transfer, Checkbox, Space } from 'antd';
import type { Plugin, PluginType } from '../../types/plugin';
import { PLUGIN_TYPE_LABELS } from '../../types/plugin';
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
        type: initialValues.type,
        platforms: initialValues.platforms,
        productIds: initialValues.productIds || [],
      });
    } else if (open) {
      form.resetFields();
      // 设置默认值：type 为 device，platforms 为 iOS 和 Android
      form.setFieldsValue({
        type: 'device',
        platforms: ['iOS', 'Android'],
      });
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
        <Form.Item name="type" label="插件类型" rules={[{ required: true, message: '请选择插件类型' }]}>
          <Select placeholder="选择插件类型">
            {(Object.keys(PLUGIN_TYPE_LABELS) as PluginType[]).map((key) => (
              <Select.Option key={key} value={key}>{PLUGIN_TYPE_LABELS[key]}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="platforms" label="支持平台（设备插件）" rules={[
          { required: true, message: '请至少选择一个平台' },
          {
            validator: (_rule, value) => {
              if (!value || (!value.includes('iOS') || !value.includes('Android'))) {
                return Promise.reject(new Error('iOS 和 Android 是必选的'));
              }
              return Promise.resolve();
            },
          },
        ]}>
          <Checkbox.Group>
            <Space direction="vertical">
              <Checkbox value="iOS" disabled>iOS <span style={{ color: '#999' }}>(必选)</span></Checkbox>
              <Checkbox value="Android" disabled>Android <span style={{ color: '#999' }}>(必选)</span></Checkbox>
              <Checkbox value="HarmonyOS">HarmonyOS <span style={{ color: '#999' }}>(可选)</span></Checkbox>
            </Space>
          </Checkbox.Group>
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
