import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, Upload, message, Alert, Space, Tag, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Product, ConnectionType } from '../../types/product';
import { PRODUCT_CATEGORY_LABELS, CONNECTION_TYPE_LABELS } from '../../types/product';
import type { UploadFile } from 'antd/es/upload';
import { useProductCategoryStore } from '../../stores/productCategoryStore';
import type { ThingModelAction, ThingModelProperty, ThingModelService } from '../../types/thingModel';
import { api } from '../../api/client';

interface ProductFormProps {
  open: boolean;
  initialValues?: Partial<Product>;
  products?: Product[];
  onOk: (values: Partial<Product> & { baseProductId?: string }) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ open, initialValues, products = [], onOk, onCancel }) => {
  const categories = useProductCategoryStore((s) => s.categories);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>(initialValues?.image || '');
  const [inheritLoading, setInheritLoading] = useState(false);
  const [inheritStats, setInheritStats] = useState<{ services: number; properties: number; actions: number } | null>(null);
  const isEdit = !!initialValues?.id;
  const selectedBaseProductId = Form.useWatch('baseProductId', form) as string | undefined;
  const categoryOptions = categories.length > 0
    ? categories.map((c) => ({ value: c.key, label: c.name }))
    : Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  useEffect(() => {
    setImageUrl(initialValues?.image || '');
  }, [initialValues?.image, open]);

  useEffect(() => {
    if (isEdit || !open || !selectedBaseProductId) {
      setInheritStats(null);
      setInheritLoading(false);
      return;
    }

    let cancelled = false;
    setInheritLoading(true);

    Promise.all([
      api.get<ThingModelService[]>(`/products/${selectedBaseProductId}/services`),
      api.get<ThingModelProperty[]>(`/products/${selectedBaseProductId}/properties`),
      api.get<ThingModelAction[]>(`/products/${selectedBaseProductId}/actions`),
    ])
      .then(([services, properties, actions]) => {
        if (cancelled) return;
        setInheritStats({
          services: services.length,
          properties: properties.length,
          actions: actions.length,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setInheritStats(null);
        message.error('加载继承预览失败，请稍后重试');
      })
      .finally(() => {
        if (cancelled) return;
        setInheritLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isEdit, open, selectedBaseProductId]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk({ ...values, image: imageUrl });
      form.resetFields();
      setImageUrl('');
    } catch {
      // validation failed
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageUrl('');
    setInheritStats(null);
    setInheritLoading(false);
    onCancel();
  };

  const handleUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      message.error('图片大小不能超过 2MB');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return false;
  };

  const fileList: UploadFile[] = imageUrl
    ? [{ uid: '-1', name: 'product-image', status: 'done', url: imageUrl }]
    : [];

  return (
    <Modal
      title={isEdit ? '编辑产品' : '创建产品'}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      width={560}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="name"
          label="产品名称"
          rules={[{ required: true, message: '请输入产品名称' }]}
        >
          <Input placeholder="如：智能灯泡 Pro" maxLength={50} />
        </Form.Item>
        {!isEdit && (
          <Form.Item
            name="baseProductId"
            label="基于产品创建（可选）"
            tooltip="选择后会继承该产品完整物模型（服务、属性、动作）"
          >
            <Select
              placeholder="不继承（从空白开始）"
              allowClear
              showSearch
              optionFilterProp="label"
              options={products.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.id.slice(0, 8)})`,
              }))}
            />
          </Form.Item>
        )}
        {!isEdit && selectedBaseProductId && (
          <Form.Item label="继承预览">
            <Spin spinning={inheritLoading}>
              <Alert
                type="info"
                showIcon
                message="将继承以下物模型配置"
                description={
                  inheritStats ? (
                    <Space wrap>
                      <Tag color="blue">服务 {inheritStats.services}</Tag>
                      <Tag color="geekblue">属性 {inheritStats.properties}</Tag>
                      <Tag color="cyan">动作 {inheritStats.actions}</Tag>
                    </Space>
                  ) : (
                    '正在加载继承数据...'
                  )
                }
              />
            </Spin>
          </Form.Item>
        )}
        <Form.Item name="description" label="产品描述">
          <Input.TextArea placeholder="描述产品功能和特性" rows={3} maxLength={200} />
        </Form.Item>
        <Form.Item
          name="category"
          label="产品分类"
          rules={[{ required: true, message: '请选择产品分类' }]}
        >
          <Select placeholder="选择分类">
            {categoryOptions.map((item) => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="connectionType"
          label="连接方式"
          rules={[{ required: true, message: '请选择连接方式' }]}
        >
          <Select placeholder="选择连接方式">
            {(Object.keys(CONNECTION_TYPE_LABELS) as ConnectionType[]).map((key) => (
              <Select.Option key={key} value={key}>
                {CONNECTION_TYPE_LABELS[key]}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="产品图片">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={handleUpload}
            onRemove={() => setImageUrl('')}
            accept="image/*"
            maxCount={1}
          >
            {!imageUrl && (
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            )}
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;
