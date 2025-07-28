"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import ProductCard from "@/components/product-card";
import { products as mockProducts } from "@/lib/mock-data";
import { useProducts } from "@/hooks/use-products";
import { useMainCategories } from "@/hooks/use-main-categories";
import { useCategories } from "@/hooks/use-categories";
import { useSubCategories } from "@/hooks/use-subcategories";
import { Button } from "@/components/ui/button";

function FilteredCategoryPageInner() {
  const searchParams = useSearchParams();
  const [pageTitle, setPageTitle] = useState<string>("Products");
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Get filter parameters from URL
  const mainCategoryId = searchParams.get('main_category_id');
  const categoryId = searchParams.get('category_id');
  const subCategoryId = searchParams.get('subcategory_id');

  // Get data for building the page title
  const { mainCategories } = useMainCategories();
  const { categories } = useCategories(mainCategoryId);
  const { subCategories } = useSubCategories(categoryId);

  // Fetch filtered products with pagination
  const { products: apiProducts, isLoading, isError, total } = useProducts(mainCategoryId, categoryId, subCategoryId, page, 10);

  // Reset products when filters change
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [mainCategoryId, categoryId, subCategoryId]);

  // Add new products to the list when page changes
  useEffect(() => {
    if (apiProducts.length > 0) {
      if (page === 1) {
        setAllProducts(apiProducts);
      } else {
        setAllProducts(prev => [...prev, ...apiProducts]);
      }
      setIsLoadingMore(false);
    }
  }, [apiProducts, page]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    // Build page title based on available data
    let title = "Products";

    if (subCategoryId) {
      const subcategory = subCategories.find((sub: any) => sub.id === subCategoryId);
      if (subcategory) {
        title = subcategory.name;
      }
    } else if (categoryId) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        title = category.name;
      }
    } else if (mainCategoryId) {
      const mainCategory = mainCategories.find(main => main.id === mainCategoryId);
      if (mainCategory) {
        title = mainCategory.name;
      }
    }

    setPageTitle(title);
  }, [mainCategoryId, categoryId, subCategoryId, mainCategories, categories, subCategories]);

  // Use API products if available, otherwise fallback to mock data
  let displayProducts = allProducts.length > 0 ? allProducts : mockProducts;

  const hasMore = allProducts.length < (total || 0) && allProducts.length > 0;
  const showLoadMore = hasMore && !isLoading && !isLoadingMore;

  if (isLoading && page === 1) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (isError && allProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Error loading products. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-600">
        <span>Home</span>
        <span className="mx-2">/</span>
        {mainCategoryId && (
          <>
            <span>{mainCategories.find(m => m.id === mainCategoryId)?.name || 'Category'}</span>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-gray-900 font-medium">{pageTitle}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
        <p className="text-gray-600">
          {displayProducts.length} product{displayProducts.length !== 1 ? 's' : ''} {total ? `of ${total}` : 'found'}
        </p>
      </div>

      {/* Filters Info */}
      <div className="mb-6 text-sm text-gray-500">
        <span>Showing products for: </span>
        {mainCategoryId && (
          <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-md mr-2">
            {mainCategories.find(m => m.id === mainCategoryId)?.name || 'Main Category'}
          </span>
        )}
        {categoryId && (
          <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md mr-2">
            {categories.find(c => c.id === categoryId)?.name || 'Category'}
          </span>
        )}
        {subCategoryId && (
          <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-md mr-2">
            {subCategories.find((s: any) => s.id === subCategoryId)?.name || 'Subcategory'}
          </span>
        )}
      </div>

      {/* Products Grid */}
      {displayProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Load More Button */}
          {showLoadMore && (
            <div className="flex justify-center mt-12">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
              >
                {isLoadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Loading More...
                  </>
                ) : (
                  'Load More Products'
                )}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or browse other categories.</p>
        </div>
      )}
    </div>
  );
}

export default function FilteredCategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FilteredCategoryPageInner />
    </Suspense>
  );
}