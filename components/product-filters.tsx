"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Filter, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useMainCategories } from "@/hooks/use-main-categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { mainCategories, LocalStorageManager, MainCategory } from "@/lib/mock-data";
import { useCategoryTree } from "@/hooks/use-category-tree";

interface ProductFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  mainCategoryId?: string | null;
  selectedCategories: string[];
  selectedSubCategories: string[];
  priceRange: [number, number];
  onCategoryChange: (categoryId: string, checked: boolean) => void;
  onSubCategoryChange: (subCategoryId: string, checked: boolean) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onClearFilters: () => void;
}

export default function ProductFilters({
  isOpen,
  onToggle,
  mainCategoryId,
  selectedCategories,
  selectedSubCategories,
  priceRange,
  onCategoryChange,
  onSubCategoryChange,
  onPriceRangeChange,
  onClearFilters,
}: ProductFiltersProps) {
  const { categoryTree } = useCategoryTree();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [minPrice, setMinPrice] = useState(priceRange[0]);
  const [maxPrice, setMaxPrice] = useState(priceRange[1]);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  // Get current main category data from unified category tree
  const currentMainCategory = categoryTree.find(cat => cat.id === mainCategoryId);
  const categories = currentMainCategory?.category || [];

  // Update local price state when props change
  useEffect(() => {
    setMinPrice(priceRange[0]);
    setMaxPrice(priceRange[1]);
  }, [priceRange]);

  // Initialize filters based on current URL path
  useEffect(() => {
    if (!hasInitialized && categoryTree.length > 0 && categories.length > 0) {
      const currentPath = window.location.pathname;
      const pathSegments = currentPath.split('/').filter(segment => segment !== '');

      // Check if we're on a category or subcategory page
      if (pathSegments.length >= 3 && pathSegments[0] === 'products') {
        const mainCategorySlug = pathSegments[1];
        const categorySlug = pathSegments[2];
        const subcategorySlug = pathSegments[3];

        // Find matching category by slug
        const matchedCategory = categories.find(cat => {
          const catSlug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
          return catSlug === categorySlug;
        });

        if (matchedCategory && !selectedCategories.includes(matchedCategory.id)) {
          // Auto-select the category
          onCategoryChange(matchedCategory.id, true);

          // If there's a subcategory, find and select it too
          if (subcategorySlug && matchedCategory.sub_category) {
            const matchedSubcategory = matchedCategory.sub_category.find(sub => {
              const subSlug = sub.slug || sub.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
              return subSlug === subcategorySlug;
            });

            if (matchedSubcategory && !selectedSubCategories.includes(matchedSubcategory.id)) {
              onSubCategoryChange(matchedSubcategory.id, true);
              // Expand the category to show subcategories
              setExpandedCategories(new Set([matchedCategory.id]));
            }
          }
        }
      }

      setHasInitialized(true);
    }
  }, [categoryTree, categories, hasInitialized, selectedCategories, selectedSubCategories, onCategoryChange, onSubCategoryChange]);

  // Reset expanded categories when no categories are selected
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setExpandedCategories(new Set());
    }
  }, [selectedCategories]);

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const router = useRouter();

  const handleCategoryChange = (categoryId: string) => {
    // If clicking the same category, clear the selection
    if (selectedCategories.includes(categoryId)) {
      // Clear the category selection properly
      onCategoryChange(categoryId, false);
      // Also clear any expanded categories
      setExpandedCategories(new Set());
      return;
    }

    // Clear all previous selections and set new one
    selectedCategories.forEach(id => onCategoryChange(id, false));
    onCategoryChange(categoryId, true);

    // Navigate to category page with clean URL
    if (currentMainCategory) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        const mainCategorySlug = currentMainCategory.slug || currentMainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        // Use setTimeout to allow state update to complete before navigation
        setTimeout(() => {
          router.push(`/products/${mainCategorySlug}/${categorySlug}`);
        }, 50);
      }
    }
  };

  const handleSubCategoryChange = (subCategoryId: string, categoryId: string) => {
    // If clicking the same subcategory, clear the selection
    if (selectedSubCategories.includes(subCategoryId)) {
      // Clear the subcategory selection properly
      onSubCategoryChange(subCategoryId, false);
      return;
    }

    // Clear all previous subcategory selections and set new one
    selectedSubCategories.forEach(id => onSubCategoryChange(id, false));
    onSubCategoryChange(subCategoryId, true);

    // Navigate to subcategory page with clean URL
    if (currentMainCategory) {
      const category = categories.find(cat => cat.id === categoryId);
      const subcategory = category?.sub_category?.find(sub => sub.id === subCategoryId);

      if (category && subcategory) {
        const mainCategorySlug = currentMainCategory.slug || currentMainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        const subcategorySlug = subcategory.slug || subcategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        // Use setTimeout to allow state update to complete before navigation
        setTimeout(() => {
          router.push(`/products/${mainCategorySlug}/${categorySlug}/${subcategorySlug}`);
        }, 50);
      }
    }
  };

  const handlePriceSliderChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setMinPrice(newRange[0]);
    setMaxPrice(newRange[1]);
    onPriceRangeChange(newRange);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setMinPrice(value);
    if (value <= maxPrice) {
      onPriceRangeChange([value, maxPrice]);
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 10000;
    setMaxPrice(value);
    if (value >= minPrice) {
      onPriceRangeChange([minPrice, value]);
    }
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedSubCategories.length > 0 || 
    priceRange[0] > 0 || priceRange[1] < 10000;

  const getActiveFilterBadges = () => {
    const badges = [];

    // Category badges
    selectedCategories.forEach(categoryId => {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        badges.push({
          id: `category-${categoryId}`,
          label: category.name,
          type: 'category' as const,
          value: categoryId
        });
      }
    });

    // Subcategory badges
    selectedSubCategories.forEach(subCategoryId => {
      let subCategory: any = null;
      categories.forEach(cat => {
        const found = cat.sub_category?.find(sub => sub.id === subCategoryId);
        if (found) subCategory = found;
      });
      if (subCategory) {
        badges.push({
          id: `subcategory-${subCategoryId}`,
          label: subCategory.name,
          type: 'subcategory' as const,
          value: subCategoryId
        });
      }
    });

    // Price range badge
    if (priceRange[0] > 0 || priceRange[1] < 10000) {
      badges.push({
        id: 'price-range',
        label: `₹${priceRange[0]} - ₹${priceRange[1]}`,
        type: 'price' as const,
        value: 'price'
      });
    }

    return badges;
  };

  const removeBadge = (badge: any) => {
    if (badge.type === 'category') {
      // Clear the specific category selection and reset expanded state
      onCategoryChange(badge.value, false);
      setExpandedCategories(new Set());

      // Navigate back to main category page
      if (currentMainCategory) {
        const mainCategorySlug = currentMainCategory.slug || currentMainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
        setTimeout(() => {
          router.push(`/products/${mainCategorySlug}`);
        }, 50);
      }
    } else if (badge.type === 'subcategory') {
      // Clear the specific subcategory selection
      onSubCategoryChange(badge.value, false);

      // Navigate back to category page if there's a selected category
      if (selectedCategories.length > 0 && currentMainCategory) {
        const category = categories.find(cat => cat.id === selectedCategories[0]);
        if (category) {
          const mainCategorySlug = currentMainCategory.slug || currentMainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
          const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
          setTimeout(() => {
            router.push(`/products/${mainCategorySlug}/${categorySlug}`);
          }, 50);
        }
      }
    } else if (badge.type === 'price') {
      onPriceRangeChange([0, 10000]);
    }
  };

  // Filter content component for reuse in both desktop and mobile
  const FilterContent = () => (
    <div className="space-y-6 md:space-y-8">
      {/* Department Section */}
      {currentMainCategory && (
        <div className="border-b border-gray-100 pb-4 md:pb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3 uppercase tracking-wide">
            Department
          </h3>
          <div className="text-sm text-gray-700 font-medium">
            {currentMainCategory.name}
          </div>
        </div>
      )}

      {/* Categories Section */}
      {categories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide">
              Category
            </h3>
            {/* Clear Filter Button */}
            {selectedCategories.length > 0 && (
              <button
                onClick={() => {
                  // Clear all selected categories and subcategories
                  selectedCategories.forEach(id => onCategoryChange(id, false));
                  selectedSubCategories.forEach(id => onSubCategoryChange(id, false));
                  setExpandedCategories(new Set());

                  // Navigate back to main category page
                  if (currentMainCategory) {
                    const mainCategorySlug = currentMainCategory.slug || currentMainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
                    setTimeout(() => {
                      router.push(`/products/${mainCategorySlug}`);
                    }, 50);
                  }
                }}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          {/* Show only selected category if one is active */}
          {selectedCategories.length > 0 ? (
            <div className="space-y-3">
              {categories
                .filter(category => selectedCategories.includes(category.id))
                .map((category) => (
                  <div key={category.id}>
                    {/* Active Category Display */}
                    <div className="flex items-center justify-between group">
                      <div className="flex items-center space-x-3 p-2 rounded-md bg-orange-100 border border-orange-200 w-full">
                        <RadioGroup value={category.id} className="flex items-center space-x-3 w-full">
                          <RadioGroupItem 
                            value={category.id} 
                            id={`category-${category.id}`}
                            className="border-orange-300 text-orange-600 focus:ring-orange-600"
                          />
                          <label
                            htmlFor={`category-${category.id}`}
                            className="text-sm cursor-pointer text-orange-800 font-medium flex-1"
                          >
                            {category.name}
                          </label>
                        </RadioGroup>
                        {/* Close button */}
                        <button
                          onClick={() => {
                            // Clear all selected categories and reset expanded state
                            selectedCategories.forEach(id => onCategoryChange(id, false));
                            selectedSubCategories.forEach(id => onSubCategoryChange(id, false));
                            setExpandedCategories(new Set());

                            // Navigate back to main category page
                            if (currentMainCategory) {
                              const mainCategorySlug = currentMainCategory.slug || currentMainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
                              setTimeout(() => {
                                router.push(`/products/${mainCategorySlug}`);
                              }, 50);
                            }
                          }}
                          className="text-orange-600 hover:text-orange-700 p-1 hover:bg-orange-200 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Expand/Collapse Button for Subcategories */}
                      {category.sub_category && category.sub_category.length > 0 && (
                        <button
                          onClick={() => toggleCategoryExpansion(category.id)}
                          className="p-1 hover:bg-orange-200 rounded transition-colors ml-2"
                        >
                          {expandedCategories.has(category.id) ? (
                            <Minus className="w-3 h-3 text-orange-600" />
                          ) : (
                            <Plus className="w-3 h-3 text-orange-600" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Subcategories */}
                    {expandedCategories.has(category.id) && category.sub_category && (
                      <div className="ml-6 mt-3 space-y-3 border-l border-orange-200 pl-4">
                        <RadioGroup 
                          value={selectedSubCategories[0] || ''} 
                          onValueChange={(value) => handleSubCategoryChange(value, category.id)}
                          className="space-y-2"
                        >
                          {category.sub_category.map((subcategory) => (
                            <div key={subcategory.id} className={`flex items-center justify-between space-x-3 p-2 rounded-md transition-colors cursor-pointer ${
                              selectedSubCategories.includes(subcategory.id) 
                                ? 'bg-orange-50 border border-orange-100' 
                                : 'hover:bg-gray-50'
                            }`}>
                              <div className="flex items-center space-x-3">
                                <RadioGroupItem 
                                  value={subcategory.id} 
                                  id={`subcategory-${subcategory.id}`}
                                  className="border-gray-300 text-orange-600 focus:ring-orange-600"
                                />
                                <label
                                  htmlFor={`subcategory-${subcategory.id}`}
                                  className={`text-sm cursor-pointer transition-colors ${
                                    selectedSubCategories.includes(subcategory.id)
                                      ? 'text-orange-700 font-medium'
                                      : 'text-gray-600 hover:text-gray-800'
                                  }`}
                                >
                                  {subcategory.name}
                                </label>
                              </div>
                              {/* Clear subcategory button */}
                              {selectedSubCategories.includes(subcategory.id) && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Clear the specific subcategory
                                    onSubCategoryChange(subcategory.id, false);

                                    // Navigate back to category page
                                    if (currentMainCategory) {
                                      const mainCategorySlug = currentMainCategory.slug || currentMainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
                                      const categorySlug = category.slug || category.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
                                      setTimeout(() => {
                                        router.push(`/products/${mainCategorySlug}/${categorySlug}`);
                                      }, 50);
                                    }
                                  }}
                                  className="text-orange-600 hover:text-orange-700 p-1 hover:bg-orange-100 rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            /* Show all categories when none is selected */
            <div className="space-y-3">
              <RadioGroup 
                value={selectedCategories[0] || ''} 
                onValueChange={handleCategoryChange}
                className="space-y-3"
              >
                {categories.map((category) => (
                  <div key={category.id}>
                    {/* Category Radio Button */}
                    <div className="flex items-center space-x-3 p-2 rounded-md transition-colors cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem 
                        value={category.id} 
                        id={`category-${category.id}`}
                        className="border-gray-300 text-orange-600 focus:ring-orange-600"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm cursor-pointer text-gray-700 hover:text-gray-900"
                      >
                        {category.name}
                      </label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </div>
      )}

      {/* Price Range Section */}
      <div className="border-t border-gray-100 pt-6 md:pt-8">
        <h3 className="text-sm font-medium text-gray-900 mb-4 uppercase tracking-wide">
          Price Range
        </h3>

        {/* Price Slider */}
        <div className="mb-6">
          <Slider
            value={[minPrice, maxPrice]}
            onValueChange={handlePriceSliderChange}
            max={10000}
            min={0}
            step={100}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>₹0</span>
            <span>₹10,000</span>
          </div>
        </div>

        {/* Price Input Fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Min</label>
            <Input
              type="number"
              value={minPrice}
              onChange={handleMinPriceChange}
              className="h-9 text-sm border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              placeholder="₹0"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Max</label>
            <Input
              type="number"
              value={maxPrice}
              onChange={handleMaxPriceChange}
              className="h-9 text-sm border-gray-200 focus:border-orange-400 focus:ring-orange-400"
              placeholder="₹10,000"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Toggle Button */}
      <div className="hidden md:block mb-6">
        <Button
          variant="outline"
          onClick={onToggle}
          className="flex items-center gap-2 h-10 px-4 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          {isOpen ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {/* Mobile Filter Button */}
      <div className="block md:hidden mb-6">
        <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 h-10 px-4 border border-gray-200 hover:bg-gray-50 transition-colors justify-start"
            >
              <Filter className="w-4 h-4" />
              Filter Products
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700 text-xs px-2 py-0.5">
                  {getActiveFilterBadges().length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[80%] sm:w-96 p-0 bg-white">
            <div className="flex flex-col h-full">
              <SheetHeader className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <SheetTitle className="text-lg font-semibold text-gray-900 flex-1">Filters</SheetTitle>
                </div>
                {hasActiveFilters && (
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        // Clear all filter states
                        selectedCategories.forEach(id => onCategoryChange(id, false));
                        selectedSubCategories.forEach(id => onSubCategoryChange(id, false));
                        onPriceRangeChange([0, 10000]);
                        setExpandedCategories(new Set());

                        // Navigate back to main category page
                        if (currentMainCategory) {
                          const mainCategorySlug = currentMainCategory.slug || currentMainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
                          setTimeout(() => {
                            router.push(`/products/${mainCategorySlug}`);
                          }, 50);
                        }
                      }}
                      className="text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 px-3 py-1.5 h-auto font-medium rounded-md"
                    >
                      Clear All
                    </Button>
                  </div>
                )}

                {/* Active Filters Badges on Mobile */}
                {hasActiveFilters && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {getActiveFilterBadges().map((badge) => (
                        <Badge
                          key={badge.id}
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors"
                        >
                          {badge.label}
                          <button
                            onClick={() => removeBadge(badge)}
                            className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-4">
                <FilterContent />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Badges - Only show on desktop when sidebar is open */}
      {hasActiveFilters && isOpen && (
        <div className="hidden md:block mb-6">
          <div className="flex flex-wrap gap-2">
            {getActiveFilterBadges().map((badge) => (
              <Badge
                key={badge.id}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 transition-colors"
              >
                {badge.label}
                <button
                  onClick={() => removeBadge(badge)}
                  className="ml-1 hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Filter Sidebar */}
      {isOpen && (
        <div className="hidden md:block w-64 bg-white border-r border-gray-100 min-h-screen">
          <div className="sticky top-0 p-6 border-b border-gray-100 bg-white">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-0">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    // Clear all filter states
                    selectedCategories.forEach(id => onCategoryChange(id, false));
                    selectedSubCategories.forEach(id => onSubCategoryChange(id, false));
                    onPriceRangeChange([0, 10000]);
                    setExpandedCategories(new Set());

                    // Navigate back to main category page
                    if (currentMainCategory) {
                      const mainCategorySlug = currentMainCategory.slug || currentMainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
                      setTimeout(() => {
                        router.push(`/products/${mainCategorySlug}`);
                      }, 50);
                    }
                  }}
                  className="text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 h-auto font-medium"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <div className="p-6">
            <FilterContent />
          </div>
        </div>
      )}
    </>
  );
}