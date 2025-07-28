
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCategoryTree } from '@/hooks/use-category-tree';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Save, X, Eye, EyeOff } from 'lucide-react';
import type { MainCategory, Category, SubCategory } from '@/lib/mock-data';

interface EditingState {
  type: 'main' | 'category' | 'subcategory';
  id: string;
  mainCategoryId?: string;
  categoryId?: string;
}

export default function CategoryManagement() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubCategories, setExpandedSubCategories] = useState<Set<string>>(new Set());
  const [editingState, setEditingState] = useState<EditingState | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [editingImageUrl, setEditingImageUrl] = useState('');
  const [showAddMainCategory, setShowAddMainCategory] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState<string | null>(null);
  const [showAddSubCategory, setShowAddSubCategory] = useState<{ mainId: string; categoryId: string } | null>(null);
  const [newItemData, setNewItemData] = useState({ name: '', description: '', imageUrl: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  const {
    categoryTree,
    isLoading: categoryTreeLoading,
    updateMainCategory,
    deleteMainCategory,
    addMainCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubCategory,
    updateSubCategory,
    deleteSubCategory
  } = useCategoryTree();

  useEffect(() => {
    // Check master admin authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    
    const authIsLoggedIn = MockUserAuth.isLoggedIn();
    const authUserRole = MockUserAuth.getCurrentUserRole();
    
    const hasMasterAdminAccess = (isAuthenticated && userRole === 'master_admin' && userEmail === 'abhay@gmail.com') || 
                                 (authIsLoggedIn && authUserRole === 'master_admin') ||
                                 MockUserAuth.isMasterAdmin();

    if (!hasMasterAdminAccess) {
      router.push('/');
      return;
    }

    setCurrentUser({
      email: 'abhay@gmail.com',
      name: 'Abhay Huilgol',
      role: 'Master Administrator'
    });
    setIsLoading(false);
  }, [router]);

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedSubCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedSubCategories(newExpanded);
  };

  const startEditing = (type: 'main' | 'category' | 'subcategory', id: string, currentName: string, currentDescription?: string, currentImageUrl?: string, mainCategoryId?: string, categoryId?: string) => {
    setEditingState({ type, id, mainCategoryId, categoryId });
    setEditingValue(currentName);
    setEditingDescription(currentDescription || '');
    setEditingImageUrl(currentImageUrl || '');
  };

  const cancelEditing = () => {
    setEditingState(null);
    setEditingValue('');
    setEditingDescription('');
    setEditingImageUrl('');
  };

  const saveEdit = async () => {
    if (!editingState || !editingValue.trim()) return;

    try {
      const trimmedName = editingValue.trim();
      
      // Check for duplicates
      if (editingState.type === 'main') {
        const isDuplicate = categoryTree.some(cat => 
          cat.id !== editingState.id && 
          cat.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
          toast({
            title: "Error",
            description: "A main category with this name already exists.",
            variant: "destructive"
          });
          return;
        }
        
        await updateMainCategory(editingState.id, {
          name: trimmedName,
          description: editingDescription.trim(),
          image_url: editingImageUrl.trim()
        });
      } else if (editingState.type === 'category') {
        const mainCategory = categoryTree.find(mc => mc.id === editingState.mainCategoryId);
        const isDuplicate = mainCategory?.category?.some(cat => 
          cat.id !== editingState.id && 
          cat.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
          toast({
            title: "Error",
            description: "A category with this name already exists in this main category.",
            variant: "destructive"
          });
          return;
        }
        
        await updateCategory(editingState.mainCategoryId!, editingState.id, {
          name: trimmedName,
          description: editingDescription.trim()
        });
      } else if (editingState.type === 'subcategory') {
        const mainCategory = categoryTree.find(mc => mc.id === editingState.mainCategoryId);
        const category = mainCategory?.category?.find(c => c.id === editingState.categoryId);
        const isDuplicate = category?.sub_category?.some(subCat => 
          subCat.id !== editingState.id && 
          subCat.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
          toast({
            title: "Error",
            description: "A subcategory with this name already exists in this category.",
            variant: "destructive"
          });
          return;
        }
        
        await updateSubCategory(editingState.mainCategoryId!, editingState.categoryId!, editingState.id, {
          name: trimmedName,
          description: editingDescription.trim(),
          image_url: editingImageUrl.trim()
        });
      }

      toast({
        title: "Success",
        description: "Category updated successfully.",
      });
      
      cancelEditing();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (type: 'main' | 'category' | 'subcategory', id: string, mainCategoryId?: string, categoryId?: string) => {
    try {
      if (type === 'main') {
        await deleteMainCategory(id);
        toast({
          title: "Success",
          description: "Main category deleted successfully.",
        });
      } else if (type === 'category') {
        await deleteCategory(mainCategoryId!, id);
        toast({
          title: "Success",
          description: "Category deleted successfully.",
        });
      } else if (type === 'subcategory') {
        await deleteSubCategory(mainCategoryId!, categoryId!, id);
        toast({
          title: "Success",
          description: "Subcategory deleted successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category.",
        variant: "destructive"
      });
    }
  };

  const handleAddNew = async (type: 'main' | 'category' | 'subcategory', mainCategoryId?: string, categoryId?: string) => {
    if (!newItemData.name.trim()) return;

    try {
      const trimmedName = newItemData.name.trim();
      
      if (type === 'main') {
        // Check for duplicates
        const isDuplicate = categoryTree.some(cat => 
          cat.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
          toast({
            title: "Error",
            description: "A main category with this name already exists.",
            variant: "destructive"
          });
          return;
        }

        const newMainCategory: MainCategory = {
          id: `main_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: trimmedName,
          description: newItemData.description.trim(),
          image_url: newItemData.imageUrl.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          category: []
        };
        
        await addMainCategory(newMainCategory);
        setShowAddMainCategory(false);
      } else if (type === 'category') {
        // Check for duplicates
        const mainCategory = categoryTree.find(mc => mc.id === mainCategoryId);
        const isDuplicate = mainCategory?.category?.some(cat => 
          cat.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
          toast({
            title: "Error",
            description: "A category with this name already exists in this main category.",
            variant: "destructive"
          });
          return;
        }

        const newCategory: Category = {
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          main_category_id: mainCategoryId!,
          name: trimmedName,
          description: newItemData.description.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sub_category: [],
          count: 0
        };
        
        await addCategory(mainCategoryId!, newCategory);
        setShowAddCategory(null);
      } else if (type === 'subcategory') {
        // Check for duplicates
        const mainCategory = categoryTree.find(mc => mc.id === mainCategoryId);
        const category = mainCategory?.category?.find(c => c.id === categoryId);
        const isDuplicate = category?.sub_category?.some(subCat => 
          subCat.name.toLowerCase() === trimmedName.toLowerCase()
        );
        if (isDuplicate) {
          toast({
            title: "Error",
            description: "A subcategory with this name already exists in this category.",
            variant: "destructive"
          });
          return;
        }

        const newSubCategory: SubCategory = {
          id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          main_category_id: mainCategoryId!,
          category_id: categoryId!,
          name: trimmedName,
          description: newItemData.description.trim(),
          image_url: newItemData.imageUrl.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        await addSubCategory(mainCategoryId!, categoryId!, newSubCategory);
        setShowAddSubCategory(null);
      }

      setNewItemData({ name: '', description: '', imageUrl: '' });
      toast({
        title: "Success",
        description: "Category added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add category.",
        variant: "destructive"
      });
    }
  };

  const filteredCategoryTree = categoryTree.filter(mainCategory =>
    mainCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mainCategory.category?.some(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.sub_category?.some(subCategory =>
        subCategory.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  );

  const getCategoryStats = () => {
    const stats = categoryTree.reduce((acc, mainCategory) => {
      acc.mainCategories++;
      acc.categories += mainCategory.category?.length || 0;
      mainCategory.category?.forEach(category => {
        acc.subCategories += category.sub_category?.length || 0;
      });
      return acc;
    }, { mainCategories: 0, categories: 0, subCategories: 0 });

    return stats;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const stats = getCategoryStats();

  return (
    <AdminLayout currentUser={currentUser}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
            <p className="text-gray-600 mt-1">Manage your product category hierarchy</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              onClick={() => setShowInactive(!showInactive)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              {showInactive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showInactive ? 'Hide' : 'Show'} All</span>
            </Button>
            <Button 
              onClick={() => setShowAddMainCategory(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Main Category</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Main Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.mainCategories}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.categories}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Subcategories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.subCategories}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="max-w-md">
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Category Tree */}
        <Card>
          <CardHeader>
            <CardTitle>Category Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryTreeLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading categories...</p>
              </div>
            ) : filteredCategoryTree.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No categories found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategoryTree.map((mainCategory) => (
                  <div key={mainCategory.id} className="border rounded-lg p-4">
                    {/* Main Category */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleCategoryExpansion(mainCategory.id)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {expandedCategories.has(mainCategory.id) ? 
                            <ChevronDown className="h-4 w-4" /> : 
                            <ChevronRight className="h-4 w-4" />
                          }
                        </button>
                        {editingState?.type === 'main' && editingState.id === mainCategory.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="space-y-2">
                              <Input
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="w-64"
                                placeholder="Category name"
                              />
                              <Input
                                value={editingDescription}
                                onChange={(e) => setEditingDescription(e.target.value)}
                                className="w-64"
                                placeholder="Description (optional)"
                              />
                              <Input
                                value={editingImageUrl}
                                onChange={(e) => setEditingImageUrl(e.target.value)}
                                className="w-64"
                                placeholder="Image URL (optional)"
                              />
                            </div>
                            <Button onClick={saveEdit} size="sm" className="bg-green-500 hover:bg-green-600">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button onClick={cancelEditing} size="sm" variant="outline">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{mainCategory.name}</h3>
                            {mainCategory.description && (
                              <p className="text-sm text-gray-600">{mainCategory.description}</p>
                            )}
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary">
                                {mainCategory.category?.length || 0} categories
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => setShowAddCategory(mainCategory.id)}
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => startEditing('main', mainCategory.id, mainCategory.name, mainCategory.description, mainCategory.image_url)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <h2 className="text-lg font-semibold">Delete Main Category</h2>
                              <p className="text-sm text-muted-foreground mt-2">
                                Are you sure you want to delete "{mainCategory.name}"? This will also delete all its categories and subcategories. This action cannot be undone.
                              </p>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete('main', mainCategory.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Add Category Form */}
                    {showAddCategory === mainCategory.id && (
                      <div className="mt-4 ml-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center bg-white">
                          <Plus className="h-4 w-4 mr-2 text-blue-500" />
                          Add New Category
                        </h4>
                        <div className="space-y-4 bg-white">
                          <div className="space-y-2 bg-white">
                            <Label className="text-sm font-medium text-gray-700">Category Name *</Label>
                            <Input
                              placeholder="Category name"
                              value={newItemData.name}
                              onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                          </div>
                          <div className="space-y-2 bg-white">
                            <Label className="text-sm font-medium text-gray-700">Description</Label>
                            <Textarea
                              placeholder="Description (optional)"
                              value={newItemData.description}
                              onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              rows={3}
                            />
                          </div>
                          <div className="flex items-center justify-end space-x-3 pt-2 bg-white">
                            <Button
                              onClick={() => {
                                setShowAddCategory(null);
                                setNewItemData({ name: '', description: '', imageUrl: '' });
                              }}
                              size="sm"
                              variant="outline"
                              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleAddNew('category', mainCategory.id)}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                              disabled={!newItemData.name.trim()}
                            >
                              Add Category
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    {expandedCategories.has(mainCategory.id) && mainCategory.category && (
                      <div className="mt-4 ml-8 space-y-3">
                        {mainCategory.category.map((category) => (
                          <div key={category.id} className="border-l-2 border-gray-200 pl-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <button
                                  onClick={() => toggleSubCategoryExpansion(category.id)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  {expandedSubCategories.has(category.id) ? 
                                    <ChevronDown className="h-4 w-4" /> : 
                                    <ChevronRight className="h-4 w-4" />
                                  }
                                </button>
                                {editingState?.type === 'category' && editingState.id === category.id ? (
                                  <div className="flex items-center space-x-2">
                                    <div className="space-y-2">
                                      <Input
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        className="w-48"
                                        placeholder="Category name"
                                      />
                                      <Input
                                        value={editingDescription}
                                        onChange={(e) => setEditingDescription(e.target.value)}
                                        className="w-48"
                                        placeholder="Description (optional)"
                                      />
                                    </div>
                                    <Button onClick={saveEdit} size="sm" className="bg-green-500 hover:bg-green-600">
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button onClick={cancelEditing} size="sm" variant="outline">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div>
                                    <h4 className="font-medium text-gray-800">{category.name}</h4>
                                    {category.description && (
                                      <p className="text-sm text-gray-600">{category.description}</p>
                                    )}
                                    <Badge variant="outline" className="mt-1">
                                      {category.sub_category?.length || 0} subcategories
                                    </Badge>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => setShowAddSubCategory({ mainId: mainCategory.id, categoryId: category.id })}
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => startEditing('category', category.id, category.name, category.description, '', mainCategory.id)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <h2 className="text-lg font-semibold">Delete Category</h2>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "{category.name}"? This will also delete all its subcategories. This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete('category', category.id, mainCategory.id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>

                            {/* Add Subcategory Form */}
                            {showAddSubCategory?.mainId === mainCategory.id && showAddSubCategory?.categoryId === category.id && (
                              <div className="mt-3 ml-8 p-5 bg-white border border-gray-200 rounded-lg shadow-sm" style={{ backgroundColor: '#ffffff' }}>
                                <h5 className="font-semibold text-gray-900 mb-4 flex items-center bg-white">
                                  <Plus className="h-4 w-4 mr-2 text-green-500" />
                                  Add New Subcategory
                                </h5>
                                <div className="space-y-4 bg-white">
                                  <div className="space-y-2 bg-white">
                                    <Label className="text-sm font-medium text-gray-700">Subcategory Name *</Label>
                                    <Input
                                      placeholder="Subcategory name"
                                      value={newItemData.name}
                                      onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                                      className="bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                    />
                                  </div>
                                  <div className="space-y-2 bg-white">
                                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                                    <Input
                                      placeholder="Description (optional)"
                                      value={newItemData.description}
                                      onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                                      className="bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                    />
                                  </div>
                                  <div className="space-y-2 bg-white">
                                    <Label className="text-sm font-medium text-gray-700">Image URL</Label>
                                    <Input
                                      placeholder="Image URL (optional)"
                                      value={newItemData.imageUrl}
                                      onChange={(e) => setNewItemData({...newItemData, imageUrl: e.target.value})}
                                      className="bg-white border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                                    />
                                  </div>
                                  <div className="flex items-center justify-end space-x-3 pt-2 bg-white">
                                    <Button
                                      onClick={() => {
                                        setShowAddSubCategory(null);
                                        setNewItemData({ name: '', description: '', imageUrl: '' });
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleAddNew('subcategory', mainCategory.id, category.id)}
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600 text-white shadow-sm"
                                      disabled={!newItemData.name.trim()}
                                    >
                                      Add Subcategory
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Subcategories */}
                            {expandedSubCategories.has(category.id) && category.sub_category && (
                              <div className="mt-3 ml-8 space-y-2">
                                {category.sub_category.map((subCategory) => (
                                  <div key={subCategory.id} className="flex items-center justify-between border-l-2 border-gray-100 pl-4 py-2">
                                    {editingState?.type === 'subcategory' && editingState.id === subCategory.id ? (
                                      <div className="flex items-center space-x-2">
                                        <div className="space-y-2">
                                          <Input
                                            value={editingValue}
                                            onChange={(e) => setEditingValue(e.target.value)}
                                            className="w-40"
                                            placeholder="Subcategory name"
                                          />
                                          <Input
                                            value={editingDescription}
                                            onChange={(e) => setEditingDescription(e.target.value)}
                                            className="w-40"
                                            placeholder="Description (optional)"
                                          />
                                          <Input
                                            value={editingImageUrl}
                                            onChange={(e) => setEditingImageUrl(e.target.value)}
                                            className="w-40"
                                            placeholder="Image URL (optional)"
                                          />
                                        </div>
                                        <Button onClick={saveEdit} size="sm" className="bg-green-500 hover:bg-green-600">
                                          <Save className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={cancelEditing} size="sm" variant="outline">
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div>
                                        <p className="font-medium text-gray-700">{subCategory.name}</p>
                                        {subCategory.description && (
                                          <p className="text-xs text-gray-500">{subCategory.description}</p>
                                        )}
                                      </div>
                                    )}
                                    
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        onClick={() => startEditing('subcategory', subCategory.id, subCategory.name, subCategory.description, subCategory.image_url, mainCategory.id, category.id)}
                                        size="sm"
                                        variant="outline"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete "{subCategory.name}"? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => handleDelete('subcategory', subCategory.id, mainCategory.id, category.id)}
                                              className="bg-red-500 hover:bg-red-600"
                                            >
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Main Category Modal */}
        <Dialog open={showAddMainCategory} onOpenChange={setShowAddMainCategory}>
          <DialogContent className="sm:max-w-md !bg-white border border-gray-200 shadow-xl rounded-lg p-6 z-[70] opacity-100">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-semibold text-gray-900">Add New Main Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4 bg-white">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Name *</Label>
                <Input
                  id="name"
                  placeholder="Main category name"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                  className="bg-white border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Description (optional)"
                  value={newItemData.description}
                  onChange={(e) => setNewItemData({...newItemData, description: e.target.value})}
                  className="bg-white border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium text-gray-700">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="Image URL (optional)"
                  value={newItemData.imageUrl}
                  onChange={(e) => setNewItemData({...newItemData, imageUrl: e.target.value})}
                  className="bg-white border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100 bg-white">
                <Button
                  onClick={() => {
                    setShowAddMainCategory(false);
                    setNewItemData({ name: '', description: '', imageUrl: '' });
                  }}
                  variant="outline"
                  className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleAddNew('main')}
                  className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                  disabled={!newItemData.name.trim()}
                >
                  Add Main Category
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
