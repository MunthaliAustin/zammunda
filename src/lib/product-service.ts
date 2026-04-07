import { getAuthToken } from './auth-service';
import { SellingUnitType, getDefaultUnitLabel } from './units';

export interface Product {
  id?: string;
  skuCode: string;
  name: string;
  description: string;
  price: number;
  discountPercentage?: number;
  discountedPrice?: number;
  active?: boolean;
  sellerId?: string;
  sellerEmail?: string;
  sellerName?: string;
  categoryId?: string;
  city?: 'Lilongwe' | 'Blantyre' | 'Mzuzu';
  unitType?: SellingUnitType;
  unitLabel?: string;
  imageUrl?: string;
  imageUrls?: string[];
  stock?: number;
  averageRating?: number;
  reviewCount?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

const normalizeProduct = (product: any): Product => ({
  ...product,
  price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
  discountPercentage: typeof product.discountPercentage === 'string'
    ? parseFloat(product.discountPercentage)
    : product.discountPercentage ?? 0,
  discountedPrice: typeof product.discountedPrice === 'string'
    ? parseFloat(product.discountedPrice)
    : product.discountedPrice ?? product.price,
  averageRating: typeof product.averageRating === 'string'
    ? parseFloat(product.averageRating)
    : product.averageRating ?? 0,
  reviewCount: typeof product.reviewCount === 'string'
    ? parseInt(product.reviewCount, 10)
    : product.reviewCount ?? 0,
  active: product.active ?? true,
  unitType: product.unitType ?? 'KG',
  unitLabel: product.unitLabel ?? getDefaultUnitLabel(product.unitType),
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

export const productService = {
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const headers = await getOptionalAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/product`, { headers });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.map((product: any) => normalizeProduct(product));
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  getProductById: async (id: string): Promise<Product> => {
    const headers = await getOptionalAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/product/id/${id}`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }

    return normalizeProduct(await response.json());
  },

  getProductBySkuCode: async (skuCode: string): Promise<Product> => {
    const headers = await getOptionalAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/api/product/sku/${skuCode}`, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }

    return normalizeProduct(await response.json());
  },

  createProduct: async (product: Omit<Product, 'id'>, imageFile?: File): Promise<Product> => {
    const token = await getAuthToken();

    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price.toString());
    formData.append('skuCode', product.skuCode);
    formData.append('categoryId', product.categoryId || '');
    formData.append('city', product.city || '');
    formData.append('unitType', product.unitType || 'KG');
    formData.append('unitLabel', product.unitLabel || getDefaultUnitLabel(product.unitType));
    if (product.imageUrl) {
      formData.append('imageUrl', product.imageUrl);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/api/product`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.status} ${response.statusText}`);
    }

    return normalizeProduct(await response.json());
  },

  updateProduct: async (id: string, product: Product): Promise<void> => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.status} ${response.statusText}`);
    }
  },

  updateProductImages: async (id: string, imageFile?: File, additionalImages?: File[]): Promise<void> => {
    const token = await getAuthToken();

    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (additionalImages && additionalImages.length > 0) {
      additionalImages.forEach((img) => {
        formData.append('images', img);
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/product/${id}/images`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to update product images: ${response.status} ${response.statusText}`);
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`);
    }
  }
};
