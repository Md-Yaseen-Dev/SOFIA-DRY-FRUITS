
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
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
  Filter,
  Shield,
  Ban,
  MoreHorizontal,
  UserCheck,
  Clock,
  AlertTriangle
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
  DropdownMenuSeparator,
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

export default function ProductManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'seller' | 'admin' | 'master_admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeller, setFilterSeller] = useState('all');

  useEffect(() => {
    // Check authentication and determine role
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRoleLS = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const loginStatus = localStorage.getItem('loginStatus');

    const authIsLoggedIn = MockUserAuth.isLoggedIn();
    const authUserRole = MockUserAuth.getCurrentUserRole();
    const authUser = MockUserAuth.getCurrentUser();

    // Determine user role and access level
    let finalRole: 'seller' | 'admin' | 'master_admin' | null = null;
    let user = null;

    if ((isAuthenticated && userRoleLS === 'master_admin' && userEmail === 'abhay@gmail.com') || 
        (authIsLoggedIn && authUserRole === 'master_admin') ||
        MockUserAuth.isMasterAdmin()) {
      finalRole = 'master_admin';
      user = {
        email: userEmail || authUser?.email || 'abhay@gmail.com',
        name: authUser?.name || 'Abhay Kumar',
        role: 'Master Administrator'
      };
    } else if ((isAuthenticated && userRoleLS === 'admin') || 
               (authIsLoggedIn && authUserRole === 'admin')) {
      finalRole = 'admin';
      user = {
        email: userEmail || authUser?.email,
        name: authUser?.name || 'Admin User',
        role: 'Administrator'
      };
    } else if ((isAuthenticated && userRoleLS === 'seller') || 
               (authIsLoggedIn && authUserRole === 'seller') ||
               (loginStatus === 'loggedIn')) {
      finalRole = 'seller';
      user = {
        email: userEmail || authUser?.email,
        name: authUser?.name || 'Seller User',
        role: 'Seller'
      };
    }

    if (!finalRole) {
      router.push('/');
      return;
    }

    setUserRole(finalRole);
    setCurrentUser(user);
    loadProducts(finalRole, user?.email || '');
    setIsLoading(false);
  }, [router]);

  const loadProducts = (role: string, userEmail: string) => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      
      if (role === 'master_admin' || role === 'admin') {
        // Admin can see all products
        setProducts(allProducts);
        setFilteredProducts(allProducts);
      } else {
        // Seller can only see their own products
        const sellerProducts = allProducts.filter((product: Product) => 
          product.seller_email === userEmail || product.seller_id === userEmail
        );
        setProducts(sellerProducts);
        setFilteredProducts(sellerProducts);
      }
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

    if (filterStatus !== 'all') {
      if (filterStatus === 'in-stock') {
        filtered = filtered.filter(product => product.inStock);
      } else if (filterStatus === 'out-of-stock') {
        filtered = filtered.filter(product => !product.inStock);
      } else {
        filtered = filtered.filter(product => (product.status || 'active') === filterStatus);
      }
    }

    if (filterSeller !== 'all' && (userRole === 'admin' || userRole === 'master_admin')) {
      filtered = filtered.filter(product => product.seller_email === filterSeller);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, filterCategory, filterStatus, filterSeller, products, userRole]);

  // Admin actions
  const approveProduct = async (productId: string) => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const updatedProducts = allProducts.map((product: any) => 
        product.id === productId 
          ? { ...product, status: 'approved', updated_at: new Date().toISOString() }
          : product
      );
      
      localStorage.setItem('allProducts', JSON.stringify(updatedProducts));
      loadProducts(userRole!, currentUser.email);

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
      loadProducts(userRole!, currentUser.email);

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
      loadProducts(userRole!, currentUser.email);
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
      loadProducts(userRole!, currentUser.email);
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

  const editProduct = (productId: string) => {
    if (userRole === 'master_admin' || userRole === 'admin') {
      router.push(`/admin/products/edit/${productId}`);
    } else {
      router.push(`/seller/products/edit/${productId}`);
    }
  };

  const createProduct = () => {
    if (userRole === 'master_admin' || userRole === 'admin') {
      router.push('/admin/products/add');
    } else {
      router.push('/seller/products/add');
    }
  };

  const getUniqueCategories = () => {
    const categories = products.map(product => product.category);
    return [...new Set(categories)];
  };

  const getUniqueSellers = () => {
    if (userRole !== 'admin' && userRole !== 'master_admin') return [];
    const sellers = products.map(product => product.seller_email).filter(Boolean);
    return [...new Set(sellers)];
  };

  const getStats = () => {
    if (userRole === 'admin' || userRole === 'master_admin') {
      return {
        total: products.length,
        approved: products.filter(p => (p.status === 'approved' || p.status === 'active') && p.inStock).length,
        pending: products.filter(p => p.status === 'pending').length,
        rejected: products.filter(p => p.status === 'rejected').length,
        inactive: products.filter(p => !p.inStock || p.status === 'inactive').length
      };
    } else {
      return {
        total: products.length,
        inStock: products.filter(p => p.inStock).length,
        outOfStock: products.filter(p => !p.inStock).length,
        categories: getUniqueCategories().length
      };
    }
  };

  const getStatusBadge = (product: Product) => {
    const status = product.status || 'active';
    const isInStock = product.inStock;
    
    if (status === 'pending') {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>;
    } else if (status === 'rejected') {
      return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        <XCircle className="h-3 w-3 mr-1" />
        Rejected
      </Badge>;
    } else if (status === 'approved' || status === 'active') {
      if (isInStock) {
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      } else {
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-200">
          <Ban className="h-3 w-3 mr-1" />
          Out of Stock
        </Badge>;
      }
    }
    
    return <Badge variant="secondary">Unknown</Badge>;
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

  const LayoutComponent = (userRole === 'admin' || userRole === 'master_admin') ? AdminLayout : SellerLayout;

  return (
    <LayoutComponent currentUser={currentUser}>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {(userRole === 'admin' || userRole === 'master_admin') ? 'Product Management' : 'My Products'}
            </h1>
            <p className="text-gray-600">
              {(userRole === 'admin' || userRole === 'master_admin') ? 'Manage all products across the platform' : 'Manage your product catalog'}
            </p>
          </div>
          <Button 
            onClick={createProduct}
            className="bg-orange-500 hover:bg-orange-600 text-white mt-4 sm:mt-0 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {(userRole === 'admin' || userRole === 'master_admin') ? 'Create Product' : 'Add Product'}
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
          
          {(userRole === 'admin' || userRole === 'master_admin') ? (
            <>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">In Stock</p>
                    <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Out of Stock</p>
                    <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Categories</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.categories}</p>
                  </div>
                  <Filter className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </>
          )}
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
                  className="pl-10 w-full"
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
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                {(userRole === 'admin' || userRole === 'master_admin') ? (
                  <>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="inactive">Inactive</option>
                  </>
                ) : (
                  <>
                    <option value="in-stock">In Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </>
                )}
              </select>
            </div>
            {(userRole === 'admin' || userRole === 'master_admin') && (
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
            )}
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
                  ? (userRole === 'admin' || userRole === 'master_admin') 
                    ? "No products available on the platform."
                    : "Start by adding your first product to your catalog."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {products.length === 0 && userRole === 'seller' && (
                <Button 
                  onClick={createProduct}
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
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Product</TableHead>
                  {(userRole === 'admin' || userRole === 'master_admin') && <TableHead className="font-semibold">Seller</TableHead>}
                  <TableHead className="font-semibold">Price</TableHead>
                  <TableHead className="font-semibold">Category</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Updated</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
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
                    {(userRole === 'admin' || userRole === 'master_admin') && (
                      <TableCell>
                        <p className="text-sm text-gray-900">{product.seller_email}</p>
                      </TableCell>
                    )}
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
                      {getStatusBadge(product)}
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
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => router.push(`/product/${product.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => editProduct(product.id)}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Product
                          </DropdownMenuItem>
                          
                          {(userRole === 'admin' || userRole === 'master_admin') && (
                            <>
                              <DropdownMenuSeparator />
                              {product.status === 'pending' && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => approveProduct(product.id)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Product
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => rejectProduct(product.id)}
                                    className="text-red-600"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject Product
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem 
                                onClick={() => toggleProductStatus(product.id, product.inStock)}
                                className={product.inStock ? "text-red-600" : "text-green-600"}
                              >
                                {product.inStock ? (
                                  <>
                                    <Ban className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Shield className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Product
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
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
      </div>
    </LayoutComponent>
  );
}
