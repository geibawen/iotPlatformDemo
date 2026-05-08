import { useEffect, useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Upload, message, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useFirmwareStore } from '../../stores/firmwareStore';
import { useProductStore } from '../../stores/productStore';
import { FIRMWARE_STATUS_LABELS } from '@iot-platform/shared';
import type { Firmware } from '@iot-platform/shared';

const statusColors: Record<string, string> = {
  draft: 'default',
  testing: 'processing',
  released: 'success',
  disabled: 'error',
};

export default function FirmwareList() {
  const { firmwares, loading, fetchFirmwares, addFirmware, updateFirmware, deleteFirmware } = useFirmwareStore();
  const { products } = useProductStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => { fetchFirmwares(); }, []);

  const handleAdd = async () => {
    const values = await form.validateFields();
    const formData = new FormData();
    formData.append('productId', values.productId);
    formData.append('version', values.version);
    formData.append('releaseNotes', values.releaseNotes || '');
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('file', fileList[0].originFileObj);
    }
    await addFirmware(formData);
    message.success('固件创建成功');
    setModalOpen(false);
    form.resetFields();
    setFileList([]);
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateFirmware(id, { status } as Partial<Firmware>);
    message.success('状态更新成功');
  };

  const columns = [
    { title: '版本号', dataIndex: 'version', key: 'version' },
    {
      title: '所属产品', dataIndex: 'productId', key: 'productId',
      render: (pid: string) => products.find((p) => p.id === pid)?.name || pid,
    },
    { title: '文件名', dataIndex: 'fileName', key: 'fileName' },
    {
      title: '文件大小', dataIndex: 'fileSize', key: 'fileSize',
      render: (size: number) => `${(size / 1024).toFixed(1)} KB`,
    },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s: string) => <Tag color={statusColors[s]}>{FIRMWARE_STATUS_LABELS[s as keyof typeof FIRMWARE_STATUS_LABELS]}</Tag>,
    },
    {
      title: '操作', key: 'actions',
      render: (_: unknown, record: Firmware) => (
        <Space>
          {record.status === 'draft' && <Button size="small" onClick={() => handleStatusChange(record.id, 'testing')}>提交测试</Button>}
          {record.status === 'testing' && <Button size="small" type="primary" onClick={() => handleStatusChange(record.id, 'released')}>发布</Button>}
          {record.status === 'released' && <Button size="small" danger onClick={() => handleStatusChange(record.id, 'disabled')}>停用</Button>}
          <Popconfirm title="确认删除?" onConfirm={() => deleteFirmware(record.id)}>
            <Button size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card
        title="固件管理"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>上传固件</Button>}
      >
        <Table dataSource={firmwares} columns={columns} rowKey="id" loading={loading} />
      </Card>

      <Modal title="上传固件" open={modalOpen} onOk={handleAdd} onCancel={() => setModalOpen(false)} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item name="productId" label="所属产品" rules={[{ required: true, message: '请选择产品' }]}>
            <Select placeholder="选择产品">
              {products.map((p) => <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="version" label="版本号" rules={[{ required: true, message: '请输入版本号' }]}>
            <Input placeholder="如 1.0.0" />
          </Form.Item>
          <Form.Item name="releaseNotes" label="更新说明">
            <Input.TextArea rows={3} placeholder="输入更新说明" />
          </Form.Item>
          <Form.Item label="固件文件">
            <Upload
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
