import React, { Suspense } from 'react';
import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Left Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Background Overlay Image with blend mode */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80')`,
          }}
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl border border-white/30">
            w
          </div>
          <span className="text-2xl font-bold tracking-tight">Wakefit</span>
        </div>

        {/* Middle Content */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Trusted by 2M+ happy customers
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight">
            Comfort Delivered <br />
            to Your Doorstep.
          </h1>

          <p className="text-blue-100 text-base font-medium leading-relaxed">
            Premium furniture, stress-free returns, and world-class service — all in one place.
          </p>
        </div>

        {/* Bottom Metrics Cards */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="text-2xl font-black text-white">2M+</div>
            <div className="text-xs font-medium text-blue-200 mt-1">Happy Customers</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="text-2xl font-black text-white">98%</div>
            <div className="text-xs font-medium text-blue-200 mt-1">Satisfaction Rate</div>
          </div>
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="text-2xl font-black text-white">7-Day</div>
            <div className="text-xs font-medium text-blue-200 mt-1">Easy Returns</div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading login...</div>}>
          <LoginForm />
        </Suspense>

        {/* Floating Help Circle Icon matching Page 1 bottom right */}
        <div className="absolute bottom-6 right-6">
          <button className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs shadow-lg hover:bg-slate-800 transition-all">
            ?
          </button>
        </div>
      </div>
    </div>
  );
}
