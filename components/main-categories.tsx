"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useCategoryTree } from '@/hooks/use-category-tree';

interface MainCategoriesProps {
  isScrolled: boolean;
  pathname: string;
  disabled?: boolean;
}

export default function MainCategories({ isScrolled, pathname, disabled = false }: MainCategoriesProps) {
  const router = useRouter();
  const [hoveredMainCategoryId, setHoveredMainCategoryId] = useState<string | null>(null);
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const { categoryTree, isLoading: categoryTreeLoading } = useCategoryTree();
  const categoryTreeError = false;

  // Memoize category tree parsing to prevent lag
  const memoizedCategoryTree = useMemo(() => {
    if (!categoryTree || categoryTree.length === 0) return [];
    return categoryTree.filter(mainCategory => 
      mainCategory && mainCategory.id && mainCategory.name
    );
  }, [categoryTree]);

  const handleMainCategoryClick = (categoryId: string, categoryName: string) => {
    const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    router.push(`/products/${slug}`);
    setHoveredMainCategoryId(null);
  };

  const handleCategoryClick = (mainCategoryId: string, categoryId: string, categoryName: string, mainCategoryName: string) => {
    const mainSlug = mainCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    router.push(`/products/${mainSlug}/${categorySlug}`);
    setHoveredMainCategoryId(null);
  };

  const handleSubCategoryClick = (mainCategoryId: string, categoryId: string, subCategoryId: string, subCategoryName: string, categoryName: string, mainCategoryName: string) => {
    const mainSlug = mainCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    const subSlug = subCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    router.push(`/products/${mainSlug}/${categorySlug}/${subSlug}`);
    setSelectedMobileCategory(null);
    setSelectedSubCategory(null);
    setHoveredMainCategoryId(null);
  };

  // Get the currently hovered category data
  const hoveredCategory = hoveredMainCategoryId 
    ? memoizedCategoryTree.find(cat => cat.id === hoveredMainCategoryId)
    : null;

  return (
    <div className={`border-t ${pathname === "/" && !isScrolled ? "border-white/20" : "border-gray-200"} ${
      pathname === "/" && !isScrolled ? "bg-transparent" : "bg-white"
    } shadow-sm relative transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Desktop Category Strip */}
        <div className="hidden lg:flex items-center justify-evenly relative">
          {categoryTreeLoading ? (
            <div className="text-sm text-gray-500">Loading categories...</div>
          ) : categoryTreeError ? (
            <div className="text-sm text-red-500">Error loading categories</div>
          ) : !memoizedCategoryTree || memoizedCategoryTree.length === 0 ? (
            <div className="text-sm text-gray-500">No categories available</div>
          ) : (
            memoizedCategoryTree.map((mainCategory) => {
              if (!mainCategory || !mainCategory.id || !mainCategory.name) {
                return null;
              }

              return (
                <div
                  key={mainCategory.id}
                  className="relative"
                  onMouseEnter={() => setHoveredMainCategoryId(mainCategory.id)}
                  onMouseLeave={() => setHoveredMainCategoryId(null)}
                >
                  <button
                    onClick={() => !disabled && handleMainCategoryClick(mainCategory.id, mainCategory.name)}
                    disabled={disabled}
                    className={`px-4 py-2 text-sm font-semibold transition-all duration-200 whitespace-nowrap relative group ${
                      disabled 
                        ? "cursor-not-allowed opacity-50" 
                        : pathname === "/" && !isScrolled 
                          ? "text-white hover:text-orange-300" 
                          : "text-gray-800 hover:text-orange-600"
                    }`}
                  >
                    {mainCategory.name}
                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 group-hover:w-full ${
                      pathname === "/" && !isScrolled ? "bg-orange-300" : "bg-orange-600"
                    }`}></span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Flipkart-style Full-Width Megamenu - Desktop only */}
        {!disabled && hoveredMainCategoryId && hoveredCategory && hoveredCategory.category && Array.isArray(hoveredCategory.category) && hoveredCategory.category.length > 0 && (
          <div 
            className="hidden lg:block absolute top-full left-0 w-full bg-white shadow-xl border border-gray-200 z-[60]"
            style={{ 
              marginTop: '0px',
              maxWidth: '100vw'
            }}
            onMouseEnter={() => setHoveredMainCategoryId(hoveredMainCategoryId)}
            onMouseLeave={() => setHoveredMainCategoryId(null)}
          >
            <div className="max-w-screen-xl mx-auto">
              <div className="p-3">
                {/* Compact height container with consistent layout */}
                <div className="h-56 overflow-hidden">
                  <div className="flex h-full">
                    {/* Categories displayed in consistent vertical columns */}
                    {hoveredCategory.category.slice(0, 6).map((category, index) => {
                      if (!category || !category.id || !category.name) {
                        return null;
                      }

                      // Helper function to convert to title case
            const toTitleCase = (str: string): string => {
              return str
                .toLowerCase()
                .split(' ')
                .map(word =>
                  word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(' ');
            };


                      return (
                        <div 
                          key={category.id} 
                          className="flex-1 pr-4 h-full overflow-y-auto"
                          style={{ minWidth: '180px' }}
                        >
                          <div className="mb-2">
                            <button
                              onClick={() => handleCategoryClick(hoveredCategory.id, category.id, category.name, hoveredCategory.name)}
                              className="text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors duration-200  tracking-wide border-b border-orange-200 pb-1 mb-2 block w-full text-left leading-tight"
                            >
                              {toTitleCase(category.name)}
                            </button>
                          </div>

                          {/* Subcategories */}
                          <div className="space-y-1">
                            {category.sub_category && Array.isArray(category.sub_category) && category.sub_category.length > 0 ? (
                              category.sub_category.slice(0, 18).map((subCategory) => {
                                if (!subCategory || !subCategory.id || !subCategory.name) {
                                  return null;
                                }

                                return (
                                  <button
                                    key={subCategory.id}
                                    onClick={() => handleSubCategoryClick(hoveredCategory.id, category.id, subCategory.id, subCategory.name, category.name, hoveredCategory.name)}
                                    className="block text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all duration-200 text-left w-full py-1 px-1.5 rounded-sm text-xs leading-tight"
                                  >
                                    {toTitleCase(subCategory.name)}
                                  </button>
                                );
                              })
                            ) : (
                              <button
                                onClick={() => handleCategoryClick(hoveredCategory.id, category.id, category.name, hoveredCategory.name)}
                                className="text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-all duration-200 text-left w-full py-1 px-1.5 rounded-sm text-xs leading-tight"
                              >
                                Explore {toTitleCase(category.name)}
                              </button>
                            )}

                            {category.sub_category && category.sub_category.length > 18 && (
                              <button
                                onClick={() => handleCategoryClick(hoveredCategory.id, category.id, category.name, hoveredCategory.name)}
                                className="text-orange-500 hover:text-orange-600 font-medium py-1 px-1.5 text-xs leading-tight"
                              >
                                View All ({category.sub_category.length})
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Category Strip */}
        <div className="lg:hidden flex items-center py-3 space-x-3 overflow-x-auto scrollbar-hide">
          {categoryTreeLoading ? (
            <div className="text-xs text-gray-500 px-2">Loading...</div>
          ) : categoryTreeError ? (
            <div className="text-xs text-red-500 px-2">Error</div>
          ) : !memoizedCategoryTree || memoizedCategoryTree.length === 0 ? (
            <div className="text-xs text-gray-500 px-2">No categories</div>
          ) : (
            memoizedCategoryTree.slice(0, 8).map((mainCategory) => {
              if (!mainCategory || !mainCategory.id || !mainCategory.name) {
                return null;
              }

              return (
                <button
                  key={mainCategory.id}
                  onClick={() => !disabled && handleMainCategoryClick(mainCategory.id, mainCategory.name)}
                  disabled={disabled}
                  className={`px-4 py-2 text-xs font-medium transition-all duration-200 whitespace-nowrap rounded-lg border ${
                    disabled
                      ? "cursor-not-allowed opacity-50 border-gray-300"
                      : pathname === "/" && !isScrolled
                        ? "text-white border-white/20 hover:text-orange-300 hover:bg-white/10 hover:border-orange-300"
                        : "text-gray-700 border-gray-200 hover:text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                  }`}
                >
                  {mainCategory.name}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}