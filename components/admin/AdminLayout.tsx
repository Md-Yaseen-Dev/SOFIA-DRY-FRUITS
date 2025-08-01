"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Image, 
  BarChart3, 
  MessageSquare, 
  LogOut, 
  Menu,
  X,
  Bell,
  Settings,
  Shield
} from 'lucide-react';
import { MockUserAuth } from '@/lib/user-auth';

interface AdminProfile {
  adminId: string;
  adminName: string;
  email: string;
  phone?: string;
  role: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  currentUser: {
    name: string;
    email: string;
    role: string;
    id?: string;
  };
}

export default function AdminLayout({ children, currentUser }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [displayName, setDisplayName] = useState(currentUser.name);
  const [displayEmail, setDisplayEmail] = useState(currentUser.email);

  // Generate adminId from current user
  const getAdminId = useCallback(() => {
    if (currentUser.id) return currentUser.id;
    const userEmail = localStorage.getItem('userEmail') || currentUser.email;
    return `admin_${userEmail.replace('@', '_').replace('.', '_')}`;
  }, [currentUser.email, currentUser.id]);

  // Load admin profile from localStorage
  const loadAdminProfile = useCallback(() => {
    try {
      const adminId = getAdminId();
      const savedProfile = localStorage.getItem(`admin_profile_${adminId}`);

      if (savedProfile) {
        const parsedProfile: AdminProfile = JSON.parse(savedProfile);
        setAdminProfile(parsedProfile);
        setDisplayName(parsedProfile.adminName || currentUser.name);
        setDisplayEmail(parsedProfile.email || currentUser.email);
      } else {
        // Use current user data as fallback
        setDisplayName(currentUser.name);
        setDisplayEmail(currentUser.email);
      }
    } catch (error) {
      console.error('Error loading admin profile:', error);
      setDisplayName(currentUser.name);
      setDisplayEmail(currentUser.email);
    }
  }, [currentUser.name, currentUser.email, getAdminId]);

  // Listen for profile updates
  useEffect(() => {
    // Initial load
    loadAdminProfile();

    // Listen for storage changes
    const handleStorageChange = (event: StorageEvent) => {
      const adminId = getAdminId();
      if (event.key === `admin_profile_${adminId}` && event.newValue) {
        try {
          const updatedProfile: AdminProfile = JSON.parse(event.newValue);
          setAdminProfile(updatedProfile);
          setDisplayName(updatedProfile.adminName || currentUser.name);
          setDisplayEmail(updatedProfile.email || currentUser.email);
        } catch (error) {
          console.error('Error parsing updated profile:', error);
        }
      }
    };

    // Listen for custom profile update events
    const handleProfileUpdate = (event: CustomEvent) => {
      const { adminId: updatedAdminId, profile } = event.detail;
      const currentAdminId = getAdminId();

      if (updatedAdminId === currentAdminId && profile) {
        setAdminProfile(profile);
        setDisplayName(profile.adminName || currentUser.name);
        setDisplayEmail(profile.email || currentUser.email);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('adminProfileUpdated' as any, handleProfileUpdate);
    window.addEventListener('adminProfileSaved', loadAdminProfile);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminProfileUpdated' as any, handleProfileUpdate);
      window.removeEventListener('adminProfileSaved', loadAdminProfile);
    };
  }, [loadAdminProfile, getAdminId, currentUser.name, currentUser.email]);

  // Verify admin session
  useEffect(() => {
    const verifySession = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      const loginStatus = localStorage.getItem('loginStatus');

      const authIsLoggedIn = MockUserAuth.isLoggedIn();
      const authUserRole = MockUserAuth.getCurrentUserRole();

      const hasMasterAdminAccess = (isAuthenticated && userRole === 'master_admin' && userEmail === 'abhay@gmail.com') || 
                                   (authIsLoggedIn && authUserRole === 'master_admin') ||
                                   MockUserAuth.isMasterAdmin();

      if (!hasMasterAdminAccess) {
        router.push('/');
      }
    };

    const sessionInterval = setInterval(verifySession, 30000);
    return () => clearInterval(sessionInterval);
  }, [router]);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, current: pathname === '/admin/dashboard' },
    { name: 'User Management', href: '/admin/users', icon: Users, current: pathname === '/admin/users' },
    { name: 'Seller Management', href: '/admin/sellers', icon: Store, current: pathname === '/admin/sellers' },
    { name: 'Product Management', href: '/admin/products/management', icon: Package, current: pathname === '/admin/products/management' },
    { name: 'Order Management', href: '/admin/orders/management', icon: ShoppingCart, current: pathname === '/admin/orders/management' },
    { name: 'Category Management', href: '/admin/categories', icon: FolderTree, current: pathname === '/admin/categories' },
    { name: 'Banner Management', href: '/admin/banners', icon: Image, current: pathname === '/admin/banners' },
    { name: 'RFQ Management', href: '/admin/rfqs/management', icon: MessageSquare, current: pathname === '/admin/rfqs/management' },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: pathname === '/admin/analytics' },
  ];

  const handleLogout = () => {
    MockUserAuth.signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sticky Logo */}
          <div className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-slate-900 border-b border-slate-800 flex-shrink-0">
            <div className="flex flex-col pointer-events-none">
              <div className="text-xl font-bold tracking-tight">
                <span className="text-orange-400"></span><span className="text-green-400">SOFIA</span>
              </div>
              <div className="text-xs font-semibold tracking-widest uppercase text-slate-400 flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                ADMIN PORTAL
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-slate-400 hover:text-slate-200 pointer-events-auto"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-6 space-y-1">
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
                      w-full flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200
                      ${item.current 
                        ? 'bg-slate-800 text-white border-l-4 border-orange-500 shadow-lg' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:shadow-md'
                      }
                    `}
                  >
                    <Icon className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${item.current ? 'text-orange-400' : 'text-slate-400'}
                    `} />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sticky Admin Section */}
          <div className="sticky bottom-0 z-40 border-t border-slate-800 p-4 bg-slate-900 flex-shrink-0">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate" title={displayEmail}>
                  {displayName}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  System Administrator
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-slate-300 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4 text-slate-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-300 px-6 py-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 mr-4"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="lg:hidden flex flex-col">
                <div className="text-lg font-bold tracking-tight">
                  <span className="text-orange-500"></span><span className="text-green-600">SOFIA</span>
                </div>
                <div className="text-xs font-medium tracking-widest uppercase text-slate-500 flex items-center">
                  <Shield className="h-3 w-3 mr-1" />
                  ADMIN
                </div>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome, {displayName}
                </h1>
                <p className="text-sm text-gray-600">Administrator Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>

              {/* Admin info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900" title={displayEmail}>
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Logout button for mobile */}
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}