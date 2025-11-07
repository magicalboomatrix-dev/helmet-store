// /components/CartDrawer.jsx
"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";

export default function CartDrawer({
  cart,
  open,
  onClose,
  updateQty,
  clearCart, 
}) {
  const closeBtnRef = useRef(null);

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

  // --- NEW: unified setter that removes when qty <= 0 or -1 ---
  const setQty = (id, nextQty) => {
    if (nextQty == null) return;
    if (nextQty <= 0) {
      // treat 0 or -1 as remove
      if (removeItem) return removeItem(id);
      // fallback: set to 0 if no removeItem handler exists
      return updateQty?.(id, 0);
    }
    updateQty?.(id, nextQty);
  };

  const dec = (id, qty) => setQty(id, qty - 1);
  const inc = (id, qty) => setQty(id, qty + 1);

  const clearAll = () => {
    if (clearCart) return clearCart();
    if (removeItem) {
      const ids = cart.map((x) => x.id);
      ids.forEach((id) => removeItem(id));
    }
  };

  const handleWhatsAppCheckout = () => {
    const phone = "917027888321"; 
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

  const Content = ({ compact = false }) => (
    <div className={`h-full flex flex-col ${compact ? "p-4" : "p-6"}`}>
      {/* Header */}
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

      {/* Items */}
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
                key={item.id}
                className="py-3 sm:py-4 flex items-center gap-3 sm:gap-4"
              >
                <img
                  src={item.img}
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
                        onClick={() => dec(item.id, item.qty)}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-md border border-gray-200 dark:border-gray-800 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm text-gray-900 dark:text-gray-100">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => inc(item.id, item.qty)}
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

      {/* Summary / Actions */}
      <div className="pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {formatINR(subtotal)}
          </span>
        </div>
        <p className="mt-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
          Taxes and shipping calculated at checkout.
        </p>

        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm sm:text-base hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            Continue
          </button>

          {cart.length > 0 ? (
            <button
              onClick={handleWhatsAppCheckout}
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-green-600 text-white text-center text-sm sm:text-base hover:bg-green-700"
            >
              Checkout via WhatsApp
            </button>
          ) : (
            <button
              disabled
              className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-gray-200 text-gray-400 text-sm cursor-not-allowed"
            >
              Checkout
            </button>
          )}
        </div>
      </div>
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
            className="fixed bottom-0 left-0 right-0 z-[60] h-[85vh] rounded-t-2xl bg-white dark:bg-gray-950 shadow-2xl sm:hidden"
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
            <Content compact />
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
            className="hidden sm:block fixed top-0 right-0 h-full w-[22rem] md:w-[26rem] bg-white dark:bg-gray-950 shadow-2xl z-[60]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            <Content />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
