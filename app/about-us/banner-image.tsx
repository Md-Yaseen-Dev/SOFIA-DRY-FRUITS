import React from 'react';
import { Truck, CheckCircle } from 'lucide-react';

const FeaturesSection = () => {
  return (
    <div className="w-full bg-gray-100 py-2 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
          {/* EASY EXCHANGE */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-1">
              <Truck className="w-12 h-12 text-gray-700" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              EASY EXCHANGE<span className="text-gray-900 align-top">*</span>
            </h3>
          </div>

          {/* 100% HANDPICKED */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-1">
              <svg className="w-12 h-12 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              100% HANDPICKED
            </h3>
          </div>

          {/* ASSURED QUALITY */}
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center text-center">
            <div className="mb-1">
              <CheckCircle className="w-12 h-12 text-gray-700" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              ASSURED QUALITY
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
