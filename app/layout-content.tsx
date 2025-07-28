"use client";

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import SellerLayout from '@/components/seller/SellerLayout';
import AdminLayout from '@/components/admin/AdminLayout';
import { MockUserAuth } from '@/lib/user-auth';
import { Toaster } from '@/components/ui/toaster';

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    // Check user role on mount and when pathname changes
    const role = MockUserAuth.getCurrentUserRole();
    setUserRole(role);

    // Listen for role changes
    const handleStorageChange = () => {
      const newRole = MockUserAuth.getCurrentUserRole();
      setUserRole(newRole);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname]);

  // Don't show header/footer on seller pages or master admin pages
  const isSellerPage = pathname.startsWith('/seller');
  const isMasterAdminPage = pathname.startsWith('/admin') && userRole === 'master_admin';
  const shouldHideHeaderFooter = isSellerPage || isMasterAdminPage;

  return (
    <>
      {!shouldHideHeaderFooter && <Header />}
      <main className={shouldHideHeaderFooter ? '' : ''}>
        {children}
      </main>
      {!shouldHideHeaderFooter && <Footer />}
      {!isMasterAdminPage && <Toaster />}
    </>
  );
}