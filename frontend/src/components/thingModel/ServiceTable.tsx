import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Popconfirm, Tag, message, Modal, Tabs, Card, Typography, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useThingModelStore } from '../../stores/thingModelStore';
import ServiceForm from './ServiceForm';
import PropertyForm from './PropertyForm';
import ActionForm from './ActionForm';
import type { ThingModelService, ThingModelProperty, ThingModelAction, DataType, AccessMode } from '../../types/thingModel';
import { DATA_TYPE_LABELS, ACCESS_MODE_LABELS } from '../../types/thingModel';

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
  const addProperty = useThingModelStore((s) => s.addProperty);
  const addAction = useThingModelStore((s) => s.addAction);
  const updateProperty = useThingModelStore((s) => s.updateProperty);
  const updateAction = useThingModelStore((s) => s.updateAction);
  const deleteProperty = useThingModelStore((s) => s.deleteProperty);
  const deleteAction = useThingModelStore((s) => s.deleteAction);
  const loadByProduct = useThingModelStore((s) => s.loadByProduct);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ThingModelService | undefined>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailServiceId, setDetailServiceId] = useState<string | undefined>();
  const [propertyFormOpen, setPropertyFormOpen] = useState(false);
  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ThingModelService | undefined>();
  const [editingProperty, setEditingProperty] = useState<ThingModelProperty | undefined>();
  const [editingAction, setEditingAction] = useState<ThingModelAction | undefined>();

  const detailService = useMemo(
    () => services.find((s) => s.id === detailServiceId),
    [services, detailServiceId]
  );
  const detailProperties = useMemo(
    () => properties.filter((p) => (detailService?.propertyIds || []).includes(p.id)),
    [properties, detailService]
  );
  const detailActions = useMemo(
    () => actions.filter((a) => (detailService?.actionIds || []).includes(a.id)),
    [actions, detailService]
  );

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

  const openServiceDetail = (service: ThingModelService) => {
    setDetailServiceId(service.id);
    setDetailOpen(true);
  };

  const closeServiceDetail = () => {
    setDetailOpen(false);
    setDetailServiceId(undefined);
    setEditingProperty(undefined);
    setEditingAction(undefined);
  };

  const handleAddPropertyToService = async (values: Partial<ThingModelProperty>) => {
    if (!selectedService) return;
    try {
      await addProperty(productId, { ...values, serviceId: selectedService.id });
      message.success('属性已添加到服务');
      setPropertyFormOpen(false);
      setSelectedService(undefined);
    } catch {
      message.error('添加属性失败');
    }
  };

  const handleEditPropertyInService = async (values: Partial<ThingModelProperty>) => {
    if (!editingProperty) return;
    try {
      await updateProperty(editingProperty.id, values);
      message.success('属性更新成功');
      setPropertyFormOpen(false);
      setEditingProperty(undefined);
      await loadByProduct(productId);
    } catch {
      message.error('更新属性失败');
    }
  };

  const handleAddActionToService = async (values: Partial<ThingModelAction>) => {
    if (!selectedService) return;
    try {
      await addAction(productId, { ...values, serviceId: selectedService.id });
      message.success('动作已添加到服务');
      setActionFormOpen(false);
      setSelectedService(undefined);
    } catch {
      message.error('添加动作失败');
    }
  };

  const handleEditActionInService = async (values: Partial<ThingModelAction>) => {
    if (!editingAction) return;
    try {
      await updateAction(editingAction.id, values);
      message.success('动作更新成功');
      setActionFormOpen(false);
      setEditingAction(undefined);
      await loadByProduct(productId);
    } catch {
      message.error('更新动作失败');
    }
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await deleteProperty(id);
      await loadByProduct(productId);
      message.success('属性已从服务中删除');
    } catch {
      message.error('删除属性失败');
    }
  };

  const handleDeleteAction = async (id: string) => {
    try {
      await deleteAction(id);
      await loadByProduct(productId);
      message.success('动作已从服务中删除');
    } catch {
      message.error('删除动作失败');
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
        <Tag color="blue">{(record.propertyIds || []).length} 个</Tag>
      ),
    },
    {
      title: '关联动作',
      key: 'actionIds',
      width: 100,
      render: (_: unknown, record: ThingModelService) => (
        <Tag color="green">{(record.actionIds || []).length} 个</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: ThingModelService) => (
        <Space>
          <Tooltip title="详情">
            <Button size="small" icon={<EyeOutlined />} onClick={() => openServiceDetail(record)} />
          </Tooltip>
          <Tooltip title="编辑服务">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditing(record);
                setFormOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm title="确认删除此服务？" onConfirm={() => handleDelete(record.id)}>
            <Tooltip title="删除服务">
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Tooltip>
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

      <Modal
        title={detailService ? `服务详情：${detailService.name} (${detailService.identifier})` : '服务详情'}
        open={detailOpen}
        onCancel={closeServiceDetail}
        footer={null}
        width={1000}
        destroyOnHidden
      >
        {detailService && (
          <Card size="small" style={{ marginBottom: 12 }}>
            <Typography.Text strong>服务描述：</Typography.Text>
            <Typography.Text style={{ marginLeft: 8 }}>{detailService.description || '无'}</Typography.Text>
          </Card>
        )}

        <Tabs
          items={[
            {
              key: 'properties',
              label: `属性 (${detailProperties.length})`,
              children: (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        if (!detailService) return;
                        setSelectedService(detailService);
                        setEditingProperty(undefined);
                        setPropertyFormOpen(true);
                      }}
                    >
                      在当前服务新增属性
                    </Button>
                  </div>
                  <Table
                    rowKey="id"
                    size="small"
                    pagination={false}
                    dataSource={detailProperties}
                    columns={[
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
                        width: 90,
                        render: (am: AccessMode) => ACCESS_MODE_LABELS[am],
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
                                setEditingProperty(record);
                                setPropertyFormOpen(true);
                              }}
                            />
                            <Popconfirm title="确认删除此属性？" onConfirm={() => handleDeleteProperty(record.id)}>
                              <Button size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: 'actions',
              label: `动作 (${detailActions.length})`,
              children: (
                <div>
                  <div style={{ marginBottom: 12 }}>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        if (!detailService) return;
                        setSelectedService(detailService);
                        setEditingAction(undefined);
                        setActionFormOpen(true);
                      }}
                    >
                      在当前服务新增动作
                    </Button>
                  </div>
                  <Table
                    rowKey="id"
                    size="small"
                    pagination={false}
                    dataSource={detailActions}
                    columns={[
                      { title: '标识符', dataIndex: 'identifier', key: 'identifier', width: 180 },
                      { title: '动作名称', dataIndex: 'name', key: 'name', width: 160 },
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
                                setEditingAction(record);
                                setActionFormOpen(true);
                              }}
                            />
                            <Popconfirm title="确认删除此动作？" onConfirm={() => handleDeleteAction(record.id)}>
                              <Button size="small" danger icon={<DeleteOutlined />} />
                            </Popconfirm>
                          </Space>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            },
          ]}
        />
      </Modal>

      <ServiceForm
        open={formOpen}
        initialValues={editing}
        onOk={editing ? handleEdit : handleCreate}
        onCancel={() => {
          setFormOpen(false);
          setEditing(undefined);
        }}
      />

      <PropertyForm
        open={propertyFormOpen}
        initialValues={editingProperty}
        onOk={editingProperty ? handleEditPropertyInService : handleAddPropertyToService}
        onCancel={() => {
          setPropertyFormOpen(false);
          setSelectedService(undefined);
          setEditingProperty(undefined);
        }}
      />

      <ActionForm
        open={actionFormOpen}
        initialValues={editingAction}
        onOk={editingAction ? handleEditActionInService : handleAddActionToService}
        onCancel={() => {
          setActionFormOpen(false);
          setSelectedService(undefined);
          setEditingAction(undefined);
        }}
      />
    </div>
  );
};

export default ServiceTable;
