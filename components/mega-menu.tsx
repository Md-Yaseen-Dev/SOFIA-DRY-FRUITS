
"use client";
import { useRouter } from "next/navigation";
import { useCategoryTree } from "@/hooks/use-category-tree";

interface MegaMenuProps {
  isOpen: boolean;
  hoveredMainCategoryId?: string | null;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function MegaMenu({ isOpen, hoveredMainCategoryId, onClose, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const router = useRouter();
  const { categoryTree, isLoading } = useCategoryTree();

  const navigateToCategory = (path: string) => {
    router.push(`/${path}`);
    onClose();
  };

  const navigateToMainCategory = (mainCategoryName: string) => {
    const slug = mainCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    navigateToCategory(`products/${slug}`);
  };

  const navigateToSubCategory = (mainCategoryName: string, categoryName: string) => {
    const mainSlug = mainCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    navigateToCategory(`products/${mainSlug}/${categorySlug}`);
  };

  const navigateToSubSubCategory = (mainCategoryName: string, categoryName: string, subCategoryName: string) => {
    const mainSlug = mainCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    const subSlug = subCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    navigateToCategory(`products/${mainSlug}/${categorySlug}/${subSlug}`);
  };

  if (!isOpen || !hoveredMainCategoryId) return null;

  const hoveredCategory = categoryTree?.find(cat => cat.id === hoveredMainCategoryId);
  if (!hoveredCategory) return null;

  const categories = hoveredCategory.category || [];

  return (
    <div 
      className="mega-menu absolute top-full bg-white shadow-2xl border-t border-gray-100 z-50 p-4 left-0 right-0 w-full lg:w-full"
      style={{ 
        height: '400px', 
        marginTop: '-1px'
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="h-full overflow-hidden">
        <div className="grid grid-cols-4 gap-6 h-full">
          {categories.slice(0, 4).map((category, index) => (
            <CategoryColumn 
              key={category.id}
              category={category}
              hoveredCategory={hoveredCategory}
              onNavigateToMainCategory={navigateToMainCategory}
              onNavigateToSubCategory={navigateToSubCategory}
              onNavigateToSubSubCategory={navigateToSubSubCategory}
              isLast={index === Math.min(categories.length - 1, 3)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryColumn({ 
  category, 
  hoveredCategory, 
  onNavigateToMainCategory,
  onNavigateToSubCategory,
  onNavigateToSubSubCategory,
  isLast 
}: any) {
  const subcategories = category.sub_category || [];

  return (
    <div 
      className={`flex-1 h-full overflow-y-auto ${!isLast ? 'border-r border-gray-100 pr-4' : ''} min-w-0`}
    >
      <div className="p-2">
        <div className="mb-3">
          <button
            onClick={() => onNavigateToSubCategory(hoveredCategory.name, category.name)}
            className="text-orange-500 font-bold text-sm hover:text-orange-600 transition-colors duration-200 uppercase tracking-wide block w-full text-left py-1 rounded"
          >
            {category.name}
          </button>
        </div>

        <div className="space-y-1">
          {subcategories.length > 0 ? (
            <div className="space-y-1">
              {subcategories.map((subcategory: any) => (
                <button
                  key={subcategory.id}
                  onClick={() => onNavigateToSubSubCategory(hoveredCategory.name, category.name, subcategory.name)}
                  className="block w-full text-left text-gray-600 text-xs transition-all duration-200 py-1 px-1 rounded-sm hover:bg-orange-500 hover:text-white"
                  style={{ minHeight: '20px' }}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => onNavigateToSubCategory(hoveredCategory.name, category.name)}
                className="block w-full text-left text-gray-600 text-xs transition-all duration-200 py-1 px-1 rounded-sm hover:bg-orange-500 hover:text-white"
                style={{ minHeight: '20px' }}
              >
                All {category.name}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
