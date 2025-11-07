"use client";
import React from "react";
import { ShoppingCart } from "lucide-react";

export default function Hero({ featuredHelmet, onShopNow, onAddToCart }) {
  return (
    <section className="bg-gradient-to-b from-white to-gray-100 pt-[80px] sm:pt-[80px] md:pt-[92px] lg:pt-[100px]">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-center">
        {/* LEFT CONTENT */}
        <div>
          <p className="uppercase text-sm text-indigo-600 font-semibold tracking-wide">
            Premium Craft. New Arrivals.
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mt-3 text-gray-900">
            Helmets reimagined — light, silent, sovereign.
          </h2>
          <p className="mt-4 text-gray-600 max-w-xl text-base sm:text-lg">
            Handcrafted shells, modern safety tech, and minimalist design for
            riders who crave elegance and protection in one.
          </p>

          {/* CTA BUTTON */}
          <div className="mt-8">
            <button
              onClick={onShopNow}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium shadow hover:opacity-95 active:scale-95 transition-all"
            >
              Shop Now
            </button>
          </div>

          {/* TRUST BADGES */}
          <div className="mt-10 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="bg-white rounded-full p-2 shadow">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.787 1.402 8.17L12 18.896 4.664 23.167l1.402-8.17L0.132 9.21l8.2-1.192z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">4.9 Avg. rating</p>
                <p className="text-xs text-gray-500">from 2,134 riders</p>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-200" />

            <div>
              <p className="text-sm font-semibold">Fast Shipping</p>
              <p className="text-xs text-gray-500">
                Priority delivery across India
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — FEATURED HELMET */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl group">
            <img
              src={featuredHelmet.img}
              alt={featuredHelmet.name}
              className="w-full h-[420px] sm:h-[480px] object-cover transform group-hover:scale-[1.03] transition-transform duration-500"
            />
          </div>

          {/* FLOATING CARD */}
          <div className="absolute -bottom-6 left-6 bg-white rounded-xl p-4 shadow-lg w-72 border border-gray-100 transition-all hover:shadow-xl">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Featured Helmet
            </p>
            <p className="font-semibold mt-1 text-gray-900">
              {featuredHelmet.name}
            </p>
            <p className="text-sm mt-2 text-gray-600 line-clamp-2">
              {featuredHelmet.description}
            </p>

            <button
              onClick={() => onAddToCart(featuredHelmet)}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm py-2 rounded-md hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <ShoppingCart size={16} /> Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
