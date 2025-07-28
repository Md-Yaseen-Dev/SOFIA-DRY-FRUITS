"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import ProductCard from "@/components/product-card";
import ProductFilters from "@/components/product-filters";
import { products as mockProducts } from "@/lib/mock-data";
import { useProducts } from "@/hooks/use-products";
import { useMainCategories } from "@/hooks/use-main-categories";
import { Button } from "@/components/ui/button";

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [categoryName, setCategoryName] = useState<string>("");
  const [mainCategoryId, setMainCategoryId] = useState<string | null>(null);

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const categorySlug = params.category as string;
  const { mainCategories } = useMainCategories();

  // Fetch products with pagination - pass mainCategoryId as first param, null for others to get all products under main category
  const { products: apiProducts, isLoading, isError, total } = useProducts(mainCategoryId, null, null, page, 10);

  // Set category info when main categories are loaded
  useEffect(() => {
    if (!categorySlug || mainCategories.length === 0) return;

    const decodedCategory = decodeURIComponent(categorySlug);
    const mainCategory = mainCategories.find(cat => 
      cat.slug === decodedCategory || 
      cat.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === decodedCategory ||
      cat.name.toLowerCase() === decodedCategory.replace(/-/g, ' ')
    );

    if (mainCategory) {
      setMainCategoryId(mainCategory.id);
      setCategoryName(mainCategory.name);
    } else {
      const readableCategory = decodedCategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/And/g, '&');
      setCategoryName(readableCategory);
      setMainCategoryId(null);
    }
  }, [categorySlug, mainCategories]);

  // Reset products when category changes
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [mainCategoryId]);

  // Load products from localStorage and listen for updates
  useEffect(() => {
    const loadProducts = () => {
      const { LocalStorageManager } = require('@/lib/mock-data');
      const products = LocalStorageManager.getAllProducts();
      
      if (products.length === 0) {
        const initializedProducts = LocalStorageManager.initializeProducts();
        setAllProducts(initializedProducts);
      } else {
        setAllProducts(products);
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

  // Get all products from localStorage where seller products are stored
  let displayProducts = allProducts.length > 0 ? allProducts : [];

  // If no products in localStorage, initialize with default data
  useEffect(() => {
    if (allProducts.length === 0 && !isLoading) {
      const { LocalStorageManager } = require('@/lib/mock-data');
      const initializedProducts = LocalStorageManager.initializeProducts();
      console.log('Initialized products:', initializedProducts);
      console.log('Category slug:', categorySlug);
      console.log('Main category ID:', mainCategoryId);
      console.log('Category name:', categoryName);
      setAllProducts(initializedProducts);
    }
  }, [allProducts.length, isLoading]);

  // Filter by main category if set
  if (mainCategoryId && displayProducts.length > 0) {
    displayProducts = displayProducts.filter(product => {
      // Check multiple possible field names for main category ID
      const productMainCategoryId = product.main_category_id || 
                                  product.mainCategoryId || 
                                  product.main_category_id;
      
      // Check if product belongs to this main category
      const belongsToMainCategory = productMainCategoryId === mainCategoryId;
      
      // Also check by category name for fallback
      const mainCategoryName = categoryName?.toLowerCase().replace(/\s+/g, '-');
      const productCategoryMatches = product.category === categorySlug ||
                                   product.category === mainCategoryName ||
                                   product.main_category?.toLowerCase().replace(/\s+/g, '-') === mainCategoryName ||
                                   product.mainCategory?.toLowerCase().replace(/\s+/g, '-') === mainCategoryName;
      
      return belongsToMainCategory || productCategoryMatches;
    });
  } else if (categorySlug && !mainCategoryId && displayProducts.length > 0) {
    // Fallback filtering by category slug/name if no mainCategoryId found
    const decodedCategory = decodeURIComponent(categorySlug);
    const normalizedCategorySlug = decodedCategory.toLowerCase().replace(/\s+/g, '-');
    
    displayProducts = displayProducts.filter(product => {
      const productCategory = product.category?.toLowerCase().replace(/\s+/g, '-');
      const productMainCategory = product.main_category?.toLowerCase().replace(/\s+/g, '-') ||
                                product.mainCategory?.toLowerCase().replace(/\s+/g, '-');
      const productMainCategoryName = product.main_category_name?.toLowerCase().replace(/\s+/g, '-');
      
      return productCategory === normalizedCategorySlug ||
             productMainCategory === normalizedCategorySlug ||
             productMainCategoryName === normalizedCategorySlug ||
             product.category === decodedCategory ||
             product.category === decodedCategory.replace(/-/g, ' ') ||
             product.category === categoryName?.toLowerCase();
    });
  }

  // Apply additional filters from URL parameters
  const featured = searchParams.get('featured');
  const brand = searchParams.get('brand');

  if (featured === 'true') {
    displayProducts = displayProducts.filter(product => product.isFeatured);
  }

  if (brand) {
    displayProducts = displayProducts.filter(product => 
      product.brand?.toLowerCase().replace(/\s+/g, '-') === brand
    );
  }

  // Filter handlers
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([categoryId]); // Only allow one category at a time
      setSelectedSubCategories([]); // Clear subcategories when category changes
      setPage(1);
      setAllProducts([]);
    } else {
      setSelectedCategories([]);
      setSelectedSubCategories([]);
      setPage(1);
      setAllProducts([]);
    }
  };

  const handleSubCategoryChange = (subCategoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubCategories([subCategoryId]); // Only allow one subcategory at a time
      setPage(1);
      setAllProducts([]);
    } else {
      setSelectedSubCategories([]);
      setPage(1);
      setAllProducts([]);
    }
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setPriceRange([0, 10000]);
    setPage(1);
    setAllProducts([]);
    
    // Navigate back to main category page when filters are cleared
    if (mainCategoryId) {
      const mainCategory = mainCategories.find(main => main.id === mainCategoryId);
      if (mainCategory) {
        const mainCategorySlug = mainCategory.slug || mainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        setTimeout(() => {
          router.push(`/products/${mainCategorySlug}`);
        }, 50);
      }
    }
  };

  // Apply client-side filtering to displayed products
  const applyClientSideFilters = (products: any[]) => {
    let filtered = [...products];

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category_id)
      );
    }

    // Filter by selected subcategories
    if (selectedSubCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedSubCategories.includes(product.subcategory_id)
      );
    }

    // Filter by price range
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    return filtered;
  };

  // Apply filters to display products
  const filteredProducts = applyClientSideFilters(displayProducts);

  const hasMore = allProducts.length < (total || 0) && allProducts.length > 0;
  const showLoadMore = hasMore && !isLoading && !isLoadingMore;

  if (!categorySlug) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-4 text-sm text-gray-600 px-2 md:px-0">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{categoryName}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Filter Sidebar */}
          <div className={`${isFilterOpen ? 'block' : 'hidden'} md:block`}>
            <ProductFilters
              isOpen={isFilterOpen}
              onToggle={() => setIsFilterOpen(!isFilterOpen)}
              mainCategoryId={mainCategoryId}
              selectedCategories={selectedCategories}
              selectedSubCategories={selectedSubCategories}
              priceRange={priceRange}
              onCategoryChange={handleCategoryChange}
              onSubCategoryChange={handleSubCategoryChange}
              onPriceRangeChange={handlePriceRangeChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">

            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {categoryName || "Products"}
              </h1>
              <p className="text-gray-600">
                {isLoading && page === 1 ? 'Loading products...' : 
                 `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} ${total ? `of ${total}` : 'found'}`}
              </p>
            </div>

      {isLoading && page === 1 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse bg-white rounded-lg p-4">
                    <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : isError && allProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 mb-4">Failed to load products from API.</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Load More Button - Only show if no filters applied or minimal filtering */}
                {showLoadMore && selectedCategories.length === 0 && selectedSubCategories.length === 0 && 
                 priceRange[0] === 0 && priceRange[1] === 10000 && (
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
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600">No products found matching your filters.</p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}