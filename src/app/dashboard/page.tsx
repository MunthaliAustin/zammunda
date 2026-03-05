"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Package, Trash2, Edit, TrendingUp, DollarSign, ShoppingCart, Users, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, ChevronRight, Eye, PlusCircle, Warehouse, PackageCheck, AlertTriangle } from "lucide-react";
import { useAuth } from "../providers";
import Link from "next/link";
import { getAuthToken } from "@/lib/auth-service";
import { inventoryService, InventoryItem } from "@/lib/inventory-service";

const SellerDashboard = () => {
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
      
      let token;
      try {
        token = await getAuthToken();
      } catch (authError) {
        console.error("Failed to get auth token:", authError);
        alert("Please log in again.");
        router.push('/login');
        return;
      }
      
      // Fetch orders containing seller's products
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
      console.log("Orders data received:", ordersData);
      // The order service returns an array directly, not wrapped in { data: ... }
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      setOrders(ordersArray);

      // Fetch products
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
      console.log("Products data received:", productsData);
      const productsArray = Array.isArray(productsData) ? productsData : [];
      setProducts(productsArray);

      // Fetch inventory for seller's products
      try {
        const myInventory = await inventoryService.getMyInventory();
        setInventory(myInventory);
      } catch (inventoryError) {
        console.error("Error fetching inventory:", inventoryError);
        // Continue without inventory data
      }

      // Calculate metrics based on fetched data
      const totalOrders = ordersArray.length;
      const totalRevenue = ordersArray
        .filter((order) => order.status === "DELIVERED")
        .reduce((sum, order) => {
          const sellerSubtotal = order.price * order.quantity || 0;
          return sum + sellerSubtotal;
        }, 0);
      const productsSold = ordersArray
        .filter((order) => order.status === "DELIVERED")
        .reduce((sum, order) => {
          const sellerQuantity = order.quantity || 0;
          return sum + sellerQuantity;
        }, 0);
      const activeListings = productsArray.filter((product) => product.isActive).length;

      setMetrics({ totalOrders, totalRevenue, productsSold, activeListings });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      alert("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      let token;
      try {
        token = await getAuthToken();
      } catch (authError) {
        console.error("Failed to get auth token:", authError);
        alert("Please log in again.");
        router.push('/login');
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-green-50 p-8">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
            <p className="text-lg text-gray-600">Manage your products, orders, and track performance</p>
          </div>
          <Link
            href="/seller/add-product"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Add Product</span>
          </Link>
        </div>

        {/* Metrics Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.totalOrders}</p>
            <p className="text-xs text-gray-500 mt-2">All time orders</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-gray-900">MWK {metrics.totalRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">From delivered orders</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Products Sold</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.productsSold}</p>
            <p className="text-xs text-gray-500 mt-2">Units delivered</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Active Listings</h3>
            <p className="text-3xl font-bold text-gray-900">{metrics.activeListings}</p>
            <p className="text-xs text-gray-500 mt-2">Currently listed</p>
          </div>
        </div>

        {/* Orders Section - View only for sellers */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-600">Latest orders for your products</p>
              </div>
            </div>
            {orders.length > 5 && (
              <Link
                href="/seller/orders"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center space-x-1"
              >
                <span>View all {orders.length} orders</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
          
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
                    <th className="p-3">Product Details</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium">{order.orderNumber}</td>
                      <td className="p-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{order.buyerFirstName || "N/A"}</div>
                          <div className="text-xs text-gray-500">{order.buyerEmail}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{order.skuCode}</div>
                          <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-gray-900">MWK {(order.price * order.quantity).toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === "DELIVERED" ? "bg-green-100 text-green-800 border border-green-300" :
                          order.status === "PENDING" ? "bg-yellow-100 text-yellow-800 border border-yellow-300" :
                          order.status === "CANCELLED" ? "bg-red-100 text-red-800 border border-red-300" :
                          "bg-gray-100 text-gray-800 border border-gray-300"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {orders.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <Link
                href="/seller/orders"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center space-x-1"
              >
                <span>View all {orders.length} orders</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Inventory Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Warehouse className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Inventory Overview</h2>
                <p className="text-sm text-gray-600">Track stock levels across all your products</p>
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
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Warehouse className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No inventory records found</p>
              <p className="text-sm text-gray-500 mt-2">Add products to track their inventory</p>
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
                        {item.quantity} units
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

        {/* Products Section */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Your Products</h2>
                <p className="text-sm text-gray-600">{products.length} product{products.length !== 1 ? 's' : ''} listed</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {products.length > 5 && (
                <Link
                  href="/seller/products"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center space-x-1"
                >
                  <span>View all</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                href="/seller/add-product"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-5 py-2.5 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md inline-flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            </div>
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
                  {products.slice(0, 5).map((product) => (
                    <tr key={product.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="p-3 flex items-center space-x-3">
                        <img
                          src={product.imageUrl || "https://via.placeholder.com/50x50.png?text=Product"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <span className="font-medium text-gray-900">{product.name}</span>
                      </td>
                      <td className="p-3 font-semibold text-gray-900">MWK {product.price}</td>
                      <td className="p-3 text-sm text-gray-600">{product.stock} units</td>
                      <td className="p-3">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                            product.isActive ? "bg-green-100 text-green-800 border border-green-300" : "bg-gray-100 text-gray-800 border border-gray-300"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-3 flex space-x-2">
                        <Link
                          href={`/seller/edit-product/${product.id}`}
                          className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {products.length > 5 && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <Link
                href="/seller/products"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm inline-flex items-center space-x-1"
              >
                <span>View all {products.length} products</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;