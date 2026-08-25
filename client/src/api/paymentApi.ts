import axiosInstance from './axiosInstance';

export const PaymentStatus = {
  Pending: 0,
  Succeeded: 1,
  Failed: 2,
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface PaymentTransaction {
  id: string;
  orderId: string;
  userId: string;
  amount: number;
  status: PaymentStatus;
  failureReason: string | null;
  createdAt: string;
  processedAt: string | null;
}

const BASE = '/payments/api/payments';

export const paymentApi = {
  getByOrderId: async (orderId: string): Promise<PaymentTransaction> => {
    const { data } = await axiosInstance.get(`${BASE}/order/${orderId}`);
    return data;
  },
};