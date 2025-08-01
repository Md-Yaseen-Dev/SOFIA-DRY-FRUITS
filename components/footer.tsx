"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="relative bg-gradient-to-br from-neutral-900 to-neutral-950 text-white border-t-2 border-orange-400">
      {/* Back to Top Button */}
      <div className="flex justify-center py-4">
  <button
    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    className="w-10 h-10 bg-orange-400 hover:bg-green-500 text-white font-semibold rounded-full shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center justify-center"
    aria-label="Back to top"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  </button>
</div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Newsletter and Trust Badges Section */}
        <div className="flex flex-col sm:flex-row items-stretch justify-between gap-8 border-b border-neutral-700 pb-8">
          {/* Newsletter Signup */}
          <div className="w-full sm:w-1/2 flex-1">
            <h3 className="text-lg font-bold mb-3 text-white tracking-wide uppercase">Connect with Us</h3>
            <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
              Be the first to know about new products, exclusive collections, and latest trends.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="min-w-[180px] bg-neutral-800 border border-orange-400 focus:border-green-500 text-white px-4 py-2 text-sm rounded-md placeholder-neutral-400 outline-none transition-all duration-200"
              />
              <button className="bg-orange-400 text-white px-6 py-2 text-sm font-bold tracking-wide hover:from-orange-500 hover:to-green-600 rounded-md transition-all">
                Subscribe
              </button>
            </div>
          </div>
          {/* Trust Badges */}
          {/* <div className="w-full sm:w-1/2 flex-1 flex flex-row justify-between px-4 sm:justify-center sm:gap-6">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Authentic Brands Badge"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <p className="text-xs font-semibold text-orange-400">Authentic Brands</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="SOFIA  Trust Badge"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <p className="text-xs font-semibold text-green-400">SOFIA  Trust</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-label="Easy Returns Badge"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </div>
              <p className="text-xs font-semibold text-pink-400">Easy Returns</p>
            </div>
          </div> */}
        </div>

        {/* Links Section */}
        <div className="py-8 grid grid-cols-2 gap-8 mx-auto  px-4 w-full sm:grid sm:grid-cols-3 sm:gap-6 sm:px-0 lg:grid-cols-6">
          {/* Shop Luxury */}
          <div className="w-full">
            <h4 className="text-sm font-semibold mb-3 text-white tracking-wide uppercase">Shop Luxury</h4>
            <ul className="space-y-2 text-xs">
              {["Men", "Women", "Handbags", "Watches", "Home", "Shoes", "Fragrances", "Kids"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          {/* Shop IndiLuxe */}
          <div className="w-full">
            <h4 className="text-sm font-semibold mb-3 text-white tracking-wide uppercase">Shop IndiLuxe</h4>
            <ul className="space-y-2 text-xs">
              {["Women", "Men", "Home", "Beauty"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          {/* Popular Searches */}
          <div className="w-full">
            <h4 className="text-sm font-semibold mb-3 text-white tracking-wide uppercase">Popular Searches</h4>
            <ul className="space-y-2 text-xs">
              {["Lacoste", "Michael Kors", "Coach", "Diesel", "Watches", "Armani Exchange", "Polo Trends", "Wallets"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
          {/* Useful Links */}
          <div className="w-full">
            <h4 className="text-sm font-semibold mb-3 text-white tracking-wide uppercase">Useful Links</h4>
            <ul className="space-y-2 text-xs">
            <li>
      <button
        onClick={() => router.push("/about-us")}
        className="text-left text-neutral-400 hover:text-white transition-colors"
      >
        About Us
      </button>
    </li>
    <li>
      <button
        onClick={() => router.push("/contact-us")}
        className="text-left text-neutral-400 hover:text-white transition-colors"
      >
        Contact Us
      </button>
    </li>
   
              {[
                // "Contact Us",
                "FAQ",
                "Shipping",
                "Cancellation",
                "Returns FAQs",
                "Return Policy",
                "Replacement Policy",
                "Gift Card T&C",
                // "Terms & Conditions",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-neutral-400 hover:text-white transition-colors">{item}</a>
                </li>
              ))}
              <li>
                <button
                  onClick={() => router.push("/privacy-policy")}
                  className="text-left text-neutral-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
              <Link href="/conditions" className="text-neutral-400 hover:text-white transition-colors">
              Terms & Conditions
</Link>

      {/* <button
        onClick={() => router.push("/terms-conditions")}
        className="text-left text-neutral-400 hover:text-white transition-colors"
      >
        Terms & Conditions
      </button> */}
   </li>
            </ul>
          </div>
          {/* Download */}
          <div className="w-full">
            <h4 className="text-sm font-semibold mb-3 text-white tracking-wide uppercase">Download</h4>
            <div className="space-y-2">
              <a href="#" className="block" aria-label="Download from App Store">
                <div className="bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-xs text-white hover:bg-neutral-700 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  App Store
                </div>
              </a>
              <a href="#" className="block" aria-label="Download from Google Play">
                <div className="bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-xs text-white hover:bg-neutral-700 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  Google Play
                </div>
              </a>
            </div>
          </div>
          {/* Follow Us */}
          <div className="w-full">
            <h4 className="text-sm font-semibold mb-3 text-white tracking-wide uppercase">Follow Us</h4>
            <div className="flex gap-3">
              {[
                { icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>, label: "Facebook" },
                { icon: <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>, label: "Twitter" },
                { icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>, label: "Instagram" },
              ].map(({ icon, label }, index) => (
                <a key={index} href="#" className="text-neutral-400 hover:text-white transition-colors" aria-label={label}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">{icon}</svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Logo and Copyright Section */}
        <div className="border-t border-neutral-700 pt-6 pb-4 text-center">
          <div
            className="cursor-pointer flex flex-col items-center mb-4 group"
            onClick={() => router.push("/")}
          >
            <h2 className="text-2xl font-bold tracking-tight group-hover:text-white transition-colors duration-200">
              {/* <span className="text-white">Al-Falah</span> */}
              <span className="text-green-500">SOFIA</span>
            </h2>
            <p className="text-orange-300 text-xs font-semibold tracking-widest uppercase">
              Dry Fruits 
            </p>
          </div>
          <p className="text-neutral-400 text-xs">
            © 2025 Sofia House. Powered by Shaik Mohammad Yaseen 
          </p>
          <div className="flex justify-center gap-4 text-xs mt-2">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</a>
            <span className="text-neutral-700">|</span>
            <button
              onClick={() => router.push("/privacy-policy")}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}