
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { LocalStorageManager } from "@/lib/mock-data";
import { useUnifiedToast } from "@/hooks/use-unified-toast";
import { useAddToCartToast } from "@/hooks/use-add-to-cart-toast";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  originalPrice: number;
  salePrice?: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const { showWishlistToast } = useUnifiedToast();
  const { showAddToCartToast } = useAddToCartToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWishlist = () => {
      const wishlist = LocalStorageManager.getWishlist();
      setWishlistItems(wishlist);
      setIsLoading(false);
    };

    loadWishlist();

    // Listen for wishlist updates
    const handleWishlistUpdate = () => {
      loadWishlist();
    };

    window.addEventListener('wishlistUpdated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
  }, []);

  const handleRemoveFromWishlist = (productId: string) => {
    const updatedWishlist = wishlistItems.filter(item => item.id !== productId);
    LocalStorageManager.setWishlist(updatedWishlist);
    setWishlistItems(updatedWishlist);
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));

    showWishlistToast({
      title: "Removed from Wishlist",
      message: "Product has been removed from your wishlist.",
      product: {
        id: productId,
        name: wishlistItems.find(item => item.id === productId)?.name || "Product",
        image: wishlistItems.find(item => item.id === productId)?.imageUrl,
        price: wishlistItems.find(item => item.id === productId)?.price,
      },
    });
  };

  const handleAddToCart = (item: WishlistItem) => {
    const cart = LocalStorageManager.getCart();
    const existingItem = cart.find((cartItem: any) => cartItem.productId === item.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: Date.now(),
        productId: item.id,
        quantity: 1,
        size: 'M', // Default size
        product: {
          id: item.id,
          name: item.name,
          brand: 'SOFIA',
          imageUrl: item.imageUrl,
          originalPrice: item.originalPrice,
          salePrice: item.salePrice || item.price,
        }
      });
    }

    LocalStorageManager.setCart(cart);
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    showAddToCartToast({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.imageUrl
    });
  };

  const handleMoveToCart = (item: WishlistItem) => {
    handleAddToCart(item);
    handleRemoveFromWishlist(item.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-sm text-gray-600">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          
          {wishlistItems.length > 0 && (
            <Button
              onClick={() => router.push('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
            >
              Continue Shopping
            </Button>
          )}
        </div>

        {/* Wishlist Content */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save items you love to your wishlist by clicking the heart icon
            </p>
            <Button
              onClick={() => router.push('/products')}
              className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0 sm:w-24 w-full">
                    <button
                      onClick={() => router.push(`/product/${item.id}`)}
                      className="hover:opacity-80 transition-opacity w-full"
                    >
                      <img
                        src={item.imageUrl || '/placeholder-image.jpg'}
                        alt={item.name}
                        className="sm:w-24 sm:h-24 w-full h-48 object-cover rounded border border-gray-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.jpg';
                        }}
                      />
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => router.push(`/product/${item.id}`)}
                      className="text-left hover:text-orange-600 transition-colors w-full"
                    >
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 text-sm md:text-base">{item.name}</h3>
                    </button>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">KISAH</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base md:text-lg font-semibold text-gray-900">₹{item.price}</span>
                      {item.salePrice && item.salePrice !== item.price.toString() && (
                        <>
                          <span className="text-sm text-gray-500 line-through">₹{item.originalPrice}</span>
                          <span className="text-sm text-green-600 font-medium">
                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Button
                        onClick={() => handleMoveToCart(item)}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-4 py-3 w-full sm:w-auto"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Move to Cart
                      </Button>
                      <Button
                        onClick={() => handleRemoveFromWishlist(item.id)}
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm px-4 py-3 w-full sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
