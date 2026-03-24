import { cn } from "@/lib/utils";
import { getProgressColor } from "@/lib/progress";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  className,
  showLabel = true,
  size = "md",
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn("flex-1 bg-gray-100 rounded-full overflow-hidden", heights[size])}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300", getProgressColor(clamped))}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground w-10 text-right">
          {clamped}%
        </span>
      )}
    </div>
  );
}
