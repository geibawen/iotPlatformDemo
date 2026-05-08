import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';
import type { ThingModelService, ThingModelProperty, ThingModelAction } from '../../types/thingModel';

interface ServiceFormProps {
  open: boolean;
  initialValues?: ThingModelService;
  properties: ThingModelProperty[];
  actions: ThingModelAction[];
  onOk: (values: Partial<ThingModelService>) => void;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  open, initialValues, properties, actions, onOk, onCancel,
}) => {
  const [form] = Form.useForm();
  const isEdit = !!initialValues?.id;

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        identifier: initialValues.identifier,
        name: initialValues.name,
        description: initialValues.description,
        propertyIds: initialValues.propertyIds || [],
        actionIds: initialValues.actionIds || [],
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch {
      // validation
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑服务' : '添加服务'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="identifier"
          label="标识符"
          rules={[
            { required: true, message: '请输入标识符' },
            { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '只允许英文字母、数字和下划线' },
          ]}
        >
          <Input placeholder="如：light_control" disabled={isEdit} />
        </Form.Item>
        <Form.Item name="name" label="服务名称" rules={[{ required: true, message: '请输入服务名称' }]}>
          <Input placeholder="如：灯光控制服务" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="服务描述" rows={2} />
        </Form.Item>
        <Form.Item name="propertyIds" label="关联属性">
          <Select
            mode="multiple"
            placeholder="选择要关联的属性"
            optionFilterProp="label"
            options={properties.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.identifier})`,
            }))}
          />
        </Form.Item>
        <Form.Item name="actionIds" label="关联动作">
          <Select
            mode="multiple"
            placeholder="选择要关联的动作"
            optionFilterProp="label"
            options={actions.map((a) => ({
              value: a.id,
              label: `${a.name} (${a.identifier})`,
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ServiceForm;
