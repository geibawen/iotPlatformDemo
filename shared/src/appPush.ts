export type AppPushStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
export type AppPushTarget = 'all' | 'product' | 'device_group' | 'specified';
export type AppPushType = 'notification' | 'marketing' | 'alert' | 'system';

export interface AppPushStatistics {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
}

export interface AppPushMessage {
  id: string;
  title: string;
  content: string;
  type: AppPushType;
  targetType: AppPushTarget;
  targetProductIds?: string[];
  scheduledAt?: string;
  sentAt?: string;
  status: AppPushStatus;
  statistics: AppPushStatistics;
  createdAt: string;
  updatedAt: string;
}

export const APP_PUSH_STATUS_LABELS: Record<AppPushStatus, string> = {
  draft: '草稿',
  scheduled: '定时发送',
  sending: '发送中',
  sent: '已发送',
  failed: '发送失败',
};

export const APP_PUSH_TARGET_LABELS: Record<AppPushTarget, string> = {
  all: '全部用户',
  product: '按产品',
  device_group: '按设备组',
  specified: '指定用户',
};

export const APP_PUSH_TYPE_LABELS: Record<AppPushType, string> = {
  notification: '通知消息',
  marketing: '营销推送',
  alert: '告警推送',
  system: '系统消息',
};
