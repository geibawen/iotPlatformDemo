import { create } from 'zustand';
import { api } from '../api/client';
import type { Firmware, OtaTask } from '@iot-platform/shared';

interface FirmwareStore {
  firmwares: Firmware[];
  otaTasks: OtaTask[];
  loading: boolean;
  fetchFirmwares: () => Promise<void>;
  fetchOtaTasks: () => Promise<void>;
  addFirmware: (data: FormData) => Promise<Firmware>;
  updateFirmware: (id: string, data: Partial<Firmware>) => Promise<void>;
  deleteFirmware: (id: string) => Promise<void>;
  addOtaTask: (data: Partial<OtaTask>) => Promise<OtaTask>;
  updateOtaTask: (id: string, data: Partial<OtaTask>) => Promise<void>;
  startOtaTask: (id: string) => Promise<void>;
  pauseOtaTask: (id: string) => Promise<void>;
  deleteOtaTask: (id: string) => Promise<void>;
}

export const useFirmwareStore = create<FirmwareStore>((set, get) => ({
  firmwares: [],
  otaTasks: [],
  loading: false,

  fetchFirmwares: async () => {
    set({ loading: true });
    try {
      const firmwares = await api.get<Firmware[]>('/firmwares');
      set({ firmwares, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchOtaTasks: async () => {
    const otaTasks = await api.get<OtaTask[]>('/firmwares/ota-tasks/list');
    set({ otaTasks });
  },

  addFirmware: async (data) => {
    const fw = await api.upload<Firmware>('/firmwares', data);
    set({ firmwares: [...get().firmwares, fw] });
    return fw;
  },

  updateFirmware: async (id, data) => {
    const updated = await api.put<Firmware>(`/firmwares/${id}`, data);
    set({ firmwares: get().firmwares.map((f) => (f.id === id ? updated : f)) });
  },

  deleteFirmware: async (id) => {
    await api.del(`/firmwares/${id}`);
    set({ firmwares: get().firmwares.filter((f) => f.id !== id) });
  },

  addOtaTask: async (data) => {
    const task = await api.post<OtaTask>('/firmwares/ota-tasks', data);
    set({ otaTasks: [...get().otaTasks, task] });
    return task;
  },

  updateOtaTask: async (id, data) => {
    const updated = await api.put<OtaTask>(`/firmwares/ota-tasks/${id}`, data);
    set({ otaTasks: get().otaTasks.map((t) => (t.id === id ? updated : t)) });
  },

  startOtaTask: async (id) => {
    const updated = await api.post<OtaTask>(`/firmwares/ota-tasks/${id}/start`);
    set({ otaTasks: get().otaTasks.map((t) => (t.id === id ? updated : t)) });
  },

  pauseOtaTask: async (id) => {
    const updated = await api.post<OtaTask>(`/firmwares/ota-tasks/${id}/pause`);
    set({ otaTasks: get().otaTasks.map((t) => (t.id === id ? updated : t)) });
  },

  deleteOtaTask: async (id) => {
    await api.del(`/firmwares/ota-tasks/${id}`);
    set({ otaTasks: get().otaTasks.filter((t) => t.id !== id) });
  },
}));
