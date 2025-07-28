"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import AdminLayout from '@/components/admin/AdminLayout';
import { Search, Filter, Plus, Eye, Edit, Trash2, MoreHorizontal, RefreshCw, UserPlus, UserX, UserCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  mobile?: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export default function UserManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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

    loadUsers();
    setIsLoading(false);
  }, [router]);

  const loadUsers = async () => {
    setIsRefreshing(true);
    try {
      // Get all registered users from localStorage
      const allUsers = MockUserAuth.getUsers();

      // Filter to only include regular users (not master admin or sellers)
      const regularUsers = allUsers.filter(user => {
        // Exclude master admin
        if (user.email === 'abhay@gmail.com') return false;

        // Check if user is a seller by looking in sellers storage
        try {
          const sellersData = localStorage.getItem('indivendi_sellers');
          if (sellersData) {
            const sellers = JSON.parse(sellersData);
            const isSeller = sellers.some((seller: any) => seller.email === user.email);
            if (isSeller) return false;
          }
        } catch (error) {
          console.error('Error checking sellers:', error);
        }

        return true;
      });

      // Add role and status to users
      const usersWithMetadata = regularUsers.map(user => ({
        ...user,
        role: 'user',
      status: ((user as any).status || 'active') as 'active' | 'inactive' | 'suspended'
      }));

      setUsers(usersWithMetadata);
      setTotalUsers(usersWithMetadata.length);

      console.log('Loaded users:', usersWithMetadata);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter and search users
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(lowerSearchTerm) ||
        user.email.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [users, searchTerm, statusFilter]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      // Update user status in localStorage
      const allUsers = MockUserAuth.getUsers();
      const updatedUsers = allUsers.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus, updatedAt: new Date().toISOString() }
          : user
      );

      MockUserAuth.saveUsers(updatedUsers);

      // Update state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus, updatedAt: new Date().toISOString() }
            : user
        )
      );

      // Trigger dashboard update
      if ((window as any).triggerDashboardUpdate) {
        (window as any).triggerDashboardUpdate();
      }

      // Show success toast
      const statusText = newStatus === 'active' ? 'activated' : 'suspended';
      toast({
        title: "Success",
        description: `User has been ${statusText} successfully.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Remove from users array
      const updatedUsers = users.filter(user => user.id !== userId);

      // Update localStorage
      const allUsers = MockUserAuth.getUsers();
      const filteredAllUsers = allUsers.filter(user => user.id !== userId);
      MockUserAuth.saveUsers(filteredAllUsers);

      // Update state
      setUsers(updatedUsers);
      setTotalUsers(updatedUsers.length);

      // Trigger dashboard update
      if ((window as any).triggerDashboardUpdate) {
        (window as any).triggerDashboardUpdate();
      }

      toast({
        title: "Success",
        description: "User has been deleted successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Unknown</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-gray-600';
      case 'suspended':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
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
    <AdminLayout currentUser={currentUser}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">
              Manage platform users and their permissions • Total: {totalUsers} users
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={loadUsers}
              disabled={isRefreshing}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Summary Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
                <p className="text-xs text-gray-500 mt-1">Registered users</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">{users.filter(u => u.status === 'active').length}</p>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended Users</p>
                <p className="text-3xl font-bold text-red-600">{users.filter(u => u.status === 'suspended').length}</p>
                <p className="text-xs text-gray-500 mt-1">Account suspended</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-3xl font-bold text-purple-600">{users.filter(u => {
                  const userDate = new Date(u.createdAt);
                  const currentDate = new Date();
                  return userDate.getMonth() === currentDate.getMonth() && userDate.getFullYear() === currentDate.getFullYear();
                }).length}</p>
                <p className="text-xs text-gray-500 mt-1">Recent signups</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-left font-medium text-gray-900">User</TableHead>
                  <TableHead className="text-left font-medium text-gray-900">Email</TableHead>
                  <TableHead className="text-left font-medium text-gray-900">Role</TableHead>
                  <TableHead className="text-left font-medium text-gray-900">Signup Date</TableHead>
                  <TableHead className="text-left font-medium text-gray-900">Status</TableHead>
                  <TableHead className="text-left font-medium text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No users found matching your criteria' 
                        : 'No users registered yet'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  currentUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            {user.mobile && (
                              <div className="text-sm text-gray-500">{user.mobile}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.role || 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status || 'active')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewUser(user)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {user.status === 'suspended' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(user.id, 'active')}
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusUpdate(user.id, 'suspended')}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          )}


                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of{' '}
                {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Modal */}
        <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Profile Details</DialogTitle>
              <DialogDescription>
                Complete user information and account status
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-6">
                {/* User Header */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-xl">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="mt-1">
                      {getStatusBadge(selectedUser.status || 'active')}
                    </div>
                  </div>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.name}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.email}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Mobile Number</Label>
                      <p className="mt-1 text-sm text-gray-900">{selectedUser.mobile || 'Not provided'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Role</Label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedUser.role || 'User'}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Account Status</Label>
                      <p className={`mt-1 text-sm font-medium ${getStatusColor(selectedUser.status || 'active')}`}>
                        {(selectedUser.status || 'active').charAt(0).toUpperCase() + (selectedUser.status || 'active').slice(1)}
                      </p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">Signup Date</Label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsProfileModalOpen(false)}
                  >
                    Close
                  </Button>

                  {selectedUser.status === 'suspended' ? (
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedUser.id, 'active');
                        setIsProfileModalOpen(false);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate User
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedUser.id, 'suspended');
                        setIsProfileModalOpen(false);
                      }}
                      variant="destructive"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Suspend User
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}