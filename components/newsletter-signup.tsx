"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate newsletter subscription
    setTimeout(() => {
      toast({
        title: "Subscribed Successfully!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="py-16 bg-deep-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
        <p className="text-gray-300 mb-8">
          Get the latest fashion trends and exclusive offers delivered to your inbox
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto gap-4">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-primary-blue"
            disabled={isSubmitting}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary-blue hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe"}
          </Button>
        </form>

        <p className="text-xs text-gray-400 mt-4">
          By subscribing, you agree to our Privacy Policy and Terms of Service
        </p>
      </div>
    </section>
  );
}
