
import { useState, useEffect } from 'react';
import { LocalStorageManager } from '../lib/mock-data';
import type { Category } from '@/lib/mock-data';

interface CategoriesResponse {
  data: Category[];
}

export function useCategories(mainCategoryId: string | null) {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));

        let categories: Category[] = [];
        
        if (mainCategoryId) {
          const categoryTree = LocalStorageManager.getCategoryTree();
          const mainCategory = categoryTree.find((cat: any) => cat.id === mainCategoryId);
          categories = mainCategory?.category || [];
        }

        setData(categories);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError(err instanceof Error ? err : new Error('Failed to load categories'));
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [mainCategoryId]);

  return {
    categories: data,
    isLoading,
    isError: !!error,
  };
}
