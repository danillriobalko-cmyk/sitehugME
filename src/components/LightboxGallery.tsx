import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '@/hooks/use-lang';

interface LightboxGalleryProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export function LightboxGallery({
  images,
  initialIndex = 0,
  onClose,
}: LightboxGalleryProps) {
  const { t } = useLang();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  if (!images || images.length === 0) {
    onClose();
    return null;
  }

  // Clamp index to valid range
  const safeIndex = Math.max(0, Math.min(currentIndex, images.length - 1));

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  return (
    <div
      ref={containerRef}
      className="lightbox-overlay fixed inset-0 z-[60] bg-black/95 flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        if (e.target === containerRef.current) {
          onClose();
        }
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-md hover:bg-white/10 transition-colors z-10"
        aria-label={t('lightbox.close')}
      >
        <X size={24} className="text-white" />
      </button>

      {/* Previous Button */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-white/10 transition-colors z-10"
        aria-label={t('lightbox.prev')}
      >
        <ChevronLeft size={32} className="text-white" />
      </button>

      {/* Image Container */}
      <div className="relative w-full h-full flex items-center justify-center px-4 sm:px-12">
        <AnimatePresence mode="wait">
          <motion.img
            key={safeIndex}
            src={images[safeIndex]}
            alt={`Gallery image ${safeIndex + 1}`}
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            className="max-w-full max-h-[85vh] object-contain rounded-lg select-none"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          />
        </AnimatePresence>
      </div>

      {/* Next Button */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-white/10 transition-colors z-10"
        aria-label={t('lightbox.next')}
      >
        <ChevronRight size={32} className="text-white" />
      </button>

      {/* Image Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 text-white text-sm">
        {safeIndex + 1} / {images.length}
      </div>
    </div>
  );
}
