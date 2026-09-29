import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ChevronDown, ChevronUp } from "lucide-react";
import { formatImageUrl, getProductImages } from "@/lib/imageUtils";

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [showMore, setShowMore] = useState(false);
  const allImages = product ? getProductImages(product) : [];
  const [selectedImg, setSelectedImg] = useState(product?.img || allImages[0]);

  useEffect(() => {
    if (product) {
      setSelectedImg(product.img || allImages[0]);
    }
  }, [product]);

  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="
            relative 
            bg-white rounded-2xl shadow-2xl 
            w-full sm:w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] 
            max-h-[90vh] 
            flex flex-col md:flex-row overflow-hidden
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div className="relative flex-shrink-0 w-full md:w-1/2 lg:w-2/5 aspect-[4/3] md:aspect-auto bg-gray-50 flex flex-col justify-end">
            <Image
              src={formatImageUrl(selectedImg || product.img)}
              alt={product.name}
              fill
              className="object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none transition-all duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              unoptimized
            />

            {/* Multiple images thumbnail bar */}
            {allImages.length > 1 && (
              <div className="relative z-10 p-2.5 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-2 overflow-x-auto">
                {allImages.map((imgUrl, idx) => {
                  const isActive = (selectedImg || product.img) === imgUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImg(imgUrl)}
                      className={`relative w-12 h-9 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 shadow-md ${
                        isActive
                          ? "border-indigo-600 ring-2 ring-indigo-400 scale-105"
                          : "border-white/80 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={formatImageUrl(imgUrl)}
                        alt={`${product.name} angle ${idx + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col gap-3 overflow-y-auto md:overflow-y-visible relative">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition z-10"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            {/* Product title */}
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating || 5)
                      ? "fill-yellow-400"
                      : "fill-gray-200"
                  }`}
                />
              ))}
              <span className="text-sm text-gray-500 ml-1">
                {(product.rating || 4.8).toFixed(1)}
              </span>
            </div>

            {/* Price & Stock */}
            <div className="flex items-center justify-between mt-3">
              <div>
                <p className="text-lg font-semibold text-indigo-600">
                  ₹{Number(product.price).toFixed(0)}
                </p>
                <p className="text-xs text-gray-400">Incl. taxes</p>
              </div>
              <p
                className={`text-sm ${
                  (product.stock ?? 10) > 10
                    ? "text-green-600"
                    : (product.stock ?? 10) > 0
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {(product.stock ?? 10) > 0
                  ? `${product.stock ?? 10} in stock`
                  : "Out of stock"}
              </p>
            </div>

            {/* Mobile collapsible details */}
            <div className="md:hidden mt-3">
              <button
                className="flex items-center gap-1 text-indigo-600 font-medium"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "View Less" : "View More Details"}
                {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              <AnimatePresence>
                {showMore && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mt-2 text-gray-600 text-sm space-y-2"
                  >
                    <p>{product.desc}</p>
                    {product.features?.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-gray-500">
                        {product.features.map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    )}
                    <p>Weight: {product.weight}</p>
                    <p>Available colors: {product.colors?.join(", ")}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop details always visible */}
            <div className="hidden md:block mt-3 text-gray-600 text-sm space-y-2">
              <p>{product.desc}</p>
              {product.features?.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-gray-500">
                  {product.features.map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              )}
              <p>Weight: {product.weight}</p>
              <p>Available colors: {product.colors?.join(", ")}</p>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => onAddToCart?.(product)}
                className="w-full sm:flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm sm:text-base transition-colors"
              >
                Add to cart
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="w-full sm:flex-1 px-4 py-2 border border-gray-200 hover:border-indigo-500 hover:text-indigo-600 rounded-lg font-medium text-sm sm:text-base transition-colors"
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
