import React, { useState } from "react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function ProductGrid({ products, onAddToCart }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
        {products.map((p) => (
          <ProductCard
            key={p.id || p._id}
            product={p}
            onAddToCart={onAddToCart}
            onQuickView={() => setSelectedProduct(p)}
          />
        ))}
      </div>

      {products.length === 0 && (
        <p className="py-16 text-center text-gray-500">
          Our updated helmet collection is coming soon.
        </p>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={onAddToCart} 
        />
      )}
    </>
  );
}
