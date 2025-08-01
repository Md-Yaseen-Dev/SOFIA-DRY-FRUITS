"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { LocalStorageManager } from "@/lib/mock-data";

export default function BrandShowcase() {
  const router = useRouter();

  const handleBrandClick = (brandSlug: string) => {
    router.push(`/products?brand=${brandSlug}`);
  };

  const handleEliteBrandClick = (brandSlug: string) => {
    router.push(`/products?elite_brand=${brandSlug}`);
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative">
            <span className="relative z-10">Elite Retailers</span>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-orange-500 rounded-full"></div>
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-4 italic">Trending names.Trending finds</p>
        </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {LocalStorageManager.getAllProducts().slice(0, 8).map((brand: any) => (
            <Card
              key={brand.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => handleBrandClick(brand.id)}
            >
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition-colors">
                  {brand.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{brand.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}