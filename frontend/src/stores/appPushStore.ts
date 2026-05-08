import { create } from 'zustand';
import { api } from '../api/client';
import type { AppPushMessage } from '@iot-platform/shared';

interface AppPushStore {
  messages: AppPushMessage[];
  loading: boolean;
  fetchMessages: () => Promise<void>;
  addMessage: (data: Partial<AppPushMessage>) => Promise<AppPushMessage>;
  updateMessage: (id: string, data: Partial<AppPushMessage>) => Promise<void>;
  sendMessage: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
}

export const useAppPushStore = create<AppPushStore>((set, get) => ({
  messages: [],
  loading: false,

  fetchMessages: async () => {
    set({ loading: true });
    try {
      const messages = await api.get<AppPushMessage[]>('/app-push/messages');
      set({ messages, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addMessage: async (data) => {
    const msg = await api.post<AppPushMessage>('/app-push/messages', data);
    set({ messages: [...get().messages, msg] });
    return msg;
  },

  updateMessage: async (id, data) => {
    const updated = await api.put<AppPushMessage>(`/app-push/messages/${id}`, data);
    set({ messages: get().messages.map((m) => (m.id === id ? updated : m)) });
  },

  sendMessage: async (id) => {
    const updated = await api.post<AppPushMessage>(`/app-push/messages/${id}/send`);
    set({ messages: get().messages.map((m) => (m.id === id ? updated : m)) });
  },

  deleteMessage: async (id) => {
    await api.del(`/app-push/messages/${id}`);
    set({ messages: get().messages.filter((m) => m.id !== id) });
  },
}));
