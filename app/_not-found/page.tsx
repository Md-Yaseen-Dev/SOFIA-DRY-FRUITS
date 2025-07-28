import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import IndianPatternBg from '@/components/indian-pattern-bg';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
      <IndianPatternBg />
      
      <div className="text-center z-10 px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => router.back()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Go Back
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="border-orange-500 text-orange-500 hover:bg-orange-50 font-medium py-2 px-6 rounded-full transition-all transform hover:scale-105"
            >
              Return Home
            </Button>
          </div>
        </div>
        
        
        <div className="mt-12">
          <p className="text-sm text-gray-500 mb-2">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="ghost" onClick={() => router.push('/products')} className="text-orange-500 hover:bg-orange-50">
              Shop Now
            </Button>
            <Button variant="ghost" onClick={() => router.push('/about')} className="text-orange-500 hover:bg-orange-50">
              About Us
            </Button>
            <Button variant="ghost" onClick={() => router.push('/contact')} className="text-orange-500 hover:bg-orange-50">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

