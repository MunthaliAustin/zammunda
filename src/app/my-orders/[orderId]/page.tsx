"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Truck,
  MapPin,
  Phone,
  User,
  FileText,
  Download,
  Share2
} from "lucide-react";
import { useAuth } from "@/app/providers";

type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

const OrderDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (user && user.role === "BUYER" && params.orderId) {
      fetchOrderDetails();
    }
  }, [user, params.orderId]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/${params.orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });
      
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        throw new Error("Failed to fetch order details");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      alert("Failed to load order details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    setCancelling(true);
    try {
      const token = localStorage.getItem('auth-token');
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/${order.id}/cancel`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: "include",
      });
      
      if (res.ok) {
        await fetchOrderDetails();
        alert("Order cancelled successfully!");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("An error occurred while cancelling the order.");
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-5 h-5" />;
      case 'CONFIRMED': return <CheckCircle className="w-5 h-5" />;
      case 'SHIPPED': return <Truck className="w-5 h-5" />;
      case 'DELIVERED': return <Package className="w-5 h-5" />;
      case 'CANCELLED': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DELIVERED': return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push("/my-orders")}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to My Orders</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.push("/my-orders")}
          className="mb-6 inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </button>

        {/* Order Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-3xl p-8 mb-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Package className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
                <div className="flex items-center space-x-2 text-blue-100 text-sm mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span>{order.status}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Total Amount</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">MWK {order.price?.toLocaleString()}</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Package className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Quantity</span>
            </div>
            <div className="text-2xl font-bold text-green-700">{order.quantity} units</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">SKU Code</span>
            </div>
            <div className="text-lg font-bold text-purple-700 truncate">{order.skuCode}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Delivery Information */}
          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900">Delivery Address</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {order.deliveryAddress || <span className="text-gray-400 italic">Not provided</span>}
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
            <div className="flex items-center space-x-2 mb-4">
              <Phone className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">Contact Phone</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {order.contactPhone || <span className="text-gray-400 italic">Not provided</span>}
            </p>
          </div>
        </div>

        {/* Seller & Buyer Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Seller Information */}
          <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900">Seller Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Seller Name</p>
                <p className="font-semibold text-gray-900">{order.sellerName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Seller ID</p>
                <p className="font-semibold text-gray-900 truncate">{order.sellerId || 'N/A'}</p>
              </div>
              {order.sellerEmail && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Seller Email</p>
                  <p className="font-semibold text-gray-900">{order.sellerEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Buyer Information */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center space-x-2 mb-4">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Buyer Information</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Email</p>
                <p className="font-semibold text-gray-900">{order.buyerEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="font-semibold text-gray-900">
                  {order.buyerFirstName} {order.buyerLastName || ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Notes */}
        {order.orderNotes && (
          <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200 mb-8">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-gray-900">Order Notes</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">{order.orderNotes}</p>
          </div>
        )}

        {/* Order Timeline */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Order Timeline</h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-600">Placed</span>
              <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`} />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                ['CONFIRMED', 'SHIPPED', 'DELIVERED'].includes(order.status) 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-600">Confirmed</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${['SHIPPED', 'DELIVERED'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`} />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                ['SHIPPED', 'DELIVERED'].includes(order.status) 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                <Truck className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-600">Shipped</span>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className={`h-full ${['DELIVERED'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'}`} />
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                order.status === 'DELIVERED' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-400'
              }`}>
                <Package className="w-6 h-6" />
              </div>
              <span className="text-sm font-medium text-gray-600">Delivered</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <button
              onClick={async () => {
                await handleCancelOrder();
                router.push("/my-orders");
              }}
              disabled={cancelling}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
          <button
            onClick={() => router.push("/my-orders")}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-4 rounded-xl font-semibold transition-all shadow-md"
          >
            Back to Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
