
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LocalStorageManager } from "@/lib/mock-data";
import { MapPin, Plus, Edit, Trash2, Check } from "lucide-react";
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

interface AddressManagerProps {
  showAddButton?: boolean;
  onAddressSelect?: (address: Address) => void;
  selectedAddressId?: string;
  compact?: boolean;
}

export default function AddressManager({ 
  showAddButton = true, 
  onAddressSelect,
  selectedAddressId,
  compact = false 
}: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  useEffect(() => {
    if (selectedAddressId) {
      const address = addresses.find(addr => addr.id === selectedAddressId);
      setSelectedAddress(address || null);
    }
  }, [selectedAddressId, addresses]);

  const loadAddresses = () => {
    const savedAddresses = LocalStorageManager.getAddresses();
    setAddresses(savedAddresses);
    
    // Load selected delivery address
    const selectedDelivery = LocalStorageManager.getSelectedDeliveryAddress();
    if (selectedDelivery) {
      setSelectedAddress(selectedDelivery);
    } else if (savedAddresses.length > 0) {
      const defaultAddr = savedAddresses.find(addr => addr.default) || savedAddresses[0];
      setSelectedAddress(defaultAddr);
      LocalStorageManager.setSelectedDeliveryAddress(defaultAddr);
    }
  };

  const handleAddAddress = (addressData: any) => {
    LocalStorageManager.addAddress(addressData);
    loadAddresses();
    setIsFormModalOpen(false);
  };

  const handleEditAddress = (addressData: any) => {
    if (editingAddress) {
      LocalStorageManager.updateAddress(editingAddress.id, addressData);
      loadAddresses();
      setEditingAddress(null);
      setIsFormModalOpen(false);
    }
  };

  const handleDeleteAddress = (addressId: string) => {
    LocalStorageManager.deleteAddress(addressId);
    loadAddresses();
    
    // If deleted address was selected, select a new one
    if (selectedAddress?.id === addressId) {
      const remainingAddresses = LocalStorageManager.getAddresses();
      const newSelected = remainingAddresses[0] || null;
      setSelectedAddress(newSelected);
      LocalStorageManager.setSelectedDeliveryAddress(newSelected);
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address);
    LocalStorageManager.setSelectedDeliveryAddress(address);
    if (onAddressSelect) {
      onAddressSelect(address);
    }
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setIsFormModalOpen(true);
  };

  const openAddModal = () => {
    setEditingAddress(null);
    setIsFormModalOpen(true);
  };

  if (compact && selectedAddress) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-orange-500" />
            Deliver to:
          </h3>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsFormModalOpen(true)}
            className="text-orange-500 hover:text-orange-600 text-sm font-medium"
          >
            Change
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          <p className="font-medium text-gray-900">
            {selectedAddress.firstName} {selectedAddress.lastName}
          </p>
          <p>{selectedAddress.address}</p>
          {selectedAddress.landmark && <p>{selectedAddress.landmark}</p>}
          <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
          <p className="mt-1">Phone: {selectedAddress.phone}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No delivery addresses</h3>
          <p className="text-gray-500 mb-4">Add an address to continue with your order</p>
          {showAddButton && (
            <Button
              onClick={openAddModal}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Delivery Addresses</h3>
            {showAddButton && (
              <Button
                onClick={openAddModal}
                variant="outline"
                size="sm"
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedAddress?.id === address.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleSelectAddress(address)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {selectedAddress?.id === address.id && (
                          <Check className="h-4 w-4 text-orange-500 mr-2" />
                        )}
                        <span className="font-medium text-gray-900">
                          {address.firstName} {address.lastName}
                        </span>
                      </div>
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
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(address);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAddress(address.id);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <AddressFormModal
        open={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={editingAddress ? handleEditAddress : handleAddAddress}
        initialData={editingAddress}
      />
    </div>
  );
}
