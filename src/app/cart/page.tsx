"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingCart, CreditCard, Package, AlertCircle } from "lucide-react";
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

  // Fetch cart when page loads or user changes
  useEffect(() => {
    if (user && user.role === "BUYER") {
      fetchCart();
    }
  }, [user]);

  if (!user || user.role !== "BUYER") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50 p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Please sign in as a buyer to view your cart.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Home</span>
          </button>
        </div>
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
      const token = localStorage.getItem('auth-token');
      
      // Place separate order for each cart item (since each may have different seller)
      for (const item of cart.items) {
        if (!item.sellerId) {
          alert(`Seller information missing for ${item.product.name}`);
          setPlacingOrder(false);
          return;
        }
        
        // Get user info from token
        const payload = JSON.parse(atob(token!.split('.')[1]));
        const userId = payload.sub;
        const userEmail = payload.email;
        const userName = payload.given_name || payload.name || payload.preferred_username || '';
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: "include",
          body: JSON.stringify({ 
            skuCode: item.skuCode,
            price: item.price,
            quantity: item.quantity,
            sellerId: item.sellerId,
            userId: userId,
            userDetails: {
              email: userEmail,
              firstName: userName,
              lastName: ''
            },
            deliveryAddress,
            contactPhone,
            notes
          }),
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `Failed to place order for ${item.product.name}`);
        }
      }
      
      // All orders placed successfully
      await clearCart();
      router.push("/my-orders");
    } catch (err) {
      console.error("Error placing order:", err);
      alert("An error occurred while placing the order.");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-sm text-gray-600 mt-1">{cartCount} item{cartCount !== 1 ? 's' : ''} in your cart</p>
              </div>
            </div>
            {cart.items.length > 0 && (
              <button
                onClick={async () => {
                  if (window.confirm('Clear entire cart?')) {
                    await clearCart();
                  }
                }}
                className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some products to get started!</p>
            <button
              onClick={() => router.push("/")}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Continue Shopping</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Items ({cart.items.length})</h2>
              {cart.items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 hover:shadow-md transition-all duration-300"
                >
                  <img
                    src={item.product.image || "https://via.placeholder.com/150x150.png?text=Product"}
                    alt={item.product.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border-2 border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 truncate">{item.product.name}</h2>
                    <p className="text-green-600 font-bold text-lg mt-2">MWK {item.price.toLocaleString()}</p>
                    <p className="text-gray-600 text-sm">Subtotal: <span className="font-semibold text-gray-900">MWK {(item.price * item.quantity).toLocaleString()}</span></p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => updateCartItem(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all"
                      >
                        <Minus className="w-4 h-4 text-gray-600" />
                      </button>
                      <span className="w-12 text-center font-semibold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItem(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all"
                      >
                        <Plus className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeCartItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Remove item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Section */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 sticky top-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
                </div>

                {/* Order Summary */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cart.items.length} items)</span>
                      <span className="font-medium text-gray-900">MWK {cart.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total</span>
                      <span className="text-2xl font-bold text-green-600">MWK {cart.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+265 XX XXX XXXX"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Notes <span className="text-xs text-gray-500">(optional)</span>
                    </label>
                    <textarea
                      placeholder="Any special instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || !deliveryAddress || !contactPhone}
                  className="mt-6 w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {placingOrder ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>Place Order</span>
                    </>
                  )}
                </button>

                {(!deliveryAddress || !contactPhone) && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <p className="text-xs text-yellow-700">Please fill in delivery address and contact phone to place your order.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;