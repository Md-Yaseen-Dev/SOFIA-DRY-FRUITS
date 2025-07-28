
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { Users, Store, Package, ShoppingCart, TrendingUp, AlertTriangle, Activity, DollarSign } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalProducts: number;
  activeOrders: number;
  totalOrders: number;
  pendingRFQs: number;
  totalRFQs: number;
  totalRevenue: number;
  userGrowth: number;
  sellerGrowth: number;
  productGrowth: number;
  orderGrowth: number;
}

interface RecentActivity {
  id: string;
  type: 'user' | 'seller' | 'order' | 'product' | 'rfq';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    // Check master admin authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');

    const authIsLoggedIn = MockUserAuth.isLoggedIn();
    const authUserRole = MockUserAuth.getCurrentUserRole();

    // Verify master admin access - only abhay@gmail.com with master_admin role
    const hasMasterAdminAccess = (isAuthenticated && userRole === 'master_admin' && userEmail === 'abhay@gmail.com') || 
                                 (authIsLoggedIn && authUserRole === 'master_admin') ||
                                 MockUserAuth.isMasterAdmin();

    if (!hasMasterAdminAccess) {
      console.log('Master admin access denied');
      router.push('/');
      return;
    }

    setCurrentUser({
      email: 'abhay@gmail.com',
      name: 'Abhay Huilgol',
      role: 'Master Administrator',
      id: 'master_admin_abhay'
    });
    setIsLoading(false);
  }, [router]);

  // Fetch all dashboard data dynamically
  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        setDataLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading

        // Fetch Users Data - get from MockUserAuth for consistency
        const allUsers = MockUserAuth.getUsers() || [];

        // Get sellers data from localStorage
        const sellersData = JSON.parse(localStorage.getItem('indivendi_sellers') || '[]');

        // Filter regular users (exclude master admin and sellers)
        const users = allUsers.filter((user: any) => {
          // Exclude master admin
          if (user.email === 'abhay@gmail.com') return false;

          // Check if user is a seller
          const isSeller = sellersData.some((seller: any) => seller.email === user.email);
          if (isSeller) return false;

          return true;
        });

        // Count sellers from sellers data
        const sellers = sellersData;

        // Fetch Products Data
        const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');

        // Fetch Orders Data
        const allOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
        const activeOrders = allOrders.filter((order: any) => {
          const status = order.status?.toLowerCase();
          return ['confirmed', 'shipped', 'processing', 'packed', 'out_for_delivery'].includes(status);
        });

        // Calculate total revenue from delivered orders
        const deliveredOrders = allOrders.filter((order: any) => 
          order.status?.toLowerCase() === 'delivered'
        );
        const totalRevenue = deliveredOrders.reduce((sum: number, order: any) => sum + (order.total_amount || 0), 0);

        // Fetch RFQs Data
        const allRFQs = JSON.parse(localStorage.getItem('allRFQs') || '[]');
        const pendingRFQs = allRFQs.filter((rfq: any) => rfq.status === 'pending' || rfq.status === 'open');

        // Calculate growth percentages (mock calculation based on recent activity)
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const recentUsers = users.filter((user: any) => {
          const createdAt = new Date(user.created_at || user.createdAt || now);
          return createdAt >= lastMonth;
        });

        const recentSellers = sellers.filter((seller: any) => {
          const createdAt = new Date(seller.created_at || seller.createdAt || now);
          return createdAt >= lastMonth;
        });

        const recentProducts = allProducts.filter((product: any) => {
          const createdAt = new Date(product.created_at || product.createdAt || now);
          return createdAt >= lastMonth;
        });

        const recentOrders = allOrders.filter((order: any) => {
          const orderDate = new Date(order.order_date || order.created_at || now);
          return orderDate >= lastMonth;
        });

        // Calculate growth percentages
        const userGrowth = users.length > 0 ? Math.round((recentUsers.length / users.length) * 100) : 0;
        const sellerGrowth = sellers.length > 0 ? Math.round((recentSellers.length / sellers.length) * 100) : 0;
        const productGrowth = allProducts.length > 0 ? Math.round((recentProducts.length / allProducts.length) * 100) : 0;
        const orderGrowth = allOrders.length > 0 ? Math.round((recentOrders.length / allOrders.length) * 100) : 0;

        const dashboardStats: DashboardStats = {
          totalUsers: users.length,
          totalSellers: sellers.length,
          totalProducts: allProducts.length,
          activeOrders: activeOrders.length,
          totalOrders: allOrders.length,
          pendingRFQs: pendingRFQs.length,
          totalRFQs: allRFQs.length,
          totalRevenue: totalRevenue,
          userGrowth: userGrowth,
          sellerGrowth: sellerGrowth,
          productGrowth: productGrowth,
          orderGrowth: orderGrowth
        };

        // Generate recent activity
        const activity: RecentActivity[] = [];

        // Add recent user registrations
        recentUsers.slice(0, 2).forEach((user: any, index: number) => {
          activity.push({
            id: `user_${index}`,
            type: 'user',
            title: 'New user registration',
            description: `${user.email || user.name || 'New user'} registered`,
            timestamp: getRelativeTime(new Date(user.created_at || user.createdAt || now)),
            icon: 'bg-green-500'
          });
        });

        // Add recent seller verifications
        recentSellers.slice(0, 1).forEach((seller: any, index: number) => {
          activity.push({
            id: `seller_${index}`,
            type: 'seller',
            title: 'New seller registration',
            description: `${seller.businessName || seller.email || 'New seller'} registered`,
            timestamp: getRelativeTime(new Date(seller.created_at || seller.createdAt || now)),
            icon: 'bg-blue-500'
          });
        });

        // Add recent high-value orders
        const highValueOrders = recentOrders
          .filter((order: any) => order.total_amount > 5000)
          .slice(0, 2);

        highValueOrders.forEach((order: any, index: number) => {
          activity.push({
            id: `order_${index}`,
            type: 'order',
            title: 'High-value order placed',
            description: `Order #${order.id?.toString().slice(0, 8) || 'unknown'} - ₹${order.total_amount.toLocaleString()}`,
            timestamp: getRelativeTime(new Date(order.order_date || order.created_at || now)),
            icon: 'bg-orange-500'
          });
        });

        // Add recent product additions
        recentProducts.slice(0, 1).forEach((product: any, index: number) => {
          activity.push({
            id: `product_${index}`,
            type: 'product',
            title: 'New product listed',
            description: `${product.name || 'New product'} added`,
            timestamp: getRelativeTime(new Date(product.created_at || product.createdAt || now)),
            icon: 'bg-purple-500'
          });
        });

        // Sort activity by most recent
        activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setDashboardData(dashboardStats);
        setRecentActivity(activity.slice(0, 6)); // Show only 6 most recent activities
        setLastRefresh(new Date());

        console.log('Dashboard data fetched:', dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set fallback data
        setDashboardData({
          totalUsers: 0,
          totalSellers: 0,
          totalProducts: 0,
          activeOrders: 0,
          totalOrders: 0,
          pendingRFQs: 0,
          totalRFQs: 0,
          totalRevenue: 0,
          userGrowth: 0,
          sellerGrowth: 0,
          productGrowth: 0,
          orderGrowth: 0
        });
        setRecentActivity([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();

    // Set up periodic refresh for real-time updates
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds

    // Cleanup listeners
    return () => {
      clearInterval(refreshInterval);
    };
  }, [currentUser]);

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatGrowth = (growth: number): string => {
    return growth > 0 ? `+${growth}%` : `${growth}%`;
  };

  const getGrowthColor = (growth: number): string => {
    return growth > 0 ? 'text-green-600' : growth < 0 ? 'text-red-600' : 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData ? [
    {
      title: "Total Users",
      value: dashboardData.totalUsers.toLocaleString(),
      change: `${formatGrowth(dashboardData.userGrowth)} from last month`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      growthColor: getGrowthColor(dashboardData.userGrowth)
    },
    {
      title: "Active Sellers",
      value: dashboardData.totalSellers.toLocaleString(),
      change: `${formatGrowth(dashboardData.sellerGrowth)} from last month`,
      icon: Store,
      color: "text-green-600",
      bgColor: "bg-green-50",
      growthColor: getGrowthColor(dashboardData.sellerGrowth)
    },
    {
      title: "Total Products",
      value: dashboardData.totalProducts.toLocaleString(),
      change: `${formatGrowth(dashboardData.productGrowth)} from last month`,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      growthColor: getGrowthColor(dashboardData.productGrowth)
    },
    {
      title: "Active Orders",
      value: dashboardData.activeOrders.toLocaleString(),
      change: `${formatGrowth(dashboardData.orderGrowth)} from last month`,
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      growthColor: getGrowthColor(dashboardData.orderGrowth)
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardData.totalRevenue),
      change: `From ${dashboardData.totalOrders} total orders`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      growthColor: "text-emerald-600"
    },
    {
      title: "Pending RFQs",
      value: dashboardData.pendingRFQs.toLocaleString(),
      change: `${dashboardData.totalRFQs} total RFQs`,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      growthColor: "text-amber-600"
    }
  ] : [];

  const quickActions = [
    { name: 'Add New Category', href: '/admin/categories' },
    { name: 'Review Seller Applications', href: '/admin/sellers' },
    { name: 'Manage Products', href: '/admin/products/management' },
    { name: 'View Order Management', href: '/admin/orders/management' },
    { name: 'Manage RFQs', href: '/admin/rfqs/management' },
    { name: 'View Analytics Report', href: '/admin/analytics' }
  ];

  return (
    <AdminLayout currentUser={currentUser}>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor and manage your marketplace operations • Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dataLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm font-medium ${stat.growthColor} mt-1`}>{stat.change}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-4 rounded-xl`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button 
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <span className="font-medium text-gray-900">{action.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {dataLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-48 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${activity.icon} rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* System Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">99.9%</div>
              <div className="text-sm text-gray-600">System Uptime</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full w-full"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {dashboardData ? (dashboardData.totalOrders * 12).toLocaleString() : '0'}
              </div>
              <div className="text-sm text-gray-600">API Requests Today</div>
              <div className="text-xs text-green-600 mt-2">Normal Traffic</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {dashboardData ? formatCurrency(dashboardData.totalRevenue) : '₹0'}
              </div>
              <div className="text-sm text-gray-600">Total GMV</div>
              <div className="text-xs text-green-600 mt-2">
                {dashboardData && dashboardData.orderGrowth > 0 ? `+${dashboardData.orderGrowth}% growth` : 'Stable'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
