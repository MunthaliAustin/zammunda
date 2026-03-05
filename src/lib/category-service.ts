import { getAuthToken } from './auth-service';

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

export const categoryService = {
  // Get all categories
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const token = await getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/category`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return empty array as fallback
      return [];
    }
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<Category> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/category/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  // Get category by name
  getCategoryByName: async (name: string): Promise<Category> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/category/name/${name}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  // Create a new category
  createCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/category`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      throw new Error(`Failed to create category: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  // Update category
  updateCategory: async (id: string, category: Category): Promise<Category> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/category/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(category),
    });

    if (!response.ok) {
      throw new Error(`Failed to update category: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/api/category/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete category: ${response.status} ${response.statusText}`);
    }
  }
};