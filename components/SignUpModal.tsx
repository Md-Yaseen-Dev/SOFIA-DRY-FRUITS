
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { MockUserAuth } from '@/lib/user-auth';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
}

export default function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: '',
      });
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError('');
      setAgreedToTerms(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mobile' ? value.replace(/[^0-9]/g, '') : value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Terms validation
    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    // Mobile number validation (optional but if provided, should be valid)
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    
    try {
      // Use mock authentication but without auto-login
      const result = MockUserAuth.signUpWithoutLogin(
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.name
      );

      if (result.success) {
        // Show success toast
        const event = new CustomEvent('showToast', {
          detail: {
            message: 'Account created successfully. Please log in to continue.',
            type: 'success'
          }
        });
        window.dispatchEvent(event);

        // Close signup modal and switch to login modal
        onClose();
        onSwitchToSignIn();
      } else {
        setError(result.error || 'An error occurred during sign up');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm" style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xs md:rounded-2xl shadow-xl border border-orange-100 ring-1 ring-orange-200 w-[95vw] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-3 sm:p-6 md:p-8 relative flex flex-col max-h-[95vh] overflow-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {/* Branding */}
        <div className="flex flex-col items-center pt-0 pb-4 px-2 border-orange-100">
          <div className="text-2xl font-bold text-orange-400"><span className="text-green-600">SOFIA</span></div>
          <div className="text-xs font-medium text-orange-300 tracking-widest uppercase">
            BY ARTISANS OF BHARAT
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-4 pt-1 pb-40">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Welcome</h2>
          
          <form id="signup-form" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300  px-4 py-1.5 bg-white text-base placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300  px-4 py-1.5 bg-white text-base placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-bold text-gray-700 mb-1">
                Mobile Number (Optional)
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3  border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +91
                </span>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  maxLength={10}
                  placeholder="Enter your mobile number (optional)"
                  className="w-full border border-gray-300  px-4 py-1.5 bg-white text-base placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full border border-gray-300  px-4 py-1.5 bg-white text-base placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300  px-4 py-1.5 bg-white text-base placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-start mb-0">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded mt-1"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the <a href="/conditions" className="text-orange-500 hover:text-orange-600">Terms of Service</a> and{' '}
                <a href="/privacy-policy" className="text-orange-500 hover:text-orange-600">Privacy Policy</a>
              </label>
            </div>
          </form>
        </div>

        {/* Fixed Create Account Button */}
        <div className="absolute left-0 right-0 bottom-0 px-4 pb-7 pt-4 bg-white border-t border-orange-100 flex flex-col gap-3 items-center">
          <button
            type="submit"
            form="signup-form"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 text-base font-semibold rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            style={{ minHeight: 40 }}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-orange-500 hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
