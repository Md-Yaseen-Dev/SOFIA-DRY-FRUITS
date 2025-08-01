'use client';
import Image from 'next/image';
import BannerImage from './banner-image';

export default function AboutPage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Main content with padding */}
      <div className="px-4 md:px-16 py-10 space-y-7">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">About Us</h1>
          <p className="text-lg text-gray-600">India's home for fashion that celebrates self-expression.</p>
        </div>

        {/* Store Image */}
        <div className="w-full h-[300px] md:h-[350px] relative rounded-lg overflow-hidden shadow-lg">
          <Image
            src="/shopping.jpg"
            alt="SOFIA Storefront"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Highlighted Section */}
        <div className="bg-[#FFEDD5] text-orange-400 text-center py-10 px-6 rounded-md">
          <p className="text-lg leading-relaxed max-w-5xl mx-auto">
            With the trendiest, freshest, and most unique styles from across India and the world, <strong>SOFIA</strong> invites you to express your personal style fearlessly — with confidence and optimism that can't be shaken.
          </p>
        </div>

        {/* Two Column Section */}
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-sm text-gray-800 font-semibold mb-2">
              SOFIA <span className="text-sm text-gray-600">Dry Fruits</span>
            </h2>
            <p className="text-gray-500">
              <strong>SOFIA <span className="text-xs font-semibold text-gray-500">Dry Fruits</span></strong> is our own private label – designed in-house for those who want one-of-a-kind,
              head-turning styles. Every collection is created with bold Indian flair and individuality in mind.
            </p>
          </div>

          <div>
            <h2 className="text-sm text-gray-800 font-semibold mb-2">Global & Local Trends</h2>
            <p className="text-gray-500">
              We curate the most exclusive and trendy looks — from global runways to local artisans. Forget browsing endlessly
              for what's in vogue. SOFIA brings it all directly to your wardrobe.
            </p>
          </div>
        </div>

        {/* Highlighted Section */}
        <div className="bg-[#FFEDD5] text-orange-400 text-center py-10 px-6 rounded-md space-y-4">
          <p className="text-lg max-w-4xl mx-auto">
            Why let a world that loves to police your wardrobe decide what you wear?
          </p>
          <p className="text-lg max-w-4xl mx-auto">
            So the next time someone says <em>"That's too bold!"</em> or <em>"Is that even your size?"</em>, wear it anyway. When it comes to self-expression, there should never be regrets.
          </p>
        </div>

        {/* Capsule & Indie Section */}
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-sm text-gray-800 font-semibold mb-2">Capsule Collections</h2>
            <p className="text-gray-500 mb-7">
              For every mood, moment, or celebration — SOFIA brings you capsule collections that let your
              personality shine. Whether it's brunch with friends or a Diwali party, we've got your vibe covered.
            </p>
            <h3 className="text-sm text-gray-800 font-semibold mb-2">Style Circle</h3>
            <p className="text-gray-500">
              A high-fashion editorial where we feature India's coolest fashion-forward voices. Explore their stories and shop their
              curated looks straight from the spotlight. Style inspiration starts here.
            </p>
          </div>
          <div>
            <h2 className="text-sm text-gray-800 font-semibold mb-2">The Indie Experience</h2>
            <p className="text-gray-500 mb-7">
              Our Indie collections are handcrafted with soul. Each piece is made by skilled Indian artisans, carefully selected to
              offer you wearable art that reflects tradition, heritage, and modern flair.
            </p>
            <h3 className="text-sm text-gray-800 font-semibold mb-2">Recommends SOFIA</h3>
            <p className="text-gray-500">
              A space where we celebrate our most stylish customers — those who've tagged us while flaunting their SOFIA fits.
              Who knows? You might just be our next feature.
            </p>
          </div>
        </div>

        {/* Final Statement */}
        <div className="text-center mt-16 text-lg max-w-3xl mx-auto">
          <p className="text-gray-500 font-semibold">
               SOFIA is more than fashion — it's a platform for bold expression, individuality, and inclusivity.  
            Shop online at <a href="https://www.Alfalah-house.in" className="text-orange-600">SOFIA.in</a> and discover how fashion meets freedom, comfort, and culture — all in one place.
          </p>
        </div>
      </div>

      {/* Full-width Banner Image Section */}
      <div className="relative w-full">
        <BannerImage />
      </div>
    </div>
  );
}