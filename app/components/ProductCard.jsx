import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function ProductCard({ product, onAddToCart, onQuickView }) {
  return (
    <motion.article
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 250, damping: 15 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md"
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-gray-100">
        <div className="relative w-full overflow-hidden bg-gray-100 aspect-[4/3]">
          <Image
            src={`/${product.img}`}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-3 sm:p-5">
        {/* Name + Price */}
        <div className="flex sm:items-start sm:justify-between gap-2 sm:gap-3">
          <div className="flex-1">
            <h4 className="font-semibold text-base sm:text-lg text-gray-900">
              {product.name}
            </h4>
            <p
              className="text-xs sm:text-sm text-gray-500 mt-1"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.desc}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold text-gray-800 text-sm sm:text-base">
              ₹{product.price.toFixed(0)}
            </p>
            <p className="text-xs text-gray-400">Incl. taxes</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-3 flex flex-wrap gap-2 sm:flex-nowrap sm:gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onAddToCart(product)}
            className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm sm:text-base transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            Add
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 sm:flex-none px-3 py-2 border border-gray-200 rounded-lg text-sm sm:text-base text-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
            aria-label={`Quick view of ${product.name}`}
            onClick={() => onQuickView(product)}
          >
            Quick View
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
