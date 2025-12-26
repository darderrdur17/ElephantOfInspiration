import { PlayerScore } from "@/types/game";

interface Props {
  leaderboard: PlayerScore[];
}

export function Scoreboard({ leaderboard }: Props) {
  if (leaderboard.length === 0) return null;

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>Leaderboard</span>
        <span className="text-xs text-slate-500">Realtime</span>
      </div>
      <div className="mt-3 space-y-2">
        {leaderboard.map((entry, idx) => (
          <div
            key={`${entry.timestamp}-${entry.name}`}
            className="flex items-center justify-between rounded-xl bg-white/90 px-3 py-2 text-sm shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                {idx + 1}
              </span>
              <span className="font-semibold text-slate-800">{entry.name}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span>{entry.score} pts</span>
              <span>{Math.floor(entry.time / 1000)}s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


