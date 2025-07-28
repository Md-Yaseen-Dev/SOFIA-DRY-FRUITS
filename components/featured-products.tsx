
"use client";

import React, { useState, useEffect } from "react";
import ProductCard from "./product-card";
import { LocalStorageManager } from "@/lib/mock-data";
import type { Product } from "@/lib/mock-data";

export default function FeaturedProducts() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = () => {
      try {
        // Get all products from localStorage where seller products are stored
        let products = LocalStorageManager.getAllProducts();

        // Initialize with mock data if no products exist yet
        if (products.length === 0) {
          products = LocalStorageManager.initializeProducts();
        }

        setAllProducts(products);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading products:', error);
        setIsLoading(false);
      }
    };

    loadProducts();

    // Listen for product updates from seller actions
    const handleProductsUpdate = () => {
      loadProducts();
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);
    return () => window.removeEventListener('productsUpdated', handleProductsUpdate);
  }, []);

  // Filter for featured products - show products marked as featured or on offer
  const featuredProducts = allProducts;

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative inline-block">
              <span className="relative z-10">Featured Products</span>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-orange-500 rounded-full"></div>
            </h2>
            <p className="text-gray-600 text-sm md:text-base mt-3 italic">
              Handpicked premium selections for you
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading and Button Section */}
        <div className="mb-5">
          <div className="text-center mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative inline-block">
              <span className="relative z-10">Featured Products</span>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-orange-500 rounded-full"></div>
            </h2>
            <p className="text-gray-600 text-sm md:text-base mt-3 italic">
              Handpicked premium selections for you
            </p>
          </div>

          <div className="flex justify-end">
          </div>
        </div>

        {/* Product Grid */}
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No featured products available.</p>
            <p className="text-gray-400 mt-2">Products will appear here once sellers add them.</p>
          </div>
        )}
      </div>
    </section>
  );
}
