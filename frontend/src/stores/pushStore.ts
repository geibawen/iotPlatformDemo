import { create } from 'zustand';
import { api } from '../api/client';
import type { PushRule, PushChannel, MessageTemplate, PushLog } from '../types/push';

interface PushStore {
  rules: PushRule[];
  channels: PushChannel[];
  templates: MessageTemplate[];
  logs: PushLog[];
  loading: boolean;
  fetchAll: () => Promise<void>;
  addRule: (data: Partial<PushRule>) => Promise<void>;
  updateRule: (id: string, data: Partial<PushRule>) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  addChannel: (data: Partial<PushChannel>) => Promise<void>;
  updateChannel: (id: string, data: Partial<PushChannel>) => Promise<void>;
  deleteChannel: (id: string) => Promise<void>;
  getChannel: (id: string) => PushChannel | undefined;
  addTemplate: (data: Partial<MessageTemplate>) => Promise<void>;
  updateTemplate: (id: string, data: Partial<MessageTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getTemplate: (id: string) => MessageTemplate | undefined;
  addLog: (data: Partial<PushLog>) => Promise<void>;
  clearLogs: () => Promise<void>;
}

export const usePushStore = create<PushStore>((set, get) => ({
  rules: [],
  channels: [],
  templates: [],
  logs: [],
  loading: false,
  fetchAll: async () => {
    set({ loading: true });
    const [rules, channels, templates, logs] = await Promise.all([
      api.get<PushRule[]>('/push/rules'),
      api.get<PushChannel[]>('/push/channels'),
      api.get<MessageTemplate[]>('/push/templates'),
      api.get<PushLog[]>('/push/logs'),
    ]);
    set({ rules, channels, templates, logs, loading: false });
  },
  addRule: async (data) => {
    const rule = await api.post<PushRule>('/push/rules', data);
    set({ rules: [...get().rules, rule] });
  },
  updateRule: async (id, data) => {
    const updated = await api.put<PushRule>(`/push/rules/${id}`, data);
    set({ rules: get().rules.map((r) => (r.id === id ? updated : r)) });
  },
  deleteRule: async (id) => {
    await api.del(`/push/rules/${id}`);
    set({ rules: get().rules.filter((r) => r.id !== id) });
  },
  addChannel: async (data) => {
    const channel = await api.post<PushChannel>('/push/channels', data);
    set({ channels: [...get().channels, channel] });
  },
  updateChannel: async (id, data) => {
    const updated = await api.put<PushChannel>(`/push/channels/${id}`, data);
    set({ channels: get().channels.map((c) => (c.id === id ? updated : c)) });
  },
  deleteChannel: async (id) => {
    await api.del(`/push/channels/${id}`);
    set({ channels: get().channels.filter((c) => c.id !== id) });
  },
  getChannel: (id) => get().channels.find((c) => c.id === id),
  addTemplate: async (data) => {
    const template = await api.post<MessageTemplate>('/push/templates', data);
    set({ templates: [...get().templates, template] });
  },
  updateTemplate: async (id, data) => {
    const updated = await api.put<MessageTemplate>(`/push/templates/${id}`, data);
    set({ templates: get().templates.map((t) => (t.id === id ? updated : t)) });
  },
  deleteTemplate: async (id) => {
    await api.del(`/push/templates/${id}`);
    set({ templates: get().templates.filter((t) => t.id !== id) });
  },
  getTemplate: (id) => get().templates.find((t) => t.id === id),
  addLog: async (data) => {
    const log = await api.post<PushLog>('/push/logs', data);
    set({ logs: [log, ...get().logs] });
  },
  clearLogs: async () => {
    await api.del('/push/logs');
    set({ logs: [] });
  },
}));
