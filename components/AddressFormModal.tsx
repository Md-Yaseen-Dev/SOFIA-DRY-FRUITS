"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface AddressFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (address: any) => void;
  initialData?: any;
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    pincode: "",
    address: "",
    landmark: "",
    city: "",
    state: "",
    saveAs: "Home",
    default: false,
  });

  // Update form state when modal opens for add/edit
  React.useEffect(() => {
    if (open) {
      if (initialData) {
        setForm(initialData);
      } else {
        setForm({
          firstName: "",
          lastName: "",
          phone: "",
          pincode: "",
          address: "",
          landmark: "",
          city: "",
          state: "",
          saveAs: "Home",
          default: false,
        });
      }
    }
  }, [open, initialData]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const isFormValid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.phone.trim().length === 10 &&
    form.pincode.trim().length === 6 &&
    form.address.trim() &&
    form.city.trim() &&
    form.state.trim();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      const addressData = {
        ...form,
        id: initialData?.id || undefined, // Preserve ID for edits
        updatedAt: new Date().toISOString()
      };
      onSave(addressData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-md w-full max-w-[880px] px-12 py-8 relative">
        <button
          className="absolute top-6 right-6 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-center text-sm font-medium mb-2">Add Delivery Address</h2>
        <div className="w-full border-b border-gray-200 mb-8" />

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm mb-8">
            <div>
              <label className="block text-xs text-gray-700 mb-1">First Name</label>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 focus:border-black focus:outline-none py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Last Name</label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 focus:border-black focus:outline-none py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700">+91</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                maxLength={10}
                pattern="[0-9]{10}"
                className="w-full border-b border-gray-300 focus:border-black focus:outline-none py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Pincode</label>
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                required
                maxLength={6}
                pattern="[0-9]{6}"
                className="w-full border-b border-gray-300 focus:border-black focus:outline-none py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 focus:border-black focus:outline-none py-1 text-sm"
              />
            </div>
            <div className="relative">
              <label className="block text-xs text-gray-700 mb-1">Landmark (Optional)</label>
              <input
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                className="w-full border-b border-gray-300 focus:border-black focus:outline-none py-1 pr-6 text-sm"
              />
              <ChevronDown className="absolute right-2 top-6 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">City/District</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 focus:border-black focus:outline-none py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-700 mb-1">State</label>
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                required
                className="w-full border-b border-gray-300 focus:border-black focus:outline-none py-1 text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <span className="text-xs text-gray-700">Save address as</span>
            {["Home", "Work"].map((label) => (
              <button
                key={label}
                type="button"
                className={`px-4 py-1 border rounded text-xs ${
                  form.saveAs === label
                    ? "bg-white border-black text-black font-semibold"
                    : "border-gray-400 text-gray-700"
                }`}
                onClick={() => setForm((prev) => ({ ...prev, saveAs: label }))}
              >
                {label}
              </button>
            ))}
            <label className="ml-auto flex items-center text-xs text-gray-700">
              <input
                type="checkbox"
                name="default"
                checked={form.default}
                onChange={handleChange}
                className="mr-2"
              />
              Save this as default address
            </label>
          </div>

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 rounded text-sm uppercase font-medium transition-colors duration-200 
              ${!isFormValid ? "bg-[#d6d6d6] text-white cursor-not-allowed" : "bg-black text-white cursor-pointer hover:bg-gray-900"}`}
          >
            Save Address
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;