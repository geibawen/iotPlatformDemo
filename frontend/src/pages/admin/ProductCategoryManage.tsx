import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useProductCategoryStore } from '../../stores/productCategoryStore';
import type { ProductCategoryItem } from '../../types/product';

export default function ProductCategoryManage() {
  const {
    categories,
    loading,
    fetchCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useProductCategoryStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategoryItem | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreate = () => {
    setEditing(null);
    form.setFieldsValue({ key: '', name: '' });
    setModalOpen(true);
  };

  const openEdit = (item: ProductCategoryItem) => {
    setEditing(item);
    form.setFieldsValue({ key: item.key, name: item.name });
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    try {
      if (editing) {
        await updateCategory(editing.id, values);
        message.success('分类更新成功');
      } else {
        await addCategory(values);
        message.success('分类创建成功');
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || '操作失败');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      message.success('分类删除成功');
    } catch (err: any) {
      message.error(err.message || '删除失败');
    }
  };

  const columns = [
    { title: '分类 Key', dataIndex: 'key', key: 'key', width: 220 },
    { title: '分类名称', dataIndex: 'name', key: 'name', width: 220 },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 220,
      render: (_: unknown, record: ProductCategoryItem) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除该分类？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="产品分类管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建分类
          </Button>
        }
      >
        <Table dataSource={categories} columns={columns} rowKey="id" loading={loading} />
      </Card>

      <Modal
        title={editing ? '编辑产品分类' : '新建产品分类'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="key"
            label="分类 Key"
            rules={[
              { required: true, message: '请输入分类 Key' },
              { pattern: /^[a-z0-9_-]+$/, message: '仅支持小写字母/数字/_/-' },
            ]}
          >
            <Input placeholder="如 smart_light" />
          </Form.Item>
          <Form.Item name="name" label="分类名称" rules={[{ required: true, message: '请输入分类名称' }]}>
            <Input placeholder="如 智能灯具" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
