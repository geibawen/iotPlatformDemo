export type DeviceStatus = 'online' | 'offline';

export interface Device {
  id: string;
  name: string;
  productId: string;
  sn: string;
  mac: string;
  firmwareVersion: string;
  status: DeviceStatus;
  lastOnlineAt: string;
  createdAt: string;
}

export const DEVICE_STATUS_LABELS: Record<DeviceStatus, string> = {
  online: '在线',
  offline: '离线',
};
