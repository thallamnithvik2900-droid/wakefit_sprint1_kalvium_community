'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { Search, X, Clock, ChevronRight, PackageCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [otherReason, setOtherReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [activeTab, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/orders', window.location.origin);
      if (activeTab !== 'All') url.searchParams.append('status', activeTab);
      if (searchQuery) url.searchParams.append('search', searchQuery);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCancellation = async () => {
    if (!cancellingOrder) return;
    const finalReason = cancelReason === 'Other' ? otherReason : cancelReason;

    if (cancelReason === 'Other' && !otherReason.trim()) {
      alert('Please type your cancellation reason.');
      return;
    }

    try {
      setSubmittingCancel(true);
      const res = await fetch(`/api/orders/${cancellingOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL', reason: finalReason }),
      });

      if (res.ok) {
        setCancellingOrder(null);
        setCancelReason('Ordered by mistake');
        setOtherReason('');
        showToast('Order cancelled successfully.');
        fetchOrders();
      } else {
        alert('Failed to cancel order.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingCancel(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const tabs = [
    'All',
    'Order Placed',
    'Processing',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
      case 'Order Placed':
        return { label: 'Order Placed', dotColor: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' };
      case 'PROCESSING':
      case 'Processing':
        return { label: 'Processing', dotColor: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' };
      case 'SHIPPED':
      case 'Shipped':
        return { label: 'Shipped', dotColor: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' };
      case 'OUT_FOR_DELIVERY':
      case 'Out for Delivery':
        return { label: 'Out for Delivery', dotColor: 'bg-indigo-500', text: 'text-indigo-600 dark:text-indigo-400' };
      case 'DELIVERED':
      case 'Delivered':
        return { label: 'Delivered', dotColor: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' };
      case 'CANCELLED':
      case 'Cancelled':
        return { label: 'Cancelled', dotColor: 'bg-red-500', text: 'text-red-600 dark:text-red-400' };
      default:
        return { label: status, dotColor: 'bg-slate-400', text: 'text-slate-600' };
    }
  };

  const cancelReasonsList = [
    'Ordered by mistake',
    'Found a better price elsewhere',
    'Delivery taking too long / Need faster delivery',
    'Changed shipping address',
    'Payment/Billing issue',
    'Other',
  ];

  return (
    <DashboardLayout onSearch={(q) => setSearchQuery(q)}>
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Orders</h1>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md mb-6">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order ID or product..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-800'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
          <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No orders found</h3>
          <p className="text-xs text-slate-400 mt-1">You haven&apos;t placed any orders matching this status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            const firstItem = order.orderItems[0];
            const product = firstItem?.product;

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all"
              >
                {/* Order Top Bar */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-slate-500 font-mono">{order.id}</span>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${badge.dotColor}`} />
                    <span className={`text-xs font-bold ${badge.text}`}>{badge.label}</span>
                  </div>
                </div>

                {/* Product Detail */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <img
                    src={
                      product?.imageUrl ||
                      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={product?.name || 'Product'}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-100"
                  />

                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {product?.name || 'Wakefit Product'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Color: {firstItem?.color || 'Grey'} • Qty: {firstItem?.quantity || 1}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs">
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        ₹{order.totalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-400">
                        Ordered: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      {order.estDeliveryDate && (
                        <span className="text-slate-400">
                          Est. delivery: {new Date(order.estDeliveryDate).toISOString().split('T')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional Countdown highlight for fresh orders */}
                {(order.status === 'PLACED' || order.status === 'Order Placed') && (
                  <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Cancel within 21h 59m 3s</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    href={product?.id ? `/products/${product.id}` : '/dashboard'}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-1 transition-all"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {(order.status === 'PLACED' || order.status === 'Order Placed') && (
                    <button
                      onClick={() => {
                        setCancellingOrder(order);
                        setCancelReason('Ordered by mistake');
                        setOtherReason('');
                      }}
                      className="px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-1 transition-all"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Cancel Order
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">#{cancellingOrder.id}</p>
              </div>
              <button
                onClick={() => setCancellingOrder(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Select Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                >
                  {cancelReasonsList.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {cancelReason === 'Other' && (
                <div className="animate-in fade-in duration-200">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Please Type Your Reason
                  </label>
                  <textarea
                    rows={3}
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="Provide details for cancelling this order..."
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={submittingCancel}
                onClick={handleConfirmCancellation}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-extrabold rounded-xl shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {submittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
