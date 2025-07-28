
"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, ShoppingCart } from "lucide-react";
import { useRouter } from 'next/navigation';

interface AddToCartToastProps {
  product: {
    id: string;
    name: string;
    image?: string;
    price?: number;
  };
  onDismiss: () => void;
  onViewCart?: () => void;
}

export function AddToCartToast({ product, onDismiss, onViewCart }: AddToCartToastProps) {
  const router = useRouter();

  const handleViewCart = () => {
    router.push('/cart');
    onDismiss();
  };

  return (
    <div className="group pointer-events-auto relative flex w-full max-w-md overflow-hidden rounded-xl border border-orange-100/50 bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 backdrop-blur-sm shadow-lg shadow-orange-100/20 transition-all animate-in slide-in-from-top-2 duration-300 p-4">
      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-orange-50 transition-all duration-200 hover:scale-110 z-10"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Main Content Container */}
      <div className="flex items-start gap-3 w-full pr-8">
        {/* Left: Success Icon + Product Image */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Success Icon */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 animate-in zoom-in-50 duration-500 delay-100">
            <Check className="h-4 w-4 text-white animate-in zoom-in-75 duration-300 delay-200" />
          </div>
          
          {/* Product Image */}
          {product.image ? (
            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden border border-orange-100/50">
              <img 
                src={product.image} 
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-orange-600" />
            </div>
          )}
        </div>

        {/* Right: Text Content + Action Button */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
          {/* Text Block */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900">
                Added to Cart
              </p>
              <div className="h-1 w-1 rounded-full bg-orange-400 animate-pulse" />
            </div>
            <p className="text-xs text-gray-600 font-medium leading-relaxed truncate">
              {product.name}
            </p>
            {product.price && (
              <p className="text-xs text-orange-600 font-semibold mt-0.5">
                ₹{product.price.toLocaleString()}
              </p>
            )}
          </div>

          {/* Action Button - Bottom Right */}
          <div className="flex justify-end">
            <Button
              onClick={onViewCart || handleViewCart}
              size="sm"
              className="h-7 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-medium rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:scale-105"
            >
              View Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Subtle accent border */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400 opacity-60" />
    </div>
  );
}
