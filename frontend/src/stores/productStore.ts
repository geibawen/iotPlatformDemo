import { create } from 'zustand';
import { api } from '../api/client';
import type { Product } from '../types/product';

interface ProductStore {
  products: Product[];
  loading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (data: Partial<Product> & { baseProductId?: string }) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  loading: false,
  fetchProducts: async () => {
    set({ loading: true });
    try {
      const products = await api.get<Product[]>('/products');
      set({ products, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
  addProduct: async (data) => {
    const product = await api.post<Product>('/products', data);
    set({ products: [...get().products, product] });
    return product;
  },
  updateProduct: async (id, data) => {
    const updated = await api.put<Product>(`/products/${id}`, data);
    set({ products: get().products.map((p) => (p.id === id ? updated : p)) });
    return updated;
  },
  deleteProduct: async (id) => {
    await api.del(`/products/${id}`);
    set({ products: get().products.filter((p) => p.id !== id) });
  },
  getProduct: (id) => get().products.find((p) => p.id === id),
}));
