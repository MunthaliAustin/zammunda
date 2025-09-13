"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers";
import { ArrowLeft, Upload } from "lucide-react";

const AddProductPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    image: null,
  });
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(true);

  useEffect(() => {
    if (user && user.role === "SELLER") {
      fetchCategories();
    } else {
      setCategoryLoading(false);
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/categories`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { name, description, price, stock, categoryId, image } = formData;

    if (!name || !description || !price || !stock || !categoryId) {
      setError("All fields except image are required.");
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("name", name);
    formDataToSend.append("description", description);
    formDataToSend.append("price", price);
    formDataToSend.append("stock", stock);
    formDataToSend.append("categoryId", categoryId);
    if (image) {
      formDataToSend.append("image", image);
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products`, {
        method: "POST",
        credentials: "include",
        body: formDataToSend,
      });

      if (res.ok) {
        router.push("/dashboard");
        alert("Product created successfully!");
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to create product.");
      }
    } catch (err) {
      console.error("Error creating product:", err);
      setError("An error occurred while creating the product.");
    } finally {
      setIsLoading(false);
    }
  };

  if (categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading categories...</p>
      </div>
    );
  }

  if (!user || user.role !== "SELLER") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <p className="text-xl text-gray-600">Please sign in as a seller to add products.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 flex items-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-green-700 hover:text-green-900 transition font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (MWK)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="Enter stock quantity"
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center w-full px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">
                  {formData.image ? formData.image.name : "Upload an image (JPG, PNG, WebP)"}
                </span>
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transform transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Product</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductPage;