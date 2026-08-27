'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  ShoppingCart,
  Heart,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Plus,
  Minus,
  Zap
} from 'lucide-react';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProductDetails();
  }, [params.id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const [prodRes, wishRes] = await Promise.all([
        fetch(`/api/products/${params.id}`),
        fetch('/api/wishlist'),
      ]);

      if (prodRes.ok) {
        const data = await prodRes.json();
        setProduct(data);
      }

      if (wishRes.ok) {
        const wishData = await wishRes.json();
        setIsWishlisted(wishData.some((w: any) => w.productId === params.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async () => {
    if (!product) return;
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.ok) {
        setIsWishlisted(!isWishlisted);
        showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (navigateCheckout = false) => {
    if (!product) return;
    try {
      setAddingToCart(true);
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      if (res.ok) {
        if (navigateCheckout) {
          router.push('/checkout');
        } else {
          showToast(`Added ${quantity} item(s) to your cart!`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
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

        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {loading ? (
          <div className="py-24 text-center text-slate-400">Loading product details...</div>
        ) : !product ? (
          <div className="py-24 text-center text-slate-400">Product not found.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Product Image Gallery Preview */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-3xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.discountPercent > 0 && (
                  <span className="absolute top-4 left-4 bg-emerald-500 text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {product.discountPercent}% OFF
                  </span>
                )}
                <button
                  onClick={toggleWishlist}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-red-500 transition-colors shadow-md"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>

              {/* Key Guarantee Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white">Free Shipping</div>
                  <div className="text-[10px] text-slate-400">Doorstep delivery</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <RotateCcw className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white">7-Day Return</div>
                  <div className="text-[10px] text-slate-400">Hassle-free schedule</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-900 dark:text-white">10-Year Warranty</div>
                  <div className="text-[10px] text-slate-400">Wakefit official</div>
                </div>
              </div>
            </div>

            {/* Product Meta & Purchase Panel */}
            <div className="space-y-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                    {product.category}
                  </span>
                  {product.inStock ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> In Stock
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                      Out of Stock
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {product.name}
                </h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{product.rating || 4.8}</span>
                  <span className="text-xs text-slate-400">({product.reviewCount || 128} customer reviews)</span>
                </div>
              </div>

              {/* Price & Savings */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-base text-slate-400 line-through">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Product Description
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Quantity Selector & Action Buttons */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Quantity</span>
                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-xs font-bold text-slate-900 dark:text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleAddToCart(false)}
                    disabled={addingToCart || !product.inStock}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {addingToCart ? 'Adding...' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={() => handleAddToCart(true)}
                    disabled={addingToCart || !product.inStock}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Zap className="w-4 h-4" /> Buy Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
