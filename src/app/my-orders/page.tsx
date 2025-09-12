"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import { useAuth } from "../providers";

const MyOrdersPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  useEffect(() => {
    if (user && user.role === "BUYER") {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/my-orders`, {
        credentials: "include",
      });
      if (res.ok) {
        const { data } = await res.json();
        setOrders(data);
      } else {
        throw new Error("Failed to fetch orders");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      alert("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    setCancellingOrderId(orderId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/cancel`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        await fetchOrders(); // Refresh orders list
        alert("Order cancelled successfully!");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("An error occurred while cancelling the order.");
    } finally {
      setCancellingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (!user || user.role !== "BUYER") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <p className="text-xl text-gray-600">Please sign in as a buyer to view your orders.</p>
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
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-green-700 hover:text-green-900 transition font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <p className="text-center text-gray-600">You have no orders yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Order #{order.orderNumber}</h2>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                      order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order.status}
                    </span>
                    {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        {cancellingOrderId === order.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Cancelling...</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            <span>Cancel Order</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mt-2">Total: MWK {order.totalAmount}</p>
                <p className="text-gray-600">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <div className="mt-4">
                  <h3 className="font-medium">Items:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {order.orderItems.map((item) => (
                      <li key={item.id}>
                        {item.productName} x {item.quantity} - MWK {item.subtotal}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-4 text-gray-600">Delivery Address: {order.deliveryAddress}</p>
                <p className="text-gray-600">Contact Phone: {order.contactPhone}</p>
                {order.notes && <p className="text-gray-600">Notes: {order.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;