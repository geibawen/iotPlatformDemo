import { create } from 'zustand';
import { api } from '../api/client';
import type { Device } from '@iot-platform/shared';

interface DeviceStore {
  devices: Device[];
  loading: boolean;
  fetchDevices: () => Promise<void>;
  addDevice: (data: Partial<Device>) => Promise<Device>;
  updateDevice: (id: string, data: Partial<Device>) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: [],
  loading: false,

  fetchDevices: async () => {
    set({ loading: true });
    try {
      const devices = await api.get<Device[]>('/devices');
      set({ devices, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addDevice: async (data) => {
    const device = await api.post<Device>('/devices', data);
    set({ devices: [...get().devices, device] });
    return device;
  },

  updateDevice: async (id, data) => {
    const updated = await api.put<Device>(`/devices/${id}`, data);
    set({ devices: get().devices.map((d) => (d.id === id ? updated : d)) });
  },

  deleteDevice: async (id) => {
    await api.del(`/devices/${id}`);
    set({ devices: get().devices.filter((d) => d.id !== id) });
  },
}));
