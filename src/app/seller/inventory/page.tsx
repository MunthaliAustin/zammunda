'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { inventoryService, InventoryItem } from '@/lib/inventory-service';
import { formatQuantityWithUnit } from '@/lib/units';
import Link from 'next/link';

export default function SellerInventoryPage() {
  const { user, isLoading } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

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
      await inventoryService.adjustInventory(skuCode, editQuantity, editingItem?.unitType, editingItem?.unitLabel);
      // Refresh inventory
      await fetchInventory();
      setEditingId(null);
      setEditQuantity(0);
      setEditingItem(null);
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

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Inventory</h1>
            <p className="text-gray-600 mt-2">Manage your product inventory</p>
          </div>
          <Link 
            href="/seller/add-product"
            className="px-4 py-2 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
          >
            Add Product
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading inventory...</span>
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory yet</h3>
          <p className="text-gray-500 mb-4">You haven't added any products to your inventory yet.</p>
          <Link 
            href="/seller/add-product"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition"
          >
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU Code</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selling Unit</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reserved</th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.skuCode}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{item.skuCode}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">{item.unitLabel || 'unit'}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {formatQuantityWithUnit(item.quantity, item.unitType, item.unitLabel)}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-900">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      0
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                    {editingId === item.skuCode ? (
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="0"
                          value={editQuantity}
                          onChange={(e) => setEditQuantity(Number(e.target.value))}
                          className="border rounded px-2 py-1 mr-2 w-20"
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item.skuCode)}
                          className="text-green-600 hover:text-green-900 mr-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingItem(null);
                          }}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(item.skuCode);
                            setEditQuantity(item.quantity);
                            setEditingItem(item);
                          }}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.skuCode)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
