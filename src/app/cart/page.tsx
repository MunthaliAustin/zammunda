"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useAuth, useCart } from "../providers";
import { formatPricePerUnit, formatQuantityWithUnit } from "@/lib/units";

const CartPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartCount, updateCartItem, removeCartItem, clearCart } = useCart();

  const displayName = user?.first_name?.trim() || "Customer";
  const userNameParts = useMemo(() => displayName.split(/\s+/).filter(Boolean), [displayName]);
  const buyerFirstName = userNameParts[0] || "Customer";
  const buyerLastName = userNameParts.slice(1).join(" ") || "";

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <p className="text-xl text-gray-600">Please sign in to view your cart.</p>
        <button
          onClick={() => router.push(`/signin?redirect=${encodeURIComponent('/cart')}`)}
          className="mt-6 flex items-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Sign In
        </button>
      </div>
    );
  }

  const handleProceedToCheckout = async () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-green-700 hover:text-green-900 transition font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart ({cartCount} items)</h1>

        {cart.items.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            <div className="space-y-6">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                  <img
                    src={item.product.imageUrl || item.product.image || "https://via.placeholder.com/100x100.png?text=Product"}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{item.product.name}</h2>
                    <p className="text-green-600 font-medium">{formatPricePerUnit(item.price, item.product.unitType, item.product.unitLabel)}</p>
                    <p className="text-xs text-gray-500">{formatQuantityWithUnit(item.quantity, item.product.unitType, item.product.unitLabel)}</p>
                    <p className="text-gray-600">Subtotal: MWK {item.price * item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item.id, item.quantity + 1)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeCartItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-8 text-right">
              <p className="text-2xl font-bold">Total: MWK {cart.totalAmount}</p>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="mt-12 w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-green-700 hover:to-green-800 transform transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Proceed to Checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
