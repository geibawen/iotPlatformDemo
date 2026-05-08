import { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDeviceStore } from '../../stores/deviceStore';
import { useProductStore } from '../../stores/productStore';
import { DEVICE_STATUS_LABELS } from '@iot-platform/shared';
import type { Device } from '@iot-platform/shared';

export default function DeviceList() {
  const { devices, loading, fetchDevices, addDevice, deleteDevice } = useDeviceStore();
  const { products } = useProductStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { fetchDevices(); }, []);

  const handleAdd = async () => {
    const values = await form.validateFields();
    await addDevice(values);
    message.success('设备添加成功');
    setModalOpen(false);
    form.resetFields();
  };

  const columns = [
    { title: '设备名称', dataIndex: 'name', key: 'name' },
    {
      title: '所属产品', dataIndex: 'productId', key: 'productId',
      render: (pid: string) => products.find((p) => p.id === pid)?.name || pid,
    },
    { title: 'SN', dataIndex: 'sn', key: 'sn' },
    { title: 'MAC', dataIndex: 'mac', key: 'mac' },
    { title: '固件版本', dataIndex: 'firmwareVersion', key: 'firmwareVersion' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => (
        <Tag color={s === 'online' ? 'success' : 'default'}>
          {DEVICE_STATUS_LABELS[s as keyof typeof DEVICE_STATUS_LABELS]}
        </Tag>
      ),
    },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: Device) => (
        <Space>
          <Popconfirm title="确认删除?" onConfirm={() => deleteDevice(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="设备管理"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>添加设备</Button>}
      >
        <Table dataSource={devices} columns={columns} rowKey="id" loading={loading} />
      </Card>

      <Modal title="添加设备" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="设备名称" rules={[{ required: true }]}>
            <Input placeholder="如：客厅灯泡-A1" />
          </Form.Item>
          <Form.Item name="productId" label="所属产品" rules={[{ required: true }]}>
            <Select placeholder="选择产品">
              {products.map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="sn" label="序列号" rules={[{ required: true }]}>
            <Input placeholder="设备序列号" />
          </Form.Item>
          <Form.Item name="mac" label="MAC 地址" rules={[{ required: true }]}>
            <Input placeholder="如 AA:BB:CC:DD:EE:FF" />
          </Form.Item>
          <Form.Item name="firmwareVersion" label="固件版本" initialValue="1.0.0">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
