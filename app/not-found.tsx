"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import IndianPatternBg from '../components/indian-pattern-bg'
import React from "react";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
      <IndianPatternBg />
      
      <div className="text-center z-10 px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            The page you're looking for seems to have wandered off like a lost treasure in the bazaars of India.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={() => router.push('/')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-medium text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Return to Home
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Button 
              variant="outline"
              onClick={() => router.push('/products')}
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Browse Products
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.back()}
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Go Back
            </Button>
          </div>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>Lost? Our artisans can help you find your way.</p>
        </div>
      </div>
    </div>
  );
}