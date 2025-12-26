"use client";
import { GameExperience } from "../page";

export default function GameMasterPage() {
  return <GameExperience defaultRole="gm" forceRole="gm" showShareLink={true} />;
}
