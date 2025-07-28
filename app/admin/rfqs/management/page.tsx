
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  MessageSquare, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Package,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface RFQ {
  id: string;
  user_id: string;
  user_email?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  message: string;
  status: 'pending' | 'responded' | 'closed';
  created_at: string;
  updated_at?: string;
  budget_range?: string;
  expected_delivery?: string;
}

export default function AdminRFQManagementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [filteredRfqs, setFilteredRfqs] = useState<RFQ[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

    loadRFQs();
    setIsLoading(false);
  }, [router]);

  const loadRFQs = () => {
    try {
      const allRFQs = JSON.parse(localStorage.getItem('allRFQs') || '[]');
      setRfqs(allRFQs);
      setFilteredRfqs(allRFQs);
    } catch (error) {
      console.error('Error loading RFQs:', error);
      setRfqs([]);
      setFilteredRfqs([]);
    }
  };

  // Filter RFQs based on search and status
  useEffect(() => {
    let filtered = rfqs;

    if (searchTerm) {
      filtered = filtered.filter(rfq =>
        rfq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rfq.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(rfq => rfq.status === filterStatus);
    }

    setFilteredRfqs(filtered);
  }, [searchTerm, filterStatus, rfqs]);

  const updateRFQStatus = async (rfqId: string, newStatus: 'pending' | 'responded' | 'closed') => {
    try {
      const allRFQs = JSON.parse(localStorage.getItem('allRFQs') || '[]');
      const updatedRFQs = allRFQs.map((rfq: any) => 
        rfq.id === rfqId 
          ? { ...rfq, status: newStatus, updated_at: new Date().toISOString() }
          : rfq
      );
      
      localStorage.setItem('allRFQs', JSON.stringify(updatedRFQs));
      loadRFQs();

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
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStats = () => {
    return {
      total: rfqs.length,
      pending: rfqs.filter(rfq => rfq.status === 'pending').length,
      responded: rfqs.filter(rfq => rfq.status === 'responded').length,
      closed: rfqs.filter(rfq => rfq.status === 'closed').length
    };
  };

  const stats = getStats();

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
    <AdminLayout currentUser={currentUser}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">RFQ Management</h1>
          <p className="text-gray-600">Manage all quote requests across the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total RFQs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Responded</p>
                <p className="text-2xl font-bold text-blue-600">{stats.responded}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              </div>
              <XCircle className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search RFQs by ID, customer, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* RFQs Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
          {filteredRfqs.length === 0 ? (
            <div className="p-8 text-center bg-white">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No RFQs found</h3>
              <p className="text-gray-600">
                {rfqs.length === 0 
                  ? "No RFQs available on the platform."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFQ ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRfqs.map((rfq) => (
                  <TableRow key={rfq.id}>
                    <TableCell>
                      <p className="font-medium text-gray-900">#{rfq.id}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{rfq.user_email || rfq.user_id}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{rfq.product_name || rfq.product_id}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-gray-900">{rfq.quantity}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(rfq.status)}>
                        {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-gray-500">
                        {new Date(rfq.created_at).toLocaleDateString()}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Navigate to RFQ details - you'll need to create this route
                            console.log('View RFQ details:', rfq.id);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {rfq.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateRFQStatus(rfq.id, 'responded')}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {['pending', 'responded'].includes(rfq.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateRFQStatus(rfq.id, 'closed')}
                            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
