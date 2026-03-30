'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth, useCart } from '@/app/providers';
import { orderService, Order } from '@/lib/order-service';
import { paymentService, Payment } from '@/lib/payment-service';

export default function BuyerOrdersPage() {
  const { user, isLoading } = useAuth();
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentsByOrder, setPaymentsByOrder] = useState<Record<string, Payment[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user) {
      void fetchOrders();
    }
  }, [user, isLoading]);

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      void clearCart();
    }
  }, [clearCart, searchParams]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const userOrders = await orderService.getUserOrders();
      setOrders(userOrders);

      const paymentEntries = await Promise.all(
        userOrders.map(async (order) => {
          try {
            const payments = await paymentService.getPaymentsByOrderNumber(order.orderNumber);
            return [order.orderNumber, payments] as const;
          } catch {
            return [order.orderNumber, []] as const;
          }
        })
      );

      setPaymentsByOrder(Object.fromEntries(paymentEntries));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderNumber: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(orderNumber);
        await fetchOrders();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to cancel order');
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
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">View and manage your orders and payments</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const payments = paymentsByOrder[order.orderNumber] || [];
            const latestPayment = payments[0];

            return (
              <div key={order.orderNumber} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{order.skuCode}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        Order: {order.status}
                      </span>
                      {latestPayment && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          latestPayment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          latestPayment.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          latestPayment.status === 'FAILED' ? 'bg-rose-100 text-rose-800' :
                          latestPayment.status === 'REFUNDED' ? 'bg-slate-100 text-slate-800' :
                          latestPayment.status === 'CANCELLED' ? 'bg-gray-200 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Payment: {latestPayment.status}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                      <div>Order ID: {order.orderNumber}</div>
                      <div>Quantity: {order.quantity}</div>
                      <div>Total: MWK {order.price}</div>
                      <div>Date: {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    {latestPayment && (
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <div>Payment Method: {latestPayment.method.replaceAll('_', ' ')}</div>
                        <div>Internal Payment ID: {latestPayment.paymentNumber}</div>
                        {latestPayment.transactionReference && (
                          <div>PayChangu Tx Ref: {latestPayment.transactionReference}</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelOrder(order.orderNumber)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200 text-sm"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

