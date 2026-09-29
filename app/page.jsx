"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ProductGrid from "./components/ProductGrid";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import { PRODUCTS } from "./data/data";

export default function HomePage() {
  const [products, setProducts] = useState(PRODUCTS);
  const [whatsappNumber, setWhatsappNumber] = useState("917027888321");
  const [cart, setCart] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");

  // Fetch dynamic products and WhatsApp settings from MongoDB
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [prodRes, settRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/settings"),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (isMounted && prodData.products && prodData.products.length > 0) {
            setProducts(prodData.products);
          }
        }

        if (settRes.ok) {
          const settData = await settRes.json();
          if (isMounted && settData.settings?.whatsappNumber) {
            setWhatsappNumber(settData.settings.whatsappNumber);
          }
        }
      } catch (err) {
        console.error("Failed to fetch store data from API:", err);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = useCallback((product) => {
    const prodId = product.id || product._id;
    setCart((c) => {
      const exists = c.find((x) => (x.id || x._id) === prodId);
      if (exists) {
        return c.map((x) =>
          (x.id || x._id) === prodId ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...c, { ...product, id: prodId, qty: 1 }];
    });
    setDrawerOpen(true);
  }, []);

  const updateQty = useCallback((id, qty) => {
    setCart((c) =>
      c
        .map((x) => ((x.id || x._id) === id ? { ...x, qty: Math.max(0, qty) } : x))
        .filter((x) => x.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // Scroll helper to reveal the shop section beneath the hero + sticky header
  const scrollToShop = useCallback(() => {
    document
      .getElementById("shop-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Search handlers: update query and bring the grid into view
  const handleSearchChange = useCallback(
    (value) => {
      setQuery(value);
      if (value.trim()) scrollToShop();
    },
    [scrollToShop]
  );

  const handleSearchSubmit = useCallback(
    (value) => {
      setQuery(value);
      scrollToShop();
    },
    [scrollToShop]
  );

  // Fast + resilient filtering
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const name = p.name?.toLowerCase() ?? "";
      const desc = p.desc?.toLowerCase() ?? "";
      return name.includes(q) || desc.includes(q);
    });
  }, [products, query]);

  const cartCount = useMemo(
    () => cart.reduce((s, p) => s + p.qty, 0),
    [cart]
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header
        cartCount={cartCount}
        onCartClick={() => setDrawerOpen(true)}
        query={query}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
      />

      <Hero
        featuredHelmet={{
          id: "featured-1",
          name: "Aether Carbon — Urban",
          description: "Lightweight. Magnetic visor. City-ready.",
          img: "5.jpg",
          price: 7499,
        }}
        onShopNow={() => {
          document
            .getElementById("shop-section")
            ?.scrollIntoView({ behavior: "smooth" });
        }}
        onAddToCart={handleAddToCart}
      />

      <main
        id="shop-section"
        className="max-w-7xl mx-auto px-6 pt-20 scroll-mt-24"
      >
        <h3 className="text-lg font-semibold">Shop</h3>
        <p className="text-sm text-gray-500 mt-1">
          Curated selection — minimal interface, premium feel.
        </p>
        <ProductGrid products={filtered} onAddToCart={handleAddToCart} />
      </main>

      <Footer />

      <CartDrawer
        cart={cart}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        updateQty={updateQty}
        clearCart={clearCart}
        whatsappNumber={whatsappNumber}
      />
    </div>
  );
}
