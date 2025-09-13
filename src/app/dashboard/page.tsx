"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, Trash2, Edit, Check, X } from "lucide-react";
import { useAuth } from "../providers";
import Link from "next/link";

const SellerDashboard = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    productsSold: 0,
    activeListings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    if (user && user.role === "SELLER") {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch orders containing seller's products
      const ordersRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/seller-orders`, {
  credentials: "include",
});
      if (!ordersRes.ok) throw new Error("Failed to fetch seller orders");
      const ordersData = await ordersRes.json();
      setOrders(ordersData.data || []);

      // Fetch products
      const productsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products/my-products`, {
        credentials: "include",
      });
      if (!productsRes.ok) throw new Error("Failed to fetch products");
      const productsData = await productsRes.json();
      setProducts(productsData);

      // Calculate metrics based on seller's items only
      const totalOrders = ordersData.data.length;
      const totalRevenue = ordersData.data
        .filter((order) => order.status === "DELIVERED")
        .reduce((sum, order) => {
          const sellerSubtotal = order.orderItems.reduce((s, item) => s + item.subtotal, 0);
          return sum + sellerSubtotal;
        }, 0);
      const productsSold = ordersData.data
        .filter((order) => order.status === "DELIVERED")
        .reduce((sum, order) => {
          const sellerQuantity = order.orderItems.reduce((s, item) => s + item.quantity, 0);
          return sum + sellerQuantity;
        }, 0);
      const activeListings = productsData.filter((product) => product.isActive).length;

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
        body: JSON.stringify({ itemId }), // Pass itemId for product-specific confirm
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
        body: JSON.stringify({ itemId }), // Pass itemId for product-specific cancel
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!user || user.role !== "SELLER") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
        <p className="text-xl text-gray-600">Please sign in as a seller to view your dashboard.</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 flex items-center px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
        >
          <Package className="w-5 h-5 mr-2" /> Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Seller Dashboard</h1>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
            <p className="text-3xl font-bold text-green-600">{metrics.totalOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-600">MWK {metrics.totalRevenue}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Products Sold</h3>
            <p className="text-3xl font-bold text-green-600">{metrics.productsSold}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700">Active Listings</h3>
            <p className="text-3xl font-bold text-green-600">{metrics.activeListings}</p>
          </div>
        </div>

        {/* Orders Section - Now shows all orders with seller's products */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Orders for Your Products</h2>
          {orders.length === 0 ? (
            <p className="text-gray-600">No orders for your products yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-600">
                    <th className="p-3">Order #</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Buyer</th>
                    <th className="p-3">Your Products in Order</th>
                    <th className="p-3">Order Total</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t">
                      <td className="p-3">{order.orderNumber}</td>
                      <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">{order.user?.first_name || order.user?.email || "N/A"}</td>
                      <td className="p-3">
                        <ul className="space-y-2">
                          {order.orderItems.map((item) => (
                            <li key={item.id} className="flex flex-col space-y-1">
                              <span className="font-medium">{item.productName} x {item.quantity}</span>
                              <span className="text-sm text-gray-600">Subtotal: MWK {item.subtotal}</span>
                              <span className="text-xs text-gray-500">Seller: {item.sellerName} | Phone: {item.sellerPhone}</span>
                              <div className="flex space-x-2 mt-1">
                                {order.status === "PENDING" && (
                                  <button
                                    onClick={() => handleConfirmOrderItem(order.id, item.id)}
                                    disabled={actionLoading[`${order.id}-${item.id}`] === "confirm"}
                                    className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 transition"
                                  >
                                    {actionLoading[`${order.id}-${item.id}`] === "confirm" ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                        <span>Confirm</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Confirm</span>
                                      </>
                                    )}
                                  </button>
                                )}
                                {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                                  <button
                                    onClick={() => handleCancelOrderItem(order.id, item.id)}
                                    disabled={actionLoading[`${order.id}-${item.id}`] === "cancel"}
                                    className="flex items-center space-x-1 px-2 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition"
                                  >
                                    {actionLoading[`${order.id}-${item.id}`] === "cancel" ? (
                                      <>
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                        <span>Cancel</span>
                                      </>
                                    ) : (
                                      <>
                                        <X className="w-3 h-3" />
                                        <span>Cancel</span>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="p-3">MWK {order.totalAmount}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === "DELIVERED"
                              ? "bg-green-100 text-green-800"
                              : order.status === "CANCELLED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => router.push(`/orders/${order.id}`)}
                          className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Your Products</h2>
            <Link
              href="/seller/add-product"
              className="px-4 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
            >
              Add New Product
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="text-gray-600">No products yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-600">
                    <th className="p-3">Product</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Stock</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-t">
                      <td className="p-3 flex items-center space-x-3">
                        <img
                          src={product.imageUrl || "https://via.placeholder.com/50x50.png?text=Product"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <span>{product.name}</span>
                      </td>
                      <td className="p-3">MWK {product.price}</td>
                      <td className="p-3">{product.stock}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 flex space-x-2">
                        <Link
                          href={`/seller/edit-product/${product.id}`}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium hover:bg-blue-700 transition"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </Link>
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
                  ))}
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