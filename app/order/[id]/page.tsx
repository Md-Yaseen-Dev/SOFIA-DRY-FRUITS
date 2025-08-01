"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { ArrowLeft, Package, Calendar, DollarSign, MapPin, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MockUserAuth } from '@/lib/user-auth';
import { LocalStorageManager } from '@/lib/mock-data';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const user = MockUserAuth.getCurrentUser();
    const isLoggedIn = MockUserAuth.isLoggedIn();

    if (!isLoggedIn || !user) {
      router.push('/');
      return;
    }

    setCurrentUser(user);

    // Get orders from localStorage using LocalStorageManager
    let allOrders: any[] = [];
    if (typeof window !== 'undefined') {
      allOrders = LocalStorageManager.getOrders();
    }
    // Find the order
    const foundOrder = allOrders.find((o: any) => o.id === orderId && o.user_id === user.id);
    if (!foundOrder) {
      router.push('/orders');
      return;
    }

    setOrder(foundOrder);
    setIsLoading(false);
  }, [orderId, router]);

  const getProductDetails = (productId: string) => {
    if (typeof window !== 'undefined') {
      const allProducts = LocalStorageManager.getAllProducts();
      return allProducts.find((p: any) => p.id === productId);
    }
    return null;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/orders')}>
            Back to Orders
          </Button>
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
                onClick={() => router.push('/orders')}
                className="flex items-center justify-center w-10 h-10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Placed</p>
                        <p className="text-xs text-gray-600">{formatDate(order.order_date)}</p>
                      </div>
                    </div>
                    {(order.status === 'confirmed' || order.status === 'packed' || order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'delivered') && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Confirmed</p>
                          <p className="text-xs text-gray-600">Your order has been confirmed</p>
                        </div>
                      </div>
                    )}
                    {(order.status === 'packed' || order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'delivered') && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Packed</p>
                          <p className="text-xs text-gray-600">Your order is packed and ready</p>
                        </div>
                      </div>
                    )}
                    {(order.status === 'shipped' || order.status === 'out_for_delivery' || order.status === 'delivered') && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Truck className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Shipped</p>
                          <p className="text-xs text-gray-600">Your order is on its way</p>
                          {order.tracking_id && (
                            <p className="text-xs text-gray-500 mt-1">
                              Tracking ID: <span className="font-mono">{order.tracking_id}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {(order.status === 'out_for_delivery' || order.status === 'delivered') && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Truck className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Out for Delivery</p>
                          <p className="text-xs text-gray-600">Your order is out for delivery</p>
                        </div>
                      </div>
                    )}
                    {order.delivery_date && order.status === 'delivered' && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Truck className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Delivered</p>
                          <p className="text-xs text-gray-600">{formatDate(order.delivery_date)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Actions - Restricted based on status */}
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Actions</h3>
                    <div className="space-y-2">
                      {/* Cancel button - only available before shipped */}
                      {!['shipped', 'out_for_delivery', 'delivered'].includes(order.status) && (
                        <Button
                          variant="outline"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => {
                            // Add cancel order functionality
                            const event = new CustomEvent('showToast', {
                              detail: {
                                message: 'Order cancellation requested. Please contact seller.',
                                type: 'info'
                              }
                            });
                            window.dispatchEvent(event);
                          }}
                        >
                          Cancel Order
                        </Button>
                      )}

                      {/* Return button - only available after delivery for a limited time */}
                      {order.status === 'delivered' && order.delivery_date && (
                        <Button
                          variant="outline"
                          className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => {
                            // Add return order functionality
                            const event = new CustomEvent('showToast', {
                              detail: {
                                message: 'Return request initiated. You will be contacted soon.',
                                type: 'info'
                              }
                            });
                            window.dispatchEvent(event);
                          }}
                        >
                          Return Order
                        </Button>
                      )}

                      {/* Contact seller */}
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => {
                          // Add contact seller functionality
                          const event = new CustomEvent('showToast', {
                            detail: {
                              message: 'Redirecting to seller contact...',
                              type: 'info'
                            }
                          });
                          window.dispatchEvent(event);
                        }}
                      >
                        Contact Seller
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delivery Information */}
                {order.status === 'delivered' && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Truck className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-medium text-green-900">Order Delivered</h3>
                    </div>
                    <p className="text-sm text-green-700">
                      Your order was successfully delivered on {formatDate(order.delivery_date || order.order_date)}
                    </p>
                    {order.tracking_id && (
                      <p className="text-xs text-green-600 mt-1">
                        Tracking ID: <span className="font-mono">{order.tracking_id}</span>
                      </p>
                    )}
                  </div>
                )}

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Items Ordered</h3>
              <div className="space-y-4">
                {order.items.map((item: any, index: number) => {
                  const product = getProductDetails(item.product_id);
                  // Use stored product info if available, fallback to fetched product
                  const productName = item.product_name || product?.name || 'Product';
                  const productImage = item.product_image || product?.image_url || product?.imageUrl || (product?.images && product.images[0]);

                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {productImage ? (
                          <img
                            src={productImage}
                            alt={productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{productName}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ₹{item.price.toFixed(2)} each</p>
                          {item.size && <p>Size: {item.size}</p>}
                          {item.color && <p>Color: {item.color}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-medium text-gray-900">₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                Delivery Address
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">{currentUser?.name}</p>
                <p>123 Sample Street</p>
                <p>Sample City, Sample State - 110001</p>
                <p>Phone: +91 98765 43210</p>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
              <h3 className="text-sm font-medium text-orange-800 mb-2">Need Help?</h3>
              <p className="text-xs text-orange-700 mb-3">
                Contact our customer service for any questions about your order.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full text-orange-600 border-orange-200 hover:bg-orange-100"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}