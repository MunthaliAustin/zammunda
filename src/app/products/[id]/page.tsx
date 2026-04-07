'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth, useCart } from '@/app/providers';
import { productService, Product } from '@/lib/product-service';
import { reviewService, Review } from '@/lib/review-service';
import { inventoryService, InventoryItem } from '@/lib/inventory-service';
import { formatPricePerUnit, formatQuantityWithUnit } from '@/lib/units';
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
  MapPin,
  X,
  ChevronLeft,
  ChevronRight,
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
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
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

    const images = [product.imageUrl, ...(product.imageUrls ?? [])].filter(
      (imageUrl): imageUrl is string => !!imageUrl && imageUrl.startsWith('http')
    );

    return Array.from(new Set(images));
  }, [product]);

  const selectedImage =
    galleryImages[selectedImageIndex] ||
    product?.imageUrl ||
    `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(product?.name || 'Product')}`;

  const canBrowseImages = galleryImages.length > 1;

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
          inventory: inventoryData,
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

  const openImageViewer = (index?: number) => {
    if (typeof index === 'number') {
      setSelectedImageIndex(index);
    }
    setIsImageViewerOpen(true);
  };

  const showPreviousImage = () => {
    if (!galleryImages.length) {
      return;
    }
    setSelectedImageIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  };

  const showNextImage = () => {
    if (!galleryImages.length) {
      return;
    }
    setSelectedImageIndex((current) => (current === galleryImages.length - 1 ? 0 : current + 1));
  };

  const renderStars = (value: number, size = 'w-5 h-5') => (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size} ${value >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
        />
      ))}
    </div>
  );

  if (isLoading && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-b-2 border-emerald-600"></div>
          <p className="font-medium text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6f4ea_0%,#fcfbf7_48%,#f2f6f0_100%)] py-6 lg:py-8">
      <div className="mx-auto mb-6 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`rounded-full border border-slate-200 p-2.5 transition-all duration-300 hover:shadow-md ${isWishlisted ? 'bg-red-50 text-red-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              title="Add to wishlist"
            >
              <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>
            <button
              className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:shadow-md"
              title="Share product"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-200"></div>
            <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-t-4 border-emerald-600"></div>
          </div>
          <span className="ml-4 text-base font-medium text-slate-600">Loading product...</span>
        </div>
      ) : error ? (
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
            <h2 className="mb-2 text-2xl font-bold text-red-800">Oops!</h2>
            <p className="mb-6 text-red-600">{error}</p>
            <button
              onClick={() => router.push('/products')}
              className="rounded-full bg-red-600 px-6 py-3 font-semibold text-white transition-colors duration-300 hover:bg-red-700"
            >
              Browse Products
            </button>
          </div>
        </div>
      ) : success ? (
        <div className="mx-auto mb-6 max-w-4xl px-4">
          <div className="flex items-center space-x-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
            <p className="text-lg font-semibold text-emerald-700">{success}</p>
          </div>
        </div>
      ) : null}

      {product && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-7">
              <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
                <div className="grid grid-cols-1 lg:grid-cols-[1.06fr_0.94fr]">
                  <div className="border-b border-slate-200/80 bg-[linear-gradient(180deg,#f8f7f2_0%,#eef4ec_100%)] p-5 lg:border-b-0 lg:border-r lg:p-8">
                    <div className="mx-auto max-w-2xl">
                      <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.10)] lg:p-6">
                        <div
                          className="aspect-[4/4.3] w-full cursor-zoom-in overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f4f4ef_100%)]"
                          onClick={() => openImageViewer()}
                        >
                          <img src={selectedImage} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]" />
                        </div>
                        <div className="pointer-events-none absolute inset-x-5 bottom-5 h-24 rounded-b-[24px] bg-gradient-to-t from-slate-900/10 to-transparent lg:inset-x-6 lg:bottom-6" />
                        {inventory && inventory.quantity > 0 && (
                          <div className="absolute right-4 top-4">
                            <span className="flex items-center space-x-1 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
                              <CheckCircle className="h-4 w-4" />
                              <span>In Stock</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {galleryImages.length > 1 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto rounded-2xl border border-white/70 bg-white/85 p-3 shadow-sm">
                          {galleryImages.map((url, index) => (
                            <button
                              key={`${url}-${index}`}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all duration-300 ${selectedImageIndex === index ? 'border-emerald-500 ring-4 ring-emerald-100' : 'border-slate-200 hover:border-emerald-300'}`}
                            >
                              <img
                                src={url}
                                alt={`${product.name} thumbnail ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
                          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            <MapPin className="h-4 w-4 text-emerald-600" />
                            Origin
                          </div>
                          <p className="text-base font-semibold text-slate-900">{product.city || 'Location not set'}</p>
                        </div>
                        <div className="rounded-2xl border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
                          <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            <Shield className="h-4 w-4 text-emerald-600" />
                            Listing
                          </div>
                          <p className="text-base font-semibold text-slate-900">Verified marketplace listing</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 lg:p-8 xl:p-10">
                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center space-x-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-md">
                        <Shield className="h-3.5 w-3.5" />
                        <span>SKU: {product.skuCode}</span>
                      </span>
                      {inventory && inventory.quantity > 0 ? (
                        <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>{formatQuantityWithUnit(inventory.quantity, inventory.unitType ?? product.unitType, inventory.unitLabel ?? product.unitLabel)} in stock</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>Out of Stock</span>
                        </span>
                      )}
                    </div>

                    <h1 className="mb-3 text-3xl font-bold leading-tight text-slate-900 xl:text-4xl">{product.name}</h1>

                    <div className="mb-5 flex flex-wrap items-center gap-2">
                      {renderStars(Math.round(averageRating))}
                      <span className="text-sm font-medium text-slate-600">({averageRating.toFixed(1)} / 5.0)</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-sm text-slate-600">{reviewCount} review{reviewCount === 1 ? '' : 's'}</span>
                    </div>

                    <p className="mb-6 text-sm leading-7 text-slate-700">{product.description}</p>

                    <div className="mb-6 rounded-[28px] border border-slate-200 bg-slate-50/90 p-5">
                      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                        <span className="text-4xl font-bold text-emerald-700">MWK {effectivePrice.toFixed(2)}</span>
                        {hasDiscount && (
                          <>
                            <span className="text-lg text-slate-400 line-through">MWK {product.price.toFixed(2)}</span>
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">{Number(product.discountPercentage).toFixed(0)}% OFF</span>
                          </>
                        )}
                      </div>
                      <p className="mb-4 flex items-center space-x-1 text-xs text-slate-500">
                        <Info className="h-3 w-3" />
                        <span>{formatPricePerUnit(effectivePrice, inventory?.unitType ?? product.unitType, inventory?.unitLabel ?? product.unitLabel)}. Shipping is calculated at checkout.</span>
                      </p>

                      {inventory ? (
                        <>
                          <div className="mb-3 flex items-center justify-between">
                            <span className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
                              <Package className="h-4 w-4" />
                              <span>Available Quantity</span>
                            </span>
                            <span className="text-sm font-bold text-emerald-700">{formatQuantityWithUnit(inventory.quantity, inventory.unitType ?? product.unitType, inventory.unitLabel ?? product.unitLabel)}</span>
                          </div>
                          <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                            <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500" style={{ width: `${Math.min(100, (inventory.quantity / 50) * 100)}%` }}></div>
                          </div>
                          <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-3">
                            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                <Package className="h-4 w-4 text-emerald-600" />
                                Selling Unit
                              </div>
                              <p className="font-semibold text-slate-900">{inventory.unitLabel || product.unitLabel || 'unit'}</p>
                            </div>
                            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                <Truck className="h-4 w-4 text-emerald-600" />
                                Seller
                              </div>
                              <p className="font-semibold text-slate-900">{inventory.sellerName || 'Verified Seller'}</p>
                            </div>
                            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                              <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                <MapPin className="h-4 w-4 text-emerald-600" />
                                Ships From
                              </div>
                              <p className="font-semibold text-slate-900">{product.city || 'Location not set'}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4">
                          <div className="flex items-center space-x-2 text-red-700">
                            <AlertCircle className="h-5 w-5" />
                            <span className="text-sm font-semibold">Currently out of stock. We can notify you when inventory is restored.</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {inventory && inventory.quantity > 0 && (
                      <div className="mb-6">
                        <label className="mb-3 flex items-center space-x-2 text-sm font-semibold text-slate-700">
                          <ShoppingCart className="h-4 w-4" />
                          <span>Select Quantity</span>
                        </label>
                        <div className="flex items-center space-x-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:bg-emerald-100 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                            <Minus className="h-4 w-4" />
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
                              className="w-full border-none bg-transparent text-center text-xl font-bold text-slate-900 focus:outline-none focus:ring-0"
                            />
                          </div>
                          <button onClick={() => setQuantity((q) => Math.min(inventory.quantity, q + 1))} disabled={quantity >= inventory.quantity} className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:bg-emerald-100 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/85 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-sm text-slate-600">Current subtotal</span>
                        <span className="text-3xl font-bold text-emerald-700">MWK {(effectivePrice * quantity).toFixed(2)}</span>
                      </div>
                      <button onClick={handleAddToCart} disabled={!inventory || inventory.quantity < quantity} className={`flex w-full items-center justify-center space-x-3 rounded-2xl px-6 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 ${!inventory || inventory.quantity < quantity ? 'cursor-not-allowed bg-slate-300' : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-800'}`}>
                        <ShoppingCart className="h-6 w-6" />
                          <span>{!user ? 'Log In to Add to Cart' : !inventory || inventory.quantity < quantity ? 'Out of Stock' : `Add ${formatQuantityWithUnit(quantity, inventory?.unitType ?? product.unitType, inventory?.unitLabel ?? product.unitLabel)} to Cart`}</span>
                      </button>
                      <p className="mt-3 text-center text-xs text-slate-500">Secure checkout, shipping calculated from product origin and delivery city.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Customer feedback</p>
                    <h2 className="text-2xl font-bold text-slate-900">Ratings & Reviews</h2>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right ring-1 ring-slate-200">
                    <div className="text-3xl font-bold text-emerald-700">{averageRating.toFixed(1)}</div>
                    <div className="text-sm text-slate-500">from {reviewCount} review{reviewCount === 1 ? '' : 's'}</div>
                  </div>
                </div>

                {user?.role === 'BUYER' && (
                  <div className="mb-8 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                    <h3 className="mb-3 text-lg font-semibold text-slate-900">Write a review</h3>
                    <div className="mb-3">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            onClick={() => setReviewForm((prev) => ({ ...prev, rating }))}
                            className="p-1"
                          >
                            <Star className={`h-7 w-7 ${reviewForm.rating >= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="mb-2 block text-sm font-medium text-slate-700">Comment</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                        rows={4}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Share what you liked about this product"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="rounded-full bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {submittingReview ? 'Saving Review...' : 'Save Review'}
                    </button>
                  </div>
                )}

                {reviewLoading ? (
                  <div className="py-8 text-center text-slate-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-500">
                    No reviews yet. Be the first to share your thoughts.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="rounded-[28px] border border-slate-200 p-5">
                        <div className="mb-2 flex items-start justify-between gap-4">
                          <div>
                            <div className="font-semibold text-slate-900">{review.userName}</div>
                            <div className="mt-1">{renderStars(review.rating, 'w-4 h-4')}</div>
                          </div>
                          <div className="text-xs text-slate-500">
                            {review.updatedAt ? new Date(review.updatedAt).toLocaleDateString() : ''}
                          </div>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {isImageViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4 py-6 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setIsImageViewerOpen(false)}
            className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
            aria-label="Close image viewer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative flex w-full max-w-6xl items-center justify-center gap-4">
            {canBrowseImages && (
              <button
                type="button"
                onClick={showPreviousImage}
                className="hidden rounded-full border border-white/15 bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:inline-flex"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <div className="w-full">
              <div className="mx-auto overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl">
                <div className="max-h-[78vh] min-h-[320px] w-full bg-black/20">
                  <img src={selectedImage} alt={product?.name || 'Product image'} className="h-full max-h-[78vh] w-full object-contain" />
                </div>
              </div>

              {canBrowseImages && (
                <>
                  <div className="mt-4 flex items-center justify-between md:hidden">
                    <button
                      type="button"
                      onClick={showPreviousImage}
                      className="inline-flex rounded-full border border-white/15 bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={showNextImage}
                      className="inline-flex rounded-full border border-white/15 bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 flex gap-3 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-3">
                    {galleryImages.map((url, index) => (
                      <button
                        key={`viewer-${url}-${index}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-300 ${selectedImageIndex === index ? 'border-emerald-400 ring-4 ring-emerald-500/20' : 'border-white/15 hover:border-white/40'}`}
                      >
                        <img src={url} alt={`${product?.name || 'Product'} preview ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {canBrowseImages && (
              <button
                type="button"
                onClick={showNextImage}
                className="hidden rounded-full border border-white/15 bg-white/10 p-3 text-white transition-colors hover:bg-white/20 md:inline-flex"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
