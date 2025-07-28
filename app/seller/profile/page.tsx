
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockUserAuth } from '@/lib/user-auth';
import SellerLayout from '@/components/seller/SellerLayout';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  FileText, 
  MapPin, 
  CreditCard,
  Upload,
  Save,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SellerProfile {
  sellerId: string;
  sellerName: string;
  businessName: string;
  email: string;
  phone: string;
  gstNumber: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId: string;
  };
  businessLogo?: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function SellerProfilePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<SellerProfile>({
    sellerId: '',
    sellerName: '',
    businessName: '',
    email: '',
    phone: '',
    gstNumber: '',
    businessAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      upiId: ''
    },
    createdAt: '',
    updatedAt: ''
  });

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const loginStatus = localStorage.getItem('loginStatus');

    const authIsLoggedIn = MockUserAuth.isLoggedIn();
    const authUserRole = MockUserAuth.getCurrentUserRole();

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
      name: 'Abhay Huilgol',
      role: 'Seller',
      id: sellerId
    });

    // Load seller profile from localStorage
    loadSellerProfile(sellerId);
    setIsLoading(false);
  }, [router]);

  const loadSellerProfile = (sellerId: string) => {
    try {
      const savedProfile = localStorage.getItem(`seller_profile_${sellerId}`);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
      } else {
        // Create default profile with seller ID
        const defaultProfile: SellerProfile = {
          sellerId,
          sellerName: 'Abhay Huilgol',
          businessName: '',
          email: 'rohit@gmail.com',
          phone: '',
          gstNumber: '',
          businessAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India'
          },
          bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: '',
            upiId: ''
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error loading seller profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
      sellerId: prev.sellerId, // Ensure sellerId is preserved
      updatedAt: new Date().toISOString()
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      businessAddress: {
        ...prev.businessAddress,
        [field]: value
      },
      updatedAt: new Date().toISOString()
    }));
  };

  const handleBankDetailsChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      },
      updatedAt: new Date().toISOString()
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem(`seller_profile_${profile.sellerId}`, JSON.stringify(profile));

      // Emit profile update event for other components to listen
      const profileUpdateEvent = new CustomEvent('sellerProfileUpdated', {
        detail: {
          sellerId: profile.sellerId,
          profile: profile
        }
      });
      window.dispatchEvent(profileUpdateEvent);

      // Emit general profile saved event
      const profileSavedEvent = new CustomEvent('sellerProfileSaved');
      window.dispatchEvent(profileSavedEvent);

      // Show success toast
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Profile updated successfully!',
          type: 'success'
        }
      });
      window.dispatchEvent(event);

    } catch (error) {
      console.error('Error saving profile:', error);
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'Error saving profile. Please try again.',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProfile(prev => ({
          ...prev,
          businessLogo: result,
          updatedAt: new Date().toISOString()
        }));
      };
      reader.readAsDataURL(file);
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
    <SellerLayout currentUser={currentUser}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Profile</h1>
          <p className="text-gray-600">Manage your business information and settings</p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>
                Your personal and business details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sellerName">Seller Name *</Label>
                  <Input
                    id="sellerName"
                    value={profile.sellerName}
                    onChange={(e) => handleInputChange('sellerName', e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    value={profile.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    placeholder="Your business/store name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={profile.gstNumber}
                  onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Business Address</span>
              </CardTitle>
              <CardDescription>
                Your business location details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Textarea
                  id="street"
                  value={profile.businessAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  placeholder="Building name, street name, area"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={profile.businessAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={profile.businessAddress.state}
                    onChange={(e) => handleAddressChange('state', e.target.value)}
                    placeholder="State"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={profile.businessAddress.pincode}
                    onChange={(e) => handleAddressChange('pincode', e.target.value)}
                    placeholder="123456"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank/UPI Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Details</span>
              </CardTitle>
              <CardDescription>
                Bank account and UPI information for payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    value={profile.bankDetails.accountHolderName}
                    onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
                    placeholder="As per bank records"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={profile.bankDetails.accountNumber}
                    onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                    placeholder="1234567890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    value={profile.bankDetails.ifscCode}
                    onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value)}
                    placeholder="SBIN0001234"
                  />
                </div>
                <div>
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input
                    id="bankName"
                    value={profile.bankDetails.bankName}
                    onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
                    placeholder="State Bank of India"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  value={profile.bankDetails.upiId}
                  onChange={(e) => handleBankDetailsChange('upiId', e.target.value)}
                  placeholder="yourname@paytm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Business Logo</span>
              </CardTitle>
              <CardDescription>
                Upload your business logo (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.businessLogo && (
                  <div className="flex items-center space-x-4">
                    <img
                      src={profile.businessLogo}
                      alt="Business Logo"
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current Logo</p>
                      <p className="text-xs text-gray-500">Upload a new image to replace</p>
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-900">Upload business logo</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 2MB</p>
                      </div>
                    </div>
                  </Label>
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSaving ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
