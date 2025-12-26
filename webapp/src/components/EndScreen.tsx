import { PlayerScore } from "@/types/game";

interface Props {
  score: number;
  time: number;
  totalQuotes: number;
  leaderboard: PlayerScore[];
  onRestart: () => void;
}

export function EndScreen({ score, time, totalQuotes, leaderboard, onRestart }: Props) {
  const mins = Math.floor(time / 60000);
  const secs = Math.floor((time % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-6 sm:p-10">
      <div className="glass-panel p-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Puzzle Complete</h2>
        <p className="mt-2 text-slate-600">
          {score}/{totalQuotes} correct · {mins}:{secs}
        </p>
        <button
          onClick={onRestart}
          className="mt-6 rounded-xl bg-sky-600 px-5 py-3 text-white shadow-lg transition hover:bg-sky-700 active:scale-[0.99]"
        >
          Restart round
        </button>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-lg font-semibold text-slate-900">Leaderboard</h3>
        <p className="text-xs text-slate-500">Top 10 scores sync across everyone in the room.</p>
        <div className="mt-4 divide-y divide-slate-100">
          {leaderboard.length === 0 && <p className="text-sm text-slate-500">No scores yet.</p>}
          {leaderboard.map((entry, idx) => (
            <div key={`${entry.timestamp}-${entry.name}`} className="flex items-center justify-between py-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-700">{idx + 1}</span>
                <span className="font-semibold text-slate-800">{entry.name}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <span>{entry.score} pts</span>
                <span className="text-xs">
                  {Math.floor(entry.time / 1000)}s • {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


