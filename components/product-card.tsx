"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnifiedToast } from "@/hooks/use-unified-toast";
import { LocalStorageManager } from "@/lib/mock-data";
import Image from "next/image";

import type { Product } from '@/types/api';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { showCartToast, showWishlistToast } = useUnifiedToast();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleCardClick = () => {
    // Use product.id for consistent routing
    const productId = product.id;
    router.push(`/product/${productId}`);
  };

  useEffect(() => {
    // Check if product is in wishlist on mount
    const wishlist = LocalStorageManager.getWishlist();
    const isInWishlist = wishlist.some((item: any) => item.id === product.id);
    setIsWishlisted(isInWishlist);
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Get current cart
    const cart = LocalStorageManager.getCart();

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex((item: any) => item.productId === product.id);

    if (existingItemIndex >= 0) {
      // Update quantity if product exists
      cart[existingItemIndex].quantity += 1;
    } else {
      // Add new product to cart
      const cartItem = {
        id: Date.now().toString(),
        productId: product.id,
        quantity: 1,
        product: {
          name: product.name,
          imageUrl: product.image_url || '/placeholder.png',
          originalPrice: (product.originalPrice || product.price || 0).toString(),
          salePrice: product.on_offer || (product.originalPrice && typeof product.originalPrice === 'number' && product.originalPrice > product.price) ? 
            product.price.toString() : (product.price).toString(),
        }
      };
      cart.push(cartItem);
    }

    // Save updated cart
    LocalStorageManager.setCart(cart);

    // Dispatch cart update event
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    // Show toast notification
    showCartToast({
      title: "Added to Cart!",
      message: "Product has been added to your cart successfully.",
      product: {
        id: product.id,
        name: product.name,
        image: product.image_url || '',
        price: product.price,
      },
      actionLabel: "View Cart",
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const wishlist = LocalStorageManager.getWishlist();
    const isCurrentlyWishlisted = wishlist.some((item: any) => item.id === product.id);

    if (isCurrentlyWishlisted) {
      // Remove from wishlist
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
          price: product.price,
        },
        actionLabel: "View Wishlist",
      });
    } else {
      // Add to wishlist
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
          price: product.price,
        },
        actionLabel: "View Wishlist",
      });
    }

    // Dispatch wishlist update event
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  };
  const currentPrice = product.salePrice ? parseFloat(product.salePrice) : parseFloat(product.price?.toString() || '0');
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice.toString()) : null;
  const hasDiscount = originalPrice && originalPrice > currentPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : null;

  return (
    <div className="group cursor-pointer bg-white hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden border border-gray-200 max-w-xs" onClick={handleCardClick}>
      <div className="block">
        <div className="relative overflow-hidden bg-gray-50">
          <Image
            src={product.image_url || '/placeholder.png'}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-64 object-cover"
          />
          {/* ECO badge */}
          {product.isEcoFriendly && (
            <span className="absolute top-1 left-1 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10">ECO</span>
          )}
          {/* Red dot overlay */}
          {/* Rating badge */}
          {(product.rating || product.reviewCount) && (
            <div className="absolute bottom-1 left-1 flex items-center bg-white/90 rounded px-0.5 py-0 text-[10px] font-semibold shadow gap-0.5">
              <span className="font-bold text-gray-900">{product.rating ? Number(product.rating).toFixed(1) : '4.5'}</span>
              <Star className="w-3 h-3 text-green-600 ml-0.5" fill="currentColor" />
              <div className="w-px h-3 bg-gray-300 mx-1" />
              <span className="text-gray-700 font-medium">{product.reviewCount || '8'}</span>
            </div>
          )}
        </div>
        {/* Info section */}
        <div className="p-2 pb-3">
         
         <div className="font-bold text-xs text-gray-900 capitalize leading-tight mb-0.5">{ product.name}</div>
        
          {/* <div className="text-gray-500 text-sm mb-2 leading-snug">{product.subtitle || product.name?.replace(product.brand || '', '').trim() || 'Women Printed Tights'}</div>  */}
          {/* Price row */}
          <div className="flex items-center gap-1 mt-2  whitespace-nowrap">
            <span className="font-bold text-xs text-gray-800">Rs. {currentPrice}</span>
            {hasDiscount && (
              <span className="text-gray-400 line-through text-[10px] ml-1">Rs. {originalPrice}</span>
            )}
            {hasDiscount && (
              <span className="text-red-500 text-[10px] font-semibold ml-1">({discountPercentage}% OFF)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}