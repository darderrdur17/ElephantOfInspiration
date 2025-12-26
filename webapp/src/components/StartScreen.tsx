import { FormEvent, useState } from "react";
import { Role } from "@/types/game";

interface Props {
  onStart: (args: { name: string; answer: string; role: Role; gameId: string }) => void;
  defaultGameId: string;
  defaultRole?: Role;
  forceRole?: Role;
  showShareLink?: boolean;
}

export function StartScreen({ onStart, defaultGameId, defaultRole = "player", forceRole, showShareLink }: Props) {
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState("");
  const [gameId, setGameId] = useState(defaultGameId);
  const [role, setRole] = useState<Role>(forceRole || defaultRole);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onStart({
      name: name.trim(),
      answer: answer.trim(),
      role: forceRole || role,
      gameId: gameId.trim() || defaultGameId,
    });
  };

  const playerLink = `${origin || ""}/player?game=${encodeURIComponent(gameId || defaultGameId)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(playerLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.warn("Failed to copy link", err);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6 sm:p-10">
      <div className="glass-panel p-6 sm:p-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Elephant Puzzle</p>
            {forceRole && (
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 shadow-sm">
                {forceRole === "gm" ? "Game Master" : "Player"} Mode
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Creativity is…</h1>
          <p className="max-w-2xl text-slate-600">
            Sort quotes into the creative process phases. Add your own “creative moment” and race the timer. The Game
            Master can reset the room; players drag pieces to birds on the board.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Display name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sky Designer"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none ring-sky-100 focus:border-sky-400 focus:ring"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-700">
            Game room ID
            <input
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="demo-classroom"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none ring-sky-100 focus:border-sky-400 focus:ring"
            />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-2 text-sm text-slate-700">
            Your creative moment (optional, becomes a puzzle piece)
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Describe a moment of creativity you experienced."
              rows={3}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm outline-none ring-sky-100 focus:border-sky-400 focus:ring"
            />
          </label>
          {!forceRole && (
            <div className="flex gap-3 sm:col-span-2">
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <input
                  type="radio"
                  name="role"
                  value="player"
                  checked={role === "player"}
                  onChange={() => setRole("player")}
                />
                <span className="text-sm font-medium text-slate-700">Player</span>
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <input
                  type="radio"
                  name="role"
                  value="gm"
                  checked={role === "gm"}
                  onChange={() => setRole("gm")}
                />
                <span className="text-sm font-medium text-slate-700">Game Master</span>
              </label>
            </div>
          )}
          <button
            type="submit"
            className="sm:col-span-2 mt-2 rounded-xl bg-sky-600 px-4 py-3 text-white shadow-lg transition hover:bg-sky-700 active:scale-[0.99]"
          >
            Enter the puzzle room
          </button>
          {showShareLink && (
            <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-800">Player link</p>
                  <p className="text-xs text-slate-500">Share with players so they join this room directly.</p>
                  <code className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    {playerLink}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-[0.99] sm:mt-0 sm:w-auto"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            </div>
          )}
        </form>
        <div className="mt-4 text-xs text-slate-500">
          Tip: share the Game Room ID so 20–30 players can join the same live puzzle. We’ll sync placements, scores, and
          timer.
        </div>
      </div>
    </div>
  );
}
