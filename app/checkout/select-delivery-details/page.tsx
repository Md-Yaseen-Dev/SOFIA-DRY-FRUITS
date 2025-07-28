import React from "react";
import { CreditCard, Banknote, Landmark, Smartphone, Wallet, Home, Phone, ShieldCheck, BadgeCheck } from 'lucide-react';

export default function SelectDeliveryDetailsPage() {
  // Fetch selected address and cart data here (from localStorage, context, or API)
  // For now, placeholders are used
  const address = {
    firstName: "ramyasri",
    phone: "+91 8125706244",
    address: "hyderabad hy, TIRUMAL...",
    pincode: "500011",
    tag: "Home",
  };

  const bagSummary = {
    total: 3699,
    shipping: 0,
    discount: 2035,
    payable: 1664,
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-center py-6 border-b">
        <img src="/logo.svg" alt="Tata CLiQ LUXURY" className="h-8" />
      </header>
      <main className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto py-10 px-4">
        {/* Payment Options Sidebar */}
        <aside className="w-full md:w-64 bg-white rounded-xl shadow p-6 flex flex-col gap-3 min-h-[400px]">
          <span className="text-sm font-semibold mb-2">Payment Options</span>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 font-medium border border-black text-left">
            <CreditCard className="w-5 h-5" /> Credit Card
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg border text-left">
            <Banknote className="w-5 h-5" /> Debit Card
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg border text-left">
            <Landmark className="w-5 h-5" /> EMI
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg border text-left">
            <Smartphone className="w-5 h-5" /> UPI
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg border text-left">
            <Wallet className="w-5 h-5" /> Netbanking
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg border text-left">
            <Home className="w-5 h-5" /> Cash On Delivery
          </button>
        </aside>

        {/* Center section: Payment Method Details */}
        <section className="flex-1 max-w-lg">
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <span className="block text-xs mb-2">Please use either CLiQ Cash or NeuCoins to complete the transaction</span>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs font-semibold">CLiQ Cash</span>
                <span className="text-xs text-gray-500">Available Balance: ₹0.00</span>
              </div>
              <span className="text-gray-400">or</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-xs font-semibold">NeuCoins</span>
                <span className="text-xs text-gray-500">Available Balance: ₹0.00</span>
              </div>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" className="accent-black" /> CLiQ Cash
              <input type="checkbox" className="accent-black ml-4" /> NeuCoins
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <span className="block text-base font-semibold mb-2">Add new card</span>
            <div className="flex items-center gap-3 mb-2">
              <img src="/visa.svg" alt="Visa" className="h-5" />
              <img src="/mastercard.svg" alt="Mastercard" className="h-5" />
              <img src="/rupay.svg" alt="RuPay" className="h-5" />
              <img src="/maestro.svg" alt="Maestro" className="h-5" />
            </div>
            <input className="w-full mb-2 px-3 py-2 border rounded" placeholder="Credit Card Number" />
            <div className="flex gap-2">
              <input className="w-1/2 mb-2 px-3 py-2 border rounded" placeholder="Validity (MM/YY)" />
              <input className="w-1/2 mb-2 px-3 py-2 border rounded" placeholder="CVV" />
            </div>
            <input className="w-full mb-2 px-3 py-2 border rounded" placeholder="Name" />
            <button className="w-full bg-gray-300 text-gray-700 font-semibold py-2 rounded mt-2">PLACE ORDER</button>
          </div>
        </section>

        {/* Right section: Delivery & Bag Summary */}
        <aside className="w-full md:w-96">
          <div className="bg-white rounded-xl shadow p-6 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-base">Delivering to</span>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">Home</span>
            </div>
            <div className="text-sm font-semibold">ramyasri sri</div>
            <div className="text-xs text-gray-700 mb-1">Ph: +91 8125706244</div>
            <div className="text-xs text-gray-700 mb-1">hyderabad hy, TIRUMAL...</div>
            <div className="text-xs text-gray-700">Telangana 500011</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 mb-4">
            <span className="font-semibold text-base block mb-2">Bag Summary</span>
            <div className="flex justify-between text-sm mb-1"><span>Bag Total</span><span>₹3,699.00</span></div>
            <div className="flex justify-between text-sm mb-1"><span>Shipping Charges</span><span className="text-green-600">FREE</span></div>
            <div className="flex justify-between text-sm mb-1"><span>Product Discount(s)</span><span className="text-green-600">-₹2,035.00</span></div>
            <div className="flex justify-between text-base font-semibold border-t pt-2 mt-2"><span>Total Payable</span><span>₹1,664.00</span></div>
            <div className="text-xs text-green-700 mt-1">You save ₹2,035.00 on this order!</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex gap-4 justify-between items-center mb-4">
            <div className="flex flex-col items-center text-xs">
              <ShieldCheck className="w-5 h-5 mb-1 text-gray-700" />
              Genuine Products
            </div>
            <div className="flex flex-col items-center text-xs">
              <BadgeCheck className="w-5 h-5 mb-1 text-gray-700" />
              Brand Warranty
            </div>
            <div className="flex flex-col items-center text-xs">
              <Phone className="w-5 h-5 mb-1 text-gray-700" />
              Secure Payments
            </div>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-xs text-gray-600">
            Need Help With Placing Your Order?<br />
            Call us on <span className="font-semibold">022 6807 8282</span><br />
            (Lines open from 9:00 AM to 9:00 PM)
          </div>
        </aside>
      </main>
    </div>
  );
}
