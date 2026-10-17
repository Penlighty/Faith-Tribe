import React, { useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../theme/ThemeContext';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxHeight = 'max-h-[85vh]',
}) => {
  const { reducedMotion, triggerHaptic } = useTheme();

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 400) {
      triggerHaptic('light');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Bottom Sheet'}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet Surface */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.25}
            onDragEnd={handleDragEnd}
            initial={reducedMotion ? { opacity: 0, y: 50 } : { y: '100%' }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`relative z-10 w-full max-w-lg bg-[var(--surface-card)] text-[var(--on-container)] rounded-t-[32px] sm:rounded-[32px] shadow-expressive-lg overflow-hidden flex flex-col ${maxHeight}`}
          >
            {/* Grab handle indicator */}
            <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 rounded-full bg-[var(--on-container)]/25" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-6 py-3 flex items-center justify-between border-b border-[var(--border-tint)]">
                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-[var(--surface-container)] flex items-center justify-center hover:bg-[var(--surface-container-high)] text-[var(--on-container)] transition-colors"
                  aria-label="Close sheet"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Content area with auto scrolling */}
            <div className="p-6 overflow-y-auto overscroll-contain flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
