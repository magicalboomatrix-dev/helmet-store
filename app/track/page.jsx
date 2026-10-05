"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  QrCode,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Phone,
  Check,
  Navigation,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { formatImageUrl } from "@/lib/imageUtils";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (queryToSearch) => {
    const q = (queryToSearch ?? searchQuery).trim();
    if (!q) {
      setError("Please enter your Order ID or registered mobile number.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const res = await fetch(`/api/track?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "No orders found matching this query.");
      }

      setResults(data.results || []);
    } catch (err) {
      console.error("Track search error:", err);
      setError(err.message || "Could not retrieve tracking details.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-900 hover:opacity-85 transition">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-900 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              HS
            </div>
            <span className="font-bold text-base tracking-tight">Helmet Store</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 transition"
            >
              ← Back to Storefront
            </Link>
          </div>
        </div>
      </header>

      {/* Main Track Section */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 space-y-8">
        {/* Search Header Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <Truck className="w-3.5 h-3.5" />
            <span>Automated Live Delivery Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Track Your Helmet Order
          </h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            Sign in to your customer account, then enter an <strong>Order ID</strong> or your registered mobile number to view your own shipment updates.
          </p>

          {/* Search Box Form */}
          <form
            onSubmit={handleSubmit}
            className="pt-4 max-w-xl mx-auto flex flex-col sm:flex-row gap-2.5 items-stretch"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order ID (HS-XXXXX) or Phone Number"
                className="w-full bg-white border border-gray-300 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm rounded-2xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3 shadow-sm max-w-xl mx-auto">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <span>{error}</span>
              {error.toLowerCase().includes("sign in") && (
                <Link href="/account?returnTo=%2Ftrack" className="ml-2 font-semibold underline">Sign in</Link>
              )}
            </div>
          </div>
        )}

        {/* Search Results Display */}
        {results.length > 0 && (
          <div className="space-y-8 pt-4">
            {results.map(({ order, tracking }, rIdx) => (
              <div
                key={order.orderId || rIdx}
                className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6"
              >
                {/* Order Top Summary Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-900 text-white rounded-lg">
                        #{order.orderId}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          order.paymentStatus === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : order.paymentStatus === "Proof Submitted"
                            ? "bg-indigo-100 text-indigo-800"
                            : order.paymentStatus === "Proof Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        Payment: {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Recipient: <strong>{order.customer.name}</strong> • Phone: +{order.customer.phone}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs text-gray-400 uppercase font-semibold">
                      {order.paymentStatus === "Paid" ? "Estimated Delivery" : "Order Status"}
                    </p>
                    <p className="text-base font-bold text-gray-900">
                      {order.paymentStatus === "Paid"
                        ? tracking?.estimatedDeliveryFormatted || "Being calculated"
                        : tracking?.currentStatus || "Awaiting Payment Verification"}
                    </p>
                    <Link
                      href={`/order/${order.orderId}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Payment QR Code & Receipt →</span>
                    </Link>
                  </div>
                </div>

                {order.paymentStatus === "Paid" ? (
                <>
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="font-medium">
                      Status:{" "}
                      <strong className="text-indigo-600 font-semibold">
                        {tracking?.currentStatus || "Confirmed"}
                      </strong>
                    </span>
                    <span className="font-bold text-indigo-600 font-mono">
                      {tracking?.progressPercentage ?? 20}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${tracking?.progressPercentage ?? 20}%` }}
                    />
                  </div>
                </div>

                {/* Stepper Milestones */}
                <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {tracking?.milestones?.map((milestone, idx) => {
                    const isCompleted = milestone.isCompleted;
                    const isCurrent = milestone.isCurrent;

                    return (
                      <div key={idx} className="relative flex items-start gap-4">
                        {/* Stepper Dot */}
                        <div
                          className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            isCompleted
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/30"
                              : isCurrent
                              ? "bg-indigo-600 border-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <span className="text-[10px] font-bold">{idx + 1}</span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 transition">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <p
                              className={`text-sm font-bold ${
                                isCompleted || isCurrent ? "text-gray-900" : "text-gray-500"
                              }`}
                            >
                              {milestone.title}
                            </p>
                            <span className="text-[11px] font-medium text-gray-400 font-mono">
                              {milestone.timeFormatted}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-indigo-700 mt-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{milestone.location}</span>
                          </div>

                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {milestone.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
                    <Clock className="w-8 h-8 mx-auto text-amber-600" />
                    <h3 className="font-bold text-amber-950">
                      {order.paymentStatus === "Proof Submitted" ? "Payment proof is under review" : "Tracking will start after payment verification"}
                    </h3>
                    <p className="text-sm text-amber-800">
                      {order.paymentStatus === "Proof Submitted"
                        ? "The store will review the uploaded screenshot. Once approved, the order will be placed and tracking will activate."
                        : "Pay using the UPI QR code and upload your payment screenshot from the order page."}
                    </p>
                    <Link href={`/order/${order.orderId}`} className="inline-flex text-sm font-semibold text-indigo-700 underline">
                      Open payment and order page
                    </Link>
                  </div>
                )}

                {/* Delivery Address & Items Footer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100 text-xs">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <p className="font-bold text-slate-800 uppercase tracking-wide">
                      Delivery Address
                    </p>
                    <p className="font-semibold text-gray-900">{order.customer.name}</p>
                    <p className="text-gray-600">{order.customer.address}</p>
                    <p className="text-gray-600">
                      {order.customer.city}, {order.customer.state} — {order.customer.pincode}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                    <p className="font-bold text-slate-800 uppercase tracking-wide">
                      Package Items ({order.items.length})
                    </p>
                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-gray-700">
                          <span className="truncate max-w-[180px]">
                            {item.name} × {item.qty}
                          </span>
                          <span className="font-mono font-semibold">₹{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between font-bold text-gray-900">
                      <span>Total Amount:</span>
                      <span className="text-indigo-600 font-mono text-sm">₹{order.total}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <Link
                    href={`/order/${order.orderId}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-sm"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>Pay with UPI QR Code / View Invoice</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Helpful Info Cards if not searched yet */}
        {!searched && results.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Real-Time Progression</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Step-by-step dispatch checkpoints from warehouse safety inspection to final delivery.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">UPI QR Code</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Scan your pre-filled dynamic QR code with Google Pay, PhonePe, or Paytm anytime.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2 text-center">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Safety Guarantee</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                All helmets are packed in multi-layer shockproof boxes with tamper-proof security seals.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
