
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { LocalStorageManager } from '@/lib/mock-data';
import { useCategoryTree } from '@/hooks/use-category-tree';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Product {
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  mainCategory?: string;
  mainCategoryId?: string;
  category?: string;
  categoryId?: string;
  subCategory?: string;
  subCategoryId?: string;
  brand: string;
  description: string;
  imageUrl: string;
  images?: string[];
  inStock: boolean;
  stock_quantity?: number;
  seller_id?: string;
  seller_email?: string;
  status?: 'active' | 'inactive' | 'pending' | 'rejected' | 'approved';
}

interface AdminProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onProductSaved: () => void;
}

interface Category {
  id: string;
  name: string;
  main_category_id: string;
  sub_category?: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  category_id: string;
  main_category_id: string;
}

export default function AdminProductForm({ isOpen, onClose, product, onProductSaved }: AdminProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [sellers, setSellers] = useState<string[]>([]);
  
  // Category data from the same source as seller module
  const { categoryTree, validateCategoryPath } = useCategoryTree();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    mainCategory: '',
    mainCategoryId: '',
    category: '',
    categoryId: '',
    subCategory: '',
    subCategoryId: '',
    brand: '',
    description: '',
    imageUrl: '',
    images: [] as string[],
    inStock: true,
    stock_quantity: '10',
    seller_email: '',
    status: 'active' as const
  });

  const [errors, setErrors] = useState({
    name: '',
    price: '',
    mainCategory: '',
    category: '',
    subCategory: '',
    brand: '',
    seller_email: ''
  });

  // Load sellers when component mounts
  useEffect(() => {
    const loadSellers = () => {
      try {
        const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
        const uniqueSellers = [...new Set(allProducts.map((p: any) => p.seller_email).filter(Boolean))];
        setSellers(uniqueSellers.map(String));
      } catch (error) {
        console.error('Error loading sellers:', error);
      }
    };

    if (isOpen) {
      loadSellers();
    }
  }, [isOpen]);

  // Update categories when category tree changes or main category is selected
  useEffect(() => {
    if (categoryTree.length > 0 && formData.mainCategoryId) {
      const mainCategory = categoryTree.find(mc => mc.id === formData.mainCategoryId);
      if (mainCategory) {
        setCategories(mainCategory.category || []);

        if (formData.categoryId) {
          const category = mainCategory.category?.find(c => c.id === formData.categoryId);
          if (category) {
            setSubCategories(category.sub_category || []);
          }
        } else {
          setSubCategories([]);
        }
      }
    } else {
      setCategories([]);
      setSubCategories([]);
    }
  }, [categoryTree, formData.mainCategoryId, formData.categoryId]);

  // Pre-populate form when editing
  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        originalPrice: product.originalPrice?.toString() || '',
        mainCategory: product.mainCategory || '',
        mainCategoryId: product.mainCategoryId || '',
        category: product.category || '',
        categoryId: product.categoryId || '',
        subCategory: product.subCategory || '',
        subCategoryId: product.subCategoryId || '',
        brand: product.brand || '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        images: product.images || [],
        inStock: product.inStock ?? true,
        stock_quantity: product.stock_quantity?.toString() || '10',
        seller_email: product.seller_email || '',
        status: (product.status as 'active') || 'active'
      });
    } else if (isOpen) {
      // Reset form for new product
      setFormData({
        name: '',
        price: '',
        originalPrice: '',
        mainCategory: '',
        mainCategoryId: '',
        category: '',
        categoryId: '',
        subCategory: '',
        subCategoryId: '',
        brand: '',
        description: '',
        imageUrl: '',
        images: [],
        inStock: true,
        stock_quantity: '10',
        seller_email: '',
        status: 'active'
      });
      setErrors({
        name: '',
        price: '',
        mainCategory: '',
        category: '',
        subCategory: '',
        brand: '',
        seller_email: ''
      });
    }
  }, [product, isOpen]);

  const handleMainCategoryChange = (mainCategoryId: string) => {
    const selectedMainCategory = categoryTree.find(mc => mc.id === mainCategoryId);
    if (selectedMainCategory) {
      setFormData(prev => ({
        ...prev,
        mainCategory: selectedMainCategory.name,
        mainCategoryId: mainCategoryId,
        category: '',
        categoryId: '',
        subCategory: '',
        subCategoryId: ''
      }));
      setCategories(selectedMainCategory.category || []);
      setSubCategories([]);
      setErrors(prev => ({ ...prev, mainCategory: '' }));
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const selectedCategory = categories.find(c => c.id === categoryId);
    if (selectedCategory) {
      setFormData(prev => ({
        ...prev,
        category: selectedCategory.name,
        categoryId: categoryId,
        subCategory: '',
        subCategoryId: ''
      }));
      setSubCategories(selectedCategory.sub_category || []);
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleSubCategoryChange = (subCategoryId: string) => {
    const selectedSubCategory = subCategories.find(sc => sc.id === subCategoryId);
    if (selectedSubCategory) {
      setFormData(prev => ({
        ...prev,
        subCategory: selectedSubCategory.name,
        subCategoryId: subCategoryId
      }));
      setErrors(prev => ({ ...prev, subCategory: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      price: '',
      mainCategory: '',
      category: '',
      subCategory: '',
      brand: '',
      seller_email: ''
    };

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.mainCategoryId) newErrors.mainCategory = 'Main category is required';
    if (!formData.categoryId) newErrors.category = 'Category is required';
    if (!formData.subCategoryId) newErrors.subCategory = 'Subcategory is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.seller_email) newErrors.seller_email = 'Seller assignment is required';

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!validateForm()) {
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Please fill in all required fields correctly',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
      return;
    }

    setIsLoading(true);

    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      
      // Find the selected categories for full category path
      const selectedMainCategory = categoryTree.find(mc => mc.id === formData.mainCategoryId);
      const selectedCategory = categories.find(c => c.id === formData.categoryId);
      const selectedSubCategory = subCategories.find(sc => sc.id === formData.subCategoryId);
      
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        mainCategory: formData.mainCategory,
        mainCategoryId: formData.mainCategoryId,
        category: formData.category,
        categoryId: formData.categoryId,
        subCategory: formData.subCategory,
        subCategoryId: formData.subCategoryId,
        brand: formData.brand,
        description: formData.description,
        imageUrl: formData.imageUrl,
        images: formData.images,
        inStock: formData.inStock,
        stock_quantity: parseInt(formData.stock_quantity) || 10,
        seller_email: formData.seller_email,
        seller_id: formData.seller_email,
        status: formData.status,
        visible: formData.inStock,
        categoryPath: `${selectedMainCategory?.name}/${selectedCategory?.name}/${selectedSubCategory?.name}`,
        hierarchyIds: {
          mainCategoryId: formData.mainCategoryId,
          categoryId: formData.categoryId,
          subCategoryId: formData.subCategoryId
        },
        updated_at: new Date().toISOString()
      };

      if (product?.id) {
        // Update existing product
        const updatedProducts = allProducts.map((p: any) => 
          p.id === product.id ? { ...p, ...productData } : p
        );
        localStorage.setItem('allProducts', JSON.stringify(updatedProducts));
        
        const event = new CustomEvent('showToast', {
          detail: {
            message: 'Product updated successfully!',
            type: 'success'
          }
        });
        window.dispatchEvent(event);
      } else {
        // Create new product
        const newProduct = {
          id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
          ...productData,
          created_at: new Date().toISOString()
        };
        
        const updatedProducts = [...allProducts, newProduct];
        localStorage.setItem('allProducts', JSON.stringify(updatedProducts));
        
        const event = new CustomEvent('showToast', {
          detail: {
            message: 'Product created successfully!',
            type: 'success'
          }
        });
        window.dispatchEvent(event);
      }

      // Trigger products update event
      window.dispatchEvent(new CustomEvent('productsUpdated'));
      
      onProductSaved();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Error saving product. Please try again.',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    } finally {
      setIsLoading(false);
    }
  };

  const addImageUrl = () => {
    if (formData.imageUrl && !formData.images.includes(formData.imageUrl)) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, prev.imageUrl]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="Enter product name"
                  className={`h-11 ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                  required
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="brand" className="text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, brand: e.target.value }));
                    setErrors(prev => ({ ...prev, brand: '' }));
                  }}
                  placeholder="Enter brand name"
                  className={`h-11 ${errors.brand ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                  required
                />
                {errors.brand && <p className="text-sm text-red-500 mt-1">{errors.brand}</p>}
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Category Selection</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="mainCategory" className="text-sm font-medium text-gray-700 mb-2">
                  Main Category *
                </Label>
                <Select value={formData.mainCategoryId} onValueChange={handleMainCategoryChange}>
                  <SelectTrigger className={`h-11 ${errors.mainCategory ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}>
                    <SelectValue placeholder="Select main category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {categoryTree.map(mainCat => (
                      <SelectItem 
                        key={mainCat.id} 
                        value={mainCat.id}
                        className="px-4 py-3 text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer border-none"
                      >
                        {mainCat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mainCategory && <p className="text-sm text-red-500 mt-1">{errors.mainCategory}</p>}
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2">
                  Category *
                </Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={handleCategoryChange}
                  disabled={!formData.mainCategoryId}
                >
                  <SelectTrigger className={`h-11 ${errors.category ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {categories.map(cat => (
                      <SelectItem 
                        key={cat.id} 
                        value={cat.id}
                        className="px-4 py-3 text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer border-none"
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="subCategory" className="text-sm font-medium text-gray-700 mb-2">
                  Subcategory *
                </Label>
                <Select 
                  value={formData.subCategoryId} 
                  onValueChange={handleSubCategoryChange}
                  disabled={!formData.categoryId}
                >
                  <SelectTrigger className={`h-11 ${errors.subCategory ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {subCategories.map(subCat => (
                      <SelectItem 
                        key={subCat.id} 
                        value={subCat.id}
                        className="px-4 py-3 text-sm text-gray-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer border-none"
                      >
                        {subCat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subCategory && <p className="text-sm text-red-500 mt-1">{errors.subCategory}</p>}
              </div>
            </div>
          </div>

          {/* Seller Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Seller Assignment</h3>
            
            <div>
              <Label htmlFor="seller" className="text-sm font-medium text-gray-700 mb-2">
                Assign to Seller *
              </Label>
              <select
                value={formData.seller_email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, seller_email: e.target.value }));
                  setErrors(prev => ({ ...prev, seller_email: '' }));
                }}
                className={`w-full px-3 py-2 h-11 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.seller_email ? 'border-red-500' : 'border-gray-300'}`}
                required
              >
                <option value="">Select Seller</option>
                {sellers.map(seller => (
                  <option key={seller} value={seller}>{seller}</option>
                ))}
              </select>
              {errors.seller_email && <p className="text-sm text-red-500 mt-1">{errors.seller_email}</p>}
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-2">
                  Price *
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, price: e.target.value }));
                    setErrors(prev => ({ ...prev, price: '' }));
                  }}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`h-11 ${errors.price ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200`}
                  required
                />
                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="originalPrice" className="text-sm font-medium text-gray-700 mb-2">
                  Original Price
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <Label htmlFor="stock" className="text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
                  placeholder="10"
                  min="0"
                  className="h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>

          {/* Status & Stock */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2">
                  Product Status
                </Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 h-11 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                  In Stock
                </Label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description..."
              rows={4}
              className="border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Images</h3>
            
            <div className="flex gap-2">
              <Input
                value={formData.imageUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="Enter image URL"
                className="flex-1 h-11 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <Button
                type="button"
                onClick={addImageUrl}
                variant="outline"
                size="sm"
                className="h-11 px-4"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
