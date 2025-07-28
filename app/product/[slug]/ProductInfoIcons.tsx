import React from "react";

const ProductInfoIcons = () => (
  <div className="border-t border-gray-300 pt-4">
    {/* First Row - All in one line */}
    <div className="flex items-center gap-12 flex-wrap mb-4">
      {/* Live Buy/Ready to Ship */}
      {/* <div className="flex items-center gap-2 whitespace-nowrap">
        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v12H3V4zm16 8h-2v4h4v-2a2 2 0 0 0-2-2z"/>
          <circle cx="6" cy="19" r="2" fill="currentColor"/>
          <circle cx="18" cy="19" r="2" fill="currentColor"/>
          <path d="M15 12h4l2 2v2h-2v-2h-4v-2z"/>
        </svg>
        <span className="text-sm text-gray-700">Live Buy/Ready to Ship:</span>
      </div> */}

      {/* Compare */}
      <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 whitespace-nowrap">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm text-gray-700">Compare</span>
      </div>

{/* Customizable */}
<div className="flex items-center ml-6 gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm text-gray-700">
          Customizable: <span className="text-orange-500 font-medium">NO</span>
        </span>
      </div>

      {/* Save */}
      <div className="flex items-center ml-6 gap-2 cursor-pointer hover:text-blue-600">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 9h6v6H9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm text-gray-700">Save</span>
      </div>
      {/* Variant 6 */}
      {/* <div className="flex items-center ml-4 gap-2 whitespace-nowrap">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm text-gray-700">Variant 6</span>
      </div> */}
    </div>

    {/* Second Row */}
    {/* <div className="flex items-center mt-2 gap-6 mb-4"> */}
      

      {/* Customizable */}
      {/* <div className="flex items-center ml-24 mr-2 gap-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm text-gray-700">
          Customizable: <span className="text-orange-500 font-medium">NO</span>
        </span>
      </div> */}

      {/* Save */}
      {/* <div className="flex items-center gap-2 ml-20 cursor-pointer hover:text-blue-600">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 9h6v6H9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm text-gray-700">Save</span>
      </div> */}
    </div>
//   </div>
);

export default ProductInfoIcons;