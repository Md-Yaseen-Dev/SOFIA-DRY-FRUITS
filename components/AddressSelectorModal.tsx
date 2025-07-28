
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LocalStorageManager } from "@/lib/mock-data";
import { MapPin, Plus, X, Check } from "lucide-react";
import AddressFormModal from "./AddressFormModal";

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  pincode: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  saveAs: string;
  default: boolean;
}

interface AddressSelectorModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (address: Address) => void;
  selectedAddressId?: string;
}

export default function AddressSelectorModal({
  open,
  onClose,
  onSelect,
  selectedAddressId
}: AddressSelectorModalProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (open) {
      loadAddresses();
    }
  }, [open]);

  useEffect(() => {
    if (selectedAddressId) {
      const address = addresses.find(addr => addr.id === selectedAddressId);
      setSelectedAddress(address || null);
    }
  }, [selectedAddressId, addresses]);

  const loadAddresses = () => {
    const savedAddresses = LocalStorageManager.getAddresses();
    setAddresses(savedAddresses);
  };

  const handleAddAddress = (addressData: any) => {
    LocalStorageManager.addAddress(addressData);
    loadAddresses();
    setIsAddFormOpen(false);
  };

  const handleSelectAddress = (address: Address) => {
    LocalStorageManager.setSelectedDeliveryAddress(address);
    onSelect(address);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Select Delivery Address</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          {addresses.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved addresses</h3>
              <p className="text-gray-500 mb-4">Add your first delivery address</p>
              <Button
                onClick={() => setIsAddFormOpen(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Add New Address Button */}
              <Button
                onClick={() => setIsAddFormOpen(true)}
                variant="outline"
                className="w-full border-dashed border-gray-300 text-gray-600 hover:border-orange-300 hover:text-orange-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>

              {/* Address List */}
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedAddress?.id === address.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectAddress(address)}
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedAddress?.id === address.id && (
                            <Check className="h-4 w-4 text-orange-500" />
                          )}
                          <span className="font-medium text-gray-900">
                            {address.firstName} {address.lastName}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            {address.saveAs}
                          </span>
                          {address.default && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{address.address}</p>
                          {address.landmark && <p>{address.landmark}</p>}
                          <p>{address.city}, {address.state} - {address.pincode}</p>
                          <p>Phone: {address.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button
            onClick={onClose}
            variant="outline"
            className="text-gray-600"
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Add Address Form Modal */}
      <AddressFormModal
        open={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
        onSave={handleAddAddress}
      />
    </div>
  );
}
