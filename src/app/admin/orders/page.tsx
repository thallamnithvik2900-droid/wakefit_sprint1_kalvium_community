'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  XCircle,
  X
} from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  color?: string;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string;
    category: string;
    price: number;
  };
}

interface Order {
  id: string;
  userId: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  estDeliveryDate?: string;
  user: {
    id: string;
    name: string;
    email: string;
    mobile?: string;
    addresses?: any[];
  };
  orderItems: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Single Order Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (sortBy) params.append('sort', sortBy);

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch admin orders');

      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order status');
      }

      // Live UI Update
      setOrders((prevOrders) =>
        prevOrders.map((ord) =>
          ord.id === orderId ? { ...ord, status: newStatus === 'ORDER_PLACED' ? 'PLACED' : newStatus } : ord
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus === 'ORDER_PLACED' ? 'PLACED' : newStatus } : null
        );
      }

      showToast(`Order #${orderId} status updated to ${newStatus}`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Local Search Filter
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.user.name.toLowerCase().includes(q) ||
      order.user.email.toLowerCase().includes(q) ||
      order.orderItems.some((item) => item.product.name.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (s === 'PLACED' || s === 'ORDER_PLACED') {
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
    if (s === 'CONFIRMED') {
      return 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
    }
    if (s === 'PROCESSING') {
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    }
    if (s === 'SHIPPED') {
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    }
    if (s === 'OUT_FOR_DELIVERY') {
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
    }
    if (s === 'DELIVERED') {
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    }
    if (s === 'CANCELLED') {
      return 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-800';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
  };

  // Helper for delivery timeline stage mapping
  const timelineStages = [
    { key: 'ORDER_PLACED', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStageIndex = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (s === 'CANCELLED') return -1;
    if (s === 'PLACED' || s === 'ORDER_PLACED') return 0;
    if (s === 'CONFIRMED') return 1;
    if (s === 'PROCESSING') return 2;
    if (s === 'SHIPPED') return 3;
    if (s === 'OUT_FOR_DELIVERY') return 4;
    if (s === 'DELIVERED') return 5;
    return 0;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Admin Order Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              View, update, and track customer orders across all delivery stages.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
              Total Orders: {orders.length}
            </span>
          </div>
        </div>

        {/* Control Bar: Search, Status Filter, Sort */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Customer Name, or Email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full md:w-auto px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="ORDER_PLACED">Order Placed</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-auto px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="py-24 text-center text-slate-400 text-sm">Loading admin orders...</div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-red-50 text-red-600 border border-red-200 text-xs font-semibold">
            {error}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-100 dark:border-slate-800 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No orders found</h3>
            <p className="text-xs text-slate-400">Try clearing search filters or checking again.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-5">Order ID</th>
                    <th className="py-4 px-5">Customer</th>
                    <th className="py-4 px-5">Product(s) Ordered</th>
                    <th className="py-4 px-5">Total Amount</th>
                    <th className="py-4 px-5">Order Date</th>
                    <th className="py-4 px-5">Current Status</th>
                    <th className="py-4 px-5">Update Status</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map((order) => {
                    const firstItem = order.orderItems[0];
                    const extraItemsCount = order.orderItems.length - 1;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Order ID */}
                        <td className="py-4 px-5 font-mono font-extrabold text-slate-900 dark:text-white">
                          {order.id}
                        </td>

                        {/* Customer Info */}
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-900 dark:text-white">{order.user?.name || 'Customer'}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{order.user?.email}</div>
                        </td>

                        {/* Product Info */}
                        <td className="py-4 px-5">
                          {firstItem ? (
                            <div className="flex items-center gap-3">
                              <img
                                src={firstItem.product.imageUrl}
                                alt={firstItem.product.name}
                                className="w-10 h-10 object-cover rounded-xl bg-slate-100 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                                  {firstItem.product.name}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                  Qty: {firstItem.quantity} × ₹{firstItem.price.toLocaleString('en-IN')}
                                  {extraItemsCount > 0 && (
                                    <span className="ml-1 text-indigo-600 font-bold">
                                      (+{extraItemsCount} more)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400">No Items</span>
                          )}
                        </td>

                        {/* Total Amount */}
                        <td className="py-4 px-5 font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                          ₹{order.totalPrice.toLocaleString('en-IN')}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Current Status Badge */}
                        <td className="py-4 px-5">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${getStatusBadge(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* Update Status Dropdown */}
                        <td className="py-4 px-5">
                          <select
                            disabled={updatingId === order.id}
                            value={order.status === 'PLACED' ? 'ORDER_PLACED' : order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-indigo-500/20"
                          >
                            <option value="ORDER_PLACED">ORDER_PLACED</option>
                            <option value="CONFIRMED">CONFIRMED</option>
                            <option value="PROCESSING">PROCESSING</option>
                            <option value="SHIPPED">SHIPPED</option>
                            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                      {selectedOrder.id}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getStatusBadge(
                        selectedOrder.status
                      )}`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Placed on{' '}
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Visual Delivery Timeline */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Visual Delivery Stage Progress
                </h4>

                {selectedOrder.status === 'CANCELLED' ? (
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 text-xs font-semibold flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> This order has been cancelled.
                  </div>
                ) : (
                  <div className="grid grid-cols-6 gap-1 pt-2 relative">
                    {timelineStages.map((stage, idx) => {
                      const currentIdx = getStageIndex(selectedOrder.status);
                      const isCompleted = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={stage.key} className="text-center relative">
                          <div
                            className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center font-bold text-xs border transition-all ${
                              isCompleted
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 border-slate-300 dark:border-slate-600'
                            } ${isCurrent ? 'ring-4 ring-indigo-500/20 scale-110' : ''}`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                          </div>
                          <div
                            className={`text-[10px] font-bold mt-2 ${
                              isCompleted ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                            }`}
                          >
                            {stage.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Customer Information Card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Customer & Shipping Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold">{selectedOrder.user?.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedOrder.user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedOrder.user?.mobile || '+91 9876543210'}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>
                        123 Green Park Colony, Sector 4, Bengaluru, Karnataka - 560001
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Products in Order ({selectedOrder.orderItems.length})
                </h4>
                <div className="space-y-2">
                  {selectedOrder.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-xl bg-slate-100"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{item.product.name}</div>
                          <div className="text-slate-400 text-[11px]">
                            Category: {item.product.category} {item.color ? `| Color: ${item.color}` : ''}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm font-extrabold">
                <span className="text-slate-700 dark:text-slate-300">Total Paid Amount:</span>
                <span className="text-blue-600 dark:text-blue-400 text-lg">
                  ₹{selectedOrder.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
