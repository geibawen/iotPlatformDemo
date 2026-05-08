export type PluginPlatform = 'iOS' | 'Android' | 'both';
export type PluginStatus = 'active' | 'inactive';
export type VersionStatus = 'draft' | 'waiting_test' | 'testing' | 'approved' | 'rejected' | 'online' | 'offline';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  platform: PluginPlatform;
  productIds: string[];
  status: PluginStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PluginVersion {
  id: string;
  pluginId: string;
  version: string;
  releaseNotes: string;
  fileName: string;
  fileSize: number; // bytes
  status: VersionStatus;
  createdAt: string;
}

export const PLUGIN_PLATFORM_LABELS: Record<PluginPlatform, string> = {
  iOS: 'iOS',
  Android: 'Android',
  both: 'iOS & Android',
};

export const VERSION_STATUS_LABELS: Record<VersionStatus, string> = {
  draft: '草稿',
  waiting_test: '待测试',
  testing: '测试中',
  approved: '测试通过',
  rejected: '测试不通过',
  online: '已上线',
  offline: '已下线',
};
