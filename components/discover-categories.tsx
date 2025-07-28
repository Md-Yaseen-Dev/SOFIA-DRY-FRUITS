"use client";
import { useRouter } from "next/navigation";
import { useCategoryTree } from "@/hooks/use-category-tree";

export default function DiscoverCategories() {
  const router = useRouter();
  const { categoryTree } = useCategoryTree();

  const handleCategoryClick = (mainCategory: any) => {
    const slug = mainCategory.name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
    router.push(`/products/${slug}`);
  };

  if (!categoryTree || categoryTree.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative inline-block">
              <span className="relative z-10">    Discover Categories</span>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-orange-500 rounded-full"></div>
            </h2>
            <p className="text-gray-600 text-sm md:text-base mt-3 italic">
            Explore our handpicked selection of authentic Indian products across various categories
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categoryTree.slice(0, 6).map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              onClick={() => handleCategoryClick(category)}
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={category.image_url || '/placeholder.png'}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-200">
                    {category.description || 'Discover authentic products'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}