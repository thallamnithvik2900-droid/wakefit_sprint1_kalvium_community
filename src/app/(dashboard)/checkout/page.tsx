'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  QrCode,
  Building2,
  Banknote,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  ArrowRight,
  Lock,
  ChevronRight,
  PackageCheck
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  // Address State
  const [address, setAddress] = useState({
    name: 'Rahul Kumar',
    street: '123 Green Park Colony, Sector 4',
    city: 'Bengaluru',
    state: 'Karnataka',
    zipCode: '560001',
    mobile: '9876543210',
  });

  // Payment Method State
  const [selectedMethod, setSelectedMethod] = useState<'CARD' | 'UPI' | 'NETBANKING' | 'COD' | 'WALLET'>('CARD');

  // Card Form Details
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/28',
    cvv: '123',
    cardName: 'Rahul Kumar',
  });

  // UPI Details
  const [upiApp, setUpiApp] = useState('Google Pay');
  const [upiId, setUpiId] = useState('rahulkumar@okaxis');

  // Bank Selection
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Order Placement State
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoadingCart(true);
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setCartItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCart(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.18);
  const grandTotal = Math.round(subtotal + gst);

  const handlePlaceOrder = async () => {
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
          shippingAddress: address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to place order');
        setSubmitting(false);
        return;
      }

      setPlacedOrder(data.order);
    } catch (err) {
      setError('An unexpected error occurred during payment processing.');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentTabs = [
    { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, subtitle: 'Visa, Mastercard, RuPay' },
    { id: 'UPI', label: 'UPI / QR Code', icon: QrCode, subtitle: 'GPay, PhonePe, Paytm, BHIM' },
    { id: 'NETBANKING', label: 'Net Banking', icon: Building2, subtitle: 'All Major Indian Banks' },
    { id: 'COD', label: 'Cash on Delivery', icon: Banknote, subtitle: 'Pay Cash at Doorstep' },
    { id: 'WALLET', label: 'Wakefit Wallet', icon: Wallet, subtitle: 'Instant Wallet Balance' },
  ];

  return (
    <DashboardLayout>
      {/* If Order Successfully Placed -> Show Success Modal/Screen */}
      {placedOrder ? (
        <div className="min-h-[75vh] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 sm:p-12 max-w-lg w-full text-center shadow-xl animate-in fade-in zoom-in-95">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3">
              Payment Confirmed
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Order Placed Successfully!
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
              Thank you for shopping with Wakefit. Your order confirmation and receipt have been generated.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-xs space-y-2 text-left mb-8 border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Order Number:</span>
                <span className="font-extrabold text-slate-900 dark:text-white font-mono">{placedOrder.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Total Paid:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">
                  ₹{placedOrder.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Payment Method:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{selectedMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Estimated Delivery:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {new Date(placedOrder.estDeliveryDate).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/orders"
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/25 transition-all text-center"
              >
                View My Orders
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all text-center"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Main Checkout View */
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Checkout & Payment
              </h1>
              <p className="text-xs text-slate-400 mt-1">Complete your order with 100% secure payment</p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" /> 256-Bit Encrypted
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          {loadingCart ? (
            <div className="py-20 text-center text-slate-400">Loading checkout details...</div>
          ) : cartItems.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
              <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Your cart is empty</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">Add items to your cart before proceeding to payment.</p>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white text-xs font-bold rounded-xl"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Address + Payment Options */}
              <div className="lg:col-span-2 space-y-8">
                {/* Step 1: Delivery Address */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        1
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Delivery Address</h3>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 cursor-pointer">
                      <MapPin className="w-3.5 h-3.5" /> Home Address
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{address.name}</div>
                    <div className="text-slate-600 dark:text-slate-300">{address.street}</div>
                    <div className="text-slate-600 dark:text-slate-300">
                      {address.city}, {address.state} - {address.zipCode}
                    </div>
                    <div className="text-slate-400 font-mono mt-1">Mobile: {address.mobile}</div>
                  </div>
                </div>

                {/* Step 2: Payment Method */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      2
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Choose Payment Method</h3>
                  </div>

                  {/* Payment Method Selector Tabs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {paymentTabs.map((tab) => {
                      const Icon = tab.icon;
                      const isSelected = selectedMethod === tab.id;
                      return (
                        <button
                          type="button"
                          key={tab.id}
                          onClick={() => setSelectedMethod(tab.id as any)}
                          className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">{tab.label}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{tab.subtitle}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Form per Payment Method */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    {/* Credit / Debit Card Form */}
                    {selectedMethod === 'CARD' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Enter Card Details
                        </h4>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            value={cardDetails.cardNumber}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                            placeholder="4242 4242 4242 4242"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              placeholder="MM/YY"
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                              placeholder="•••"
                              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                            Name on Card
                          </label>
                          <input
                            type="text"
                            value={cardDetails.cardName}
                            onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                            placeholder="Rahul Kumar"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                          />
                        </div>
                      </div>
                    )}

                    {/* UPI Form */}
                    {selectedMethod === 'UPI' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Select Instant UPI App
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI'].map((app) => (
                            <button
                              type="button"
                              key={app}
                              onClick={() => setUpiApp(app)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                                upiApp === app
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {app}
                            </button>
                          ))}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                            Virtual Payment Address (VPA / UPI ID)
                          </label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="rahul@okaxis"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Net Banking Form */}
                    {selectedMethod === 'NETBANKING' && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                          Select Popular Bank
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'PNB'].map(
                            (bank) => (
                              <button
                                type="button"
                                key={bank}
                                onClick={() => setSelectedBank(bank)}
                                className={`p-3 rounded-xl text-xs font-bold text-center border transition-all ${
                                  selectedBank === bank
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                {bank}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cash on Delivery Form */}
                    {selectedMethod === 'COD' && (
                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs font-medium text-amber-800 dark:text-amber-300 space-y-1 animate-in fade-in duration-200">
                        <div className="font-bold">Cash on Delivery (Doorstep Cash)</div>
                        <p>Pay cash when your Wakefit furniture is delivered to your address. Please keep exact change ready.</p>
                      </div>
                    )}

                    {/* Wakefit Wallet */}
                    {selectedMethod === 'WALLET' && (
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium text-emerald-800 dark:text-emerald-300 space-y-1 animate-in fade-in duration-200">
                        <div className="font-bold">Wakefit Wallet Balance Available</div>
                        <p>Available Balance: ₹50,000. Full order total will be deducted instantly from your wallet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Order Summary & Pay Button */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm sticky top-24 space-y-5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
                  Order Items ({cartItems.length})
                </h3>

                {/* Items Preview List */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center text-xs">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-10 h-10 object-cover rounded-lg bg-slate-100" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 dark:text-white truncate">{item.product.name}</div>
                        <div className="text-slate-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Breakdown */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping Fee</span>
                    <span className="font-semibold text-emerald-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST (18%)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-blue-600 dark:text-blue-400 text-base">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Pay Now Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {submitting ? 'Processing Payment...' : `Pay ₹${grandTotal.toLocaleString('en-IN')} & Place Order`}
                </button>

                <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" /> 100% Secure Payment Guarantee
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
