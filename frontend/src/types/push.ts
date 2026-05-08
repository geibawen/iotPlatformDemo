export type TriggerType = 'property_change' | 'device_online' | 'device_offline' | 'event_report';

export type ChannelType = 'http_callback' | 'mqtt' | 'kafka' | 'mns';

export type ConditionOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';

export interface RuleCondition {
  field: string;
  operator: ConditionOperator;
  value: string;
}

export interface PushRule {
  id: string;
  name: string;
  productId: string;
  triggerType: TriggerType;
  conditions: RuleCondition[];
  channelId: string;
  templateId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HttpCallbackConfig {
  url: string;
  method: 'POST' | 'GET';
  headers?: Record<string, string>;
  secret?: string;
}

export interface MqttConfig {
  broker: string;
  topic: string;
  qos: 0 | 1 | 2;
  username?: string;
  password?: string;
}

export interface KafkaConfig {
  bootstrapServers: string;
  topic: string;
  groupId?: string;
}

export interface MnsConfig {
  endpoint: string;
  queueName: string;
  accessKeyId?: string;
}

export type ChannelConfig = HttpCallbackConfig | MqttConfig | KafkaConfig | MnsConfig;

export interface PushChannel {
  id: string;
  name: string;
  type: ChannelType;
  config: ChannelConfig;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export type TemplateFormat = 'json' | 'text';

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  format: TemplateFormat;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type PushLogStatus = 'success' | 'failed';

export interface PushLog {
  id: string;
  ruleId: string;
  ruleName: string;
  channelName: string;
  deviceName: string;
  content: string;
  status: PushLogStatus;
  timestamp: string;
  errorMsg?: string;
}

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  property_change: '属性变更',
  device_online: '设备上线',
  device_offline: '设备离线',
  event_report: '事件上报',
};

export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  http_callback: 'HTTP 回调',
  mqtt: 'MQTT',
  kafka: 'Kafka',
  mns: '消息服务 (MNS)',
};
