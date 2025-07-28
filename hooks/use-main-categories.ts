
import { useState, useEffect } from 'react';
import { mainCategories } from '@/lib/mock-data';
import type { MainCategory } from '@/lib/mock-data';

export function useMainCategories() {
  const [data, setData] = useState<MainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay for consistency
        await new Promise(resolve => setTimeout(resolve, 300));
        setData(mainCategories);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load main categories'));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    mainCategories: data,
    isLoading,
    isError: !!error,
    error
  };
}
