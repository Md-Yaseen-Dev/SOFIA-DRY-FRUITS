'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { MockUserAuth } from '@/lib/user-auth';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  const [loginType, setLoginType] = useState<'mobile' | 'email'>('email');
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    mobile: '',
    otp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resendOtpSuccess, setResendOtpSuccess] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const router = useRouter();

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown > 0) {
      const interval = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpCooldown]);

  const startOtpCooldown = () => {
    setOtpCooldown(30);
    setResendOtpSuccess(false);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mobile || formData.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setMobileOtpSent(true);
    startOtpCooldown();
  };

  const handleResendOtp = () => {
    if (otpCooldown === 0) {
      startOtpCooldown();
      setResendOtpSuccess(true);
      setError('');
      // Simulate OTP resend
      const event = new CustomEvent('showToast', {
        detail: {
          message: 'OTP resent successfully!',
          type: 'success',
        },
      });
      window.dispatchEvent(event);
    }
  };


  // Reset form state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: '',
        password: '',
        mobile: '',
        otp: '',
      });
      setShowPassword(false);
      setError('');
      setForgotPassword(false);
      setResetEmail('');
      setResetSent(false);
      setIsLoading(false);
      setMobileOtpSent(false);
      setResendOtpSuccess(false);
      setLoginType('email');
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleOtpChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, '').slice(0, 1);
    const otpArr = formData.otp.split('').concat(Array(6).fill('')).slice(0, 6);
    otpArr[index] = val;
    setFormData((prev) => ({ ...prev, otp: otpArr.join('') }));
    setError('');

    // Auto-focus next input
    if (val && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Special seller credentials
      if (formData.email.toLowerCase() === 'rohit@gmail.com' && formData.password === 'rohit@123') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'seller');
        localStorage.setItem('userEmail', 'rohit@gmail.com');
        localStorage.setItem('loginStatus', 'active');

        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Welcome back, Rohit! Redirecting to seller dashboard...', type: 'success' },
          })
        );

        onClose();
        router.push('/seller/dashboard');
        return;
      }

      // Admin credentials
      if (formData.email.toLowerCase() === 'abhay@gmail.com' && formData.password === 'abhay@123') {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', 'master_admin');
        localStorage.setItem('userEmail', 'abhay@gmail.com');
        localStorage.setItem('loginStatus', 'active');

        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Welcome back, Admin! Redirecting to admin panel...', type: 'success' },
          })
        );

        onClose();
        router.push('/admin/dashboard');
        return;
      }

      // Mock user authentication
      const result = MockUserAuth.signIn(formData.email, formData.password);

      if (result.success && result.user) {
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: `Welcome back, ${result.user.name}!`, type: 'success' },
          })
        );

        onClose();
        if (result.role === 'master_admin') {
          router.push('/admin/dashboard');
        } else if (result.role === 'seller') {
          router.push('/seller/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.mobile || !formData.otp) {
      setError('Please enter both mobile number and OTP');
      return;
    }

    setIsLoading(true);

    try {
      if (formData.otp.length === 6) {
        localStorage.setItem('isAuthenticated', 'true');
        window.dispatchEvent(
          new CustomEvent('showToast', {
            detail: { message: 'Login Successful! Welcome back!', type: 'success' },
          })
        );
        onClose();
        router.refresh();
      } else {
        setError('Please enter a valid 6-digit OTP');
      }
    } catch (err) {
      setError('Invalid mobile number or OTP. Please try again.');
      console.error('Mobile login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    if (!MockUserAuth.isValidEmail(resetEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!MockUserAuth.emailExists(resetEmail)) {
      setError('No account found with this email address');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResetSent(true);
      setError('');
      window.dispatchEvent(
        new CustomEvent('showToast', {
          detail: { message: 'Password reset link sent to your email!', type: 'success' },
        })
      );
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xs md:rounded-2xl shadow-xl border border-orange-100 ring-1 ring-orange-200 w-[95vw] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-3 sm:p-6 md:p-8 relative flex flex-col max-h-[95vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="text-2xl font-bold text-orange-400">
            <span className="text-green-600">SOFIA</span>
          </div>
          <div className="text-xs font-medium text-orange-300 tracking-widest uppercase">
            Dry Fruits 
          </div>
        </div>

        {!forgotPassword && (
          <div className="flex justify-center gap-2 mb-6">
            <button
              type="button"
              className={`px-4 py-2 rounded-l-md border border-orange-500 font-medium text-sm ${
                loginType === 'mobile' ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'
              }`}
              onClick={() => setLoginType('mobile')}
            >
              Mobile
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-r-md border border-orange-500 font-medium text-sm ${
                loginType === 'email' ? 'bg-orange-500 text-white' : 'bg-white text-orange-500'
              }`}
              onClick={() => setLoginType('email')}
            >
              Email
            </button>
          </div>
        )}

        {forgotPassword ? (
          resetSent ? (
            <div className="text-center py-6">
              <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
              <p className="text-gray-700 mb-6">
                A password reset link has been sent to <span className="font-bold">{resetEmail}</span>.
              </p>
              <button
                onClick={() => {
                  setForgotPassword(false);
                  setResetSent(false);
                  setResetEmail('');
                }}
                className="text-orange-500 hover:underline font-medium"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="reset-email" className="block text-sm font-bold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="reset-email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-1.5 bg-white text-base placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotPassword(false);
                  setError('');
                }}
                className="w-full mt-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Back to Sign In
              </button>
            </form>
          )
        ) : loginType === 'mobile' && mobileOtpSent ? (
          <form onSubmit={handleMobileLogin} className="flex flex-col items-center py-6">
            <h2 className="text-2xl font-bold mb-2">Almost There</h2>
            <div className="text-center text-gray-700 mb-1 text-base">
              Please enter the 6-digit OTP sent to
            </div>
            <div className="text-center text-base mb-6">
              <span className="font-bold">+91 {formData.mobile}</span>
            </div>
            <div className="flex justify-center gap-2 mb-4">
              {[...Array(6)].map((_, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-10 h-12 text-center text-2xl font-semibold border-b-2 border-green-500 mx-1 focus:outline-none focus:border-green-600"
                  value={formData.otp[idx] || ''}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  id={`otp-input-${idx}`}
                  autoFocus={idx === 0}
                  aria-label={`OTP digit ${idx + 1}`}
                />
              ))}
            </div>
            {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
            <div className="flex justify-between gap-4 mb-4 w-full">
              <button
                type="button"
                className="font-semibold text-sm hover:underline"
                onClick={() => {
                  setMobileOtpSent(false);
                  setFormData((prev) => ({ ...prev, otp: '' }));
                  setResendOtpSuccess(false);
                }}
              >
                Edit Mobile Number
              </button>
              <button
                type="button"
                className={`text-sm font-medium ${
                  otpCooldown > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-orange-500 hover:underline'
                }`}
                onClick={handleResendOtp}
                disabled={otpCooldown > 0}
              >
                {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Resend OTP'}
              </button>
            </div>
            {resendOtpSuccess && otpCooldown === 0 && (
              <div className="text-xs text-green-600 mb-2">OTP resent successfully!</div>
            )}
            <button
              type="submit"
              className={`w-full font-semibold py-2 rounded-lg text-base ${
                formData.otp.length === 6
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={formData.otp.length !== 6 || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Continue'}
            </button>
          </form>
        ) : loginType === 'mobile' ? (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div>
              <label htmlFor="mobile" className="block text-sm font-bold text-gray-700 mb-1">
                Mobile Number
              </label>
              <div className="flex items-center w-full">
                <span className="px-2 py-2 bg-gray-100 border border-gray-300 text-gray-700 select-none">
                  +91
                </span>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData((prev) => ({ ...prev, mobile: val }));
                  }}
                  className="w-full px-3 py-2 border-t border-b border-r border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter mobile number"
                  required
                  pattern="[0-9]{10}"
                  inputMode="numeric"
                  maxLength={10}
                  aria-label="Mobile number"
                />
              </div>
            </div>
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-1.5 bg-white text-base placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                placeholder="Enter your email"
                required
                aria-label="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-1.5 bg-white text-base placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                  placeholder="Enter your password"
                  required
                  aria-label="Password"
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setForgotPassword(true);
                setError('');
              }}
              className="w-full mt-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Forgot Password?
            </button>
          </form>
        )}

        {!forgotPassword && (
          <div className="flex flex-row items-center justify-center gap-3 mt-6 w-full">
            <button
              className="flex-1 bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-[10px] sm:text-xs text-white hover:bg-neutral-700 transition-colors flex items-center gap-2 justify-center w-full"
              aria-label="Login with Apple"
              onClick={() => alert('Apple login not implemented')}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Login with Apple
            </button>
            <button
              className="flex-1 bg-neutral-800 border border-neutral-600 rounded px-3 py-2 text-[10px] sm:text-xs text-white hover:bg-neutral-700 transition-colors flex items-center gap-2 justify-center w-full"
              aria-label="Login with Google"
              onClick={() => alert('Google login not implemented')}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              Login with Google
            </button>
          </div>
        )}

        {!forgotPassword && (
          <div className="mt-8 text-center text-sm text-gray-600">
            New to SOFIA?
            <button
              className="text-orange-500 hover:underline font-medium ml-1"
              onClick={onSwitchToSignUp}
              type="button"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}