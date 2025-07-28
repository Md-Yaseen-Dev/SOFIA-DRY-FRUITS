
import { useState, useEffect } from 'react';
import { LocalStorageManager } from '@/lib/mock-data';
import type { Product } from '@/lib/mock-data';

interface ProductsResponse {
  data: Product[];
  total?: number;
  page?: number;
  limit?: number;
}

export function useProducts(
  mainCategoryId?: string | null, 
  categoryId?: string | null, 
  subCategoryId?: string | null,
  page: number = 1,
  limit: number = 10
) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay for consistency
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

        // Get all products from localStorage - this is where seller products are stored
        let allProducts = LocalStorageManager.getAllProducts();

        // Initialize with mock data if no products exist yet
        if (allProducts.length === 0) {
          allProducts = LocalStorageManager.initializeProducts();
        }

        // Apply category filters
        let filteredProducts = [...allProducts];

        if (mainCategoryId) {
          filteredProducts = filteredProducts.filter(p => 
            p.main_category_id === mainCategoryId || 
            p.mainCategoryId === mainCategoryId ||
            p.main_category_id === mainCategoryId
          );
        }
        if (categoryId) {
          filteredProducts = filteredProducts.filter(p => 
            p.category_id === categoryId || 
            p.categoryId === categoryId ||
            p.category_id === categoryId
          );
        }
        if (subCategoryId) {
          filteredProducts = filteredProducts.filter(p => 
            p.subcategory_id === subCategoryId || 
            p.subCategoryId === subCategoryId ||
            p.sub_category_id === subCategoryId
          );
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        const response: ProductsResponse = {
          data: paginatedProducts,
          total: filteredProducts.length,
          page,
          limit
        };

        setData(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError(err instanceof Error ? err : new Error('Failed to load products'));
      } finally {
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
  }, [mainCategoryId, categoryId, subCategoryId, page, limit]);

  // Handle response structure
  let products: Product[] = [];
  if (data) {
    if (Array.isArray(data)) {
      products = data;
    } else if (data.data && Array.isArray(data.data)) {
      products = data.data;
    }
  }

  return {
    products,
    isLoading,
    isError: !!error,
    total: data?.total || products.length,
    page: data?.page || page,
    limit: data?.limit || limit
  };
}
