export type Phase = "preparation" | "incubation" | "illumination" | "verification";

export type Role = "player" | "gm";

export interface Quote {
  id: string;
  text: string;
  author: string;
  phase: Phase;
  type?: "quote" | "title" | "user-entry";
}

export interface PhaseTitle {
  id: string;
  title: string;
  phase: Phase;
}

export interface Player {
  id: string;
  name: string;
  role: Role;
}

export interface PlayerScore {
  name: string;
  score: number;
  time: number;
  timestamp: number;
  playerId?: string;
}

export interface GameState {
  isStarted: boolean;
  isCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  userAnswer: string;
  placements: Record<string, Phase>;
  titlePlacements: Record<string, Phase>;
}

export interface PlacementEvent {
  pieceId: string;
  phase: Phase;
  kind: "quote" | "title";
  playerId: string;
  text?: string;
}

export interface ScoreEvent extends PlayerScore {
  gameId: string;
}

export interface RealtimeCallbacks {
  onPlacement?: (payload: PlacementEvent) => void;
  onScore?: (payload: ScoreEvent) => void;
  onReset?: () => void;
}

