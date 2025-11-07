"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ShoppingCart, Search, X } from "lucide-react";

export default function Header({
  cartCount = 0,
  onCartClick,
  onSearchChange,   // expects a string
  onSearchSubmit,   // optional: expects a string
  query = "",
}) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const rafRef = useRef(0);

  // Smooth hide/show on scroll (no stale deps)
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const last = lastScrollYRef.current;
        if (y > last && y > 80) setIsVisible(false);
        else setIsVisible(true);
        lastScrollYRef.current = y;
        rafRef.current = 0;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleInput = useCallback(
    (e) => {
      onSearchChange?.(e.target.value);
    },
    [onSearchChange]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") onSearchSubmit?.(query);
    },
    [onSearchSubmit, query]
  );

  const handleClear = useCallback(() => {
    onSearchChange?.("");
    onSearchSubmit?.("");
  }, [onSearchChange, onSearchSubmit]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-gray-200 shadow-sm transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-gray-900 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-md">
            HS
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900">
              Helmet Store
            </h1>
            <p className="text-[10px] sm:text-xs text-gray-500 -mt-0.5">
              Premium helmets — minimalist luxury
            </p>
          </div>
        </div>

        {/* Search & Cart */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial" role="search">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              value={query}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Search helmets..."
              aria-label="Search helmets"
              className="w-full sm:w-72 rounded-full border border-gray-200 pl-9 pr-9 py-2 text-sm bg-white/90 shadow-sm backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
            {query?.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1.5 inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-gray-100"
                aria-label="Clear search"
              >
                <X size={16} className="text-gray-500" />
              </button>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={onCartClick}
            className="flex items-center gap-2 bg-white/90 border border-gray-200 px-3 py-2 rounded-full shadow-sm hover:shadow-md transition-all flex-shrink-0 backdrop-blur-sm"
            aria-label="Open cart"
          >
            <ShoppingCart size={18} className="text-gray-700" />
            <span className="hidden sm:inline text-sm font-medium text-gray-800">
              Cart
            </span>
            {cartCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-indigo-600 text-white rounded-full">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
