import { getAuthToken } from './auth-service';

export interface Order {
  id?: number;
  orderNumber: string;
  skuCode: string;
  price: number;
  quantity: number;
  unitType?: string;
  unitLabel?: string;
  userId: string;
  sellerId: string;
  buyerEmail?: string;
  buyerFirstName?: string;
  buyerLastName?: string;
  sellerEmail?: string;
  sellerName?: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  createdAt?: string;
  updatedAt?: string;
  cancellationReason?: string;
}

export interface OrderUserDetails {
  email: string;
  firstName: string;
  lastName: string;
}

export interface OrderRequest {
  id?: number;
  skuCode: string;
  price: number;
  quantity: number;
  sellerId: string;
  userId?: string;
  userDetails: OrderUserDetails;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

const convertOrderFields = (order: any): Order => {
  if (!order) return {} as Order;
  return {
    ...order,
    price: typeof order.price === 'string' ? parseFloat(order.price) : order.price || 0,
    quantity: typeof order.quantity === 'string' ? parseInt(order.quantity, 10) : order.quantity || 0,
  };
};

export const orderService = {
  getUserOrders: async (): Promise<Order[]> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/order/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user orders: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as any[];
    return Array.isArray(data) ? data.map(convertOrderFields) : [];
  },

  getSellerOrders: async (): Promise<Order[]> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/order/seller-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch seller orders: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as any[];
    return Array.isArray(data) ? data.map(convertOrderFields) : [];
  },

  getOrderById: async (id: string): Promise<Order> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/order/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.status} ${response.statusText}`);
    }

    return convertOrderFields(await response.json());
  },

  createOrder: async (order: OrderRequest): Promise<Order> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.status} ${response.statusText}`);
    }

    return convertOrderFields(await response.json());
  },

  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/order/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.status} ${response.statusText}`);
    }

    return convertOrderFields(await response.json());
  },

  confirmOrder: async (orderNumber: string): Promise<void> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/order/${orderNumber}/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to confirm order: ${response.status} ${response.statusText}`);
    }
  },

  cancelOrder: async (id: string): Promise<void> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/order/${id}/cancel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.status} ${response.statusText}`);
    }
  },
};
