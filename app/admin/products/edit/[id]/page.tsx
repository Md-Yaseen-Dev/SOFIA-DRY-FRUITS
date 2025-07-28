
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProductForm from '@/components/admin/AdminProductForm';

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

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

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
      name: 'Abhay Kumar',
      role: 'Master Administrator'
    });

    // Load product data
    if (productId) {
      loadProduct(productId);
    }

    setIsLoading(false);
  }, [router, productId]);

  const loadProduct = (id: string) => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const foundProduct = allProducts.find((p: Product) => p.id === id);
      
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        const event = new CustomEvent('showToast', {
          detail: {
            message: 'Product not found',
            type: 'error'
          }
        });
        window.dispatchEvent(event);
        router.push('/admin/products/management');
      }
    } catch (error) {
      console.error('Error loading product:', error);
      router.push('/admin/products/management');
    }
  };

  const handleProductSaved = () => {
    router.push('/admin/products/management');
  };

  const handleClose = () => {
    router.push('/admin/products/management');
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
    <AdminLayout currentUser={currentUser}>
      <AdminProductForm
        isOpen={true}
        onClose={handleClose}
        product={product}
        onProductSaved={handleProductSaved}
      />
    </AdminLayout>
  );
}
