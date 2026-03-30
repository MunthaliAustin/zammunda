import { getAuthToken } from './auth-service';

export type PaymentMethod = 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

export interface Payment {
  id?: number;
  paymentNumber: string;
  orderNumber: string;
  userId: string;
  amount: number;
  shippingFee?: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  providerReference?: string;
  transactionReference?: string;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
}

export interface CreatePaymentRequest {
  orderNumber: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  providerReference?: string;
}

export interface CheckoutOrder {
  orderNumber: string;
  amount: number;
}

export interface CreateCheckoutSessionRequest {
  orders: CheckoutOrder[];
  totalAmount: number;
  shippingAmount?: number;
  currency: string;
  method: PaymentMethod;
  email: string;
  firstName?: string;
  lastName?: string;
  providerReference?: string;
}

export interface CheckoutSessionResponse {
  txRef: string;
  checkoutUrl: string;
  message: string;
  paymentNumbers: string[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

const normalizePayment = (payment: any): Payment => ({
  ...payment,
  amount: typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount || 0,
  shippingFee: typeof payment.shippingFee === 'string' ? parseFloat(payment.shippingFee) : payment.shippingFee || 0,
});

export const paymentService = {
  createCheckoutSession: async (payload: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/payment/checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to start PayChangu checkout: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  createPayment: async (payment: CreatePaymentRequest): Promise<Payment> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payment),
    });

    if (!response.ok) {
      throw new Error(`Failed to create payment: ${response.status} ${response.statusText}`);
    }

    return normalizePayment(await response.json());
  },

  getPaymentsByOrderNumber: async (orderNumber: string): Promise<Payment[]> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/payment/order/${orderNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch payments: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as any[];
    return Array.isArray(data) ? data.map(normalizePayment) : [];
  },
};
