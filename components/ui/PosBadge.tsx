import { clsx } from "clsx";
import type { Position } from "@/types/draft";

const styles: Record<string, string> = {
  QB: "bg-red-500/20 text-red-400 border border-red-500/30",
  RB: "bg-green-500/20 text-green-400 border border-green-500/30",
  WR: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  TE: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  K:  "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  DEF:"bg-gray-500/20 text-gray-400 border border-gray-500/30",
  FLEX:"bg-green-500/20 text-green-400 border border-green-500/30",
  SF: "bg-red-500/20 text-red-400 border border-red-500/30",
  DB: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
  "DB,LB": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "DB,WR": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  LB: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
  "LB,DL": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  DL: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
};

export function PosBadge({
  position,
  size = "sm",
}: {
  position: string;
  size?: "xs" | "sm" | "md";
}) {
  return (
    <span
      className={clsx(
        "font-display font-bold tracking-wider rounded",
        styles[position] ?? "bg-gray-500/20 text-gray-400",
        size === "xs" && "text-[9px] px-1.5 py-0.5",
        size === "sm" && "text-[10px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1"
      )}
    >
      {position}
    </span>
  );
}
