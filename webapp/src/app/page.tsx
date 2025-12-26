"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { quotes, phaseTitles } from "@/data/quotes";
import { pieceMap, defaultPiece } from "@/data/pieceMap";
import { StartScreen } from "@/components/StartScreen";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { Timer } from "@/components/Timer";
import { QuoteCard } from "@/components/QuoteCard";
import { EndScreen } from "@/components/EndScreen";
import { Scoreboard } from "@/components/Scoreboard";
import { MobileBottomSheet } from "@/components/MobileBottomSheet";
import { useGameChannel } from "@/hooks/useGameChannel";
import { GameState, Phase, PhaseTitle, Player, PlayerScore, Quote, Role } from "@/types/game";

const emptyPlacedQuotes: Record<Phase, Quote[]> = {
  preparation: [],
  incubation: [],
  illumination: [],
  verification: [],
};

const emptyPlacedTitles: Record<Phase, PhaseTitle | null> = {
  preparation: null,
  incubation: null,
  illumination: null,
  verification: null,
};

function uuid() {
  return typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

export function GameExperience({
  defaultRole = "player",
  forceRole,
  showShareLink
}: {
  defaultRole?: Role;
  forceRole?: Role;
  showShareLink?: boolean;
}) {
  const params = useSearchParams();
  const defaultGameId = params.get("game") || "demo-classroom";

  const [gameId, setGameId] = useState<string | null>(defaultGameId);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    isStarted: false,
    isCompleted: false,
    startTime: null,
    endTime: null,
    userAnswer: "",
    placements: {},
    titlePlacements: {},
  });
  const [availableQuotes, setAvailableQuotes] = useState<Quote[]>([]);
  const [availableTitles, setAvailableTitles] = useState<PhaseTitle[]>([]);
  const [placedQuotes, setPlacedQuotes] = useState<Record<Phase, Quote[]>>(emptyPlacedQuotes);
  const [placedTitles, setPlacedTitles] = useState<Record<Phase, PhaseTitle | null>>(emptyPlacedTitles);
  const [draggedQuote, setDraggedQuote] = useState<Quote | null>(null);
  const [draggedTitle, setDraggedTitle] = useState<PhaseTitle | null>(null);
  const [highlightedZone, setHighlightedZone] = useState<Phase | null>(null);
  const [leaderboard, setLeaderboard] = useState<PlayerScore[]>([]);
  const [userPuzzlePiece, setUserPuzzlePiece] = useState<Quote | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [lastDropZone, setLastDropZone] = useState<Phase | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const { emitPlacement, emitScore, emitReset, connectionStatus } = useGameChannel(gameId, {
    onPlacement: (payload) => {
      // Ignore echoes of the current drag
      setAvailableQuotes((prev) => prev.filter((q) => q.id !== payload.pieceId));
      setAvailableTitles((prev) => prev.filter((t) => t.id !== payload.pieceId));

      if (payload.kind === "title") {
        const title = phaseTitles.find((t) => t.id === payload.pieceId);
        if (!title) return;
        setPlacedTitles((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            if (next[key as Phase]?.id === title.id) next[key as Phase] = null;
          });
          next[payload.phase] = title;
          return next;
        });
        setGameState((prev) => ({
          ...prev,
          titlePlacements: { ...prev.titlePlacements, [title.id]: payload.phase },
        }));
        return;
      }

      const existing = quotes.find((q) => q.id === payload.pieceId) || userPuzzlePiece;
      const incoming: Quote =
        existing ||
        ({
          id: payload.pieceId,
          text: payload.text || "Player entry",
          author: "Teammate",
          phase: payload.phase,
          type: "user-entry",
        } as Quote);

      setPlacedQuotes((prev) => {
        const next: Record<Phase, Quote[]> = {
          preparation: [...prev.preparation],
          incubation: [...prev.incubation],
          illumination: [...prev.illumination],
          verification: [...prev.verification],
        };
        Object.keys(next).forEach((key) => {
          next[key as Phase] = next[key as Phase].filter((q) => q.id !== incoming.id);
        });
        next[payload.phase] = [...next[payload.phase], incoming];
        return next;
      });
      setGameState((prev) => ({
        ...prev,
        placements: { ...prev.placements, [incoming.id]: payload.phase },
      }));
    },
    onScore: (payload) => {
      setLeaderboard((prev) =>
        [...prev, payload]
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.time - b.time;
          })
          .slice(0, 10),
      );
    },
    onReset: () => handleRestart(),
  });

  const notify = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 1600);
  };

  const pieceStyleFor = (id: string) => {
    if (id.startsWith("user-")) return pieceMap["user-slot"] || defaultPiece;
    return pieceMap[id] || defaultPiece;
  };

  const totalPieces = useMemo(
    () => quotes.length + phaseTitles.length + (userPuzzlePiece ? 1 : 0),
    [userPuzzlePiece],
  );

  const handleStart = ({ name, answer, role, gameId: roomId }: { name: string; answer: string; role: "player" | "gm"; gameId: string }) => {
    const id = uuid();
    const playerObj: Player = { id, name, role };
    setPlayer(playerObj);
    setGameId(roomId);

    const userPiece =
      answer.trim().length > 0
        ? ({
            id: `user-${id}`,
            text: answer.trim(),
            author: name,
            phase: "incubation",
            type: "user-entry",
          } as Quote)
        : null;
    setUserPuzzlePiece(userPiece);

    setAvailableQuotes([...quotes, ...(userPiece ? [userPiece] : [])]);
    setAvailableTitles([...phaseTitles]);
    setPlacedQuotes({ ...emptyPlacedQuotes });
    setPlacedTitles({ ...emptyPlacedTitles });
    setLeaderboard([]);
    setGameState({
      isStarted: true,
      isCompleted: false,
      startTime: Date.now(),
      endTime: null,
      userAnswer: answer,
      placements: {},
      titlePlacements: {},
    });
  };

  const handleDragStart = (quote: Quote) => {
    setDraggedQuote(quote);
    setDraggedTitle(null);
  };

  const handleDragStartTitle = (title: PhaseTitle) => {
    setDraggedTitle(title);
    setDraggedQuote(null);
  };

  const handleDragEnd = () => {
    setDraggedQuote(null);
    setDraggedTitle(null);
    setHighlightedZone(null);
  };

  const handleDragOver = (e: React.DragEvent, zone: Phase) => {
    e.preventDefault();
    setHighlightedZone(zone);
  };

  const placeTitle = (phase: Phase, title: PhaseTitle) => {
    setAvailableTitles((prev) => prev.filter((t) => t.id !== title.id));
    setPlacedTitles((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key as Phase]?.id === title.id) next[key as Phase] = null;
      });
      next[phase] = title;
      return next;
    });
    setGameState((prev) => ({
      ...prev,
      titlePlacements: { ...prev.titlePlacements, [title.id]: phase },
    }));

    notify(title.phase === phase ? "success" : "error", title.phase === phase ? "Correct title!" : "Title goes elsewhere");
    if (player) {
      emitPlacement({
        pieceId: title.id,
        phase,
        kind: "title",
        playerId: player.id,
      });
    }
  };

  const placeQuote = (phase: Phase, quote: Quote) => {
    setAvailableQuotes((prev) => prev.filter((q) => q.id !== quote.id));
    setPlacedQuotes((prev) => {
      const next: Record<Phase, Quote[]> = {
        preparation: [...prev.preparation],
        incubation: [...prev.incubation],
        illumination: [...prev.illumination],
        verification: [...prev.verification],
      };
      Object.keys(next).forEach((key) => {
        next[key as Phase] = next[key as Phase].filter((q) => q.id !== quote.id);
      });
      next[phase] = [...next[phase], quote];
      return next;
    });
    setGameState((prev) => ({
      ...prev,
      placements: { ...prev.placements, [quote.id]: phase },
    }));

    const isUserPiece = quote.type === "user-entry";
    const isCorrect = isUserPiece ? phase === "incubation" : quote.phase === phase;
    notify(isCorrect ? "Nice drop!" : "Try another phase");

    if (player) {
      emitPlacement({
        pieceId: quote.id,
        phase,
        kind: "quote",
        playerId: player.id,
        text: quote.text,
      });
    }
  };

  const handleDrop = (phase: Phase) => {
    if (draggedTitle) {
      placeTitle(phase, draggedTitle);
      setLastDropZone(phase);
      handleDragEnd();
      return;
    }
    if (draggedQuote) {
      placeQuote(phase, draggedQuote);
      setLastDropZone(phase);
      handleDragEnd();
    }
  };

  useEffect(() => {
    if (!gameState.isStarted || gameState.isCompleted) return;

    const placedCount = Object.keys(gameState.placements).length + Object.keys(gameState.titlePlacements).length;
    if (placedCount !== totalPieces) return;

    const endTime = Date.now();
    const totalTime = endTime - (gameState.startTime || endTime);
    let correctCount = 0;

    quotes.forEach((quote) => {
      if (gameState.placements[quote.id] === quote.phase) correctCount++;
    });
    phaseTitles.forEach((title) => {
      if (gameState.titlePlacements[title.id] === title.phase) correctCount++;
    });
    if (userPuzzlePiece && gameState.placements[userPuzzlePiece.id] === "incubation") {
      correctCount++;
    }

    const newScore: PlayerScore = {
      name: player?.name || "Player",
      score: correctCount,
      time: totalTime,
      timestamp: Date.now(),
      playerId: player?.id,
    };

    setLeaderboard((prev) =>
      [...prev, newScore]
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return a.time - b.time;
        })
        .slice(0, 10),
    );
    setGameState((prev) => ({ ...prev, isCompleted: true, endTime }));

    if (player) {
      emitScore({ ...newScore, gameId: gameId || "demo-classroom" });
    }
  }, [
    emitScore,
    gameId,
    gameState.isCompleted,
    gameState.isStarted,
    gameState.placements,
    gameState.startTime,
    gameState.titlePlacements,
    player,
    totalPieces,
    userPuzzlePiece,
  ]);

  useEffect(() => {
    const stored = localStorage.getItem("elephant-leaderboard");
    if (stored) setLeaderboard(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("elephant-leaderboard", JSON.stringify(leaderboard));
  }, [leaderboard]);

  const handleRestart = () => {
    setGameState({
      isStarted: false,
      isCompleted: false,
      startTime: null,
      endTime: null,
      userAnswer: "",
      placements: {},
      titlePlacements: {},
    });
    setAvailableQuotes([]);
    setAvailableTitles([]);
    setPlacedQuotes({ ...emptyPlacedQuotes });
    setPlacedTitles({ ...emptyPlacedTitles });
    setLeaderboard([]);
    setUserPuzzlePiece(null);
    setDraggedQuote(null);
    setDraggedTitle(null);
    setHighlightedZone(null);
    emitReset();
  };

  if (!gameState.isStarted) {
    return (
      <StartScreen
        onStart={handleStart}
        defaultGameId={defaultGameId}
        defaultRole={defaultRole}
        forceRole={forceRole}
        showShareLink={showShareLink}
      />
    );
  }

  if (gameState.isCompleted) {
    const myScore = leaderboard.find((entry) => entry.playerId === player?.id) || leaderboard[0];
    return (
      <EndScreen
        score={myScore?.score ?? 0}
        time={(gameState.endTime || 0) - (gameState.startTime || 0)}
        totalQuotes={totalPieces}
        leaderboard={leaderboard}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-amber-50 p-4 sm:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">Creativity is…</p>
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Elephant Puzzle Live</h1>
            <p className="text-sm text-slate-600">Drag titles first, then quotes. Snap to birds; mobile friendly.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Timer startTime={gameState.startTime} endTime={gameState.endTime} />
            {player && (
              <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-700 shadow">
                {player.role === "gm" ? "Game Master" : "Player"} · {player.name}
              </div>
            )}
            <div className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold text-amber-700 shadow">
              Room: {gameId}
            </div>
            {connectionStatus && (
              <div
                className={`rounded-full px-3 py-1.5 text-xs font-semibold shadow ${
                  connectionStatus === "connected"
                    ? "bg-emerald-100 text-emerald-700"
                    : connectionStatus === "error"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-slate-100 text-slate-600"
                }`}
                title={
                  connectionStatus === "connected"
                    ? "Connected to Supabase"
                    : connectionStatus === "error"
                      ? "Supabase connection error"
                      : "Supabase not configured (local mode)"
                }
              >
                {connectionStatus === "connected" ? "🟢 Live" : connectionStatus === "error" ? "🔴 Error" : "⚪ Local"}
              </div>
            )}
          </div>
        </div>

        {feedback && (
          <div
            className={`glass-panel flex items-center gap-3 p-3 text-sm ${
              feedback.type === "success" ? "border-emerald-100 bg-emerald-50/70 text-emerald-700" : "border-rose-100 bg-rose-50/70 text-rose-700"
            }`}
          >
            <span className="text-lg">{feedback.type === "success" ? "🎉" : "🤔"}</span>
            <span>{feedback.message}</span>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          {/* Desktop Sidebar */}
          <div className="hidden flex-col gap-4 lg:flex">
            {availableTitles.length > 0 && (
              <div className="glass-panel p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Phase titles</h3>
                  <span className="text-xs text-slate-500">{availableTitles.length} left</span>
                </div>
                <p className="text-xs text-slate-500">Drag each title to the matching bird.</p>
                <div className="mt-3 space-y-2">
                  {availableTitles.map((title) => (
                    <div
                      key={title.id}
                      draggable
                      onDragStart={() => handleDragStartTitle(title)}
                      onDragEnd={handleDragEnd}
                      className="card-float cursor-move rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800 min-h-[44px] touch-manipulation"
                      style={{ opacity: draggedTitle?.id === title.id ? 0.5 : 1 }}
                    >
                      {title.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userPuzzlePiece && (
              <div className="glass-panel p-4">
                <h3 className="text-sm font-semibold text-slate-800">Your creative moment</h3>
                <p className="text-xs text-slate-500">Drop it onto Incubation.</p>
                <QuoteCard
                  quote={userPuzzlePiece}
                  draggable
                  onDragStart={() => handleDragStart(userPuzzlePiece)}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedQuote?.id === userPuzzlePiece.id}
                  pieceStyle={pieceStyleFor(userPuzzlePiece.id)}
                />
              </div>
            )}

            {availableQuotes.length > 0 && (
              <div className="glass-panel max-h-[480px] space-y-3 overflow-y-auto p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-800">Quotes to sort</h3>
                  <span className="text-xs text-slate-500">{availableQuotes.length} left</span>
                </div>
                {availableQuotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    draggable
                    onDragStart={() => handleDragStart(quote)}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedQuote?.id === quote.id}
                    pieceStyle={pieceStyleFor(quote.id)}
                  />
                ))}
              </div>
            )}

            <Scoreboard leaderboard={leaderboard} />
          </div>

          {/* Mobile Bottom Sheet Content */}
          <MobileBottomSheet
            isOpen={mobileSheetOpen}
            onClose={() => setMobileSheetOpen(false)}
            title={`Puzzle Pieces (${availableTitles.length + availableQuotes.length + (userPuzzlePiece ? 1 : 0)})`}
          >
            <div className="space-y-4">
              {availableTitles.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-800">Phase titles</h4>
                    <span className="text-xs text-slate-500">{availableTitles.length} left</span>
                  </div>
                  <p className="mb-3 text-xs text-slate-500">Long press to drag to matching bird.</p>
                  <div className="space-y-2">
                    {availableTitles.map((title) => (
                      <div
                        key={title.id}
                        draggable
                        onDragStart={() => {
                          handleDragStartTitle(title);
                          setMobileSheetOpen(false);
                        }}
                        onDragEnd={handleDragEnd}
                        className="card-float cursor-move rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-800 min-h-[44px] touch-manipulation"
                        style={{ opacity: draggedTitle?.id === title.id ? 0.5 : 1 }}
                      >
                        {title.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {userPuzzlePiece && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold text-slate-800">Your creative moment</h4>
                  <p className="mb-3 text-xs text-slate-500">Drop it onto Incubation.</p>
                  <QuoteCard
                    quote={userPuzzlePiece}
                    draggable
                    onDragStart={() => {
                      handleDragStart(userPuzzlePiece);
                      setMobileSheetOpen(false);
                    }}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedQuote?.id === userPuzzlePiece.id}
                    pieceStyle={pieceStyleFor(userPuzzlePiece.id)}
                  />
                </div>
              )}

              {availableQuotes.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-800">Quotes to sort</h4>
                    <span className="text-xs text-slate-500">{availableQuotes.length} left</span>
                  </div>
                  <p className="mb-3 text-xs text-slate-500">Long press to drag to correct bird.</p>
                  <div className="space-y-3">
                    {availableQuotes.map((quote) => (
                      <QuoteCard
                        key={quote.id}
                        quote={quote}
                        draggable
                        onDragStart={() => {
                          handleDragStart(quote);
                          setMobileSheetOpen(false);
                        }}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedQuote?.id === quote.id}
                        pieceStyle={pieceStyleFor(quote.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">
                <Scoreboard leaderboard={leaderboard} />
              </div>
            </div>
          </MobileBottomSheet>

          <div className="flex flex-col gap-4">
            <PuzzleBoard
              placedQuotes={placedQuotes}
              placedTitles={placedTitles}
              highlightedZone={highlightedZone}
            lastDropZone={lastDropZone}
            progress={(Object.keys(gameState.placements).length + Object.keys(gameState.titlePlacements).length) / totalPieces}
              pieceStyleFor={pieceStyleFor}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragLeave={() => setHighlightedZone(null)}
            >
              <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 text-sm text-slate-600 shadow-inner">
                <p className="mb-2 font-semibold">How to play:</p>
                <ul className="list-inside list-disc space-y-1 text-xs">
                  <li>Drop titles first, then quotes</li>
                  <li>Zones glow when you hover</li>
                  <li>Green alerts = correct, red = try again</li>
                  <li className="lg:hidden">Tap the button below to see your pieces</li>
                  <li className="lg:hidden">Long press pieces to drag them</li>
                </ul>
              </div>
            </PuzzleBoard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500">Pieces placed: {Object.keys(gameState.placements).length + Object.keys(gameState.titlePlacements).length}/{totalPieces}</div>
              <div className="flex gap-2">
                {/* Mobile: Floating button to open pieces */}
                {(availableTitles.length > 0 || availableQuotes.length > 0 || userPuzzlePiece) && (
                  <button
                    onClick={() => setMobileSheetOpen(true)}
                    className="lg:hidden fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 touch-manipulation"
                    aria-label="Open puzzle pieces"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    {(availableTitles.length + availableQuotes.length + (userPuzzlePiece ? 1 : 0)) > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                        {availableTitles.length + availableQuotes.length + (userPuzzlePiece ? 1 : 0)}
                      </span>
                    )}
                  </button>
                )}
                {player?.role === "gm" && (
                  <button
                    onClick={handleRestart}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-100 min-h-[44px] touch-manipulation"
                  >
                    Reset room
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <GameExperience defaultRole="player" />
    </Suspense>
  );
}
