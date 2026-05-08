import React, { useState } from 'react';
import { Modal, Form, Input, Select, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Product, ConnectionType } from '../../types/product';
import { PRODUCT_CATEGORY_LABELS, CONNECTION_TYPE_LABELS } from '../../types/product';
import type { UploadFile } from 'antd/es/upload';
import { useProductCategoryStore } from '../../stores/productCategoryStore';

interface ProductFormProps {
  open: boolean;
  initialValues?: Partial<Product>;
  onOk: (values: Partial<Product>) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ open, initialValues, onOk, onCancel }) => {
  const categories = useProductCategoryStore((s) => s.categories);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>(initialValues?.image || '');
  const isEdit = !!initialValues?.id;
  const categoryOptions = categories.length > 0
    ? categories.map((c) => ({ value: c.key, label: c.name }))
    : Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

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
