"use client";
import { Button } from "@/components/ui/button";

export default function SpotlightBanner() {
  return (
    <section className="py-16 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative">
          <span className="relative z-10 mb-1">Spotlight On</span>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-orange-500 rounded-full"></div>
        </h2>
      </div>

      <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black overflow-hidden shadow-2xl">
          {/* Elegant Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          <div className="flex flex-col lg:flex-row items-center relative z-10">
            {/* Content Section */}
            <div className="flex-1 p-8 lg:p-16 max-w-7xl mx-auto">
              <div className="max-w-2xl">
                <div className="mb-6">
                  <h3 className="text-4xl lg:text-5xl font-light text-white mb-3 tracking-[0.2em] font-serif">
                  Shifa Nour
                  </h3>
                  <div className="w-24 h-px bg-gradient-to-r from-orange-400 to-amber-300"></div>
                </div>
                
                <p className="text-xl lg:text-2xl text-gray-300 mb-6 leading-relaxed font-light">
                  Discover The Magnificent Legacy of Master Artisans
                </p>
                
                <p className="text-base lg:text-lg text-gray-400 mb-8 leading-relaxed">
                  Where heritage meets luxury. Experience curated collections from India's most 
                  celebrated craftsmen, bringing centuries of tradition to the modern connoisseur.
                </p>
                
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-10 py-4 rounded-none font-light tracking-widest transition-all duration-300 shadow-lg hover:shadow-xl border border-orange-400/30">
                  DISCOVER COLLECTION
                </Button>
              </div>
            </div>

            {/* Image Section */}
            <div className="flex-1 relative h-80 lg:h-[500px]">
              <img
                src="https://images.unsplash.com/photo-1608042314453-ae338d80c427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800"
                alt="Royal luxury jewelry"
                className="w-full h-full object-cover"
              />
              {/* Gold accent overlay */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-gray-900/60"></div>
              <div className="absolute top-8 right-8">
                <div className="w-16 h-16 border-2 border-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-orange-400 text-xs font-light tracking-widest">LUXURY</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
}