"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import SellerLayout from '@/components/seller/SellerLayout';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Package, 
  MapPin, 
  Calendar,
  Search,
  Filter,
  Eye,
  Send
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

export default function RFQManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'seller' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [filteredRfqs, setFilteredRfqs] = useState<RFQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseForm, setResponseForm] = useState({
    message: '',
    quotedPrice: '',
    estimatedDelivery: ''
  });

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
        role: 'Seller',
        id: 'seller_rohit_123'
      });
    }

    setIsLoading(false);
  }, [router]);

  // Load RFQs based on user role
  useEffect(() => {
    if (!currentUser || !userRole) return;

    const loadRFQs = () => {
      try {
        const allRFQs = JSON.parse(localStorage.getItem('rfqs') || '[]');

        let filteredRfqs: RFQ[];
        if (userRole === 'admin') {
          // Admin sees all RFQs
          filteredRfqs = allRFQs;
        } else {
          // Seller sees only RFQs targeted to them
          const sellerId = currentUser.email || currentUser.id;
          filteredRfqs = allRFQs.filter((rfq: RFQ) => 
            rfq.targetSellerId === sellerId || 
            rfq.targetSellerId === 'rohit@gmail.com' ||
            rfq.targetSellerId === 'seller_rohit_123'
          );
        }

        setRfqs(filteredRfqs);
        setFilteredRfqs(filteredRfqs);
      } catch (error) {
        console.error('Error loading RFQs:', error);
        setRfqs([]);
        setFilteredRfqs([]);
      }
    };

    loadRFQs();

    // Listen for new RFQ submissions
    const handleRFQSubmitted = () => {
      loadRFQs();
    };

    window.addEventListener('rfqSubmitted', handleRFQSubmitted);
    return () => window.removeEventListener('rfqSubmitted', handleRFQSubmitted);
  }, [currentUser, userRole]);

  // Filter RFQs based on search and status
  useEffect(() => {
    let filtered = rfqs;

    if (searchTerm) {
      filtered = filtered.filter(rfq =>
        rfq.productDetails?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.userInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.userInfo?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.rfqId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(rfq => rfq.status.toLowerCase() === filterStatus.toLowerCase());
    }

    setFilteredRfqs(filtered);
  }, [searchTerm, filterStatus, rfqs]);

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
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Please fill in all required fields',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
      return;
    }

    try {
      const allRFQs = JSON.parse(localStorage.getItem('rfqs') || '[]');

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

      localStorage.setItem('rfqs', JSON.stringify(updatedRFQs));

      // Update local state
      setRfqs(prev => prev.map(rfq => 
        rfq.rfqId === selectedRFQ.rfqId 
          ? { 
              ...rfq, 
              status: 'Responded', 
              sellerResponse: {
                message: responseForm.message,
                quotedPrice: responseForm.quotedPrice,
                estimatedDelivery: responseForm.estimatedDelivery,
                responseDate: new Date().toISOString()
              }
            }
          : rfq
      ));

      window.dispatchEvent(new CustomEvent('rfqUpdated', {
        detail: { rfqId: selectedRFQ.rfqId, status: 'Responded' }
      }));

      setShowResponseModal(false);
      setSelectedRFQ(null);

      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Response submitted successfully!',
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error submitting response:', error);
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Error submitting response. Please try again.',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    }
  };

  // Admin actions
  const updateRFQStatus = (rfqId: string, newStatus: string) => {
    try {
      const allRFQs = JSON.parse(localStorage.getItem('rfqs') || '[]');
      const updatedRFQs = allRFQs.map((rfq: RFQ) => {
        if (rfq.rfqId === rfqId) {
          return {
            ...rfq,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return rfq;
      });

      localStorage.setItem('rfqs', JSON.stringify(updatedRFQs));

      setRfqs(prev => prev.map(rfq => 
        rfq.rfqId === rfqId ? { ...rfq, status: newStatus } : rfq
      ));

      const event = new CustomEvent('showToast', {
        detail: {
          message: `RFQ status updated to ${newStatus}!`,
          type: 'success'
        }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error updating RFQ status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
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

  const getRFQStats = () => {
    const stats = {
      total: rfqs.length,
      pending: rfqs.filter(rfq => rfq.status === 'Pending').length,
      responded: rfqs.filter(rfq => rfq.status === 'Responded').length,
      approved: rfqs.filter(rfq => rfq.status === 'Approved').length,
      rejected: rfqs.filter(rfq => rfq.status === 'Rejected').length,
      closed: rfqs.filter(rfq => rfq.status === 'Closed').length
    };
    return stats;
  };

  const stats = getRFQStats();

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

  const LayoutComponent = userRole === 'admin' ? AdminLayout : SellerLayout;

  return (
    <LayoutComponent currentUser={currentUser!}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {userRole === 'admin' ? 'RFQ Management' : 'RFQ Management'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'admin' ? 'Manage all quote requests across the platform' : 'Manage quote requests from customers'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total RFQs</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
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
                  <p className="text-sm text-gray-600">Responded</p>
                  <p className="text-2xl font-bold text-green-600">{stats.responded}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Closed</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                </div>
                <XCircle className="h-8 w-8 text-gray-500" />
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
                  placeholder="Search RFQs by product name, customer name, or RFQ ID..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RFQs List */}
        {filteredRfqs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs found</h3>
              <p className="text-gray-600">
                {rfqs.length === 0 
                  ? (userRole === 'admin' ? "No RFQs available on the platform." : "Customer quote requests will appear here.")
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRfqs.map((rfq) => (
              <Card key={rfq.rfqId} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {rfq.productDetails?.productName || 'Product Name Not Available'}
                      </CardTitle>
                      <CardDescription>
                        RFQ #{rfq.rfqId} • {formatDate(rfq.timestamp)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-3 mt-3 sm:mt-0">
                      <Badge className={getStatusColor(rfq.status)}>
                        {rfq.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Qty: {rfq.quantity}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer and Product Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center mb-2">
                          <User className="h-4 w-4 mr-2" />
                          Customer Details
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Name:</span> {rfq.userInfo?.fullName || 'Unknown'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Email:</span> {rfq.userInfo?.email || 'Unknown'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Budget:</span> {rfq.productDetails?.budgetRange || 'Not specified'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 flex items-center mb-2">
                          <Package className="h-4 w-4 mr-2" />
                          Product Details
                        </h4>
                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Category:</span> {rfq.mainCategory} {' > '} {rfq.category} {' > '} {rfq.subCategory}
                          </p>
                          {rfq.productDetails?.productDescription && (
                            <p className="text-sm">
                              <span className="font-medium">Description:</span> {rfq.productDetails?.productDescription}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Management Actions */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Actions</h4>

                        {userRole === 'admin' ? (
                          <div className="space-y-2">
                            <Select 
                              value={rfq.status} 
                              onValueChange={(value) => updateRFQStatus(rfq.rfqId, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {rfq.status === 'Pending' && (
                              <Button
                                onClick={() => handleRespondToRFQ(rfq)}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Respond to RFQ
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Seller Response (if exists) */}
                      {rfq.sellerResponse && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Response</h4>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
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
                        </div>
                      )}
                    </div>
                  </div>
                   {rfq.userAddress && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Delivery Address</h4>
                          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            <p>{rfq.userAddress?.firstName || ''} {rfq.userAddress?.lastName || ''}</p>
                            <p>{rfq.userAddress?.addressLine1 || ''}</p>
                            {rfq.userAddress?.addressLine2 && <p>{rfq.userAddress.addressLine2}</p>}
                            <p>{rfq.userAddress?.city || ''}, {rfq.userAddress?.state || ''} - {rfq.userAddress?.zipCode || ''}</p>
                           </div>
                        </div>
                      )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedRFQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Respond to RFQ: {selectedRFQ.productDetails?.productName || 'Product Name Not Available'}
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
    </LayoutComponent>
  );
}