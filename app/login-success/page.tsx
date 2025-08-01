"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function LoginSuccess() {
  const router = useRouter();

  const handleGoToHome = () => {
    // Set the flag in localStorage to close the modal
    localStorage.setItem("closeSignInModal", "true");
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-xs w-full p-4 relative min-h-[18rem] flex flex-col items-center justify-center">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={handleGoToHome} // Use the handler here
          aria-label="Close"
        >
          ×
        </button>
        <div className="mb-6 w-full flex flex-col items-center justify-center">
  <div className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-center">
    <span className="text-orange-400"></span><span className="text-green-600">SOFIA</span>
  </div>
  <div className="text-xs font-medium tracking-widest uppercase text-center">
    BY ARTISANS OF BHARAT
  </div>
</div>
<div className="text-lg font-bold text-center mb-2">
  You're Successfully<br />Logged In
</div>
<div className="text-sm text-center mb-6 font-medium text-gray-700">
  Start Shopping
</div>
        <button
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors duration-200"
          onClick={handleGoToHome} // Use the handler here
        >
          Go to Home
        </button>
      </div>
    </div>
  );
}