import { JsonStore } from './jsonStore.js';
import type {
  Product, ThingModelProperty, ThingModelAction, ThingModelService,
  Plugin, PluginVersion, PushRule, PushChannel, MessageTemplate, PushLog,
  ProductCategoryItem,
} from '@iot-platform/shared';

const productStore = new JsonStore<Product>('products.json');

export async function seedDataIfEmpty() {
  if (!(await productStore.isEmpty())) {
    console.log('📦 Data files exist, skipping seed.');
    return;
  }
  console.log('🌱 Seeding initial data...');

  const products: Product[] = [
    { id: 'prod-001', name: '智能灯泡 Pro', image: '', description: '支持调光调色的智能LED灯泡，支持WiFi连接和语音控制', category: 'light', connectionType: 'WiFi', status: 'published', createdAt: '2026-03-15T08:00:00.000Z', updatedAt: '2026-04-10T12:00:00.000Z' },
    { id: 'prod-002', name: '温湿度传感器 S1', image: '', description: '高精度温湿度传感器，蓝牙连接，支持历史数据记录', category: 'sensor', connectionType: 'BLE', status: 'published', createdAt: '2026-03-20T10:00:00.000Z', updatedAt: '2026-04-08T15:00:00.000Z' },
    { id: 'prod-003', name: '智能开关面板', image: '', description: '零火线智能墙壁开关，支持Zigbee组网', category: 'switch', connectionType: 'Zigbee', status: 'draft', createdAt: '2026-04-01T09:00:00.000Z', updatedAt: '2026-04-20T11:00:00.000Z' },
    { id: 'prod-004', name: '多功能网关', image: '', description: '支持Zigbee/BLE多协议网关，可连接200+子设备', category: 'gateway', connectionType: 'WiFi', status: 'published', createdAt: '2026-02-10T08:00:00.000Z', updatedAt: '2026-04-15T16:00:00.000Z' },
  ];
  const productCategories: ProductCategoryItem[] = [
    { id: 'cat-001', key: 'light', name: '灯具', createdAt: '2026-03-10T08:00:00.000Z', updatedAt: '2026-03-10T08:00:00.000Z' },
    { id: 'cat-002', key: 'switch', name: '开关', createdAt: '2026-03-10T08:00:00.000Z', updatedAt: '2026-03-10T08:00:00.000Z' },
    { id: 'cat-003', key: 'sensor', name: '传感器', createdAt: '2026-03-10T08:00:00.000Z', updatedAt: '2026-03-10T08:00:00.000Z' },
    { id: 'cat-004', key: 'gateway', name: '网关', createdAt: '2026-03-10T08:00:00.000Z', updatedAt: '2026-03-10T08:00:00.000Z' },
    { id: 'cat-005', key: 'camera', name: '摄像头', createdAt: '2026-03-10T08:00:00.000Z', updatedAt: '2026-03-10T08:00:00.000Z' },
    { id: 'cat-006', key: 'appliance', name: '家电', createdAt: '2026-03-10T08:00:00.000Z', updatedAt: '2026-03-10T08:00:00.000Z' },
    { id: 'cat-007', key: 'other', name: '其他', createdAt: '2026-03-10T08:00:00.000Z', updatedAt: '2026-03-10T08:00:00.000Z' },
  ];
  const properties: ThingModelProperty[] = [
    { id: 'prop-001', productId: 'prod-001', identifier: 'power_switch', name: '电源开关', description: '控制灯泡的开关状态', dataType: 'bool', accessMode: 'rw', required: true, specs: { boolLabels: { trueLabel: '开启', falseLabel: '关闭' } }, createdAt: '2026-03-15T09:00:00.000Z', updatedAt: '2026-03-15T09:00:00.000Z' },
    { id: 'prop-002', productId: 'prod-001', identifier: 'brightness', name: '亮度', description: '灯泡的亮度等级', dataType: 'int', accessMode: 'rw', required: true, specs: { min: 1, max: 100, step: 1, unit: '%' }, createdAt: '2026-03-15T09:05:00.000Z', updatedAt: '2026-03-15T09:05:00.000Z' },
    { id: 'prop-003', productId: 'prod-001', identifier: 'color_temperature', name: '色温', description: '灯光色温', dataType: 'int', accessMode: 'rw', required: false, specs: { min: 2700, max: 6500, step: 100, unit: 'K' }, createdAt: '2026-03-15T09:10:00.000Z', updatedAt: '2026-03-15T09:10:00.000Z' },
    { id: 'prop-004', productId: 'prod-001', identifier: 'mode', name: '灯光模式', description: '预设灯光模式', dataType: 'enum', accessMode: 'rw', required: false, specs: { enumValues: [{ value: 0, label: '日光模式' }, { value: 1, label: '阅读模式' }, { value: 2, label: '夜灯模式' }, { value: 3, label: '影院模式' }] }, createdAt: '2026-03-16T10:00:00.000Z', updatedAt: '2026-03-16T10:00:00.000Z' },
    { id: 'prop-005', productId: 'prod-002', identifier: 'temperature', name: '温度', description: '当前环境温度', dataType: 'float', accessMode: 'r', required: true, specs: { min: -40, max: 80, step: 0.1, unit: '°C' }, createdAt: '2026-03-20T11:00:00.000Z', updatedAt: '2026-03-20T11:00:00.000Z' },
    { id: 'prop-006', productId: 'prod-002', identifier: 'humidity', name: '湿度', description: '当前环境湿度', dataType: 'float', accessMode: 'r', required: true, specs: { min: 0, max: 100, step: 0.1, unit: '%RH' }, createdAt: '2026-03-20T11:05:00.000Z', updatedAt: '2026-03-20T11:05:00.000Z' },
    { id: 'prop-007', productId: 'prod-002', identifier: 'battery_level', name: '电池电量', description: '设备电池剩余电量', dataType: 'int', accessMode: 'r', required: true, specs: { min: 0, max: 100, step: 1, unit: '%' }, createdAt: '2026-03-20T11:10:00.000Z', updatedAt: '2026-03-20T11:10:00.000Z' },
  ];
  const actions: ThingModelAction[] = [
    { id: 'act-001', productId: 'prod-001', identifier: 'set_color', name: '设置颜色', description: '设置灯泡的RGB颜色值', inputParams: [{ identifier: 'r', name: '红色', dataType: 'int', required: true, specs: { min: 0, max: 255 } }, { identifier: 'g', name: '绿色', dataType: 'int', required: true, specs: { min: 0, max: 255 } }, { identifier: 'b', name: '蓝色', dataType: 'int', required: true, specs: { min: 0, max: 255 } }], outputParams: [{ identifier: 'success', name: '是否成功', dataType: 'bool', required: true }], createdAt: '2026-03-16T11:00:00.000Z', updatedAt: '2026-03-16T11:00:00.000Z' },
    { id: 'act-002', productId: 'prod-001', identifier: 'start_breathing', name: '启动呼吸灯', description: '启动呼吸灯效果', inputParams: [{ identifier: 'frequency', name: '频率', dataType: 'float', required: true, specs: { min: 0.1, max: 5, unit: 'Hz' } }, { identifier: 'duration', name: '持续时间', dataType: 'int', required: false, specs: { min: 0, max: 3600, unit: '秒' } }], outputParams: [], createdAt: '2026-03-17T14:00:00.000Z', updatedAt: '2026-03-17T14:00:00.000Z' },
    { id: 'act-003', productId: 'prod-002', identifier: 'calibrate', name: '校准传感器', description: '对温湿度传感器进行校准', inputParams: [{ identifier: 'temp_offset', name: '温度偏移', dataType: 'float', required: false, specs: { min: -5, max: 5, unit: '°C' } }, { identifier: 'humi_offset', name: '湿度偏移', dataType: 'float', required: false, specs: { min: -10, max: 10, unit: '%RH' } }], outputParams: [{ identifier: 'success', name: '是否成功', dataType: 'bool', required: true }, { identifier: 'message', name: '返回消息', dataType: 'string', required: false }], createdAt: '2026-03-21T09:00:00.000Z', updatedAt: '2026-03-21T09:00:00.000Z' },
  ];
  const services: ThingModelService[] = [
    { id: 'svc-001', productId: 'prod-001', identifier: 'light_control', name: '灯光控制服务', description: '包含灯光控制相关的全部属性和动作', propertyIds: ['prop-001', 'prop-002', 'prop-003', 'prop-004'], actionIds: ['act-001', 'act-002'], createdAt: '2026-03-18T10:00:00.000Z', updatedAt: '2026-03-18T10:00:00.000Z' },
    { id: 'svc-002', productId: 'prod-002', identifier: 'env_monitor', name: '环境监测服务', description: '温湿度数据采集与校准服务', propertyIds: ['prop-005', 'prop-006', 'prop-007'], actionIds: ['act-003'], createdAt: '2026-03-22T10:00:00.000Z', updatedAt: '2026-03-22T10:00:00.000Z' },
  ];
  const plugins: Plugin[] = [
    { id: 'plug-001', name: '智能灯控插件', description: '用于控制智能灯泡系列产品的 React Native 插件', platform: 'both', productIds: ['prod-001'], status: 'active', createdAt: '2026-03-25T08:00:00.000Z', updatedAt: '2026-04-12T14:00:00.000Z' },
    { id: 'plug-002', name: '传感器数据插件', description: '传感器数据展示与历史曲线插件', platform: 'both', productIds: ['prod-002'], status: 'active', createdAt: '2026-04-01T10:00:00.000Z', updatedAt: '2026-04-15T09:00:00.000Z' },
    { id: 'plug-003', name: '网关管理插件', description: '网关子设备管理与配置插件', platform: 'iOS', productIds: ['prod-004'], status: 'inactive', createdAt: '2026-04-10T11:00:00.000Z', updatedAt: '2026-04-20T16:00:00.000Z' },
  ];
  const versions: PluginVersion[] = [
    { id: 'ver-001', pluginId: 'plug-001', version: '1.0.0', releaseNotes: '初始版本，支持开关、调光、色温调节功能', fileName: 'light-control-1.0.0.zip', fileSize: 2048576, status: 'online', createdAt: '2026-03-28T10:00:00.000Z' },
    { id: 'ver-002', pluginId: 'plug-001', version: '1.1.0', releaseNotes: '新增呼吸灯效果、RGB颜色选择器', fileName: 'light-control-1.1.0.zip', fileSize: 2356224, status: 'testing', createdAt: '2026-04-12T14:00:00.000Z' },
    { id: 'ver-003', pluginId: 'plug-002', version: '1.0.0', releaseNotes: '初始版本，支持实时温湿度展示和24小时历史曲线', fileName: 'sensor-data-1.0.0.zip', fileSize: 1756160, status: 'online', createdAt: '2026-04-05T09:00:00.000Z' },
  ];
  const channels: PushChannel[] = [
    { id: 'ch-001', name: '设备状态回调', type: 'http_callback', config: { url: 'https://api.example.com/iot/callback', method: 'POST', secret: 'sk_demo_xxxxx' }, status: 'active', createdAt: '2026-04-01T08:00:00.000Z', updatedAt: '2026-04-01T08:00:00.000Z' },
    { id: 'ch-002', name: 'MQTT 数据通道', type: 'mqtt', config: { broker: 'mqtt://broker.example.com:1883', topic: 'iot/events/#', qos: 1 }, status: 'active', createdAt: '2026-04-05T10:00:00.000Z', updatedAt: '2026-04-05T10:00:00.000Z' },
  ];
  const templates: MessageTemplate[] = [
    { id: 'tpl-001', name: '设备上线通知', content: '{"event":"device_online","device":"${deviceName}","product":"${productName}","time":"${triggerTime}"}', format: 'json', description: '设备上线时发送的JSON格式通知', createdAt: '2026-04-02T09:00:00.000Z', updatedAt: '2026-04-02T09:00:00.000Z' },
    { id: 'tpl-002', name: '属性变更告警', content: '告警：设备 ${deviceName} 的 ${propertyName} 值已变更为 ${value}，触发时间：${triggerTime}', format: 'text', description: '属性值变更时发送的文本告警', createdAt: '2026-04-03T11:00:00.000Z', updatedAt: '2026-04-03T11:00:00.000Z' },
  ];
  const rules: PushRule[] = [
    { id: 'rule-001', name: '灯泡上线通知', productId: 'prod-001', triggerType: 'device_online', conditions: [], channelId: 'ch-001', templateId: 'tpl-001', enabled: true, createdAt: '2026-04-06T10:00:00.000Z', updatedAt: '2026-04-06T10:00:00.000Z' },
    { id: 'rule-002', name: '温度超限告警', productId: 'prod-002', triggerType: 'property_change', conditions: [{ field: 'temperature', operator: '>', value: '40' }], channelId: 'ch-002', templateId: 'tpl-002', enabled: true, createdAt: '2026-04-07T14:00:00.000Z', updatedAt: '2026-04-07T14:00:00.000Z' },
  ];
  const logs: PushLog[] = [
    { id: 'log-001', ruleId: 'rule-001', ruleName: '灯泡上线通知', channelName: '设备状态回调', deviceName: '客厅灯泡-A1', content: '{"event":"device_online","device":"客厅灯泡-A1"}', status: 'success', timestamp: '2026-04-28T08:30:05.000Z' },
    { id: 'log-002', ruleId: 'rule-002', ruleName: '温度超限告警', channelName: 'MQTT 数据通道', deviceName: '卧室传感器-B2', content: '告警：设备 卧室传感器-B2 的 温度 值已变更为 42.5°C', status: 'success', timestamp: '2026-04-28T14:15:02.000Z' },
    { id: 'log-003', ruleId: 'rule-001', ruleName: '灯泡上线通知', channelName: '设备状态回调', deviceName: '书房灯泡-A3', content: '{"event":"device_online","device":"书房灯泡-A3"}', status: 'failed', timestamp: '2026-04-27T19:00:03.000Z', errorMsg: '回调地址连接超时 (HTTP 504)' },
    { id: 'log-004', ruleId: 'rule-002', ruleName: '温度超限告警', channelName: 'MQTT 数据通道', deviceName: '阳台传感器-B1', content: '告警：设备 阳台传感器-B1 的 温度 值已变更为 45.2°C', status: 'success', timestamp: '2026-04-27T13:45:01.000Z' },
    { id: 'log-005', ruleId: 'rule-001', ruleName: '灯泡上线通知', channelName: '设备状态回调', deviceName: '客厅灯泡-A1', content: '{"event":"device_online","device":"客厅灯泡-A1"}', status: 'success', timestamp: '2026-04-26T07:00:02.000Z' },
  ];

  await Promise.all([
    new JsonStore<Product>('products.json').writeAll(products),
    new JsonStore<ProductCategoryItem>('product-categories.json').writeAll(productCategories),
    new JsonStore<ThingModelProperty>('properties.json').writeAll(properties),
    new JsonStore<ThingModelAction>('actions.json').writeAll(actions),
    new JsonStore<ThingModelService>('services.json').writeAll(services),
    new JsonStore<Plugin>('plugins.json').writeAll(plugins),
    new JsonStore<PluginVersion>('versions.json').writeAll(versions),
    new JsonStore<PushChannel>('push-channels.json').writeAll(channels),
    new JsonStore<MessageTemplate>('push-templates.json').writeAll(templates),
    new JsonStore<PushRule>('push-rules.json').writeAll(rules),
    new JsonStore<PushLog>('push-logs.json').writeAll(logs),
  ]);
  console.log('✅ Seed data loaded.');
}
