"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/providers";
import { ArrowLeft, Upload } from "lucide-react";
import { categoryService } from "@/lib/category-service";
import { getAuthToken } from "@/lib/auth-service";
import { compressImage, blobToFile } from "@/lib/image-compression";
import { productService, Product } from "@/lib/product-service";

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    skuCode: "",
    image: null as File | null,
    images: [] as File[],
  });
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [compressionProgress, setCompressionProgress] = useState<string>("");

  useEffect(() => {
    if (user && user.role === "SELLER") {
      fetchCategories();
      fetchProduct();
    } else {
      setCategoryLoading(false);
      setProductLoading(false);
    }
  }, [user, params.id]);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setCategoryLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      const token = await getAuthToken();
      const product: Product = await productService.getProductById(params.id as string);
      
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        categoryId: product.categoryId || "",
        skuCode: product.skuCode || "",
        image: null,
        images: [],
      });
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product. Please try again.");
    } finally {
      setProductLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      
      // Auto-generate SKU code from product name if name changes
      if (name === 'name') {
        const skuCode = value
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '_')
          .substring(0, 20);
        updatedData.skuCode = skuCode;
      }
      
      return updatedData;
    });
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleMultipleFileChange = (e) => {
    const files = Array.from(e.target.files) as File[];
    setFormData((prev) => ({ ...prev, images: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setCompressionProgress("Preparing images...");

    const { name, description, price, stock, categoryId, skuCode, image, images } = formData;

    if (!name || !description || !price || !stock || !categoryId || !skuCode) {
      setError("All fields except image are required.");
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", name);
      formDataToSend.append("description", description);
      formDataToSend.append("price", price);
      formDataToSend.append("stock", stock);
      formDataToSend.append("categoryId", categoryId);
      formDataToSend.append("skuCode", skuCode);
      
      // Compress and append primary image if provided
      if (image) {
        setCompressionProgress("Compressing primary image...");
        const compressedImageBlob = await compressImage(image);
        const compressedImageFile = blobToFile(compressedImageBlob, image.name);
        formDataToSend.append("images", compressedImageFile);
      }

      // Compress and append additional images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          setCompressionProgress(`Compressing image ${i + 1} of ${images.length}...`);
          const compressedBlob = await compressImage(images[i]);
          const compressedFile = blobToFile(compressedBlob, images[i].name);
          formDataToSend.append("images", compressedFile);
        }
      }

      const token = await getAuthToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product/${params.id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update product");
      }

      alert("Product updated successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Error updating product:", err);
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setIsLoading(false);
      setCompressionProgress("");
    }
  };

  if (productLoading || categoryLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!user || user.role !== "SELLER") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <p className="text-xl text-gray-600">Please sign in as a seller to edit products.</p>
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8">
          {/* Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter product name"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe your product"
              required
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price (MWK) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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

          {/* SKU Code */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              SKU Code *
            </label>
            <input
              type="text"
              name="skuCode"
              value={formData.skuCode}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="AUTO-GENERATED"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Auto-generated from product name</p>
          </div>

          {/* Primary Image */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Primary Image
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <Upload className="w-5 h-5" />
                <span>Choose Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {formData.image && (
                <span className="text-sm text-green-600 font-medium">
                  {formData.image.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave unchanged if you don&apos;t want to update the image</p>
          </div>

          {/* Additional Images */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Images
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <Upload className="w-5 h-5" />
                <span>Choose Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleFileChange}
                  className="hidden"
                />
              </label>
              {formData.images && formData.images.length > 0 && (
                <span className="text-sm text-green-600 font-medium">
                  {formData.images.length} image(s) selected
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload multiple images for better visibility</p>
          </div>

          {/* Compression Progress */}
          {compressionProgress && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">{compressionProgress}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-6 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Update Product"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
