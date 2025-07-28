
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Product Card Loading Skeleton
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <Skeleton className="w-full h-48" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-1/4" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  </div>
);

// Product Grid Loading
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

// Category Card Loading
export const CategoryCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <Skeleton className="w-full h-32" />
    <div className="p-3">
      <Skeleton className="h-4 w-2/3 mx-auto" />
    </div>
  </div>
);

// Categories Grid Loading
export const CategoriesGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <CategoryCardSkeleton key={index} />
    ))}
  </div>
);

// Header Loading State
export const HeaderSkeleton = () => (
  <div className="bg-white shadow-sm border-b">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-64" />
        <div className="flex items-center space-x-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

// Featured Products Section Loading
export const FeaturedProductsSkeleton = () => (
  <section className="py-8">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto" />
      </div>
      <ProductGridSkeleton count={4} />
    </div>
  </section>
);

// Main Categories Loading
export const MainCategoriesSkeleton = () => (
  <section className="py-8">
    <div className="container mx-auto px-4">
      <Skeleton className="h-6 w-40 mb-6" />
      <CategoriesGridSkeleton />
    </div>
  </section>
);

// Search Results Loading
export const SearchResultsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-8 w-32" />
    </div>
    <ProductGridSkeleton count={12} />
  </div>
);

// Product Detail Loading
export const ProductDetailSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="w-full h-96" />
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-4" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  </div>
);

// Cart Loading State
export const CartSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-20 h-20" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg border">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      </div>
    </div>
  </div>
);

// Generic Loading Spinner
export const LoadingSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-200 border-t-orange-500`} />
    </div>
  );
};

// Full Page Loading
export const FullPageLoading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// Error State Component
export const ErrorState = ({ 
  message = "Something went wrong", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void; 
}) => (
  <div className="text-center py-8">
    <div className="text-red-500 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Oops!</h3>
    <p className="text-gray-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
      >
        Try Again
      </button>
    )}
  </div>
);

// Empty State Component
export const EmptyState = ({ 
  title = "No items found", 
  description = "Try adjusting your search or filters",
  action
}: { 
  title?: string; 
  description?: string;
  action?: React.ReactNode;
}) => (
  <div className="text-center py-12">
    <div className="text-gray-400 mb-4">
      <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-4">{description}</p>
    {action}
  </div>
);
