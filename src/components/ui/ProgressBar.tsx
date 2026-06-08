import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: "violet" | "emerald" | "amber" | "blue";
  showLabel?: boolean;
}

const colorClasses = {
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  blue: "bg-blue-500",
};

export function ProgressBar({
  value,
  max = 100,
  className,
  color = "violet",
  showLabel,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-zinc-500">
          <span>Progress</span>
          <span>{pct}%</span>
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClasses[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
