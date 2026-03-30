import { getAuthToken } from './auth-service';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000';

const normalizeReview = (review: any): Review => ({
  ...review,
  rating: typeof review.rating === 'string' ? parseInt(review.rating, 10) : review.rating,
});

export const reviewService = {
  getProductReviews: async (productId: string): Promise<Review[]> => {
    const response = await fetch(`${API_BASE_URL}/api/product/${productId}/reviews`);
    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data.map((review: any) => normalizeReview(review));
  },

  createOrUpdateReview: async (productId: string, payload: { rating: number; comment: string }): Promise<Review> => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/product/${productId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Failed to save review: ${response.status} ${response.statusText}`);
    }

    return normalizeReview(await response.json());
  },
};
