'use client';

import { useEffect, useRef, useState } from 'react';

export default function ContactModal({ onClose }: { onClose?: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const modalRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setShowSuccess(true);
  };

  const handleClose = () => {
    setIsVisible(false);
    setShowSuccess(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
    if (onClose) onClose();
  };

  // Close when clicking outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isVisible) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
        <div ref={modalRef} className="bg-white rounded-lg shadow-xl p-4 w-full max-w-xs mx-auto relative">
          <div className="text-center">
            <div className="text-green-600 text-3xl mb-2">✓</div>
            <h2 className="text-lg font-semibold mb-2 text-green-700">Thank You!</h2>
            <p className="text-gray-600 mb-3 text-xs sm:text-sm">
              Your message has been sent successfully. We'll get back to you soon!
            </p>
            <button
              onClick={handleClose}
              className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-3 sm:p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm mx-auto relative max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-black transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center pr-8">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <input
            name="subject"
            type="text"
            placeholder="Subject"
            required
            value={formData.subject}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <textarea
            name="message"
            rows={3}
            placeholder="Message"
            required
            value={formData.message}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="w-full bg-orange-400 text-white py-2 sm:py-2.5 rounded-md text-sm font-medium"
          >
            Submit
          </button>

          <div className="text-center mt-3 sm:mt-4 space-y-1">
            <p className="text-xs sm:text-sm font-medium text-gray-700">📞 904-4545792</p>
            <p className="text-xs sm:text-sm font-medium text-gray-700 break-all">🌐 shifanour@gmail.com</p>
          </div>
        </form>
      </div>
    </div>
  );
}
