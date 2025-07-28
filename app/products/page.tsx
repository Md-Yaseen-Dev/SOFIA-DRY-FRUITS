
"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/product-card';
import { LocalStorageManager } from '@/lib/mock-data';
import type { Product } from '@/lib/mock-data';

function ProductsPageInner() {
  const searchParams = useSearchParams();
  const [displayProducts, setDisplayProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Get filters from URL
  const featured = searchParams.get('featured');
  const brand = searchParams.get('brand');
  const eco = searchParams.get('is_eco');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all products from localStorage where seller products are stored
        let allProducts = LocalStorageManager.getAllProducts();

        // Initialize with mock data if no products exist yet
        if (allProducts.length === 0) {
          allProducts = LocalStorageManager.initializeProducts();
        }

        setDisplayProducts(allProducts);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err instanceof Error ? err : new Error('Failed to load products'));
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

  // Apply filters to products
  let filteredProducts = [...displayProducts];

  // Apply client-side filters for URL parameters
  if (eco === 'true') {
    filteredProducts = filteredProducts.filter((product: Product) => 
      product.is_eco || (product as any).isEcoFriendly
    );
  }

  if (featured === 'true') {
    filteredProducts = filteredProducts.filter((product: Product) => 
      (product as any).isFeatured || product.on_offer
    );
  }

  if (brand) {
    filteredProducts = filteredProducts.filter((product: Product) => 
      product.brand?.toLowerCase().replace(/\s+/g, '-') === brand
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
            <p className="mt-2 text-gray-600">
              Discover our complete collection of premium products
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Failed to load products.</p>
            <p className="text-gray-400">Please try again later.</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or browse other categories.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageInner />
    </Suspense>
  );
}
