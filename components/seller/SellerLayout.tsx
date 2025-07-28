"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  User, 
  LogOut, 
  Menu,
  X,
  Bell,
  Settings
} from 'lucide-react';
import { MockUserAuth } from '@/lib/user-auth';

interface SellerProfile {
  sellerId: string;
  sellerName: string;
  businessName: string;
  email: string;
  phone: string;
  gstNumber: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId: string;
  };
  businessLogo?: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SellerLayoutProps {
  children: React.ReactNode;
  currentUser: {
    name: string;
    email: string;
    role: string;
    id?: string;
  };
}

export default function SellerLayout({ children, currentUser }: SellerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [displayEmail, setDisplayEmail] = useState(currentUser.email);

  // Generate sellerId from current user
  const getSellerId = useCallback(() => {
    if (currentUser.id) return currentUser.id;
    const userEmail = localStorage.getItem('userEmail') || currentUser.email;
    return `seller_${userEmail.replace('@', '_').replace('.', '_')}`;
  }, [currentUser.email, currentUser.id]);

  // Load seller profile from localStorage
  const loadSellerProfile = useCallback(() => {
    try {
      const sellerId = getSellerId();
      const savedProfile = localStorage.getItem(`seller_profile_${sellerId}`);

      if (savedProfile) {
        const parsedProfile: SellerProfile = JSON.parse(savedProfile);
        setSellerProfile(parsedProfile);

        // Update display data from profile
        setDisplayName(parsedProfile.sellerName || parsedProfile.businessName || currentUser.name);
        setDisplayEmail(parsedProfile.email || currentUser.email);
      } else {
        // Use current user data as fallback
        setDisplayName(currentUser.name);
        setDisplayEmail(currentUser.email);
      }
    } catch (error) {
      console.error('Error loading seller profile:', error);
      // Fallback to current user data
      setDisplayName(currentUser.name);
      setDisplayEmail(currentUser.email);
    }
  }, [currentUser.name, currentUser.email, getSellerId]);

  // Listen for profile updates
  useEffect(() => {
    // Initial load
    loadSellerProfile();

    // Listen for storage changes (when profile is updated in another component)
    const handleStorageChange = (event: StorageEvent) => {
      const sellerId = getSellerId();
      if (event.key === `seller_profile_${sellerId}` && event.newValue) {
        try {
          const updatedProfile: SellerProfile = JSON.parse(event.newValue);
          setSellerProfile(updatedProfile);
          setDisplayName(updatedProfile.sellerName || updatedProfile.businessName || currentUser.name);
          setDisplayEmail(updatedProfile.email || currentUser.email);
        } catch (error) {
          console.error('Error parsing updated profile:', error);
        }
      }
    };

    // Listen for custom profile update events
    const handleProfileUpdate = (event: CustomEvent) => {
      const { sellerId: updatedSellerId, profile } = event.detail;
      const currentSellerId = getSellerId();

      if (updatedSellerId === currentSellerId && profile) {
        setSellerProfile(profile);
        setDisplayName(profile.sellerName || profile.businessName || currentUser.name);
        setDisplayEmail(profile.email || currentUser.email);
      }
    };

    // Listen for profile saves
    const handleProfileSaved = () => {
      loadSellerProfile();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sellerProfileUpdated' as any, handleProfileUpdate);
    window.addEventListener('sellerProfileSaved', handleProfileSaved);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sellerProfileUpdated' as any, handleProfileUpdate);
      window.removeEventListener('sellerProfileSaved', handleProfileSaved);
    };
  }, [loadSellerProfile, getSellerId, currentUser.name, currentUser.email]);

  // Verify session is still active
  useEffect(() => {
    const verifySession = () => {
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
        // Session expired, redirect to home
        router.push('/');
      }
    };

    // Check session every 30 seconds
    const sessionInterval = setInterval(verifySession, 30000);

    return () => clearInterval(sessionInterval);
  }, [router]);

  const navigation = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: LayoutDashboard, current: pathname === '/seller/dashboard' },
    { name: 'Products', href: '/seller/products/management', icon: Package, current: pathname === '/seller/products/management' },
    { name: 'Orders', href: '/seller/orders/management', icon: ShoppingCart, current: pathname === '/seller/orders/management' },
    { name: 'RFQs', href: '/seller/rfqs/management', icon: MessageSquare, current: pathname === '/seller/rfqs/management' },
    { name: 'Profile', href: '/seller/profile', icon: User, current: pathname === '/seller/profile' },
  ];

  const handleLogout = () => {
    MockUserAuth.signOut();

    // Show logout toast
    const event = new CustomEvent('showToast', {
      detail: {
        message: 'Successfully logged out!',
        type: 'success'
      }
    });
    window.dispatchEvent(event);

    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex flex-col">
              <div className="text-lg font-bold tracking-tight">
                <span className="text-orange-400">Indi</span><span className="text-green-600">Vendi</span>
              </div>
              <div className="text-xs font-medium tracking-widest uppercase text-orange-300">
                SELLER HUB
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                    ${item.current 
                      ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-500' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${item.current ? 'text-orange-600' : 'text-gray-400'}
                  `} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                {sellerProfile?.businessLogo ? (
                  <img
                    src={sellerProfile.businessLogo}
                    alt="Business Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4 text-orange-600" />
                )}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate" title={displayEmail}>
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {sellerProfile?.businessName ? 'Business Owner' : currentUser.role}
                </p>
                {sellerProfile?.businessName && (
                  <p className="text-xs text-gray-400 truncate">
                    {sellerProfile.businessName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="lg:hidden ml-2 flex flex-col">
                <div className="text-lg font-bold tracking-tight">
                  <span className="text-orange-400">Indi</span><span className="text-green-600">Vendi</span>
                </div>
                <div className="text-xs font-medium tracking-widest uppercase text-orange-300">
                  SELLER HUB
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>

              {/* User info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900" title={displayEmail}>
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {sellerProfile?.businessName ? 'Business Owner' : currentUser.role}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                  {sellerProfile?.businessLogo ? (
                    <img
                      src={sellerProfile.businessLogo}
                      alt="Business Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </div>

              {/* Logout button for mobile */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}