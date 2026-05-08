export type FirmwareStatus = 'draft' | 'testing' | 'released' | 'disabled';
export type OtaStrategy = 'force' | 'silent' | 'prompt';
export type OtaTaskStatus = 'pending' | 'running' | 'paused' | 'completed';

export interface Firmware {
  id: string;
  productId: string;
  version: string;
  fileName: string;
  fileSize: number;
  releaseNotes: string;
  status: FirmwareStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OtaTask {
  id: string;
  firmwareId: string;
  productId: string;
  name: string;
  strategy: OtaStrategy;
  targetScope: 'all' | 'specified';
  targetVersions: string[];
  status: OtaTaskStatus;
  totalDevices: number;
  upgradedDevices: number;
  failedDevices: number;
  createdAt: string;
  updatedAt: string;
}

export const FIRMWARE_STATUS_LABELS: Record<FirmwareStatus, string> = {
  draft: '草稿',
  testing: '测试中',
  released: '已发布',
  disabled: '已停用',
};

export const OTA_STRATEGY_LABELS: Record<OtaStrategy, string> = {
  force: '强制升级',
  silent: '静默升级',
  prompt: '提示升级',
};

export const OTA_TASK_STATUS_LABELS: Record<OtaTaskStatus, string> = {
  pending: '待执行',
  running: '执行中',
  paused: '已暂停',
  completed: '已完成',
};
