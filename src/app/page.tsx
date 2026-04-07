'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import FarmersMarketSlideshow from '@/components/FarmersMarketSlideshow';
import { productService, Product } from '@/lib/product-service';
import { categoryService, Category } from '@/lib/category-service';
import {
  ShoppingCart,
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
import { formatPricePerUnit } from '@/lib/units';

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
  const [pauseFeaturedScroll, setPauseFeaturedScroll] = useState(false);
  const featuredRailRef = useRef<HTMLDivElement | null>(null);
  const getEffectivePrice = (product: Product) => product.discountedPrice ?? product.price;
  const featuredProducts = products.slice(0, 4);
  const hasActiveSearch = searchQuery.trim().length > 0;

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

  useEffect(() => {
    if (hasActiveSearch || featuredProducts.length <= 1 || pauseFeaturedScroll) {
      return;
    }

    const rail = featuredRailRef.current;
    if (!rail) {
      return;
    }

    const interval = window.setInterval(() => {
      const firstCard = rail.querySelector<HTMLElement>('[data-featured-card="true"]');
      if (!firstCard) {
        return;
      }

      const cardStyles = window.getComputedStyle(rail);
      const gap = parseFloat(cardStyles.columnGap || cardStyles.gap || '16');
      const step = firstCard.offsetWidth + gap;
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
      const nextLeft = rail.scrollLeft + step;

      rail.scrollTo({
        left: nextLeft >= maxScrollLeft - 8 ? 0 : nextLeft,
        behavior: 'smooth',
      });
    }, 3500);

    return () => window.clearInterval(interval);
  }, [featuredProducts.length, hasActiveSearch, pauseFeaturedScroll]);

  return (
    <div className="flex flex-col">
      <section className="pb-4 pt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="section-card rounded-[1.75rem] p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Search marketplace</p>
                <h2 className="text-2xl font-bold text-slate-900">Find products quickly</h2>
              </div>
              <div className="relative w-full lg:max-w-xl">
                <input
                  type="text"
                  placeholder="Search produce, grains, fruits and more..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {!hasActiveSearch && <FarmersMarketSlideshow />}

      {!hasActiveSearch && (
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Categories</p>
                <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
              </div>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory('')}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700"
                >
                  <X className="h-4 w-4" />
                  Clear category
                </button>
              )}
            </div>

            {loadingCategories ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? '' : category.id)}
                    className={`group overflow-hidden rounded-[1.35rem] border p-3 text-left transition-all duration-300 hover:-translate-y-1 ${
                      selectedCategory === category.id
                        ? 'border-emerald-600 bg-emerald-50 shadow-[0_18px_40px_rgba(16,185,129,0.15)]'
                        : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]'
                    }`}
                  >
                    <div>
                      <div className="relative mb-3 aspect-[1/0.95] w-full overflow-hidden rounded-[1rem] bg-gradient-to-br from-gray-50 to-gray-100">
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
                          <div className="absolute inset-0 bg-emerald-600/20 flex items-center justify-center">
                            <div className="bg-white rounded-full p-1.5 shadow-lg">
                              <ShoppingBag className="w-5 h-5 text-emerald-600" />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="truncate text-sm font-semibold text-slate-900">{category.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {!hasActiveSearch && featuredProducts.length > 0 && (
        <section className="pb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="section-card rounded-[1.75rem] p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Featured now</p>
                  <h2 className="text-2xl font-bold text-slate-900">Fresh picks from the marketplace</h2>
                </div>
                <button
                  onClick={() => router.push('/products')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 transition hover:text-emerald-800"
                >
                  View all products
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div
                ref={featuredRailRef}
                onMouseEnter={() => setPauseFeaturedScroll(true)}
                onMouseLeave={() => setPauseFeaturedScroll(false)}
                onTouchStart={() => setPauseFeaturedScroll(true)}
                onTouchEnd={() => setPauseFeaturedScroll(false)}
                className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {featuredProducts.map((product) => (
                  <button
                    key={`featured-${product.id}`}
                    data-featured-card="true"
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="group min-w-[260px] max-w-[260px] snap-start overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)] sm:min-w-[300px] sm:max-w-[300px] lg:min-w-[320px] lg:max-w-[320px]"
                  >
                    <div className="relative aspect-[1.15/1] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="line-clamp-1 text-sm font-semibold text-slate-900">{product.name}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                          {product.skuCode}
                        </span>
                      </div>
                      <div className="mb-3 flex items-center text-xs text-slate-500">
                        <MapPin className="mr-1 h-3.5 w-3.5" />
                        <span>{product.city || 'Location not set'}</span>
                      </div>
                      <div className="flex items-end justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-lg font-bold text-emerald-700">MWK {getEffectivePrice(product).toFixed(2)}</span>
                          <span className="text-xs text-slate-500">{product.unitLabel || 'unit'}</span>
                          {(product.discountPercentage ?? 0) > 0 && (
                            <span className="text-xs text-slate-400 line-through">MWK {product.price.toFixed(2)}</span>
                          )}
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">View</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Catalogue</p>
              <h2 className="text-3xl font-bold text-gray-900">All Products</h2>
              <p className="mt-1 text-sm text-gray-600">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>

              <div className="flex overflow-hidden rounded-full border border-slate-300 bg-white">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2.5 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-emerald-600 text-white'
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

          {showFilters && (
            <div className="section-card mb-8 rounded-[1.5rem] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center space-x-2 text-base font-semibold text-gray-900">
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        placeholder="Min"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                        placeholder="Max"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          ? 'bg-emerald-600 text-white'
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
                            ? 'bg-emerald-600 text-white'
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
                    className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_20px_48px_rgba(15,23,42,0.10)]"
                  >
                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      <img
                        src={product.imageUrl && product.imageUrl.startsWith('http') ? product.imageUrl : `https://via.placeholder.com/400x400.png?text=${encodeURIComponent(product.name)}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute right-3 top-3 flex gap-2">
                        {(product.discountPercentage ?? 0) > 0 && (
                          <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md">
                            {Number(product.discountPercentage).toFixed(0)}% OFF
                          </span>
                        )}
                        <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-700 backdrop-blur-sm">
                          {product.skuCode}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="mb-2 line-clamp-1 text-base font-bold text-slate-900">{product.name}</h3>
                      <p className="mb-3 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                      <div className="mb-4 flex items-center text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        <span>{product.city || 'Location not set'}</span>
                      </div>

                      <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-col">
                            <span className="text-xl font-bold text-emerald-700">MWK {getEffectivePrice(product).toFixed(2)}</span>
                            <span className="text-xs text-slate-500">{product.unitLabel || 'unit'}</span>
                            {(product.discountPercentage ?? 0) > 0 && (
                              <span className="text-xs text-slate-400 line-through">MWK {product.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => router.push(`/products/${product.id}`)}
                          className="flex items-center space-x-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg"
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
                    className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_12px_36px_rgba(15,23,42,0.05)] transition-all duration-300 hover:shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
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
                            <span className="text-2xl font-bold text-emerald-700">MWK {getEffectivePrice(product).toFixed(2)}</span>
                            <span className="text-xs text-slate-500">{formatPricePerUnit(getEffectivePrice(product), product.unitType, product.unitLabel)}</span>
                            {(product.discountPercentage ?? 0) > 0 && (
                              <span className="text-xs text-gray-500 line-through">MWK {product.price.toFixed(2)}</span>
                            )}
                          </div>
                          <button
                            onClick={() => router.push(`/products/${product.id}`)}
                            className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg"
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
            <div className="py-16 text-center">
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
                className="rounded-full bg-emerald-600 px-8 py-3 font-semibold text-white transition-colors duration-300 hover:bg-emerald-700"
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


