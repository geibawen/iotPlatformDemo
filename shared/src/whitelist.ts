export type WhitelistType = 'user' | 'device';

export interface WhitelistEntry {
  id: string;
  pluginId: string;
  type: WhitelistType;
  identifier: string;
  name: string;
  createdAt: string;
}

export const WHITELIST_TYPE_LABELS: Record<WhitelistType, string> = {
  user: '用户',
  device: '设备',
};
