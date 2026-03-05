'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { inventoryService, InventoryItem } from '@/lib/inventory-service';
import { 
  ArrowLeft, 
  Package, 
  Edit2, 
  Trash2, 
  Inbox,
  Search,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function SellerInventoryPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading && user) {
      fetchInventory();
    }
  }, [user, isLoading]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const inventoryItems = await inventoryService.getMyInventory();
      setInventory(inventoryItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (skuCode: string) => {
    try {
      await inventoryService.adjustInventory(skuCode, editQuantity);
      // Refresh inventory
      await fetchInventory();
      setEditingId(null);
      setEditQuantity(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update inventory');
    }
  };

  const handleRemoveItem = async (skuCode: string) => {
    if (confirm('Are you sure you want to remove this item from your inventory?')) {
      try {
        await inventoryService.removeInventory(skuCode);
        // Refresh inventory
        await fetchInventory();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove inventory item');
      }
    }
  };

  // Filter inventory by search query
  const filteredInventory = inventory.filter(item =>
    item.skuCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading your inventory...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50 p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Please sign in</h2>
          <p className="text-gray-600 mb-6">Sign in to manage your inventory.</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Inventory</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredInventory.length} of {inventory.length} item{inventory.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SKU code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-8 flex items-start space-x-3">
            <div className="flex-shrink-0">
              <ShieldCheck className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredInventory.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-12 h-12 text-gray-400" />
            </div>
            {inventory.length === 0 ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No inventory yet</h3>
                <p className="text-gray-600 mb-6">When you add products, they'll appear here.</p>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No matching inventory</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search query</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear search
                </button>
              </>
            )}
          </div>
        ) : (
          /* Inventory Table */
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <tr>
                  <th className="p-4 text-left font-semibold">SKU Code</th>
                  <th className="p-4 text-left font-semibold">Total Quantity</th>
                  <th className="p-4 text-left font-semibold">Available</th>
                  <th className="p-4 text-left font-semibold">Reserved</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className={`border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">{item.skuCode}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-gray-900">{item.quantity} units</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800 border border-green-300">
                        {item.quantity} available
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                        0 reserved
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end space-x-2">
                        {editingId === item.skuCode ? (
                          <>
                            <input
                              type="number"
                              min="0"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(Number(e.target.value))}
                              className="border border-gray-300 rounded-lg px-3 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              onClick={() => handleUpdateQuantity(item.skuCode)}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              title="Save"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                              title="Cancel"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(item.skuCode);
                                setEditQuantity(item.quantity);
                              }}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              title="Edit Quantity"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.skuCode)}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
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
    </div>
  );
}