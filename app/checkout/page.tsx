"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LocalStorageManager } from "@/lib/mock-data";
import { useUnifiedToast } from "@/hooks/use-unified-toast";
import { MockUserAuth } from "@/lib/user-auth";
import { 
  CreditCard, 
  Banknote, 
  Landmark, 
  Smartphone, 
  Wallet, 
  Home, 
  Phone, 
  ShieldCheck, 
  BadgeCheck,
  MapPin,
  Edit,
  ArrowLeft,
  Lock,
  CheckCircle
} from "lucide-react";
import AddressSelectorModal from "@/components/AddressSelectorModal";
import SignInModal from "@/components/SignInModal";
import SignUpModal from "@/components/SignUpModal";

interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
  product: {
    id: number;
    name: string;
    brand: string;
    imageUrl: string;
    originalPrice: string;
    salePrice?: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { showSuccessToast } = useUnifiedToast();

  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddressSelectorOpen, setIsAddressSelectorOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("creditcard");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [checkoutState, setCheckoutState] = useState<any>(null);

  // Card form state
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolderName: "",
    saveCard: false
  });

  useEffect(() => {
    // Load cart items
    const cart = LocalStorageManager.getCart();
    const validCartItems = cart.filter((item: any) => {
      return item && item.product && typeof item.product === 'object' && 
             item.product.name && item.product.originalPrice;
    });
    setCartItems(validCartItems);

    // Load selected address
    const savedSelectedAddress = LocalStorageManager.getSelectedDeliveryAddress();
    if (savedSelectedAddress) {
      setSelectedAddress(savedSelectedAddress);
    } else {
      const defaultAddress = LocalStorageManager.getDefaultAddress();
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        LocalStorageManager.setSelectedDeliveryAddress(defaultAddress);
      }
    }
  }, []);

  // Separate useEffect for authentication check
  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = MockUserAuth.isLoggedIn();
      const user = MockUserAuth.getCurrentUser();
      setIsLoggedIn(loggedIn);
      setCurrentUser(user);
      
      // If not logged in, save checkout state and show login modal
      if (!loggedIn || !user) {
        const currentCheckoutState = {
          selectedPaymentMethod,
          cardForm,
          selectedAddress
        };
        localStorage.setItem('checkoutState', JSON.stringify(currentCheckoutState));
        setCheckoutState(currentCheckoutState);
        setIsSignInModalOpen(true);
      }
    };

    checkAuthStatus();

    // Listen for authentication changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleAuthChange);
    return () => window.removeEventListener('storage', handleAuthChange);
  }, []); // Remove dependencies that cause infinite loop

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const product = item.product || {};
      const price = parseFloat(product.salePrice || product.originalPrice || "0");
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    return cartItems.reduce((discount, item) => {
      const product = item.product || {};
      const originalPrice = parseFloat(product.originalPrice || "0");
      const salePrice = parseFloat(product.salePrice || product.originalPrice || "0");
      if (product.salePrice && salePrice < originalPrice) {
        return discount + ((originalPrice - salePrice) * item.quantity);
      }
      return discount;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const shippingCharges = 0; // Free shipping
  const total = subtotal;

  const paymentMethods = [
    { id: "creditcard", label: "Credit Card", icon: CreditCard },
    { id: "debitcard", label: "Debit Card", icon: Banknote },
    { id: "emi", label: "EMI", icon: Landmark },
    { id: "upi", label: "UPI", icon: Smartphone },
    { id: "netbanking", label: "Net Banking", icon: Wallet },
    { id: "cod", label: "Cash on Delivery", icon: Home }
  ];

  const handleCardFormChange = (field: string, value: string | boolean) => {
    setCardForm(prev => ({ ...prev, [field]: value }));
  };

  // Restore checkout state after successful login
  useEffect(() => {
    if (isLoggedIn && currentUser && checkoutState) {
      // Restore saved checkout state
      const savedState = localStorage.getItem('checkoutState');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          if (parsedState.selectedPaymentMethod) {
            setSelectedPaymentMethod(parsedState.selectedPaymentMethod);
          }
          if (parsedState.cardForm) {
            setCardForm(parsedState.cardForm);
          }
          if (parsedState.selectedAddress) {
            setSelectedAddress(parsedState.selectedAddress);
          }
          // Clear saved state
          localStorage.removeItem('checkoutState');
          setCheckoutState(null);
        } catch (error) {
          console.error('Error restoring checkout state:', error);
        }
      }
    }
  }, [isLoggedIn, currentUser]); // Remove checkoutState from dependencies

  const handlePlaceOrder = async () => {
    // Check if user is logged in
    if (!isLoggedIn || !currentUser) {
      showSuccessToast({
        title: "Login Required",
        message: "Please log in to place your order.",
      });
      setIsSignInModalOpen(true);
      return;
    }

    if (!selectedAddress) {
      showSuccessToast({
        title: "Address Required",
        message: "Please select a delivery address to continue.",
      });
      return;
    }

    // Validate stock from seller/products in localStorage at order placement
    const outOfStockItems: any[] = [];
    
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      
      cartItems.forEach(item => {
        const sellerProduct = allProducts.find((p: any) => 
          p.id === item.productId || p.id === item.productId.toString()
        );
        
        if (sellerProduct && sellerProduct.stock === 0) {
          outOfStockItems.push({
            ...item,
            productName: item.product?.name || 'Unknown Product'
          });
        }
      });
      
      if (outOfStockItems.length > 0) {
        const productNames = outOfStockItems.map(item => item.productName).join(', ');
        showSuccessToast({
          title: "Items Out of Stock",
          message: `The following items are out of stock: ${productNames}. Please remove them from your cart.`,
        });
        return;
      }
    } catch (error) {
      console.error('Error validating stock:', error);
      showSuccessToast({
        title: "Stock Validation Error",
        message: "Unable to validate stock. Please try again.",
      });
      return;
    }

    setIsProcessingPayment(true);

    // Simulate payment processing
    setTimeout(() => {
      // User is already verified to be logged in

      // Create order object with status
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const orderDate = new Date().toISOString();
      
      const newOrder = {
        id: orderId,
        user_id: currentUser.id,
        total_amount: total,
        status: "Order Placed",
        order_date: orderDate,
        delivery_date: null,
        delivery_address: selectedAddress,
        payment_method: selectedPaymentMethod,
        orderedBy: {
          id: currentUser.id,
          name: currentUser.name || 'Customer',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: selectedAddress
        },
        customer_name: currentUser.name || 'Customer',
        customer_email: currentUser.email || '',
        customer_phone: currentUser.phone || '',
        items: cartItems.map(item => ({
          product_id: item.productId.toString(),
          product_name: item.product?.name || 'Unknown Product',
          product_image: item.product?.imageUrl || '/placeholder-image.jpg',
          quantity: item.quantity,
          price: parseFloat(item.product?.salePrice || item.product?.originalPrice || "0"),
          size: item.size,
          color: item.color
        }))
      };

      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
      existingOrders.push(newOrder);
      localStorage.setItem('user_orders', JSON.stringify(existingOrders));

      // Clear cart
      LocalStorageManager.setCart([]);
      window.dispatchEvent(new CustomEvent('cartUpdated'));

      setIsProcessingPayment(false);
      setOrderPlaced(true);

      // Show success message and redirect after delay
      setTimeout(() => {
        showSuccessToast({
          title: "Order Placed Successfully!",
          message: "Thank you for your order. You will receive a confirmation email shortly.",
        });
        router.push('/orders');
      }, 2000);
    }, 3000);
  };

  const handleSignInSuccess = () => {
    setIsSignInModalOpen(false);
    // Authentication state will be updated via the useEffect listener
    showSuccessToast({
      title: "Welcome back!",
      message: "You can now complete your order.",
    });
  };

  const handleSwitchToSignUp = () => {
    setIsSignInModalOpen(false);
    setIsSignUpModalOpen(true);
  };

  const handleSwitchToSignIn = () => {
    setIsSignUpModalOpen(false);
    setIsSignInModalOpen(true);
  };

  if (cartItems.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-medium text-gray-900 mb-4">Your cart is empty!</h1>
            <Button 
              onClick={() => router.push("/products")} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">Thank you for your order. Redirecting you to home page...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div className="flex flex-col items-start">
                <div className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-deep-black">
                  <span className="text-orange-400">Indi</span><span className="text-green-600">Vendi</span>
                </div>
                <div className="text-xs font-medium tracking-widest uppercase text-orange-300">
                  SECURE CHECKOUT
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-green-600">
              <Lock className="h-4 w-4" />
              <span className="text-sm font-medium">100% Secure</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Payment Options */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h3>
              <div className="space-y-2">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border text-left transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Center Column - Payment Details */}
          <div className="flex-1 max-w-2xl">
            {selectedPaymentMethod === "creditcard" || selectedPaymentMethod === "debitcard" ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add {selectedPaymentMethod === "creditcard" ? "Credit" : "Debit"} Card
                </h3>

                <div className="flex items-center space-x-3 mb-6">
                  <img src="https://cdn.worldvectorlogo.com/logos/visa-2.svg" alt="Visa" className="h-6" />
                  <img src="https://cdn.worldvectorlogo.com/logos/mastercard-2.svg" alt="Mastercard" className="h-6" />
                  <img src="https://cdn.worldvectorlogo.com/logos/rupay.svg" alt="RuPay" className="h-6" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardForm.cardNumber}
                      onChange={(e) => handleCardFormChange("cardNumber", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      maxLength={19}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date (MM/YY)
                      </label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardForm.expiryDate}
                        onChange={(e) => handleCardFormChange("expiryDate", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        placeholder="123"
                        value={cardForm.cvv}
                        onChange={(e) => handleCardFormChange("cvv", e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        maxLength={4}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="Name as on card"
                      value={cardForm.cardHolderName}
                      onChange={(e) => handleCardFormChange("cardHolderName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={cardForm.saveCard}
                      onChange={(e) => handleCardFormChange("saveCard", e.target.checked)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                    />
                    <label htmlFor="saveCard" className="text-sm text-gray-700">
                      Save this card for future payments
                    </label>
                  </div>
                </div>
              </div>
            ) : selectedPaymentMethod === "upi" ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">UPI Payment</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ) : selectedPaymentMethod === "cod" ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash on Delivery</h3>
                <p className="text-gray-600 mb-4">
                  Pay when your order is delivered to your doorstep.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Please keep exact change ready for a smooth delivery experience.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}
                </h3>
                <p className="text-gray-600">
                  You will be redirected to complete your payment securely.
                </p>
              </div>
            )}

            {/* Place Order Button */}
            <Button
              onClick={handlePlaceOrder}
              disabled={isProcessingPayment || (!isLoggedIn && !isProcessingPayment)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessingPayment ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing Payment...</span>
                </div>
              ) : !isLoggedIn ? (
                "LOGIN TO PLACE ORDER"
              ) : !selectedAddress ? (
                "SELECT ADDRESS TO CONTINUE"
              ) : (
                `PLACE ORDER - ₹${total.toLocaleString()}`
              )}
            </Button>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-96">
            {/* Delivery Address */}
            {selectedAddress ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-orange-500" />
                    Delivery Address
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsAddressSelectorOpen(true)}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Change
                  </Button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {selectedAddress.firstName} {selectedAddress.lastName}
                  </p>
                  <p>{selectedAddress.address}</p>
                  {selectedAddress.landmark && <p>{selectedAddress.landmark}</p>}
                  <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                  <p>Phone: {selectedAddress.phone}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address</h3>
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-4">No delivery address selected</p>
                  <Button 
                    onClick={() => setIsAddressSelectorOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Add Address
                  </Button>
                </div>
              </div>
            )}

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h3>

              <div className="space-y-3 mb-4">
                {cartItems.map((item) => {
                  const product = item.product || {};
                  const currentPrice = parseFloat(product.salePrice || product.originalPrice || "0");

                  return (
                    <div key={item.id} className="flex items-center space-x-3 py-2">
                      <img
                        src={product.imageUrl || '/placeholder-image.jpg'}
                        alt={product.name || 'Product'}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name || 'Unknown Product'}
                        </p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{(currentPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">₹{(subtotal + discount).toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount</span>
                    <span className="text-green-600">-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600">FREE</span>
                </div>

                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {discount > 0 && (
                  <div className="text-green-600 text-sm font-medium">
                    You saved ₹{discount.toLocaleString()} on this order!
                  </div>
                )}
              </div>
            </div>

            {/* Security Features */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center">
                  <ShieldCheck className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-600">Secure Payments</span>
                </div>
                <div className="flex flex-col items-center">
                  <BadgeCheck className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-600">Genuine Products</span>
                </div>
                <div className="flex flex-col items-center">
                  <Phone className="h-8 w-8 text-gray-600 mb-2" />
                  <span className="text-xs text-gray-600">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Selector Modal */}
      <AddressSelectorModal
        open={isAddressSelectorOpen}
        onClose={() => setIsAddressSelectorOpen(false)}
        onSelect={(address) => {
          setSelectedAddress(address);
          setIsAddressSelectorOpen(false);
        }}
        selectedAddressId={selectedAddress?.id}
      />

      {/* Sign In Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
      />

      {/* Sign Up Modal */}
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
        onSwitchToSignIn={handleSwitchToSignIn}
      />
    </div>
  );
}