"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../providers";
import { ArrowLeft, Upload } from "lucide-react";
import { categoryService } from "@/lib/category-service";
import { getAuthToken } from "@/lib/auth-service";
import { compressImage, blobToFile } from "@/lib/image-compression";
import { SELLING_UNIT_OPTIONS, SellingUnitType, getDefaultUnitLabel } from "@/lib/units";

const MALAWI_CITIES = ["Lilongwe", "Blantyre", "Mzuzu"] as const;

type MalawiCity = typeof MALAWI_CITIES[number];

const AddProductPage = () => {
  const router = useRouter();
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
    unitType: "KG" as SellingUnitType,
    unitLabel: "kg",
    skuCode: "",
    image: null as File | null,
    images: [] as File[],
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(true);
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

      if (name === "unitType") {
        updatedData.unitLabel = getDefaultUnitLabel(value);
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
    const files = Array.from(e.target.files ?? []);
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

    const { name, description, price, stock, categoryId, city, unitType, unitLabel, skuCode } = formData;
    const image = primaryImageFileRef.current;
    const images = additionalImageFilesRef.current;

    if (!name || !description || !price || !stock || !categoryId || !city || !unitType || !unitLabel || !skuCode) {
      setError("All fields except image are required.");
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", name);
      formDataToSend.append("description", description);
      formDataToSend.append("price", price);
      formDataToSend.append("discountPercentage", formData.discountPercentage || "0");
      formDataToSend.append("stock", stock);
      formDataToSend.append("active", String(formData.active));
      formDataToSend.append("categoryId", categoryId);
      formDataToSend.append("city", city);
      formDataToSend.append("unitType", unitType);
      formDataToSend.append("unitLabel", unitLabel);
      formDataToSend.append("skuCode", skuCode);

      if (image) {
        setCompressionProgress("Compressing primary image...");
        const compressedBlob = await compressImage(image, 0.7);
        const compressedFile = blobToFile(compressedBlob, image.name);
        formDataToSend.append("image", compressedFile);
      }

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          setCompressionProgress(`Compressing image ${i + 1} of ${images.length}...`);
          const img = images[i];
          const compressedBlob = await compressImage(img, 0.7);
          const compressedFile = blobToFile(compressedBlob, `compressed_${img.name}`);
          formDataToSend.append("images", compressedFile);
        }
      }

      setCompressionProgress("Uploading product...");

      const token = await getAuthToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        await res.json();
        alert("Product created successfully!");
        router.push("/");
      } else {
        const errorText = await res.text();
        let errorMessage = `Failed to create product: ${res.status} ${res.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          if (errorText.trim()) {
            errorMessage = errorText;
          }
        }
        setError(errorMessage);
      }
    } catch (err: any) {
      console.error("Error creating product:", err);
      if (err?.name === "AbortError") {
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
          className="mb-4 inline-flex items-center space-x-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
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
            <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter product name" className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">SKU Code</label>
            <input type="text" name="skuCode" value={formData.skuCode} onChange={handleInputChange} placeholder="Auto-generated from product name" className="w-full px-3 py-2 border border-gray-300 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500" readOnly required />
            <p className="text-xs text-gray-500 mt-0.5">Automatically generated from product name</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter product description" className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Price (MWK)</label>
            <input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="Enter price" className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" min="0" step="0.01" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Discount (%)</label>
            <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} placeholder="0" className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" min="0" max="100" step="0.01" />
            <p className="text-xs text-gray-500 mt-0.5">Optional percentage discount for this listing</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Units</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} placeholder="Enter how many selling units you have" className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" min="0" required />
            <p className="text-xs text-gray-500 mt-0.5">For example: `70` if you have 70 bags, or `120` if you sell by kg and have 120kg available.</p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Listing Status</label>
              <p className="text-xs text-gray-500">Inactive listings stay visible to you, but buyers won&apos;t see them.</p>
            </div>
            <button type="button" onClick={() => setFormData((prev) => ({ ...prev, active: !prev.active }))} className={`px-4 py-2 rounded-full text-sm font-semibold transition ${formData.active ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"}`}>
              {formData.active ? "Active" : "Inactive"}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product City</label>
            <select name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" required>
              {MALAWI_CITIES.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-0.5">This city is used to calculate shipping during checkout.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Unit</label>
              <select name="unitType" value={formData.unitType} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" required>
                {SELLING_UNIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Label</label>
              <input type="text" name="unitLabel" value={formData.unitLabel} onChange={handleInputChange} placeholder="e.g. 50kg bag" className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" required />
              <p className="text-xs text-gray-500 mt-0.5">This is what buyers will see, for example `kg`, `piece`, or `50kg bag`.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500" required>
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image (Optional)</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Images (Optional)</label>
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
                  <div key={index} className="relative">
                    <img src={previewUrl} alt={`Preview ${index}`} className="w-full h-20 object-cover rounded-lg" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="w-full bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transform transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2">
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
