"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import IndianPatternBg from "./indian-pattern-bg";

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  description?: string;
  posterUrl: string;
  ctaText: string;
  ctaLink: string;
  brand?: string;
  location: string;
  ctaSecondaryText?: string;
}

const heroSlides: HeroSlide[] = [
  {
    id: 1,
    title: "Handcrafted Silk Sarees",
    subtitle: "From the Master Weavers of Kanchipuram",
    posterUrl: "/silk sarees.jpg",
    ctaText: "Explore Sarees",
    ctaLink: "/products/womenswear/ethnicwear/sarees",
    location: "Tamil Nadu, India"
  },
  {
    id: 2,
    title: "Royal Artisan Jewellery",
    subtitle: "Crafted by Rajasthan's Master Goldsmiths",
    posterUrl: "/Artisan Jewllery.png",
    ctaText: "Discover Jewellery",
    ctaLink: "/products/accessories/jewellery",
    location: "Jaipur, Rajasthan"
  },
  {
    id: 3,
    title: "Luxurious Pashmina Shawls",
    subtitle: "From the Valleys of Kashmir",
    posterUrl: "/Pashmina Shawl.jpg",
    ctaText: "Shop Pashmina",
    ctaLink: "/products/womenswear/ethnicwear/shawls",
    location: "Srinagar, Kashmir"
  },
  {
    id: 4,
    title: "Sustainable Handloom Textiles",
    subtitle: "Organic Cotton from Gujarat Villages",
    posterUrl: "/hero-3.jpg",
    ctaText: "Explore Textiles",
    ctaLink: "/products/menswear/ethnicwear/jodhpuri-suits",
    location: "Kutch, Gujarat"
  }
];

export default function HeroSection() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const nextSlide = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    if (heroSlides.length <= 1) return;
    setCurrentSlide((prev) => {
      const next = (prev + 1) % heroSlides.length;
      // console.log('Next Slide:', next);
      return next;
    });
  }, []);

  const prevSlide = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    if (heroSlides.length <= 1) return;
    setCurrentSlide((prev) => {
      const prevIdx = (prev - 1 + heroSlides.length) % heroSlides.length;
      console.log('Prev Slide:', prevIdx);
      return prevIdx;
    });
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlayPause = () => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (videoRef.current) {
        if (prev) {
          videoRef.current.pause();
        } else {
          videoRef.current.play();
        }
      }
      return next;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleCTA = (link: string) => {
    router.push(link);
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <section className="relative h-[60vh] md:h-[80vh] lg:h-[100vh] overflow-hidden">
      {/* Hero Media (Image Only) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          key={currentSlide}
          src={currentSlideData.posterUrl}
          alt={currentSlideData.title}
          className="w-full h-full object-cover object-center absolute inset-0"
          style={{ zIndex: 0 }}
        />
      </div>

      {/* Overlay with Indian pattern */}
      <div className="absolute inset-0">
        {/* Mobile: strong black overlay */}
        <div className="block md:hidden absolute inset-0 bg-black/50" />
        {/* Desktop: heritage gradient overlay */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-br from-black/60 via-heritage-green/20 to-saffron-orange/30" />
      </div>
      <IndianPatternBg />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-full lg:max-w-3xl text-white">
            {/* Brand & Location */}
            <div className="mb-3 mt-20 md:mb-4 flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs md:text-sm opacity-90 font-sans">
              {currentSlideData.brand && (
                <span className="bg-gradient-to-r from-saffron-orange to-turmeric-yellow text-white px-3 py-1 rounded-full font-medium shadow">
                  {currentSlideData.brand}
                </span>
              )}
              <span className="hidden sm:inline text-gold-accent">•</span>
              <span className="text-lotus-pink font-medium">{currentSlideData.location}</span>
            </div>


            {/* Main Content */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 leading-tight">
              {currentSlideData.title}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 opacity-90 max-w-full lg:max-w-2xl leading-relaxed">
              {currentSlideData.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-start space-y-2">
              {/* Subtitle Button (gray, on top) */}
              {currentSlideData.subtitle && (
                <div className="mb-2">
                  <button
                    className="skew-x-[-16deg] bg-neutral-500/80 text-left text-white text-xs md:text-sm font-medium tracking-wide uppercase px-3 md:px-3 py-1.5 md:py-2 rounded-md shadow-sm"
                    tabIndex={-1}
                    disabled
                    style={{ letterSpacing: '0.04em' }}
                  >
                    <span className="block skew-x-[16deg]">{currentSlideData.subtitle}</span>
                  </button>
                </div>
              )}
              {/* CTA and Secondary CTA Buttons (below) */}
              <div className="flex items-center ">
                {/* Left: CTA Button (now black) */}
                <button
                  onClick={() => handleCTA(currentSlideData.ctaLink)}
                  className="relative z-10  skew-x-[-16deg] bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 shadow-md border-none rounded-l-lg rounded-r-sm transition-all duration-200"
                >
                  <span className="block skew-x-[16deg]">{currentSlideData.ctaText}</span>
                </button>
                {/* Right: Secondary Button (optional) */}
                {currentSlideData.ctaSecondaryText && (
                  <button
                    className="relative z-0 -ml-3 skew-x-[-16deg] bg-black hover:bg-neutral-800 text-white font-semibold text-sm md:text-base px-6 md:px-8 py-2 md:py-3 rounded-r-lg rounded-l-none transition-all duration-200 border-none shadow-md"
                    style={{ boxShadow: '2px 3px 12px 0 rgba(0,0,0,0.1)' }}
                    tabIndex={-1}
                    disabled
                  >
                    <span className="block skew-x-[16deg]">{currentSlideData.ctaSecondaryText}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="hidden md:flex absolute inset-y-0 left-4 items-center z-30">
        <button
          onClick={prevSlide}
          disabled={heroSlides.length <= 1}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-1.5 md:p-2 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-3 w-3 md:h-5 md:w-5" />
        </button>
      </div>
      <div className="hidden md:flex absolute inset-y-0 right-4 items-center z-30">
        <button
          onClick={nextSlide}
          disabled={heroSlides.length <= 1}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-1.5 md:p-2 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-3 w-3 md:h-5 md:w-5" />
        </button>
      </div>
      <div className="flex md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-30 space-x-6 justify-center items-center">
        <button
          onClick={prevSlide}
          disabled={heroSlides.length <= 1}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-1.5 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={nextSlide}
          disabled={heroSlides.length <= 1}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm text-white p-1.5 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Play/Pause Control */}
      <div className="absolute top-4 md:top-6 right-4 md:right-6">
        <button
          onClick={togglePlayPause}
          className="bg-opacity-100 hover:bg-opacity-70 p-1.5 md:p-2 rounded-full transition-all duration-300"
        >
          {/* {isPlaying ? <Pause className="h-3 w-3 md:h-4 md:w-4" /> : <Play className="h-3 w-3 md:h-4 md:w-4" />} */}
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-16 md:bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex space-x-2 md:space-x-3">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${index === currentSlide
                ? 'bg-gradient-to-r from-saffron-orange to-turmeric-yellow scale-125 shadow-lg'
                : 'bg-white bg-opacity-50 hover:bg-lotus-pink hover:bg-opacity-75'
                }`}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white bg-opacity-20">
        <div
          className="h-full bg-gradient-to-r from-saffron-orange via-turmeric-yellow to-heritage-green transition-all duration-100"
          style={{
            width: `${((currentSlide + 1) / heroSlides.length) * 100}%`
          }}
        />
      </div>
    </section>
  );
}