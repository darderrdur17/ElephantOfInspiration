"use client";

import { Quote } from "@/types/game";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";

interface Props {
  quote: Quote;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  subtle?: boolean;
  pieceStyle?: {
    clipPath?: string;
    backgroundPosition?: string;
    backgroundSize?: string;
  };
}

export function QuoteCard({ quote, draggable, onDragStart, onDragEnd, isDragging, subtle, pieceStyle }: Props) {
  const isPuzzle = !!pieceStyle;
  const [showLongPressHint, setShowLongPressHint] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    // Show hint on mobile after a delay if not interacted
    if (draggable && typeof window !== "undefined" && window.innerWidth < 768) {
      const timer = setTimeout(() => setShowLongPressHint(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [draggable]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!draggable) return;
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setShowLongPressHint(false);

    longPressTimer.current = setTimeout(() => {
      if (onDragStart) {
        onDragStart();
        // Create a drag event for mobile
        const dragEvent = new DragEvent("dragstart", { bubbles: true });
        e.currentTarget.dispatchEvent(dragEvent);
      }
    }, 300);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPos.current || !longPressTimer.current) return;
    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y);

    // Cancel if moved too much (scrolling, not dragging)
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    touchStartPos.current = null;
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={clsx(
        "card-float relative rounded-xl border border-slate-200 bg-white/90 text-sm shadow-sm transition-all",
        "touch-manipulation", // Optimize touch
        isDragging && "opacity-60 scale-95",
        subtle && "bg-white/70 border-dashed",
        isPuzzle && "p-0 overflow-hidden border-transparent shadow-md",
        draggable && "cursor-move active:scale-95",
        // Larger touch targets on mobile
        "min-h-[44px] p-4 sm:p-4",
      )}
      style={
        isPuzzle
          ? {
              clipPath: pieceStyle?.clipPath,
              backgroundImage: "url('/puzzle.png')",
              backgroundRepeat: "no-repeat",
              backgroundSize: pieceStyle?.backgroundSize || "1600px 1200px",
              backgroundPosition: pieceStyle?.backgroundPosition || "center",
              minHeight: 120,
            }
          : undefined
      }
    >
      {showLongPressHint && draggable && (
        <div className="absolute -top-8 left-0 right-0 z-10 animate-bounce rounded-lg bg-slate-900 px-2 py-1 text-xs text-white shadow-lg sm:hidden">
          👆 Long press to drag
        </div>
      )}
      <div className={clsx("bg-white/85 p-4", isPuzzle && "bg-white/75")}>
        <p className="text-slate-800">{quote.text}</p>
        <div className="mt-2 text-xs font-medium text-slate-500">— {quote.author}</div>
      </div>
    </div>
  );
}

