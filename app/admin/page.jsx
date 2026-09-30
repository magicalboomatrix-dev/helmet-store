"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Settings as SettingsIcon,
  Phone,
  RefreshCw,
  ExternalLink,
  Search,
  Upload,
  Star,
  CheckCircle,
  AlertTriangle,
  X,
  Layers,
  Sparkles,
  Eye,
  Lock,
  LogOut,
  ShieldCheck,
  KeyRound,
  EyeOff,
  Truck,
  QrCode,
  CreditCard,
  MapPin,
  User,
  Calendar,
  ChevronRight,
  Clock,
  Navigation,
} from "lucide-react";
import { formatImageUrl, getProductImages } from "@/lib/imageUtils";

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  // Store & Catalog State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("products"); // 'products' | 'orders' | 'settings' | 'seed'
  const [toast, setToast] = useState(null);

  // Orders Management State
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersSearch, setOrdersSearch] = useState("");
  const [ordersFilterStatus, setOrdersFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteOrderConfirmId, setDeleteOrderConfirmId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Settings State
  const [settings, setSettings] = useState({
    whatsappNumber: "917027888321",
    storeName: "Helmet Store",
    upiId: "helmetstore@upi",
    upiPayeeName: "Helmet Store",
    originCity: "Central Warehouse, New Delhi",
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "10",
    weight: "1.3 kg",
    rating: "4.8",
    desc: "",
    img: "1.jpg",
    images: [],
    colors: [],
    features: [],
    isFeatured: false,
  });

  const [colorInput, setColorInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem("helmet_admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
      fetchData();
    }
    setAuthChecking(false);
  }, []);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid username or password");
      }

      localStorage.setItem("helmet_admin_auth", "true");
      setIsAuthenticated(true);
      fetchData();
      showToast("Signed in successfully as Admin!");
    } catch (err) {
      setLoginError(err.message || "Failed to log in");
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("helmet_admin_auth");
    setIsAuthenticated(false);
    showToast("Signed out successfully");
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, settRes, ordRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/settings"),
        fetch("/api/orders"),
      ]);

      const prodData = await prodRes.json();
      if (prodData.success && prodData.products) {
        setProducts(prodData.products);
      }

      const settData = await settRes.json();
      if (settData.success && settData.settings) {
        setSettings(settData.settings);
      }

      const ordData = await ordRes.json();
      if (ordData.success && ordData.orders) {
        setOrders(ordData.orders);
      }
    } catch (err) {
      console.error("Error fetching admin data:", err);
      showToast("Failed to load store data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Order Update handler (payment status, tracking milestone)
  const handleUpdateOrder = async (orderId, updateFields) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateFields),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update order");
      }
      showToast(`Order #${orderId} updated!`);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? data.order : o))
      );
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(data.order);
      }
    } catch (err) {
      console.error("Order update error:", err);
      showToast(err.message || "Failed to update order", "error");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Order Delete handler
  const handleDeleteOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete order");
      }
      showToast(`Order #${orderId} deleted successfully`);
      setDeleteOrderConfirmId(null);
      setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Order delete error:", err);
      showToast(err.message || "Failed to delete order", "error");
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let list = orders;
    if (ordersFilterStatus !== "all") {
      list = list.filter((o) => o.paymentStatus === ordersFilterStatus);
    }
    const q = ordersSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (o) =>
        o.orderId?.toLowerCase().includes(q) ||
        o.customer?.name?.toLowerCase().includes(q) ||
        o.customer?.phone?.includes(q) ||
        o.customer?.city?.toLowerCase().includes(q)
    );
  }, [orders, ordersFilterStatus, ordersSearch]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.desc?.toLowerCase().includes(q)
    );
  }, [products, search]);

  // Open modal for new product
  const handleOpenNew = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: "",
      stock: "10",
      weight: "1.3 kg",
      rating: "4.8",
      desc: "",
      img: "1.jpg",
      images: ["1.jpg"],
      colors: ["Matte Black"],
      features: [
        "Lightweight impact-resistant shell",
        "Anti-fog quick release visor",
        "Breathable comfort liner",
      ],
      isFeatured: false,
    });
    setColorInput("");
    setFeatureInput("");
    setUrlInput("");
    setModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    const allImgs = getProductImages(p);
    setFormData({
      name: p.name || "",
      price: String(p.price || ""),
      stock: String(p.stock ?? 10),
      weight: p.weight || "1.3 kg",
      rating: String(p.rating || 4.8),
      desc: p.desc || "",
      img: p.img || (allImgs[0] ? allImgs[0] : "1.jpg"),
      images: allImgs,
      colors: Array.isArray(p.colors) ? [...p.colors] : [],
      features: Array.isArray(p.features) ? [...p.features] : [],
      isFeatured: Boolean(p.isFeatured),
    });
    setColorInput("");
    setFeatureInput("");
    setUrlInput("");
    setModalOpen(true);
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.img) {
      showToast("Please provide Helmet Name, Price, and at least one image.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        weight: formData.weight.trim(),
        rating: Number(formData.rating),
        desc: formData.desc.trim(),
        img: formData.img.trim(),
        images: formData.images.length > 0 ? formData.images : [formData.img.trim()],
        colors: formData.colors,
        features: formData.features,
        isFeatured: formData.isFeatured,
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id || editingProduct._id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save product");
      }

      showToast(
        editingProduct
          ? `Updated "${formData.name}" successfully!`
          : `Created "${formData.name}" successfully!`
      );
      setModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Save product error:", err);
      showToast(err.message || "Failed to save product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete");
      }
      showToast("Product deleted successfully");
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      showToast(err.message || "Failed to delete product", "error");
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }
      setSettings(data.settings);
      showToast("WhatsApp number & store settings updated!");
    } catch (err) {
      console.error("Save settings error:", err);
      showToast(err.message || "Failed to update settings", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  // Seed Catalog
  const handleSeedDatabase = async (force = false) => {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to seed database");
      }
      showToast(data.message || "Database seeded successfully!");
      fetchData();
    } catch (err) {
      console.error("Seed error:", err);
      showToast(err.message || "Seeding failed", "error");
    } finally {
      setSeeding(false);
    }
  };

  // Multiple Image Management
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const form = new FormData();
      for (let i = 0; i < files.length; i++) {
        form.append("files", files[i]);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      const newUrls = data.urls || [data.url];
      setFormData((prev) => {
        const updatedImages = [...prev.images, ...newUrls];
        const primary = prev.img || newUrls[0];
        return {
          ...prev,
          images: updatedImages,
          img: primary,
        };
      });

      showToast(`Uploaded ${newUrls.length} image(s)!`);
    } catch (err) {
      console.error("Image upload error:", err);
      showToast(err.message || "Failed to upload image", "error");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    setFormData((prev) => {
      const updated = prev.images.includes(url)
        ? prev.images
        : [...prev.images, url];
      return {
        ...prev,
        images: updated,
        img: prev.img || url,
      };
    });
    setUrlInput("");
  };

  const handleSetPrimaryImage = (imgUrl) => {
    setFormData((prev) => ({
      ...prev,
      img: imgUrl,
    }));
  };

  const handleRemoveImage = (imgUrl) => {
    setFormData((prev) => {
      const filtered = prev.images.filter((x) => x !== imgUrl);
      const nextPrimary =
        prev.img === imgUrl ? (filtered[0] || "") : prev.img;
      return {
        ...prev,
        images: filtered,
        img: nextPrimary,
      };
    });
  };

  // Color tags
  const handleAddColor = () => {
    if (!colorInput.trim()) return;
    if (!formData.colors.includes(colorInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, colorInput.trim()],
      }));
    }
    setColorInput("");
  };

  const handleRemoveColor = (col) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== col),
    }));
  };

  // Feature tags
  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, featureInput.trim()],
    }));
    setFeatureInput("");
  };

  const handleRemoveFeature = (idx) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  // Loading Screen while checking session
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // LOGIN SCREEN (if not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/60 relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo & Heading */}
          <div className="text-center mb-8 relative">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shadow-indigo-500/25 mb-4">
              HS
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Admin Login
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to manage helmets, multi-images & WhatsApp orders
            </p>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Admin Username / Email
              </label>
              <input
                type="text"
                required
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                placeholder="admin@helmetstore.com"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  placeholder="Enter admin password"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-400 inline-flex items-center gap-1 transition"
            >
              <span>← Back to storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD (when authenticated)
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-medium ${
              toast.type === "error"
                ? "bg-red-950/90 text-red-200 border-red-700"
                : "bg-emerald-950/90 text-emerald-200 border-emerald-700"
            }`}
          >
            {toast.type === "error" ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* TOP HEADER */}
      <header className="border-b border-slate-800 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              HS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  Helmet Store Admin
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Authenticated</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage helmets, multiple product images & WhatsApp checkout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">View Storefront</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium bg-red-950/50 hover:bg-red-900/60 border border-red-800/80 text-red-300 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* STATS OVERVIEW CARDS */}
        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-medium text-slate-400">
                Total Helmets
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {products.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs uppercase font-medium text-slate-400">
                  Total Orders
                </p>
                {orders.filter((o) => o.paymentStatus === "Pending").length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {orders.filter((o) => o.paymentStatus === "Pending").length} pending
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {orders.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-medium text-slate-400">
                UPI QR Payee
              </p>
              <p className="text-xs font-semibold text-indigo-300 mt-1 font-mono truncate max-w-[140px]">
                {settings.upiId || "helmetstore@upi"}
              </p>
              <p className="text-[10px] text-slate-500">
                {settings.upiPayeeName || "Helmet Store"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-medium text-slate-400">
                WhatsApp Orders To
              </p>
              <p className="text-sm font-semibold text-emerald-400 mt-1 font-mono">
                +{settings.whatsappNumber || "917027888321"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "products"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Products Catalog</span>
            <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-900/60 text-slate-300">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "orders"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Orders & Live Tracking</span>
            <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-slate-900/60 text-slate-300">
              {orders.length}
            </span>
            {orders.some((o) => o.paymentStatus === "Pending") && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Pending orders require review" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "settings"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>UPI, WhatsApp & Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("seed")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
              activeTab === "seed"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Catalog Seeder</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS LIST */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search helmets by name or keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <button
                onClick={handleOpenNew}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Helmet</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Helmet</th>
                      <th className="px-4 py-3.5">Price</th>
                      <th className="px-4 py-3.5">Stock</th>
                      <th className="px-4 py-3.5">Images</th>
                      <th className="px-4 py-3.5">Rating</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                          Loading helmets from MongoDB...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-12 text-slate-400">
                          No helmets found. Click "Add New Helmet" or run the Seeder!
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const imgs = getProductImages(p);
                        const id = p.id || p._id;
                        return (
                          <tr
                            key={id}
                            className="hover:bg-slate-800/50 transition group"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="relative w-14 h-12 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-700">
                                  <Image
                                    src={formatImageUrl(p.img)}
                                    alt={p.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-white truncate max-w-[200px] sm:max-w-xs">
                                    {p.name}
                                  </p>
                                  <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                                    {p.desc || "No description"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-3 font-semibold text-slate-100 font-mono">
                              ₹{p.price}
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  (p.stock ?? 10) > 10
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : (p.stock ?? 10) > 0
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {p.stock ?? 10} in stock
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-300">
                                  <Layers className="w-3 h-3 text-indigo-400" />
                                  {imgs.length} {imgs.length === 1 ? "img" : "imgs"}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 text-amber-400 font-medium text-xs">
                                <Star className="w-3.5 h-3.5 fill-amber-400" />
                                <span>{p.rating ?? 4.8}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 rounded-lg transition"
                                  title="Edit Helmet"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(id)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-lg transition"
                                  title="Delete Helmet"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS MANAGEMENT & LIVE TRACKING */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Action & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search orders by ID (HS-...), customer name, phone, or city..."
                  value={ordersSearch}
                  onChange={(e) => setOrdersSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Status Filter Badges */}
              <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
                {[
                  { id: "all", label: "All", count: orders.length },
                  {
                    id: "Pending",
                    label: "Pending",
                    count: orders.filter((o) => o.paymentStatus === "Pending").length,
                  },
                  {
                    id: "Paid",
                    label: "Paid",
                    count: orders.filter((o) => o.paymentStatus === "Paid").length,
                  },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setOrdersFilterStatus(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      ordersFilterStatus === st.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{st.label}</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px]">
                      {st.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3.5">Order ID</th>
                      <th className="px-4 py-3.5">Customer & City</th>
                      <th className="px-4 py-3.5">Items</th>
                      <th className="px-4 py-3.5">Total Amount</th>
                      <th className="px-4 py-3.5">Payment</th>
                      <th className="px-4 py-3.5">Delivery Stage</th>
                      <th className="px-4 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {ordersLoading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-slate-400">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                          Loading orders from MongoDB...
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-slate-400">
                          <Truck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="font-semibold text-slate-300">No customer orders found</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Orders placed by customers in the store will appear here automatically.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => {
                        const dateFormatted = new Date(o.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });

                        return (
                          <tr key={o.orderId} className="hover:bg-slate-800/50 transition group">
                            {/* Order ID */}
                            <td className="px-4 py-3.5">
                              <div>
                                <Link
                                  href={`/order/${o.orderId}`}
                                  target="_blank"
                                  className="font-mono text-sm font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
                                >
                                  <span>#{o.orderId}</span>
                                  <ExternalLink className="w-3 h-3 opacity-60" />
                                </Link>
                                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                                  {dateFormatted}
                                </p>
                              </div>
                            </td>

                            {/* Customer & City */}
                            <td className="px-4 py-3.5">
                              <div>
                                <p className="font-semibold text-white truncate max-w-[160px]">
                                  {o.customer.name}
                                </p>
                                <p className="text-xs text-slate-400 font-mono">
                                  +{o.customer.phone}
                                </p>
                                <p className="text-[11px] text-indigo-300 truncate max-w-[160px] flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  <span>{o.customer.city}</span>
                                </p>
                              </div>
                            </td>

                            {/* Items */}
                            <td className="px-4 py-3.5">
                              <div>
                                <span className="font-semibold text-slate-200">
                                  {o.items?.length || 0} item{(o.items?.length || 0) === 1 ? "" : "s"}
                                </span>
                                <p className="text-xs text-slate-400 truncate max-w-[150px]">
                                  {o.items?.map((it) => it.name).join(", ")}
                                </p>
                              </div>
                            </td>

                            {/* Total Amount */}
                            <td className="px-4 py-3.5 font-mono font-bold text-emerald-400 text-sm">
                              ₹{o.total}
                            </td>

                            {/* Payment Status + Quick Toggle */}
                            <td className="px-4 py-3.5">
                              <div className="space-y-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    o.paymentStatus === "Paid"
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {o.paymentStatus}
                                </span>

                                <div>
                                  <button
                                    onClick={() =>
                                      handleUpdateOrder(o.orderId, {
                                        paymentStatus:
                                          o.paymentStatus === "Paid" ? "Pending" : "Paid",
                                      })
                                    }
                                    disabled={updatingOrderId === o.orderId}
                                    className="text-[11px] text-slate-400 hover:text-indigo-400 underline transition"
                                  >
                                    {o.paymentStatus === "Paid" ? "Mark Pending" : "Mark as Paid"}
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Delivery Tracking Stage Dropdown */}
                            <td className="px-4 py-3.5">
                              <select
                                value={o.trackingStatus || "Auto"}
                                onChange={(e) =>
                                  handleUpdateOrder(o.orderId, {
                                    trackingStatus: e.target.value,
                                  })
                                }
                                disabled={updatingOrderId === o.orderId}
                                className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                              >
                                <option value="Auto">Auto (Time Elapsed)</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Packed">Packed</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="In Transit">In Transit</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => setSelectedOrder(o)}
                                  className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition"
                                  title="View Order Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <Link
                                  href={`/track?q=${o.orderId}`}
                                  target="_blank"
                                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                                  title="Live Tracking Page"
                                >
                                  <Navigation className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => setDeleteOrderConfirmId(o.orderId)}
                                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS (WHATSAPP, UPI & STORE CONFIG) */}
        {activeTab === "settings" && (
          <div className="max-w-3xl bg-slate-800/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-indigo-400" />
                <span>Store, UPI & WhatsApp Configuration</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Configure your payment UPI QR code, warehouse origin, and WhatsApp customer confirmation line.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs uppercase font-medium text-slate-300 mb-1.5">
                  WhatsApp Orders Destination Phone Number (with country code)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono">
                    +
                  </span>
                  <input
                    type="text"
                    required
                    value={settings.whatsappNumber}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        whatsappNumber: e.target.value.replace(/[^\d]/g, ""),
                      })
                    }
                    placeholder="917027888321"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Format: Country code + phone number (e.g. <code>917027888321</code> for India).
                </p>
              </div>

              {/* UPI ID & Payee Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-medium text-slate-300 mb-1.5">
                    Store UPI ID (VPA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={settings.upiId || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, upiId: e.target.value })
                    }
                    placeholder="e.g. helmetstore@upi or 9876543210@paytm"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 font-mono text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Embedded into the customer payment QR code.
                  </p>
                </div>

                <div>
                  <label className="block text-xs uppercase font-medium text-slate-300 mb-1.5">
                    UPI Payee Name
                  </label>
                  <input
                    type="text"
                    value={settings.upiPayeeName || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, upiPayeeName: e.target.value })
                    }
                    placeholder="e.g. Helmet Store"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Displayed in customer UPI apps (GPay / PhonePe / Paytm).
                  </p>
                </div>
              </div>

              {/* Warehouse Origin City */}
              <div>
                <label className="block text-xs uppercase font-medium text-slate-300 mb-1.5">
                  Warehouse Origin City / Hub (Tracking Engine)
                </label>
                <input
                  type="text"
                  value={settings.originCity || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, originCity: e.target.value })
                  }
                  placeholder="Central Warehouse, New Delhi"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Starting point for automated delivery tracking progression towards customer city.
                </p>
              </div>

              {/* Store Display Name */}
              <div>
                <label className="block text-xs uppercase font-medium text-slate-300 mb-1.5">
                  Store Display Name
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) =>
                    setSettings({ ...settings, storeName: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                <p className="text-xs font-semibold text-slate-300 uppercase">
                  Configuration Preview
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">UPI Payment VPA:</span>
                    <span className="font-mono text-indigo-400 font-semibold">{settings.upiId || "None"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">WhatsApp Support:</span>
                    <span className="font-mono text-emerald-400 font-semibold">+{settings.whatsappNumber}</span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
                    "Hello! Testing Helmet Store WhatsApp order confirmation route 🙌"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Send a test ping to WhatsApp number</span>
                </a>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingSettings ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: SEEDER */}
        {activeTab === "seed" && (
          <div className="max-w-2xl bg-slate-800/40 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>MongoDB Catalog Seeder</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Populate your MongoDB database with all 27 original helmets from{" "}
                <code className="text-indigo-300">app/data/data.js</code>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-slate-200">
                    How the Seeder Works:
                  </p>
                  <p className="mt-1">
                    • <strong>Safe Seed (Default)</strong>: Will only insert helmets if the database is currently empty.
                  </p>
                  <p className="mt-0.5">
                    • <strong>Force Reset</strong>: Clears all products from MongoDB and re-inserts the 27 original helmets cleanly.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSeedDatabase(false)}
                disabled={seeding}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {seeding ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Seed Database (If Empty)</span>
              </button>

              <button
                onClick={() => {
                  if (
                    confirm(
                      "Are you sure you want to reset the catalog? This will overwrite existing products with the 27 starter helmets."
                    )
                  ) {
                    handleSeedDatabase(true);
                  }
                }}
                disabled={seeding}
                className="px-5 py-2.5 bg-red-900/40 hover:bg-red-900/60 border border-red-700 text-red-200 font-semibold text-sm rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Force Reset & Seed 27 Helmets</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">
                  {editingProduct ? "Edit Helmet" : "Add New Helmet"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form
              onSubmit={handleSaveProduct}
              className="p-6 overflow-y-auto space-y-6 flex-1 text-sm"
            >
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Helmet Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Aether Carbon Ultra"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="249"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                    Weight
                  </label>
                  <input
                    type="text"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    placeholder="1.25 kg"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                  placeholder="Featherlight carbon shell, matte finish, magnetic visor."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* MULTIPLE IMAGES SECTION */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold uppercase text-indigo-400">
                      Product Images ({formData.images.length})
                    </label>
                    <p className="text-xs text-slate-400">
                      Upload local images or paste URLs. Select one as primary cover.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{uploadingImage ? "Uploading..." : "Upload Images"}</span>
                  </button>
                </div>

                {/* Add image URL input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or enter image filename/URL (e.g. 5.jpg or https://...)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddImageUrl();
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold rounded-xl text-slate-200 transition"
                  >
                    Add URL
                  </button>
                </div>

                {/* Image Gallery Thumbnails Grid */}
                {formData.images.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                    No images added yet. Upload files or paste URLs above.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.images.map((imgUrl, i) => {
                      const isPrimary = formData.img === imgUrl;
                      return (
                        <div
                          key={i}
                          className={`relative group rounded-xl overflow-hidden border aspect-[4/3] bg-slate-900 transition ${
                            isPrimary
                              ? "border-indigo-500 ring-2 ring-indigo-500/40"
                              : "border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <Image
                            src={formatImageUrl(imgUrl)}
                            alt="Helmet preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />

                          {/* Primary Badge */}
                          {isPrimary && (
                            <span className="absolute top-1.5 left-1.5 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                              Primary Cover
                            </span>
                          )}

                          {/* Hover action overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-1">
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryImage(imgUrl)}
                                className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs"
                                title="Set as Primary Cover"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(imgUrl)}
                              className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs"
                              title="Remove Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Colors Tag Manager */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Available Colors
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Matte Black, Satin Silver"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-200"
                  >
                    Add Color
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.colors.map((col, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-slate-800 border border-slate-700 text-slate-300"
                    >
                      <span>{col}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(col)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Features List Manager */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1.5">
                  Key Features (Bullet points)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Ultra-light carbon fiber shell"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-200"
                  >
                    Add Feature
                  </button>
                </div>
                <ul className="space-y-1">
                  {formData.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300"
                    >
                      <span>• {feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-slate-500 hover:text-red-400 ml-2"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>{editingProduct ? "Save Changes" : "Create Helmet"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PRODUCT CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>Confirm Delete</span>
            </h4>
            <p className="text-sm text-slate-300">
              Are you sure you want to remove this helmet from the store? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition"
              >
                Delete Helmet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ORDER CONFIRMATION MODAL */}
      {deleteOrderConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              <span>Delete Order #{deleteOrderConfirmId}</span>
            </h4>
            <p className="text-sm text-slate-300">
              Are you sure you want to delete this customer order record? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteOrderConfirmId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteOrder(deleteOrderConfirmId)}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-md transition"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Order #{selectedOrder.orderId}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        selectedOrder.paymentStatus === "Paid"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Status Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-400 mb-1.5">
                    Payment Status
                  </label>
                  <select
                    value={selectedOrder.paymentStatus}
                    onChange={(e) =>
                      handleUpdateOrder(selectedOrder.orderId, {
                        paymentStatus: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Pending">Pending (Awaiting UPI)</option>
                    <option value="Paid">Paid (Verified)</option>
                    <option value="Failed">Failed / Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-slate-400 mb-1.5">
                    Live Delivery Milestone
                  </label>
                  <select
                    value={selectedOrder.trackingStatus || "Auto"}
                    onChange={(e) =>
                      handleUpdateOrder(selectedOrder.orderId, {
                        trackingStatus: e.target.value,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Auto">Auto (Progression by Elapsed Time)</option>
                    <option value="Confirmed">1. Confirmed</option>
                    <option value="Packed">2. Inspected & Packed</option>
                    <option value="Dispatched">3. Dispatched from Logistics Hub</option>
                    <option value="In Transit">4. In Transit (Regional Sorting)</option>
                    <option value="Out for Delivery">5. Out for Delivery</option>
                    <option value="Delivered">6. Delivered</option>
                  </select>
                </div>
              </div>

              {/* Customer Delivery Details */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-semibold text-indigo-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Customer & Shipping Information</span>
                </h4>
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <p className="text-sm font-bold text-white">{selectedOrder.customer.name}</p>
                  <p>
                    <span className="text-slate-500">Phone:</span>{" "}
                    <a
                      href={`tel:${selectedOrder.customer.phone}`}
                      className="text-indigo-400 font-mono underline ml-1"
                    >
                      +{selectedOrder.customer.phone}
                    </a>
                  </p>
                  {selectedOrder.customer.email && (
                    <p>
                      <span className="text-slate-500">Email:</span> {selectedOrder.customer.email}
                    </p>
                  )}
                  <p>
                    <span className="text-slate-500">Address:</span> {selectedOrder.customer.address}
                  </p>
                  <p>
                    <span className="text-slate-500">City & PIN:</span> {selectedOrder.customer.city},{" "}
                    {selectedOrder.customer.state} — {selectedOrder.customer.pincode}
                  </p>
                </div>
              </div>

              {/* Items Ordered */}
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-semibold text-indigo-400 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  <span>Helmets in Order ({selectedOrder.items?.length || 0})</span>
                </h4>

                <div className="divide-y divide-slate-800 rounded-2xl bg-slate-800/40 border border-slate-800 overflow-hidden">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-10 rounded-lg bg-slate-900 overflow-hidden border border-slate-700 shrink-0">
                          <Image
                            src={formatImageUrl(item.img)}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-slate-400">Qty: {item.qty} × ₹{item.price}</p>
                        </div>
                      </div>

                      <p className="font-mono font-bold text-slate-100">
                        ₹{item.price * item.qty}
                      </p>
                    </div>
                  ))}

                  <div className="p-3.5 bg-slate-950/60 flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-300">Total Order Amount</span>
                    <span className="text-base font-bold font-mono text-emerald-400">
                      ₹{selectedOrder.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Public Links */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Link
                  href={`/order/${selectedOrder.orderId}`}
                  target="_blank"
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition text-center flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Open Customer QR & Confirmation Page</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </Link>

                <Link
                  href={`/track?q=${selectedOrder.orderId}`}
                  target="_blank"
                  className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition text-center flex items-center justify-center gap-1.5 border border-slate-700"
                >
                  <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Open Public Live Tracking</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
