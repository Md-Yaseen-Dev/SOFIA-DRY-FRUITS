// Static data for SOFIA e-commerce website - Complete replacement for API calls
// All static/mock data has been removed as per production requirements.

// TypeScript interfaces
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  subcategory_id: string;
  main_category_id: string;
  color: string;
  coupon_code?: string;
  created_at: string;
  updated_at: string;
  is_eco: boolean;
  on_offer: boolean;
  quantity: number;
  size: string;
  image_url?: string;
  // Legacy fields for backward compatibility
  slug?: string;
  brand?: string;
  category?: string;
  originalPrice?: string;
  salePrice?: string;
  discount?: number;
  rating?: string;
  reviewCount?: number;
  imageUrl?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  inStock?: boolean;
  isEcoFriendly?: boolean;
  mainCategoryId?: string;
  mainCategorySlug?: string;
}

// Seller Profile Management
export interface SellerProfile {
  sellerId: string;
  sellerName: string;
  businessName: string;
  email: string;
  phone: string;
  gstNumber: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    upiId: string;
  };
  businessLogo?: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

export class SellerProfileManager {
  private static SELLER_PROFILE_PREFIX = 'seller_profile_';

  static getSellerProfile(sellerId: string): SellerProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const profile = localStorage.getItem(`${this.SELLER_PROFILE_PREFIX}${sellerId}`);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting seller profile:', error);
      return null;
    }
  }

  static saveSellerProfile(profile: SellerProfile): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(`${this.SELLER_PROFILE_PREFIX}${profile.sellerId}`, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving seller profile:', error);
      return false;
    }
  }

  static updateSellerProfile(sellerId: string, updates: Partial<SellerProfile>): boolean {
    const existingProfile = this.getSellerProfile(sellerId);
    if (!existingProfile) return false;

    const updatedProfile = {
      ...existingProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.saveSellerProfile(updatedProfile);
  }

  static deleteSellerProfile(sellerId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.removeItem(`${this.SELLER_PROFILE_PREFIX}${sellerId}`);
      return true;
    } catch (error) {
      console.error('Error deleting seller profile:', error);
      return false;
    }
  }

  static getAllSellerProfiles(): SellerProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      const profiles: SellerProfile[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.SELLER_PROFILE_PREFIX)) {
          const profile = localStorage.getItem(key);
          if (profile) {
            profiles.push(JSON.parse(profile));
          }
        }
      }
      return profiles;
    } catch (error) {
      console.error('Error getting all seller profiles:', error);
      return [];
    }
  }
}

// Local storage helper functions
export class LocalStorageManager {
  static getOrders(): any[] {
    throw new Error('Method not implemented.');
  }
  /**
   * Export all relevant localStorage data for migration to production.
   * Returns an object containing products, categories, orders, addresses, and seller profiles.
   * Optionally triggers a download of the data as a .json file (for browser use).
   */
  static exportLocalDataForProduction(download: boolean = false) {
    const products = this.getAllProducts();
    const categoryTree = (() => {
      try {
        const data = localStorage.getItem('categoryTree');
        return data ? JSON.parse(data) : [];
      } catch { return []; }
    })();
    const orders = (() => {
      try {
        const data = localStorage.getItem('user_orders');
        return data ? JSON.parse(data) : [];
      } catch { return []; }
    })();
    const addresses = (() => {
      try {
        const data = localStorage.getItem('addresses');
        return data ? JSON.parse(data) : [];
      } catch { return []; }
    })();
    const sellerProfiles = (() => {
      try {
        const profiles: any[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('seller_profile_')) {
            const profile = localStorage.getItem(key);
            if (profile) profiles.push(JSON.parse(profile));
          }
        }
        return profiles;
      } catch { return []; }
    })();

    const exportData = {
      products,
      categoryTree,
      orders,
      addresses,
      sellerProfiles
    };

    if (download && typeof window !== 'undefined') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ecommerce-local-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }

    return exportData;
  }

  static getCart() {
    const cart = localStorage.getItem('indivendi_cart');
    return cart ? JSON.parse(cart) : [];
  }

  static setCart(cart: any[]) {
    localStorage.setItem('indivendi_cart', JSON.stringify(cart));
  }

  static setWishlist(wishlist: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error setting wishlist:', error);
    }
  }

  static getWishlist() {
    if (typeof window === 'undefined') return [];
    try {
      const wishlist = localStorage.getItem('wishlist');
      return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
      console.error('Error getting wishlist:', error);
      return [];
    }
  }

  // Unified product management
  static getAllProducts() {
    if (typeof window === 'undefined') return [];
    try {
      const products = localStorage.getItem('allProducts');
      return products ? JSON.parse(products) : [];
    } catch (error) {
      console.error('Error getting all products:', error);
      return [];
    }
  }

  static setAllProducts(products: any[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('allProducts', JSON.stringify(products));
      // Dispatch event to notify components about product updates
      window.dispatchEvent(new CustomEvent('productsUpdated', { detail: products }));
    } catch (error) {
      console.error('Error setting all products:', error);
    }
  }

  static generateId(): string {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  }

  static addProduct(product: any): Product {
    try {
      const allProducts = this.getAllProducts();
      const newProduct: Product = {
        ...product,
        id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        visible: true,
        status: product.inStock ? 'in-stock' : 'out-of-stock'
      };

      const updatedProducts = [...allProducts, newProduct];
      this.setProducts(updatedProducts);
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  static updateProduct(productId: string, updates: Partial<Product>): boolean {
    try {
      const allProducts = this.getAllProducts();
      const productIndex = allProducts.findIndex((p: any) => p.id === productId);

      if (productIndex === -1) {
        return false;
      }

      allProducts[productIndex] = {
        ...allProducts[productIndex],
        ...updates,
        updated_at: new Date().toISOString()
      };

      this.setProducts(allProducts);
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  }

  static deleteProduct(productId: string) {
    const allProducts = this.getAllProducts();
    const filteredProducts = allProducts.filter((p: any) => p.id !== productId);
    this.setAllProducts(filteredProducts);
    return filteredProducts;
  }

  static getVisibleProducts() {
    const allProducts = this.getAllProducts();
    return allProducts.filter((product: any) => 
      product.visible === true && 
      product.status !== 'out-of-stock' && 
      product.inStock !== false
    );
  }

  static setProducts(products: Product[]): void {
    try {
      const validProducts = Array.isArray(products) ? products : [];
      localStorage.setItem('allProducts', JSON.stringify(validProducts));

      // Dispatch event to notify components
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('productsUpdated', { detail: validProducts });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('Error setting products:', error);
    }
  }

  static getProducts(inStockOnly: boolean = false): Product[] {
    try {
      const allProducts = JSON.parse(localStorage.getItem('allProducts') || '[]');
      const products = Array.isArray(allProducts) ? allProducts : [];

      if (inStockOnly) {
        return products.filter(product => product.inStock !== false);
      }

      return products;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  static getProductsByMainCategory(mainCategoryId: string): Product[] {
    try {
      const products = this.getProducts();
      return products.filter(product => 
        product.mainCategoryId === mainCategoryId || 
        product.main_category_id === mainCategoryId
      );
    } catch (error) {
      console.error('Error getting products by main category:', error);
      return [];
    }
  }

  static initializeProducts(): Product[] {
    try {
      const existingProducts = localStorage.getItem('allProducts');

      if (existingProducts) {
        const parsed = JSON.parse(existingProducts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      // Initialize with mock data if no valid data exists
      const initialProducts: Product[] = [];
      this.setProducts(initialProducts);

      // Initialize orders if they don't exist
      this.initializeOrders();

      return initialProducts;
    } catch (error) {
      console.error('Error initializing products:', error);
      return [];
    }
  }

  static initializeOrders(): void {
    try {
      const existingOrders = localStorage.getItem('user_orders');
      if (!existingOrders) {
        localStorage.setItem('user_orders', JSON.stringify([]));
      }
    } catch (error) {
      console.error('Error initializing orders:', error);
    }
  }

  // Category Tree Management - Single Source of Truth
  static getCategoryTree(): MainCategory[] {
    if (typeof window === 'undefined') return [];
    try {
      const categoryTree = localStorage.getItem('categoryTree');
      if (!categoryTree) {
        // Initialize with default categories if not exists
        this.setCategoryTree([]);
        return [];
      }
      return JSON.parse(categoryTree);
    } catch (error) {
      console.error('Error getting category tree:', error);
      return [];
    }
  }

  static setCategoryTree(categoryTree: MainCategory[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('categoryTree', JSON.stringify(categoryTree));
      // Dispatch event to notify components about category tree updates
      window.dispatchEvent(new CustomEvent('categoryTreeUpdated', { detail: categoryTree }));
    } catch (error) {
      console.error('Error setting category tree:', error);
    }
  }

  static initializeCategoryTree(): MainCategory[] {
    const existingTree = this.getCategoryTree();
    if (!existingTree || existingTree.length === 0) {
      this.setCategoryTree([]);
      return [];
    }
    return existingTree;
  }

  // Helper methods for category validation
  static validateCategoryPath(mainCategoryId: string, categoryId: string, subCategoryId: string): boolean {
    const categoryTree = this.getCategoryTree();
    const mainCategory = categoryTree.find(mc => mc.id === mainCategoryId);
    if (!mainCategory) return false;

    const category = mainCategory.category?.find(c => c.id === categoryId);
    if (!category) return false;

    if (subCategoryId) {
      const subCategory = category.sub_category?.find(sc => sc.id === subCategoryId);
      return !!subCategory;
    }

    return true;
  }

  static getCategoryPath(mainCategoryId: string, categoryId: string, subCategoryId?: string) {
    const categoryTree = this.getCategoryTree();
    const mainCategory = categoryTree.find(mc => mc.id === mainCategoryId);
    if (!mainCategory) return null;

    const category = mainCategory.category?.find(c => c.id === categoryId);
    if (!category) return null;

    let subCategory = null;
    if (subCategoryId) {
      subCategory = category.sub_category?.find(sc => sc.id === subCategoryId);
    }

    return {
      mainCategory,
      category,
      subCategory
    };
  }

  static getMainCategoryBySlug(slug: string): MainCategory | null {
    const categoryTree = this.getCategoryTree();
    return categoryTree.find(mc => 
      (mc.slug === slug) || 
      (mc.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === slug)
    ) || null;
  }

  static getCategoryBySlug(mainCategoryId: string, slug: string): Category | null {
    const categoryTree = this.getCategoryTree();
    const mainCategory = categoryTree.find(mc => mc.id === mainCategoryId);
    if (!mainCategory?.category) return null;

    return mainCategory.category.find(c => 
      (c.slug === slug) || 
      (c.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === slug)
    ) || null;
  }

  static getSubCategoryBySlug(mainCategoryId: string, categoryId: string, slug: string): SubCategory | null {
    const categoryTree = this.getCategoryTree();
    const mainCategory = categoryTree.find(mc => mc.id === mainCategoryId);
    if (!mainCategory?.category) return null;

    const category = mainCategory.category.find(c => c.id === categoryId);
    if (!category?.sub_category) return null;

    return category.sub_category.find(sc => 
      (sc.slug === slug) || 
      (sc.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') === slug)
    ) || null;
  }

  // Address management
  static getAddresses(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const addresses = localStorage.getItem('addresses');
      return addresses ? JSON.parse(addresses) : [];
    } catch (error) {
      console.error('Error getting addresses:', error);
      return [];
    }
  }

  static setAddresses(addresses: any[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('addresses', JSON.stringify(addresses));
    } catch (error) {
      console.error('Error setting addresses:', error);
    }
  }

  static addAddress(address: any): void {
    const addresses = this.getAddresses();
    const newAddress = {
      ...address,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    // If this is the first address or marked as default, set it as default
    if (addresses.length === 0 || address.default) {
      addresses.forEach(addr => addr.default = false);
      newAddress.default = true;
    }

    addresses.push(newAddress);
    this.setAddresses(addresses);
  }

  static updateAddress(addressId: string, updatedAddress: any): void {
    const addresses = this.getAddresses();
    const index = addresses.findIndex(addr => addr.id === addressId);

    if (index !== -1) {
      // If marking as default, unset others
      if (updatedAddress.default) {
        addresses.forEach(addr => addr.default = false);
      }

      addresses[index] = { ...addresses[index], ...updatedAddress };
      this.setAddresses(addresses);
    }
  }

  static deleteAddress(addressId: string): void {
    const addresses = this.getAddresses();
    const filteredAddresses = addresses.filter(addr => addr.id !== addressId);

    // If deleted address was default, make the first remaining address default
    if (filteredAddresses.length > 0 && !filteredAddresses.some(addr => addr.default)) {
      filteredAddresses[0].default = true;
    }

    this.setAddresses(filteredAddresses);
  }

  static getDefaultAddress(): any {
    const addresses = this.getAddresses();
    return addresses.find(addr => addr.default) || addresses[0] || null;
  }

  static setDefaultAddress(addressId: string): void {
    const addresses = this.getAddresses();
    addresses.forEach(addr => {
      addr.default = addr.id === addressId;
    });
    this.setAddresses(addresses);
  }

  static getSelectedDeliveryAddress(): any {
    if (typeof window === 'undefined') return null;
    try {
      const selected = localStorage.getItem('selectedDeliveryAddress');
      return selected ? JSON.parse(selected) : null;
    } catch (error) {
      console.error('Error getting selected delivery address:', error);
      return null;
    }
  }

  static setSelectedDeliveryAddress(address: any): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('selectedDeliveryAddress', JSON.stringify(address));
    } catch (error) {
      console.error('Error setting selected delivery address:', error);
    }
  }
  static getDeliveryAddress() {
    const address = localStorage.getItem("deliveryAddress");
    return address;
  }

  static setDeliveryAddress(pincode: string) {
    localStorage.setItem("deliveryAddress", pincode);
  }
}

// TypeScript interfaces
export interface MainCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  slug?: string;
  category?: Category[];
}

export interface Category {
  count: number;
  id: string;
  main_category_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  slug?: string;
  sub_category?: SubCategory[];
}

export interface SubCategory {
  id: string;
  main_category_id: string;
  category_id: string;
  name: string;
  description?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  slug?: string;
}