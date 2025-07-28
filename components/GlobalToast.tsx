
"use client";
import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export default function GlobalToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleShowToast = (event: CustomEvent) => {
      const { message, type, duration = 4000 } = event.detail;
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      const newToast: ToastMessage = {
        id,
        message,
        type,
        duration
      };

      setToasts(prev => [...prev, newToast]);

      // Auto remove toast after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, duration);
    };

    window.addEventListener('showToast', handleShowToast as EventListener);

    return () => {
      window.removeEventListener('showToast', handleShowToast as EventListener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm w-full border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-right duration-300 ${getStyles(toast.type)}`}
        >
          {getIcon(toast.type)}
          <div className="flex-1">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
