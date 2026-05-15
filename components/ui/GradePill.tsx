import { clsx } from "clsx";

const gradeColor: Record<string, string> = {
  "A+": "bg-emerald-500/25 text-emerald-400 border-emerald-500/40",
  "A":  "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "A-": "bg-green-500/20   text-green-400   border-green-500/30",
  "B+": "bg-teal-500/20    text-teal-400    border-teal-500/30",
  "B":  "bg-blue-500/20    text-blue-400    border-blue-500/30",
  "B-": "bg-sky-500/20     text-sky-400     border-sky-500/30",
  "C+": "bg-yellow-500/20  text-yellow-400  border-yellow-500/30",
  "C":  "bg-amber-500/20   text-amber-400   border-amber-500/30",
  "D":  "bg-orange-500/20  text-orange-400  border-orange-500/30",
  "F":  "bg-red-500/20     text-red-400     border-red-500/30",
};

export function GradePill({ grade }: { grade: string }) {
  return (
    <span
      className={clsx(
        "font-display font-black text-sm px-2.5 py-0.5 rounded border",
        gradeColor[grade] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30"
      )}
    >
      {grade}
    </span>
  );
}
