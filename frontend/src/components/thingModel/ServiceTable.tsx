import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useThingModelStore } from '../../stores/thingModelStore';
import ServiceForm from './ServiceForm';
import type { ThingModelService } from '../../types/thingModel';

interface ServiceTableProps {
  productId: string;
}

const ServiceTable: React.FC<ServiceTableProps> = ({ productId }) => {
  const allServices = useThingModelStore((s) => s.services);
  const allProperties = useThingModelStore((s) => s.properties);
  const allActions = useThingModelStore((s) => s.actions);
  const services = useMemo(() => allServices.filter((s) => s.productId === productId), [allServices, productId]);
  const properties = useMemo(() => allProperties.filter((p) => p.productId === productId), [allProperties, productId]);
  const actions = useMemo(() => allActions.filter((a) => a.productId === productId), [allActions, productId]);
  const addService = useThingModelStore((s) => s.addService);
  const updateService = useThingModelStore((s) => s.updateService);
  const deleteService = useThingModelStore((s) => s.deleteService);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ThingModelService | undefined>();

  const handleCreate = async (values: Partial<ThingModelService>) => {
    try {
      await addService(productId, values);
      message.success('服务添加成功');
      setFormOpen(false);
    } catch {
      message.error('添加失败');
    }
  };

  const handleEdit = async (values: Partial<ThingModelService>) => {
    if (editing) {
      try {
        await updateService(editing.id, values);
        message.success('服务更新成功');
        setEditing(undefined);
        setFormOpen(false);
      } catch {
        message.error('更新失败');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      message.success('服务已删除');
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '标识符', dataIndex: 'identifier', key: 'identifier', width: 160 },
    { title: '服务名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '关联属性',
      key: 'propertyIds',
      width: 100,
      render: (_: unknown, record: ThingModelService) => (
        <Tag color="blue">{record.propertyIds.length} 个</Tag>
      ),
    },
    {
      title: '关联动作',
      key: 'actionIds',
      width: 100,
      render: (_: unknown, record: ThingModelService) => (
        <Tag color="green">{record.actionIds.length} 个</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: ThingModelService) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              setFormOpen(true);
            }}
          />
          <Popconfirm title="确认删除此服务？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
        >
          添加服务
        </Button>
      </div>
      <Table dataSource={services} columns={columns} rowKey="id" size="small" pagination={false} virtual={false} />
      <ServiceForm
        open={formOpen}
        initialValues={editing}
        properties={properties}
        actions={actions}
        onOk={editing ? handleEdit : handleCreate}
        onCancel={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
      />
    </div>
  );
};

export default ServiceTable;
