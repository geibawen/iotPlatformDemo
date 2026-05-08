import { create } from 'zustand';
import { api } from '../api/client';
import type { ProductCategoryItem } from '../types/product';

interface ProductCategoryStore {
  categories: ProductCategoryItem[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (data: Pick<ProductCategoryItem, 'key' | 'name'>) => Promise<ProductCategoryItem>;
  updateCategory: (id: string, data: Partial<Pick<ProductCategoryItem, 'key' | 'name'>>) => Promise<ProductCategoryItem>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useProductCategoryStore = create<ProductCategoryStore>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    try {
      const categories = await api.get<ProductCategoryItem[]>('/product-categories');
      set({ categories, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  addCategory: async (data) => {
    const created = await api.post<ProductCategoryItem>('/product-categories', data);
    set({ categories: [...get().categories, created] });
    return created;
  },

  updateCategory: async (id, data) => {
    const updated = await api.put<ProductCategoryItem>(`/product-categories/${id}`, data);
    set({ categories: get().categories.map((c) => (c.id === id ? updated : c)) });
    return updated;
  },

  deleteCategory: async (id) => {
    await api.del(`/product-categories/${id}`);
    set({ categories: get().categories.filter((c) => c.id !== id) });
  },
}));
