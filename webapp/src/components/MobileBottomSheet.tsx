"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function MobileBottomSheet({ isOpen, onClose, title, children }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragY;
    if (deltaY > 0) {
      setDragY(currentY);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    }
    setIsDragging(false);
    setDragY(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm sm:hidden"
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: isDragging && dragY > 0 ? `${Math.min(dragY, 200)}px` : 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-3xl bg-white shadow-2xl sm:hidden"
          >
            {/* Drag handle */}
            <div className="flex items-center justify-center pt-3 pb-2">
              <div className="h-1.5 w-12 rounded-full bg-slate-300" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Content */}
            <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: "calc(85vh - 80px)" }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

