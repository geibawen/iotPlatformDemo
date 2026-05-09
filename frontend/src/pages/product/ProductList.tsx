import React, { useState } from 'react';
import { Table, Button, Input, Select, Space, Tag, Popconfirm, message, Card, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '../../stores/productStore';
import { useThingModelStore } from '../../stores/thingModelStore';
import { useProductCategoryStore } from '../../stores/productCategoryStore';
import ProductForm from '../../components/product/ProductForm';
import type { Product, ConnectionType } from '../../types/product';
import { PRODUCT_CATEGORY_LABELS, CONNECTION_TYPE_LABELS } from '../../types/product';
import dayjs from 'dayjs';

const ProductList: React.FC = () => {
  const products = useProductStore((s) => s.products);
  const addProduct = useProductStore((s) => s.addProduct);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const deleteProduct = useProductStore((s) => s.deleteProduct);
  const categories = useProductCategoryStore((s) => s.categories);
  const deleteByProduct = useThingModelStore((s) => s.deleteByProduct);
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const categoryLabelMap = categories.reduce<Record<string, string>>((acc, item) => {
    acc[item.key] = item.name;
    return acc;
  }, { ...PRODUCT_CATEGORY_LABELS });

  const categoryOptions = categories.length > 0
    ? categories.map((c) => ({ value: c.key, label: c.name }))
    : Object.entries(PRODUCT_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));

  const filteredProducts = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleCreate = async (values: Partial<Product> & { baseProductId?: string }) => {
    try {
      await addProduct({ ...values, status: 'draft' });
      message.success('产品创建成功');
      setFormOpen(false);
    } catch {
      message.error('创建失败');
    }
  };

  const handleEdit = async (values: Partial<Product>) => {
    if (editingProduct) {
      try {
        await updateProduct(editingProduct.id, values);
        message.success('产品更新成功');
        setEditingProduct(undefined);
        setFormOpen(false);
      } catch {
        message.error('更新失败');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      await deleteByProduct(id);
      message.success('产品已删除');
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Product) => (
        <Space>
          {record.image ? (
            <img src={record.image} alt={name} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: 4, background: '#f0f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1677ff', fontWeight: 'bold' }}>
              {name[0]}
            </div>
          )}
          <a onClick={() => navigate(`/products/${record.id}`)}>{name}</a>
        </Space>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (cat: string) => categoryLabelMap[cat] || cat,
    },
    {
      title: '连接方式',
      dataIndex: 'connectionType',
      key: 'connectionType',
      width: 120,
      render: (ct: ConnectionType) => CONNECTION_TYPE_LABELS[ct],
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'published' ? 'green' : 'default'}>
          {status === 'published' ? '已发布' : '草稿'}
        </Tag>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Product) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/products/${record.id}`)}>
            详情
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingProduct(record);
              setFormOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确认删除此产品？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          产品管理
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingProduct(undefined);
            setFormOpen(true);
          }}
        >
          创建产品
        </Button>
      </div>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索产品名称"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="全部分类"
            value={categoryFilter || undefined}
            onChange={(v) => setCategoryFilter(v || '')}
            style={{ width: 140 }}
            allowClear
          >
            {categoryOptions.map((item) => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Space>
        <Table
          dataSource={filteredProducts}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>
      <ProductForm
        open={formOpen}
        initialValues={editingProduct}
        products={products}
        onOk={editingProduct ? handleEdit : handleCreate}
        onCancel={() => {
          setFormOpen(false);
          setEditingProduct(undefined);
        }}
      />
    </div>
  );
};

export default ProductList;
