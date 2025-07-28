// Static data for Shifa Rah e-commerce website - Complete replacement for API calls

// Mock brands data
export const brands = [
  {
    id: "brand-1",
    name: "Heritage Crafts",
    description: "Traditional Indian handicrafts",
    image: "/handcrafts.jpeg",
    featured: true
  },
  {
    id: "brand-2", 
    name: "Silk Weave",
    description: "Premium silk products",
    image: "/silk sarees.jpg",
    featured: true
  },
  {
    id: "brand-3",
    name: "Artisan Jewelry",
    description: "Handcrafted jewelry pieces",
    image: "/Artisan Jewllery.png",
    featured: true
  },
  {
    id: "brand-4",
    name: "Khadi Collection",
    description: "Authentic khadi textiles",
    image: "/khadi.webp",
    featured: true
  },
  {
    id: "brand-5",
    name: "Ayurvedic Care",
    description: "Natural wellness products",
    image: "/ayurvedic.jpeg",
    featured: true
  },
  {
    id: "brand-6",
    name: "Home Decor Plus",
    description: "Traditional home decorations",
    image: "/decor1.avif",
    featured: true
  },
  {
    id: "brand-7",
    name: "Ethnic Wear",
    description: "Traditional clothing collection",
    image: "/tradition.jpeg",
    featured: true
  },
  {
    id: "brand-8",
    name: "Wellness Yoga",
    description: "Yoga and meditation accessories",
    image: "/yoga.webp",
    featured: true
  }
];

// Mock products data
export const products = [
  {
    id: "088a3c22-097c-4e76-963a-108dd2d3068e",
    name: "Traditional Women Dress",
    description: "Beautiful traditional dress for women",
    price: 2799,
    category_id: "25ef1e05-4cb0-4883-88d8-3d3c47c4e60b",
    subcategory_id: "f78f026f-1626-45d8-9208-ca84a676a1db",
    main_category_id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
    color: "Red",
    created_at: "2025-06-24T15:07:02.389895Z",
    updated_at: "2025-06-24T15:07:02.389895Z",
    is_eco: false,
    on_offer: true,
    quantity: 10,
    size: "M",
    image_url: "/half saree.jpg",
    slug: "traditional-women-dress",
    brand: "Heritage Collection",
    category: "Traditional Wear",
    originalPrice: "3299",
    salePrice: "2799",
    discount: 15,
    rating: "4.5",
    reviewCount: 142,
    imageUrl: "/half saree.jpg",
    images: ["/half saree.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Blue", "Green"],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    inStock: true,
    isEcoFriendly: false,
    mainCategoryId: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
    mainCategorySlug: "beauty-wellness",
    seller_id: "rohit@gmail.com",
    seller_email: "rohit@gmail.com"
  },
  {
    id: "b88a3c22-097c-4e76-963a-108dd2d3068f",
    name: "Traditional Men Dress",
    description: "Elegant traditional outfit for men",
    price: 1599,
    category_id: "25ef1e05-4cb0-4883-88d8-3d3c47c4e60b",
    subcategory_id: "f78f026f-1626-45d8-9208-ca84a676a1db",
    main_category_id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
    color: "White",
    created_at: "2025-06-24T15:07:02.389895Z",
    updated_at: "2025-06-24T15:07:02.389895Z",
    is_eco: false,
    on_offer: false,
    quantity: 8,
    size: "L",
    image_url: "/mentradition.jpg",
    slug: "traditional-men-dress",
    brand: "Ethnic Wear",
    category: "Traditional Wear",
    originalPrice: "1899",
    salePrice: "1599",
    discount: 16,
    rating: "4.3",
    reviewCount: 89,
    imageUrl: "/mentradition.jpg",
    images: ["/mentradition.jpg"],
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["White", "Cream", "Gold"],
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    inStock: true,
    isEcoFriendly: false,
    mainCategoryId: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
    mainCategorySlug: "beauty-wellness",
    seller_id: "rohit@gmail.com",
    seller_email: "rohit@gmail.com"
  },
  {
    id: "c88a3c22-097c-4e76-963a-108dd2d3068g",
    name: "Luxury Leather Handbag",
    description: "Premium quality leather handbag",
    price: 8999,
    category_id: "d1e2f3g4-5678-9012-3456-789012345681",
    subcategory_id: "e1f2g3h4-5678-9012-3456-789012345682",
    main_category_id: "aa705683-38ea-4f87-9356-fe5ef0d45486",
    color: "Brown",
    created_at: "2025-06-24T15:07:02.389895Z",
    updated_at: "2025-06-24T15:07:02.389895Z",
    is_eco: false,
    on_offer: true,
    quantity: 5,
    size: "One Size",
    image_url: "/handbag.jpeg",
    slug: "luxury-leather-handbag",
    brand: "Premium Leather",
    category: "Handbags",
    originalPrice: "11999",
    salePrice: "8999",
    discount: 25,
    rating: "4.7",
    reviewCount: 267,
    imageUrl: "/handbag.jpeg",
    images: ["/handbag.jpeg"],
    sizes: ["One Size"],
    colors: ["Brown", "Black", "Tan"],
    isFeatured: true,
    isNew: false,
    isBestseller: true,
    inStock: true,
    isEcoFriendly: false,
    mainCategoryId: "aa705683-38ea-4f87-9356-fe5ef0d45486",
    mainCategorySlug: "fine-jewelry",
    seller_id: "rohit@gmail.com",
    seller_email: "rohit@gmail.com"
  },
  {
    id: "d88a3c22-097c-4e76-963a-108dd2d3068h",
    name: "Traditional Slippers",
    description: "Comfortable traditional footwear",
    price: 1299,
    category_id: "i1j2k3l4-5678-9012-3456-789012345686",
    subcategory_id: "j1k2l3m4-5678-9012-3456-789012345687",
    main_category_id: "fcfa4ef3-b263-482a-8bd9-530690536dae",
    color: "Brown",
    created_at: "2025-06-24T15:07:02.389895Z",
    updated_at: "2025-06-24T15:07:02.389895Z",
    is_eco: true,
    on_offer: false,
    quantity: 15,
    size: "8",
    image_url: "/tradslippers.jpg",
    slug: "traditional-slippers",
    brand: "Comfort Foot",
    category: "Footwear",
    originalPrice: "1299",
    salePrice: "1299",
    discount: 0,
    rating: "4.2",
    reviewCount: 156,
    imageUrl: "/tradslippers.jpg",
    images: ["/tradslippers.jpg"],
    sizes: ["6", "7", "8", "9", "10"],
    colors: ["Brown", "Black", "Tan"],
    isFeatured: false,
    isNew: false,
    isBestseller: false,
    inStock: true,
    isEcoFriendly: true,
    mainCategoryId: "fcfa4ef3-b263-482a-8bd9-530690536dae",
    mainCategorySlug: "home-kitchen",
    seller_id: "rohit@gmail.com",
    seller_email: "rohit@gmail.com"
  },
  {
    id: "e88a3c22-097c-4e76-963a-108dd2d3068i",
    name: "Premium Watch Collection",
    description: "Elegant timepiece for special occasions",
    price: 12999,
    category_id: "k1l2m3n4-5678-9012-3456-789012345688",
    subcategory_id: "l1m2n3o4-5678-9012-3456-789012345689",
    main_category_id: "45c24eb1-e672-4ae1-a888-9fff9bd27393",
    color: "Gold",
    created_at: "2025-06-24T15:07:02.389895Z",
    updated_at: "2025-06-24T15:07:02.389895Z",
    is_eco: false,
    on_offer: true,
    quantity: 3,
    size: "One Size",
    image_url: "/watches.jpg",
    slug: "premium-watch-collection",
    brand: "Luxury Time",
    category: "Watches",
    originalPrice: "15999",
    salePrice: "12999",
    discount: 19,
    rating: "4.8",
    reviewCount: 98,
    imageUrl: "/watches.jpg",
    images: ["/watches.jpg"],
    sizes: ["One Size"],
    colors: ["Gold", "Silver", "Rose Gold"],
    isFeatured: true,
    isNew: true,
    isBestseller: true,
    inStock: true,
    isEcoFriendly: false,
    mainCategoryId: "45c24eb1-e672-4ae1-a888-9fff9bd27393",
    mainCategorySlug: "heritage-jewellery",
    seller_id: "rohit@gmail.com",
    seller_email: "rohit@gmail.com"
  },
  {
    id: "f88a3c22-097c-4e76-963a-108dd2d3068j",
    name: "Natural Makeup Kit",
    description: "Organic and natural makeup collection",
    price: 2499,
    category_id: "b1c2d3e4-5678-9012-3456-789012345679",
    subcategory_id: "c1d2e3f4-5678-9012-3456-789012345680",
    main_category_id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
    color: "Multi",
    created_at: "2025-06-24T15:07:02.389895Z",
    updated_at: "2025-06-24T15:07:02.389895Z",
    is_eco: true,
    on_offer: false,
    quantity: 20,
    size: "Standard",
    image_url: "/makeup.jpg",
    slug: "natural-makeup-kit",
    brand: "Natural Beauty",
    category: "Cosmetics",
    originalPrice: "2499",
    salePrice: "2499",
    discount: 0,
    rating: "4.4",
    reviewCount: 234,
    imageUrl: "/makeup.jpg",
    images: ["/makeup.jpg"],
    sizes: ["Standard"],
    colors: ["Multi"],
    isFeatured: false,
    isNew: true,
    isBestseller: false,
    inStock: true,
    isEcoFriendly: true,
    mainCategoryId: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
    mainCategorySlug: "beauty-wellness",
    seller_id: "rohit@gmail.com",
    seller_email: "rohit@gmail.com"
  }
];

// Mock orders data for initialization
export const orders = [
  {
    id: "order-1",
    user_id: "user-1",
    customer_name: "John Doe",
    customer_email: "john.doe@example.com",
    customer_phone: "+91 9876543210",
    total_amount: 5298.00,
    status: "delivered",
    order_date: "2025-06-20T10:30:00.000Z",
    delivery_date: "2025-06-25T14:00:00.000Z",
    delivery_address: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    tracking_id: "TRK123456789",
    orderedBy: {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      address: {
        street: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
      }
    },
    items: [
      {
        product_id: "088a3c22-097c-4e76-963a-108dd2d3068e",
        product_name: "Traditional Women Dress",
        product_image: "/half saree.jpg",
        quantity: 2,
        price: 2799.00,
        seller_id: "rohit@gmail.com"
      }
    ]
  },
  {
    id: "order-2",
    user_id: "user-1",
    customer_name: "John Doe",
    customer_email: "john.doe@example.com",
    customer_phone: "+91 9876543210",
    total_amount: 1599.00,
    status: "confirmed",
    order_date: "2025-07-01T15:45:00.000Z",
    delivery_address: {
      street: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400001"
    },
    orderedBy: {
      id: "user-1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+91 9876543210",
      address: {
        street: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001"
      }
    },
    items: [
      {
        product_id: "b88a3c22-097c-4e76-963a-108dd2d3068f",
        product_name: "Traditional Men Dress",
        product_image: "/mentradition.jpg",
        quantity: 1,
        price: 1599.00,
        seller_id: "rohit@gmail.com"
      }
    ]
  }
];

// Mock data for the Indian marketplace

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

// Static Main Categories with nested structure
export const mainCategories: MainCategory[] = [
  {
    id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
    name: "Beauty & Wellness",
    image_url: "https://media.istockphoto.com/id/1141698953/photo/spa-products-for-home-skin-care.jpg?s=612x612&w=0&k=20&c=HxtIt73MwCZBY0APYngv0poZCEtyDhckTuT8SxJSxPE=",
    created_at: "2025-06-24T06:47:49.670843Z",
    updated_at: "2025-07-03T19:55:51.084496Z",
    category: [
      {
        id: "25ef1e05-4cb0-4883-88d8-3d3c47c4e60b",
        main_category_id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
        name: "Fragrances",
        description: "Fragrances",
        created_at: "2025-06-24T07:20:49.613139Z",
        updated_at: "2025-06-24T07:20:49.613139Z",
        sub_category: [
          {
            id: "f78f026f-1626-45d8-9208-ca84a676a1db",
            main_category_id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
            category_id: "25ef1e05-4cb0-4883-88d8-3d3c47c4e60b",
            name: "Body Sprays",
            description: "All types of Body Sprays",
            image_url: "",
            created_at: "2025-06-24T15:07:02.389895Z",
            updated_at: "2025-06-24T15:07:02.389895Z"
          },
          {
            id: "a1b2c3d4-5678-9012-3456-789012345678",
            main_category_id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
            category_id: "25ef1e05-4cb0-4883-88d8-3d3c47c4e60b",
            name: "Perfumes",
            description: "Premium perfumes",
            image_url: "",
            created_at: "2025-06-24T15:07:02.389895Z",
            updated_at: "2025-06-24T15:07:02.389895Z"
          }
        ],
        count: 3
      },
      {
        id: "b1c2d3e4-5678-9012-3456-789012345679",
        main_category_id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
        name: "Skincare",
        description: "Skincare products",
        created_at: "2025-06-24T07:20:49.613139Z",
        updated_at: "2025-06-24T07:20:49.613139Z",
        sub_category: [
          {
            id: "c1d2e3f4-5678-9012-3456-789012345680",
            main_category_id: "4885ad6a-b033-4564-95b9-66cc0a3d00a4",
            category_id: "b1c2d3e4-5678-9012-3456-789012345679",
            name: "Face Creams",
            description: "Moisturizing face creams",
            image_url: "",
            created_at: "2025-06-24T15:07:02.389895Z",
            updated_at: "2025-06-24T15:07:02.389895Z"
          }
        ],
        count: 2
      }
    ]
  },
  {
    id: "aa705683-38ea-4f87-9356-fe5ef0d45486",
    name: "Fine Jewelry",
    description: "Exquisite with indo-western craftsmanship",
    image_url: "https://old.katerinaperez.com/uploads/editor_file/link/24614/exquiaite-jewellery-emerald-necklace.jpg",
    created_at: "2025-06-30T15:13:22.633863Z",
    updated_at: "2025-07-03T04:50:07.696162Z",
    category: [
      {
        id: "d1e2f3g4-5678-9012-3456-789012345681",
        main_category_id: "aa705683-38ea-4f87-9356-fe5ef0d45486",
        name: "Necklaces",
        description: "Beautiful necklaces",
        created_at: "2025-06-24T07:20:49.613139Z",
        updated_at: "2025-06-24T07:20:49.613139Z",
        sub_category: [
          {
            id: "e1f2g3h4-5678-9012-3456-789012345682",
            main_category_id: "aa705683-38ea-4f87-9356-fe5ef0d45486",
            category_id: "d1e2f3g4-5678-9012-3456-789012345681",
            name: "Gold Necklaces",
            description: "Pure gold necklaces",
            image_url: "",
            created_at: "2025-06-24T15:07:02.389895Z",
            updated_at: "2025-06-24T15:07:02.389895Z"
          },
          {
            id: "f1g2h3i4-5678-9012-3456-789012345683",
            main_category_id: "aa705683-38ea-4f87-9356-fe5ef0d45486",
            category_id: "d1e2f3g4-5678-9012-3456-789012345681",
            name: "Silver Necklaces",
            description: "Sterling silver necklaces",
            image_url: "",
            created_at: "2025-06-24T15:07:02.389895Z",
            updated_at: "2025-06-24T15:07:02.389895Z"
          }
        ],
        count: 3
      },
      {
        id: "g1h2i3j4-5678-9012-3456-789012345684",
        main_category_id: "aa705683-38ea-4f87-9356-fe5ef0d45486",
        name: "Earrings",
        description: "Elegant earrings",
        created_at: "2025-06-24T07:20:49.613139Z",
        updated_at: "2025-06-24T07:20:49.613139Z",
        sub_category: [
          {
            id: "h1i2j3k4-5678-9012-3456-789012345685",
            main_category_id: "aa705683-38ea-4f87-9356-fe5ef0d45486",
            category_id: "g1h2i3j4-5678-9012-3456-789012345684",
            name: "Stud Earrings",
            description: "Classic stud earrings",
            image_url: "",
            created_at: "2025-06-24T15:07:02.389895Z",
            updated_at: "2025-06-24T15:07:02.389895Z"
          }
        ],
        count: 5
      }
    ]
  },
  {
    id: "fcfa4ef3-b263-482a-8bd9-530690536dae",
    name: "Home & Kitchen",
    description: "Contemporary luxury home decor",
    image_url: "https://imgmediagumlet.lbb.in/media/2023/03/641ad00f3b0e3b6d05db5675_1679478799910.jpg",
    created_at: "2025-06-30T16:07:04.080186Z",
    updated_at: "2025-07-03T04:52:49.337701Z",
    category: [
      {
        id: "i1j2k3l4-5678-9012-3456-789012345686",
        main_category_id: "fcfa4ef3-b263-482a-8bd9-530690536dae",
        name: "Decor",
        description: "Home decoration items",
        created_at: "2025-06-24T07:20:49.613139Z",
        updated_at: "2025-06-24T07:20:49.613139Z",
        sub_category: [
          {
            id: "j1k2l3m4-5678-9012-3456-789012345687",
            main_category_id: "fcfa4ef3-b263-482a-8bd9-530690536dae",
            category_id: "i1j2k3l4-5678-9012-3456-789012345686",
            name: "Wall Art",
            description: "Beautiful wall decorations",
            image_url: "",
            created_at: "2025-06-24T15:07:02.389895Z",
            updated_at: "2025-06-24T15:07:02.389895Z"
          }
        ],
        count: 1
      }
    ]
  },
  {
    id: "45c24eb1-e672-4ae1-a888-9fff9bd27393",
    name: "Heritage Jewellery",
    description: "Heritage jewellery with modern asthetics",
    image_url: "https://jewelboxbyarnav.com/cdn/shop/articles/11_antique.jpg?v=1695290737&width=1920",
    created_at: "2025-06-30T16:05:11.353301Z",
    updated_at: "2025-07-03T04:55:33.967857Z",
    category: [
      {
        id: "k1l2m3n4-5678-9012-3456-789012345688",
        main_category_id: "45c24eb1-e672-4ae1-a888-9fff9bd27393",
        name: "Traditional Sets",
        description: "Complete traditional jewelry sets",
        created_at: "2025-06-24T07:20:49.613139Z",
        updated_at: "2025-06-24T07:20:49.613139Z",
        sub_category: [
          {
            id: "l1m2n3o4-5678-9012-3456-789012345689",
            main_category_id: "45c24eb1-e672-4ae1-a888-9fff9bd27393",
            category_id: "k1l2m3n4-5678-9012-3456-789012345688",
            name: "Bridal Sets",
            description: "Traditional bridal jewelry sets",
            image_url: "",
            created_at: "2025-06-24T15:07:02.389895Z",
            updated_at: "2025-06-24T15:07:02.389895Z"
          }
        ],
        count: 10
      }
    ]
  }
];

// Local storage helper functions
export class LocalStorageManager {
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
      const initialProducts = products.map(product => ({
        ...product,
        id: product.id || this.generateId(),
        seller_id: product.seller_id || 'rohit@gmail.com',
        seller_email: product.seller_email || 'rohit@gmail.com',
        created_at: product.created_at || new Date().toISOString(),
        updated_at: product.updated_at || new Date().toISOString(),
        stock_quantity: (product as any).stock_quantity || (product as any).quantity || 10,
        images: product.images || [product.image_url || product.imageUrl],
        visible: (product as any).visible !== false,
        status: product.inStock ? 'in-stock' : 'out-of-stock'
      }));

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
        localStorage.setItem('user_orders', JSON.stringify(orders));
      }
    } catch (error) {
      console.error('Error initializing orders:', error);
    }
  }

  // Category Tree Management - Single Source of Truth
  static getCategoryTree(): MainCategory[] {
    if (typeof window === 'undefined') return mainCategories;
    try {
      const categoryTree = localStorage.getItem('categoryTree');
      if (!categoryTree) {
        // Initialize with default categories if not exists
        this.setCategoryTree(mainCategories);
        return mainCategories;
      }
      return JSON.parse(categoryTree);
    } catch (error) {
      console.error('Error getting category tree:', error);
      return mainCategories;
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
      this.setCategoryTree(mainCategories);
      return mainCategories;
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

// Static fetcher replacement - simulates API responses with static data
export const staticFetcher = async (url: string): Promise<any> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 200));

  console.log('Static fetcher called for:', url);

  // Route static responses based on URL patterns
  if (url.includes('/main-category/getAll')) {
    return mainCategories;
  }

  if (url.includes('/category/list')) {
    const params = new URLSearchParams(url.split('?')[1]);
    const mainCategoryId = params.get('main_category_id');
    const mainCategory = mainCategories.find(cat => cat.id === mainCategoryId);
    return { data: mainCategory?.category || [] };
  }

  if (url.includes('/subcategory/list')) {
    const params = new URLSearchParams(url.split('?')[1]);
    const categoryId = params.get('category_id');
    // Find subcategories for the given category
    let subCategories: SubCategory[] = [];
    mainCategories.forEach(mainCat => {
      mainCat.category?.forEach(cat => {
        if (cat.id === categoryId) {
          subCategories = cat.sub_category || [];
        }
      });
    });
    return { data: subCategories };
  }

  if (url.includes('/products/list')) {
    const params = new URLSearchParams(url.split('?')[1]);
    const mainCategoryId = params.get('main_category_id');
    const categoryId = params.get('category_id');
    const subcategoryId = params.get('subcategory_id');
    const page = parseInt(params.get('page') || '1');
    const limit = parseInt(params.get('limit') || '10');

    let filteredProducts = [...apiProducts];

    if (mainCategoryId) {
      filteredProducts = filteredProducts.filter(p => p.main_category_id === mainCategoryId);
    }
    if (categoryId) {
      filteredProducts = filteredProducts.filter(p => p.category_id === categoryId);
    }
    if (subcategoryId) {
      filteredProducts = filteredProducts.filter(p => p.subcategory_id === subcategoryId);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      data: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit
    };
  }

  if (url.includes('/discover/list')) {
    return { data: discoverCategories };
  }

  if (url.includes('/elite/list')) {
    return { data: eliteBrands };
  }

  // Single product by ID
  if (url.match(/\/products\/[^\/]+$/)) {
    const productId = url.split('/').pop();
    const product = apiProducts.find(p => p.id === productId);
    return product || null;
  }

  // Default fallback
  console.warn('Unknown static route:', url);
  return null;
};

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

// Additional static data for consistency
export const apiProducts = products;
export const discoverCategories = mainCategories.slice(0, 4);
export const eliteBrands = brands.slice(0, 6);