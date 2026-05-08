import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Space, Select, Switch } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ThingModelAction, DataType } from '../../types/thingModel';
import { DATA_TYPE_LABELS } from '../../types/thingModel';

interface ActionFormProps {
  open: boolean;
  initialValues?: ThingModelAction;
  onOk: (values: Partial<ThingModelAction>) => void;
  onCancel: () => void;
}

const PARAM_TYPES: DataType[] = ['int', 'float', 'bool', 'string', 'enum'];

const ParamList: React.FC<{ name: string; label: string }> = ({ name, label }) => (
  <Form.Item label={label}>
    <Form.List name={name}>
      {(fields, { add, remove }) => (
        <>
          {fields.map((field) => (
            <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }} wrap>
              <Form.Item {...field} name={[field.name, 'identifier']} noStyle rules={[{ required: true, message: '标识符' }]}>
                <Input placeholder="标识符" style={{ width: 120 }} />
              </Form.Item>
              <Form.Item {...field} name={[field.name, 'name']} noStyle rules={[{ required: true, message: '名称' }]}>
                <Input placeholder="参数名称" style={{ width: 120 }} />
              </Form.Item>
              <Form.Item {...field} name={[field.name, 'dataType']} noStyle rules={[{ required: true }]}>
                <Select placeholder="类型" style={{ width: 130 }}>
                  {PARAM_TYPES.map((t) => (
                    <Select.Option key={t} value={t}>{DATA_TYPE_LABELS[t]}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item {...field} name={[field.name, 'required']} noStyle valuePropName="checked">
                <Switch checkedChildren="必填" unCheckedChildren="选填" />
              </Form.Item>
              <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: '#ff4d4f' }} />
            </Space>
          ))}
          <Button type="dashed" onClick={() => add({ identifier: '', name: '', dataType: 'string', required: false })} icon={<PlusOutlined />} size="small">
            添加参数
          </Button>
        </>
      )}
    </Form.List>
  </Form.Item>
);

const ActionForm: React.FC<ActionFormProps> = ({ open, initialValues, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const isEdit = !!initialValues?.id;

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        identifier: initialValues.identifier,
        name: initialValues.name,
        description: initialValues.description,
        inputParams: initialValues.inputParams || [],
        outputParams: initialValues.outputParams || [],
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk({
        identifier: values.identifier,
        name: values.name,
        description: values.description,
        inputParams: values.inputParams || [],
        outputParams: values.outputParams || [],
      });
    } catch {
      // validation
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑动作' : '添加动作'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={680}
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
          <Input placeholder="如：set_color" disabled={isEdit} />
        </Form.Item>
        <Form.Item name="name" label="动作名称" rules={[{ required: true, message: '请输入动作名称' }]}>
          <Input placeholder="如：设置颜色" />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="动作描述" rows={2} />
        </Form.Item>
        <ParamList name="inputParams" label="输入参数" />
        <ParamList name="outputParams" label="输出参数" />
      </Form>
    </Modal>
  );
};

export default ActionForm;
