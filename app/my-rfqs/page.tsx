
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageSquare, Clock, CheckCircle, Package, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MockUserAuth } from '@/lib/user-auth';

interface RFQ {
  rfqId: string;
  requestedBy: string;
  targetSellerId: string;
  productDetails: {
    productId: string;
    productName: string;
    productDescription: string;
    budgetRange: string;
  };
  mainCategory: string;
  category: string;
  subCategory: string;
  quantity: number;
  userAddress: any;
  status: string;
  timestamp: string;
  userInfo: {
    fullName: string;
    email: string;
    userId: string;
  };
  sellerResponse?: {
    message: string;
    quotedPrice: string;
    estimatedDelivery: string;
    responseDate: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export default function MyRFQsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);

  useEffect(() => {
    const user = MockUserAuth.getCurrentUser();
    const isLoggedIn = MockUserAuth.isLoggedIn();

    if (!isLoggedIn || !user) {
      router.push('/');
      return;
    }

    setCurrentUser(user);
    setIsLoading(false);
  }, [router]);

  // Load user's RFQs
  useEffect(() => {
    if (!currentUser) return;

    const loadUserRFQs = () => {
      try {
        const allRFQs = JSON.parse(localStorage.getItem('rfqs') || '[]');
        const userRFQs = allRFQs
          .filter((rfq: RFQ) => rfq.requestedBy === currentUser.id)
          .map((rfq: RFQ) => ({
            ...rfq,
            // Ensure productDetails exists with default values
            productDetails: rfq.productDetails || {
              productId: '',
              productName: 'Product Name Not Available',
              productDescription: '',
              budgetRange: 'Not specified'
            },
            // Ensure other required fields have fallback values
            mainCategory: rfq.mainCategory || 'N/A',
            category: rfq.category || 'N/A',
            subCategory: rfq.subCategory || 'N/A',
            quantity: rfq.quantity || 0
          }));
        setRfqs(userRFQs);
      } catch (error) {
        console.error('Error loading user RFQs:', error);
      }
    };

    loadUserRFQs();

    // Listen for RFQ updates
    const handleRFQUpdated = () => {
      loadUserRFQs();
    };

    window.addEventListener('rfqUpdated', handleRFQUpdated);
    window.addEventListener('rfqSubmitted', handleRFQUpdated);
    
    return () => {
      window.removeEventListener('rfqUpdated', handleRFQUpdated);
      window.removeEventListener('rfqSubmitted', handleRFQUpdated);
    };
  }, [currentUser]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return Clock;
      case 'responded':
        return CheckCircle;
      default:
        return MessageSquare;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                onClick={() => router.back()}
                className="flex items-center justify-center w-10 h-10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">My RFQs</h1>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {currentUser?.name}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {rfqs.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs submitted yet</h3>
            <p className="text-gray-600 mb-6">Start requesting quotes for products you're interested in.</p>
            <Button 
              onClick={() => router.push('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {rfqs.map((rfq) => {
              const StatusIcon = getStatusIcon(rfq.status);
              
              return (
                <div key={rfq.rfqId} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* RFQ Header */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {rfq.productDetails?.productName || 'Product Name Not Available'}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Submitted on {formatDate(rfq.timestamp)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Package className="h-4 w-4" />
                              <span>Qty: {rfq.quantity || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(rfq.status)}`}>
                          <StatusIcon className="h-3 w-3" />
                          <span>{rfq.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RFQ Details */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Request Details</h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Category:</strong> {rfq.mainCategory || 'N/A'} &gt; {rfq.category || 'N/A'} &gt; {rfq.subCategory || 'N/A'}</p>
                          <p><strong>Budget Range:</strong> {rfq.productDetails?.budgetRange || 'Not specified'}</p>
                          {rfq.productDetails?.productDescription && (
                            <p><strong>Description:</strong> {rfq.productDetails.productDescription}</p>
                          )}
                        </div>
                      </div>
                      
                      {rfq.userAddress && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-3">Delivery Address</h4>
                          <div className="text-sm text-gray-600">
                            <p>{rfq.userAddress.firstName} {rfq.userAddress.lastName}</p>
                            <p>{rfq.userAddress.addressLine1}</p>
                            {rfq.userAddress.addressLine2 && <p>{rfq.userAddress.addressLine2}</p>}
                            <p>{rfq.userAddress.city}, {rfq.userAddress.state} - {rfq.userAddress.zipCode}</p>
                            <p>{rfq.userAddress.country}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Seller Response */}
                    {rfq.sellerResponse && (
                      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-green-900 mb-3 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Seller Response
                        </h4>
                        <div className="text-sm text-green-800 space-y-2">
                          <p><strong>Message:</strong> {rfq.sellerResponse.message}</p>
                          <p><strong>Quoted Price:</strong> ₹{rfq.sellerResponse.quotedPrice}</p>
                          {rfq.sellerResponse.estimatedDelivery && (
                            <p><strong>Estimated Delivery:</strong> {rfq.sellerResponse.estimatedDelivery}</p>
                          )}
                          <p className="text-xs text-green-600 mt-2">
                            Responded on {formatDate(rfq.sellerResponse.responseDate)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
