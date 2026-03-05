'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { productService, Product } from '@/lib/product-service';
import { inventoryService, InventoryItem } from '@/lib/inventory-service';
import { orderService, OrderRequest } from '@/lib/order-service';
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
  Clock,
  Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProductWithInventory extends Product {
  inventory?: InventoryItem;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [product, setProduct] = useState<ProductWithInventory | null>(null);
  const [inventory, setInventory] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      fetchProduct();
    }
  }, [params.id, user, isLoading]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProductById(params.id);
      
      try {
        const inventoryData = await inventoryService.getInventoryBySkuCode(productData.skuCode);
        setInventory(inventoryData);
        setProduct({
          ...productData,
          inventory: inventoryData
        });
      } catch (inventoryError) {
        setProduct(productData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      setError('You must be logged in to place an order');
      return;
    }

    if (!product) {
      setError('Product not found');
      return;
    }

    if (!inventory || inventory.quantity < quantity) {
      setError('Insufficient inventory available');
      return;
    }

    try {
      const orderRequest: OrderRequest = {
        productId: product.id!,
        quantity: Number(quantity),
        userId: user.user_id.toString(),
        skuCode: product.skuCode,
        price: product.price,
        sellerId: inventory?.sellerId || ''
      };
      
      await orderService.createOrder(orderRequest);
      setSuccess('Order placed successfully!');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setSuccess(null);
    }
  };

  if (isLoading) {
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
      {/* Enhanced Back Button with Actions */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-300 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`p-2.5 rounded-lg transition-all duration-300 ${
                isWishlisted 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } border border-gray-200 hover:shadow-md`}
              title="Add to wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
            </button>
            <button
              className="p-2.5 rounded-lg bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:shadow-md transition-all duration-300"
              title="Share product"
            >
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
            <button
              onClick={() => router.push('/products')}
              className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-700 transition-colors duration-300"
            >
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
          {/* Main Product Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Enhanced Product Image Section */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center min-h-[450px]">
                <div className="relative w-full max-w-md">
                  {/* Main Image Display */}
                  <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                    <img
                      src={(() => {
                        // If there are multiple images and one is selected, show it
                        if (product.imageUrls && product.imageUrls.length > 0 && selectedImageIndex < product.imageUrls.length) {
                          return product.imageUrls[selectedImageIndex];
                        }
                        // Otherwise fall back to primary imageUrl
                        if (product.imageUrl && product.imageUrl.startsWith('http')) {
                          return product.imageUrl;
                        }
                        // Final fallback to placeholder
                        return `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(product.name)}`;
                      })()}
                      alt={product.name}
                      className="w-full h-auto object-cover"
                    />
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

                {/* Enhanced Thumbnail Gallery */}
                {(() => {
                  // Combine primary image and additional images for display
                  const allImages: string[] = [];
                  if (product.imageUrl && product.imageUrl.startsWith('http')) {
                    allImages.push(product.imageUrl);
                  }
                  if (product.imageUrls && product.imageUrls.length > 0) {
                    allImages.push(...product.imageUrls);
                  }
                  
                  // Only show gallery if there are 2 or more images total
                  if (allImages.length > 1) {
                    return (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg border border-gray-200">
                        {allImages.map((url, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                              selectedImageIndex === index 
                                ? 'border-green-500 scale-110 shadow-md' 
                                : 'border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <img
                              src={url}
                              alt={`${product.name} thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Enhanced Product Info Section */}
              <div className="p-6 lg:p-8">
                {/* Header with SKU and Status */}
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

                {/* Product Name */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                  {product.name}
                </h1>

                {/* Enhanced Rating */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm font-medium">(4.8 / 5.0)</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-600 text-sm">128 reviews</span>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
                </div>

                {/* Enhanced Price Section */}
                <div className="mb-6 pb-6 border-b-2 border-gray-100">
                  <div className="flex items-baseline space-x-3 mb-2">
                    <span className="text-4xl font-bold text-green-600">MWK {product.price.toFixed(2)}</span>
                    <span className="text-lg text-gray-400 line-through">MWK {(product.price * 1.2).toFixed(2)}</span>
                    <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-full text-xs font-bold">20% OFF</span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center space-x-1">
                    <Info className="w-3 h-3" />
                    <span>Price includes all taxes and fees</span>
                  </p>
                </div>

                {/* Enhanced Inventory Status */}
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
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (inventory.quantity / 50) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4" />
                      <span>Seller: <span className="font-semibold">{inventory.sellerName || 'Verified Seller'}</span></span>
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

                {/* Enhanced Quantity Selector */}
                {inventory && inventory.quantity > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4" />
                      <span>Select Quantity</span>
                    </label>
                    <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="w-10 h-10 rounded-lg bg-white hover:bg-green-100 text-gray-700 hover:text-green-700 flex items-center justify-center transition-all duration-300 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
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
                      <button
                        onClick={() => setQuantity(q => Math.min(inventory.quantity, q + 1))}
                        disabled={quantity >= inventory.quantity}
                        className="w-10 h-10 rounded-lg bg-white hover:bg-green-100 text-gray-700 hover:text-green-700 flex items-center justify-center transition-all duration-300 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl border border-green-100">
                      <span className="text-sm text-gray-600">Total Amount:</span>
                      <span className="text-2xl font-bold text-green-600">MWK {(product.price * quantity).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!inventory || inventory.quantity < quantity || !user}
                    className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-xl ${
                      !inventory || inventory.quantity < quantity || !user
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                    }`}
                  >
                    <ShoppingCart className="w-6 h-6" />
                    <span>
                      {!user ? 'Please Log In' : 
                       !inventory || inventory.quantity < quantity ? 'Out of Stock' : 
                       `Add to Cart - MWK ${(product.price * quantity).toFixed(2)}`}
                    </span>
                  </button>
                  
                  {!user && (
                    <button
                      onClick={() => router.push('/signin')}
                      className="w-full py-3.5 px-6 rounded-xl border-2 border-green-600 text-green-600 font-semibold text-base hover:bg-green-50 transition-all duration-300"
                    >
                      Log In to Purchase
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Features Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
      )}
    </div>
  );
}
