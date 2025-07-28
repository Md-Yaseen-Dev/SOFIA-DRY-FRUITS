"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import SellerLayout from '@/components/seller/SellerLayout';
import { 
  Package, 
  Edit3, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  brand: string;
  description: string;
  imageUrl: string;
  images?: string[];
  inStock: boolean;
  stock_quantity?: number;
  seller_id?: string;
  seller_email?: string;
  created_at: string;
  updated_at: string;
}

export default function SellerProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication and load user
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');

    if (!isAuthenticated || userRole !== 'seller') {
      router.push('/');
      return;
    }

    setCurrentUser({ email: userEmail, role: userRole });
    loadSellerProducts(userEmail || '');
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    // Don't redirect anymore - this page should work
    // router.replace('/seller/products/management');
  }, [router]);

  const loadSellerProducts = (sellerEmail: string) => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const sellerProducts = allProducts.filter((product: Product) => 
        product.seller_email === sellerEmail || product.seller_id === sellerEmail
      );
      setProducts(sellerProducts);
      setFilteredProducts(sellerProducts);
    } catch (error) {
      console.error('Error loading seller products:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filterCategory, products]);

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;

      // Get all products from localStorage
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');

      // Update the specific product
      const updatedAllProducts = allProducts.map((product: any) => 
        product.id === productId 
          ? { 
              ...product, 
              inStock: newStatus,
              outOfStock: !newStatus,
              stock: newStatus ? (product.stock_quantity || 10) : 0,
              status: newStatus ? 'in-stock' : 'out-of-stock',
              visible: newStatus,
              updated_at: new Date().toISOString()
            }
          : product
      );

      // Save back to localStorage
      localStorage.setItem('allProducts', JSON.stringify(updatedAllProducts));

      // Update local state
      const updatedProducts = products.map(product =>
        product.id === productId ? { 
          ...product, 
          inStock: newStatus,
          outOfStock: !newStatus,
          stock: newStatus ? (product.stock_quantity || 10) : 0
        } : product
      );
      setProducts(updatedProducts);
      setFilteredProducts(prev => 
        prev.map(product =>
          product.id === productId ? { 
            ...product, 
            inStock: newStatus,
            outOfStock: !newStatus,
            stock: newStatus ? (product.stock_quantity || 10) : 0
          } : product
        )
      );

      // Trigger products update event
      window.dispatchEvent(new CustomEvent('productsUpdated'));

      // Show success message
      const event = new CustomEvent('showToast', {
        detail: {
          message: `Product ${newStatus ? 'marked as in stock' : 'marked as out of stock'}!`,
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      // Get all products from localStorage
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');

      // Filter out the product to delete
      const updatedProducts = allProducts.filter((product: any) => product.id !== productId);

      // Save back to localStorage
      localStorage.setItem('allProducts', JSON.stringify(updatedProducts));

      // Update local state
      const localUpdatedProducts = products.filter(product => product.id !== productId);
      setProducts(localUpdatedProducts);
      setFilteredProducts(prev => prev.filter(product => product.id !== productId));

      // Trigger products update event
      window.dispatchEvent(new CustomEvent('productsUpdated'));

      // Show success message with solid white background
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Product deleted successfully!',
          type: 'success',
          className: 'bg-white border border-gray-200 text-gray-900 shadow-lg'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const editProduct = (productId: string) => {
    // Navigate to edit form (we'll create this route)
    router.push(`/seller/products/edit/${productId}`);
  };

  const getUniqueCategories = () => {
    const categories = products.map(product => product.category);
    return [...new Set(categories)];
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

  return (
    <SellerLayout currentUser={currentUser}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Products</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <Button 
            onClick={() => router.push('/seller/products/add')}
            className="bg-orange-500 hover:bg-orange-600 text-white mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">
                  {products.filter(p => p.inStock).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">
                  {products.filter(p => !p.inStock).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">
                  {getUniqueCategories().length}
                </p>
              </div>
              <Filter className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Categories</option>
                {getUniqueCategories().map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center bg-white">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {products.length === 0 
                  ? "Start by adding your first product to your catalog."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {products.length === 0 && (
                <Button 
                  onClick={() => router.push('/seller/products/add')}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">₹{Number(product.price).toFixed(2)}</p>
                        {product.originalPrice && Number(product.originalPrice) !== Number(product.price) && (
                          <p className="text-xs text-gray-500 line-through">
                            ₹{Number(product.originalPrice).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="text-gray-900">{product.category}</p>
                        {product.subcategory && (
                          <p className="text-xs text-gray-500">{product.subcategory}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={product.inStock ? "default" : "destructive"}
                        className={product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-gray-500">
                        {new Date(product.updated_at).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editProduct(product.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleProductStatus(product.id, product.inStock)}
                          className={`h-8 w-8 p-0 ${product.inStock ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                        >
                          {product.inStock ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
                            <AlertDialogHeader className="bg-white">
                              <AlertDialogTitle className="bg-white text-gray-900">Delete Product</AlertDialogTitle>
                              <AlertDialogDescription className="bg-white text-gray-600">
                                Are you sure you want to delete "{product.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="bg-white">
                              <AlertDialogCancel className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteProduct(product.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}