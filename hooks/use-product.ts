import { useState, useEffect } from 'react';
import { products, LocalStorageManager } from '@/lib/mock-data';
import type { Product } from '@/lib/mock-data';

export function useProduct(productId: string | null) {
  const [data, setData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));

        let product: Product | null = null;

        if (productId) {
          // Check localStorage for seller products first
          const allProducts = LocalStorageManager.getAllProducts();
          product = allProducts.find((p: any) => p.id === productId || p._id === productId) || null;

          // If not found in localStorage, try products
          if (!product) {
            product = products.find(p => p.id === productId) || null;
          }

          // If still not found, try legacy products (convert id to string)
          if (!product) {
            const legacyProduct = products.find(p => p.id.toString() === productId);
            if (legacyProduct) {
              // Convert legacy product to API format
              product = {
                ...legacyProduct,
                id: legacyProduct.id.toString(),
                name: legacyProduct.name,
                description: legacyProduct.description,
                price: parseFloat(legacyProduct.salePrice || legacyProduct.originalPrice || '0'),
                main_category_id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4", // Default
                category_id: "25ef1e05-4cb0-4883-88d8-3d3c47c4e60b", // Default
                subcategory_id: "f78f026f-1626-45d8-9208-ca84a676a1db", // Default
                color: legacyProduct.colors?.[0] || "Default",
                size: legacyProduct.sizes?.[0] || "One Size",
                quantity: 50,
                is_eco: legacyProduct.isEcoFriendly || false,
                on_offer: !!legacyProduct.salePrice,
                created_at: "2025-06-24T06:47:49.670843Z",
                updated_at: "2025-07-03T19:55:51.084496Z",
                image_url: legacyProduct.imageUrl
              };
            }
          }
        }

        setData(product);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err instanceof Error ? err : new Error('Failed to load product'));
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  return {
    product: data,
    isLoading,
    isError: !!error,
    error
  };
}