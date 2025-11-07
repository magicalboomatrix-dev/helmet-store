"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  MessageCircle,
  Lock,
  ArrowUp,
} from "lucide-react";

/**
 * Premium Footer — matches Header styling
 * - Same translucent bg + blur + light border as header
 * - Minimal premium nav: Shipping, Return Policy, Warranty, About Us, Contact Us
 * - Email & WhatsApp quick actions
 * - Framer Motion micro-interactions
 * - Responsive & accessible
 */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function Footer() {
  const year = new Date().getFullYear();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = useCallback(
    () => window.scrollTo({ top: 0, behavior: "smooth" }),
    []
  );

  return (
    <footer className="relative mt-20">
      {/* Wrap in a shell that mirrors the header look */}
      <div className="backdrop-blur-md bg-white/70 border-t border-gray-200 shadow-sm">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "0px 0px -80px 0px" }}
          variants={container}
          className="max-w-7xl mx-auto px-6 py-14"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <motion.div variants={item} className="flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-indigo-700 text-white flex items-center justify-center font-black tracking-tight shadow-sm">
                  HS
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xl tracking-tight">
                    Helmet Store
                  </p>
                  <p className="text-sm text-gray-600">
                    Minimal helmets. Maximum presence.
                  </p>
                </div>
              </Link>

              {/* Socials */}
              <div className="flex gap-3 pt-2">
                {[
                  { icon: Facebook, label: "Facebook", href: "#" },
                  { icon: Twitter, label: "Twitter/X", href: "#" },
                  { icon: Instagram, label: "Instagram", href: "#" },
                  { icon: Youtube, label: "YouTube", href: "#" },
                ].map(({ icon: Icon, label, href }, i) => (
                  <motion.a
                    key={i}
                    href={href}
                    aria-label={`Follow us on ${label}`}
                    whileHover={{ y: -2, rotate: 1, scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-2 rounded-full bg-white/80 border border-gray-200 text-gray-700 hover:bg-indigo-600 hover:text-white transition-all duration-300 shadow-sm"
                  >
                    <Icon size={16} />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Store Pages (exactly as requested) */}
            <motion.nav
              variants={item}
              aria-label="Footer navigation"
              className="grid grid-cols-2 gap-6 sm:gap-8"
            >
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-900">Store</p>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/shipping"
                      className="text-sm text-gray-700 hover:text-indigo-700 transition-colors"
                    >
                      Shipping
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/return-policy"
                      className="text-sm text-gray-700 hover:text-indigo-700 transition-colors"
                    >
                      Return Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/warranty"
                      className="text-sm text-gray-700 hover:text-indigo-700 transition-colors"
                    >
                      Warranty
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-gray-900">Company</p>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-sm text-gray-700 hover:text-indigo-700 transition-colors"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-sm text-gray-700 hover:text-indigo-700 transition-colors"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </motion.nav>

            {/* Contact (Email + WhatsApp) */}
            <motion.div variants={item} className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-gray-900">Support</p>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:support@helmetstore.example"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-sm text-gray-800 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
                >
                  <Mail size={16} />
                  support@helmetstore.example
                </a>
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-4 py-2 text-sm text-gray-800 shadow-sm hover:shadow-md hover:border-green-300 transition-all"
                >
                  <MessageCircle size={16} />
                  WhatsApp Chat
                </a>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <Lock className="w-3.5 h-3.5" />
                <span>Secure checkout — SSL encrypted</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6 text-xs flex flex-col md:flex-row items-center justify-between gap-3 text-gray-600">
            <p>© {year} Helmet Store — crafted with care and caffeine ☕</p>
            <p className="opacity-80">All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Sticky Back-to-Top pill */}
      {showTop && (
        <button
          onClick={scrollTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full bg-gray-900 text-white shadow-lg hover:shadow-xl transition flex items-center justify-center"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </footer>
  );
}
