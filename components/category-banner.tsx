"use client";
import { useRouter } from "next/navigation";


export default function CategoryBanner() {
  const router = useRouter();

  // Static popular categories - these are subcategories/product types
  // Main categories are now fetched dynamically from API
  const popularCategories = [
    {
      id: 1,
      name: "Men's Clothing",
      imageUrl: "/menclothing.avif",
      slug: "mens-clothing"
    },
    {
      id: 2,
      name: "Men's Footwear",
      imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      slug: "mens-footwear"
    },
    {
      id: 3,
      name: "Women's Clothing",
      imageUrl: "/womenclothing.jpg",
      slug: "womens-clothing"
    },
    {
      id: 4,
      name: "Women's Footwear",
      imageUrl: "/tradslippers.jpg",
      slug: "womens-footwear"
    },
    {
      id: 5,
      name: "Watches",
      imageUrl: "/singlewatch.jpeg",
      slug: "watches"
    },
    {
      id: 6,
      name: "Athleisure",
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      slug: "athleisure"
    },
    {
      id: 7,
      name: "Beauty",
      imageUrl: "/makeup1.jpg",
      slug: "beauty"
    },
    {
      id: 8,
      name: "Travel & Bags",
      imageUrl: "/travelbags.jpg",
      slug: "travel-bags"
    },
    {
      id: 9,
      name: "Kids",
      imageUrl: "/babydress.jpg",
      slug: "kids"
    },

    {
      id: 10,
      name: "Home",
      imageUrl: "/home.avif",
      slug: "home"
    },
    {
      id: 11,
      name: "Jewellery",
      imageUrl: "/indowestern.webp",
      slug: "jewellery"
    },
    {
      id: 12,
      name: "Handicrafts",
      imageUrl: "/handcrafts.jpeg",
      slug: "handicrafts"
    }
  ];

  const handleCategorySelect = (slug: string) => {
    router.push(`/products/${slug}`);
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative">
            <span className="relative z-10">People’s Favorites</span>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-orange-500 rounded-full"></div>
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-4 italic">Crafted in India, Loved Everywhere</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
          {popularCategories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer"
              onClick={() => handleCategorySelect(category.slug)}
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 text-center">
                  <h3 className="truncate" style={{color: '#33312e', fontSize: '14px', fontWeight: 400}}>{category.name}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
