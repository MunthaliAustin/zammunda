import { getAuthToken } from './auth-service';

export interface Product {
  id?: string;
  skuCode: string;
  name: string;
  description: string;
  price: number;
  sellerId?: string;
  sellerEmail?: string;
  sellerName?: string;
  categoryId?: string;
  imageUrl?: string;
  imageUrls?: string[]; // Multiple product images from Cloudinary
  stock?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

export const productService = {
  // Get all products
  getAllProducts: async (): Promise<Product[]> => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/product`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      // Convert price from BigDecimal string to number
      return data.map((product: any) => ({
        ...product,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      // Return empty array as fallback
      return [];
    }
  },

  // Get product by ID
  getProductById: async (id: string): Promise<Product> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/product/id/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Convert price from BigDecimal string to number
    return {
      ...data,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price
    };
  },

  // Get product by SKU code
  getProductBySkuCode: async (skuCode: string): Promise<Product> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/product/sku/${skuCode}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Convert price from BigDecimal string to number
    return {
      ...data,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price
    };
  },

  // Create a new product
  createProduct: async (product: Omit<Product, 'id'>, imageFile?: File): Promise<Product> => {
    const token = await getAuthToken();
    
    const formData = new FormData();
    formData.append('name', product.name);
    formData.append('description', product.description);
    formData.append('price', product.price.toString());
    formData.append('skuCode', product.skuCode);
    formData.append('categoryId', product.categoryId || '');
    if (product.imageUrl) {
      formData.append('imageUrl', product.imageUrl);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await fetch(`${API_BASE_URL}/api/product`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Convert price from BigDecimal string to number
    return {
      ...data,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price
    };
  },

  // Update product
  updateProduct: async (id: string, product: Product): Promise<Product> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Convert price from BigDecimal string to number
    return {
      ...data,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price
    };
  },

  // Update product images (upload to Cloudinary)
  updateProductImages: async (id: string, imageFile?: File, additionalImages?: File[]): Promise<void> => {
    const token = await getAuthToken();
    
    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    }
    if (additionalImages && additionalImages.length > 0) {
      additionalImages.forEach(img => {
        formData.append('images', img);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/api/product/${id}/images`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to update product images: ${response.status} ${response.statusText}`);
    }
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/product/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.status} ${response.statusText}`);
    }
  }
};