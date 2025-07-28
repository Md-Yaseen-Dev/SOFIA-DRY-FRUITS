
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import SellerLayout from '@/components/seller/SellerLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocalStorageManager, MainCategory, Category, SubCategory } from '@/lib/mock-data';
import { useCategoryTree } from '@/hooks/use-category-tree';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  mainCategory?: string;
  mainCategoryId?: string;
  category?: string;
  categoryId?: string;
  subCategory?: string;
  subCategoryId?: string;
  brand: string;
  imageUrl: string;
  images?: string[];
  inStock: boolean;
  stock_quantity?: number;
  seller_id?: string;
  seller_email?: string;
  created_at: string;
  updated_at: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [product, setProduct] = useState<Product | null>(null);

  // Display values for inputs (empty string when 0)
  const [priceDisplay, setPriceDisplay] = useState('');
  const [originalPriceDisplay, setOriginalPriceDisplay] = useState('');
  const [stockDisplay, setStockDisplay] = useState('');

  // Category data
  const { categoryTree, validateCategoryPath } = useCategoryTree();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  const [formData, setFormData] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    mainCategory: '',
    mainCategoryId: '',
    category: '',
    categoryId: '',
    subCategory: '',
    subCategoryId: '',
    brand: '',
    imageUrl: '',
    images: [],
    inStock: true,
    stock_quantity: 0,
    seller_id: '',
    seller_email: '',
    created_at: '',
    updated_at: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const loginStatus = localStorage.getItem('loginStatus');

    const authIsLoggedIn = MockUserAuth.isLoggedIn();
    const authUserRole = MockUserAuth.getCurrentUserRole();

    const hasSellerAccess = (isAuthenticated && userRole === 'seller') || 
                           (authIsLoggedIn && authUserRole === 'seller') ||
                           (userEmail === 'rohit@gmail.com' && loginStatus === 'active');

    if (!hasSellerAccess) {
      router.push('/');
      return;
    }

    setCurrentUser({
      email: userEmail || 'rohit@gmail.com',
      name: 'Rohit Kumar',
      role: 'Seller'
    });

    // Load categories and product data
    loadProduct(productId, userEmail || 'rohit@gmail.com');
  }, [router, productId]);

  const loadProduct = (id: string, sellerEmail: string) => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const foundProduct = allProducts.find((p: Product) => 
        p.id === id && (p.seller_email === sellerEmail || p.seller_id === sellerEmail)
      );

      if (!foundProduct) {
        router.push('/seller/products');
        return;
      }

      setProduct(foundProduct);
      setFormData(foundProduct);
      setImagePreview(foundProduct.imageUrl);

      // Set display values
      setPriceDisplay(foundProduct.price > 0 ? foundProduct.price.toString() : '');
      setOriginalPriceDisplay(foundProduct.originalPrice && foundProduct.originalPrice > 0 ? foundProduct.originalPrice.toString() : '');
      setStockDisplay(foundProduct.stock_quantity && foundProduct.stock_quantity > 0 ? foundProduct.stock_quantity.toString() : '');

      // Load categories based on existing product data
      if (foundProduct.mainCategoryId) {
        const mainCategory = categoryTree.find(mc => mc.id === foundProduct.mainCategoryId);
        if (mainCategory) {
          setCategories(mainCategory.category || []);

          if (foundProduct.categoryId) {
            const category = mainCategory.category?.find(c => c.id === foundProduct.categoryId);
            if (category) {
              setSubCategories(category.sub_category || []);
            }
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading product:', error);
      router.push('/seller/products');
    }
  };

  // Update categories when main categories are loaded and we have product data
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
        }
      }
    }
  }, [categoryTree, formData.mainCategoryId, formData.categoryId]);

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
    }
  };

  // Numeric input handlers
  const handleNumericInput = (value: string, type: 'price' | 'originalPrice' | 'stock') => {
    // Allow only numbers and one decimal point for price, only integers for stock
    const isPrice = type === 'price' || type === 'originalPrice';
    const regex = isPrice ? /^\d*\.?\d*$/ : /^\d*$/;

    if (value === '' || regex.test(value)) {
      if (type === 'price') {
        setPriceDisplay(value);
        setFormData(prev => ({ ...prev, price: value === '' ? 0 : parseFloat(value) || 0 }));
      } else if (type === 'originalPrice') {
        setOriginalPriceDisplay(value);
        setFormData(prev => ({ ...prev, originalPrice: value === '' ? 0 : parseFloat(value) || 0 }));
      } else if (type === 'stock') {
        setStockDisplay(value);
        setFormData(prev => ({ ...prev, stock_quantity: value === '' ? 0 : parseInt(value) || 0 }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.mainCategoryId) newErrors.mainCategory = 'Main category is required';
    if (!formData.categoryId) newErrors.category = 'Category is required';
    if (!formData.subCategoryId) newErrors.subCategory = 'Sub category is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.imageUrl.trim()) newErrors.imageUrl = 'Main image URL is required';
    if ((formData.stock_quantity || 0) < 0) newErrors.stock_quantity = 'Stock quantity cannot be negative';

    // Strict hierarchy validation
    if (formData.mainCategoryId) {
      const selectedMainCategory = categoryTree.find(mc => mc.id === formData.mainCategoryId);
      if (!selectedMainCategory) {
        newErrors.mainCategory = 'Selected main category is invalid';
      } else {
        // Validate category exists in selected main category
        if (formData.categoryId) {
          const selectedCategory = selectedMainCategory.category?.find(c => c.id === formData.categoryId);
          if (!selectedCategory) {
            newErrors.category = 'Selected category does not belong to the chosen main category';
          } else {
            // Validate sub-category exists in selected category
            if (formData.subCategoryId) {
              const selectedSubCategory = selectedCategory.sub_category?.find(sc => sc.id === formData.subCategoryId);
              if (!selectedSubCategory) {
                newErrors.subCategory = 'Selected sub-category does not belong to the chosen category';
              }
            }
          }
        }
      }
    }

    // Additional validation using the category tree hook
    if (formData.mainCategoryId && formData.categoryId && formData.subCategoryId) {
      const isValidPath = validateCategoryPath(formData.mainCategoryId, formData.categoryId, formData.subCategoryId);
      if (!isValidPath) {
        newErrors.category = 'Invalid category hierarchy. Please reselect your categories.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      // Get the complete hierarchy information from categoryTree
      const selectedMainCategory = categoryTree.find(mc => mc.id === formData.mainCategoryId);
      const selectedCategory = selectedMainCategory?.category?.find(c => c.id === formData.categoryId);
      const selectedSubCategory = selectedCategory?.sub_category?.find(sc => sc.id === formData.subCategoryId);

      const updates = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        originalPrice: formData.originalPrice,
        // Complete hierarchy with names and IDs
        mainCategory: selectedMainCategory?.name || formData.mainCategory,
        mainCategoryId: formData.mainCategoryId,
        category: selectedCategory?.name || formData.category,
        categoryId: formData.categoryId,
        subCategory: selectedSubCategory?.name || formData.subCategory,
        subCategoryId: formData.subCategoryId,
        // Additional category information for compatibility
        main_category: selectedMainCategory?.name || formData.mainCategory,
        main_category_id: formData.mainCategoryId,
        category_name: selectedCategory?.name || formData.category,
        category_id: formData.categoryId,
        sub_category: selectedSubCategory?.name || formData.subCategory,
        sub_category_id: formData.subCategoryId,
        brand: formData.brand,
        imageUrl: formData.imageUrl,
        image: formData.imageUrl, // For compatibility
        image_url: formData.imageUrl, // For API compatibility
        images: formData.images,
        inStock: formData.inStock,
        stock_quantity: formData.stock_quantity,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        on_offer: (formData.originalPrice || 0) > formData.price,
        status: formData.inStock ? 'in-stock' : 'out-of-stock',
        visible: formData.inStock, // Auto-hide if out of stock
        // Full category path for easy filtering and navigation
        categoryPath: `${selectedMainCategory?.name}/${selectedCategory?.name}/${selectedSubCategory?.name}`,
        hierarchyIds: {
          mainCategoryId: formData.mainCategoryId,
          categoryId: formData.categoryId,
          subCategoryId: formData.subCategoryId
        },
        updated_at: new Date().toISOString()
      };

      // Use unified product management
      LocalStorageManager.updateProduct(productId, {
        ...updates,
        originalPrice: updates.originalPrice?.toString()
      });

      // Show success message
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Product updated successfully!',
          type: 'success'
        }
      });
      window.dispatchEvent(event);

      // Redirect to products list
      router.push('/seller/products');
    } catch (error) {
      console.error('Error updating product:', error);
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Error updating product. Please try again.',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Product not found</p>
          <Button onClick={() => router.push('/seller/products')} className="mt-4">
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SellerLayout currentUser={currentUser}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update your product information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Enter brand name"
                  className={errors.brand ? 'border-red-500' : ''}
                />
                {errors.brand && <p className="text-sm text-red-500 mt-1">{errors.brand}</p>}
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your product..."
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Structure</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="mainCategory">Main Category *</Label>
                <Select value={formData.mainCategoryId || ''} onValueChange={handleMainCategoryChange}>
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
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={formData.categoryId || ''} 
                  onValueChange={handleCategoryChange}
                  disabled={!formData.mainCategoryId}
                >
                  <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="subCategory">Sub-Category *</Label>
                <Select 
                  value={formData.subCategoryId || ''} 
                  onValueChange={handleSubCategoryChange}
                  disabled={!formData.categoryId}
                >
                  <SelectTrigger className={`h-11 ${errors.subCategory ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}>
                    <SelectValue placeholder="Select sub-category" />
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

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Stock</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Sale Price (₹) *</Label>
                <Input
                  id="price"
                  type="text"
                  value={priceDisplay}
                  onChange={(e) => handleNumericInput(e.target.value, 'price')}
                  placeholder="Enter price"
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="originalPrice">Original Price (₹)</Label>
                <Input
                  id="originalPrice"
                  type="text"
                  value={originalPriceDisplay}
                  onChange={(e) => handleNumericInput(e.target.value, 'originalPrice')}
                  placeholder="Enter original price"
                />
              </div>

              <div>
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="text"
                  value={stockDisplay}
                  onChange={(e) => handleNumericInput(e.target.value, 'stock')}
                  placeholder="Enter stock quantity"
                  className={errors.stock_quantity ? 'border-red-500' : ''}
                />
                {errors.stock_quantity && <p className="text-sm text-red-500 mt-1">{errors.stock_quantity}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>

            <div>
              <Label htmlFor="imageUrl">Main Image URL *</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className={errors.imageUrl ? 'border-red-500' : ''}
              />
              {errors.imageUrl && <p className="text-sm text-red-500 mt-1">{errors.imageUrl}</p>}

              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    onError={() => setImagePreview('')}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Status</h2>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inStock"
                  checked={formData.inStock}
                  onChange={() => setFormData(prev => ({ ...prev, inStock: true }))}
                  className="mr-2"
                />
                In Stock
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="inStock"
                  checked={!formData.inStock}
                  onChange={() => setFormData(prev => ({ ...prev, inStock: false }))}
                  className="mr-2"
                />
                Out of Stock
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Updating...' : 'Update Product'}
            </Button>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}
