import { getAuthToken } from './auth-service';
import { Category } from './category-service';
import { Product } from './product-service';

export interface AdminUser {
  id: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  createdTimestamp?: number;
  roles?: string[];
}

export type SellerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface SellerApplication {
  id: string;
  userId: string;
  email?: string;
  fullName: string;
  phoneNumber: string;
  nationalIdNumber: string;
  nationalIdImageUrl: string;
  status: SellerApplicationStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewedByEmail?: string;
  rejectionReason?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

const authHeaders = async (json = false): Promise<HeadersInit> => {
  const token = await getAuthToken();
  return json
    ? {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : {
        Authorization: `Bearer ${token}`,
      };
};

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
});

export const adminService = {
  async getUsers(search?: string): Promise<AdminUser[]> {
    const token = await getAuthToken();
    const params = new URLSearchParams();
    if (search?.trim()) {
      params.set('search', search.trim());
    }

    const response = await fetch(`${API_BASE_URL}/api/users/admin${params.toString() ? `?${params.toString()}` : ''}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  async updateUser(userId: string, updates: Partial<AdminUser>): Promise<void> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/users/admin/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to update user: ${response.status} ${response.statusText}`);
    }
  },

  async uploadSellerDocument(file: File): Promise<string> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/users/seller-applications/upload-id`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to upload document: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.imageUrl;
  },

  async getMySellerApplication(): Promise<SellerApplication | null> {
    const response = await fetch(`${API_BASE_URL}/api/users/seller-applications/me`, {
      headers: await authHeaders(false),
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to fetch seller application: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },

  async submitSellerApplication(payload: {
    fullName: string;
    phoneNumber: string;
    nationalIdNumber: string;
    nationalIdImageUrl: string;
  }): Promise<SellerApplication> {
    const response = await fetch(`${API_BASE_URL}/api/users/seller-applications`, {
      method: 'POST',
      headers: await authHeaders(true),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to submit seller application: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  async getSellerApplications(status?: SellerApplicationStatus | 'ALL'): Promise<SellerApplication[]> {
    const params = new URLSearchParams();
    if (status) {
      params.set('status', status);
    }

    const response = await fetch(`${API_BASE_URL}/api/users/admin/seller-applications${params.toString() ? `?${params.toString()}` : ''}`, {
      headers: await authHeaders(false),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to fetch seller applications: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  async reviewSellerApplication(applicationId: string, decision: 'APPROVE' | 'REJECT', rejectionReason?: string): Promise<SellerApplication> {
    const response = await fetch(`${API_BASE_URL}/api/users/admin/seller-applications/${applicationId}`, {
      method: 'PUT',
      headers: await authHeaders(true),
      body: JSON.stringify({ decision, rejectionReason }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to review seller application: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  async getProducts(): Promise<Product[]> {
    const adminResponse = await fetch(`${API_BASE_URL}/api/product/admin`, {
      headers: await authHeaders(false),
    });

    if (adminResponse.ok) {
      const data = await adminResponse.json();
      return data.map((product: any) => normalizeProduct(product));
    }

    const fallbackResponse = await fetch(`${API_BASE_URL}/api/product`);
    if (!fallbackResponse.ok) {
      throw new Error(`Failed to fetch products: ${adminResponse.status} ${adminResponse.statusText}`);
    }

    const fallbackData = await fallbackResponse.json();
    return fallbackData.map((product: any) => normalizeProduct(product));
  },

  async updateProduct(product: Product): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/product/admin/${product.id}`, {
      method: 'PUT',
      headers: await authHeaders(true),
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.status} ${response.statusText}`);
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/product/admin/${productId}`, {
      method: 'DELETE',
      headers: await authHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`);
    }
  },

  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/api/category`);
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  },

  async createCategory(category: Omit<Category, 'id'>): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/category`, {
      method: 'POST',
      headers: await authHeaders(true),
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.status} ${response.statusText}`);
    }
  },

  async updateCategory(category: Category): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/category/${category.id}`, {
      method: 'PUT',
      headers: await authHeaders(true),
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.status} ${response.statusText}`);
    }
  },

  async deleteCategory(categoryId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/category/${categoryId}`, {
      method: 'DELETE',
      headers: await authHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete category: ${response.status} ${response.statusText}`);
    }
  },
};
