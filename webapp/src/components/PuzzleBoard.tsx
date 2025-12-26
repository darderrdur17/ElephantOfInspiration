import { ReactNode, useMemo } from "react";
import { Phase, PhaseTitle, Quote } from "@/types/game";
import { motion } from "framer-motion";
import clsx from "clsx";
import { zonePaths } from "@/data/paths";

interface Props {
  placedQuotes: Record<Phase, Quote[]>;
  placedTitles: Record<Phase, PhaseTitle | null>;
  highlightedZone: Phase | null;
  lastDropZone: Phase | null;
  progress: number;
  pieceStyleFor: (id: string) => {
    clipPath: string;
    backgroundPosition: string;
    backgroundSize?: string;
  };
  onDragOver: (e: React.DragEvent, zone: Phase) => void;
  onDrop: (zone: Phase) => void;
  onDragLeave: () => void;
  children?: ReactNode;
}

const zones: { id: Phase; label: string; gradient: string }[] = [
  { id: "preparation", label: "Preparation", gradient: "linear-gradient(135deg, rgba(125, 211, 252, 0.6), rgba(255, 255, 255, 0.7))" },
  { id: "incubation", label: "Incubation", gradient: "linear-gradient(135deg, rgba(251, 191, 36, 0.45), rgba(255, 255, 255, 0.7))" },
  { id: "illumination", label: "Illumination", gradient: "linear-gradient(135deg, rgba(52, 211, 153, 0.5), rgba(255, 255, 255, 0.7))" },
  { id: "verification", label: "Verification", gradient: "linear-gradient(135deg, rgba(168, 85, 247, 0.35), rgba(255, 255, 255, 0.7))" },
];

export function PuzzleBoard({
  placedQuotes,
  placedTitles,
  highlightedZone,
  lastDropZone,
  progress,
  pieceStyleFor,
  onDragOver,
  onDrop,
  onDragLeave,
  children,
}: Props) {
  const coverOpacity = useMemo(() => Math.min(1, 0.35 + progress * 0.65), [progress]);

  return (
    <div className="glass-panel relative flex w-full flex-col gap-4 overflow-hidden p-4 sm:p-6">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-slate-100 bg-white/80 shadow-inner">
        <div className="absolute inset-0">
          {/* Base grid + layered SVG */}
          <div className="absolute inset-0 soft-grid opacity-50" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("/puzzle-board-layers.svg")`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              opacity: coverOpacity,
              transition: "opacity 400ms ease",
            }}
          />
        </div>

        <div className="absolute inset-0">
          {zones.map((zone) => (
            <motion.div
              key={zone.id}
              onDragOver={(e) => onDragOver(e, zone.id)}
              onDrop={() => onDrop(zone.id)}
              onDragLeave={onDragLeave}
              className={clsx(
                "absolute flex h-full w-full flex-col gap-2 border-2 border-dashed border-transparent p-3 transition touch-manipulation",
                "min-h-[80px] sm:min-h-[100px]", // Larger touch targets on mobile
                highlightedZone === zone.id && "border-sky-500 shadow-sky-100 scale-[1.01] z-10",
              )}
              style={{
                clipPath: `path('${zonePaths[zone.id]}')`,
                background: highlightedZone === zone.id ? zone.gradient : "transparent",
              }}
              animate={
                lastDropZone === zone.id
                  ? { scale: [1, 1.02, 1], rotate: [0, -0.8, 0], transition: { duration: 0.35, ease: "easeOut" } }
                  : undefined
              }
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-4 pt-2">
                <span>{zone.label}</span>
                {placedTitles[zone.id] && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] text-emerald-700">
                    Title set
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 px-4 pb-4">
                {placedTitles[zone.id] && (
                  <div className="rounded-lg bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800">
                    {placedTitles[zone.id]?.title}
                  </div>
                )}
                {placedQuotes[zone.id].map((quote) => (
                  <div key={quote.id} className="pointer-events-none">
                    <div
                      className="overflow-hidden rounded-xl border border-slate-200 shadow-sm"
                      style={{
                        clipPath: pieceStyleFor(quote.id)?.clipPath,
                        backgroundImage: "url('/puzzle.png')",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: pieceStyleFor(quote.id)?.backgroundSize || "1600px 1200px",
                        backgroundPosition: pieceStyleFor(quote.id)?.backgroundPosition || "center",
                      }}
                    >
                      <div className="bg-white/82 p-3 text-[12px] text-slate-700">{quote.text}</div>
                    </div>
                  </div>
                ))}
                {placedQuotes[zone.id].length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white/50 p-2 text-[11px] text-slate-500">
                    Drop here
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}

