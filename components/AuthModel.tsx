'use client';

import { useState, useEffect } from 'react';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';

export type AuthModalType = 'signin' | 'signup' | null;

interface AuthModalsProps {
  isOpen: boolean;
  onClose: () => void;
  initialModal?: AuthModalType;
}

export default function AuthModals({ isOpen, onClose, initialModal = 'signin' }: AuthModalsProps) {
  const [currentModal, setCurrentModal] = useState<AuthModalType>(initialModal);

  // Reset the modal state when isOpen or initialModal changes
  useEffect(() => {
    if (isOpen) {
      setCurrentModal(initialModal || 'signin');
    }
  }, [isOpen, initialModal]);

  if (!isOpen) return null;

  const handleClose = () => {
    setCurrentModal('signin'); // Reset to signin when closing
    onClose();
  };

  const switchToSignUp = () => {
    setCurrentModal('signup');
  };

  const switchToSignIn = () => {
    setCurrentModal('signin');
  };

  // Render the appropriate modal directly
  if (currentModal === 'signin') {
    return (
      <SignInModal 
        isOpen={true} 
        onClose={handleClose} 
        onSwitchToSignUp={switchToSignUp} 
      />
    );
  } else if (currentModal === 'signup') {
    return (
      <SignUpModal 
        isOpen={true} 
        onClose={handleClose} 
        onSwitchToSignIn={switchToSignIn} 
      />
    );
  }

  return null;
}