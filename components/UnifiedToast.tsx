
"use client";
import { ShoppingCart, Heart, CheckCircle, X, ArrowRight } from "lucide-react";
import Image from "next/image";

interface UnifiedToastProps {
  type: 'cart' | 'wishlist' | 'success';
  title: string;
  message: string;
  product?: {
    id: string;
    name: string;
    image?: string;
    price?: number;
  };
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
}

export function UnifiedToast({ 
  type, 
  title, 
  message, 
  product, 
  actionLabel, 
  onAction, 
  onDismiss 
}: UnifiedToastProps) {
  const getIcon = () => {
    switch (type) {
      case 'cart':
        return <ShoppingCart className="w-5 h-5 text-orange-600" />;
      case 'wishlist':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'cart':
        return 'border-orange-200 bg-orange-50';
      case 'wishlist':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-green-200 bg-green-50';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'cart':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'wishlist':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'success':
        return 'bg-green-500 hover:bg-green-600 text-white';
      default:
        return 'bg-green-500 hover:bg-green-600 text-white';
    }
  };

  return (
    <div className={`group pointer-events-auto relative flex w-full max-w-md overflow-hidden rounded-xl border ${getAccentColor()} backdrop-blur-sm shadow-lg transition-all animate-in slide-in-from-top-2 duration-300 p-4`}>
      {/* Close Button */}
      <button
        onClick={onDismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-all duration-200 hover:scale-110 z-10"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="flex items-start space-x-3 w-full pr-8">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start space-x-3">
            {/* Product Image */}
            {product?.image && (
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Text Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-xs text-gray-600 mb-2">{message}</p>
              
              {/* Product Info */}
              {product && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 truncate">{product.name}</p>
                  {product.price && (
                    <p className="text-xs text-gray-500">₹{product.price}</p>
                  )}
                </div>
              )}

              {/* Action Button */}
              {onAction && actionLabel && (
                <button
                  onClick={onAction}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 shadow-sm ${getButtonColor()}`}
                >
                  <span>{actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
