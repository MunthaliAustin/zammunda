"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const ProductDetailsPage = ({ params }) => {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await res.json();
        console.log('Fetched product data:', data); // Debug: Check structure here
        // If data is nested (e.g., { data: { ... } }), uncomment the next line:
        // data = data.data || data;
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(true);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <p className="text-xl text-gray-600">Product not found or an error occurred.</p>
        <button
          onClick={() => router.back()}
          className="mt-6 flex items-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
        </button>
      </div>
    );
  }

  // Helper to safely render fields (stringify if object)
  const safeRender = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-green-700 hover:text-green-900 transition font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-200 rounded-2xl w-full aspect-square flex items-center justify-center overflow-hidden">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/600x600.png?text=Product+Image'}
                alt={safeRender(product.name)}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
          {/* Product Details */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{safeRender(product.name)}</h1>
            <p className="text-2xl text-green-600 font-semibold mb-6">MWK {safeRender(product.price)}</p>
            <div className="prose max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-4">{safeRender(product.description)}</p>
              <h3 className="text-2xl font-bold mt-8 mb-4">Product Information</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Category:</strong> {safeRender(product.category.name)}</li>
                <li><strong>Location:</strong> {safeRender(product.seller.city)}</li>
                <li><strong>Weight/Quantity:</strong> {safeRender(product.stock)}</li>
                <li><strong>Availability:</strong> {product.isActive ? 'In Stock' : 'Out of Stock'}</li>
              </ul>
            </div>
            <button className="mt-8 w-full bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transform transition-all duration-300 hover:scale-105 shadow-lg">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;