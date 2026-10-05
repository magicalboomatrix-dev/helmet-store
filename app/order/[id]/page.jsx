"use client";

import React, { useCallback, useEffect, useRef, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Package,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  QrCode,
  Smartphone,
  Navigation,
  Upload,
} from "lucide-react";
import { formatImageUrl } from "@/lib/imageUtils";

export default function OrderConfirmationPage({ params }) {
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [proofError, setProofError] = useState("");
  const proofInputRef = useRef(null);

  const fetchOrderDetails = useCallback(async ({ quiet = false } = {}) => {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order not found");
      }
      setOrder(data.order);
      setTracking(data.tracking);
      setSettings(data.settings);
    } catch (err) {
      console.error("Order fetch error:", err);
      if (!quiet) {
        setError(err.message || "Could not load order details.");
      }
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [orderId]);

  const handleUploadProof = async (event) => {
    event.preventDefault();
    if (!proofFile) {
      setProofError("Choose your payment screenshot first.");
      return;
    }

    setUploadingProof(true);
    setProofError("");
    try {
      const payload = new FormData();
      payload.append("proof", proofFile);
      const response = await fetch(`/api/orders/${orderId}/payment-proof`, {
        method: "POST",
        body: payload,
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not upload payment screenshot.");
      }

      setProofFile(null);
      if (proofInputRef.current) proofInputRef.current.value = "";
      await fetchOrderDetails({ quiet: true });
    } catch (uploadError) {
      setProofError(uploadError.message || "Could not upload payment screenshot.");
    } finally {
      setUploadingProof(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
    const refreshTimer = setInterval(() => {
      if (orderId) fetchOrderDetails({ quiet: true });
    }, 15000);
    return () => clearInterval(refreshTimer);
  }, [orderId, fetchOrderDetails]);

  const copyUPI = (upiId) => {
    if (!upiId) return;
    navigator.clipboard.writeText(upiId);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-600">
            Loading your order details & live tracking...
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Order Not Found</h2>
          <p className="text-sm text-gray-600">
            {error || `We couldn't locate order #${orderId}. Please check the Order ID.`}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href={`/account?returnTo=${encodeURIComponent(`/order/${orderId}`)}`}
              className="w-full py-2.5 bg-indigo-600 text-white font-semibold text-sm rounded-xl hover:bg-indigo-700 transition"
            >
              Sign in to view this order
            </Link>
            <Link
              href="/track"
              className="w-full py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Search Your Order
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const upiId = settings?.upiId || "helmetstore@upi";
  const upiPayee = settings?.upiPayeeName || "Helmet Store";
  const whatsappPhone = settings?.whatsappNumber || "917027888321";

  // Standard NPCI UPI URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    upiPayee
  )}&am=${order.total}&cu=INR&tn=${encodeURIComponent("Order " + order.orderId)}`;

  // Formatted WhatsApp message for sending payment confirmation
  const whatsappMessage = encodeURIComponent(
    [
      "🛒 *Helmet Store Order Confirmation*",
      `*Order ID:* #${order.orderId}`,
      `*Total Amount:* ₹${order.total}`,
      `*Customer Name:* ${order.customer.name}`,
      `*Phone:* ${order.customer.phone}`,
      `*Delivery City:* ${order.customer.city}, ${order.customer.pincode}`,
      "",
      "I have sent the payment via UPI. Please find my payment screenshot attached 🙌",
    ].join("\n")
  );

  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-900 hover:opacity-80 transition">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-900 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              HS
            </div>
            <span className="font-bold text-base tracking-tight">Helmet Store</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/track"
              className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
            >
              Track Another Order
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
            >
              Shop More
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* SUCCESS BANNER */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{order.paymentStatus === "Paid" ? "Order Placed" : "Order Received"}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Thank You, {order.customer.name}!
            </h1>
            <p className="text-emerald-100 text-sm max-w-xl">
              {order.paymentStatus === "Paid"
                ? <>Payment verified. Order <span className="font-bold font-mono text-white">#{order.orderId}</span> is placed and its delivery tracking is active.</>
                : <>Order <span className="font-bold font-mono text-white">#{order.orderId}</span> is reserved. Pay by UPI and upload the screenshot; tracking starts after admin verification.</>}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:text-right shrink-0">
            <p className="text-xs uppercase text-emerald-200 font-medium">Total Amount</p>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-0.5">
              ₹{order.total}
            </p>
            <p className="text-[11px] text-emerald-200 mt-1">
              {order.paymentStatus === "Paid" ? (
                <>Estimated Delivery: <strong>{tracking?.estimatedDeliveryFormatted || "Being calculated"}</strong></>
              ) : (
                <strong>Tracking begins after payment verification</strong>
              )}
            </p>
          </div>
        </div>

        {/* TWO-COLUMN GRID: PAYMENT QR (LEFT) + LIVE TRACKING TIMELINE (RIGHT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* COLUMN 1: UPI PAYMENT QR CODE (5 COLS) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-indigo-600" />
                  <span>Pay via UPI QR Code</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Scan with GPay, PhonePe, Paytm, or BHIM
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                order.paymentStatus === "Paid"
                  ? "bg-emerald-100 text-emerald-700"
                  : order.paymentStatus === "Proof Submitted"
                  ? "bg-indigo-100 text-indigo-700"
                  : order.paymentStatus === "Proof Rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {order.paymentStatus}
              </span>
            </div>

            {/* QR Code Container */}
            <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner">
              <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-100">
                <QRCodeSVG
                  value={upiUri}
                  size={190}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "/favicon.ico",
                    x: undefined,
                    y: undefined,
                    height: 28,
                    width: 28,
                    excavate: true,
                  }}
                />
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Amount to Pay
                </p>
                <p className="text-2xl font-extrabold text-indigo-700 font-mono mt-0.5">
                  ₹{order.total}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Reference: Order #{order.orderId}
                </p>
              </div>

              {/* Supported UPI Apps Badges */}
              <div className="mt-4 pt-3 border-t border-gray-200/80 w-full flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px]">Google Pay</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px]">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px]">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px]">BHIM</span>
              </div>
            </div>

            {/* UPI ID Copy Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase text-gray-500">
                Store UPI ID
              </label>
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-gray-800">
                <span className="truncate">{upiId}</span>
                <button
                  onClick={() => copyUPI(upiId)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 shrink-0 ml-2"
                >
                  {copiedUPI ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile UPI Direct Intent Button */}
            <a
              href={upiUri}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-md flex items-center justify-center gap-2 sm:hidden"
            >
              <Smartphone className="w-4 h-4" />
              <span>Pay with Installed UPI App</span>
            </a>

            {/* Payment screenshot upload */}
            {order.paymentStatus === "Paid" ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
                Payment verified by the store. Your order is placed.
              </div>
            ) : (
              <form onSubmit={handleUploadProof} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Payment Screenshot</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    {order.paymentStatus === "Proof Submitted"
                      ? "Screenshot received. Waiting for the store to verify your payment."
                      : order.paymentStatus === "Proof Rejected"
                      ? "The store could not verify the last screenshot. Upload a clear, correct proof and try again."
                      : "After paying, upload a screenshot of the successful UPI transaction."}
                  </p>
                </div>

                {order.paymentProof?.hasImage && order.paymentStatus === "Proof Submitted" && (
                  <p className="text-xs font-semibold text-indigo-700">Screenshot is received and waiting for verification.</p>
                )}
                {order.paymentProof?.reviewNote && order.paymentStatus === "Proof Rejected" && (
                  <p className="text-xs text-red-700">Store note: {order.paymentProof.reviewNote}</p>
                )}

                <input
                  ref={proofInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                  capture="environment"
                  onChange={(event) => {
                    setProofFile(event.target.files?.[0] || null);
                    setProofError("");
                  }}
                  className="block w-full text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-3 file:py-2 file:font-semibold file:text-indigo-700"
                />
                <p className="text-[11px] text-slate-500">JPEG, PNG, WebP, or HEIC; maximum 5 MB.</p>
                {proofError && <p role="alert" className="text-xs text-red-600">{proofError}</p>}
                <button
                  type="submit"
                  disabled={uploadingProof || !proofFile}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  {uploadingProof ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{uploadingProof ? "Uploading proof..." : order.paymentStatus === "Proof Submitted" ? "Replace Screenshot" : "Upload Payment Proof"}</span>
                </button>
              </form>
            )}

            {/* WhatsApp Confirmation Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-md flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Need payment help? Chat on WhatsApp</span>
            </a>
          </div>

          {/* COLUMN 2: AUTOMATED DELIVERY TRACKING TIMELINE (7 COLS) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-indigo-600" />
                  <span>Live Delivery Journey</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Automated milestone updates from origin hub to your doorstep
                </p>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Navigation className="w-3 h-3 text-indigo-600" />
                  <span>{tracking?.currentStatus || "Awaiting Payment Verification"}</span>
                </span>
              </div>
            </div>

            {order.paymentStatus !== "Paid" ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
                <Clock className="w-8 h-8 mx-auto text-amber-600" />
                <h4 className="font-bold text-amber-950">
                  {order.paymentStatus === "Proof Submitted" ? "Payment proof under review" : "Tracking starts after payment verification"}
                </h4>
                <p className="text-sm text-amber-800">
                  {order.paymentStatus === "Proof Submitted"
                    ? "The store will verify your UPI screenshot. Once approved, your order will be placed and live tracking will begin."
                    : "Complete the UPI payment and upload its screenshot. Your order is not marked placed until the store approves the proof."}
                </p>
              </div>
            ) : (
              <>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                <span>Journey Progress</span>
                <span className="font-bold text-indigo-600">
                  {tracking?.progressPercentage ?? 15}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${tracking?.progressPercentage ?? 15}%` }}
                />
              </div>
            </div>

            {/* Timeline Milestones Stepper */}
            <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {tracking?.milestones?.map((milestone, idx) => {
                const isCompleted = milestone.isCompleted;
                const isCurrent = milestone.isCurrent;

                return (
                  <div key={idx} className="relative flex items-start gap-4 group">
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
                    <div className="flex-1 min-w-0 bg-gray-50/60 hover:bg-gray-50 p-3 rounded-2xl border border-gray-100 transition">
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

            {/* Delivery Destination Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-gray-700 space-y-1">
              <p className="font-bold text-indigo-900 uppercase tracking-wide">
                Destination Address
              </p>
              <p className="font-semibold text-gray-900">{order.customer.name}</p>
              <p>{order.customer.address}</p>
              <p>
                {order.customer.city}, {order.customer.state} — {order.customer.pincode}
              </p>
              <p className="text-gray-500 pt-0.5">Phone: +{order.customer.phone}</p>
            </div>
              </>
            )}
          </div>
        </div>

        {/* ORDER ITEMS SUMMARY */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 space-y-4">
          <h3 className="font-bold text-base text-gray-900">
            Order Items ({order.items.length})
          </h3>

          <div className="divide-y divide-gray-100">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                    <Image
                      src={formatImageUrl(item.img)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty} × ₹{item.price}</p>
                  </div>
                </div>

                <p className="text-sm font-bold text-gray-900 font-mono">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-600">Total Paid / Payable</span>
            <span className="text-xl font-bold font-mono text-indigo-600">
              ₹{order.total}
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
