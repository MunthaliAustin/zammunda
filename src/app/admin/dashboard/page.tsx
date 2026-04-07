"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Boxes,
  FolderTree,
  Users,
  Search,
  RefreshCw,
  Power,
  PowerOff,
  MapPin,
  Trash2,
  FileBadge2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/app/providers";
import { adminService, AdminUser, SellerApplication } from "@/lib/admin-service";
import { Category } from "@/lib/category-service";
import { Product } from "@/lib/product-service";

const tabs = [
  { id: "applications", label: "Seller Applications", icon: FileBadge2 },
  { id: "users", label: "Users", icon: Users },
  { id: "products", label: "Products", icon: Boxes },
  { id: "categories", label: "Categories", icon: FolderTree },
] as const;

type AdminTab = (typeof tabs)[number]["id"];

const AdminDashboardPage = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("applications");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ id: "", name: "", description: "", imageUrl: "" });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [applicationsResult, userResult, productResult, categoryResult] = await Promise.allSettled([
        adminService.getSellerApplications("ALL"),
        adminService.getUsers(search),
        adminService.getProducts(),
        adminService.getCategories(),
      ]);

      const errors: string[] = [];
      if (applicationsResult.status === "fulfilled") {
        setApplications(applicationsResult.value);
        setSelectedApplicationId((current) => {
          const nextList = applicationsResult.value;
          if (!nextList.length) return null;
          if (current && nextList.some((entry) => entry.id === current)) return current;
          return nextList[0].id;
        });
      } else errors.push("seller applications");
      if (userResult.status === "fulfilled") setUsers(userResult.value); else errors.push("users");
      if (productResult.status === "fulfilled") setProducts(productResult.value); else errors.push("products");
      if (categoryResult.status === "fulfilled") setCategories(categoryResult.value); else errors.push("categories");
      if (errors.length) setError(`Failed to load: ${errors.join(", ")}`);
    } catch (err) {
      console.error("Admin dashboard load error:", err);
      setError(err instanceof Error ? err.message : "Failed to load admin dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    if (user?.role === "ADMIN") {
      void fetchAllData();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      const timeout = setTimeout(() => {
        void adminService.getUsers(search)
          .then(setUsers)
          .catch((err) => setError(err instanceof Error ? err.message : "Failed to load users"));
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [search, user]);

  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === selectedApplicationId) ?? applications[0] ?? null,
    [applications, selectedApplicationId]
  );

  const getApplicationTone = (status: SellerApplication["status"]) => {
    if (status === "APPROVED") return "bg-green-100 text-green-700 border-green-200";
    if (status === "REJECTED") return "bg-red-100 text-red-700 border-red-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  const stats = useMemo(() => ({
    pendingApplications: applications.filter((application) => application.status === "PENDING").length,
    users: users.length,
    activeProducts: products.filter((product) => product.active !== false).length,
    categories: categories.length,
  }), [applications, users, products, categories]);

  const handleToggleUser = async (targetUser: AdminUser) => {
    setActionLoading((prev) => ({ ...prev, [targetUser.id]: true }));
    try {
      await adminService.updateUser(targetUser.id, { enabled: !targetUser.enabled });
      setUsers((prev) => prev.map((entry) => entry.id === targetUser.id ? { ...entry, enabled: !targetUser.enabled } : entry));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user");
    } finally {
      setActionLoading((prev) => ({ ...prev, [targetUser.id]: false }));
    }
  };

  const handleToggleProduct = async (product: Product) => {
    if (!product.id) return;
    setActionLoading((prev) => ({ ...prev, [product.id]: true }));
    try {
      await adminService.updateProduct({ ...product, active: product.active === false });
      setProducts((prev) => prev.map((entry) => entry.id === product.id ? { ...entry, active: product.active === false } : entry));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update product");
    } finally {
      setActionLoading((prev) => ({ ...prev, [product.id]: false }));
    }
  };

  const handleDeleteProduct = async (productId?: string) => {
    if (!productId || !window.confirm("Delete this product?")) return;
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      await adminService.deleteProduct(productId);
      setProducts((prev) => prev.filter((entry) => entry.id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim() || !categoryForm.description.trim()) {
      setError("Category name and description are required.");
      return;
    }

    try {
      if (categoryForm.id) {
        await adminService.updateCategory(categoryForm as Category);
      } else {
        await adminService.createCategory({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
          imageUrl: categoryForm.imageUrl.trim() || undefined,
        });
      }
      setCategoryForm({ id: "", name: "", description: "", imageUrl: "" });
      setCategories(await adminService.getCategories());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await adminService.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((entry) => entry.id !== categoryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const handleReviewApplication = async (application: SellerApplication, decision: "APPROVE" | "REJECT") => {
    if (decision === "REJECT") {
      const reason = window.prompt("Reason for rejection (optional):", application.rejectionReason || "") ?? "";
      setActionLoading((prev) => ({ ...prev, [application.id]: true }));
      try {
        const updated = await adminService.reviewSellerApplication(application.id, decision, reason);
        setApplications((prev) => prev.map((entry) => entry.id === application.id ? updated : entry));
        setUsers(await adminService.getUsers(search));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to review application");
      } finally {
        setActionLoading((prev) => ({ ...prev, [application.id]: false }));
      }
      return;
    }

    if (!window.confirm(`Approve ${application.fullName} as a seller?`)) return;
    setActionLoading((prev) => ({ ...prev, [application.id]: true }));
    try {
      const updated = await adminService.reviewSellerApplication(application.id, decision);
      setApplications((prev) => prev.map((entry) => entry.id === application.id ? updated : entry));
      setUsers(await adminService.getUsers(search));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to review application");
    } finally {
      setActionLoading((prev) => ({ ...prev, [application.id]: false }));
    }
  };

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f5f4ed_0%,#fcfbf8_45%,#eef3f8_100%)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f5f4ed_0%,#fcfbf8_45%,#eef3f8_100%)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-[32px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur md:flex-row md:items-center md:justify-between lg:p-8">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700/70">Platform operations</p>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900">Admin Dashboard</h1>
            <p className="text-base text-slate-600">Manage seller applications, users, products, and categories from one consistent control center.</p>
          </div>
          <button
            onClick={() => void fetchAllData()}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <FileBadge2 className="w-7 h-7 text-amber-600" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Pending</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-7 h-7 text-blue-600" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Users</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.users}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <Boxes className="w-7 h-7 text-green-600" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Active Products</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activeProducts}</p>
          </div>
          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <FolderTree className="w-7 h-7 text-purple-600" />
              <span className="text-xs text-gray-500 uppercase tracking-wide">Categories</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.categories}</p>
          </div>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

        <div className="mb-6 flex flex-wrap gap-3 rounded-[28px] border border-slate-200/80 bg-white/95 p-3 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const selected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition ${selected ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "applications" && (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Seller Applications</h2>
                <p className="text-sm text-gray-600 mt-1">Select an application from the list to view all details.</p>
              </div>

              {applications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                  No seller applications yet.
                </div>
              ) : (
                <div className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
                  {applications.map((application) => {
                    const isSelected = selectedApplication?.id === application.id;
                    return (
                      <button
                        key={application.id}
                        type="button"
                        onClick={() => setSelectedApplicationId(application.id)}
                        className={`w-full text-left px-4 py-4 transition ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{application.fullName}</p>
                            <p className="text-sm text-gray-600 truncate">{application.email || 'No email'}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                          <span className={`shrink-0 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${getApplicationTone(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              {!selectedApplication ? (
                <div className="h-full min-h-[420px] flex items-center justify-center text-gray-500">
                  Select an application to view details.
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h2 className="text-2xl font-semibold text-gray-900">{selectedApplication.fullName}</h2>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getApplicationTone(selectedApplication.status)}`}>
                          {selectedApplication.status}
                        </span>
                      </div>
                      <p className="text-gray-600">{selectedApplication.email || 'No email provided'}</p>
                    </div>
                    {selectedApplication.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => void handleReviewApplication(selectedApplication, 'APPROVE')}
                          disabled={!!actionLoading[selectedApplication.id]}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => void handleReviewApplication(selectedApplication, 'REJECT')}
                          disabled={!!actionLoading[selectedApplication.id]}
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase mb-2">Applicant Details</p>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><span className="font-medium text-gray-900">Phone:</span> {selectedApplication.phoneNumber}</p>
                        <p><span className="font-medium text-gray-900">National ID Number:</span> {selectedApplication.nationalIdNumber}</p>
                        <p><span className="font-medium text-gray-900">User ID:</span> {selectedApplication.userId}</p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase mb-2">Review Timeline</p>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p><span className="font-medium text-gray-900">Submitted:</span> {selectedApplication.submittedAt ? new Date(selectedApplication.submittedAt).toLocaleString() : 'N/A'}</p>
                        <p><span className="font-medium text-gray-900">Reviewed:</span> {selectedApplication.reviewedAt ? new Date(selectedApplication.reviewedAt).toLocaleString() : 'Not reviewed yet'}</p>
                        <p><span className="font-medium text-gray-900">Reviewed By:</span> {selectedApplication.reviewedByEmail || selectedApplication.reviewedBy || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4 bg-white">
                    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase mb-3">National ID Document</p>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="text-sm text-gray-700">
                        <p className="font-medium text-gray-900 mb-1">Uploaded document</p>
                        <p className="break-all text-gray-600">{selectedApplication.nationalIdImageUrl}</p>
                      </div>
                      <a
                        href={selectedApplication.nationalIdImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800"
                      >
                        Open Document
                      </a>
                    </div>
                  </div>

                  {selectedApplication.rejectionReason && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1">Rejection Reason</p>
                      <p>{selectedApplication.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Users</h2>
                <p className="text-sm text-gray-600">Enable or disable platform accounts from Keycloak.</p>
              </div>
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users"
                  className="w-full rounded-full border border-gray-300 pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="p-3">User</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Roles</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 last:border-b-0">
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{entry.firstName || entry.username || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{entry.username}</div>
                      </td>
                      <td className="p-3 text-gray-600">{entry.email || 'N/A'}</td>
                      <td className="p-3 text-gray-600">{entry.roles?.filter((role) => ["ADMIN", "SELLER"].includes(role)).join(', ') || 'BUYER'}</td>
                      <td className="p-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${entry.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                          {entry.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => void handleToggleUser(entry)}
                          disabled={!!actionLoading[entry.id]}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition ${entry.enabled ? 'bg-gray-700 hover:bg-gray-800' : 'bg-green-600 hover:bg-green-700'} disabled:opacity-50`}
                        >
                          {entry.enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                          {entry.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Products</h2>
              <p className="text-sm text-gray-600">Moderate listings, disable products, or remove them completely.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="p-3">Product</th>
                    <th className="p-3">Seller</th>
                    <th className="p-3">City</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 last:border-b-0">
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-500">{product.skuCode}</div>
                      </td>
                      <td className="p-3 text-gray-600">{product.sellerName || product.sellerEmail || product.sellerId || 'N/A'}</td>
                      <td className="p-3 text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {product.city || 'N/A'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600">MWK {Number(product.discountedPrice ?? product.price ?? 0).toFixed(2)}</td>
                      <td className="p-3">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.active === false ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                          {product.active === false ? 'Inactive' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => void handleToggleProduct(product)}
                          disabled={!!product.id && !!actionLoading[product.id]}
                          className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          {product.active === false ? 'Activate' : 'Deactivate'}
                        </button>
                        <button
                          onClick={() => void handleDeleteProduct(product.id)}
                          disabled={!!product.id && !!actionLoading[product.id]}
                          className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1 rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)] h-fit">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Category Form</h2>
              <div className="space-y-4">
                <input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Category name"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Category description"
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={categoryForm.imageUrl}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Image URL (optional)"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-3">
                  <button onClick={() => void handleSaveCategory()} className="flex-1 rounded-full bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition">
                    {categoryForm.id ? 'Update' : 'Create'} Category
                  </button>
                  <button onClick={() => setCategoryForm({ id: '', name: '', description: '', imageUrl: '' })} className="rounded-full bg-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-300 transition">
                    Clear
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Categories</h2>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{category.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{category.description}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCategoryForm({
                          id: category.id,
                          name: category.name,
                          description: category.description,
                          imageUrl: category.imageUrl || '',
                        })}
                        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void handleDeleteCategory(category.id)}
                        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
