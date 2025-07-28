
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  ShoppingCart, 
  Eye,
  CheckCircle,
  XCircle,
  Package,
  Calendar,
  DollarSign,
  Truck,
  Search,
  Filter,
  Download,
  Clock,
  AlertCircle,
  User,
  Store,
  CreditCard,
  FileText,
  BarChart3,
  RefreshCw,
  Mail,
  Phone
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderItem {
  product_id: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  seller_id?: string;
  seller_name?: string;
  seller_email?: string;
}

interface Order {
  id: string;
  user_id: string;
  user_email?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  order_date: string;
  delivery_date?: string;
  payment_method?: string;
  payment_status?: string;
  tracking_id?: string;
  delivery_address?: any;
  orderedBy?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: any;
  };
  items: OrderItem[];
  sellers?: string[];
  seller_breakdown?: Record<string, {
    seller_name: string;
    seller_email: string;
    items: OrderItem[];
    subtotal: number;
  }>;
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', icon: Package, color: 'bg-purple-100 text-purple-800' },
  { value: 'packed', label: 'Packed', icon: Package, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'shipped', label: 'Shipped', icon: Truck, color: 'bg-orange-100 text-orange-800' },
  { value: 'out_for_delivery', label: 'Out for Delivery', icon: Truck, color: 'bg-cyan-100 text-cyan-800' },
  { value: 'delivered', label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
  { value: 'returned', label: 'Returned', icon: AlertCircle, color: 'bg-gray-100 text-gray-800' }
];

const PAYMENT_METHODS = ['cod', 'card', 'upi', 'netbanking', 'wallet'];

export default function AdminOrderManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeller, setFilterSeller] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sellers, setSellers] = useState<string[]>([]);
  const [sellerDetails, setSellerDetails] = useState<Record<string, any>>({});

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

    loadOrders();
    loadSellers();
    setIsLoading(false);
  }, [router]);

  const loadOrders = () => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      
      // Enhance orders with seller information
      const enhancedOrders = allOrders.map((order: Order) => {
        const sellerBreakdown: Record<string, any> = {};
        const orderSellers: string[] = [];

        order.items.forEach(item => {
          const product = allProducts.find((p: any) => p.id === item.product_id);
          if (product) {
            const sellerEmail = product.seller_email || product.seller_id || 'Unknown';
            const sellerName = product.seller_name || sellerEmail;
            
            item.seller_email = sellerEmail;
            item.seller_name = sellerName;
            item.seller_id = sellerEmail;

            if (!sellerBreakdown[sellerEmail]) {
              sellerBreakdown[sellerEmail] = {
                seller_name: sellerName,
                seller_email: sellerEmail,
                items: [],
                subtotal: 0
              };
              orderSellers.push(sellerEmail);
            }

            sellerBreakdown[sellerEmail].items.push(item);
            sellerBreakdown[sellerEmail].subtotal += item.quantity * item.price;
          }
        });

        return {
          ...order,
          sellers: orderSellers,
          seller_breakdown: sellerBreakdown
        };
      });

      setOrders(enhancedOrders);
      setFilteredOrders(enhancedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
      setFilteredOrders([]);
    }
  };

  const loadSellers = () => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const uniqueSellers = [...new Set(allProducts.map((p: any) => p.seller_email || p.seller_id).filter(Boolean))] as string[];
      setSellers(uniqueSellers);

      // Create seller details mapping
      const sellerDetailsMap: Record<string, any> = {};
      allProducts.forEach((product: any) => {
        const sellerEmail = product.seller_email || product.seller_id;
        if (sellerEmail && !sellerDetailsMap[sellerEmail]) {
          sellerDetailsMap[sellerEmail] = {
            name: product.seller_name || sellerEmail,
            email: sellerEmail,
            products_count: 0
          };
        }
        if (sellerEmail) {
          sellerDetailsMap[sellerEmail].products_count++;
        }
      });
      setSellerDetails(sellerDetailsMap);
    } catch (error) {
      console.error('Error loading sellers:', error);
      setSellers([]);
    }
  };

  // Filter orders based on search and filters
  useEffect(() => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_name || order.orderedBy?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer_email || order.orderedBy?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
          (item.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.seller_name || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());
    }

    if (filterSeller !== 'all') {
      filtered = filtered.filter(order => 
        order.items.some(item => item.seller_email === filterSeller)
      );
    }

    if (filterPaymentMethod !== 'all') {
      filtered = filtered.filter(order => order.payment_method === filterPaymentMethod);
    }

    if (dateFrom) {
      filtered = filtered.filter(order => {
        // Format the selected date from yyyy-mm-dd to dd/mm/yyyy
        const selectedDate = new Date(dateFrom).toLocaleDateString('en-GB');
        // Format the order date to dd/mm/yyyy
        const orderDate = new Date(order.order_date).toLocaleDateString('en-GB');
        return orderDate >= selectedDate;
      });
    }

    if (dateTo) {
      filtered = filtered.filter(order => {
        // Format the selected date from yyyy-mm-dd to dd/mm/yyyy
        const selectedDate = new Date(dateTo).toLocaleDateString('en-GB');
        // Format the order date to dd/mm/yyyy
        const orderDate = new Date(order.order_date).toLocaleDateString('en-GB');
        return orderDate <= selectedDate;
      });
    }

    setFilteredOrders(filtered);
  }, [searchTerm, filterStatus, filterSeller, filterPaymentMethod, dateFrom, dateTo, orders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const allOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
      const updatedOrders = allOrders.map((order: any) => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus, 
              updated_at: new Date().toISOString(),
              delivery_date: newStatus === 'delivered' ? new Date().toISOString() : order.delivery_date
            }
          : order
      );
      
      localStorage.setItem('user_orders', JSON.stringify(updatedOrders));
      loadOrders();

      // Dispatch real-time update event
      window.dispatchEvent(new CustomEvent('orderStatusUpdated', {
        detail: { orderId, newStatus }
      }));

      const event = new CustomEvent('showToast', {
        detail: {
          message: `Order status updated to ${ORDER_STATUSES.find(s => s.value === newStatus)?.label}!`,
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error updating order status:', error);
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Failed to update order status',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    }
  };

  const exportOrderData = () => {
    try {
      const exportData = filteredOrders.map(order => ({
        order_id: order.id,
        customer_name: order.customer_name || order.orderedBy?.name || '',
        customer_email: order.customer_email || order.orderedBy?.email || '',
        total_amount: order.total_amount,
        status: order.status,
        order_date: order.order_date,
        delivery_date: order.delivery_date || '',
        payment_method: order.payment_method || '',
        sellers: order.sellers?.join(', ') || '',
        items_count: order.items.length,
        tracking_id: order.tracking_id || ''
      }));

      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(exportData[0] || {}).join(",") + "\n" +
        exportData.map(row => Object.values(row).join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Order data exported successfully!',
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error exporting data:', error);
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Failed to export data',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = ORDER_STATUSES.find(s => s.value === status.toLowerCase());
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const getStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const statusCounts = ORDER_STATUSES.reduce((acc, status) => {
      acc[status.value] = orders.filter(o => o.status.toLowerCase() === status.value).length;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: orders.length,
      totalRevenue,
      uniqueSellers: sellers.length,
      avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
      pending: statusCounts.pending || 0,
      confirmed: statusCounts.confirmed || 0,
      processing: statusCounts.processing || 0,
      packed: statusCounts.packed || 0,
      shipped: statusCounts.shipped || 0,
      out_for_delivery: statusCounts.out_for_delivery || 0,
      delivered: statusCounts.delivered || 0,
      cancelled: statusCounts.cancelled || 0,
      returned: statusCounts.returned || 0
    };
  };

  const getSellerPerformance = () => {
    const sellerPerformance: Record<string, any> = {};
    
    orders.forEach(order => {
      if (order.seller_breakdown) {
        Object.entries(order.seller_breakdown).forEach(([sellerEmail, data]) => {
          if (!sellerPerformance[sellerEmail]) {
            sellerPerformance[sellerEmail] = {
              seller_name: data.seller_name,
              seller_email: sellerEmail,
              orders_count: 0,
              total_revenue: 0,
              avg_order_value: 0,
              statuses: {} as Record<string, number>
            };
          }

          sellerPerformance[sellerEmail].orders_count++;
          sellerPerformance[sellerEmail].total_revenue += data.subtotal;
          
          if (!sellerPerformance[sellerEmail].statuses[order.status]) {
            sellerPerformance[sellerEmail].statuses[order.status] = 0;
          }
          sellerPerformance[sellerEmail].statuses[order.status]++;
        });
      }
    });

    // Calculate averages
    Object.keys(sellerPerformance).forEach(sellerEmail => {
      const seller = sellerPerformance[sellerEmail];
      seller.avg_order_value = seller.orders_count > 0 ? seller.total_revenue / seller.orders_count : 0;
    });

    return Object.values(sellerPerformance);
  };

  const stats = getStats();
  const sellerPerformance = getSellerPerformance();

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

  return (
    <AdminLayout currentUser={currentUser}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600">Comprehensive order tracking and management across all sellers</p>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button
              onClick={() => loadOrders()}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={exportOrderData}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between whitespace-nowrap">
                <div className='flex flex-col '>
                  <p className="text-sm  text-gray-600 ">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-600">₹{stats.avgOrderValue.toFixed(0)}</p>
                </div>
                <BarChart3 className="text-purple-500 ml-1 mt-2 shrink-0"/>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Sellers</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.uniqueSellers}</p>
                </div>
                <Store className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">{stats.delivered || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search orders, customers, products, or sellers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
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
              <Select value={filterSeller} onValueChange={setFilterSeller}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Seller" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sellers</SelectItem>
                  {sellers.map(seller => (
                    <SelectItem key={seller} value={seller}>
                      {sellerDetails[seller]?.name || seller}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {PAYMENT_METHODS.map(method => (
                    <SelectItem key={method} value={method}>
                      {method.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  placeholder="From date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="date"
                  placeholder="To date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  {orders.length === 0 
                    ? "No orders available on the platform."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Sellers</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment & Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900">#{order.id}</div>
                          {order.tracking_id && (
                            <div className="text-xs text-gray-500">
                              Tracking: {order.tracking_id}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-gray-900">
                              {order.customer_name || order.orderedBy?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">
                              {order.customer_email || order.orderedBy?.email || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.sellers?.slice(0, 2).map((seller, idx) => (
                              <div key={idx} className="text-sm">
                                {sellerDetails[seller]?.name || seller}
                              </div>
                            ))}
                            {order.sellers && order.sellers.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{order.sellers.length - 2} more
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900">
                            {order.items.length} items
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">
                            ₹{order.total_amount.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900">
                              {order.payment_method?.toUpperCase() || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(order.order_date).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Order Details - #{order.id}</DialogTitle>
                                  <DialogDescription>
                                    Complete order information and management
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <Tabs defaultValue="overview" className="w-full">
                                  <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="items">Items</TabsTrigger>
                                    <TabsTrigger value="sellers">Sellers</TabsTrigger>
                                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Customer Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="flex items-center space-x-2">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">
                                              {order.customer_name || order.orderedBy?.name || 'N/A'}
                                            </span>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span>{order.customer_email || order.orderedBy?.email || 'N/A'}</span>
                                          </div>
                                          {order.customer_phone && (
                                            <div className="flex items-center space-x-2">
                                              <Phone className="h-4 w-4 text-gray-500" />
                                              <span>{order.customer_phone}</span>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                      
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Order Summary</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                          <div className="flex justify-between">
                                            <span>Total Amount:</span>
                                            <span className="font-medium">₹{order.total_amount.toLocaleString()}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Status:</span>
                                            <Badge className={getStatusColor(order.status)}>
                                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </Badge>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Payment Method:</span>
                                            <span>{order.payment_method?.toUpperCase() || 'N/A'}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Order Date:</span>
                                            <span>{new Date(order.order_date).toLocaleDateString()}</span>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </div>
                                    
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Status Management</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="flex items-center space-x-4">
                                          <Select 
                                            value={order.status} 
                                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                                          >
                                            <SelectTrigger className="w-48">
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
                                          <Button
                                            onClick={() => updateOrderStatus(order.id, order.status)}
                                            className="bg-orange-500 hover:bg-orange-600"
                                          >
                                            Update Status
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </TabsContent>
                                  
                                  <TabsContent value="items" className="space-y-4">
                                    <div className="space-y-3">
                                      {order.items.map((item, index) => (
                                        <Card key={index}>
                                          <CardContent className="p-4">
                                            <div className="flex items-center space-x-3">
                                              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                                              <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">
                                                  {item.product_name || 'Product'}
                                                </h4>
                                                <div className="text-sm text-gray-600 space-y-1">
                                                  <p>Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                                                  <p>Seller: {item.seller_name || item.seller_email || 'Unknown'}</p>
                                                  {item.size && <p>Size: {item.size}</p>}
                                                  {item.color && <p>Color: {item.color}</p>}
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <p className="font-medium text-gray-900">
                                                  ₹{(item.quantity * item.price).toLocaleString()}
                                                </p>
                                              </div>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="sellers" className="space-y-4">
                                    {order.seller_breakdown && Object.entries(order.seller_breakdown).map(([sellerEmail, data]) => (
                                      <Card key={sellerEmail}>
                                        <CardHeader>
                                          <CardTitle className="text-lg flex items-center">
                                            <Store className="h-5 w-5 mr-2" />
                                            {data.seller_name}
                                          </CardTitle>
                                          <CardDescription>{data.seller_email}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-3">
                                            <div className="flex justify-between">
                                              <span>Items Count:</span>
                                              <span className="font-medium">{data.items.length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Subtotal:</span>
                                              <span className="font-medium">₹{data.subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="space-y-2">
                                              {data.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                  <span>{item.product_name || 'Product'}</span>
                                                  <span>{item.quantity} × ₹{item.price.toLocaleString()}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </TabsContent>
                                  
                                  <TabsContent value="timeline" className="space-y-4">
                                    <Card>
                                      <CardHeader>
                                        <CardTitle className="text-lg">Order Timeline</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="space-y-4">
                                          <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                              <Package className="h-4 w-4 text-blue-600" />
                                            </div>
                                            <div>
                                              <p className="font-medium">Order Placed</p>
                                              <p className="text-sm text-gray-600">
                                                {new Date(order.order_date).toLocaleString()}
                                              </p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center space-x-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                              ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status) 
                                                ? 'bg-green-100' : 'bg-gray-100'
                                            }`}>
                                              <CheckCircle className={`h-4 w-4 ${
                                                ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status) 
                                                  ? 'text-green-600' : 'text-gray-400'
                                              }`} />
                                            </div>
                                            <div>
                                              <p className="font-medium">Current Status</p>
                                              <Badge className={getStatusColor(order.status)}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                              </Badge>
                                            </div>
                                          </div>
                                          
                                          {order.delivery_date && (
                                            <div className="flex items-center space-x-3">
                                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                              </div>
                                              <div>
                                                <p className="font-medium">Delivered</p>
                                                <p className="text-sm text-gray-600">
                                                  {new Date(order.delivery_date).toLocaleString()}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </TabsContent>
                                </Tabs>
                              </DialogContent>
                            </Dialog>
                            
                            {['pending', 'confirmed', 'processing'].includes(order.status.toLowerCase()) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700"
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            )}
                            
                            {order.status.toLowerCase() === 'shipped' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seller Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Seller Performance</CardTitle>
            <CardDescription>Performance metrics for all sellers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Avg Order Value</TableHead>
                    <TableHead>Delivered</TableHead>
                    <TableHead>Pending</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sellerPerformance.map((seller: any) => (
                    <TableRow key={seller.seller_email}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{seller.seller_name}</div>
                          <div className="text-sm text-gray-600">{seller.seller_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{seller.orders_count}</TableCell>
                      <TableCell>₹{seller.total_revenue.toLocaleString()}</TableCell>
                      <TableCell>₹{seller.avg_order_value.toFixed(0)}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {seller.statuses.delivered || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {(seller.statuses.pending || 0) + (seller.statuses.confirmed || 0)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
