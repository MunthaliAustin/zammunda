"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/app/providers";
import { ArrowLeft, Upload } from "lucide-react";
import { categoryService } from "@/lib/category-service";
import { compressImage, blobToFile } from "@/lib/image-compression";
import { productService, Product } from "@/lib/product-service";
import { inventoryService } from "@/lib/inventory-service";

const MALAWI_CITIES = ["Lilongwe", "Blantyre", "Mzuzu"] as const;

type MalawiCity = typeof MALAWI_CITIES[number];

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discountPercentage: "",
    stock: "",
    active: true,
    categoryId: "",
    city: "Lilongwe" as MalawiCity,
    skuCode: "",
    image: null as File | null,
    images: [] as File[],
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [compressionProgress, setCompressionProgress] = useState<string>("");
  const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const primaryImagePreviewRef = useRef<string | null>(null);
  const additionalImagePreviewRefs = useRef<string[]>([]);
  const primaryImageFileRef = useRef<File | null>(null);
  const additionalImageFilesRef = useRef<File[]>([]);

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
      const product: Product = await productService.getProductById(params.id as string);
      const inventory = product.sellerId
        ? await inventoryService.getInventoryBySkuCodeAndSellerId(product.skuCode, product.sellerId)
        : await inventoryService.getInventoryBySkuCode(product.skuCode);

      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        discountPercentage: product.discountPercentage?.toString() || "",
        stock: inventory?.quantity?.toString() || "",
        active: product.active ?? true,
        categoryId: product.categoryId || "",
        city: (product.city as MalawiCity) || "Lilongwe",
        skuCode: product.skuCode || "",
        image: null,
        images: [],
      });
      primaryImageFileRef.current = null;
      additionalImageFilesRef.current = [];
      setPrimaryImagePreview(null);
      setAdditionalImagePreviews([]);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product. Please try again.");
    } finally {
      setProductLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };
      if (name === "name") {
        updatedData.skuCode = value
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "_")
          .substring(0, 20);
      }
      return updatedData;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    primaryImageFileRef.current = file;
    if (primaryImagePreviewRef.current) {
      URL.revokeObjectURL(primaryImagePreviewRef.current);
      primaryImagePreviewRef.current = null;
    }
    const previewUrl = file ? URL.createObjectURL(file) : null;
    primaryImagePreviewRef.current = previewUrl;
    setPrimaryImagePreview(previewUrl);
    setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];
    additionalImageFilesRef.current = files;
    additionalImagePreviewRefs.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    additionalImagePreviewRefs.current = previewUrls;
    setAdditionalImagePreviews(previewUrls);
    setFormData((prev) => ({ ...prev, images: files }));
  };

  useEffect(() => {
    return () => {
      if (primaryImagePreviewRef.current) {
        URL.revokeObjectURL(primaryImagePreviewRef.current);
      }
      additionalImagePreviewRefs.current.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setCompressionProgress("Preparing images...");

    const { name, description, price, stock, categoryId, city, skuCode, discountPercentage, active } = formData;
    const image = primaryImageFileRef.current;
    const images = additionalImageFilesRef.current;

    if (!name || !description || !price || !stock || !categoryId || !city || !skuCode) {
      setError("All fields except image are required.");
      setIsLoading(false);
      return;
    }

    try {
      await productService.updateProduct(params.id as string, {
        id: params.id as string,
        name,
        description,
        price: Number(price),
        discountPercentage: Number(discountPercentage || 0),
        active,
        stock: Number(stock),
        categoryId,
        city,
        skuCode,
      } as Product);

      await inventoryService.updateInventory(skuCode, Number(stock));

      if (image || images.length > 0) {
        let compressedPrimaryImage: File | undefined;
        const compressedAdditionalImages: File[] = [];

        if (image) {
          setCompressionProgress("Compressing primary image...");
          const compressedImageBlob = await compressImage(image);
          compressedPrimaryImage = blobToFile(compressedImageBlob, image.name);
        }

        for (let i = 0; i < images.length; i++) {
          setCompressionProgress(`Compressing image ${i + 1} of ${images.length}...`);
          const compressedBlob = await compressImage(images[i]);
          compressedAdditionalImages.push(blobToFile(compressedBlob, images[i].name));
        }

        setCompressionProgress("Uploading images...");
        await productService.updateProductImages(params.id as string, compressedPrimaryImage, compressedAdditionalImages);
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
        <button onClick={() => router.push("/")} className="mt-6 flex items-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition">
          <ArrowLeft className="w-5 h-5 mr-2" /> Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center space-x-4 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-200 transition">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-8">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Enter product name" required />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Describe your product" required />
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (MWK) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} step="0.01" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0.00" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
              <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} step="0.01" min="0" max="100" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity *</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="0" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product City *</label>
              <select name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                {MALAWI_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Listing Status</label>
              <p className="text-xs text-gray-500">Inactive listings are hidden from buyers.</p>
            </div>
            <button type="button" onClick={() => setFormData((prev) => ({ ...prev, active: !prev.active }))} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${formData.active ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>
              {formData.active ? "Active" : "Inactive"}
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">SKU Code *</label>
            <input type="text" name="skuCode" value={formData.skuCode} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="AUTO-GENERATED" required />
            <p className="text-xs text-gray-500 mt-1">Auto-generated from product name</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center w-full px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">{formData.image ? formData.image.name : "Upload primary image (JPG, PNG, WebP)"}</span>
                <input type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            {primaryImagePreview && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Primary image selected</p>
                <div className="relative inline-block">
                  <img src={primaryImagePreview} alt="Primary preview" className="w-32 h-32 object-cover rounded-xl border border-gray-200" />
                </div>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Images (Optional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center w-full px-4 py-6 bg-gray-50 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer hover:bg-gray-100 transition">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">{formData.images.length > 0 ? `${formData.images.length} image(s) selected` : "Upload additional images (JPG, PNG, WebP)"}</span>
                <input type="file" name="images" accept="image/jpeg,image/png,image/webp" multiple onChange={handleMultipleFileChange} className="hidden" />
              </label>
            </div>
            {additionalImagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {additionalImagePreviews.map((previewUrl, index) => (
                  <div key={index} className="relative group">
                    <img src={previewUrl} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded-lg" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {compressionProgress && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">{compressionProgress}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button type="submit" disabled={isLoading} className="flex-1 py-3 px-6 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? "Updating..." : "Update Product"}
            </button>
            <button type="button" onClick={() => router.back()} className="px-6 py-3 bg-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-400 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductPage;
