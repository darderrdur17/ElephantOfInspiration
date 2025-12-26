import { useEffect, useMemo, useRef, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { PlacementEvent, RealtimeCallbacks, ScoreEvent } from "@/types/game";

type SupabaseChannel = ReturnType<NonNullable<typeof supabase>["channel"]>;

export function useGameChannel(gameId: string | null, callbacks: RealtimeCallbacks) {
  const channelRef = useRef<SupabaseChannel | null>(null);
  const callbacksRef = useRef<RealtimeCallbacks>(callbacks);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "error">("disconnected");

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !gameId || !supabase) {
      return;
    }

    const channel = supabase
      .channel(`game-${gameId}`, {
        config: { broadcast: { ack: true } },
      })
      .on("broadcast", { event: "placement" }, ({ payload }) => {
        callbacksRef.current.onPlacement?.(payload as PlacementEvent);
      })
      .on("broadcast", { event: "score" }, ({ payload }) => {
        callbacksRef.current.onScore?.(payload as ScoreEvent);
      })
      .on("broadcast", { event: "reset" }, () => {
        callbacksRef.current.onReset?.();
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("connected");
        } else if (status === "CHANNEL_ERROR") {
          setConnectionStatus("error");
          console.warn("Supabase channel error. Check your configuration.");
        } else {
          setConnectionStatus("disconnected");
        }
      });

    channelRef.current = channel;

    return () => {
      if (supabase && channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      // Status will update via subscribe callback when channel closes
    };
  }, [gameId]);

  const emitPlacement = useMemo(
    () => async (payload: PlacementEvent) => {
      if (!isSupabaseConfigured() || !supabase || !channelRef.current) {
        // Fallback: still works without Supabase, just no sync
        return;
      }

      try {
        // Broadcast to other players
        await channelRef.current.send({
          type: "broadcast",
          event: "placement",
          payload,
        });

        // Persist to DB if tables exist
        const { error } = await supabase.from("placements").upsert({
          game_id: gameId || null,
          player_id: payload.playerId || null,
          piece_id: payload.pieceId,
          phase: payload.phase,
          kind: payload.kind,
        });

        if (error && error.code !== "PGRST116") {
          // PGRST116 = table doesn't exist, which is OK for development
          console.warn("Failed to persist placement:", error.message);
        }
      } catch (err) {
        console.warn("Failed to emit placement:", err);
      }
    },
    [gameId],
  );

  const emitScore = useMemo(
    () => async (payload: ScoreEvent) => {
      if (!isSupabaseConfigured() || !supabase || !channelRef.current) {
        return;
      }

      try {
        // Broadcast score
        await channelRef.current.send({
          type: "broadcast",
          event: "score",
          payload,
        });

        // Persist to DB
        const { error } = await supabase.from("scores").upsert({
          game_id: payload.gameId,
          player_id: payload.playerId,
          name: payload.name,
          score: payload.score,
          time_ms: payload.time,
        });

        if (error && error.code !== "PGRST116") {
          console.warn("Failed to persist score:", error.message);
        }
      } catch (err) {
        console.warn("Failed to emit score:", err);
      }
    },
    [],
  );

  const emitReset = useMemo(
    () => async () => {
      if (!isSupabaseConfigured() || !supabase || !channelRef.current) {
        return;
      }

      try {
        await channelRef.current.send({ type: "broadcast", event: "reset", payload: {} });
      } catch (err) {
        console.warn("Failed to emit reset:", err);
      }
    },
    [],
  );

  return { emitPlacement, emitScore, emitReset, connectionStatus };
}

