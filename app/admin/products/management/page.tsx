
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProductForm from '@/components/admin/AdminProductForm';
import { 
  Package, 
  Edit3, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Shield,
  Ban,
  MoreHorizontal
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  status?: 'active' | 'inactive' | 'pending' | 'rejected' | 'approved';
  created_at: string;
  updated_at: string;
}

export default function AdminProductManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeller, setFilterSeller] = useState('all');

  // Product form state
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

    loadProducts();
    setIsLoading(false);
  }, [router]);

  const loadProducts = () => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setFilteredProducts([]);
    }
  };

  // Filter products based on search, category, status, and seller
  useEffect(() => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    if (filterSeller !== 'all') {
      filtered = filtered.filter(product => 
        product.seller_email === filterSeller
      );
    }

    if (filterStatus !== 'all') {
      if (filterStatus === 'in-stock') {
        filtered = filtered.filter(product => product.inStock);
      } else if (filterStatus === 'out-of-stock') {
        filtered = filtered.filter(product => !product.inStock);
      } else {
        filtered = filtered.filter(product => product.status === filterStatus);
      }
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filterCategory, filterStatus, filterSeller, products]);

  const approveProduct = async (productId: string) => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const updatedProducts = allProducts.map((product: any) => 
        product.id === productId 
          ? { ...product, status: 'approved', updated_at: new Date().toISOString() }
          : product
      );
      
      localStorage.setItem('allProducts', JSON.stringify(updatedProducts));
      loadProducts();
      window.dispatchEvent(new CustomEvent('productsUpdated'));

      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Product approved successfully!',
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error approving product:', error);
    }
  };

  const rejectProduct = async (productId: string) => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const updatedProducts = allProducts.map((product: any) => 
        product.id === productId 
          ? { ...product, status: 'rejected', updated_at: new Date().toISOString() }
          : product
      );
      
      localStorage.setItem('allProducts', JSON.stringify(updatedProducts));
      loadProducts();
      window.dispatchEvent(new CustomEvent('productsUpdated'));

      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Product rejected successfully!',
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error rejecting product:', error);
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const updatedAllProducts = allProducts.map((product: any) => 
        product.id === productId 
          ? { 
              ...product, 
              inStock: newStatus,
              stock: newStatus ? (product.stock || 10) : 0,
              updated_at: new Date().toISOString()
            }
          : product
      );
      
      localStorage.setItem('allProducts', JSON.stringify(updatedAllProducts));
      loadProducts();
      window.dispatchEvent(new CustomEvent('productsUpdated'));

      const event = new CustomEvent('showToast', {
        detail: {
          message: `Product ${newStatus ? 'activated' : 'deactivated'} successfully!`,
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
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const updatedProducts = allProducts.filter((product: any) => product.id !== productId);
      
      localStorage.setItem('allProducts', JSON.stringify(updatedProducts));
      loadProducts();
      window.dispatchEvent(new CustomEvent('productsUpdated'));

      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Product deleted successfully!',
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleProductSaved = () => {
    loadProducts();
  };

  const getUniqueCategories = () => {
    const categories = products.map(product => product.category);
    return [...new Set(categories)];
  };

  const getUniqueSellers = () => {
    const sellers = products.map(product => product.seller_email).filter(Boolean);
    return [...new Set(sellers)];
  };

  const getStats = () => {
    return {
      total: products.length,
      active: products.filter(p => p.status === 'approved' || p.status === 'active' || p.inStock).length,
      pending: products.filter(p => p.status === 'pending').length,
      rejected: products.filter(p => p.status === 'rejected').length,
      inactive: products.filter(p => !p.inStock || p.status === 'inactive').length
    };
  };

  const getStatusBadgeColor = (status?: string, inStock?: boolean) => {
    if (status === 'approved' || status === 'active') return "bg-green-100 text-green-800";
    if (status === 'pending') return "bg-yellow-100 text-yellow-800";
    if (status === 'rejected') return "bg-red-100 text-red-800";
    if (!inStock) return "bg-gray-100 text-gray-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusText = (product: Product) => {
    if (product.status === 'approved' || product.status === 'active') return 'Active';
    if (product.status === 'pending') return 'Pending';
    if (product.status === 'rejected') return 'Rejected';
    if (!product.inStock) return 'Out of Stock';
    return 'Active';
  };

  const stats = getStats();

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
    <AdminLayout currentUser={currentUser}>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Management</h1>
            <p className="text-gray-600">Manage all products across the platform</p>
          </div>
          <Button 
            onClick={openCreateProduct}
            className="bg-orange-500 hover:bg-orange-600 text-white mt-4 sm:mt-0 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products by name, brand, or seller..."
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
            <div className="sm:w-48">
              <select
                value={filterSeller}
                onChange={(e) => setFilterSeller(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Sellers</option>
                {getUniqueSellers().map(seller => (
                  <option key={seller} value={seller}>
                    {seller}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="inactive">Inactive</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
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
                  ? "No products available on the platform."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {products.length === 0 && (
                <Button 
                  onClick={openCreateProduct}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Product
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
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
                      <p className="text-sm text-gray-900">{product.seller_email}</p>
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
                        variant="secondary"
                        className={getStatusBadgeColor(product.status, product.inStock)}
                      >
                        {getStatusText(product)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-gray-500">
                        {new Date(product.updated_at).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                          <DropdownMenuItem
                            onClick={() => router.push(`/product/${product.id}`)}
                            className="flex items-center"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditProduct(product)}
                            className="flex items-center"
                          >
                            <Edit3 className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {product.status === 'pending' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => approveProduct(product.id)}
                                className="flex items-center text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => rejectProduct(product.id)}
                                className="flex items-center text-red-600"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => toggleProductStatus(product.id, product.inStock)}
                            className={`flex items-center ${product.inStock ? 'text-red-600' : 'text-green-600'}`}
                          >
                            {product.inStock ? <Ban className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                            {product.inStock ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="flex items-center text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteProduct(product.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Product Form Modal */}
        <AdminProductForm
          isOpen={isProductFormOpen}
          onClose={() => setIsProductFormOpen(false)}
          product={editingProduct}
          onProductSaved={handleProductSaved}
        />
      </div>
    </AdminLayout>
  );
}
