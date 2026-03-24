import { cn } from "@/lib/utils";
import { getPriorityColor } from "@/lib/progress";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        getPriorityColor(priority),
        className
      )}
    >
      {priority}
    </span>
  );
}
