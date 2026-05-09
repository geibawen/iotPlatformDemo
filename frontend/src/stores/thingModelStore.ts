import { create } from 'zustand';
import { api } from '../api/client';
import type { ThingModelProperty, ThingModelAction, ThingModelService } from '../types/thingModel';

interface ThingModelStore {
  properties: ThingModelProperty[];
  actions: ThingModelAction[];
  services: ThingModelService[];
  loading: boolean;
  loadByProduct: (productId: string) => Promise<void>;
  addProperty: (productId: string, data: Partial<ThingModelProperty> & { serviceId: string }) => Promise<void>;
  updateProperty: (id: string, data: Partial<ThingModelProperty>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  addAction: (productId: string, data: Partial<ThingModelAction> & { serviceId: string }) => Promise<void>;
  updateAction: (id: string, data: Partial<ThingModelAction>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  addService: (productId: string, data: Partial<ThingModelService>) => Promise<void>;
  updateService: (id: string, data: Partial<ThingModelService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  deleteByProduct: (productId: string) => Promise<void>;
}

export const useThingModelStore = create<ThingModelStore>((set, get) => ({
  properties: [],
  actions: [],
  services: [],
  loading: false,
  loadByProduct: async (productId) => {
    set({ loading: true });
    const [properties, actions, services] = await Promise.all([
      api.get<ThingModelProperty[]>(`/products/${productId}/properties`),
      api.get<ThingModelAction[]>(`/products/${productId}/actions`),
      api.get<ThingModelService[]>(`/products/${productId}/services`),
    ]);
    set({ properties, actions, services, loading: false });
  },
  addProperty: async (productId, data) => {
    const created = await api.post<ThingModelProperty>(`/products/${productId}/properties`, data);
    set({ properties: [...get().properties, created] });
    await get().loadByProduct(productId);
  },
  updateProperty: async (id, data) => {
    const updated = await api.put<ThingModelProperty>(`/properties/${id}`, data);
    set({ properties: get().properties.map((p) => (p.id === id ? updated : p)) });
  },
  deleteProperty: async (id) => {
    await api.del(`/properties/${id}`);
    set({ properties: get().properties.filter((p) => p.id !== id) });
  },
  addAction: async (productId, data) => {
    const created = await api.post<ThingModelAction>(`/products/${productId}/actions`, data);
    set({ actions: [...get().actions, created] });
    await get().loadByProduct(productId);
  },
  updateAction: async (id, data) => {
    const updated = await api.put<ThingModelAction>(`/actions/${id}`, data);
    set({ actions: get().actions.map((a) => (a.id === id ? updated : a)) });
  },
  deleteAction: async (id) => {
    await api.del(`/actions/${id}`);
    set({ actions: get().actions.filter((a) => a.id !== id) });
  },
  addService: async (productId, data) => {
    const created = await api.post<ThingModelService>(`/products/${productId}/services`, data);
    set({ services: [...get().services, created] });
  },
  updateService: async (id, data) => {
    const updated = await api.put<ThingModelService>(`/services/${id}`, data);
    set({ services: get().services.map((s) => (s.id === id ? updated : s)) });
  },
  deleteService: async (id) => {
    await api.del(`/services/${id}`);
    set({ services: get().services.filter((s) => s.id !== id) });
  },
  deleteByProduct: async (productId) => {
    await api.del(`/products/${productId}/thingmodel`);
    set({
      properties: get().properties.filter((p) => p.productId !== productId),
      actions: get().actions.filter((a) => a.productId !== productId),
      services: get().services.filter((s) => s.productId !== productId),
    });
  },
}));
