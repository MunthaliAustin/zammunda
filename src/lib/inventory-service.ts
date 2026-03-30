import { getAuthToken } from './auth-service';

export interface InventoryItem {
  id?: number;
  skuCode: string;
  quantity: number;
  sellerId: string;
  sellerEmail?: string;
  sellerName?: string;
}

export interface InventoryUpdate {
  skuCode: string;
  quantity: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

const getOptionalAuthHeaders = async (): Promise<HeadersInit> => {
  try {
    const token = await getAuthToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  } catch {
    return {};
  }
};

export const inventoryService = {
  getMyInventory: async (): Promise<InventoryItem[]> => {
    try {
      const token = await getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/inventory/my`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch inventory: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return [];
    }
  },

  getInventoryBySkuCode: async (skuCode: string): Promise<InventoryItem> => {
    const headers = await getOptionalAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/inventory/${skuCode}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  getInventoryBySkuCodeAndSellerId: async (skuCode: string, sellerId: string): Promise<InventoryItem> => {
    const headers = await getOptionalAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/inventory/seller/${sellerId}/${skuCode}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  updateInventory: async (skuCode: string, quantity: number): Promise<InventoryItem> => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/inventory/seller`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        skuCode,
        quantity
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update inventory: ${response.status} ${response.statusText}`);
    }

    return { skuCode, quantity, sellerId: "" };
  },

  adjustInventory: async (skuCode: string, quantity: number): Promise<InventoryItem> => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/inventory/${skuCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error(`Failed to adjust inventory: ${response.status} ${response.statusText}`);
    }

    return { skuCode, quantity, sellerId: "" };
  },

  removeInventory: async (skuCode: string): Promise<void> => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/inventory/${skuCode}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to remove inventory: ${response.status} ${response.statusText}`);
    }
  }
};
