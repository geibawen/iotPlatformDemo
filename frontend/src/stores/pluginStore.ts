import { create } from 'zustand';
import { api } from '../api/client';
import type { Plugin, PluginVersion } from '../types/plugin';

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
      const plugins = await api.get<Plugin[]>('/plugins');
      set({ plugins, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
  addPlugin: async (data) => {
    const plugin = await api.post<Plugin>('/plugins', data);
    set({ plugins: [...get().plugins, plugin] });
    return plugin;
  },
  updatePlugin: async (id, data) => {
    const updated = await api.put<Plugin>(`/plugins/${id}`, data);
    set({ plugins: get().plugins.map((p) => (p.id === id ? updated : p)) });
    return updated;
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
    const newVersions = await api.get<PluginVersion[]>(`/plugins/${pluginId}/versions`);
    const existing = get().versions.filter((v) => v.pluginId !== pluginId);
    set({ versions: [...existing, ...newVersions] });
  },
  addVersion: async (pluginId, formData) => {
    const version = await api.upload<PluginVersion>(`/plugins/${pluginId}/versions`, formData);
    set({ versions: [...get().versions, version] });
    return version;
  },
  updateVersion: async (id, data) => {
    const updated = await api.put<PluginVersion>(`/plugins/versions/${id}`, data);
    set({ versions: get().versions.map((v) => (v.id === id ? updated : v)) });
    return updated;
  },
  deleteVersion: async (id) => {
    await api.del(`/plugins/versions/${id}`);
    set({ versions: get().versions.filter((v) => v.id !== id) });
  },
}));
