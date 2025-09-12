"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { useCart } from '@/app/providers';// Adjust path as needed

const ProductDetailsPage = ({ params }) => {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart } = useCart();

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

  const handleAddToCart = async () => {
    if (!product || !product.isActive) return;

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      // Reset quantity and show success (you can replace alert with a toast notification)
      setQuantity(1);
      alert('Product added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      alert('Failed to add product to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

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
                <li><strong>Category:</strong> {safeRender(product.category?.name)}</li>
                <li><strong>Location:</strong> {safeRender(product.seller?.city)}</li>
                <li><strong>Weight/Quantity:</strong> {safeRender(product.stock)}</li>
                <li><strong>Availability:</strong> {product.isActive ? 'In Stock' : 'Out of Stock'}</li>
              </ul>
            </div>
            {product.isActive ? (
              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={addingToCart}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                      className="w-16 text-center border-0 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={addingToCart}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">Available: {product.stock}</span>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart || quantity > product.stock}
                  className="w-full bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transform transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {addingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 8M7 13l1.5 8m0 0h10m0 0l-1.5-8m1.5 8L21 13" />
                      </svg>
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mt-8">
                <button 
                  disabled
                  className="w-full bg-gray-400 text-white px-8 py-4 rounded-full font-semibold text-lg cursor-not-allowed"
                >
                  Out of Stock
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;