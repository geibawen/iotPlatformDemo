import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Popconfirm, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useThingModelStore } from '../../stores/thingModelStore';
import PropertyForm from './PropertyForm';
import type { ThingModelProperty, DataType, AccessMode } from '../../types/thingModel';
import { DATA_TYPE_LABELS, ACCESS_MODE_LABELS } from '../../types/thingModel';

interface PropertyTableProps {
  productId: string;
}

const PropertyTable: React.FC<PropertyTableProps> = ({ productId }) => {
  const allProperties = useThingModelStore((s) => s.properties);
  const properties = useMemo(() => allProperties.filter((p) => p.productId === productId), [allProperties, productId]);
  const addProperty = useThingModelStore((s) => s.addProperty);
  const updateProperty = useThingModelStore((s) => s.updateProperty);
  const deleteProperty = useThingModelStore((s) => s.deleteProperty);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ThingModelProperty | undefined>();

  const handleCreate = async (values: Partial<ThingModelProperty>) => {
    try {
      await addProperty(productId, values);
      message.success('属性添加成功');
      setFormOpen(false);
    } catch {
      message.error('添加失败');
    }
  };

  const handleEdit = async (values: Partial<ThingModelProperty>) => {
    if (editing) {
      try {
        await updateProperty(editing.id, values);
        message.success('属性更新成功');
        setEditing(undefined);
        setFormOpen(false);
      } catch {
        message.error('更新失败');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProperty(id);
      message.success('属性已删除');
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '标识符', dataIndex: 'identifier', key: 'identifier', width: 160 },
    { title: '属性名称', dataIndex: 'name', key: 'name', width: 140 },
    {
      title: '数据类型',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 130,
      render: (dt: DataType) => <Tag>{DATA_TYPE_LABELS[dt]}</Tag>,
    },
    {
      title: '读写模式',
      dataIndex: 'accessMode',
      key: 'accessMode',
      width: 80,
      render: (am: AccessMode) => ACCESS_MODE_LABELS[am],
    },
    {
      title: '单位',
      key: 'unit',
      width: 80,
      render: (_: unknown, record: ThingModelProperty) => record.specs?.unit || '-',
    },
    {
      title: '必填',
      dataIndex: 'required',
      key: 'required',
      width: 60,
      render: (v: boolean) => (v ? <Tag color="blue">是</Tag> : '否'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: ThingModelProperty) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              setFormOpen(true);
            }}
          />
          <Popconfirm title="确认删除此属性？" onConfirm={() => handleDelete(record.id)}>
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
          添加属性
        </Button>
      </div>
      <Table
        dataSource={properties}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        virtual={false}
      />
      <PropertyForm
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

export default PropertyTable;
