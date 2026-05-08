import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Tabs, Space, message, Typography, Empty, Switch } from 'antd';
import { EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { usePluginStore } from '../../stores/pluginStore';
import { useProductStore } from '../../stores/productStore';
import { PLUGIN_PLATFORM_LABELS } from '../../types/plugin';
import PluginForm from '../../components/plugin/PluginForm';
import VersionManager from '../../components/plugin/VersionManager';
import type { Plugin } from '../../types/plugin';
import dayjs from 'dayjs';

const PluginDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const allPlugins = usePluginStore((s) => s.plugins);
  const plugin = useMemo(() => allPlugins.find((p) => p.id === id), [allPlugins, id]);
  const updatePlugin = usePluginStore((s) => s.updatePlugin);
  const products = useProductStore((s) => s.products);

  const [editOpen, setEditOpen] = useState(false);

  if (!plugin) {
    return (
      <div style={{ textAlign: 'center', paddingTop: 80 }}>
        <Empty description="插件不存在">
          <Button type="primary" onClick={() => navigate('/plugins')}>返回插件列表</Button>
        </Empty>
      </div>
    );
  }

  const handleUpdate = async (values: Partial<Plugin>) => {
    try {
      await updatePlugin(plugin.id, values);
      message.success('插件信息已更新');
      setEditOpen(false);
    } catch {
      message.error('更新失败');
    }
  };

  const handleToggleStatus = async () => {
    try {
      await updatePlugin(plugin.id, { status: plugin.status === 'active' ? 'inactive' : 'active' });
      message.success(plugin.status === 'active' ? '插件已停用' : '插件已启用');
    } catch {
      message.error('操作失败');
    }
  };

  const associatedProducts = products.filter((p) => plugin.productIds.includes(p.id));

  const tabItems = [
    {
      key: 'info',
      label: '基本信息',
      children: (
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="插件名称">{plugin.name}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Space>
              <Tag color={plugin.status === 'active' ? 'green' : 'default'}>
                {plugin.status === 'active' ? '启用' : '停用'}
              </Tag>
              <Switch
                checked={plugin.status === 'active'}
                onChange={handleToggleStatus}
                size="small"
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="支持平台">{PLUGIN_PLATFORM_LABELS[plugin.platform]}</Descriptions.Item>
          <Descriptions.Item label="插件类型">React Native</Descriptions.Item>
          <Descriptions.Item label="描述" span={2}>{plugin.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{dayjs(plugin.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="更新时间">{dayjs(plugin.updatedAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
          <Descriptions.Item label="关联产品" span={2}>
            <Space wrap>
              {associatedProducts.map((p) => (
                <Tag
                  key={p.id}
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  {p.name}
                </Tag>
              ))}
              {associatedProducts.length === 0 && <span style={{ color: '#999' }}>未关联产品</span>}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'versions',
      label: '版本管理',
      children: <VersionManager pluginId={plugin.id} />,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/plugins')}>返回</Button>
          <Typography.Title level={4} style={{ margin: 0 }}>{plugin.name}</Typography.Title>
          <Tag color={plugin.status === 'active' ? 'green' : 'default'}>
            {plugin.status === 'active' ? '启用' : '停用'}
          </Tag>
        </Space>
        <Button icon={<EditOutlined />} onClick={() => setEditOpen(true)}>
          编辑
        </Button>
      </div>
      <Card>
        <Tabs items={tabItems} defaultActiveKey="versions" />
      </Card>
      <PluginForm
        open={editOpen}
        initialValues={plugin}
        onOk={handleUpdate}
        onCancel={() => setEditOpen(false)}
      />
    </div>
  );
};

export default PluginDetail;
