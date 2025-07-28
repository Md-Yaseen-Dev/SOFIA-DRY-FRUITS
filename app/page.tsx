"use client";
import HeroSection from '@/components/hero-section';
import FeaturedProducts from '@/components/featured-products';
import DiscoverCategories from '@/components/discover-categories';
import CategoryBanner from '@/components/category-banner';
import BrandShowcase from '@/components/brand-showcase';
import IndianArtisanBanner from '@/components/indian-artisan-banner';
import SpotlightBanner from '@/components/spotlight-banner';
import '../index.css'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryBanner />
      <IndianArtisanBanner />
      <FeaturedProducts />
      <DiscoverCategories />
      <SpotlightBanner />
      <BrandShowcase />
    </>
  );
}