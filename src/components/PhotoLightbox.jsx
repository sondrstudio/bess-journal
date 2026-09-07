import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function PhotoLightbox({ photoUrl, caption, onClose }) {
  useEffect(() => {
    if (photoUrl) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [photoUrl]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!photoUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-[fade-in_0.3s_ease-out]"
      onClick={onClose}
    >
      <div 
        className="relative max-w-3xl w-full bg-surface p-6 md:p-8 rounded-[2rem] shadow-2xl border border-accent/20 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-surface-2 text-ink hover:bg-accent hover:text-primary transition-colors"
          aria-label="Close photo"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full max-h-[70vh] overflow-hidden rounded-[1.5rem] bg-surface-2">
          <img 
            src={photoUrl} 
            alt={caption || 'Memory'} 
            className="w-full h-full object-cover max-h-[70vh]" 
          />
        </div>

        {caption && (
          <p className="mt-6 font-handwritten text-2xl md:text-3xl text-accent text-center">
            "{caption}"
          </p>
        )}
      </div>
    </div>
  );
}
