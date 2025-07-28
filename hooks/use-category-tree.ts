
import { useState, useEffect } from 'react';
import { LocalStorageManager, MainCategory, Category, SubCategory } from '@/lib/mock-data';

export function useCategoryTree() {
  const [categoryTree, setCategoryTree] = useState<MainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategoryTree = () => {
      setIsLoading(true);
      try {
        const tree = LocalStorageManager.initializeCategoryTree();
        setCategoryTree(tree);
      } catch (error) {
        console.error('Error loading category tree:', error);
        setCategoryTree([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategoryTree();

    // Listen for category tree updates
    const handleCategoryTreeUpdate = (event: CustomEvent) => {
      setCategoryTree(event.detail);
    };

    window.addEventListener('categoryTreeUpdated', handleCategoryTreeUpdate as EventListener);
    return () => window.removeEventListener('categoryTreeUpdated', handleCategoryTreeUpdate as EventListener);
  }, []);

  const updateCategoryTree = (newTree: MainCategory[]) => {
    LocalStorageManager.setCategoryTree(newTree);
    setCategoryTree(newTree);
  };

  const addMainCategory = (mainCategory: MainCategory) => {
    const updatedTree = [...categoryTree, mainCategory];
    updateCategoryTree(updatedTree);
    
    // Notify all components about the update
    window.dispatchEvent(new CustomEvent('categoryTreeUpdated', { detail: updatedTree }));
  };

  const updateMainCategory = (id: string, updates: Partial<MainCategory>) => {
    const updatedTree = categoryTree.map(cat => 
      cat.id === id ? { ...cat, ...updates, updated_at: new Date().toISOString() } : cat
    );
    updateCategoryTree(updatedTree);
    
    // Notify all components about the update
    window.dispatchEvent(new CustomEvent('categoryTreeUpdated', { detail: updatedTree }));
  };

  const deleteMainCategory = (id: string) => {
    const updatedTree = categoryTree.filter(cat => cat.id !== id);
    updateCategoryTree(updatedTree);
    
    // Notify all components about the update
    window.dispatchEvent(new CustomEvent('categoryTreeUpdated', { detail: updatedTree }));
  };

  const addCategory = (mainCategoryId: string, category: Category) => {
    const updatedTree = categoryTree.map(mainCat => {
      if (mainCat.id === mainCategoryId) {
        return {
          ...mainCat,
          category: [...(mainCat.category || []), category],
          updated_at: new Date().toISOString()
        };
      }
      return mainCat;
    });
    updateCategoryTree(updatedTree);
    
    // Notify all components about the update
    window.dispatchEvent(new CustomEvent('categoryTreeUpdated', { detail: updatedTree }));
  };

  const updateCategory = (mainCategoryId: string, categoryId: string, updates: Partial<Category>) => {
    const updatedTree = categoryTree.map(mainCat => {
      if (mainCat.id === mainCategoryId) {
        return {
          ...mainCat,
          category: (mainCat.category || []).map(cat => 
            cat.id === categoryId ? { ...cat, ...updates, updated_at: new Date().toISOString() } : cat
          ),
          updated_at: new Date().toISOString()
        };
      }
      return mainCat;
    });
    updateCategoryTree(updatedTree);
    
    // Notify all components about the update
    window.dispatchEvent(new CustomEvent('categoryTreeUpdated', { detail: updatedTree }));
  };

  const deleteCategory = (mainCategoryId: string, categoryId: string) => {
    const updatedTree = categoryTree.map(mainCat => {
      if (mainCat.id === mainCategoryId) {
        return {
          ...mainCat,
          category: (mainCat.category || []).filter(cat => cat.id !== categoryId),
          updated_at: new Date().toISOString()
        };
      }
      return mainCat;
    });
    updateCategoryTree(updatedTree);
    
    // Notify all components about the update
    window.dispatchEvent(new CustomEvent('categoryTreeUpdated', { detail: updatedTree }));
  };

  const addSubCategory = (mainCategoryId: string, categoryId: string, subCategory: SubCategory) => {
    const updatedTree = categoryTree.map(mainCat => {
      if (mainCat.id === mainCategoryId) {
        return {
          ...mainCat,
          category: (mainCat.category || []).map(cat => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                sub_category: [...(cat.sub_category || []), subCategory],
                updated_at: new Date().toISOString()
              };
            }
            return cat;
          }),
          updated_at: new Date().toISOString()
        };
      }
      return mainCat;
    });
    updateCategoryTree(updatedTree);
    
    // Notify all components about the update
    window.dispatchEvent(new CustomEvent('categoryTreeUpdated', { detail: updatedTree }));
  };

  const updateSubCategory = (mainCategoryId: string, categoryId: string, subCategoryId: string, updates: Partial<SubCategory>) => {
    const updatedTree = categoryTree.map(mainCat => {
      if (mainCat.id === mainCategoryId) {
        return {
          ...mainCat,
          category: (mainCat.category || []).map(cat => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                sub_category: (cat.sub_category || []).map(subCat => 
                  subCat.id === subCategoryId ? { ...subCat, ...updates, updated_at: new Date().toISOString() } : subCat
                ),
                updated_at: new Date().toISOString()
              };
            }
            return cat;
          }),
          updated_at: new Date().toISOString()
        };
      }
      return mainCat;
    });
    updateCategoryTree(updatedTree);
    
    // Notify all components about the update
    window.dispatchEvent(new CustomEvent('categoryTreeUpdated', { detail: updatedTree }));
  };

  const deleteSubCategory = (mainCategoryId: string, categoryId: string, subCategoryId: string) => {
    const updatedTree = categoryTree.map(mainCat => {
      if (mainCat.id === mainCategoryId) {
        return {
          ...mainCat,
          category: (mainCat.category || []).map(cat => {
            if (cat.id === categoryId) {
              return {
                ...cat,
                sub_category: (cat.sub_category || []).filter(subCat => subCat.id !== subCategoryId),
                updated_at: new Date().toISOString()
              };
            }
            return cat;
          }),
          updated_at: new Date().toISOString()
        };
      }
      return mainCat;
    });
    updateCategoryTree(updatedTree);
    
    // Notify all components about the update
    window.dispatchEvent(new CustomEvent('categoryTreeUpdated', { detail: updatedTree }));
  };

  // Helper methods for validation
  const validateCategoryPath = (mainCategoryId: string, categoryId: string, subCategoryId?: string): boolean => {
    // First check in the current tree
    const mainCategory = categoryTree.find(mc => mc.id === mainCategoryId);
    if (!mainCategory) return false;

    const category = mainCategory.category?.find(c => c.id === categoryId);
    if (!category) return false;

    if (subCategoryId) {
      const subCategory = category.sub_category?.find(sc => sc.id === subCategoryId);
      if (!subCategory) return false;
    }

    // Also validate using LocalStorageManager as fallback
    return LocalStorageManager.validateCategoryPath(mainCategoryId, categoryId, subCategoryId || '');
  };

  const validateStrictHierarchy = (mainCategoryId: string, categoryId: string, subCategoryId: string): boolean => {
    const mainCategory = categoryTree.find(mc => mc.id === mainCategoryId);
    if (!mainCategory) return false;

    const category = mainCategory.category?.find(c => c.id === categoryId && c.main_category_id === mainCategoryId);
    if (!category) return false;

    const subCategory = category.sub_category?.find(sc => 
      sc.id === subCategoryId && 
      sc.category_id === categoryId && 
      sc.main_category_id === mainCategoryId
    );
    return !!subCategory;
  };

  const getFullCategoryInfo = (mainCategoryId: string, categoryId: string, subCategoryId: string) => {
    const mainCategory = categoryTree.find(mc => mc.id === mainCategoryId);
    if (!mainCategory) return null;

    const category = mainCategory.category?.find(c => c.id === categoryId);
    if (!category) return null;

    const subCategory = category.sub_category?.find(sc => sc.id === subCategoryId);
    if (!subCategory) return null;

    return {
      mainCategory: {
        id: mainCategory.id,
        name: mainCategory.name
      },
      category: {
        id: category.id,
        name: category.name,
        main_category_id: category.main_category_id
      },
      subCategory: {
        id: subCategory.id,
        name: subCategory.name,
        category_id: subCategory.category_id,
        main_category_id: subCategory.main_category_id
      },
      categoryPath: `${mainCategory.name}/${category.name}/${subCategory.name}`
    };
  };

  const getCategoryPath = (mainCategoryId: string, categoryId: string, subCategoryId?: string) => {
    return LocalStorageManager.getCategoryPath(mainCategoryId, categoryId, subCategoryId);
  };

  return {
    categoryTree,
    isLoading,
    updateCategoryTree,
    addMainCategory,
    updateMainCategory,
    deleteMainCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory,
    validateCategoryPath,
    validateStrictHierarchy,
    getFullCategoryInfo,
    getCategoryPath
  };
}
