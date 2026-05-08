import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useThingModelStore } from '../../stores/thingModelStore';
import ActionForm from './ActionForm';
import type { ThingModelAction } from '../../types/thingModel';

interface ActionTableProps {
  productId: string;
}

const ActionTable: React.FC<ActionTableProps> = ({ productId }) => {
  const allActions = useThingModelStore((s) => s.actions);
  const actions = useMemo(() => allActions.filter((a) => a.productId === productId), [allActions, productId]);
  const addAction = useThingModelStore((s) => s.addAction);
  const updateAction = useThingModelStore((s) => s.updateAction);
  const deleteAction = useThingModelStore((s) => s.deleteAction);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ThingModelAction | undefined>();

  const handleCreate = async (values: Partial<ThingModelAction>) => {
    try {
      await addAction(productId, values);
      message.success('动作添加成功');
      setFormOpen(false);
    } catch {
      message.error('添加失败');
    }
  };

  const handleEdit = async (values: Partial<ThingModelAction>) => {
    if (editing) {
      try {
        await updateAction(editing.id, values);
        message.success('动作更新成功');
        setEditing(undefined);
        setFormOpen(false);
      } catch {
        message.error('更新失败');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAction(id);
      message.success('动作已删除');
    } catch {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '标识符', dataIndex: 'identifier', key: 'identifier', width: 160 },
    { title: '动作名称', dataIndex: 'name', key: 'name', width: 160 },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '输入参数',
      key: 'inputParams',
      width: 100,
      render: (_: unknown, record: ThingModelAction) => `${record.inputParams.length} 个`,
    },
    {
      title: '输出参数',
      key: 'outputParams',
      width: 100,
      render: (_: unknown, record: ThingModelAction) => `${record.outputParams.length} 个`,
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: ThingModelAction) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditing(record);
              setFormOpen(true);
            }}
          />
          <Popconfirm title="确认删除此动作？" onConfirm={() => handleDelete(record.id)}>
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
          添加动作
        </Button>
      </div>
      <Table dataSource={actions} columns={columns} rowKey="id" size="small" pagination={false} virtual={false} />
      <ActionForm
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

export default ActionTable;
