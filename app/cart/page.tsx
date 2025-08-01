"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { LocalStorageManager } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useUnifiedToast } from "@/hooks/use-unified-toast";
import { Trash2, Plus, Minus, ShoppingBag, X, MapPin, Tag, Heart } from "lucide-react";
import React from "react";
import AddressManager from "@/components/AddressManager";
import AddressSelectorModal from "@/components/AddressSelectorModal";

interface CartItemWithProduct {
  id: number;
  productId: number;
  quantity: number;
  weight?: string;
  color?: string;
  product: {
    id: number;
    name: string;
    brand: string;
    imageUrl?: string;
    originalPrice: string;
    salePrice?: string;
  };
}

export default function CartPage() {
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddressSelectorOpen, setIsAddressSelectorOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
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
    }
  }, []);

  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();
  const { showSuccessToast } = useUnifiedToast();

  // Function to get actual stock status from seller products
  const getProductStockStatus = (productId: number) => {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const product = allProducts.find((p: any) => p.id === productId || p.id === productId.toString());

      if (!product) {
        return { inStock: true, stock: 10 }; // Default to in stock if product not found
      }

      // Check multiple stock indicators
      const isOutOfStock = product.outOfStock === true || 
                          product.stock === 0 || 
                          product.stock_quantity === 0 ||
                          product.inStock === false;

      return {
        inStock: !isOutOfStock,
        stock: product.stock || product.stock_quantity || 0,
        outOfStock: isOutOfStock
      };
    } catch (error) {
      console.error('Error checking product stock:', error);
      return { inStock: true, stock: 10 }; // Default to in stock on error
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (typeof window === "undefined") return;

    const loadCartItems = () => {
      const cart = LocalStorageManager.getCart();

      const validCartItems = cart.filter((item: any) => {
        return item && item.product && typeof item.product === 'object' && 
               item.product.name && item.product.originalPrice;
      });

      // Update cart items with current stock status
      const cartItemsWithStock = validCartItems.map((item: any) => {
        const stockStatus = getProductStockStatus(item.productId);
        return {
          ...item,
          product: {
            ...item.product,
            inStock: stockStatus.inStock,
            outOfStock: stockStatus.outOfStock,
            stock: stockStatus.stock
          }
        };
      });

      if (validCartItems.length !== cart.length) {
        LocalStorageManager.setCart(cartItemsWithStock);
      }

      setCartItems(cartItemsWithStock);
      setIsLoading(false);
    };

    loadCartItems();

    const handleCartUpdate = () => {
      loadCartItems();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    // Listen for product updates from seller
    const handleProductsUpdate = () => {
      loadCartItems(); // Reload cart items with updated stock status
    };

    window.addEventListener('productsUpdated', handleProductsUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('productsUpdated', handleProductsUpdate);
    };
  }, [isMounted]);

  const handleWeightChange = (productId: number, newWeight: string) => {
    const updatedCart = cartItems.map(item => {
      if (item.productId === productId) {
        const newPrice = getPriceForWeight(item.product, newWeight);
        return {
          ...item,
          weight: newWeight,
          product: {
            ...item.product,
            salePrice: newPrice.toString(),
          }
        };
      }
      return item;
    });
    LocalStorageManager.setCart(updatedCart);
    setCartItems(updatedCart);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );

    LocalStorageManager.setCart(updatedCart);
    setCartItems(updatedCart);

    window.dispatchEvent(new CustomEvent('cartUpdated'));

    toast({
      title: "Cart Updated",
      description: "Product quantity updated successfully.",
    });
  };

  const removeFromCart = (productId: number) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    LocalStorageManager.setCart(updatedCart);
    setCartItems(updatedCart);

    window.dispatchEvent(new CustomEvent('cartUpdated'));

    showSuccessToast({
      title: "Item Removed",
      message: "The item has been removed from your cart successfully.",
    });
  };

  // Helper to recalculate price based on weight
  const getPriceForWeight = (product: any, weight: string) => {
    const basePrice = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.originalPrice || product.price || "0");
    if (weight === "500g") {
      return Math.ceil((basePrice / 2) * 1.05);
    } else if (weight === "250g") {
      return Math.ceil((basePrice / 4) * 1.08);
    }
    return basePrice;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const product = item.product || {};
      const currentPrice = getPriceForWeight(product, item.weight || "1kg");
      return total + (currentPrice * item.quantity);
    }, 0);
  };

  const calculateDiscount = () => {
    return cartItems.reduce((discount, item) => {
      const product = item.product || {};
      const originalPrice = parseFloat(product.originalPrice || "0");
      const salePrice = getPriceForWeight(product, item.weight || "1kg");
      if (salePrice < originalPrice) {
        return discount + ((originalPrice - salePrice) * item.quantity);
      }
      return discount;
    }, 0);
  };

  const shippingCharges = 99;
  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const total = subtotal + shippingCharges;

  // Check if any cart items are out of stock (only when stock is explicitly 0)
  const hasOutOfStockItems = cartItems.some(item => {
    const stockStatus = getProductStockStatus(item.productId);
    return stockStatus.stock === 0;
  });

  const handleContinueShopping = () => {
    router.push("/products");
  };

  const handleCheckout = () => {
    if (hasOutOfStockItems) {
      showSuccessToast({
        title: "Cannot Place Order",
        message: "Some items in your cart are out of stock. Please remove them to continue.",
      });
      return;
    }
    router.push('/checkout');
  };

  const handleSaveForLater = (item: CartItemWithProduct) => {
    // Remove from cart
    const updatedCart = cartItems.filter(cartItem => cartItem.id !== item.id);
    LocalStorageManager.setCart(updatedCart);
    setCartItems(updatedCart);

    // Add to wishlist
    const wishlist = LocalStorageManager.getWishlist();
    const wishlistProduct = {
      id: item.productId,
      name: item.product.name,
      price: parseFloat(item.product.salePrice || item.product.originalPrice || "0"),
      image_url: item.product.imageUrl,
      originalPrice: parseFloat(item.product.originalPrice || "0"),
      salePrice: item.product.salePrice,
    };

    // Check if already in wishlist
    const isAlreadyInWishlist = wishlist.some((wishlistItem: any) => wishlistItem.id === item.productId);

    if (!isAlreadyInWishlist) {
      LocalStorageManager.setWishlist([...wishlist, wishlistProduct]);
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    }

    // Dispatch cart update event
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    // Show success toast
    showSuccessToast({
      title: "Saved for Later",
      message: "Product has been moved to your wishlist successfully.",
    });
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-medium text-gray-900 mb-2">Your cart is empty!</h1>
            <p className="text-gray-500 mb-6">Add items to it now.</p>
            <Button 
              onClick={handleContinueShopping} 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
            >
              Shop now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleRemoveFromCart = (itemId: number) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    LocalStorageManager.setCart(updatedCart);
    setCartItems(updatedCart);
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    // Show remove from cart toast
    if (itemToRemove) {
      showSuccessToast({
        title: "Removed from Cart",
        message: "Product has been removed from your cart successfully.",
        product: {
          id: itemToRemove.productId.toString(),
          name: itemToRemove.product.name,
          image: itemToRemove.product.imageUrl,
          price: parseFloat(itemToRemove.product.salePrice || itemToRemove.product.originalPrice || "0"),
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium text-gray-900">My Cart ({cartItems.length})</h1>
            <Button 
              variant="ghost" 
              onClick={handleContinueShopping}
              className="text-sm font-medium"
              style={{ color: '#16A34A' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#15803D';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#16A34A';
              }}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Cart Items */}
          <div className="flex-1">
            <div className="space-y-4">
              {cartItems.map((item, index) => {
                const product = item.product || {};
                const currentPrice = getPriceForWeight(product, item.weight || "1kg");
                const originalPrice = parseFloat(product.originalPrice || "0");
                const hasDiscount = currentPrice < originalPrice;
                const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-sm shadow-sm">
                    <div className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 sm:w-20 w-full">
                          <button
                            onClick={() => router.push(`/product/${item.productId}`)}
                            className="hover:opacity-80 transition-opacity cursor-pointer w-full"
                          >
                            <img
                              src={product.imageUrl || '/placeholder.png'}
                              alt={product.name || 'Product'}
                              className="sm:w-20 sm:h-24 w-full h-48 object-cover rounded border border-gray-200"
                            />
                          </button>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="text-sm md:text-base font-medium text-gray-900 line-clamp-2 mb-1">
                                {product.name || 'Unknown Product'}
                              </h3>
                              <p className="text-xs md:text-sm text-gray-500 mb-2">
                                {product.brand || 'Unknown Brand'}
                              </p>

                              {/* Weight Selector */}
                              <div className="flex items-center gap-3 md:gap-4 mb-3">
                              
                                <p>{item.weight}</p>
                                <span className="ml-2 text-gray-600 text-xs">Weight</span>
                              </div>

                              {/* Price */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="font-semibold text-lg text-orange-600">
                                  ₹{getPriceForWeight(product, item.weight || "1kg") * item.quantity}
                                </span>
                                {hasDiscount && (
                                  <>
                                    <span className="text-sm text-gray-500 line-through">
                                      ₹{originalPrice.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-green-600 font-medium">
                                      {discountPercent}% off
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Out of Stock Warning - Check real-time stock */}
                              {(() => {
                                const stockStatus = getProductStockStatus(item.productId);
                                return (stockStatus.outOfStock || stockStatus.stock === 0 || !stockStatus.inStock) && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-red-100 text-red-800 px-2 py-1 text-xs font-medium rounded">
                                      OUT OF STOCK
                                    </span>
                                    <span className="text-xs text-red-600">
                                      This item is currently unavailable
                                    </span>
                                  </div>
                                );
                              })()}

                              {/* Delivery Info */}
                              <p className="text-xs md:text-sm text-gray-600 mb-3">
                                Delivery by <span className="font-medium">Mon Dec 30</span> | 
                                <span className="text-green-600 ml-1">Free</span>
                              </p>
                            </div>

                            {/* Remove Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.productId)}
                              className="text-gray-400 hover:text-gray-600 p-1"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Quantity and Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Quantity Selector */}
                              <div className="flex items-center border border-gray-300 rounded">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-12 text-center text-sm font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Save for Later and Remove */}
                            <div className="flex items-center gap-3 sm:gap-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveForLater(item)}
                                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium"
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                SAVE FOR LATER
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromCart(item.productId)}
                                className="text-xs sm:text-sm text-gray-600 hover:text-gray-800 font-medium"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                REMOVE
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Separator for last item */}
                    {index < cartItems.length - 1 && (
                      <div className="border-t border-gray-100"></div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Place Order Button - Mobile */}
            <div className="lg:hidden mt-6">
              <div className="bg-white border border-gray-200 rounded-sm p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <span className="text-lg font-semibold">₹{total.toLocaleString()}</span>
                  <Button 
                    onClick={handleCheckout}
                    disabled={hasOutOfStockItems}
                    className={`w-full sm:w-auto px-8 py-3 ${
                      hasOutOfStockItems 
                        ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {hasOutOfStockItems ? 'REMOVE OUT OF STOCK ITEMS' : 'PLACE ORDER'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Price Details */}
          <div className="lg:w-80 md:w-2/5">
            <div className="sticky top-24">
              {/* Delivery Address */}
              {selectedAddress ? (
                <div className="bg-white border border-gray-200 rounded-sm mb-4">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                        Deliver to:
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsAddressSelectorOpen(true)}
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                      >
                        Change
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">
                        {selectedAddress.firstName} {selectedAddress.lastName}
                      </p>
                      <p>{selectedAddress.address}</p>
                      {selectedAddress.landmark && <p>{selectedAddress.landmark}</p>}
                      <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                      <p className="mt-1">Phone: {selectedAddress.phone}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-sm mb-4">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                        Delivery Address:
                      </h3>
                    </div>
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-3">No delivery address selected</p>
                      <Button 
                        onClick={() => setIsAddressSelectorOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm"
                      >
                        Add Address
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Details */}
              <div className="bg-white border border-gray-200 rounded-sm">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    PRICE DETAILS ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total MRP</span>
                      <span className="text-gray-900">₹{(subtotal + discount).toLocaleString()}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount on MRP</span>
                        <span className="text-green-600">-₹{discount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Coupon Discount</span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium p-0 h-auto"
                      >
                        Apply Coupon
                      </Button>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <div className="text-right">
                        {shippingCharges > 0 ? (
                          <>
                            <span className="line-through text-gray-500">₹{shippingCharges}</span>
                            <span className="text-green-600 ml-2">Free</span>
                          </>
                        ) : (
                          <span className="text-green-600">Free</span>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total Amount</span>
                        <span className="font-semibold text-gray-900 text-lg">₹{subtotal.toLocaleString()}</span>
                      </div>
                    </div>

                    {discount > 0 && (
                      <div className="text-green-600 text-sm font-medium">
                        You will save ₹{discount.toLocaleString()} on this order
                      </div>
                    )}
                  </div>
                </div>

                {/* Place Order Button - Desktop */}
                <div className="hidden lg:block p-4 border-t border-gray-200">
                  <Button 
                    onClick={handleCheckout}
                    disabled={hasOutOfStockItems}
                    className={`w-full py-3 text-sm font-medium ${
                      hasOutOfStockItems 
                        ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white'
                    }`}
                  >
                    {hasOutOfStockItems ? 'REMOVE OUT OF STOCK ITEMS' : 'PLACE ORDER'}
                  </Button>
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
    </div>
  );
}