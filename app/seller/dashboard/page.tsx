"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import { LocalStorageManager } from '@/lib/mock-data';
import SellerLayout from '@/components/seller/SellerLayout';
import { Package, TrendingUp, ShoppingCart, MessageSquare, DollarSign, Plus, BarChart3, MessageCircle } from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  activeOrders: number;
  totalRevenue: number;
  pendingRFQs: number;
  totalRFQs: number;
  respondedRFQs: number;
  recentActivity: Array<{
    id: string;
    type: 'order' | 'payment' | 'inquiry';
    title: string;
    description: string;
    timestamp: string;
    amount?: number;
  }>;
  performance: {
    fulfillmentRate: number;
    averageRating: number;
    responseTime: string;
  };
}

export default function SellerDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    // Check multiple authentication sources
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const loginStatus = localStorage.getItem('loginStatus');

    // Also check MockUserAuth for fallback
    const authIsLoggedIn = MockUserAuth.isLoggedIn();
    const authUserRole = MockUserAuth.getCurrentUserRole();

    // Verify seller access
    const hasSellerAccess = (isAuthenticated && userRole === 'seller') || 
                           (authIsLoggedIn && authUserRole === 'seller') ||
                           (userEmail === 'rohit@gmail.com' && loginStatus === 'active');

    if (!hasSellerAccess) {
      console.log('Seller access denied:', { isAuthenticated, userRole, userEmail, loginStatus });
      router.push('/');
      return;
    }

    const sellerEmail = userEmail || 'rohit@gmail.com';
    const sellerId = `seller_${sellerEmail.replace('@', '_').replace('.', '_')}`;

    // Load seller profile data
    let sellerName = 'Seller'; // Default fallback
    let businessName = '';

    try {
      const sellerProfile = localStorage.getItem(`seller_profile_${sellerId}`);
      if (sellerProfile) {
        const parsedProfile = JSON.parse(sellerProfile);
        sellerName = parsedProfile.sellerName || parsedProfile.businessName || 'Seller';
        businessName = parsedProfile.businessName || '';
      }
    } catch (error) {
      console.error('Error loading seller profile:', error);
    }

    setCurrentUser({
      email: sellerEmail,
      name: sellerName,
      businessName: businessName,
      role: 'Seller',
      id: sellerId
    });
    setIsLoading(false);
  }, [router]);

  // Fetch dashboard data dynamically
  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        setDataLoading(true);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Get seller products
        const allProducts = LocalStorageManager.getAllProducts();
        const sellerProducts = allProducts.filter((product: any) => 
          product.seller_id === currentUser.email || 
          product.seller_email === currentUser.email
        );

        // Get all orders from localStorage
        const allOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
        console.log('All orders:', allOrders);

        // Get seller orders by checking if any order item belongs to this seller
        const sellerOrders = allOrders.filter((order: any) => {
          return order.items.some((item: any) => {
            // Check if item belongs to this seller
            const product = allProducts.find((p: any) => p.id === item.product_id);
            return product && (
              product.seller_id === currentUser.email || 
              product.seller_email === currentUser.email ||
              item.seller_id === currentUser.email ||
              item.seller_email === currentUser.email
            );
          });
        });

        console.log('Seller orders found:', sellerOrders);

        // Calculate active orders (confirmed, shipped, processing - not delivered/cancelled)
        const activeOrders = sellerOrders.filter((order: any) => {
          const status = order.status.toLowerCase();
          return ['confirmed', 'shipped', 'processing', 'packed', 'out_for_delivery'].includes(status);
        });

        // Calculate total revenue from delivered orders only
        const deliveredOrders = sellerOrders.filter((order: any) => 
          order.status.toLowerCase() === 'delivered'
        );

        const totalRevenue = deliveredOrders.reduce((sum: number, order: any) => {
          // Calculate revenue from seller's items only
          const sellerItems = order.items.filter((item: any) => {
            const product = allProducts.find((p: any) => p.id === item.product_id);
            return product && (
              product.seller_id === currentUser.email || 
              product.seller_email === currentUser.email ||
              item.seller_id === currentUser.email ||
              item.seller_email === currentUser.email
            );
          });

          return sum + sellerItems.reduce((itemSum: number, item: any) => 
            itemSum + (item.price * item.quantity), 0
          );
        }, 0);

        // Get RFQs from localStorage
        const allRFQs = JSON.parse(localStorage.getItem('rfqs') || '[]');
        const sellerRFQs = allRFQs.filter((rfq: any) => 
          rfq.targetSellerId === currentUser.email || 
          rfq.targetSellerId === currentUser.id ||
          rfq.targetSellerId === 'rohit@gmail.com'
        );

        const pendingRFQs = sellerRFQs.filter((rfq: any) => rfq.status === 'Pending').length;
        const respondedRFQs = sellerRFQs.filter((rfq: any) => rfq.status === 'Responded').length;
        const totalRFQs = sellerRFQs.length;

        // Generate recent activity
        const recentActivity = generateRecentActivity(sellerOrders, sellerProducts);

        const dashboardStats: DashboardStats = {
          totalProducts: sellerProducts.length,
          activeOrders: activeOrders.length,
          totalRevenue: totalRevenue,
          pendingRFQs: pendingRFQs,
          totalRFQs: totalRFQs,
          respondedRFQs: respondedRFQs,
          recentActivity: recentActivity,
          performance: {
            fulfillmentRate: sellerOrders.length > 0 ? Math.round((deliveredOrders.length / sellerOrders.length) * 100) : 0,
            averageRating: 4.8,
            responseTime: '24h'
          }
        };

        console.log('Dashboard stats:', dashboardStats);
        setDashboardData(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchDashboardData();

    // Listen for data updates
    const handleDataUpdate = () => {
      console.log('Data update event received, refreshing dashboard...');
      fetchDashboardData();
    };

    // Listen for order status updates
    const handleOrderStatusUpdate = () => {
      console.log('Order status update event received, refreshing dashboard...');
      fetchDashboardData();
    };

    window.addEventListener('productsUpdated', handleDataUpdate);
    window.addEventListener('ordersUpdated', handleDataUpdate);
    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdate);
    window.addEventListener('trackingIdUpdated', handleOrderStatusUpdate);

    // Listen for RFQ updates
    const handleRFQUpdate = () => {
      console.log('RFQ update event received, refreshing dashboard...');
      fetchDashboardData();
    };

    window.addEventListener('rfqSubmitted', handleRFQUpdate);
    window.addEventListener('rfqUpdated', handleRFQUpdate);

    // Listen for seller profile updates
    const handleSellerProfileUpdate = (event: CustomEvent) => {
      const { sellerId: updatedSellerId, profile } = event.detail;
      if (updatedSellerId === currentUser?.id && profile) {
        const updatedName = profile.sellerName || profile.businessName || 'Seller';
        setCurrentUser((prev: any) => ({
          ...prev,
          name: updatedName,
          businessName: profile.businessName || '',
          email: profile.email || prev.email
        }));
      }
    };

    const handleSellerProfileSaved = () => {
      // Reload seller profile when saved
      if (currentUser?.id) {
        try {
          const sellerProfile = localStorage.getItem(`seller_profile_${currentUser.id}`);
          if (sellerProfile) {
            const parsedProfile = JSON.parse(sellerProfile);
            const updatedName = parsedProfile.sellerName || parsedProfile.businessName || 'Seller';
            setCurrentUser((prev: any) => ({
              ...prev,
              name: updatedName,
              businessName: parsedProfile.businessName || '',
              email: parsedProfile.email || prev.email
            }));
          }
        } catch (error) {
          console.error('Error reloading seller profile:', error);
        }
      }
    };

    window.addEventListener('productsUpdated', handleDataUpdate);
    window.addEventListener('ordersUpdated', handleDataUpdate);
    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdate);
    window.addEventListener('trackingIdUpdated', handleOrderStatusUpdate);
    window.addEventListener('rfqSubmitted', handleRFQUpdate);
    window.addEventListener('rfqUpdated', handleRFQUpdate);
    window.addEventListener('sellerProfileUpdated' as any, handleSellerProfileUpdate);
    window.addEventListener('sellerProfileSaved', handleSellerProfileSaved);

    return () => {
      window.removeEventListener('productsUpdated', handleDataUpdate);
      window.removeEventListener('ordersUpdated', handleDataUpdate);
      window.removeEventListener('orderStatusUpdated', handleOrderStatusUpdate);
      window.removeEventListener('trackingIdUpdated', handleOrderStatusUpdate);
      window.removeEventListener('rfqSubmitted', handleRFQUpdate);
      window.removeEventListener('rfqUpdated', handleRFQUpdate);
      window.removeEventListener('sellerProfileUpdated' as any, handleSellerProfileUpdate);
      window.removeEventListener('sellerProfileSaved', handleSellerProfileSaved);
    };
  }, [currentUser]);

  const generateRecentActivity = (orders: any[], products: any[]) => {
    const activities = [];

    // Add recent orders (last 3 orders, reverse chronological)
    const recentOrders = orders
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 2);

    recentOrders.forEach(order => {
      // Calculate seller's portion of the order
      const sellerItems = order.items.filter((item: any) => {
        const product = products.find((p: any) => p.id === item.product_id);
        return product && (
          product.seller_id === currentUser.email || 
          product.seller_email === currentUser.email ||
          item.seller_id === currentUser.email ||
          item.seller_email === currentUser.email
        );
      });

      const sellerAmount = sellerItems.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );

      activities.push({
        id: `order-${order.id}`,
        type: 'order' as const,
        title: `Order ${order.status}`,
        description: `Order #${order.id} - ₹${sellerAmount.toFixed(2)}`,
        timestamp: getRelativeTime(order.order_date),
        amount: sellerAmount
      });
    });

    // Add recent RFQs from localStorage
    try {
      const allRFQs = JSON.parse(localStorage.getItem('rfqs') || '[]');
      const sellerRFQs = allRFQs
        .filter((rfq: any) => 
          rfq.targetSellerId === currentUser.email || 
          rfq.targetSellerId === currentUser.id ||
          rfq.targetSellerId === 'rohit@gmail.com'
        )
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 2);

      sellerRFQs.forEach((rfq: any) => {
        activities.push({
          id: `rfq-${rfq.rfqId}`,
          type: 'inquiry' as const,
          title: `RFQ ${rfq.status}`,
          description: `${rfq.productDetails?.productName || 'Product'} - Qty: ${rfq.quantity}`,
          timestamp: getRelativeTime(rfq.timestamp)
        });
      });
    } catch (error) {
      console.error('Error loading RFQs for recent activity:', error);
    }

    // Add mock payment activity if we have less than 3 real activities
    if (activities.length < 3) {
      activities.push({
        id: 'payment-1',
        type: 'payment' as const,
        title: 'Payment received',
        description: '₹1,799 credited to account',
        timestamp: '6 hours ago',
        amount: 1799
      });
    }

    return activities.slice(0, 3);
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  // Navigation handlers
  const handleAddProduct = () => {
    router.push('/seller/products/add');
  };

  const handleViewAnalytics = () => {
    // For now, show a toast. In future, navigate to analytics page
    const event = new CustomEvent('showToast', {
      detail: {
        message: 'Analytics page coming soon!',
        type: 'info'
      }
    });
    window.dispatchEvent(event);
  };

  const handleRespondToRFQs = () => {
    router.push('/seller/rfqs/management');
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

  const stats = dashboardData ? [
    {
      title: "Total Products",
      value: dashboardData.totalProducts.toString(),
      change: dashboardData.totalProducts > 0 ? `${dashboardData.totalProducts} items` : "No products",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Orders",
      value: dashboardData.activeOrders.toString(),
      change: dashboardData.activeOrders > 0 ? `${dashboardData.activeOrders} pending` : "No active orders",
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardData.totalRevenue),
      change: dashboardData.totalRevenue > 0 ? "From delivered orders" : "No revenue yet",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Pending RFQs",
      value: dashboardData.pendingRFQs.toString(),
      change: dashboardData.pendingRFQs > 0 ? "Awaiting response" : "None",
      icon: MessageSquare,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ] : [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-green-500';
      case 'payment':
        return 'bg-orange-500';
      case 'inquiry':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <SellerLayout currentUser={currentUser}>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser?.name}!
          </h1>
          {currentUser?.businessName && (
            <p className="text-lg text-gray-700 mb-1">{currentUser.businessName}</p>
          )}
          <p className="text-gray-600">Here's what's happening with your store today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dataLoading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-xs font-medium ${stat.color} mt-1`}>{stat.change}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleAddProduct}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <div className="flex items-center space-x-3">
                  <Plus className="h-5 w-5 text-orange-600" />
                  <span className="font-medium">Add New Product</span>
                </div>
              </button>
              <button 
                onClick={handleViewAnalytics}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">View Analytics</span>
                </div>
              </button>
              <button 
                onClick={handleRespondToRFQs}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <div className="flex items-center space-x-3">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Respond to RFQs</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {dataLoading ? (
                // Loading skeleton for activity
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-start space-x-3 animate-pulse">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))
              ) : dashboardData?.recentActivity.length ? (
                dashboardData.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 ${getActivityIcon(activity.type)} rounded-full mt-2`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.description}</p>
                      <p className="text-xs text-gray-400">{activity.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dataLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"></div>
                </div>
              ))
            ) : (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {formatPercentage(dashboardData?.performance.fulfillmentRate || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Order Fulfillment Rate</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${dashboardData?.performance.fulfillmentRate || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {dashboardData?.performance.averageRating || 0}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                  <div className="flex justify-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= Math.floor(dashboardData?.performance.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {dashboardData?.performance.responseTime || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Avg. Response Time</div>
                  <div className="text-xs text-green-600 mt-2">Excellent</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}