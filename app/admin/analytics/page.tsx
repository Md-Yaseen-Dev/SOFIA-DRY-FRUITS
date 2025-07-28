"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';

export default function Analytics() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-600">Analytics interface coming soon...</p>
        </div>
      </div>
    </AdminLayout>
  );
}