"use client";
import React from "react";
import { ShoppingCart } from "lucide-react";
import { formatImageUrl } from "@/lib/imageUtils";

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

        </div>

        {/* RIGHT SIDE — FEATURED HELMET */}
        {featuredHelmet ? (
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl group">
            <img
              src={formatImageUrl(featuredHelmet.img)}
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
            <p className="text-sm font-semibold text-indigo-600 mt-1">
              ₹{Number(featuredHelmet.price).toLocaleString("en-IN")}
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
        ) : (
          <div className="min-h-[300px] rounded-2xl border border-dashed border-gray-300 bg-white/70 flex items-center justify-center p-8 text-center">
            <div>
              <p className="text-lg font-semibold text-gray-800">New collection coming soon</p>
              <p className="mt-2 text-sm text-gray-500">We’re updating the catalog with the store’s current products and prices.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
