'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth, useCart } from '@/app/providers';
import { productService, Product } from '@/lib/product-service';
import { reviewService, Review } from '@/lib/review-service';
import { inventoryService, InventoryItem } from '@/lib/inventory-service';
import {
  ShoppingCart,
  Minus,
  Plus,
  CheckCircle,
  AlertCircle,
  Star,
  Truck,
  Shield,
  ArrowLeft,
  Heart,
  Share2,
  Info,
  Package,
  Award,
  MapPin
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

interface ProductWithInventory extends Product {
  inventory?: InventoryItem;
}

export default function ProductPage() {
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const productId = Array.isArray(routeParams?.id) ? routeParams.id[0] : routeParams?.id;
  const { user, isLoading } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ProductWithInventory | null>(null);
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const effectivePrice = product?.discountedPrice ?? product?.price ?? 0;
  const hasDiscount = (product?.discountPercentage ?? 0) > 0;
  const averageRating = product?.averageRating ?? 0;
  const reviewCount = product?.reviewCount ?? 0;

  useEffect(() => {
    if (productId) {
      void fetchProduct(productId);
      void fetchReviews(productId);
    }
  }, [productId]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?.id]);

  const galleryImages = useMemo(() => {
    if (!product) {
      return [] as string[];
    }

    const images = [product.imageUrl, ...(product.imageUrls ?? [])]
      .filter((imageUrl): imageUrl is string => !!imageUrl && imageUrl.startsWith('http'));

    return Array.from(new Set(images));
  }, [product]);

  const selectedImage = galleryImages[selectedImageIndex]
    || product?.imageUrl
    || `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(product?.name || 'Product')}`;

  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const productData = await productService.getProductById(id);

      try {
        const inventoryData = productData.sellerId
          ? await inventoryService.getInventoryBySkuCodeAndSellerId(productData.skuCode, productData.sellerId)
          : await inventoryService.getInventoryBySkuCode(productData.skuCode);
        setInventory(inventoryData);
        setProduct({
          ...productData,
          inventory: inventoryData
        });
      } catch {
        setInventory(null);
        setProduct(productData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (id: string) => {
    try {
      setReviewLoading(true);
      const data = await reviewService.getProductReviews(id);
      setReviews(data);
      const existing = user ? data.find((review) => review.userId === user.user_id) : undefined;
      if (existing) {
        setReviewForm({ rating: existing.rating, comment: existing.comment });
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!productId) {
      setError('Product not found');
      return;
    }

    if (!user) {
      router.push(`/signin?redirect=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }

    if (!product) {
      setError('Product not found');
      return;
    }

    if (product.active === false) {
      setError('This product is currently unavailable');
      return;
    }

    if (!inventory || inventory.quantity < quantity) {
      setError('Insufficient inventory available');
      return;
    }

    try {
      await addToCart(String(product.id), Number(quantity));
      setSuccess('Product added to cart successfully!');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add product to cart');
      setSuccess(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!productId || !user) {
      router.push(`/signin?redirect=${encodeURIComponent(`/products/${productId}`)}`);
      return;
    }

    if (user.role !== 'BUYER') {
      setError('Only buyers can leave reviews.');
      return;
    }

    if (!reviewForm.comment.trim()) {
      setError('Please write a short review comment.');
      return;
    }

    try {
      setSubmittingReview(true);
      await reviewService.createOrUpdateReview(productId, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      await Promise.all([fetchProduct(productId), fetchReviews(productId)]);
      setSuccess('Your review has been saved.');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (value: number, size = 'w-5 h-5') => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${value >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  if (isLoading && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 py-3">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-2.5 rounded-lg transition-all duration-300 ${isWishlisted ? 'bg-red-50 text-red-600' : 'bg-white text-gray-600 hover:bg-gray-50'} border border-gray-200 hover:shadow-md`}
              title="Add to wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>
            <button className="p-2.5 rounded-lg bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow-md transition-all duration-300" title="Share product">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600 absolute top-0 left-0"></div>
          </div>
          <span className="ml-4 text-base text-gray-600 font-medium">Loading product...</span>
        </div>
      ) : error ? (
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-800 mb-2">Oops!</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button onClick={() => router.push('/products')} className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors duration-300">
              Browse Products
            </button>
          </div>
        </div>
      ) : success ? (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <p className="text-green-700 font-semibold text-lg">{success}</p>
          </div>
        </div>
      ) : null}

      {product && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center min-h-[450px]">
                <div className="relative w-full max-w-md">
                  <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                    <img src={selectedImage} alt={product.name} className="w-full h-auto object-cover" />
                    {inventory && inventory.quantity > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>In Stock</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {galleryImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200">
                    {galleryImages.map((url, index) => (
                      <button key={`${url}-${index}`} onClick={() => setSelectedImageIndex(index)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${selectedImageIndex === index ? 'border-green-500 scale-110 shadow-md' : 'border-gray-200 hover:border-green-300'}`}>
                        <img src={url} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 lg:p-8">
                <div className="flex items-start justify-between mb-4">
                  <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                    <Shield className="w-3.5 h-3.5" />
                    <span>SKU: {product.skuCode}</span>
                  </span>
                  {inventory && inventory.quantity > 0 ? (
                    <span className="inline-flex items-center space-x-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{inventory.quantity} in stock</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Out of Stock</span>
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.name}</h1>

                <div className="flex items-center space-x-2 mb-4">
                  {renderStars(Math.round(averageRating))}
                  <span className="text-gray-600 text-sm font-medium">({averageRating.toFixed(1)} / 5.0)</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600 text-sm">{reviewCount} review{reviewCount === 1 ? '' : 's'}</span>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                  <MapPin className="w-4 h-4 mr-2 text-green-600" />
                  <span>Posted from <span className="font-semibold text-gray-900">{product.city || 'Location not set'}</span></span>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                <div className="mb-6 pb-6 border-b-2 border-gray-100">
                  <div className="flex items-baseline space-x-3 mb-2">
                    <span className="text-4xl font-bold text-green-600">MWK {effectivePrice.toFixed(2)}</span>
                    {hasDiscount && (
                      <>
                        <span className="text-lg text-gray-400 line-through">MWK {product.price.toFixed(2)}</span>
                        <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold">{Number(product.discountPercentage).toFixed(0)}% OFF</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <Info className="w-3 h-3" />
                    <span>Price includes all taxes and fees</span>
                  </p>
                </div>

                {inventory ? (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span>Available Quantity</span>
                      </span>
                      <span className="text-sm font-bold text-green-600">{inventory.quantity} units</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (inventory.quantity / 50) * 100)}%` }}></div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4" />
                        <span>Seller: <span className="font-semibold">{inventory.sellerName || 'Verified Seller'}</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>Ships from <span className="font-semibold">{product.city || 'Location not set'}</span></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <div className="flex items-center space-x-2 text-red-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold">Currently Out of Stock - Notify me when available</span>
                    </div>
                  </div>
                )}

                {inventory && inventory.quantity > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Select Quantity</span>
                    </label>
                    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="w-10 h-10 rounded-lg bg-white hover:bg-green-100 text-gray-700 hover:text-green-700 flex items-center justify-center transition-all duration-300 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-center">
                        <input
                          type="number"
                          min="1"
                          max={inventory.quantity}
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val >= 1 && val <= inventory.quantity) {
                              setQuantity(val);
                            }
                          }}
                          className="w-full text-xl font-bold text-center bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900"
                        />
                      </div>
                      <button onClick={() => setQuantity((q) => Math.min(inventory.quantity, q + 1))} disabled={quantity >= inventory.quantity} className="w-10 h-10 rounded-lg bg-white hover:bg-green-100 text-gray-700 hover:text-green-700 flex items-center justify-center transition-all duration-300 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">MWK {(effectivePrice * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <button onClick={handleAddToCart} disabled={!inventory || inventory.quantity < quantity} className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-xl ${!inventory || inventory.quantity < quantity ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'}`}>
                    <ShoppingCart className="w-6 h-6" />
                    <span>{!user ? 'Log In to Add to Cart' : !inventory || inventory.quantity < quantity ? 'Out of Stock' : `Add to Cart - MWK ${(effectivePrice * quantity).toFixed(2)}`}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ratings & Reviews</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{averageRating.toFixed(1)}</div>
                  <div className="text-sm text-gray-500">from {reviewCount} review{reviewCount === 1 ? '' : 's'}</div>
                </div>
              </div>

              {user?.role === 'BUYER' && (
                <div className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Write a review</h3>
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setReviewForm((prev) => ({ ...prev, rating }))}
                          className="p-1"
                        >
                          <Star className={`w-7 h-7 ${reviewForm.rating >= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Share what you liked about this product"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                    className="rounded-full bg-green-600 px-6 py-3 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {submittingReview ? 'Saving Review...' : 'Save Review'}
                  </button>
                </div>
              )}

              {reviewLoading ? (
                <div className="py-8 text-center text-gray-500">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-center text-gray-500">No reviews yet. Be the first to share your thoughts.</div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-gray-200 p-5">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">{review.userName}</div>
                          <div className="mt-1">{renderStars(review.rating, 'w-4 h-4')}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.updatedAt ? new Date(review.updatedAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4">
                  <Truck className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Fast & Reliable Delivery</h3>
                <p className="text-sm text-gray-600">Quick shipping to your doorstep with real-time tracking</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Guarantee</h3>
                <p className="text-sm text-gray-600">100% satisfaction guaranteed or full refund within 30 days</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center mb-4">
                  <Star className="w-7 h-7 text-yellow-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Premium Quality Verified</h3>
                <p className="text-sm text-gray-600">Handpicked and verified quality products from trusted sellers</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
