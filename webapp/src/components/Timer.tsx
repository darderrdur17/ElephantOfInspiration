import { useEffect, useState } from "react";

interface Props {
  startTime: number | null;
  endTime: number | null;
}

export function Timer({ startTime, endTime }: Props) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!startTime || endTime) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [startTime, endTime]);

  if (!startTime) return null;

  const elapsed = (endTime ?? now) - startTime;
  const mins = Math.floor(elapsed / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000)
    .toString()
    .padStart(2, "0");

  return (
    <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-800 shadow">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      {mins}:{secs}
    </div>
  );
}

