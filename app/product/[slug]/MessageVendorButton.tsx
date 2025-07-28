import React from "react";

export const MessageVendorButton = () => (
  <button
    className="flex items-center text-sm font-semibold px-2 py-1 rounded-md transition-colors mr-2 border hover:bg-[#e6f3f3]"
    style={{
      minWidth: 140,
      backgroundColor: "#f2f9f9",
      borderColor: "#006666",
      color: "#006666",
    }}
  >
    <div 
      className="w-4 h-4 mr-2 flex items-center justify-center rounded-sm"
      style={{ backgroundColor: "#006666" }}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="white"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4.39-1.03L3 21l1.03-4.39A8.97 8.97 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    </div>
    Message Vendor
  </button>
);

export default MessageVendorButton;