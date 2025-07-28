
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Store, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit3,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Eye,
  RefreshCw,
  ArrowUpDown
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Seller {
  id: string;
  sellerName: string;
  email: string;
  phone: string;
  businessName: string;
  gstNumber: string;
  panNumber: string;
  password: string;
  status: 'approved' | 'pending' | 'suspended' | 'rejected';
  registrationDate: string;
  storeDetails?: {
    description: string;
    address: string;
    pincode: string;
    city: string;
    state: string;
  };
  source?: 'system' | 'admin';
  lastUpdated?: string;
}

const SELLERS_STORAGE_KEY = 'indivendi_sellers';

export default function SellerManagement() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('registrationDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isAddSellerModalOpen, setIsAddSellerModalOpen] = useState(false);
  const [isViewSellerModalOpen, setIsViewSellerModalOpen] = useState(false);
  const [isEditSellerModalOpen, setIsEditSellerModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Form state for adding new seller
  const [newSeller, setNewSeller] = useState({
    sellerName: '',
    email: '',
    phone: '',
    businessName: '',
    gstNumber: '',
    panNumber: '',
    password: '',
    confirmPassword: '',
    storeDescription: '',
    storeAddress: '',
    pincode: '',
    city: '',
    state: ''
  });

  // Form state for editing existing seller
  const [editSeller, setEditSeller] = useState({
    sellerName: '',
    email: '',
    phone: '',
    businessName: '',
    gstNumber: '',
    panNumber: '',
    storeDescription: '',
    storeAddress: '',
    pincode: '',
    city: '',
    state: '',
    status: 'approved' as Seller['status']
  });

  // Toast helper function
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Enhanced seller loading function
  const loadSellers = useCallback(() => {
    try {
      const storedSellers = localStorage.getItem(SELLERS_STORAGE_KEY);
      let sellersData: Seller[] = [];
      
      if (storedSellers) {
        sellersData = JSON.parse(storedSellers);
      }

      // Add system sellers if they don't exist
      const systemSellers = [
        {
          id: 'seller_rohit_123',
          sellerName: 'Rohit Kumar',
          email: 'rohit@gmail.com',
          phone: '+91 9876543210',
          businessName: 'Rohit Enterprises',
          gstNumber: '27AAAAA0000A1Z5',
          panNumber: 'AAAAA0000A',
          password: 'rohit@123',
          status: 'approved' as const,
          registrationDate: '2024-01-15T10:00:00.000Z',
          source: 'system' as const,
          storeDetails: {
            description: 'Traditional Indian clothing and accessories',
            address: '123 Business Street, Commercial Area',
            pincode: '110001',
            city: 'Delhi',
            state: 'Delhi'
          }
        }
      ];

      // Merge system sellers with stored sellers, avoiding duplicates
      systemSellers.forEach(systemSeller => {
        const exists = sellersData.find(seller => seller.email === systemSeller.email);
        if (!exists) {
          sellersData.push(systemSeller);
        }
      });

      // Sort sellers by registration date (newest first) by default
      sellersData.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime());
      
      setSellers(sellersData);
      
      // Save back to localStorage if we added system sellers
      if (sellersData.length > (storedSellers ? JSON.parse(storedSellers).length : 0)) {
        localStorage.setItem(SELLERS_STORAGE_KEY, JSON.stringify(sellersData));
      }
      
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error loading sellers:', error);
      setSellers([]);
    }
  }, []);

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
    
    loadSellers();
    setIsLoading(false);
  }, [router, loadSellers]);

  // Auto-refresh sellers every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadSellers();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadSellers]);

  const saveSellers = (sellersData: Seller[]) => {
    try {
      localStorage.setItem(SELLERS_STORAGE_KEY, JSON.stringify(sellersData));
      setSellers(sellersData);
      setLastRefresh(Date.now());
    } catch (error) {
      console.error('Error saving sellers:', error);
    }
  };

  const handleAddSeller = async () => {
    if (isSubmitting) return;
    
    // Validation
    if (!newSeller.sellerName || !newSeller.email || !newSeller.phone || 
        !newSeller.businessName || !newSeller.password || !newSeller.confirmPassword) {
      showToastMessage('Please fill in all required fields', 'error');
      return;
    }

    if (newSeller.password !== newSeller.confirmPassword) {
      showToastMessage('Passwords do not match', 'error');
      return;
    }

    if (newSeller.password.length < 6) {
      showToastMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    // Check if email already exists
    const existingSeller = sellers.find(seller => seller.email.toLowerCase() === newSeller.email.toLowerCase());
    if (existingSeller) {
      showToastMessage('A seller with this email already exists', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const seller: Seller = {
        id: `seller_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sellerName: newSeller.sellerName,
        email: newSeller.email.toLowerCase(),
        phone: newSeller.phone,
        businessName: newSeller.businessName,
        gstNumber: newSeller.gstNumber,
        panNumber: newSeller.panNumber,
        password: newSeller.password,
        status: 'approved',
        registrationDate: new Date().toISOString(),
        source: 'admin',
        lastUpdated: new Date().toISOString(),
        storeDetails: {
          description: newSeller.storeDescription,
          address: newSeller.storeAddress,
          pincode: newSeller.pincode,
          city: newSeller.city,
          state: newSeller.state
        }
      };

      // Add to sellers list
      const updatedSellers = [seller, ...sellers];
      saveSellers(updatedSellers);

      // Add to user authentication system
      const users = MockUserAuth.getUsers();
      const newUser = {
        id: seller.id,
        email: seller.email,
        password: seller.password,
        name: seller.sellerName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      MockUserAuth.saveUsers(users);

      // Reset form
      setNewSeller({
        sellerName: '',
        email: '',
        phone: '',
        businessName: '',
        gstNumber: '',
        panNumber: '',
        password: '',
        confirmPassword: '',
        storeDescription: '',
        storeAddress: '',
        pincode: '',
        city: '',
        state: ''
      });

      setIsAddSellerModalOpen(false);
      
      // Trigger dashboard update
      if ((window as any).triggerDashboardUpdate) {
        (window as any).triggerDashboardUpdate();
      }
      
      // Show success message
      showToastMessage('Seller added successfully!', 'success');
    } catch (error) {
      console.error('Error adding seller:', error);
      showToastMessage('Error adding seller. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (sellerId: string, newStatus: Seller['status']) => {
    const updatedSellers = sellers.map(seller => 
      seller.id === sellerId ? { 
        ...seller, 
        status: newStatus,
        lastUpdated: new Date().toISOString()
      } : seller
    );
    saveSellers(updatedSellers);
    
    // Trigger dashboard update
    if ((window as any).triggerDashboardUpdate) {
      (window as any).triggerDashboardUpdate();
    }
  };

  const handleViewSeller = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsViewSellerModalOpen(true);
  };

  const handleEditSeller = (seller: Seller) => {
    setSelectedSeller(seller);
    setEditSeller({
      sellerName: seller.sellerName,
      email: seller.email,
      phone: seller.phone,
      businessName: seller.businessName,
      gstNumber: seller.gstNumber || '',
      panNumber: seller.panNumber || '',
      storeDescription: seller.storeDetails?.description || '',
      storeAddress: seller.storeDetails?.address || '',
      pincode: seller.storeDetails?.pincode || '',
      city: seller.storeDetails?.city || '',
      state: seller.storeDetails?.state || '',
      status: seller.status
    });
    setIsEditSellerModalOpen(true);
  };

  const handleUpdateSeller = async () => {
    if (!selectedSeller || isSubmitting) return;
    
    // Validation
    if (!editSeller.sellerName || !editSeller.email || !editSeller.phone || !editSeller.businessName) {
      showToastMessage('Please fill in all required fields', 'error');
      return;
    }

    // Check if email already exists (excluding current seller)
    const existingSeller = sellers.find(seller => 
      seller.email.toLowerCase() === editSeller.email.toLowerCase() && seller.id !== selectedSeller.id
    );
    if (existingSeller) {
      showToastMessage('A seller with this email already exists', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedSeller: Seller = {
        ...selectedSeller,
        sellerName: editSeller.sellerName,
        email: editSeller.email.toLowerCase(),
        phone: editSeller.phone,
        businessName: editSeller.businessName,
        gstNumber: editSeller.gstNumber,
        panNumber: editSeller.panNumber,
        status: editSeller.status,
        lastUpdated: new Date().toISOString(),
        storeDetails: {
          description: editSeller.storeDescription,
          address: editSeller.storeAddress,
          pincode: editSeller.pincode,
          city: editSeller.city,
          state: editSeller.state
        }
      };

      // Update sellers list
      const updatedSellers = sellers.map(seller => 
        seller.id === selectedSeller.id ? updatedSeller : seller
      );
      saveSellers(updatedSellers);

      // Update user authentication system if email changed
      if (selectedSeller.email !== editSeller.email) {
        const users = MockUserAuth.getUsers();
        const updatedUsers = users.map(user => 
          user.id === selectedSeller.id ? {
            ...user,
            email: editSeller.email,
            name: editSeller.sellerName
          } : user
        );
        MockUserAuth.saveUsers(updatedUsers);
      }

      setIsEditSellerModalOpen(false);
      setSelectedSeller(null);
      
      // Trigger dashboard update
      if ((window as any).triggerDashboardUpdate) {
        (window as any).triggerDashboardUpdate();
      }
      
      // Show success message
      showToastMessage('Seller updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating seller:', error);
      showToastMessage('Error updating seller. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSeller = (sellerId: string) => {
    const updatedSellers = sellers.filter(seller => seller.id !== sellerId);
    saveSellers(updatedSellers);
    
    // Also remove from users
    const users = MockUserAuth.getUsers();
    const updatedUsers = users.filter(user => user.id !== sellerId);
    MockUserAuth.saveUsers(updatedUsers);
    
    // Trigger dashboard update
    if ((window as any).triggerDashboardUpdate) {
      (window as any).triggerDashboardUpdate();
    }
  };

  const handleRefresh = () => {
    loadSellers();
  };

  // Enhanced filtering and sorting
  const filteredSellers = sellers
    .filter(seller => {
      const matchesSearch = 
        seller.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        seller.phone.includes(searchQuery);
      
      const matchesStatus = statusFilter === 'all' || seller.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || seller.source === sourceFilter;
      
      return matchesSearch && matchesStatus && matchesSource;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'sellerName':
          comparison = a.sellerName.localeCompare(b.sellerName);
          break;
        case 'email':
          comparison = a.email.localeCompare(b.email);
          break;
        case 'businessName':
          comparison = a.businessName.localeCompare(b.businessName);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'registrationDate':
          comparison = new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSellers = filteredSellers.slice(startIndex, startIndex + itemsPerPage);

  const getStatusBadge = (status: Seller['status']) => {
    const config = {
      approved: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Approved', icon: CheckCircle },
      pending: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pending', icon: Eye },
      suspended: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Suspended', icon: Ban },
      rejected: { className: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Rejected', icon: XCircle }
    };
    
    const { className, label, icon: Icon } = config[status];
    
    return (
      <Badge className={`${className} border`}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getSourceBadge = (source: string = 'system') => {
    return source === 'admin' ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        Admin Created
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
        System
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sellers...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout currentUser={currentUser}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
            <p className="text-gray-600">
              Manage and monitor all registered sellers • Last updated: {new Date(lastRefresh).toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            <Dialog open={isAddSellerModalOpen} onOpenChange={setIsAddSellerModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Seller
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Seller</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sellerName">Seller Name *</Label>
                        <Input
                          id="sellerName"
                          value={newSeller.sellerName}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, sellerName: e.target.value }))}
                          placeholder="Enter seller name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newSeller.email}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input
                          id="phone"
                          value={newSeller.phone}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessName">Business Name *</Label>
                        <Input
                          id="businessName"
                          value={newSeller.businessName}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, businessName: e.target.value }))}
                          placeholder="Enter business name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Business Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gstNumber">GST Number</Label>
                        <Input
                          id="gstNumber"
                          value={newSeller.gstNumber}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, gstNumber: e.target.value }))}
                          placeholder="Enter GST number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="panNumber">PAN Number</Label>
                        <Input
                          id="panNumber"
                          value={newSeller.panNumber}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, panNumber: e.target.value }))}
                          placeholder="Enter PAN number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Authentication */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Authentication</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newSeller.password}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="Enter password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={newSeller.confirmPassword}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          placeholder="Confirm password"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Store Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Store Details (Optional)</h3>
                    <div>
                      <Label htmlFor="storeDescription">Store Description</Label>
                      <Textarea
                        id="storeDescription"
                        value={newSeller.storeDescription}
                        onChange={(e) => setNewSeller(prev => ({ ...prev, storeDescription: e.target.value }))}
                        placeholder="Describe your store"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="storeAddress">Store Address</Label>
                      <Textarea
                        id="storeAddress"
                        value={newSeller.storeAddress}
                        onChange={(e) => setNewSeller(prev => ({ ...prev, storeAddress: e.target.value }))}
                        placeholder="Enter store address"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={newSeller.city}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={newSeller.state}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="Enter state"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <Input
                          id="pincode"
                          value={newSeller.pincode}
                          onChange={(e) => setNewSeller(prev => ({ ...prev, pincode: e.target.value }))}
                          placeholder="Enter pincode"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddSellerModalOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddSeller}
                      disabled={isSubmitting}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Seller'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* View Seller Modal */}
            <Dialog open={isViewSellerModalOpen} onOpenChange={setIsViewSellerModalOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Seller Details</DialogTitle>
                </DialogHeader>
                
                {selectedSeller && (
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Basic Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Seller Name</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{selectedSeller.sellerName}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Email</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{selectedSeller.email}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Phone</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{selectedSeller.phone}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Business Name</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{selectedSeller.businessName}</div>
                        </div>
                      </div>
                    </div>

                    {/* Business Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Business Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">GST Number</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{selectedSeller.gstNumber || 'Not provided'}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">PAN Number</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{selectedSeller.panNumber || 'Not provided'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status & Registration */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Status & Registration</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Status</Label>
                          <div className="mt-1">{getStatusBadge(selectedSeller.status)}</div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Registration Date</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                            {new Date(selectedSeller.registrationDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Source</Label>
                          <div className="mt-1">{getSourceBadge(selectedSeller.source)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Store Details */}
                    {selectedSeller.storeDetails && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Store Details</h3>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Store Description</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm min-h-[60px]">
                            {selectedSeller.storeDetails.description || 'Not provided'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Store Address</Label>
                          <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm min-h-[60px]">
                            {selectedSeller.storeDetails.address || 'Not provided'}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">City</Label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                              {selectedSeller.storeDetails.city || 'Not provided'}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">State</Label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                              {selectedSeller.storeDetails.state || 'Not provided'}
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Pincode</Label>
                            <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                              {selectedSeller.storeDetails.pincode || 'Not provided'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setIsViewSellerModalOpen(false)}
                      >
                        Close
                      </Button>
                      <Button
                        onClick={() => {
                          setIsViewSellerModalOpen(false);
                          handleEditSeller(selectedSeller);
                        }}
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                      >
                        Edit Seller
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Seller Modal */}
            <Dialog open={isEditSellerModalOpen} onOpenChange={setIsEditSellerModalOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Seller</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editSellerName">Seller Name *</Label>
                        <Input
                          id="editSellerName"
                          value={editSeller.sellerName}
                          onChange={(e) => setEditSeller(prev => ({ ...prev, sellerName: e.target.value }))}
                          placeholder="Enter seller name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editEmail">Email *</Label>
                        <Input
                          id="editEmail"
                          type="email"
                          value={editSeller.email}
                          onChange={(e) => setEditSeller(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Enter email address"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editPhone">Phone *</Label>
                        <Input
                          id="editPhone"
                          value={editSeller.phone}
                          onChange={(e) => setEditSeller(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editBusinessName">Business Name *</Label>
                        <Input
                          id="editBusinessName"
                          value={editSeller.businessName}
                          onChange={(e) => setEditSeller(prev => ({ ...prev, businessName: e.target.value }))}
                          placeholder="Enter business name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Business Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="editGstNumber">GST Number</Label>
                        <Input
                          id="editGstNumber"
                          value={editSeller.gstNumber}
                          onChange={(e) => setEditSeller(prev => ({ ...prev, gstNumber: e.target.value }))}
                          placeholder="Enter GST number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editPanNumber">PAN Number</Label>
                        <Input
                          id="editPanNumber"
                          value={editSeller.panNumber}
                          onChange={(e) => setEditSeller(prev => ({ ...prev, panNumber: e.target.value }))}
                          placeholder="Enter PAN number"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Status</h3>
                    <div>
                      <Label htmlFor="editStatus">Seller Status *</Label>
                      <Select value={editSeller.status} onValueChange={(value: Seller['status']) => setEditSeller(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Store Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Store Details</h3>
                    <div>
                      <Label htmlFor="editStoreDescription">Store Description</Label>
                      <Textarea
                        id="editStoreDescription"
                        value={editSeller.storeDescription}
                        onChange={(e) => setEditSeller(prev => ({ ...prev, storeDescription: e.target.value }))}
                        placeholder="Describe your store"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editStoreAddress">Store Address</Label>
                      <Textarea
                        id="editStoreAddress"
                        value={editSeller.storeAddress}
                        onChange={(e) => setEditSeller(prev => ({ ...prev, storeAddress: e.target.value }))}
                        placeholder="Enter store address"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="editCity">City</Label>
                        <Input
                          id="editCity"
                          value={editSeller.city}
                          onChange={(e) => setEditSeller(prev => ({ ...prev, city: e.target.value }))}
                          placeholder="Enter city"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editState">State</Label>
                        <Input
                          id="editState"
                          value={editSeller.state}
                          onChange={(e) => setEditSeller(prev => ({ ...prev, state: e.target.value }))}
                          placeholder="Enter state"
                        />
                      </div>
                      <div>
                        <Label htmlFor="editPincode">Pincode</Label>
                        <Input
                          id="editPincode"
                          value={editSeller.pincode}
                          onChange={(e) => setEditSeller(prev => ({ ...prev, pincode: e.target.value }))}
                          placeholder="Enter pincode"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditSellerModalOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateSeller}
                      disabled={isSubmitting}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        'Update Seller'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Sellers</p>
                  <p className="text-2xl font-bold text-gray-900">{sellers.length}</p>
                </div>
                <Store className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {sellers.filter(s => s.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {sellers.filter(s => s.status === 'pending').length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">
                    {sellers.filter(s => s.status === 'suspended').length}
                  </p>
                </div>
                <Ban className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Admin Created</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {sellers.filter(s => s.source === 'admin').length}
                  </p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, business, or phone..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="admin">Admin Created</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="registrationDate">Registration Date</SelectItem>
                  <SelectItem value="sellerName">Seller Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="businessName">Business Name</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sellers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Sellers ({filteredSellers.length})</CardTitle>
            <CardDescription>
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredSellers.length)} of {filteredSellers.length} sellers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller Details</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSellers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-gray-500">
                          <Store className="h-12 w-12 mx-auto mb-4 opacity-30" />
                          <p className="text-lg font-medium">No sellers found</p>
                          <p className="text-sm">
                            {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all' 
                              ? 'Try adjusting your filters' 
                              : 'Add your first seller to get started'
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSellers.map((seller) => (
                      <TableRow key={seller.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{seller.sellerName}</div>
                              <div className="text-sm text-gray-500">ID: {seller.id.slice(-8)}</div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-2 text-gray-400" />
                              <span className="truncate max-w-[200px]">{seller.email}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-3 w-3 mr-2 text-gray-400" />
                              {seller.phone}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-medium">
                              <Building className="h-3 w-3 mr-2 text-gray-400" />
                              <span className="truncate max-w-[150px]">{seller.businessName}</span>
                            </div>
                            {seller.gstNumber && (
                              <div className="text-xs text-gray-500">GST: {seller.gstNumber}</div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          {getStatusBadge(seller.status)}
                        </TableCell>
                        
                        <TableCell>
                          {getSourceBadge(seller.source)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-3 w-3 mr-2 text-gray-400" />
                            {new Date(seller.registrationDate).toLocaleDateString()}
                          </div>
                          {seller.lastUpdated && (
                            <div className="text-xs text-gray-400 mt-1">
                              Updated: {new Date(seller.lastUpdated).toLocaleDateString()}
                            </div>
                          )}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewSeller(seller)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditSeller(seller)}>
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Seller
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {seller.status === 'approved' ? (
                                <DropdownMenuItem onClick={() => handleStatusChange(seller.id, 'suspended')}>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleStatusChange(seller.id, 'approved')}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Seller</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {seller.sellerName}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSeller(seller.id)}
                                      className="bg-red-500 hover:bg-red-600"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          toastType === 'success' 
            ? 'bg-green-100 border border-green-200 text-green-800' 
            : 'bg-red-100 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {toastType === 'success' ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 mr-2" />
            )}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
