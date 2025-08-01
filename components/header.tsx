"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, Globe, Heart, ChevronDown } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "./ui/select";
import { LocalStorageManager } from "@/lib/mock-data";
import { MockUserAuth } from "@/lib/user-auth";
import AuthModals from "./AuthModel";
import { useCategoryTree } from "@/hooks/use-category-tree";
import MainCategories from "./main-categories";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [selectedMobileCategory, setSelectedMobileCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [hoveredMainCategoryId, setHoveredMainCategoryId] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'signin' | 'signup'>('signin');
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // User authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Use shared category tree hook with memoized parsing
  const { categoryTree, isLoading: categoryTreeLoading } = useCategoryTree();
  const categoryTreeError = false; // The hook handles errors internally

  // Memoize category tree parsing to prevent lag
  const memoizedCategoryTree = useMemo(() => {
    if (!categoryTree || categoryTree.length === 0) return [];
    return categoryTree.filter(mainCategory => 
      mainCategory && mainCategory.id && mainCategory.name
    );
  }, [categoryTree]);

  // Check authentication status
  useEffect(() => {
    const checkAuthStatus = () => {
      const loggedIn = MockUserAuth.isLoggedIn();
      const user = MockUserAuth.getCurrentUser();
      setIsLoggedIn(loggedIn);
      setCurrentUser(user);
    };

    checkAuthStatus();

    // Listen for auth changes
    const handleStorageChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = LocalStorageManager.getCart();
      const totalItems = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCartItemCount(totalItems);
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  // Update wishlist count
  useEffect(() => {
    const updateWishlistCount = () => {
      const wishlist = LocalStorageManager.getWishlist();
      setWishlistItemCount(wishlist.length);
    };

    updateWishlistCount();
    window.addEventListener('wishlistUpdated', updateWishlistCount);
    return () => window.removeEventListener('wishlistUpdated', updateWishlistCount);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleMainCategoryClick = (categoryId: string, categoryName: string) => {
    const slug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    router.push(`/products/${slug}`);
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
    setHoveredMainCategoryId(null);
  };

  const handleCategoryClick = (mainCategoryId: string, categoryId: string, categoryName: string, mainCategoryName: string) => {
    const mainSlug = mainCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    router.push(`/products/${mainSlug}/${categorySlug}`);
    setIsMobileMenuOpen(false);
    setIsMegaMenuOpen(false);
    setHoveredMainCategoryId(null);
  };

  const handleSubCategoryClick = (mainCategoryId: string, categoryId: string, subCategoryId: string, subCategoryName: string, categoryName: string, mainCategoryName: string) => {
    const mainSlug = mainCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    const subSlug = subCategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    router.push(`/products/${mainSlug}/${categorySlug}/${subSlug}`);
    setIsMobileMenuOpen(false);
    setSelectedMobileCategory(null);
    setSelectedSubCategory(null);
    setIsMegaMenuOpen(false);
    setHoveredMainCategoryId(null);
  };

  const handleUserIconClick = () => {
    if (isLoggedIn) {
      setIsUserDropdownOpen(!isUserDropdownOpen);
    } else {
      setIsAuthModalOpen(true);
      setAuthModalType('signin');
    }
  };

  const handleLogout = () => {
    MockUserAuth.signOut();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsUserDropdownOpen(false);

    // Show logout success toast
    const event = new CustomEvent('showToast', {
      detail: {
        message: 'Successfully logged out',
        type: 'success'
      }
    });
    window.dispatchEvent(event);

    // Refresh page to update UI
    router.refresh();
  };

  return (
    <>
      <header className={`
        ${pathname === "/" ? "fixed" : "sticky"}
        top-0 left-0 w-full z-50 text-black
        ${pathname === "/" && scrolled ? "bg-white shadow-lg" : pathname === "/" ? "bg-transparent" : "bg-white shadow-sm"}
        transition-colors duration-300
        ${isAuthModalOpen ? "relative" : ""}
      `}>
        <div className="header-block relative">
          {/* Backdrop overlay when auth modal is open */}
          {isAuthModalOpen && (
            <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 pointer-events-none" />
          )}
          
          <AuthModals
            isOpen={isAuthModalOpen}
            onClose={() => {
              setIsAuthModalOpen(false);
              setAuthModalType('signin');
              // Check auth status after modal closes
              setTimeout(() => {
                const loggedIn = MockUserAuth.isLoggedIn();
                const user = MockUserAuth.getCurrentUser();
                setIsLoggedIn(loggedIn);
                setCurrentUser(user);
              }, 100);
            }}
            initialModal={authModalType}
          />

          {/* Main Header Bar */}
          <div className={`relative z-50 ${isAuthModalOpen ? 'pointer-events-none' : ''}`}>
            <nav className="max-w-7xl mx-auto  sm:px-6 lg:px-8">
              <div className={`relative flex w-full items-center pl-2 md:pl-0  h-16 md:px-2 sm:px-0 transition-all duration-300 ${isAuthModalOpen ? 'opacity-50 blur-sm' : ''}`}>
                {/* Logo */}
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Link href="/" className="flex flex-col items-start">
                      <div className={`text-lg md:text-xl lg:text-2xl font-bold tracking-tight ${pathname === "/" && !scrolled ? "text-white" : "text-deep-black"}`}>
                        <span className="text-green-600">SOFIA</span><span className={`${ pathname === "/" && !scrolled ? "text-white" : "text-deep-sky-blue"}`}></span>
                      </div>
                      <div className={`text-xs font-medium tracking-widest uppercase ${pathname === "/" && !scrolled ? "text-orange-200" : "text-orange-300"}`}>
                        Dry Fruits 
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Search Bar - Desktop */}
                <div className="hidden md:flex flex-1 justify-center mx-8">
                  <form onSubmit={handleSearch} className="w-full max-w-2xl">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search products..."
                        className={`w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 ${
                          pathname === "/" && !scrolled 
                            ? "bg-white/20 border border-white/30 text-white placeholder-white/70 backdrop-blur-sm" 
                            : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                        }`}
                      />
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                        pathname === "/" && !scrolled ? "text-white/70" : "text-gray-400"
                      }`} />
                    </div>
                  </form>
                </div>

                {/* Right Icons */}
                <div className="flex justify-end items-center space-x-2 ml-auto md:ml-0">
                  {/* User Icon with Dropdown */}
                  <div className="relative " ref={userDropdownRef}>
                    <button
                      className={`p-2 rounded-full transition-all duration-200 flex items-center space-x-1 ${pathname === "/" ? "hover:bg-white/20" : "hover:bg-gray-100"}`}
                      onClick={handleUserIconClick}
                      aria-label={isLoggedIn ? "User menu" : "Sign in"}
                    >
                      <User className={`h-5 w-5 transition-all duration-200 ${pathname === "/" && !scrolled ? "text-white" : "text-black"}`} />
                      {isLoggedIn && (
                        <ChevronDown className={`h-4 w-4 transition-all duration-200 ${pathname === "/" && !scrolled ? "text-white" : "text-black"}`} />
                      )}
                    </button>

                    {/* User Dropdown */}
                    {isLoggedIn && isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            👋 {currentUser?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">{currentUser?.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            router.push('/orders');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <span>📋</span>
                          <span>My Orders</span>
                        </button>
                        <button
                          onClick={() => {
                            router.push('/my-rfqs');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <span>📝</span>
                          <span>My RFQs</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    className={`p-2 rounded-full relative transition-all duration-200 ${pathname === "/" ? "hover:bg-white/20" : "hover:bg-gray-100"}`}
                    aria-label="Wishlist"
                    onClick={() => router.push('/wishlist')}
                  >
                    <Heart className={`h-5 w-5 transition-all duration-200 ${pathname === "/" && !scrolled ? "text-white" : "text-black"}`} />
                    {wishlistItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {wishlistItemCount}
                      </span>
                    )}
                  </button>
                  <button
                    className={`p-2 rounded-full relative transition-all duration-200 ${pathname === "/" ? "hover:bg-white/20" : "hover:bg-gray-100"}`}
                    onClick={() => router.push('/cart')}
                    aria-label="Shopping cart"
                  >
                    <ShoppingBag className={`h-5 w-5 transition-all duration-200 ${pathname === "/" && !scrolled ? "text-white" : "text-black"}`} />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <div className="lg:hidden ml-2">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className={`p-2 rounded-md ${pathname === "/" && !scrolled ? "text-white" : "text-gray-700"}`}
                    aria-label="Open main menu"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </nav>
          </div>

          {/* Mobile Search Bar */}
          <div className={`md:hidden border-t ${pathname === "/" && !scrolled ? "border-white/20" : "border-gray-200"} ${isAuthModalOpen ? 'pointer-events-none' : ''}`}>
            <div className={`px-4 py-3 transition-all duration-300 ${isAuthModalOpen ? 'opacity-50 blur-sm' : ''}`}>
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300 ${
                      pathname === "/" && !scrolled 
                        ? "bg-white/20 border border-white/30 text-white placeholder-white/70 backdrop-blur-sm focus:bg-white/30" 
                        : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                    disabled={isAuthModalOpen}
                  />
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${
                    pathname === "/" && !scrolled ? "text-white/70" : "text-gray-400"
                  }`} />
                </div>
              </form>
            </div>
          </div>

          {/* Main Categories Component */}
          <MainCategories isScrolled={scrolled} pathname={pathname} disabled={isAuthModalOpen} />

          {/* Mobile menu */}
          {isMobileMenuOpen && !isAuthModalOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-white">
              <div className="flex items-center justify-between p-4 border-b">
                <Link href="/" className="flex flex-col items-start">
                  <div className="text-xl font-bold text-deep-black">
                    <span className="text-orange-400"></span><span className="text-green-600">SOFIA</span>
                  </div>
                  <div className="text-xs font-medium text-orange-300 tracking-widest uppercase">
                    BY ARTISANS OF BHARAT
                  </div>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-700"
                  aria-label="Close menu"
                >
                  ×
                </button>
              </div>

              <div className="p-4">
                {/* Mobile User Section */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  {isLoggedIn ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            👋 {currentUser?.name || 'User'}
                          </p>
                          <p className="text-xs text-gray-500">{currentUser?.email}</p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Logout
                        </button>
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            router.push('/orders');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left py-2 px-3 bg-white rounded-md hover:bg-gray-100 text-sm font-medium text-gray-700 flex items-center space-x-2"
                        >
                          <span>📋</span>
                          <span>My Orders</span>
                        </button>
                        <button
                          onClick={() => {
                            router.push('/my-rfqs');
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left py-2 px-3 bg-white rounded-md hover:bg-gray-100 text-sm font-medium text-gray-700 flex items-center space-x-2"
                        >
                          <span>📝</span>
                          <span>My RFQs</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setAuthModalType('signin');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-orange-500 hover:text-orange-600"
                    >
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">Sign In / Sign Up</span>
                    </button>
                  )}
                </div>

                {/* Mobile Categories */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Categories</h3>

                  {categoryTreeLoading ? (
                    <div className="text-center py-4">
                      <div className="text-gray-500">Loading categories...</div>
                    </div>
                  ) : categoryTreeError ? (
                    <div className="text-center py-4">
                      <div className="text-red-500">Error loading categories</div>
                    </div>
                  ) : !memoizedCategoryTree || memoizedCategoryTree.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-gray-500">No categories available</div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {memoizedCategoryTree.map((mainCategory) => {
                        if (!mainCategory || !mainCategory.id || !mainCategory.name) {
                          return null;
                        }

                        return (
                          <div key={mainCategory.id} className="border border-gray-200 rounded-lg">
                            <button
                              onClick={() => {
                                if (selectedMobileCategory === mainCategory.id) {
                                  setSelectedMobileCategory(null);
                                } else {
                                  setSelectedMobileCategory(mainCategory.id);
                                }
                              }}
                              className="w-full px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between"
                            >
                              <span>{mainCategory.name}</span>
                              <ChevronDown className={`h-4 w-4 transition-transform ${selectedMobileCategory === mainCategory.id ? 'rotate-180' : ''}`} />
                            </button>

                            {selectedMobileCategory === mainCategory.id && mainCategory.category && Array.isArray(mainCategory.category) && (
                              <div className="border-t border-gray-200 bg-gray-50">
                                {mainCategory.category.map((category) => {
                                  if (!category || !category.id || !category.name) {
                                    return null;
                                  }

                                  return (
                                    <div key={category.id}>
                                      <button
                                        onClick={() => {
                                          if (selectedSubCategory === category.id) {
                                            setSelectedSubCategory(null);
                                          } else {
                                            setSelectedSubCategory(category.id);
                                          }
                                        }}
                                        className="w-full px-6 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
                                      >
                                        <span>{category.name}</span>
                                        {category.sub_category && Array.isArray(category.sub_category) && category.sub_category.length > 0 && (
                                          <ChevronDown className={`h-3 w-3 transition-transform ${selectedSubCategory === category.id ? 'rotate-180' : ''}`} />
                                        )}
                                      </button>

                                      {selectedSubCategory === category.id && category.sub_category && Array.isArray(category.sub_category) && (
                                        <div className="bg-gray-100">
                                          {category.sub_category.map((subCategory) => {
                                            if (!subCategory || !subCategory.id || !subCategory.name) {
                                              return null;
                                            }

                                            return (
                                              <button
                                                key={subCategory.id}
                                                onClick={() => handleSubCategoryClick(mainCategory.id, category.id, subCategory.id, subCategory.name, category.name, mainCategory.name)}
                                                className="w-full px-8 py-2 text-left text-xs text-gray-600 hover:bg-gray-200"
                                              >
                                                {subCategory.name}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}