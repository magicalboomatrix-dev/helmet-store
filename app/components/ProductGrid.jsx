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
            key={p.id}
            product={p}
            onAddToCart={onAddToCart}
            onQuickView={() => setSelectedProduct(p)}
          />
        ))}
      </div>

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
