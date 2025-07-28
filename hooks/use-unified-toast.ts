
"use client";
import { useToast } from "@/hooks/use-toast";
import { UnifiedToast } from "@/components/UnifiedToast";
import { useRouter } from "next/navigation";
import React from "react";

interface Product {
  id: string;
  name: string;
  image?: string;
  price?: number;
}

interface ToastOptions {
  title: string;
  message: string;
  product?: Product;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
}

export function useUnifiedToast() {
  const { toast, dismiss } = useToast();
  const router = useRouter();

  const showCartToast = (options: ToastOptions) => {
    const toastResult = toast({
      duration: options.duration || 4000,
      className: "border-0 bg-transparent shadow-none p-0",
      description: React.createElement(UnifiedToast, {
        type: 'cart',
        title: options.title,
        message: options.message,
        product: options.product,
        actionLabel: options.actionLabel || "View Cart",
        onAction: options.onAction || (() => {
          toastResult.dismiss();
          router.push('/cart');
        }),
        onDismiss: () => toastResult.dismiss(),
      }),
    });
    return toastResult;
  };

  const showWishlistToast = (options: ToastOptions) => {
    const toastResult = toast({
      duration: options.duration || 4000,
      className: "border-0 bg-transparent shadow-none p-0",
      description: React.createElement(UnifiedToast, {
        type: 'wishlist',
        title: options.title,
        message: options.message,
        product: options.product,
        actionLabel: options.actionLabel || "View Wishlist",
        onAction: options.onAction || (() => {
          toastResult.dismiss();
          router.push('/wishlist');
        }),
        onDismiss: () => toastResult.dismiss(),
      }),
    });
    return toastResult;
  };

  const showSuccessToast = (options: ToastOptions) => {
    const toastResult = toast({
      duration: options.duration || 4000,
      className: "border-0 bg-transparent shadow-none p-0",
      description: React.createElement(UnifiedToast, {
        type: 'success',
        title: options.title,
        message: options.message,
        product: options.product,
        actionLabel: options.actionLabel,
        onAction: options.onAction ? () => {
          toastResult.dismiss();
          options.onAction!();
        } : undefined,
        onDismiss: () => toastResult.dismiss(),
      }),
    });
    return toastResult;
  };

  return {
    showCartToast,
    showWishlistToast,
    showSuccessToast,
    dismiss,
  };
}
