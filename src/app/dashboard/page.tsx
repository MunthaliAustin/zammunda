"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, Trash2, Edit, Check, X, TrendingUp, DollarSign, ShoppingCart, Users, AlertCircle, ArrowUpRight, Clock, ChevronRight, Eye, PlusCircle, Warehouse, PackageCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "../providers";
import Link from "next/link";
import { getAuthToken } from "@/lib/auth-service";
import { inventoryService, InventoryItem } from "@/lib/inventory-service";
import { formatQuantityWithUnit } from "@/lib/units";

const SellerDashboard = () => {
  const revenueStatuses = new Set(["CONFIRMED", "SHIPPED", "DELIVERED"]);
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    productsSold: 0,
    activeListings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  const getEffectivePrice = (product) => Number(product.discountedPrice ?? product.price ?? 0);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      router.push("/admin/dashboard");
      return;
    }

    if (user && user.role === "SELLER") {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let token;
      try {
        token = await getAuthToken();
      } catch (authError) {
        console.error("Failed to get auth token:", authError);
        alert("Please log in again.");
        router.push('/signin');
        return;
      }

      const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/order/seller-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!ordersRes.ok) {
        const errorText = await ordersRes.text();
        console.error("Orders API Error:", ordersRes.status, errorText);
        throw new Error(`Failed to fetch seller orders: ${ordersRes.status} ${errorText}`);
      }
      const ordersData = await ordersRes.json();
      const sellerOrders = Array.isArray(ordersData) ? ordersData : [];
      setOrders(sellerOrders);

      const productsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product/my-products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!productsRes.ok) {
        const errorText = await productsRes.text();
        console.error("Products API Error:", productsRes.status, errorText);
        throw new Error(`Failed to fetch products: ${productsRes.status} ${errorText}`);
      }
      const productsData = await productsRes.json();
      const sellerProducts = Array.isArray(productsData) ? productsData : [];
      setProducts(sellerProducts);

      try {
        const myInventory = await inventoryService.getMyInventory();
        setInventory(myInventory);
      } catch (inventoryError) {
        console.error("Error fetching inventory:", inventoryError);
      }

      const totalOrders = sellerOrders.length;
      const totalRevenue = sellerOrders
        .filter((order) => revenueStatuses.has(order.status))
        .reduce((sum, order) => sum + (Number(order.price) || 0), 0);
      const productsSold = sellerOrders
        .filter((order) => revenueStatuses.has(order.status))
        .reduce((sum, order) => sum + (Number(order.quantity) || 0), 0);
      const activeListings = sellerProducts.filter((product) => product.active !== false).length;

      setMetrics({ totalOrders, totalRevenue, productsSold, activeListings });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      alert("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOrderItem = async (orderId, itemId) => {
    setActionLoading((prev) => ({ ...prev, [`${orderId}-${itemId}`]: "confirm" }));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/confirm`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) {
        await fetchDashboardData();
        alert("Order item confirmed successfully!");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to confirm order item");
      }
    } catch (err) {
      console.error("Error confirming order item:", err);
      alert("An error occurred while confirming the order item.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`${orderId}-${itemId}`]: null }));
    }
  };

  const handleCancelOrderItem = async (orderId, itemId) => {
    if (!window.confirm("Are you sure you want to cancel this order item?")) return;
    setActionLoading((prev) => ({ ...prev, [`${orderId}-${itemId}`]: "cancel" }));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}/cancel`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) {
        await fetchDashboardData();
        alert("Order item cancelled successfully!");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to cancel order item");
      }
    } catch (err) {
      console.error("Error cancelling order item:", err);
      alert("An error occurred while cancelling the order item.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`${orderId}-${itemId}`]: null }));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    setActionLoading((prev) => ({ ...prev, [productId]: "delete" }));
    try {
      let token;
      try {
        token = await getAuthToken();
      } catch (authError) {
        console.error("Failed to get auth token:", authError);
        alert("Please log in again.");
        router.push('/signin');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product/${productId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok || res.status === 204) {
        await fetchDashboardData();
        alert("Product deleted successfully!");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("An error occurred while deleting the product.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: null }));
    }
  };

  const handleToggleListing = async (product) => {
    setActionLoading((prev) => ({ ...prev, [product.id]: product.active === false ? "activate" : "deactivate" }));
    try {
      let token;
      try {
        token = await getAuthToken();
      } catch (authError) {
        console.error("Failed to get auth token:", authError);
        alert("Please log in again.");
        router.push('/signin');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/product/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...product,
          active: product.active === false,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update listing status");
      }

      await fetchDashboardData();
    } catch (err) {
      console.error("Error updating listing status:", err);
      alert("Failed to update listing status.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [product.id]: null }));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f6f4ea_0%,#fcfbf7_45%,#eef5ee_100%)]">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "SELLER") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f6f4ea_0%,#fcfbf7_45%,#eef5ee_100%)] p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h2>
          <p className="text-gray-600 mb-6">Please sign in as a seller to view your dashboard.</p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-3 rounded-full font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
          >
            <Package className="w-5 h-5" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6f4ea_0%,#fcfbf7_45%,#eef5ee_100%)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-[32px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/70">Seller workspace</p>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">Seller Dashboard</h1>
            <p className="max-w-2xl text-base text-slate-600">Manage your catalogue, monitor inventory, and keep up with order activity from one clean workspace.</p>
          </div>
          <Link
            href="/seller/add-product"
            className="inline-flex items-center space-x-2 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-700 hover:to-emerald-800"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Product</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-slate-600">Total Orders</h3>
            <p className="text-3xl font-bold text-slate-900">{metrics.totalOrders}</p>
            <p className="mt-2 text-xs text-slate-500">All time orders</p>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-slate-600">Total Revenue</h3>
            <p className="text-3xl font-bold text-slate-900">MWK {metrics.totalRevenue.toLocaleString()}</p>
            <p className="mt-2 text-xs text-slate-500">From paid and fulfilled orders</p>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-slate-600">Products Sold</h3>
            <p className="text-3xl font-bold text-slate-900">{metrics.productsSold}</p>
            <p className="mt-2 text-xs text-slate-500">Selling units paid or fulfilled</p>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="mb-2 text-sm font-semibold text-slate-600">Active Listings</h3>
            <p className="text-3xl font-bold text-slate-900">{metrics.activeListings}</p>
            <p className="mt-2 text-xs text-slate-500">Currently listed</p>
          </div>
        </div>

        <div className="mb-8 rounded-[32px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Orders</p>
            <h2 className="text-2xl font-semibold text-slate-900">Orders for Your Products</h2>
          </div>
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">No orders for your products yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="p-3">Order #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Buyer</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Order Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/80">
                      <td className="p-3">{order.orderNumber}</td>
                      <td className="p-3">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-3">{order.buyerFirstName || order.buyerEmail || "N/A"}</td>
                      <td className="p-3">
                        <div className="flex flex-col space-y-1">
                          <span className="font-medium">{order.skuCode}</span>
                          <span className="text-sm text-gray-600">Quantity: {formatQuantityWithUnit(order.quantity, order.unitType, order.unitLabel)}</span>
                        </div>
                      </td>
                      <td className="p-3">MWK {(Number(order.price) || 0).toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                          order.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-800" :
                          order.status === "SHIPPED" ? "bg-blue-100 text-blue-800" :
                          order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                          order.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          {order.status === "PENDING" && (
                            <button
                              onClick={() => handleConfirmOrderItem(order.id, null)}
                              disabled={actionLoading[`confirm-${order.id}`]}
                              className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition"
                            >
                              <Check className="w-3 h-3" />
                              <span>Confirm</span>
                            </button>
                          )}
                          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                            <button
                              onClick={() => handleCancelOrderItem(order.id, null)}
                              disabled={actionLoading[`cancel-${order.id}`]}
                              className="flex items-center space-x-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition"
                            >
                              <X className="w-3 h-3" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mb-8 rounded-[32px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Warehouse className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Inventory Overview</h2>
                <p className="text-sm text-gray-600">Track stock levels for the units you actually sell</p>
              </div>
            </div>
            <Link
              href="/seller/inventory"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md inline-flex items-center space-x-2"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Manage All Inventory</span>
            </Link>
          </div>

          {inventory.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Warehouse className="w-10 h-10 text-gray-400" />
              </div>
              <p className="font-medium text-slate-600">No inventory records found</p>
              <p className="mt-2 text-sm text-slate-500">Add products to track their inventory</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.slice(0, 6).map((item, index) => (
                <div 
                  key={item.id || index}
                  className={`rounded-xl border-2 p-4 transition-all duration-300 ${
                    item.quantity <= 5 
                      ? 'border-red-200 bg-red-50 hover:border-red-300' 
                      : item.quantity <= 10
                        ? 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
                        : 'border-green-200 bg-green-50 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.skuCode}</h3>
                      <p className="text-xs text-gray-600">SKU Code</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.quantity <= 5 ? 'bg-red-100' : item.quantity <= 10 ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      {item.quantity <= 5 ? (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      ) : item.quantity <= 10 ? (
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      ) : (
                        <PackageCheck className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Stock Level</span>
                      <span className={`font-bold ${
                        item.quantity <= 5 ? 'text-red-600' : item.quantity <= 10 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {formatQuantityWithUnit(item.quantity, item.unitType, item.unitLabel)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          item.quantity <= 5 ? 'bg-red-500' : item.quantity <= 10 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, (item.quantity / 50) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-600">Seller: {item.sellerName || item.sellerEmail || 'N/A'}</span>
                    <Link
                      href={`/seller/inventory/${item.id}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {inventory.length > 6 && (
            <div className="mt-4 text-center">
              <Link
                href="/seller/inventory"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center space-x-1"
              >
                <span>View all {inventory.length} inventory items</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        <div className="rounded-[32px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Catalog</p>
              <h2 className="text-2xl font-semibold text-slate-900">Your Products</h2>
            </div>
            <Link
              href="/seller/add-product"
              className="rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-700"
            >
              Add New Product
            </Link>
          </div>
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">No products yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="p-3">Product</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Listing</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const matchingInventory = inventory.find((item) => item.skuCode === product.skuCode);
                    return (
                      <tr key={product.id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/80">
                        <td className="p-3 flex items-center space-x-3">
                          <img
                            src={product.imageUrl || "https://via.placeholder.com/50x50.png?text=Product"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex flex-col">
                            <span>{product.name}</span>
                            {(Number(product.discountPercentage) || 0) > 0 && (
                              <span className="text-xs font-medium text-red-600">
                                {Number(product.discountPercentage).toFixed(0)}% off
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-medium">MWK {getEffectivePrice(product).toFixed(2)}</span>
                            <span className="text-xs text-gray-500">{product.unitLabel || 'unit'}</span>
                            {(Number(product.discountPercentage) || 0) > 0 && (
                              <span className="text-xs text-gray-500 line-through">MWK {Number(product.price).toFixed(2)}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.active === false ? "bg-gray-100 text-gray-700" : "bg-green-100 text-green-800"
                          }`}>
                            {product.active === false ? "Inactive" : "Active"}
                          </span>
                        </td>
                        <td className="p-3">{matchingInventory ? formatQuantityWithUnit(matchingInventory.quantity, matchingInventory.unitType, matchingInventory.unitLabel) : `0 ${product.unitLabel || 'unit'}`}</td>
                        <td className="p-3 flex space-x-2">
                          <Link
                            href={`/seller/edit-product/${product.id}`}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition"
                          >
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </Link>
                          <button
                            onClick={() => handleToggleListing(product)}
                            disabled={!!actionLoading[product.id]}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition disabled:opacity-50 ${
                              product.active === false
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-gray-600 text-white hover:bg-gray-700"
                            }`}
                          >
                            <span>{product.active === false ? "Activate" : "Deactivate"}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={actionLoading[product.id] === "delete"}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
                          >
                            {actionLoading[product.id] === "delete" ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
