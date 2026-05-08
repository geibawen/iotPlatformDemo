import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Tabs, Space, message, Typography, Empty, Popconfirm } from 'antd';
import { EditOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useProductStore } from '../../stores/productStore';
import { usePluginStore } from '../../stores/pluginStore';
import { useThingModelStore } from '../../stores/thingModelStore';
import { PRODUCT_CATEGORY_LABELS, CONNECTION_TYPE_LABELS } from '../../types/product';
import ProductForm from '../../components/product/ProductForm';
import PropertyTable from '../../components/thingModel/PropertyTable';
import ActionTable from '../../components/thingModel/ActionTable';
import ServiceTable from '../../components/thingModel/ServiceTable';
import type { Product } from '../../types/product';
import dayjs from 'dayjs';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const allProducts = useProductStore((s) => s.products);
  const product = useMemo(() => allProducts.find((p) => p.id === id), [allProducts, id]);
  const updateProduct = useProductStore((s) => s.updateProduct);
  const allPlugins = usePluginStore((s) => s.plugins);
  const plugins = useMemo(() => allPlugins.filter((p) => p.productIds.includes(id || '')), [allPlugins, id]);
  const loadByProduct = useThingModelStore((s) => s.loadByProduct);

  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (id) loadByProduct(id);
  }, [id, loadByProduct]);

  if (!product) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Empty description="产品不存在">
          <Button type="primary" onClick={() => navigate('/products')}>返回产品列表</Button>
        </Empty>
      </div>
    );
  }

  const handleUpdate = async (values: Partial<Product>) => {
    try {
      await updateProduct(product.id, values);
      message.success('产品信息已更新');
      setEditOpen(false);
    } catch {
      message.error('更新失败');
    }
  };

  const handlePublish = async () => {
    try {
      await updateProduct(product.id, { status: product.status === 'published' ? 'draft' : 'published' });
      message.success(product.status === 'published' ? '产品已取消发布' : '产品已发布');
    } catch {
      message.error('操作失败');
    }
  };

  const tabItems = [
    {
      key: 'info',
      label: '基本信息',
      children: (
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="产品名称">{product.name}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={product.status === 'published' ? 'green' : 'default'}>
              {product.status === 'published' ? '已发布' : '草稿'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="产品分类">{PRODUCT_CATEGORY_LABELS[product.category]}</Descriptions.Item>
          <Descriptions.Item label="连接方式">{CONNECTION_TYPE_LABELS[product.connectionType]}</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>{product.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{dayjs(product.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{dayjs(product.updatedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="产品图片" span={2}>
            {product.image ? (
              <img src={product.image} alt={product.name} style={{ maxWidth: 200, maxHeight: 200, borderRadius: 8 }} />
            ) : (
              <span style={{ color: '#999' }}>未上传</span>
            )}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'properties',
      label: '属性 (Property)',
      children: <PropertyTable productId={product.id} />,
    },
    {
      key: 'actions',
      label: '动作 (Action)',
      children: <ActionTable productId={product.id} />,
    },
    {
      key: 'services',
      label: '服务 (Service)',
      children: <ServiceTable productId={product.id} />,
    },
    {
      key: 'plugins',
      label: '关联插件',
      children: plugins.length > 0 ? (
        <div>
          {plugins.map((p) => (
            <Card
              key={p.id}
              size="small"
              style={{ marginBottom: 8, cursor: 'pointer' }}
              onClick={() => navigate(`/plugins/${p.id}`)}
            >
              <Space>
                <strong>{p.name}</strong>
                <Tag>{p.platform}</Tag>
                <Tag color={p.status === 'active' ? 'green' : 'default'}>
                  {p.status === 'active' ? '启用' : '停用'}
                </Tag>
              </Space>
              <div style={{ color: '#999', marginTop: 4 }}>{p.description}</div>
            </Card>
          ))}
        </div>
      ) : (
        <Empty description="暂无关联插件">
          <Button type="primary" onClick={() => navigate('/plugins')}>去创建插件</Button>
        </Empty>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>返回</Button>
          <Typography.Title level={4} style={{ margin: 0 }}>{product.name}</Typography.Title>
          <Tag color={product.status === 'published' ? 'green' : 'default'}>
            {product.status === 'published' ? '已发布' : '草稿'}
          </Tag>
        </Space>
        <Space>
          <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
            编辑
          </Button>
          <Popconfirm
            title={product.status === 'published' ? '确认取消发布？' : '确认发布产品？'}
            onConfirm={handlePublish}
          >
            <Button type="primary" icon={<CheckCircleOutlined />}>
              {product.status === 'published' ? '取消发布' : '发布'}
            </Button>
          </Popconfirm>
        </Space>
      </div>
      <Card>
        <Tabs items={tabItems} defaultActiveKey="properties" destroyOnHidden />
      </Card>
      <ProductForm
        open={editOpen}
        initialValues={product}
        onOk={handleUpdate}
        onCancel={() => setEditOpen(false)}
      />
    </div>
  );
};

export default ProductDetail;
