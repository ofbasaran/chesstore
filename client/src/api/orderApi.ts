import axiosInstance from './axiosInstance';

export interface CheckoutRequestDto {
  shippingAddress: string;
}

export interface OrderItemDto {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponseDto {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  failureReason: string | null;
  items: OrderItemDto[];
}

const BASE = '/orders/api/orders';

export const orderApi = {
  checkout: async (dto: CheckoutRequestDto): Promise<OrderResponseDto> => {
    const { data } = await axiosInstance.post(`${BASE}/checkout`, dto);
    return data;
  },

  getById: async (id: string): Promise<OrderResponseDto> => {
    const { data } = await axiosInstance.get(`${BASE}/${id}`);
    return data;
  },

  getMyOrders: async (): Promise<OrderResponseDto[]> => {
    const { data } = await axiosInstance.get(BASE);
    return data;
  },
};