import React, { useState, useEffect } from "react";
import { ChevronRight, Star, Clock, TrendingUp, Leaf, X } from "lucide-react";
import Link from "next/link"; // Assuming Next.js for file-based routing

const FarmCategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Predefined categories with icons and colors for better visual appeal
  const categoryConfig = {
    Vegetables: {
      icon: "🥕",
      bgColor: "bg-green-100",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      hoverBg: "hover:bg-green-200",
    },
    Fruits: {
      icon: "🍎",
      bgColor: "bg-red-100",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      hoverBg: "hover:bg-red-200",
    },
    "Grains & Cereals": {
      icon: "🌾",
      bgColor: "bg-amber-100",
      borderColor: "border-amber-200",
      textColor: "text-amber-700",
      hoverBg: "hover:bg-amber-200",
    },
    Legumes: {
      icon: "🫘",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      hoverBg: "hover:bg-orange-200",
    },
    "Dairy Products": {
      icon: "🥛",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      hoverBg: "hover:bg-blue-200",
    },
    "Poultry & Eggs": {
      icon: "🥚",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      hoverBg: "hover:bg-yellow-200",
    },
    Livestock: {
      icon: "🐄",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      hoverBg: "hover:bg-purple-200",
    },
    "Spices & Herbs": {
      icon: "🌿",
      bgColor: "bg-emerald-100",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-700",
      hoverBg: "hover:bg-emerald-200",
    },
    "Processed Foods": {
      icon: "🥫",
      bgColor: "bg-indigo-100",
      borderColor: "border-indigo-200",
      textColor: "text-indigo-700",
      hoverBg: "hover:bg-indigo-200",
    },
  };

  // Special categories
  const specialCategories = [
    {
      id: "recommended",
      name: "Recommended",
      description: "Handpicked fresh produce",
      icon: <Star className="w-8 h-8 text-yellow-600" />,
      bgColor: "bg-gradient-to-br from-yellow-100 to-orange-100",
      borderColor: "border-yellow-300",
      textColor: "text-yellow-800",
      hoverBg: "hover:from-yellow-200 hover:to-orange-200",
    },
    {
      id: "newly-added",
      name: "Newly Added",
      description: "Fresh arrivals this week",
      icon: <Clock className="w-8 h-8 text-green-600" />,
      bgColor: "bg-gradient-to-br from-green-100 to-emerald-100",
      borderColor: "border-green-300",
      textColor: "text-green-800",
      hoverBg: "hover:from-green-200 hover:to-emerald-200",
    },
    {
      id: "trending",
      name: "Trending",
      description: "Popular this season",
      icon: <TrendingUp className="w-8 h-8 text-pink-600" />,
      bgColor: "bg-gradient-to-br from-pink-100 to-rose-100",
      borderColor: "border-pink-300",
      textColor: "text-pink-800",
      hoverBg: "hover:from-pink-200 hover:to-rose-200",
    },
    {
      id: "organic",
      name: "Organic",
      description: "Certified organic produce",
      icon: <Leaf className="w-8 h-8 text-emerald-600" />,
      bgColor: "bg-gradient-to-br from-emerald-100 to-green-100",
      borderColor: "border-emerald-300",
      textColor: "text-emerald-800",
      hoverBg: "hover:from-emerald-200 hover:to-green-200",
    },
  ];

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Check if user is authenticated
        const token = localStorage.getItem('auth-token');
        
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/category`,
          { headers }
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error("Failed to fetch categories:", response.status);
          setCategories([]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = async (categoryId, categoryName) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setLoadingProducts(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/products?categoryId=${categoryId}`
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
      setIsModalOpen(true); // Open the modal after fetching products
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 bg-gray-50">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Shop by Category
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover fresh, locally-sourced produce from trusted farmers in your
          community
        </p>
      </div>

      {/* Special Categories */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <Star className="w-6 h-6 text-yellow-500 mr-2" />
          Featured Collections
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id, category.name)}
              className={`${category.bgColor} ${category.borderColor} ${category.hoverBg} border-2 rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
            >
              <div className="text-center">
                <div className="mb-4 transform transition-transform group-hover:scale-110">
                  {category.icon}
                </div>
                <h4
                  className={`font-semibold text-lg mb-2 ${category.textColor}`}
                >
                  {category.name}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {category.description}
                </p>
                <div className="flex items-center justify-center text-sm font-medium">
                  <span className={category.textColor}>Explore</span>
                  <ChevronRight
                    className={`w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 ${category.textColor.replace(
                      "text-",
                      "text-"
                    )}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Categories */}
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
          <div className="text-2xl mr-2">🛍️</div>
          All Categories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => {
            const config = categoryConfig[category.name] || {
              icon: "🌱",
              bgColor: "bg-gray-100",
              borderColor: "border-gray-200",
              textColor: "text-gray-700",
              hoverBg: "hover:bg-gray-200",
            };

            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.id, category.name)}
                className={`${config.bgColor} ${config.borderColor} ${config.hoverBg} border-2 rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4 transform transition-transform group-hover:scale-110 group-hover:animate-bounce">
                    {config.icon}
                  </div>
                  <h4
                    className={`font-semibold text-lg mb-2 ${config.textColor}`}
                  >
                    {category.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-center text-sm font-medium">
                    <span className={config.textColor}>Shop now</span>
                    <ChevronRight
                      className={`w-4 h-4 ml-1 transition-transform group-hover:translate-x-1 ${config.textColor.replace(
                        "text-",
                        "text-"
                      )}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View All Categories Button */}
      <div className="text-center mt-12">
        <button className="bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
          View All Categories
          <ChevronRight className="w-5 h-5 ml-2 inline" />
        </button>
      </div>

      {/* Products Modal with Blurred Background */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl pointer-events-auto">
            {/* Modal Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 transition"
            >
              <X className="w-8 h-8" />
            </button>

            <h3 className="text-3xl font-bold mb-6 text-green-700 text-center">
              Products in {selectedCategory?.name}
            </h3>

            {loadingProducts ? (
              <div className="text-center text-gray-500 py-12">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                No products found in this category.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link href={`/products/${product.id}`} key={product.id}>
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group">
                      <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden mb-4">
                        <img
                          src={
                            product.imageUrl ||
                            "https://via.placeholder.com/600x600.png?text=Product+Image"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                      <div className="font-bold text-lg mb-1 text-gray-800">
                        {product.name}
                      </div>
                      <div className="text-green-700 font-semibold mb-2">
                        MWK {product.discountedPrice ?? product.price}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {product.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmCategoriesSection;
