// /components/CartDrawer.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Trash2,
  ArrowLeft,
  Truck,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  QrCode,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { formatImageUrl } from "@/lib/imageUtils";

export default function CartDrawer({
  cart,
  open,
  onClose,
  updateQty,
  clearCart,
  whatsappNumber = "917027888321",
}) {
  const router = useRouter();
  const closeBtnRef = useRef(null);

  // View state: 'cart' | 'checkout'
  const [view, setView] = useState("cart");

  // Checkout form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "India",
    pincode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formatINR = (v) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(v);

  const subtotal = useMemo(
    () => cart.reduce((s, p) => s + p.price * p.qty, 0),
    [cart]
  );

  // Reset view when drawer closes
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setView("cart");
        setErrorMsg("");
      }, 300);
    }
  }, [open]);

  // esc to close + scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();

    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const setQty = (id, nextQty) => {
    if (nextQty == null) return;
    if (nextQty <= 0) {
      return updateQty?.(id, 0);
    }
    updateQty?.(id, nextQty);
  };

  const dec = (id, qty) => setQty(id, qty - 1);
  const inc = (id, qty) => setQty(id, qty + 1);

  const clearAll = () => {
    if (clearCart) return clearCart();
  };

  const handleWhatsAppCheckout = () => {
    const phone = whatsappNumber || "917027888321";
    const total = formatINR(subtotal);

    const messageLines = [
      "🛒 *Helmet Store Order*",
      "",
      ...cart.map(
        (item, i) =>
          `${i + 1}) *${item.name}*\nQty: ${item.qty}\nPrice: ${formatINR(
            item.price * item.qty
          )}`
      ),
      "",
      "——————————————",
      `*Subtotal:* ${total}`,
      "——————————————",
      "Please confirm my order 🙌",
    ];

    const message = encodeURIComponent(messageLines.join("\n"));
    const url = `https://wa.me/${phone}?text=${message}`;
    window.open(url, "_blank");
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim()) {
      setErrorMsg("Please fill in your name, phone, address, and city.");
      return;
    }

    if (formData.phone.replace(/[^\d]/g, "").length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items: cart,
          paymentMethod: "UPI",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create order");
      }

      // Order created successfully
      const createdOrderId = data.order.orderId;
      if (clearCart) clearCart();
      if (onClose) onClose();

      // Navigate to order page with UPI QR code & live tracking
      router.push(`/order/${createdOrderId}`);
    } catch (err) {
      console.error("Order submission error:", err);
      setErrorMsg(err.message || "Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = (compact = false) => (
    <div className={`h-full flex flex-col ${compact ? "p-4" : "p-6"}`}>
      {view === "cart" ? (
        <>
          {/* Cart Header */}
          <div className="flex items-center justify-between">
            <h4
              id="cart-title"
              className="font-semibold text-lg text-gray-900 dark:text-white"
            >
              Your Cart
            </h4>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/20"
                  aria-label="Clear cart"
                  title="Clear cart"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </button>
              )}
              <button
                ref={closeBtnRef}
                onClick={onClose}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1.5 sm:p-2"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className={`${compact ? "mt-3" : "mt-6"} flex-1 overflow-auto`}>
            {cart.length === 0 ? (
              <div className="h-full grid place-items-center text-center px-4">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Your cart is empty. Add a helmet to begin.
                </p>
                <Link
                  href="/"
                  onClick={onClose}
                  className="inline-block px-4 py-2 text-sm rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90"
                >
                  Continue shopping
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {cart.map((item) => (
                  <li
                    key={item.id || item._id}
                    className="py-3 sm:py-4 flex items-center gap-3 sm:gap-4"
                  >
                    <img
                      src={formatImageUrl(item.img)}
                      alt={item.name}
                      className="w-16 h-12 sm:w-20 sm:h-16 object-cover rounded-md border border-gray-100 dark:border-gray-800"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {formatINR(item.price)} each
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-2 sm:gap-3">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => dec(item.id || item._id, item.qty)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-gray-200 dark:border-gray-800 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
                            aria-label={`Decrease quantity of ${item.name}`}
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm text-gray-900 dark:text-gray-100">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => inc(item.id || item._id, item.qty)}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-gray-200 dark:border-gray-800 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
                            aria-label={`Increase quantity of ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {formatINR(item.price * item.qty)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cart Summary / Actions */}
          {cart.length > 0 && (
            <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800 mt-2 space-y-3">
              <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatINR(subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-600 font-medium">
                <span>Delivery Shipping</span>
                <span className="uppercase font-bold tracking-wide">Free</span>
              </div>

              {/* Primary Action: Proceed to Checkout */}
              <button
                onClick={() => setView("checkout")}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base transition shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <span className="text-indigo-200">({formatINR(subtotal)})</span>
              </button>

              {/* Secondary Action: WhatsApp Quick Order */}
              <button
                onClick={handleWhatsAppCheckout}
                className="w-full py-2.5 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 font-medium text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Quick Order via WhatsApp</span>
              </button>
            </div>
          )}
        </>
      ) : (
        /* CHECKOUT / SHIPPING DETAILS FORM VIEW */
        <div className="h-full flex flex-col">
          {/* Checkout Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setView("cart")}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Cart</span>
            </button>
            <h4 className="font-semibold text-base text-gray-900 dark:text-white">
              Shipping Details
            </h4>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Error Banner */}
          {errorMsg && (
            <div className="mt-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Checkout Form */}
          <form
            onSubmit={handlePlaceOrder}
            className="flex-1 overflow-y-auto pt-3 space-y-3.5 text-xs sm:text-sm"
          >
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value.replace(/[^\d]/g, ""),
                    })
                  }
                  placeholder="10-digit number"
                  maxLength={10}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="For tracking receipt"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                Delivery Street Address *
              </label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Flat / House No., Building Name, Street / Locality"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Bengaluru"
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pincode: e.target.value.replace(/[^\d]/g, ""),
                    })
                  }
                  placeholder="6-digit PIN"
                  maxLength={6}
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Karnataka"
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Payment Info Card */}
            <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-semibold">
                <QrCode className="w-4 h-4" />
                <span>UPI Payment & Live Journey</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                After placing the order, you will receive your dynamic UPI QR code to pay via GPay / PhonePe / Paytm and instant live delivery tracking history!
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm sm:text-base transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Placing Your Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Order & Pay {formatINR(subtotal)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/50 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* MOBILE: bottom sheet (slide up) */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="mobile"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="fixed bottom-0 left-0 right-0 z-[60] h-[88vh] rounded-t-2xl bg-white dark:bg-gray-950 shadow-2xl sm:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose?.();
            }}
          >
            {/* grab handle */}
            <div className="absolute left-1/2 -top-3 h-6 -translate-x-1/2">
              <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300 dark:bg-gray-700" />
            </div>
            {renderContent(true)}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* DESKTOP/TABLET: right drawer (slide in) */}
      <AnimatePresence>
        {open && (
          <motion.aside
            key="desktop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="hidden sm:block fixed top-0 right-0 h-full w-[24rem] md:w-[28rem] bg-white dark:bg-gray-950 shadow-2xl z-[60]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {renderContent()}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
