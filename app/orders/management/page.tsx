"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import SellerLayout from '@/components/seller/SellerLayout';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  MapPin,
  User,
  Phone,
  Mail,
  Search,
  Filter,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OrderItem {
  product_id: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  seller_id?: string;
}

interface DeliveryAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface Order {
  id: string;
  user_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  order_date: string;
  delivery_date?: string;
  delivery_address?: DeliveryAddress;
  payment_method?: string;
  tracking_id?: string;
  items: OrderItem[];
  orderedBy?: {
    name: string;
    email: string;
    phone?: string;
  };
}

interface OrderStatus {
  value: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface CurrentUser {
  email: string;
  name: string;
  role: string;
}

const ORDER_STATUSES: OrderStatus[] = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  { value: 'packed', label: 'Packed', icon: Package, color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-orange-100 text-orange-800' },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', icon: AlertCircle, color: 'bg-red-100 text-red-800' },
  { value: 'returned', label: 'Returned', icon: AlertCircle, color: 'bg-gray-100 text-gray-800' }
];

export default function OrderManagementPage(): JSX.Element {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userRole, setUserRole] = useState<'seller' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check authentication and determine role
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRoleLS = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const loginStatus = localStorage.getItem('loginStatus');

    const authIsLoggedIn = MockUserAuth.isLoggedIn();
    const authUserRole = MockUserAuth.getCurrentUserRole();

    // Check for admin access
    const hasAdminAccess = (isAuthenticated && userRoleLS === 'master_admin' && userEmail === 'abhay@gmail.com') || 
                          (authIsLoggedIn && authUserRole === 'master_admin') ||
                          MockUserAuth.isMasterAdmin();

    // Check for seller access
    const hasSellerAccess = (isAuthenticated && userRoleLS === 'seller') || 
                           (authIsLoggedIn && authUserRole === 'seller') ||
                           (userEmail === 'rohit@gmail.com' && loginStatus === 'active');

    if (!hasAdminAccess && !hasSellerAccess) {
      router.push('/');
      return;
    }

    if (hasAdminAccess) {
      setUserRole('admin');
      setCurrentUser({
        email: 'abhay@gmail.com',
        name: 'Abhay Kumar',
        role: 'Master Administrator'
      });
    } else if (hasSellerAccess) {
      setUserRole('seller');
      setCurrentUser({
        email: userEmail || 'rohit@gmail.com',
        name: 'Rohit Kumar',
        role: 'Seller'
      });
    }

    loadOrders(hasAdminAccess ? 'admin' : 'seller', userEmail || 'rohit@gmail.com');
    setIsLoading(false);
  }, [router]);

  const loadOrders = (role: string, userEmail: string): void => {
    try {
      const allOrders: Order[] = JSON.parse(localStorage.getItem('user_orders') || '[]');
      const allProducts: any[] = JSON.parse(localStorage.getItem('allProducts') || '[]');

      let filteredOrders: Order[];
      if (role === 'admin') {
        // Admin sees all orders
        filteredOrders = allOrders;
      } else {
        // Seller sees only orders containing their products
        filteredOrders = allOrders.filter((order: Order) => {
          return order.items.some((item: OrderItem) => {
            const product = allProducts.find((p: any) => p.id === item.product_id);
            return product && (product.seller_email === userEmail || product.seller_id === userEmail);
          });
        }).map((order: Order) => {
          // Filter items to only include seller's products
          const sellerItems = order.items.filter((item: OrderItem) => {
            const product = allProducts.find((p: any) => p.id === item.product_id);
            return product && (product.seller_email === userEmail || product.seller_id === userEmail);
          });
          return { ...order, items: sellerItems };
        });
      }

      setOrders(filteredOrders);
      setFilteredOrders(filteredOrders);

      // Initialize tracking inputs
      const trackingData: Record<string, string> = {};
      filteredOrders.forEach((order: Order) => {
        trackingData[order.id] = order.tracking_id || '';
      });
      setTrackingInputs(trackingData);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderedBy?.name || order.customer_name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.orderedBy?.email || order.customer_email)?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }

    setFilteredOrders(filtered);
  }, [searchTerm, filterStatus, orders]);

  const updateOrderStatus = (orderId: string, newStatus: string): void => {
    try {
      const allOrders: Order[] = JSON.parse(localStorage.getItem('user_orders') || '[]');
      const updatedOrders = allOrders.map((order: Order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: newStatus,
            delivery_date: newStatus === 'delivered' ? new Date().toISOString() : order.delivery_date
          };
        }
        return order;
      });

      localStorage.setItem('user_orders', JSON.stringify(updatedOrders));
      if (userRole && currentUser?.email) {
        loadOrders(userRole, currentUser.email);
      }

      // Trigger real-time update event
      window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
        detail: { orderId, newStatus }
      }));

      const statusLabel = ORDER_STATUSES.find(s => s.value === newStatus)?.label;
      const event = new CustomEvent('showToast', {
        detail: {
          message: `Order status updated to ${statusLabel}!`,
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updateTrackingId = (orderId: string): void => {
    const trackingId = trackingInputs[orderId];
    if (!trackingId?.trim()) {
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Please enter a tracking ID',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
      return;
    }

    try {
      const allOrders: Order[] = JSON.parse(localStorage.getItem('user_orders') || '[]');
      const updatedOrders = allOrders.map((order: Order) => {
        if (order.id === orderId) {
          return { ...order, tracking_id: trackingId.trim() };
        }
        return order;
      });

      localStorage.setItem('user_orders', JSON.stringify(updatedOrders));
      if (userRole && currentUser?.email) {
        loadOrders(userRole, currentUser.email);
      }

      window.dispatchEvent(new CustomEvent('trackingIdUpdated', {
        detail: { orderId, trackingId: trackingId.trim() }
      }));

      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Tracking ID updated successfully!',
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error updating tracking ID:', error);
    }
  };

  const getStatusConfig = (status: string): OrderStatus => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  interface OrderStats {
    total: number;
    pending: number;
    confirmed: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  }

  const getOrderStats = (): OrderStats => {
    const stats: OrderStats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    return stats;
  };

  const stats = getOrderStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  const LayoutComponent = userRole === 'admin' ? AdminLayout : SellerLayout;

  return (
    <LayoutComponent currentUser={currentUser!}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {userRole === 'admin' ? 'Order Management' : 'Order Management'}
            </h1>
            <p className="text-gray-600">
              {userRole === 'admin' ? 'Manage all orders across the platform' : 'Manage and track your customer orders'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Shipped</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.shipped}</p>
                </div>
                <Truck className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search orders by ID, customer name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="sm:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {ORDER_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {orders.length === 0 
                  ? (userRole === 'admin' ? "No orders available on the platform." : "You haven't received any orders yet.")
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <CardDescription>
                          Placed on {formatDate(order.order_date)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <span className="text-lg font-semibold text-gray-900">
                          ₹{order.total_amount.toFixed(2)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/order/${order.id}`)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Customer Details */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Customer Details
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Name:</span> {order.orderedBy?.name || order.customer_name || 'N/A'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Email:</span> {order.orderedBy?.email || order.customer_email || 'N/A'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Phone:</span> {order.orderedBy?.phone || order.customer_phone || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Order Management */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Order Management</h4>

                        {/* Status Update */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Update Status
                          </label>
                          <Select 
                            value={order.status} 
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map(status => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Tracking ID - Only for seller or admin */}
                        {(userRole === 'seller' || userRole === 'admin') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tracking ID
                            </label>
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Enter tracking ID"
                                value={trackingInputs[order.id] || ''}
                                onChange={(e) => setTrackingInputs({
                                  ...trackingInputs,
                                  [order.id]: e.target.value
                                })}
                                className="flex-1"
                              />
                              <Button
                                onClick={() => updateTrackingId(order.id)}
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600"
                              >
                                Save
                              </Button>
                            </div>
                            {order.tracking_id && (
                              <p className="text-xs text-gray-600 mt-1">
                                Current: {order.tracking_id}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-6">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Order Items ({order.items.length})
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              {item.product_image ? (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name || 'Product'}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.product_name || 'Product'}
                              </p>
                              <div className="text-xs text-gray-600 space-y-1">
                                <p>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                                {item.size && <p>Size: {item.size}</p>}
                                {item.color && <p>Color: {item.color}</p>}
                              </div>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              ₹{(item.quantity * item.price).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </LayoutComponent>
  );
}