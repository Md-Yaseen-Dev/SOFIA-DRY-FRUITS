"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, Calendar, DollarSign, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MockUserAuth } from '@/lib/user-auth';
import { useOrders } from '@/hooks/use-orders';
import { products } from '@/lib/mock-data';

export default function OrdersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const user = MockUserAuth.getCurrentUser();
    const isLoggedIn = MockUserAuth.isLoggedIn();

    if (!isLoggedIn || !user) {
      router.push('/');
      return;
    }

    setCurrentUser(user);
    setIsLoading(false);

    // Listen for real-time order updates
    const handleOrderStatusUpdate = (event: any) => {
      const { orderId, newStatus } = event.detail;
      // Refresh orders when status is updated by seller
      window.location.reload();
    };

    const handleTrackingIdUpdate = (event: any) => {
      const { orderId, trackingId } = event.detail;
      // Refresh orders when tracking ID is updated by seller
      window.location.reload();
    };

    window.addEventListener('orderStatusUpdated', handleOrderStatusUpdate);
    window.addEventListener('trackingIdUpdated', handleTrackingIdUpdate);

    return () => {
      window.removeEventListener('orderStatusUpdated', handleOrderStatusUpdate);
      window.removeEventListener('trackingIdUpdated', handleTrackingIdUpdate);
    };
  }, [router]);

  // Fetch orders for the current user
  const { orders, isLoading: ordersLoading, isError } = useOrders(currentUser?.id);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProductDetails = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center justify-center w-10 h-10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {currentUser?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {ordersLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your orders...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading orders</h3>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here.</p>
            <Button 
              onClick={() => router.push('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Order #{order.id}
                        </h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Placed on {formatDate(order.order_date)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                         
                            <span>₹{order.total_amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/order/${order.id}`)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Items ({order.items.length})</h4>
                  <div className="space-y-4">
                    {order.items.slice(0, 3).map((item, index) => {
                      const product = getProductDetails(item.product_id);
                      // Use stored product info if available, fallback to fetched product
                      const productName = item.product_name || product?.name || 'Product';
                      const productImage = item.product_image || product?.image_url;

                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div 
                          className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => router.push(`/product/${item.product_id}`)}
                        >
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={productName}
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
                              {productName}
                            </p>
                            <div className="text-xs text-gray-600 space-y-1">
                              <p>Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                              {item.size && <p>Size: {item.size}</p>}
                              {item.color && <p>Color: {item.color}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery Info */}
                {order.delivery_date && (
                  <div className="px-6 py-3 bg-green-50 border-t border-gray-200">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Delivered on:</span> {formatDate(order.delivery_date)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}