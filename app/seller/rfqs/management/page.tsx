
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import SellerLayout from '@/components/seller/SellerLayout';
import { MessageSquare, Clock, CheckCircle, XCircle, User, Package, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function SellerRFQsManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [responseForm, setResponseForm] = useState({
    message: '',
    quotedPrice: '',
    estimatedDelivery: ''
  });

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
      router.push('/');
      return;
    }

    const sellerEmail = userEmail || 'rohit@gmail.com';
    const sellerId = `seller_${sellerEmail.replace('@', '_').replace('.', '_')}`;

    setCurrentUser({
      email: sellerEmail,
      name: 'Seller',
      role: 'Seller',
      id: sellerId
    });

    setIsLoading(false);
  }, [router]);

  // Load RFQs for current seller
  useEffect(() => {
    if (!currentUser) return;

    const loadSellerRFQs = () => {
      try {
        const allRFQs = JSON.parse(localStorage.getItem('rfqs') || '[]');
        const currentSellerId = currentUser.email || currentUser.id;
        
        // Filter RFQs for current seller
        const sellerRFQs = allRFQs.filter((rfq: RFQ) => 
          rfq.targetSellerId === currentSellerId || 
          rfq.targetSellerId === 'rohit@gmail.com' ||
          rfq.targetSellerId === 'seller_rohit_123'
        );

        setRfqs(sellerRFQs);
      } catch (error) {
        console.error('Error loading seller RFQs:', error);
      }
    };

    loadSellerRFQs();

    // Listen for new RFQ submissions
    const handleRFQSubmitted = () => {
      loadSellerRFQs();
    };

    window.addEventListener('rfqSubmitted', handleRFQSubmitted);
    return () => window.removeEventListener('rfqSubmitted', handleRFQSubmitted);
  }, [currentUser]);

  const handleRespondToRFQ = (rfq: RFQ) => {
    setSelectedRFQ(rfq);
    setResponseForm({
      message: '',
      quotedPrice: '',
      estimatedDelivery: ''
    });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = () => {
    if (!selectedRFQ || !responseForm.message || !responseForm.quotedPrice) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      // Get all RFQs
      const allRFQs = JSON.parse(localStorage.getItem('rfqs') || '[]');
      
      // Find and update the RFQ
      const updatedRFQs = allRFQs.map((rfq: RFQ) => {
        if (rfq.rfqId === selectedRFQ.rfqId) {
          return {
            ...rfq,
            status: 'Responded',
            sellerResponse: {
              message: responseForm.message,
              quotedPrice: responseForm.quotedPrice,
              estimatedDelivery: responseForm.estimatedDelivery,
              responseDate: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };
        }
        return rfq;
      });

      // Save back to localStorage
      localStorage.setItem('rfqs', JSON.stringify(updatedRFQs));

      // Update local state
      setRfqs(prev => prev.map(rfq => 
        rfq.rfqId === selectedRFQ.rfqId 
          ? { ...rfq, status: 'Responded', sellerResponse: {
              message: responseForm.message,
              quotedPrice: responseForm.quotedPrice,
              estimatedDelivery: responseForm.estimatedDelivery,
              responseDate: new Date().toISOString()
            }}
          : rfq
      ));

      // Dispatch event for real-time sync
      window.dispatchEvent(new CustomEvent('rfqUpdated', {
        detail: { rfqId: selectedRFQ.rfqId, status: 'Responded' }
      }));

      setShowResponseModal(false);
      setSelectedRFQ(null);
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Error submitting response. Please try again.');
    }
  };

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
    <SellerLayout currentUser={currentUser}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">RFQ Management</h1>
          <p className="text-gray-600">Manage quote requests from customers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending RFQs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rfqs.filter(rfq => rfq.status === 'Pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rfqs.filter(rfq => rfq.status === 'Responded').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total RFQs</p>
                <p className="text-2xl font-bold text-gray-900">{rfqs.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RFQs List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quote Requests</h3>
          </div>
          
          {rfqs.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs yet</h3>
              <p className="text-gray-600">Customer quote requests will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {rfqs.map((rfq) => (
                <div key={rfq.rfqId} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          {rfq.productDetails.productName}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rfq.status)}`}>
                          {rfq.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <User className="h-4 w-4" />
                            <span>{rfq.userInfo.fullName} ({rfq.userInfo.email})</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                            <Package className="h-4 w-4" />
                            <span>Qty: {rfq.quantity} | Budget: {rfq.productDetails.budgetRange}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(rfq.timestamp)}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Category:</strong> {rfq.mainCategory} {' > '} {rfq.category} {' > '} {rfq.subCategory}
                          </p>
                          {rfq.userAddress && (
                            <div className="flex items-start space-x-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mt-0.5" />
                              <span>
                                {rfq.userAddress.city}, {rfq.userAddress.state} - {rfq.userAddress.zipCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {rfq.productDetails.productDescription && (
                        <p className="text-sm text-gray-600 mb-4">
                          <strong>Description:</strong> {rfq.productDetails.productDescription}
                        </p>
                      )}
                      
                      {rfq.sellerResponse && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-green-900 mb-2">Your Response:</h5>
                          <p className="text-sm text-green-800 mb-2">{rfq.sellerResponse.message}</p>
                          <div className="text-sm text-green-700">
                            <span className="font-medium">Quoted Price:</span> ₹{rfq.sellerResponse.quotedPrice}
                            {rfq.sellerResponse.estimatedDelivery && (
                              <span className="ml-4">
                                <span className="font-medium">Delivery:</span> {rfq.sellerResponse.estimatedDelivery}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {rfq.status === 'Pending' && (
                        <Button
                          onClick={() => handleRespondToRFQ(rfq)}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Respond
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedRFQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Respond to RFQ: {selectedRFQ.productDetails.productName}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Message *
                </label>
                <textarea
                  value={responseForm.message}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your response message..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quoted Price (₹) *
                </label>
                <input
                  type="number"
                  value={responseForm.quotedPrice}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, quotedPrice: e.target.value }))}
                  placeholder="Enter quoted price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery
                </label>
                <input
                  type="text"
                  value={responseForm.estimatedDelivery}
                  onChange={(e) => setResponseForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  placeholder="e.g., 7-10 business days"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowResponseModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitResponse}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Submit Response
              </Button>
            </div>
          </div>
        </div>
      )}
    </SellerLayout>
  );
}
