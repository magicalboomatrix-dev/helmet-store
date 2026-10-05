"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogOut, Package, RefreshCw, ShieldCheck, UserRound } from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadAccount = async () => {
    setLoading(true);
    try {
      const sessionResponse = await fetch("/api/account/session");
      const sessionData = await sessionResponse.json();
      setCustomer(sessionData.customer || null);
      if (sessionData.customer) {
        const ordersResponse = await fetch("/api/account/orders");
        const ordersData = await ordersResponse.json();
        if (!ordersResponse.ok || !ordersData.success) throw new Error(ordersData.error || "Could not load orders.");
        setOrders(ordersData.orders || []);
      } else {
        setOrders([]);
      }
    } catch (loadError) {
      setError(loadError.message || "Could not load account.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const handleAuth = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/account/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, name, email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not sign in.");
      setCustomer(data.customer);
      setPassword("");
      await loadAccount();
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      if (returnTo?.startsWith("/")) router.push(returnTo);
    } catch (authError) {
      setError(authError.message || "Could not sign in.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/account/session", { method: "DELETE" });
    setCustomer(null);
    setOrders([]);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-700">
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>

        {loading ? (
          <div className="py-24 text-center text-slate-500"><RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-indigo-600" />Loading your account…</div>
        ) : customer ? (
          <section className="mt-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-700"><UserRound className="h-6 w-6" /></div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Customer Account</p>
                  <h1 className="text-xl font-bold">Hi, {customer.name}</h1>
                  <p className="text-sm text-slate-500">{customer.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"><LogOut className="h-4 w-4" />Sign out</button>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">Your Orders</h2>
                  <p className="mt-1 text-sm text-slate-500">Payment verification and delivery tracking for orders placed while signed in.</p>
                </div>
                <Package className="h-6 w-6 text-indigo-600" />
              </div>
              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <p className="font-semibold">No orders yet</p>
                  <p className="mt-1 text-sm text-slate-500">Your orders will appear here after checkout.</p>
                  <Link href="/" className="mt-4 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Browse helmets</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <article key={order.orderId} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-mono font-bold">#{order.orderId}</p>
                        <p className="mt-1 text-sm text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })} · {order.items?.length || 0} item(s)</p>
                        <p className="mt-2 text-sm font-semibold">₹{Number(order.total).toLocaleString("en-IN")}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-800" : order.paymentStatus === "Proof Submitted" ? "bg-indigo-100 text-indigo-800" : order.paymentStatus === "Proof Rejected" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>{order.paymentStatus}</span>
                        <Link href={`/order/${order.orderId}`} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Details & tracking</Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="mx-auto mt-8 max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-indigo-600 text-white"><ShieldCheck className="h-7 w-7" /></div>
              <h1 className="text-2xl font-extrabold">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
              <p className="mt-2 text-sm text-slate-500">Sign in to see your order history and delivery updates.</p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "register" && <label className="block text-sm font-medium">Name<input required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" autoComplete="name" /></label>}
              <label className="block text-sm font-medium">Email<input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /></label>
              <label className="block text-sm font-medium">Password<input required type="password" minLength={10} maxLength={128} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /><span className="mt-1 block text-xs text-slate-500">At least 10 characters.</span></label>
              {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">{busy && <RefreshCw className="h-4 w-4 animate-spin" />}{mode === "login" ? "Sign in" : "Create account"}</button>
            </form>
            <p className="mt-5 text-center text-sm text-slate-500">{mode === "login" ? "New here?" : "Already have an account?"}{" "}<button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }} className="font-semibold text-indigo-700 hover:underline">{mode === "login" ? "Create an account" : "Sign in"}</button></p>
          </section>
        )}
      </div>
    </main>
  );
}
