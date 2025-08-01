import { useState, useEffect } from 'react';
import { LocalStorageManager } from '@/lib/mock-data';
import type { Product } from '@/lib/mock-data';

export function useSearch(query: string, filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  isEcoFriendly?: boolean;
  mainCategoryId?: string;
  categoryId?: string;
  subcategoryId?: string;
}) {
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim() && !filters) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        // Simulate search delay
        await new Promise(resolve => setTimeout(resolve, 200));

        let searchResults: Product[] = [];

        // Search in API products
        const apiResults = LocalStorageManager.getAllProducts().filter((product: any) => {
          // Text search
          if (query.trim()) {
            const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) ||
                                (product.description && product.description.toLowerCase().includes(query.toLowerCase()));
            if (!matchesQuery) return false;
          }

          // Apply filters
          if (filters?.minPrice && product.price < filters.minPrice) return false;
          if (filters?.maxPrice && product.price > filters.maxPrice) return false;
          if (filters?.isEcoFriendly && !product.is_eco) return false;
          if (filters?.mainCategoryId && product.main_category_id !== filters.mainCategoryId) return false;
          if (filters?.categoryId && product.category_id !== filters.categoryId) return false;
          if (filters?.subcategoryId && product.subcategory_id !== filters.subcategoryId) return false;
          if (filters?.brand && product.brand !== filters.brand) return false;

          return true;
        });

        // Search in legacy products and convert to API format
        const legacyResults = LocalStorageManager.getAllProducts().filter((product: any) => {
          // Text search
          if (query.trim()) {
            const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase()) ||
                                (product.description && product.description.toLowerCase().includes(query.toLowerCase()));
            if (!matchesQuery) return false;
          }

          // Apply filters
          const price = parseFloat(product.salePrice || product.originalPrice || '0');
          if (filters?.minPrice && price < filters.minPrice) return false;
          if (filters?.maxPrice && price > filters.maxPrice) return false;
          if (filters?.brand && product.brand !== filters.brand) return false;
          if (filters?.isEcoFriendly && !product.isEcoFriendly) return false;
          if (filters?.category && product.category !== filters.category) return false;

          return true;
        }).map((product: any) => ({
          ...product,
           id: product.id.toString(),
           name: product.name,
           description: product.description,
           price: parseFloat(product.salePrice || product.originalPrice || '0'),
           main_category_id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
           category_id: "25ef1e05-4cb0-4883-88d8-3d3c47c4e60b",
           subcategory_id: "f78f026f-1626-45d8-9208-ca84a676a1db",
           color: product.colors?.[0] || "Default",
           size: product.sizes?.[0] || "One Size",
           quantity: 50,
           is_eco: product.isEcoFriendly || false,
           on_offer: !!product.salePrice,
           created_at: "2025-06-24T06:47:49.670843Z",
           updated_at: "2025-07-03T19:55:51.084496Z",
           image_url: product.imageUrl
        }));

        searchResults = [...apiResults, ...legacyResults];

        // Remove duplicates based on ID
        const uniqueResults = searchResults.filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id)
        );

        setResults(uniqueResults);
        setError(null);
      } catch (err) {
        console.error('Search failed:', err);
        setError(err instanceof Error ? err : new Error('Search failed'));
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query, filters]);

  return {
    results,
    isLoading,
    isError: !!error,
    error
  };
}

// Quick search hook for autocomplete/suggestions
export function useQuickSearch(query: string, limit: number = 5) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getSuggestions = async () => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 100));

      const allProducts = [...LocalStorageManager.getAllProducts()];
      const suggestions = allProducts
        .filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase())
        )
        .map(product => product.name)
        .slice(0, limit);

      setSuggestions([...new Set(suggestions)]); // Remove duplicates
      setIsLoading(false);
    };

    getSuggestions();
  }, [query, limit]);

  return {
    suggestions,
    isLoading
  };
}