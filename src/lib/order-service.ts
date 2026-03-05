import { getAuthToken } from './auth-service';

export interface Order {
  id?: number;
  orderNumber: string;
  skuCode: string;
  price: number;
  quantity: number;
  userId: string;
  sellerId: string;
  buyerEmail?: string;
  buyerFirstName?: string;
  buyerLastName?: string;
  sellerEmail?: string;
  sellerName?: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  createdAt?: Date;
  updatedAt?: Date;
  cancellationReason?: string;
}

export interface OrderRequest {
  productId: string;
  quantity: number;
  userId: string;
  skuCode: string;
  price: number;
  sellerId: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

export const orderService = {
  // Get all orders for a user (buyer)
  getUserOrders: async (): Promise<Order[]> => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/order/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user orders: ${response.status} ${response.statusText}`);
      }

      try {
        const data: any[] = (await response.json()) as any[];
        return Array.isArray(data) ? data.map(this.convertOrderFields) : [];
      } catch (error) {
        console.error('Error parsing user orders response:', error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  // Helper function to convert BigDecimal strings to numbers
  convertOrderFields: (order: any): Order => {
    if (!order) return {} as Order;
    return {
      ...order,
      price: typeof order.price === 'string' ? parseFloat(order.price) : order.price || 0,
      quantity: typeof order.quantity === 'string' ? parseInt(order.quantity) : order.quantity || 0,
    };
  },

  // Get all orders for a seller
  getSellerOrders: async (): Promise<Order[]> => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/order`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch seller orders: ${response.status} ${response.statusText}`);
      }

      try {
        const data: any[] = (await response.json()) as any[];
        return Array.isArray(data) ? data.map(this.convertOrderFields) : [];
      } catch (error) {
        console.error('Error parsing seller orders response:', error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      return [];
    }
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<Order> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/order/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.status} ${response.statusText}`);
    }

    try {
      const data: any = (await response.json()) as any;
      return this.convertOrderFields(data);
    } catch (error) {
      console.error('Error parsing order response:', error);
      throw error;
    }
  },

  // Create a new order
  createOrder: async (order: OrderRequest): Promise<Order> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.status} ${response.statusText}`);
    }

    try {
      const data: any = (await response.json()) as any;
      return this.convertOrderFields(data);
    } catch (error) {
      console.error('Error parsing create order response:', error);
      throw error;
    }
  },

  // Update order status (for seller)
  updateOrderStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/order/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.status} ${response.statusText}`);
    }

    try {
      const data: any = (await response.json()) as any;
      return this.convertOrderFields(data);
    } catch (error) {
      console.error('Error parsing update order status response:', error);
      throw error;
    }
  },

  // Cancel order (for buyer)
  cancelOrder: async (id: string): Promise<void> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/order/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to cancel order: ${response.status} ${response.statusText}`);
    }
  }
};