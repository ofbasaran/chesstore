import axiosInstance from './axiosInstance';

export interface AddCartItemDto {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

const BASE = '/cart/api/cart';

export const cartApi = {
  getCart: async () => {
    const { data } = await axiosInstance.get(BASE);
    return data;
  },

  addItem: async (dto: AddCartItemDto) => {
    const { data } = await axiosInstance.post(`${BASE}/items`, dto);
    return data;
  },

  updateItem: async (productId: string, dto: UpdateCartItemDto) => {
    const { data } = await axiosInstance.put(`${BASE}/items/${productId}`, dto);
    return data;
  },

  removeItem: async (productId: string) => {
    const { data } = await axiosInstance.delete(`${BASE}/items/${productId}`);
    return data;
  },

  clearCart: async () => {
    const { data } = await axiosInstance.delete(BASE);
    return data;
  },
};