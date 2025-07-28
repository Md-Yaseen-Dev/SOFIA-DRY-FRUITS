"use client";
import { useUnifiedToast } from "@/hooks/use-unified-toast";

interface Product {
  id: string;
  name: string;
  image?: string;
  price?: number;
}

export function useAddToCartToast() {
  const { showCartToast, dismiss } = useUnifiedToast();

  const showAddToCartToast = (product: Product) => {
    return showCartToast({
      title: "Added to Cart!",
      message: "Product has been added to your cart successfully.",
      product,
      actionLabel: "View Cart",
    });
  };

  return {
    showAddToCartToast,
    dismiss,
  };
}