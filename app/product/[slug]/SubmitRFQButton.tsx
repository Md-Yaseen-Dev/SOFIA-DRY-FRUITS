import React, { useState, useEffect } from "react";
import { MockUserAuth } from '@/lib/user-auth';
import { statesWithCities } from '@/lib/statesWithCities';
import { useUnifiedToast } from '@/hooks/use-unified-toast';

interface CategoryData {
  mainCategories: string[];
  categories: { [mainCategory: string]: string[] };
  subCategories: { [category: string]: string[] };
}

interface RFQFormData {
  fullName: string;
  email: string;
  productName: string;
  productDescription: string;
  quantity: string;
  budgetRange: string;
  mainCategory: string;
  category: string;
  subCategory: string;
}

const SubmitRFQButton = () => {
  const { showSuccessToast } = useUnifiedToast();
  const [showModal, setShowModal] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [isBillingAddress, setIsBillingAddress] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [isAddressSelectorOpen, setIsAddressSelectorOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
    const [billingSelectedState, setBillingSelectedState] = useState('');
  const [billingSelectedCity, setBillingSelectedCity] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
    const [billingAvailableCities, setBillingAvailableCities] = useState<string[]>([]);
  const [availableStates, setAvailableStates] = useState<string[]>([]);

  // Address form state
  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    country: 'India',
    state: '',
    city: '',
    zipCode: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  const [billingAddress, setBillingAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    country: 'India',
    state: '',
    city: '',
    zipCode: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    // Load available states from the JSON file
    setAvailableStates(Object.keys(statesWithCities));
  }, []);

  // Load saved shipping address on component mount
  useEffect(() => {
    const loadSavedShippingAddress = () => {
      try {
        const currentUser = MockUserAuth.getCurrentUser();
        if (currentUser) {
          // Try to get saved shipping address from user-specific key
          const userShippingKey = `shippingAddress_${currentUser.id}`;
          const savedAddress = localStorage.getItem(userShippingKey);

          if (savedAddress) {
            const parsedAddress = JSON.parse(savedAddress);
            setShippingAddress(parsedAddress);

            // Update form data with saved contact info
            setFormData(prev => ({
              ...prev,
              fullName: `${parsedAddress.firstName} ${parsedAddress.lastName}`.trim(),
              email: parsedAddress.email || prev.email
            }));

            // Set state and city for dropdowns
            if (parsedAddress.state) {
              setSelectedState(parsedAddress.state);
              setAvailableCities(statesWithCities[parsedAddress.state as keyof typeof statesWithCities] || []);
              if (parsedAddress.city) {
                setSelectedCity(parsedAddress.city);
              }
            }

            // Set billing address if not using shipping as billing
            if (!isBillingAddress) {
              setBillingAddress(parsedAddress);
              if (parsedAddress.state) {
                setBillingSelectedState(parsedAddress.state);
                setBillingAvailableCities(statesWithCities[parsedAddress.state as keyof typeof statesWithCities] || []);
                if (parsedAddress.city) {
                  setBillingSelectedCity(parsedAddress.city);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved shipping address:', error);
      }
    };

    if (showShippingModal) {
      loadSavedShippingAddress();
    }
  }, [showShippingModal]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setAvailableCities(statesWithCities[state as keyof typeof statesWithCities] || []);
    setSelectedCity(''); // Reset city when state changes
  };

    const handleBillingStateChange = (state: string) => {
    setBillingSelectedState(state);
    setBillingAvailableCities(statesWithCities[state as keyof typeof statesWithCities] || []);
    setBillingSelectedCity(''); // Reset city when state changes
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

      const handleBillingCityChange = (city: string) => {
    setBillingSelectedCity(city);
  };

  // Handle shipping address input changes
  const handleShippingAddressChange = (field: keyof typeof shippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle billing address input changes
  const handleBillingAddressChange = (field: keyof typeof billingAddress, value: string) => {
    setBillingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };



  // Category data and form state
  const [categoryData, setCategoryData] = useState<CategoryData>({
    mainCategories: [],
    categories: {},
    subCategories: {}
  });

  const [formData, setFormData] = useState<RFQFormData>({
    fullName: '',
    email: '',
    productName: '',
    productDescription: '',
    quantity: '',
    budgetRange: '',
    mainCategory: '',
    category: '',
    subCategory: ''
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>([]);

  const handleShippingAddressClick = () => {
    setShowShippingModal(true);
  };

  const handleSaveShippingAddress = () => {
    try {
      const currentUser = MockUserAuth.getCurrentUser();
      if (currentUser) {
        // Save shipping address to localStorage with user-specific key
        const userShippingKey = `shippingAddress_${currentUser.id}`;
        const addressToSave = {
          ...shippingAddress,
          state: selectedState,
          city: selectedCity,
          updatedAt: new Date().toISOString()
        };

        localStorage.setItem(userShippingKey, JSON.stringify(addressToSave));

        // Also save billing address if different
        if (!isBillingAddress) {
          const userBillingKey = `billingAddress_${currentUser.id}`;
          const billingToSave = {
            ...billingAddress,
            state: billingSelectedState,
            city: billingSelectedCity,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(userBillingKey, JSON.stringify(billingToSave));
        }

        console.log('Address saved successfully');
      }
    } catch (error) {
      console.error('Error saving shipping address:', error);
    }

    setShowShippingModal(false);
  };

  const handleCancelShippingAddress = () => {
    setShowShippingModal(false);
  };

  // Load category data from seller products on component mount
  useEffect(() => {
    const loadCategoryData = () => {
      try {
        const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');

        const mainCategoriesSet = new Set<string>();
        const categoriesMap: { [mainCategory: string]: Set<string> } = {};
        const subCategoriesMap: { [category: string]: Set<string> } = {};

        allProducts.forEach((product: any) => {
          if (product.mainCategory) {
            mainCategoriesSet.add(product.mainCategory);

            if (product.category) {
              if (!categoriesMap[product.mainCategory]) {
                categoriesMap[product.mainCategory] = new Set();
              }
              categoriesMap[product.mainCategory].add(product.category);

              if (product.subCategory) {
                if (!subCategoriesMap[product.category]) {
                  subCategoriesMap[product.category] = new Set();
                }
                subCategoriesMap[product.category].add(product.subCategory);
              }
            }
          }
        });

        // Convert Sets to Arrays
        const mainCategories = Array.from(mainCategoriesSet).sort();
        const categories: { [mainCategory: string]: string[] } = {};
        const subCategories: { [category: string]: string[] } = {};

        Object.keys(categoriesMap).forEach(mainCat => {
          categories[mainCat] = Array.from(categoriesMap[mainCat]).sort();
        });

        Object.keys(subCategoriesMap).forEach(cat => {
          subCategories[cat] = Array.from(subCategoriesMap[cat]).sort();
        });

        setCategoryData({
          mainCategories,
          categories,
          subCategories
        });

      } catch (error) {
        console.error('Error loading category data:', error);
      }
    };

    loadCategoryData();
  }, []);

  // Handle main category selection
  const handleMainCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      mainCategory: value,
      category: '',
      subCategory: ''
    }));

    const categories = categoryData.categories[value] || [];
    setAvailableCategories(categories);
    setAvailableSubCategories([]);
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category: value,
      subCategory: ''
    }));

    const subCategories = categoryData.subCategories[value] || [];
    setAvailableSubCategories(subCategories);
  };

  // Handle subcategory selection
  const handleSubCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subCategory: value
    }));
  };

  // Handle form input changes
  const handleInputChange = (field: keyof RFQFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate unique RFQ ID
  const generateRFQId = () => {
    return `RFQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  // Handle RFQ form submission
  const handleSubmitRFQ = () => {
    try {
      const currentUser = MockUserAuth.getCurrentUser();

      if (!currentUser) {
        showSuccessToast({
          title: 'Authentication Required',
          message: 'Please log in to submit an RFQ.',
          duration: 4000
        });
        return;
      }

      // Validate required fields
      if (!formData.fullName || !formData.email || !formData.productName || !formData.quantity) {
        showSuccessToast({
          title: 'Missing Information',
          message: 'Please fill in all required fields.',
          duration: 4000
        });
        return;
      }

      // Get current product ID from URL if available
      const currentPath = window.location.pathname;
      const productId = currentPath.split('/').pop() || '';

      

      // Prepare user address from saved shipping address
      const userShippingKey = `shippingAddress_${currentUser.id}`;
      const savedAddress = localStorage.getItem(userShippingKey);
      let userAddress = null;

      if (savedAddress) {
        try {
          const parsedAddress = JSON.parse(savedAddress);
          userAddress = {
            firstName: parsedAddress.firstName || '',
            lastName: parsedAddress.lastName || '',
            email: parsedAddress.email || formData.email,
            phone: parsedAddress.phone || '',
            addressLine1: parsedAddress.addressLine1 || '',
            addressLine2: parsedAddress.addressLine2 || '',
            city: parsedAddress.city || selectedCity,
            state: parsedAddress.state || selectedState,
            zipCode: parsedAddress.zipCode || '',
            country: parsedAddress.country || 'India'
          };
        } catch (error) {
          console.error('Error parsing saved address:', error);
        }
      }

      // Get seller profile for better tracking
      let targetSellerId = '';
      try {
        const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
        const product = allProducts.find((p: any) => p.id === productId || p.slug === productId);
        targetSellerId = product?.seller_id || product?.seller_email || 'default_seller';
      } catch (error) {
        console.error('Error finding product seller:', error);
        targetSellerId = 'default_seller';
      }

      const sellerId = targetSellerId;
      const sellerProfile = localStorage.getItem(`seller_profile_${sellerId}`);
      let sellerInfo = null;
      if (sellerProfile) {
        try {
          const parsedProfile = JSON.parse(sellerProfile);
          sellerInfo = {
            sellerName: parsedProfile.sellerName,
            businessName: parsedProfile.businessName,
            email: parsedProfile.email
          };
        } catch (error) {
          console.error('Error parsing seller profile:', error);
        }
      }

      // Create RFQ object with required fields
      const rfqData = {
        rfqId: generateRFQId(),
        requestedBy: currentUser.id,
        requestedByEmail: formData.email,
        targetSellerId: targetSellerId,
        sellerInfo: sellerInfo,
        productDetails: {
          productId: productId,
          productName: formData.productName,
          productDescription: formData.productDescription,
          budgetRange: formData.budgetRange
        },
        mainCategory: formData.mainCategory,
        category: formData.category,
        subCategory: formData.subCategory,
        quantity: parseInt(formData.quantity),
        userAddress: userAddress,
        status: 'Pending',
        timestamp: new Date().toISOString(),
        userInfo: {
          fullName: formData.fullName,
          email: formData.email,
          userId: currentUser.id
        },
        sellerResponse: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Get existing RFQs from localStorage
      const existingRFQs = JSON.parse(localStorage.getItem('rfqs') || '[]');

      // Add new RFQ
      existingRFQs.push(rfqData);

      // Save back to localStorage
      localStorage.setItem('rfqs', JSON.stringify(existingRFQs));

      // Dispatch event for any listeners
      window.dispatchEvent(new CustomEvent('rfqSubmitted', { 
        detail: rfqData 
      }));

      // Show success toast
      showSuccessToast({
        title: 'RFQ Submitted Successfully!',
        message: 'We will get back to you within 24 hours.',
        duration: 5000
      });

      // Reset form and close modals
      setFormData({
        fullName: '',
        email: '',
        productName: '',
        productDescription: '',
        quantity: '',
        budgetRange: '',
        mainCategory: '',
        category: '',
        subCategory: ''
      });
      setAvailableCategories([]);
      setAvailableSubCategories([]);
      setShowQuoteForm(false);
      setShowModal(false);

    } catch (error) {
      console.error('Error submitting RFQ:', error);
      showSuccessToast({
        title: 'Submission Failed',
        message: 'Error submitting RFQ. Please try again.',
        duration: 4000
      });
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center text-white font-semibold px-3 py-1 rounded-md hover:bg-yellow-500 transition-colors text-sm mr-2 border"
        style={{
          minWidth: 140,
          backgroundColor: "#facc15", // yellow-400
          borderColor: "#facc15",
        }}
      >
        <div
          className="flex items-center justify-center rounded-full w-6 h-6 mr-2"
          style={{ backgroundColor: "#facc15" }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="white"
            viewBox="0 0 24 24"
          >
            <rect x="3" y="8" width="18" height="13" rx="2" />
            <path d="M16 3v5M8 3v5M3 13h18" />
          </svg>
        </div>
        Submit RFQ
      </button>

      {showModal && !showQuoteForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Reduced width popup with improved colors */}
          <div 
            className="relative rounded-xl shadow-2xl overflow-hidden w-full bg-white"
            style={{
              maxWidth: '320px',
              minHeight: '240px',
            }}
          >
            {/* Floating particles effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${2 + Math.random() * 3}px`,
                    height: `${2 + Math.random() * 3}px`,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1 + Math.random() * 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-black transition-colors z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Shopping cart icon */}
            <div className="flex justify-center pt-6 pb-3">
              <div className="relative">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-white rounded-full blur-lg opacity-50 scale-150"></div>
                <div className="relative bg-black bg-opacity-25 backdrop-blur-sm rounded-full p-3 border border-white border-opacity-30">
                  <svg 
                    className="w-8 h-8 text-black drop-shadow-lg" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M17,18C15.89,18 15,18.89 15,20A2,2 0 0,0 17,22A2,2 0 0,0 19,20C19,18.89 18.1,18 17,18M1,2V4H3L6.6,11.59L5.24,14.04C5.09,14.32 5,14.65 5,15A2,2 0 0,0 7,17H19V15H7.42A0.25,0.25 0 0,1 7.17,14.75C7.17,14.7 7.18,14.66 7.2,14.63L8.1,13H15.55C16.3,13 16.96,12.58 17.3,11.97L20.88,5H5.21L4.27,3H1M7,18C5.89,18 5,18.89 5,20A2,2 0 0,0 7,22A2,2 0 0,0 9,20C9,18.89 8.1,18 7,18Z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="text-center px-4 pb-4">
              <h1 className="text-xl font-bold text-black mb-2 drop-shadow-lg">
                Need a quote?
              </h1>

              <p className="text-black text-base mb-4 drop-shadow-sm font-medium opacity-95">
                Our RFQ system has you covered!
              </p>

              <button
                onClick={() => setShowQuoteForm(true)}
                className="w-full max-w-xs bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Get Your Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {showQuoteForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Modern card-based quote form */}
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl relative">
              <button
                onClick={() => {
                  setShowQuoteForm(false);
                  setShowModal(false);
                }}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-2xl font-bold text-center mb-1">Get Quotation Now</h2>
              <p className="text-orange-100 text-center text-sm">Tell us about your requirements</p>
            </div>

            {/* Form - scrollable content */}
            <div className="flex-1 overflow-y-auto p-6">
              <form className="space-y-6">
                {/* Contact Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Your Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Product Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Product Details
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter the product name"
                        value={formData.productName}
                        onChange={(e) => handleInputChange('productName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Product Description
                      </label>
                      <textarea
                        placeholder="Describe your requirements in detail..."
                        rows={4}
                        value={formData.productDescription}
                        onChange={(e) => handleInputChange('productDescription', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none transition-all duration-200 text-base"
                      />
                      <p className="text-sm text-gray-500 mt-1">Help us understand your specific needs</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          placeholder="Min. quantity"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange('quantity', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-base font-medium text-gray-700 mb-2">
                          Budget Range
                        </label>
                        <input
                          type="text"
                          placeholder="₹10 - ₹1000"
                          value={formData.budgetRange}
                          onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Main Category
                      </label>
                      <select 
                        value={formData.mainCategory}
                        onChange={(e) => handleMainCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white transition-all duration-200 text-base"
                      >
                        <option value="">Select Main Category</option>
                        {categoryData.mainCategories.map(mainCat => (
                          <option key={mainCat} value={mainCat}>{mainCat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select 
                        value={formData.category}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        disabled={!formData.mainCategory || availableCategories.length === 0}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white transition-all duration-200 text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Category</option>
                        {availableCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-2">
                        Sub Category
                      </label>
                      <select 
                        value={formData.subCategory}
                        onChange={(e) => handleSubCategoryChange(e.target.value)}
                        disabled={!formData.category || availableSubCategories.length === 0}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white transition-all duration-200 text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Sub Category</option>
                        {availableSubCategories.map(subCat => (
                          <option key={subCat} value={subCat}>{subCat}</option>
                        ))}
                      </select>
                    </div>

                    <div 
                      className="flex items-center text-orange-600 hover:text-orange-700 cursor-pointer transition-colors p-3 bg-orange-50 rounded-lg border border-orange-200"
                      onClick={handleShippingAddressClick}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span className="text-base font-medium">Add Shipping Address</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Submit button - fixed at bottom */}
            <div className="p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleSubmitRFQ}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-lg"
              >
                Submit Quotation Request
              </button>
              <p className="text-center text-sm text-gray-500 mt-3">
                We'll get back to you within 24 hours
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Address Modal */}
      {showShippingModal && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-white p-6 border-b border-gray-200 rounded-t-2xl">
              {/* Top row with Shipping Address and Cancel button */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-semibold text-gray-900">Shipping Address</h1>
                <button
                  onClick={handleCancelShippingAddress}
                  className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Second row with back button and Add New Address */}
              <div className="flex items-center">
                <button
                  onClick={handleCancelShippingAddress}
                  className="text-orange-600 hover:text-orange-700 transition-colors mr-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m11 17-5-5m0 0 5-5m-5 5h12" />
                  </svg>
                </button>

                <h4 className="text-lg font-semibold text-orange-600">Add New Address</h4>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Address Lines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Address Line 1<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Street address, apartment, suite, etc."
                      value={shippingAddress.addressLine1}
                      onChange={(e) => handleShippingAddressChange('addressLine1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      placeholder="Landmark, building name (optional)"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => handleShippingAddressChange('addressLine2', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                    />
                  </div>
                </div>

                {/* Country and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Country<span className="text-red-500">*</span>
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white transition-all duration-200 text-base">
                      <option>Select Country</option>
                      <option>India</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      State<span className="text-red-500">*</span>
                    </label>
                    <select 
                            value={selectedState}
                            onChange={(e) => handleStateChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                          >
                            <option value="">Select State</option>
                            {availableStates.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                  </div>
                </div>

                {/* City and Zip Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      City<span className="text-red-500">*</span>
                    </label>
                     <select 
                            value={selectedCity}
                            onChange={(e) => handleCityChange(e.target.value)}
                            disabled={!selectedState}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base ${
                              !selectedState ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="">
                              {selectedState ? 'Select City' : 'First select a state'}
                            </option>
                            {availableCities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-2">
                      Zip Code<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter postal code"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleShippingAddressChange('zipCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                    />
                  </div>
                </div>

                {/* Billing Address Checkbox */}
                <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="billingAddress"
                    checked={isBillingAddress}
                    onChange={(e) => setIsBillingAddress(e.target.checked)}
                    className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2 mt-0.5"
                  />
                  <label htmlFor="billingAddress" className="text-base text-gray-700">
                    Use this address as my billing address
                  </label>
                </div>

                {/* Conditional Billing Address Section */}
                {!isBillingAddress && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Billing Address
                    </h3>
                    <div className="space-y-4">
                      {/* Billing Address Lines */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-2">
                            Address Line 1<span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Street address, apartment, suite, etc."
                            value={billingAddress.addressLine1}
                            onChange={(e) => handleBillingAddressChange('addressLine1', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-2">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            placeholder="Landmark, building name (optional)"
                            value={billingAddress.addressLine2}
                            onChange={(e) => handleBillingAddressChange('addressLine2', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                          />
                        </div>
                      </div>

                      {/* Billing Country and State */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-2">
                            Country<span className="text-red-500">*</span>
                          </label>
                          <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white transition-all duration-200 text-base">
                            <option>Select Country</option>
                            <option>India</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-2">
                            State<span className="text-red-500">*</span>
                          </label>
                          <select 
                            value={billingSelectedState}
                            onChange={(e) => handleBillingStateChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                          >
                            <option value="">Select State</option>
                            {availableStates.map((state) => (
                              <option key={state} value={state}>
                                {state}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Billing City and Zip Code */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-2">
                            City<span className="text-red-500">*</span>
                          </label>
                          <select 
                            value={billingSelectedCity}
                            onChange={(e) => handleBillingCityChange(e.target.value)}
                            disabled={!billingSelectedState}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base ${
                              !billingSelectedState ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          >
                            <option value="">
                              {billingSelectedState ? 'Select City' : 'First select a state'}
                            </option>
                            {billingAvailableCities.map((city) => (
                              <option key={city} value={city}>
                                {city}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-2">
                            Zip Code<span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Enter postal code"
                            value={billingAddress.zipCode}
                            onChange={(e) => handleBillingAddressChange('zipCode', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200 text-base"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleCancelShippingAddress}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveShippingAddress}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmitRFQButton;