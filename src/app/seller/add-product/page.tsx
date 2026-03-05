"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers";
import { ArrowLeft, Upload } from "lucide-react";
import { categoryService } from "@/lib/category-service";
import { getAuthToken } from "@/lib/auth-service";
import { compressImage, blobToFile } from "@/lib/image-compression";

const AddProductPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    skuCode: "",
    image: null,
    images: [],
  });
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [compressionProgress, setCompressionProgress] = useState<string>("");

  useEffect(() => {
    if (user && user.role === "SELLER") {
      fetchCategories();
    } else {
      setCategoryLoading(false);
    }
  }, [user]);

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
    const files = Array.from(e.target.files);
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
        const compressedBlob = await compressImage(image, 0.7); // 70% quality
        const compressedFile = blobToFile(compressedBlob, image.name);
        formDataToSend.append("image", compressedFile);
        console.log(`Primary image compressed: ${Math.round(image.size / 1024)}KB → ${Math.round(compressedFile.size / 1024)}KB`);
      }
      
      // Compress and append additional images if provided
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          setCompressionProgress(`Compressing image ${i + 1} of ${images.length}...`);
          const img = images[i];
          const compressedBlob = await compressImage(img, 0.7); // 70% quality
          const compressedFile = blobToFile(compressedBlob, `compressed_${img.name}`);
          formDataToSend.append("images", compressedFile);
          console.log(`Image ${i + 1} compressed: ${Math.round(img.size / 1024)}KB → ${Math.round(compressedFile.size / 1024)}KB`);
        }
      }
      
      setCompressionProgress("Uploading product...");

      console.log("Creating product with data:", { name, description, price, stock, categoryId });
      console.log("FormData entries:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }

      const token = await getAuthToken();
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log('Response status:', res.status);
      console.log('Response OK:', res.ok);
      console.log('Response headers:', res.headers);

      if (res.ok) {
        const successData = await res.json();
        console.log('Success response:', successData);
        // Product created successfully
        alert("Product created successfully!");
        router.push("/"); // Redirect to home page (products listing)
      } else {
        // Handle error response
        const errorText = await res.text();
        console.error('Error response:', errorText);
        
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('Could not parse error response as JSON');
        }
        
        setError((errorData as any).message || `Failed to create product: ${res.status} ${res.statusText}`);
      }
    } catch (err) {
      console.error("Error creating product:", err);
      if (err.name === 'AbortError') {
        setError("Request timed out. The product may have been created successfully. Please check your products list.");
      } else {
        setError("An error occurred while creating the product.");
      }
    } finally {
      setIsLoading(false);
      setCompressionProgress("");
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
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center text-green-700 hover:text-green-900 transition font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">Add New Product</h1>

        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {compressionProgress && (
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="font-medium">{compressionProgress}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">SKU Code</label>
            <input
              type="text"
              name="skuCode"
              value={formData.skuCode}
              onChange={handleInputChange}
              placeholder="Auto-generated from product name"
              className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              readOnly
              required
            />
            <p className="text-xs text-gray-500 mt-0.5">Automatically generated from product name</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description"
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Price (MWK)</label>
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
                  {formData.image ? formData.image.name : "Upload primary image (JPG, PNG, WebP)"}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Images (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center w-full px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">
                  {formData.images.length > 0 
                    ? `${formData.images.length} image(s) selected` 
                    : "Upload additional images (JPG, PNG, WebP)"}
                </span>
                <input
                  type="file"
                  name="images"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleMultipleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Preview ${index}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>
            )}
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