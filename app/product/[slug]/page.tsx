"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAddToCartToast } from "@/hooks/use-add-to-cart-toast";
import { useUnifiedToast } from "@/hooks/use-unified-toast";
import { LocalStorageManager, Product } from "@/lib/mock-data";
import { Heart, ArrowLeft, Share2, ShoppingCart, Plus, Minus, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import ProductInfoIcons from "./ProductInfoIcons";
import SubmitRFQButton from "./SubmitRFQButton";
import MessageVendorButton from "./MessageVendorButton";
import AddressSelectorModal from "@/components/AddressSelectorModal";
import { useProduct } from "@/hooks/use-product";
import Link from 'next/link';
import { useMainCategories } from "@/hooks/use-main-categories";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showAddToCartToast } = useAddToCartToast();
  const { showWishlistToast } = useUnifiedToast();
  const productId = params.slug as string;

  const { product, isLoading, isError } = useProduct(productId);

  const [selectedSize, setSelectedSize] = useState<string>("S");
  const [quantity, setQuantity] = useState(2); // Start with minimum order quantity
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeValue, setPincodeValue] = useState("110001");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isAddressSelectorOpen, setIsAddressSelectorOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSelectedAddress = LocalStorageManager.getSelectedDeliveryAddress();
      if (savedSelectedAddress) {
        setSelectedAddress(savedSelectedAddress);
        setPincodeValue(savedSelectedAddress.pincode);
      } else {
        const defaultAddress = LocalStorageManager.getDefaultAddress();
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
          setPincodeValue(defaultAddress.pincode);
          LocalStorageManager.setSelectedDeliveryAddress(defaultAddress);
        }
      }

      // Check if product is in wishlist
      if (product) {
        const wishlist = LocalStorageManager.getWishlist();
        const isInWishlist = wishlist.some((item: any) => item.id === product.id);
        setIsWishlisted(isInWishlist);
      }
    }
  }, [product]);

  const handlePincodeCheck = async () => {
    setIsCheckingPincode(true);
    setPincodeChecked(false);

    setTimeout(() => {
      setIsCheckingPincode(false);
      setPincodeChecked(true);
    }, 2000);
  };

  const handleBack = () => {
    router.back();
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 2) { // Minimum order is 2
      setQuantity(newQuantity);
    }
  };

  const handleShareClick = () => {
    setShowSharePopup(!showSharePopup);
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cart = LocalStorageManager.getCart();
    const existingItem = cart.find((item: any) => 
      item.productId === product.id && 
      item.size === selectedSize
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: Date.now(),
        productId: product.id,
        quantity,
        size: selectedSize,
        product: {
          id: product.id,
          name: product.name,
          brand: 'SOFIA',
          imageUrl: product?.image_url || '/placeholder.png',
          originalPrice: product.price,
          salePrice: product.on_offer ? (product.price * 0.9).toFixed(2) : product.price,
        }
      });
    }

    LocalStorageManager.setCart(cart);
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    showAddToCartToast({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || '/placeholder.png'
    });
  };

  const handleWishlistToggle = () => {
    if (!product) return;

    const wishlist = LocalStorageManager.getWishlist();
    const isCurrentlyWishlisted = wishlist.some((item: any) => item.id === product.id);

    if (isCurrentlyWishlisted) {
      const updatedWishlist = wishlist.filter((item: any) => item.id !== product.id);
      LocalStorageManager.setWishlist(updatedWishlist);
      setIsWishlisted(false);
      showWishlistToast({
        title: "Removed from Wishlist",
        message: "Product has been removed from your wishlist.",
        product: {
          id: product.id,
          name: product.name,
          image: product.image_url,
          price: parseFloat('0'),
        },
        actionLabel: "View Wishlist",
      });
    } else {
      const wishlistProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image_url || '/placeholder.png',
        originalPrice: product.price,
        salePrice: product.on_offer ? (product.price * 0.9).toFixed(2) : product.price.toString(),
      };
      LocalStorageManager.setWishlist([...wishlist, wishlistProduct]);
      setIsWishlisted(true);
      showWishlistToast({
        title: "Added to Wishlist!",
        message: "Product has been added to your wishlist successfully.",
        product: {
          id: product.id,
          name: product.name,
          image: product.image_url,
          price: parseFloat('0'),
        },
        actionLabel: "View Wishlist",
      });
    }

    // Dispatch wishlist update event
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-gray-200 aspect-square rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-semibold text-gray-900 mb-3">
            {isError ? "Failed to load product" : "Product not found"}
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            {isError 
              ? "There was an error loading the product details. Please try again."
              : "The product you're looking for doesn't exist or has been removed."
            }
          </p>
          <div className="space-x-3">
            <Button onClick={handleBack} variant="outline" size="sm" className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button onClick={() => router.push("/products")} size="sm" className="bg-orange-500 hover:bg-orange-600">
              View All Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate prices from actual product data
  const currentPrice = product.salePrice ? 
    parseFloat(product.salePrice.toString()) : 
    parseFloat(product.price?.toString() || '0');

  const originalPrice = product.originalPrice ? 
    parseFloat(product.originalPrice.toString()) : 
    (product.on_offer ? currentPrice * 1.2 : currentPrice); // If on offer but no original price, estimate

  const hasDiscount = originalPrice > currentPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  // Get the main product image for CSS transformations
  const getMainProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image_url || product.imageUrl || '/placeholder.png';
  };

  const mainProductImage = getMainProductImage(product);

  // Define view types and their CSS transformations
  const viewTypes = [
    { 
      id: 'front', 
      label: 'Front View', 
      transform: 'scale(1)', 
      filter: 'none',
      clipPath: 'none'
    },
    { 
      id: 'side', 
      label: 'Side View', 
      transform: 'scaleX(-1) skewY(-2deg)', 
      filter: 'brightness(0.95) contrast(1.05)',
      clipPath: 'none'
    },
    { 
      id: 'back', 
      label: 'Back View', 
      transform: 'scaleX(-1) rotateY(15deg)', 
      filter: 'brightness(0.75) contrast(0.9) saturate(0.8) blur(0.3px)',
      clipPath: 'none'
    },
    { 
      id: 'detail', 
      label: 'Detail View', 
      transform: 'scale(1.5)', 
      filter: 'brightness(1.1) contrast(1.2) saturate(1.1)',
      clipPath: 'circle(40% at 50% 40%)'
    }
  ];

  return (
    <div className="min-h-screen bg-white">


      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <DynamicBreadcrumb product={product} />

        {/* Main Product Layout - Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-2 gap-4 md:gap-6 bg-white">

          {/* Left Column - Images */}
          <div className="md:col-span-3 lg:col-span-1 h-[100px] md:h-[500px] lg:h-[600px] flex items-start justify-center">
            <div className="flex gap-2 md:gap-3 w-full h-full">
              {/* Thumbnail Images - Vertical on desktop/tablet, horizontal on mobile */}
              <div className="flex flex-row md:flex-col gap-2 md:gap-3 flex-shrink-0 md:w-auto w-full justify-center md:justify-start overflow-x-auto md:overflow-visible pb-2 md:pb-0 md:pr-1">
                {viewTypes.map((view, index) => {
                  return (
                    <button
                      key={`${view.id}-${index}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`group relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg border-2 transition-all duration-300 overflow-hidden flex-shrink-0 transform hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                        currentImageIndex === index 
                          ? 'border-orange-500 shadow-xl ring-2 ring-orange-300 scale-110 bg-gradient-to-br from-orange-50 to-orange-100' 
                          : 'border-gray-300 hover:border-orange-400 hover:shadow-lg bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-orange-50'
                      }`}
                      aria-label={`${view.label} - View ${index + 1} of ${product.name}`}
                      title={view.label}
                    >
                      {/* Active indicator overlay */}
                      {currentImageIndex === index && (
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/25 to-amber-500/15 z-10 rounded-lg"></div>
                      )}
                      
                      {/* Hover overlay with subtle gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/0 group-hover:from-orange-500/10 group-hover:to-amber-500/5 transition-all duration-300 z-10 rounded-lg"></div>
                      
                      {/* Loading placeholder */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg"></div>
                      
                      <div 
                        className="w-full h-full rounded-lg overflow-hidden relative z-20"
                        style={{
                          background: 'transparent'
                        }}
                      >
                        <img
                          src={mainProductImage}
                          alt={`${product.name} - ${view.label}`}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                          style={{
                            transform: view.transform,
                            filter: view.filter,
                            clipPath: view.clipPath,
                            transformOrigin: 'center center',
                            objectPosition: 'center',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.png';
                          }}
                          onLoad={(e) => {
                            // Hide loading placeholder once image loads
                            const placeholder = e.currentTarget.parentElement?.previousElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'none';
                          }}
                        />
                      </div>
                      
                      {/* Active indicator with view type */}
                      {currentImageIndex === index && (
                        <div className="absolute top-1 right-1 flex items-center gap-1 z-30">
                          <div className="w-2 h-2 bg-orange-500 rounded-full shadow-lg animate-pulse"></div>
                          <div className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium shadow-lg">
                            Active
                          </div>
                        </div>
                      )}
                      
                      {/* View type label on hover */}
                      <div className="absolute bottom-1 left-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-1 rounded-md font-medium z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 text-center transform translate-y-1 group-hover:translate-y-0">
                        {view.label}
                      </div>
                      
                      {/* Corner number indicator */}
                      <div className="absolute top-1 left-1 bg-white/90 text-gray-700 text-[10px] w-4 h-4 rounded-full font-bold z-30 flex items-center justify-center shadow-sm">
                        {index + 1}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Main Image */}
              <div className="flex-1 relative group h-full min-h-0">
                <div 
                  className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 cursor-zoom-in h-full rounded-lg shadow-sm border border-gray-200"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                >
                  {/* Loading placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg"></div>
                  
                  <div 
                    className="w-full h-full flex items-center justify-center p-4"
                    style={{
                      background: 'transparent'
                    }}
                  >
                    <img
                      key={`main-${currentImageIndex}`} // Force re-render for smooth transitions
                      src={mainProductImage}
                      alt={`${product.name} - ${viewTypes[currentImageIndex]?.label}`}
                      className={`max-w-full max-h-full object-contain transition-all duration-700 ease-out relative z-10 opacity-100 animate-in fade-in-50 duration-500`}
                      style={{
                        transform: `${viewTypes[currentImageIndex]?.transform} ${isZoomed ? 'scale(1.1)' : 'scale(1)'}`,
                        filter: viewTypes[currentImageIndex]?.filter,
                        clipPath: viewTypes[currentImageIndex]?.clipPath,
                        transformOrigin: 'center center',
                        transition: 'all 0.7s ease-out',
                        objectPosition: 'center'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.png';
                      }}
                      onLoad={(e) => {
                        // Hide loading placeholder once image loads
                        const placeholder = e.currentTarget.parentElement?.previousElementSibling as HTMLElement;
                        if (placeholder) placeholder.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Image Navigation */}
                  <button 
                    onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 disabled:opacity-0 disabled:cursor-not-allowed z-20 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    disabled={currentImageIndex === 0}
                    aria-label="Previous view"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex(Math.min(viewTypes.length - 1, currentImageIndex + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 disabled:opacity-0 disabled:cursor-not-allowed z-20 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    disabled={currentImageIndex === viewTypes.length - 1}
                    aria-label="Next view"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700" />
                  </button>

                  {/* Current view and image counter */}
                  <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 backdrop-blur-sm">
                    <div className="text-center">
                      <div className="text-orange-300 font-semibold">
                        {viewTypes[currentImageIndex]?.label}
                      </div>
                      <div className="text-gray-300 text-[10px] mt-0.5">
                        {currentImageIndex + 1} of {viewTypes.length}
                      </div>
                    </div>
                  </div>
                  
                  {/* Zoom indicator */}
                  {isZoomed && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium z-20 animate-pulse shadow-lg">
                      🔍 Zoomed In
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Information */}
          <div className="md:col-span-2 lg:col-span-1 h-auto lg:h-[600px] flex flex-col">
            <div className="flex-1 lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-gray-300 lg:scrollbar-track-gray-100 lg:pr-2">
              <div className="space-y-4">

                {/* Brand & Title */}
                <div className="space-y-1">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">SOFIA</div>
                  <h1 className="text-base md:text-lg font-medium text-gray-900 leading-snug">
                    {product.name}
                  </h1>
                  <p className="text-xs text-gray-500">
                    Sold by <span className="font-medium text-gray-700">SOFIA Dry Fruits</span>
                  </p>
                </div>

                {/* Price Section */}
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg md:text-xl font-semibold text-gray-900">₹{currentPrice}</span>
                    <span className="text-sm text-gray-500 line-through">₹{originalPrice}</span>
                    {hasDiscount && (
                      <span className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                        {discountPercentage}% OFF
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Minimum Order: <span className="font-medium text-gray-800">2 Pieces</span>
                  </div>

                 
                </div>

                {/* Size Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Size</h3>
                    <button
                      onClick={() => setShowSizeGuide(true)}
                      className="text-orange-500 hover:text-orange-600 text-xs font-medium transition-colors"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
                      const isDisabled = size === "L";
                      const isSelected = selectedSize === size;

                      return (
                        <button
                          key={size}
                          onClick={() => !isDisabled && setSelectedSize(size)}
                          disabled={isDisabled}
                          className={`px-3 py-2 md:py-1.5 border rounded text-sm font-medium transition-all duration-200 min-h-[44px] md:min-h-[32px] flex items-center justify-center min-w-[44px] md:min-w-[32px] ${
                            isDisabled
                              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                              : isSelected
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-gray-300 bg-white text-gray-700 hover:border-orange-300"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quantity Selection */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 2}
                        className="p-2 md:p-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] md:min-h-[32px] flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 py-2 md:py-1.5 min-w-[60px] md:min-w-[40px] text-center text-sm font-medium min-h-[44px] md:min-h-[32px] flex items-center justify-center">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-2 md:p-1.5 hover:bg-gray-50 transition-colors min-h-[44px] md:min-h-[32px] flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">pieces available</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 md:flex-auto bg-orange-500 hover:bg-orange-600 text-white py-3 md:py-2 px-4 md:px-3 rounded text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px] md:min-h-[36px]"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={handleWishlistToggle}
                      className="p-3 md:p-2 border border-gray-300 rounded hover:border-orange-300 transition-all duration-200 min-h-[44px] md:min-h-[36px] flex items-center justify-center"
                    >
                      <Heart 
                        className={`w-4 h-4 ${
                          isWishlisted ? 'fill-orange-500 text-orange-500' : 'text-gray-600'
                        }`} 
                      />
                    </button>
                    <div className="relative">
                      <button
                        onClick={handleShareClick}
                        className="p-3 md:p-2 border border-gray-300 rounded hover:border-orange-300 transition-all duration-200 min-h-[44px] md:min-h-[36px] flex items-center justify-center"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>

                      {/* Share Popup */}
                      {showSharePopup && (
                        <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded shadow-lg p-3 z-50 w-36">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Share Product</h4>
                          <div className="space-y-1">
                            <button className="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-xs transition-colors">
                              Copy Link
                            </button>
                            <button className="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-xs transition-colors">
                              WhatsApp
                            </button>
                            <button className="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-xs transition-colors">
                              Facebook
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* <div className="flex flex-col md:flex-row gap-2">
                    <SubmitRFQButton />
                    <MessageVendorButton />
                  </div> */}
                </div>

                {/* Delivery Address & Check */}
                <div className="border-t border-gray-200 pt-3 space-y-3">
                  {/* Selected Address Display */}
                  {selectedAddress && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                          Delivery Address
                        </h4>
                        <button
                          onClick={() => setIsAddressSelectorOpen(true)}
                          className="text-orange-500 hover:text-orange-600 text-xs font-medium"
                        >
                          Change
                        </button>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p className="font-medium text-gray-900">
                          {selectedAddress.firstName} {selectedAddress.lastName}
                        </p>
                        <p>{selectedAddress.address}</p>
                        <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                      </div>
                    </div>
                  )}

                  {/* Pincode Check */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      {selectedAddress ? 'Check Delivery for Different Area' : 'Check Delivery Options'}
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={pincodeValue}
                        onChange={(e) => setPincodeValue(e.target.value)}
                        placeholder="Enter pincode"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-orange-500 transition-colors"
                      />
                      <button
                        onClick={handlePincodeCheck}
                        disabled={isCheckingPincode}
                        className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition-colors disabled:opacity-70"
                      >
                        {isCheckingPincode ? 'Checking...' : 'Check'}
                      </button>
                    </div>

                    {!selectedAddress && (
                      <button
                        onClick={() => setIsAddressSelectorOpen(true)}
                        className="mt-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
                      >
                        Or select from saved addresses
                      </button>
                    )}

                    {pincodeChecked && !isCheckingPincode && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                        <div className="flex items-center gap-2 text-green-700">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Delivery available</span>
                        </div>
                        <p className="text-green-600 text-xs mt-1">Expected delivery: 5-7 business days</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Specifications */}
                <div className="border-t border-gray-200 pt-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Product Specifications</h3>
                  <div className="grid grid-cols-1 gap-1 text-xs">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Material</span>
                      <span className="font-medium">Premium Cotton Blend</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Color</span>
                      <span className="font-medium">{product.color || 'Scarlet Red'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Care</span>
                      <span className="font-medium">Dry Clean Only</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-gray-600">Origin</span>
                      <span className="font-medium">Handcrafted in India</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Product Information */}
        <div className="mt-4 md:mt-6 bg-white rounded border border-gray-200 overflow-hidden">
          <ProductInfoTabs />
        </div>
      </div>

      {/* Address Selector Modal */}
      <AddressSelectorModal
        open={isAddressSelectorOpen}
        onClose={() => setIsAddressSelectorOpen(false)}
        onSelect={(address) => {
          setSelectedAddress(address);
          setPincodeValue(address.pincode);
          setIsAddressSelectorOpen(false);
        }}
        selectedAddressId={selectedAddress?.id}
      />
    </div>
  );
}

// Dynamic Breadcrumb Component
function DynamicBreadcrumb({ product }: { product: Product }) {
  const { mainCategories } = useMainCategories();

  // Find the main category, category, and subcategory for this product
  const mainCategory = mainCategories.find(mc => 
    mc.category?.some((cat: any) => 
      cat.sub_category?.some((subcat: any) => subcat.id === product.subcategory_id)
    )
  );

  const category = mainCategory?.category?.find((cat: any) => 
    cat.sub_category?.some((subcat: any) => subcat.id === product.subcategory_id)
  );

  const subcategory = category?.sub_category?.find((subcat: any) => 
    subcat.id === product.subcategory_id
  );

  // Generate slugs for navigation
  const getSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and').replace(/[^a-z0-9-]/g, '');
  };

  const breadcrumbItems = [
    { name: 'Home', href: '/', isLast: false },
  ];

  if (mainCategory) {
    breadcrumbItems.push({
      name: mainCategory.name,
      href: `/products/${getSlug(mainCategory.name)}`,
      isLast: false
    });
  }

  if (category) {
    breadcrumbItems.push({
      name: category.name,
      href: `/products/${getSlug(mainCategory?.name || '')}/${getSlug(category.name)}`,
      isLast: false
    });
  }

  if (subcategory) {
    breadcrumbItems.push({
      name: subcategory.name,
      href: '',
      isLast: true
    });
  }

  return (
    <nav className="text-xs text-gray-500 mb-4 font-normal">
      {breadcrumbItems.map((item, index) => (
        <span key={index}>
          {item.isLast ? (
            <span className="text-gray-800">{item.name}</span>
          ) : (
            <Link 
              href={item.href}
              className="hover:text-orange-500 cursor-pointer transition-colors"
            >
              {item.name}
            </Link>
          )}
          {!item.isLast && <span className="mx-1">/</span>}
        </span>
      ))}
    </nav>
  );
}

// Product Information Tabs Component
function ProductInfoTabs() {
  const [activeTab, setActiveTab] = useState('style');

  const tabs = [
    { id: 'style', label: 'FEATURES' },
    { id: 'return', label: 'RETURN & REPLACEMENT POLICY' },
    { id: 'manufacturer', label: 'MANUFACTURER DETAILS' }
  ];

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-xs font-medium transition-all duration-200 border-b-2 ${
                activeTab === tab.id
                  ? 'text-orange-600 border-orange-500 bg-orange-50'
                  : 'text-gray-600 border-transparent hover:text-orange-500 hover:border-orange-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'style' && <StyleNoteContent />}
        {activeTab === 'return' && <ReturnPolicyContent />}
        {activeTab === 'manufacturer' && <ManufacturerContent />}
      </div>
    </div>
  );
}

// Style Note & Features Tab Content
function StyleNoteContent() {
  return (
    <div className="space-y-4">
      {/* Why It's Special Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">WHY IT'S SPECIAL</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Elevate your style with our exquisite collection of Jodhpuri suits, a timeless fusion of traditional Indian 
          craftsmanship and modern elegance. Crafted from luxurious fabrics like velvet, silk, and brocade, each suit 
          features a sophisticated high-neck design, intricate embroidery, and impeccable tailoring. Whether you're the 
          groom or a guest, a Jodhpuri suit offers a perfect blend of cultural richness and contemporary flair, ensuring you 
          look effortlessly royal wherever you go.
        </p>
      </div>

      {/* Features Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">FEATURES</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">HEIGHT</div>
            <div className="text-sm text-gray-900 font-medium">6 Feet</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">MATERIAL</div>
            <div className="text-sm text-gray-900 font-medium">Rayon</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">COLOR</div>
            <div className="text-sm text-gray-900 font-medium">Scarlet Red</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">SHAPE</div>
            <div className="text-sm text-gray-900 font-medium">Straight</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">CARE</div>
            <div className="text-sm text-gray-900 font-medium">Hand Wash</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">OCCASION</div>
            <div className="text-sm text-gray-900 font-medium">Festive</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">PATTERN</div>
            <div className="text-sm text-gray-900 font-medium">Solid</div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">ORIGIN</div>
            <div className="text-sm text-gray-900 font-medium">India</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Return Policy Tab Content
function ReturnPolicyContent() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Return & Replacement Policy</h3>

      <div className="space-y-3">
        <div className="bg-orange-50 border border-orange-200 rounded p-3">
          <h4 className="text-sm font-medium text-orange-800 mb-1">Easy Returns within 30 Days</h4>
          <p className="text-orange-700 text-xs">
            Return or exchange your purchase within 30 days of delivery for a full refund or store credit.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Return Conditions:</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-xs">
              <li>Items must be in original condition with tags attached</li>
              <li>No signs of wear, damage, or alteration</li>
              <li>Original packaging and accessories must be included</li>
              <li>Custom or personalized items are not eligible for return</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Return Process:</h4>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 text-xs">
              <li>Contact our customer service team to initiate return</li>
              <li>Pack the item securely in original packaging</li>
              <li>Schedule pickup or ship to our return center</li>
              <li>Refund will be processed within 7-10 business days</li>
            </ol>
          </div>

          <div className="bg-gray-50 rounded p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-1">Need Help?</h4>
            <p className="text-gray-700 text-xs">
              Contact our customer service at <span className="text-orange-600 font-medium">support@sofia.com</span> or 
              call <span className="text-orange-600 font-medium">+91-9876543210</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Manufacturer Details Tab Content
function ManufacturerContent() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Manufacturer Details</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <h4 className="text-sm font-semibold text-orange-800 mb-2">Premium Artisan Collective</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-medium text-gray-900">Heritage Crafts Pvt. Ltd.</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est.:</span>
                <span className="font-medium text-gray-900">1995</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Specialization:</span>
                <span className="font-medium text-gray-900">Traditional Menswear</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Certification:</span>
                <span className="font-medium text-gray-900">ISO 9001:2015</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-3">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Quality Assurance</h5>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>Handcrafted by skilled artisans</li>
              <li>Premium fabric sourcing</li>
              <li>Rigorous quality checks</li>
              <li>Traditional techniques preserved</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <div className="border border-gray-200 rounded p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
            <div className="space-y-1 text-xs">
              <div>
                <span className="text-gray-600 block">Address:</span>
                <span className="text-gray-900">
                  123 Heritage Street, Craft District<br />
                  Jaipur, Rajasthan 302001<br />
                  India
                </span>
              </div>
              <div>
                <span className="text-gray-600 block">Phone:</span>
                <span className="text-gray-900">+91-141-2345678</span>
              </div>
              <div>
                <span className="text-gray-600 block">Email:</span>
                <span className="text-gray-900">info@premiumartisan.com</span>
              </div>
              <div>
                <span className="text-gray-600 block">Website:</span>
                <span className="text-orange-600">www.premiumartisan.com</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <h5 className="text-sm font-medium text-amber-800 mb-1">Authenticity Guarantee</h5>
            <p className="text-amber-700 text-xs">
              Every piece comes with a certificate of authenticity, ensuring you receive genuine 
              handcrafted products made using traditional methods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}