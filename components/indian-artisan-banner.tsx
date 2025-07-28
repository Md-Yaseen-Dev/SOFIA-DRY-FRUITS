"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function IndianArtisanBanner() {
  const router = useRouter();

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 relative">
            <span className="relative z-10">Celebrate Craftsmanship</span>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-orange-500 rounded-full"></div>
          </h2>
          <p className="text-gray-600 text-sm md:text-base mt-4 italic">Wear the Story. Live the Craft</p>
        </div>

        <div className="bg-black rounded-2xl overflow-hidden relative">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative z-10 px-8 md:px-12 py-12 md:py-16">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-white">
                <div className="text-sm text-gray-300 tracking-widest mb-3">
                  HANDCRAFTED
                </div>
                
                <h3 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  TIMELESS
                  <br />
                  <span className="text-white">ARTISTRY</span>
                </h3>
                
                <p className="text-lg mb-8 text-gray-300 leading-relaxed max-w-md">
                Discover the beauty of Indian craftsmanship
                </p>
                
                <Button
                  onClick={() => router.push("products/home-and-kitchen/home-essentials/decor")}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-none font-semibold transition-colors duration-200 uppercase tracking-wider"
                >
                  SHOP NOW
                </Button>
              </div>

              {/* Right Product Image */}
              <div className="relative flex justify-center">
                <div className="relative">
                  {/* Main product showcase */}
                  <div className="relative">
                    <img
                      src="/decor1.avif"
                      alt="Handwoven Silk Saree"
                      className="w-80 h-64 object-cover rounded-lg"
                    />
                    
                    {/* Floating accent product */}
                    <div className="absolute -bottom-6 -right-6 border-2 border-white ">
                      <img
                        src="/handcrafts.jpeg"
                        alt="Traditional Jewelry"
                        className="w-50 h-20 object-cover "
                      />
                    </div>
                  </div>
                  
                  {/* Textured base */}
                  {/* <div className="absolute -bottom-4 -left-4 w-full h-8 bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg opacity-60"></div> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}