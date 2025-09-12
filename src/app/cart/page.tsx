"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../providers";
import { useCart } from "../providers";

const CartPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, cartCount, updateCartItem, removeCartItem, clearCart, fetchCart } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  if (!user || user.role !== "BUYER") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <p className="text-xl text-gray-600">Please sign in as a buyer to view your cart.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 flex items-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Go Home
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    if (!deliveryAddress || !contactPhone) {
      alert("Please provide delivery address and contact phone.");
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryAddress, contactPhone, notes }),
      });
      if (res.ok) {
        await clearCart();
        router.push("/my-orders");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to place order");
      }
    } catch (err) {
      console.error("Error placing order:", err);
      alert("An error occurred while placing the order.");
    } finally {
      setPlacingOrder(false);
    }
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
                    src={item.product.imageUrl || "https://via.placeholder.com/100x100.png?text=Product"}
                    alt={item.product.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold">{item.product.name}</h2>
                    <p className="text-green-600 font-medium">MWK {item.price} each</p>
                    <p className="text-gray-600">Subtotal: MWK {(item.price * item.quantity).toFixed(2)}</p>
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
              <p className="text-2xl font-bold">Total: MWK {cart.totalAmount.toFixed(2)}</p>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-4">Checkout Details</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Delivery Address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="tel"
                  placeholder="Contact Phone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <textarea
                  placeholder="Notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="mt-6 w-full bg-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-green-700 transform transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;