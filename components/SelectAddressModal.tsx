"use client";
import React from "react";
import { ChevronRight, Pencil, PlusCircle } from "lucide-react";

interface Address {
  firstName: string;
  lastName: string;
  phone: string;
  pincode: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  saveAs: string;
  default: boolean;
}

interface SelectAddressModalProps {
  open: boolean;
  onClose: () => void;
  addresses: Address[];
  selectedAddressIndex: number | null;
  onEdit: (index: number) => void;
  onAddNew: () => void;
  onSelect: (index: number) => void;
}

const SelectAddressModal: React.FC<SelectAddressModalProps> = ({ open, onClose, addresses, selectedAddressIndex, onEdit, onAddNew, onSelect }) => {
  if (!open) return null;

  const [selected, setSelected] = React.useState<number | null>(selectedAddressIndex);

  React.useEffect(() => {
    setSelected(selectedAddressIndex);
  }, [selectedAddressIndex, addresses.length]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-[500px] px-8 py-6 relative">
        <button
          className="absolute top-6 right-6 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-base font-semibold mb-2 text-gray-800 text-left">Select Delivery Address</h2>
        <div className="w-full border-b border-gray-200 mb-5" />

        {/* List all addresses with radio and edit */}
        <div className="mb-6 flex flex-col gap-4">
          {addresses.length === 0 && (
            <div className="text-center text-gray-500 text-sm">No addresses. Please add one.</div>
          )}
          {addresses.map((address, idx) => (
            <div key={idx} className={`flex items-start gap-2 p-3 rounded-lg border ${selected === idx ? "border-black bg-gray-50" : "border-gray-200"}`}>
              <input
                type="radio"
                checked={selected === idx}
                onChange={() => setSelected(idx)}
                className="mt-1 accent-black"
                name="select-address"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-sm">
                    <span className="inline-block align-middle mr-1">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    </span>
                    {address.firstName} {address.lastName}
                  </span>
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">{address.saveAs}</span>
                  <button className="ml-auto p-1 hover:bg-gray-100 rounded" aria-label="Edit Address" onClick={() => onEdit(idx)}>
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <div className="text-xs text-gray-700 ml-6">
                  {address.address}{address.landmark ? `, ${address.landmark}` : ""},<br />
                  {address.city.toUpperCase()}, {address.pincode}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Address Card */}
        <div className="mb-8">
          <button
            className="w-full flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 shadow-sm hover:shadow-md transition font-medium text-sm"
            onClick={onAddNew}
          >
            <PlusCircle className="w-5 h-5 text-gray-500" />
            ADD NEW ADDRESS
            <ChevronRight className="ml-auto w-4 h-4 text-gray-400" />
          </button>
        </div>

        <button
          className={`w-full bg-black text-white font-medium py-3 rounded-lg text-base uppercase hover:bg-gray-900 transition ${selected === null ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => selected !== null && onSelect(selected)}
          disabled={selected === null}
        >
          Select Address
        </button>
      </div>
    </div>
  );
};

export default SelectAddressModal;