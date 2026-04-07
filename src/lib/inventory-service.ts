import { getAuthToken } from './auth-service';
import { SellingUnitType, getDefaultUnitLabel } from './units';

export interface InventoryItem {
  id?: number;
  skuCode: string;
  quantity: number;
  unitType?: SellingUnitType;
  unitLabel?: string;
  sellerId: string;
  sellerEmail?: string;
  sellerName?: string;
}

export interface InventoryUpdate {
  skuCode: string;
  quantity: number;
  unitType?: SellingUnitType;
  unitLabel?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

const normalizeInventory = (item: any): InventoryItem => ({
  ...item,
  quantity: typeof item.quantity === 'string' ? parseInt(item.quantity, 10) : item.quantity ?? 0,
  unitType: item.unitType ?? 'KG',
  unitLabel: item.unitLabel ?? getDefaultUnitLabel(item.unitType),
});

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

      return (await response.json()).map((item: any) => normalizeInventory(item));
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

    return normalizeInventory(await response.json());
  },

  getInventoryBySkuCodeAndSellerId: async (skuCode: string, sellerId: string): Promise<InventoryItem> => {
    const headers = await getOptionalAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/api/inventory/seller/${sellerId}/${skuCode}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch inventory: ${response.status} ${response.statusText}`);
    }

    return normalizeInventory(await response.json());
  },

  updateInventory: async (skuCode: string, quantity: number, unitType?: SellingUnitType, unitLabel?: string): Promise<InventoryItem> => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/inventory/seller`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        skuCode,
        quantity,
        unitType,
        unitLabel
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update inventory: ${response.status} ${response.statusText}`);
    }

    return { skuCode, quantity, unitType, unitLabel: unitLabel ?? getDefaultUnitLabel(unitType), sellerId: "" };
  },

  adjustInventory: async (skuCode: string, quantity: number, unitType?: SellingUnitType, unitLabel?: string): Promise<InventoryItem> => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/inventory/${skuCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ skuCode, quantity, unitType, unitLabel }),
    });

    if (!response.ok) {
      throw new Error(`Failed to adjust inventory: ${response.status} ${response.statusText}`);
    }

    return { skuCode, quantity, unitType, unitLabel: unitLabel ?? getDefaultUnitLabel(unitType), sellerId: "" };
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
