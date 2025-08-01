import { useState, useEffect } from 'react';
import { LocalStorageManager } from '../lib/mock-data';
import type { SubCategory } from '@/lib/mock-data';

interface SubCategoriesResponse {
  data: SubCategory[];
}

export function useSubCategories(categoryId: string | null) {
  const [data, setData] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSubCategories = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));

        let subCategories: SubCategory[] = [];

        if (categoryId) {
          // Find subcategories for the given category
          const categoryTree = LocalStorageManager.getCategoryTree();
          categoryTree.forEach((mainCat: any) => {
            mainCat.category?.forEach((cat: any) => {
              if (cat.id === categoryId) {
                subCategories = cat.sub_category || [];
              }
            });
          });
        }

        setData(subCategories);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch subcategories:', err);
        setError(err instanceof Error ? err : new Error('Failed to load subcategories'));
      } finally {
        setIsLoading(false);
      }
    };

    loadSubCategories();
  }, [categoryId]);

  return {
    subCategories: data,
    isLoading,
    isError: !!error,
  };
}