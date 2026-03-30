'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { productService, Product } from '@/lib/product-service';
import { inventoryService, InventoryItem } from '@/lib/inventory-service';
import { categoryService, Category } from '@/lib/category-service';
import {
  ShoppingCart,
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronRight,
  Package,
  AlertCircle,
  TrendingUp,
  X
} from 'lucide-react';

interface ProductWithInventory extends Product {
  inventory?: InventoryItem;
}

export default function ProductsPage() {
  const router = useRouter();
  const { isLoading } = useAuth();
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const getEffectivePrice = (product: Product) => product.discountedPrice ?? product.price;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, priceRange, sortBy, searchQuery]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let productData = await productService.getAllProducts();

      if (selectedCategory) {
        productData = productData.filter(p => p.categoryId === selectedCategory);
      }

      if (searchQuery) {
        productData = productData.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      productData = productData.filter(p => getEffectivePrice(p) >= priceRange[0] && getEffectivePrice(p) <= priceRange[1]);

      switch (sortBy) {
        case 'price-low':
          productData.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
          break;
        case 'price-high':
          productData.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
          break;
        case 'name':
          productData.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default:
          productData.sort((a, b) => b.id!.localeCompare(a.id!));
      }

      const productsWithInventory = await Promise.all(
        productData.map(async (product) => {
          try {
            const inventory = product.sellerId
              ? await inventoryService.getInventoryBySkuCodeAndSellerId(product.skuCode, product.sellerId)
              : await inventoryService.getInventoryBySkuCode(product.skuCode);
            return { ...product, inventory };
          } catch {
            return product;
          }
        })
      );

      setProducts(productsWithInventory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">All Products</h1>
              <p className="text-lg text-gray-600">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Fresh Inventory Daily</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-3 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-3 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden px-4 py-3 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 transition"
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {(showFilters || true) && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </h3>
                {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 100000 || searchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setPriceRange([0, 100000]);
                      setSearchQuery('');
                      setSortBy('featured');
                    }}
                    className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Price Range (MWK)
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-gray-500 font-medium">-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 100000])}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>MWK 0</span>
                      <span className="font-semibold">MWK {priceRange[1].toLocaleString()}</span>
                      <span>MWK 100,000+</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedCategory === ''
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedCategory === category.id
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 absolute top-0 left-0"></div>
            </div>
            <span className="ml-4 text-lg text-gray-600 font-medium">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your filters or search query to find what you're looking for
            </p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setPriceRange([0, 100000]);
                setSearchQuery('');
                setSortBy('featured');
              }}
              className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                >
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    <img
                      src={product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(product.name)}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.inventory && product.inventory.quantity > 0 && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg">
                          In Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                        {product.skuCode}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2 text-sm">{product.description}</p>

                    {product.inventory ? (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Available: {product.inventory.quantity}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (product.inventory.quantity / 50) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-3 text-red-600 text-xs font-semibold">Out of Stock</div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-start">
                        <span className="text-xl font-bold text-green-600">MWK {getEffectivePrice(product).toFixed(2)}</span>
                        {(product.discountPercentage ?? 0) > 0 && (
                          <span className="text-xs text-gray-500 line-through">MWK {product.price.toFixed(2)}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => router.push(`/products/${product.id}`)}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-1 shadow-md"
                      >
                        <span>View</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-56 h-48 md:h-auto relative bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.inventory && product.inventory.quantity > 0 && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            In Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-5 md:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="mb-2">
                            <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                              {product.skuCode}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                          {product.inventory ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <Package className="w-4 h-4 text-green-600" />
                              <span className="text-gray-700 font-medium">Available: {product.inventory.quantity} units</span>
                            </div>
                          ) : (
                            <div className="text-red-600 text-sm font-semibold">Currently Out of Stock</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="mb-3">
                            <span className="text-2xl font-bold text-green-600 block">MWK {getEffectivePrice(product).toFixed(2)}</span>
                            {(product.discountPercentage ?? 0) > 0 && (
                              <span className="text-xs text-gray-500 line-through">MWK {product.price.toFixed(2)}</span>
                            )}
                          </div>
                          <button 
                            onClick={() => router.push(`/products/${product.id}`)}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md inline-flex items-center space-x-2"
                          >
                            <span>View Details</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
