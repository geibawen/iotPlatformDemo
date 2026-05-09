import React, { useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePluginStore } from '../../stores/pluginStore';
import { useProductStore } from '../../stores/productStore';
import PluginForm from '../../components/plugin/PluginForm';
import PluginTopologyModal from '../../components/plugin/PluginTopologyModal';
import type { Plugin } from '../../types/plugin';
import { PLATFORM_LABELS, PLUGIN_TYPE_LABELS } from '../../types/plugin';
import dayjs from 'dayjs';

const PluginList: React.FC = () => {
  const plugins = usePluginStore((s) => s.plugins);
  const addPlugin = usePluginStore((s) => s.addPlugin);
  const updatePlugin = usePluginStore((s) => s.updatePlugin);
  const deletePlugin = usePluginStore((s) => s.deletePlugin);
  const products = useProductStore((s) => s.products);
  const navigate = useNavigate();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Plugin | undefined>();
  const [topologyOpen, setTopologyOpen] = useState(false);

  const handleCreate = async (values: Partial<Plugin>) => {
    try {
      await addPlugin({ ...values, status: 'active' });
      message.success('插件创建成功');
      setFormOpen(false);
    } catch {
      message.error('创建失败');
    }
  };

  const handleEdit = async (values: Partial<Plugin>) => {
    if (editing) {
      try {
        await updatePlugin(editing.id, values);
        message.success('插件更新成功');
        setEditing(undefined);
        setFormOpen(false);
      } catch {
        message.error('更新失败');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlugin(id);
      message.success('插件已删除');
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    {
      title: '插件名称',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Plugin) => (
        <a onClick={() => navigate(`/plugins/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'device' ? 'blue' : 'cyan'}>
          {PLUGIN_TYPE_LABELS[type as keyof typeof PLUGIN_TYPE_LABELS] || '设备插件'}
        </Tag>
      ),
    },
    {
      title: '平台支持',
      dataIndex: 'platforms',
      key: 'platforms',
      width: 150,
      render: (platforms: unknown) => {
        const safePlatforms = Array.isArray(platforms) ? platforms : ['iOS', 'Android'];
        return (
        <Space wrap>
          {safePlatforms.map((p) => (
            <Tag key={p}>{PLATFORM_LABELS[p as keyof typeof PLATFORM_LABELS]}</Tag>
          ))}
        </Space>
      );
      },
    },
    {
      title: '关联产品',
      key: 'productIds',
      width: 200,
      render: (_: unknown, record: Plugin) => (
        <Space wrap>
          {(Array.isArray(record.productIds) ? record.productIds : []).map((pid) => {
            const p = products.find((prod) => prod.id === pid);
            return p ? <Tag key={pid}>{p.name}</Tag> : null;
          })}
          {(!Array.isArray(record.productIds) || record.productIds.length === 0) && <span style={{ color: '#999' }}>未关联</span>}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'default'}>
          {status === 'active' ? '启用' : '停用'}
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
      render: (_: unknown, record: Plugin) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/plugins/${record.id}`)}>
            详情
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              setFormOpen(true);
            }}
          >
            编辑
          </Button>
          <Popconfirm title="确认删除此插件？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title level={4} style={{ margin: 0 }}>插件管理</Typography.Title>
        <Space>
          <Button icon={<ApartmentOutlined />} onClick={() => setTopologyOpen(true)}>
            插件拓扑图
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            创建插件
          </Button>
        </Space>
      </div>
      <Card>
        <Table
          dataSource={plugins}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>
      <PluginForm
        open={formOpen}
        initialValues={editing}
        onOk={editing ? handleEdit : handleCreate}
        onCancel={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
      />
      <PluginTopologyModal
        open={topologyOpen}
        plugins={plugins}
        products={products}
        onCancel={() => setTopologyOpen(false)}
      />
    </div>
  );
};

export default PluginList;
