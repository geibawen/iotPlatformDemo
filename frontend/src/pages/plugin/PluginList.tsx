import React, { useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message, Card, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePluginStore } from '../../stores/pluginStore';
import { useProductStore } from '../../stores/productStore';
import PluginForm from '../../components/plugin/PluginForm';
import type { Plugin, PluginPlatform } from '../../types/plugin';
import { PLUGIN_PLATFORM_LABELS } from '../../types/plugin';
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
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform: PluginPlatform) => PLUGIN_PLATFORM_LABELS[platform],
    },
    {
      title: '关联产品',
      key: 'productIds',
      width: 200,
      render: (_: unknown, record: Plugin) => (
        <Space wrap>
          {record.productIds.map((pid) => {
            const p = products.find((prod) => prod.id === pid);
            return p ? <Tag key={pid}>{p.name}</Tag> : null;
          })}
          {record.productIds.length === 0 && <span style={{ color: '#999' }}>未关联</span>}
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
    </div>
  );
};

export default PluginList;
