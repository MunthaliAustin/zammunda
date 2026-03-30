'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FarmersMarketSlideshow from '@/components/FarmersMarketSlideshow';
import { productService, Product } from '@/lib/product-service';
import { categoryService, Category } from '@/lib/category-service';
import {
  ShoppingCart,
  TrendingUp,
  Award,
  Leaf,
  ChevronRight,
  Search,
  Filter,
  Grid3x3,
  List,
  SlidersHorizontal,
  X,
  ShoppingBag,
  MapPin
} from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const getEffectivePrice = (product: Product) => product.discountedPrice ?? product.price;

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const categoriesData = await categoryService.getAllCategories();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      let productData = await productService.getAllProducts();

      if (selectedCategory) {
        productData = productData.filter((p) => p.categoryId === selectedCategory);
      }

      if (searchQuery) {
        productData = productData.filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      productData = productData.filter((p) => getEffectivePrice(p) >= priceRange[0] && getEffectivePrice(p) <= priceRange[1]);

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

      setProducts(productData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, priceRange, sortBy, searchQuery]);

  return (
    <div className="flex flex-col bg-gradient-to-b from-white to-gray-50">
      <FarmersMarketSlideshow />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-2xl hover:bg-green-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fresh & Organic</h3>
              <p className="text-gray-600">Directly sourced from certified organic farms</p>
            </div>
            <div className="text-center p-6 rounded-2xl hover:bg-blue-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">Rigorous quality checks for every product</p>
            </div>
            <div className="text-center p-6 rounded-2xl hover:bg-orange-50 transition-colors duration-300">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Shopping</h3>
              <p className="text-gray-600">Seamless ordering and fast delivery</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Browse by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Find exactly what you're looking for</p>
          </div>

          {loadingCategories ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                  className={`group p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.id
                      ? 'border-green-600 bg-green-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                      {category.imageUrl && category.imageUrl.startsWith('http') ? (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="w-8 h-8 text-green-400" />
                        </div>
                      )}
                      {selectedCategory === category.id && (
                        <div className="absolute inset-0 bg-green-600/20 flex items-center justify-center">
                          <div className="bg-white rounded-full p-1.5 shadow-lg">
                            <ShoppingBag className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{category.name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Products</h2>
              <p className="text-gray-600">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 md:flex-none md:w-64">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2.5 transition-colors ${
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
                className="md:hidden px-4 py-2.5 border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 transition"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {(showFilters || true) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </h3>
                {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 10000) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setPriceRange([0, 10000]);
                      setSearchQuery('');
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
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        placeholder="Min"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                        placeholder="Max"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>MWK 0</span>
                      <span className="font-semibold">MWK {priceRange[1].toLocaleString()}</span>
                      <span>MWK 10,000+</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCategory === ''
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-green-600 text-white'
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

          {loadingProducts ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200"></div>
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 absolute top-0 left-0"></div>
              </div>
              <span className="ml-4 text-lg text-gray-600 font-medium">Loading products...</span>
            </div>
          ) : products.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      <img
                        src={product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700">
                          {product.skuCode}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-gray-600 mb-2 line-clamp-2 text-sm">{product.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        <span>{product.city || 'Location not set'}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex flex-col">
                            <span className="text-xl font-bold text-green-600">MWK {getEffectivePrice(product).toFixed(2)}</span>
                            {(product.discountPercentage ?? 0) > 0 && (
                              <span className="text-xs text-gray-500 line-through">MWK {product.price.toFixed(2)}</span>
                            )}
                          </div>
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
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-48 h-48 md:h-auto relative bg-gradient-to-br from-gray-100 to-gray-200">
                        <img
                          src={product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(product.name)}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4 md:p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <MapPin className="w-3.5 h-3.5 mr-1" />
                              <span>{product.city || 'Location not set'}</span>
                            </div>
                          </div>
                          <span className="bg-gray-100 px-2.5 py-1 rounded-full text-xs font-semibold text-gray-700">
                            {product.skuCode}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex flex-col items-end">
                            <span className="text-2xl font-bold text-green-600">MWK {getEffectivePrice(product).toFixed(2)}</span>
                            {(product.discountPercentage ?? 0) > 0 && (
                              <span className="text-xs text-gray-500 line-through">MWK {product.price.toFixed(2)}</span>
                            )}
                          </div>
                          <button
                            onClick={() => router.push(`/products/${product.id}`)}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setPriceRange([0, 10000]);
                  setSearchQuery('');
                }}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-colors duration-300"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


