export type PluginType = 'functional' | 'device';
export type Platform = 'iOS' | 'Android' | 'HarmonyOS';
export type PluginStatus = 'active' | 'inactive';
export type VersionStatus = 'draft' | 'waiting_test' | 'testing' | 'approved' | 'rejected' | 'online' | 'offline';

export interface PluginVersionFile {
  platform: Platform;
  fileName: string;
  fileSize: number;
  filePath: string;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  type: PluginType;
  platforms: Platform[];
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
  files: PluginVersionFile[];
  status: VersionStatus;
  createdAt: string;
}

export const PLUGIN_TYPE_LABELS: Record<PluginType, string> = {
  functional: '功能插件',
  device: '设备插件',
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  iOS: 'iOS',
  Android: '安卓',
  HarmonyOS: '鸿蒙',
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
