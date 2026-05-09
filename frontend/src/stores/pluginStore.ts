import { create } from 'zustand';
import { api } from '../api/client';
import type { Plugin, PluginVersion, Platform } from '../types/plugin';

function normalizePlatforms(input: Partial<Plugin> & { platform?: string }): Plugin['platforms'] {
  if (Array.isArray(input.platforms) && input.platforms.length > 0) {
    return input.platforms;
  }

  // Backward compatibility for legacy backend payloads using "platform"
  switch (input.platform) {
    case 'iOS':
      return ['iOS', 'Android'];
    case 'Android':
      return ['iOS', 'Android'];
    case 'both':
      return ['iOS', 'Android'];
    default:
      return ['iOS', 'Android'];
  }
}

function normalizePlugin(input: Partial<Plugin> & { platform?: string }): Plugin {
  return {
    id: input.id || '',
    name: input.name || '',
    description: input.description || '',
    type: input.type || 'device',
    platforms: normalizePlatforms(input),
    productIds: Array.isArray(input.productIds) ? input.productIds : [],
    status: input.status || 'inactive',
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: input.updatedAt || new Date().toISOString(),
  };
}

function normalizeVersion(input: Partial<PluginVersion> & {
  fileName?: string;
  fileSize?: number;
}): PluginVersion {
  const fallbackPlatforms: Platform[] = ['iOS', 'Android'];
  const files = Array.isArray(input.files)
    ? input.files
    : (input.fileName
      ? fallbackPlatforms.map((platform) => ({
          platform,
          fileName: input.fileName as string,
          fileSize: Number(input.fileSize) || 0,
          filePath: '',
        }))
      : []);

  return {
    id: input.id || '',
    pluginId: input.pluginId || '',
    version: input.version || '',
    releaseNotes: input.releaseNotes || '',
    files,
    status: input.status || 'draft',
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

interface PluginStore {
  plugins: Plugin[];
  versions: PluginVersion[];
  loading: boolean;
  fetchPlugins: () => Promise<void>;
  addPlugin: (data: Partial<Plugin>) => Promise<Plugin>;
  updatePlugin: (id: string, data: Partial<Plugin>) => Promise<Plugin>;
  deletePlugin: (id: string) => Promise<void>;
  getPlugin: (id: string) => Plugin | undefined;
  getPluginsByProduct: (productId: string) => Plugin[];
  loadVersions: (pluginId: string) => Promise<void>;
  addVersion: (pluginId: string, formData: FormData) => Promise<PluginVersion>;
  updateVersion: (id: string, data: Partial<PluginVersion>) => Promise<PluginVersion>;
  deleteVersion: (id: string) => Promise<void>;
}

export const usePluginStore = create<PluginStore>((set, get) => ({
  plugins: [],
  versions: [],
  loading: false,
  fetchPlugins: async () => {
    set({ loading: true });
    try {
      const plugins = await api.get<Array<Plugin & { platform?: string }>>('/plugins');
      set({ plugins: plugins.map(normalizePlugin), loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
  addPlugin: async (data) => {
    const plugin = await api.post<Plugin & { platform?: string }>('/plugins', data);
    const normalized = normalizePlugin(plugin);
    set({ plugins: [...get().plugins, normalized] });
    return normalized;
  },
  updatePlugin: async (id, data) => {
    const updated = await api.put<Plugin & { platform?: string }>(`/plugins/${id}`, data);
    const normalized = normalizePlugin(updated);
    set({ plugins: get().plugins.map((p) => (p.id === id ? normalized : p)) });
    return normalized;
  },
  deletePlugin: async (id) => {
    await api.del(`/plugins/${id}`);
    set({
      plugins: get().plugins.filter((p) => p.id !== id),
      versions: get().versions.filter((v) => v.pluginId !== id),
    });
  },
  getPlugin: (id) => get().plugins.find((p) => p.id === id),
  getPluginsByProduct: (productId) =>
    get().plugins.filter((p) => p.productIds.includes(productId)),
  loadVersions: async (pluginId) => {
    const versions = await api.get<Array<PluginVersion & { fileName?: string; fileSize?: number }>>(`/plugins/${pluginId}/versions`);
    set({ versions: versions.map(normalizeVersion) });
  },
  addVersion: async (pluginId, formData) => {
    const version = await api.upload<PluginVersion & { fileName?: string; fileSize?: number }>(`/plugins/${pluginId}/versions`, formData);
    const normalized = normalizeVersion(version);
    set({ versions: [...get().versions, normalized] });
    return normalized;
  },
  updateVersion: async (id, data) => {
    const updated = await api.put<PluginVersion & { fileName?: string; fileSize?: number }>(`/plugins/versions/${id}`, data);
    const normalized = normalizeVersion(updated);
    set({ versions: get().versions.map((v) => (v.id === id ? normalized : v)) });
    return normalized;
  },
  deleteVersion: async (id) => {
    await api.del(`/plugins/versions/${id}`);
    set({ versions: get().versions.filter((v) => v.id !== id) });
  },
}));
