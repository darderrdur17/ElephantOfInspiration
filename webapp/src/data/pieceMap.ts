export interface PieceStyle {
  clipPath: string;
  backgroundPosition: string;
  backgroundSize?: string;
}

// Approximate clip-paths and positions mapped to puzzle.png coordinates (1600x1200)
export const pieceMap: Record<string, PieceStyle> = {
  // User slot
  "user-slot": {
    clipPath: "polygon(30% 40%, 46% 36%, 60% 44%, 56% 58%, 38% 60%, 26% 52%)",
    backgroundPosition: "120px -220px",
  },

  // Preparation left side
  "prep-4": {
    clipPath: "polygon(12% 48%, 22% 44%, 30% 52%, 24% 62%, 14% 60%)",
    backgroundPosition: "-120px -240px",
  },
  "prep-5": {
    clipPath: "polygon(16% 58%, 28% 56%, 30% 68%, 20% 72%, 12% 66%)",
    backgroundPosition: "-100px -180px",
  },
  "prep-6": {
    clipPath: "polygon(20% 68%, 32% 64%, 36% 76%, 24% 80%, 16% 74%)",
    backgroundPosition: "-60px -120px",
  },
  "prep-7": {
    clipPath: "polygon(24% 78%, 36% 76%, 40% 88%, 28% 92%, 20% 86%)",
    backgroundPosition: "0px -60px",
  },
  "prep-1": {
    clipPath: "polygon(26% 46%, 36% 42%, 44% 50%, 38% 60%, 30% 56%)",
    backgroundPosition: "-40px -210px",
  },
  "prep-2": {
    clipPath: "polygon(30% 56%, 42% 52%, 48% 60%, 42% 70%, 32% 66%)",
    backgroundPosition: "0px -150px",
  },
  "prep-3": {
    clipPath: "polygon(34% 66%, 46% 62%, 52% 70%, 46% 78%, 36% 74%)",
    backgroundPosition: "40px -100px",
  },
  "inc-1": {
    clipPath: "polygon(32% 44%, 44% 40%, 50% 46%, 46% 54%, 36% 52%)",
    backgroundPosition: "-10px -230px",
  },
  "inc-2": {
    clipPath: "polygon(36% 52%, 48% 48%, 54% 54%, 50% 62%, 40% 60%)",
    backgroundPosition: "20px -180px",
  },
  "inc-3": {
    clipPath: "polygon(40% 60%, 52% 56%, 58% 62%, 54% 70%, 44% 68%)",
    backgroundPosition: "50px -130px",
  },

  // Incubation mid-left
  "inc-4": {
    clipPath: "polygon(42% 46%, 54% 44%, 60% 52%, 54% 60%, 44% 58%)",
    backgroundPosition: "80px -210px",
  },
  "inc-5": {
    clipPath: "polygon(46% 56%, 58% 52%, 64% 60%, 58% 68%, 48% 64%)",
    backgroundPosition: "120px -150px",
  },
  "inc-6": {
    clipPath: "polygon(50% 64%, 62% 60%, 68% 68%, 62% 76%, 52% 72%)",
    backgroundPosition: "150px -100px",
  },
  "inc-7": {
    clipPath: "polygon(46% 72%, 58% 70%, 64% 78%, 58% 86%, 48% 82%)",
    backgroundPosition: "120px -40px",
  },

  // Illumination upper-mid
  "illu-1": {
    clipPath: "polygon(54% 36%, 66% 32%, 72% 38%, 66% 46%, 56% 44%)",
    backgroundPosition: "200px -280px",
  },
  "illu-2": {
    clipPath: "polygon(58% 42%, 70% 38%, 76% 44%, 70% 52%, 60% 50%)",
    backgroundPosition: "220px -240px",
  },
  "illu-3": {
    clipPath: "polygon(62% 50%, 74% 46%, 80% 52%, 74% 60%, 64% 58%)",
    backgroundPosition: "240px -190px",
  },
  "illu-4": {
    clipPath: "polygon(58% 38%, 70% 34%, 76% 42%, 70% 50%, 60% 48%)",
    backgroundPosition: "240px -260px",
  },
  "illu-5": {
    clipPath: "polygon(62% 46%, 74% 42%, 80% 50%, 74% 58%, 64% 54%)",
    backgroundPosition: "260px -200px",
  },
  "illu-6": {
    clipPath: "polygon(66% 54%, 78% 50%, 84% 58%, 78% 66%, 68% 62%)",
    backgroundPosition: "300px -150px",
  },
  "illu-7": {
    clipPath: "polygon(70% 62%, 82% 58%, 88% 66%, 82% 74%, 72% 70%)",
    backgroundPosition: "320px -100px",
  },

  // Verification right side
  "ver-4": {
    clipPath: "polygon(72% 72%, 84% 68%, 90% 76%, 84% 84%, 74% 80%)",
    backgroundPosition: "340px -40px",
  },
  "ver-5": {
    clipPath: "polygon(70% 80%, 82% 78%, 88% 86%, 80% 92%, 70% 88%)",
    backgroundPosition: "320px 20px",
  },
  "ver-6": {
    clipPath: "polygon(64% 82%, 74% 80%, 80% 88%, 72% 94%, 62% 90%)",
    backgroundPosition: "260px 20px",
  },
  "ver-1": {
    clipPath: "polygon(62% 72%, 72% 68%, 78% 76%, 72% 84%, 62% 80%)",
    backgroundPosition: "240px -40px",
  },
  "ver-2": {
    clipPath: "polygon(58% 78%, 68% 74%, 74% 82%, 68% 90%, 58% 86%)",
    backgroundPosition: "210px 10px",
  },
  "ver-3": {
    clipPath: "polygon(54% 84%, 64% 80%, 70% 88%, 64% 96%, 54% 92%)",
    backgroundPosition: "180px 40px",
  },
};

export const defaultPiece: PieceStyle = {
  clipPath: "polygon(10% 10%, 90% 10%, 90% 90%, 10% 90%)",
  backgroundPosition: "center",
};

