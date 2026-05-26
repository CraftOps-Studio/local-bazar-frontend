import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  closeOnOverlayClick = true,
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div 
        className={`w-full ${maxWidth} bg-brand-surface border border-brand-border rounded-3xl overflow-hidden shadow-2xl animate-scaleUp relative`}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border/40 bg-brand-surface-2/20">
          {title && (
            <h3 className="font-extrabold text-sm sm:text-base text-brand-text truncate">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="p-1.5 bg-brand-surface-2 border border-brand-border rounded-xl text-brand-muted hover:text-brand-text transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 overflow-y-auto max-h-[75vh]">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;
