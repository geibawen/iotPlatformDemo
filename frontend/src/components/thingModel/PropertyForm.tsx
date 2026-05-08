import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, Button, Space, Divider } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { ThingModelProperty, DataType, AccessMode } from '../../types/thingModel';
import { DATA_TYPE_LABELS, ACCESS_MODE_LABELS } from '../../types/thingModel';

interface PropertyFormProps {
  open: boolean;
  initialValues?: ThingModelProperty;
  onOk: (values: Partial<ThingModelProperty>) => void;
  onCancel: () => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ open, initialValues, onOk, onCancel }) => {
  const [form] = Form.useForm();
  const [dataType, setDataType] = useState<DataType>(initialValues?.dataType || 'int');
  const isEdit = !!initialValues?.id;

  useEffect(() => {
    if (open && initialValues) {
      form.setFieldsValue({
        identifier: initialValues.identifier,
        name: initialValues.name,
        description: initialValues.description,
        dataType: initialValues.dataType,
        accessMode: initialValues.accessMode,
        required: initialValues.required,
        min: initialValues.specs?.min,
        max: initialValues.specs?.max,
        step: initialValues.specs?.step,
        unit: initialValues.specs?.unit,
        maxLength: initialValues.specs?.maxLength,
        boolTrueLabel: initialValues.specs?.boolLabels?.trueLabel || '开启',
        boolFalseLabel: initialValues.specs?.boolLabels?.falseLabel || '关闭',
        enumValues: initialValues.specs?.enumValues || [],
        structFields: initialValues.specs?.structFields || [],
        arrayItemType: initialValues.specs?.arrayItemType || 'int',
      });
      setDataType(initialValues.dataType);
    } else if (open) {
      form.resetFields();
      setDataType('int');
    }
  }, [open, initialValues, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const specs: ThingModelProperty['specs'] = {};

      switch (values.dataType) {
        case 'int':
        case 'float':
          specs.min = values.min;
          specs.max = values.max;
          specs.step = values.step;
          specs.unit = values.unit;
          break;
        case 'bool':
          specs.boolLabels = {
            trueLabel: values.boolTrueLabel || '开启',
            falseLabel: values.boolFalseLabel || '关闭',
          };
          break;
        case 'string':
          specs.maxLength = values.maxLength;
          break;
        case 'enum':
          specs.enumValues = values.enumValues || [];
          break;
        case 'struct':
          specs.structFields = values.structFields || [];
          break;
        case 'array':
          specs.arrayItemType = values.arrayItemType;
          break;
      }

      onOk({
        identifier: values.identifier,
        name: values.name,
        description: values.description,
        dataType: values.dataType,
        accessMode: values.accessMode,
        required: values.required ?? false,
        specs,
      });
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑属性' : '添加属性'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={640}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="identifier"
          label="标识符"
          rules={[
            { required: true, message: '请输入标识符' },
            { pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/, message: '只允许英文字母、数字和下划线，且不能以数字开头' },
          ]}
        >
          <Input placeholder="如：temperature" maxLength={50} disabled={isEdit} />
        </Form.Item>
        <Form.Item name="name" label="属性名称" rules={[{ required: true, message: '请输入属性名称' }]}>
          <Input placeholder="如：温度" maxLength={50} />
        </Form.Item>
        <Form.Item name="description" label="描述">
          <Input.TextArea placeholder="属性描述" rows={2} maxLength={200} />
        </Form.Item>
        <Space size={16} style={{ width: '100%' }}>
          <Form.Item name="dataType" label="数据类型" rules={[{ required: true }]} style={{ width: 200 }}>
            <Select onChange={(v: DataType) => setDataType(v)}>
              {(Object.keys(DATA_TYPE_LABELS) as DataType[]).map((key) => (
                <Select.Option key={key} value={key}>
                  {DATA_TYPE_LABELS[key]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="accessMode" label="读写模式" rules={[{ required: true }]} style={{ width: 140 }}>
            <Select>
              {(Object.keys(ACCESS_MODE_LABELS) as AccessMode[]).map((key) => (
                <Select.Option key={key} value={key}>
                  {ACCESS_MODE_LABELS[key]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="required" label="是否必填" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Space>

        <Divider style={{ margin: '8px 0 16px' }} />

        {/* int / float specs */}
        {(dataType === 'int' || dataType === 'float') && (
          <Space size={16} wrap>
            <Form.Item name="min" label="最小值">
              <InputNumber placeholder="最小" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="max" label="最大值">
              <InputNumber placeholder="最大" style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="step" label="步长">
              <InputNumber placeholder="步长" min={0} style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="unit" label="单位">
              <Input placeholder="如：°C" style={{ width: 120 }} />
            </Form.Item>
          </Space>
        )}

        {/* bool specs */}
        {dataType === 'bool' && (
          <Space size={16}>
            <Form.Item name="boolTrueLabel" label="True 描述">
              <Input placeholder="开启" style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="boolFalseLabel" label="False 描述">
              <Input placeholder="关闭" style={{ width: 160 }} />
            </Form.Item>
          </Space>
        )}

        {/* string specs */}
        {dataType === 'string' && (
          <Form.Item name="maxLength" label="最大长度">
            <InputNumber placeholder="最大字符数" min={1} max={10240} style={{ width: 200 }} />
          </Form.Item>
        )}

        {/* enum specs */}
        {dataType === 'enum' && (
          <Form.Item label="枚举值">
            <Form.List name="enumValues">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} align="baseline" style={{ marginBottom: 8 }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        rules={[{ required: true, message: '值' }]}
                        noStyle
                      >
                        <InputNumber placeholder="值" style={{ width: 100 }} />
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'label']}
                        rules={[{ required: true, message: '标签' }]}
                        noStyle
                      >
                        <Input placeholder="标签描述" style={{ width: 200 }} />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add({ value: fields.length, label: '' })} icon={<PlusOutlined />}>
                    添加枚举值
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        )}

        {/* struct specs */}
        {dataType === 'struct' && (
          <Form.Item label="结构体字段">
            <Form.List name="structFields">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field) => (
                    <Space key={field.key} align="baseline" style={{ marginBottom: 8 }}>
                      <Form.Item {...field} name={[field.name, 'identifier']} noStyle rules={[{ required: true }]}>
                        <Input placeholder="标识符" style={{ width: 120 }} />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'name']} noStyle rules={[{ required: true }]}>
                        <Input placeholder="名称" style={{ width: 120 }} />
                      </Form.Item>
                      <Form.Item {...field} name={[field.name, 'dataType']} noStyle rules={[{ required: true }]}>
                        <Select placeholder="类型" style={{ width: 130 }}>
                          {(['int', 'float', 'bool', 'string', 'enum'] as const).map((t) => (
                            <Select.Option key={t} value={t}>
                              {DATA_TYPE_LABELS[t]}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add({ identifier: '', name: '', dataType: 'string' })} icon={<PlusOutlined />}>
                    添加字段
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        )}

        {/* array specs */}
        {dataType === 'array' && (
          <Form.Item name="arrayItemType" label="数组元素类型">
            <Select style={{ width: 200 }}>
              {(['int', 'float', 'bool', 'string', 'enum', 'struct'] as const).map((t) => (
                <Select.Option key={t} value={t}>
                  {DATA_TYPE_LABELS[t]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default PropertyForm;
