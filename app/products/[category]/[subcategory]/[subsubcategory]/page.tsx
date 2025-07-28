"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import ProductCard from "@/components/product-card";
import ProductFilters from "@/components/product-filters";
import { products as mockProducts } from "@/lib/mock-data";
import { useProducts } from "@/hooks/use-products";
import { useMainCategories } from "@/hooks/use-main-categories";
import { Button } from "@/components/ui/button";

export default function SubcategoryPage() {
  const params = useParams();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pageTitle, setPageTitle] = useState<string>("");
  const [mainCategoryId, setMainCategoryId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<string | null>(null);

  // Filter states
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const mainCategorySlug = params.category as string;
  const categorySlug = params.subcategory as string;
  const subcategorySlug = params.subsubcategory as string;
  const { mainCategories } = useMainCategories();

  // Fetch products with pagination
  const { products: apiProducts, isLoading, isError, total } = useProducts(mainCategoryId, categoryId, subcategoryId, page, 10);

  // Set category info when main categories are loaded
  useEffect(() => {
    if (!mainCategorySlug || !categorySlug || !subcategorySlug || mainCategories.length === 0) return;

    const decodedMainCategory = decodeURIComponent(mainCategorySlug);
    const decodedCategory = decodeURIComponent(categorySlug);
    const decodedSubcategory = decodeURIComponent(subcategorySlug);

    // Find main category
    const mainCategory = mainCategories.find(cat => 
      cat.slug === decodedMainCategory || 
      cat.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === decodedMainCategory ||
      cat.name.toLowerCase() === decodedMainCategory.replace(/-/g, ' ')
    );

    if (mainCategory) {
      setMainCategoryId(mainCategory.id);

      // Find category within main category
      const category = mainCategory.category?.find((cat: any) =>
        cat.slug === decodedCategory ||
        cat.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === decodedCategory ||
        cat.name.toLowerCase() === decodedCategory.replace(/-/g, ' ')
      );

      if (category) {
        setCategoryId(category.id);

        // Find subcategory within category
        const subcategory = category.sub_category?.find((sub: any) =>
          sub.slug === decodedSubcategory ||
          sub.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === decodedSubcategory ||
          sub.name.toLowerCase() === decodedSubcategory.replace(/-/g, ' ')
        );

        if (subcategory) {
          setSubcategoryId(subcategory.id);
          setPageTitle(subcategory.name);
        } else {
          // Fallback to readable name
          const readableSubcategory = decodedSubcategory
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .replace(/And/g, '&');
          setPageTitle(readableSubcategory);
          setSubcategoryId(null);
        }
      } else {
        setCategoryId(null);
        setSubcategoryId(null);
        setPageTitle("Products");
      }
    } else {
      setMainCategoryId(null);
      setCategoryId(null);
      setSubcategoryId(null);
      setPageTitle("Products");
    }
  }, [mainCategorySlug, categorySlug, subcategorySlug, mainCategories]);

  // Reset products when category changes
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
  }, [mainCategoryId, categoryId, subcategoryId]);

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

  // Use API products if available, otherwise fallback to mock data
  let displayProducts = allProducts.length > 0 ? allProducts : mockProducts;

  // Filter handlers
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
  };

  const handleSubCategoryChange = (subCategoryId: string, checked: boolean) => {
    setSelectedSubCategories(prev => 
      checked ? [...prev, subCategoryId] : prev.filter(id => id !== subCategoryId)
    );
  };

  // Initialize filters based on URL when data is available
  useEffect(() => {
    if (mainCategoryId && categoryId && subcategoryId) {
      if (!selectedCategories.includes(categoryId)) {
        setSelectedCategories([categoryId]);
      }
      if (!selectedSubCategories.includes(subcategoryId)) {
        setSelectedSubCategories([subcategoryId]);
      }
    }
  }, [mainCategoryId, categoryId, subcategoryId, selectedCategories, selectedSubCategories]);

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

  if (!mainCategorySlug || !categorySlug || !subcategorySlug) {
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
        <div className="mb-4 text-sm text-gray-600">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span>{mainCategories.find(m => m.id === mainCategoryId)?.name || mainCategorySlug}</span>
          <span className="mx-2">/</span>
          <span>{mainCategories.find(m => m.id === mainCategoryId)?.category?.find((c: any) => c.id === categoryId)?.name || categorySlug}</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{pageTitle}</span>
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
                {pageTitle || "Products"}
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

                {/* Load More Button */}
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