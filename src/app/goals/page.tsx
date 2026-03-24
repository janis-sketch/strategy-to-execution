"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { calculateGoalProgress } from "@/lib/progress";

interface Goal {
  id: string;
  title: string;
  goalType: string;
  status: string;
  currentValue: number;
  targetValue: number;
  startValue: number;
  unit?: string | null;
  focusArea: { id: string; title: string; color?: string | null };
  keyResults: Array<{
    id: string;
    title: string;
    goalType: string;
    currentValue: number;
    targetValue: number;
    startValue: number;
    status: string;
  }>;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  const objectives = goals.filter((g) => g.goalType === "objective");

  return (
    <>
      <PageHeader
        title="Goals"
        description="Track objectives and key results across all focus areas"
      />

      {objectives.length === 0 ? (
        <EmptyState
          icon={<Trophy size={48} />}
          title="No goals yet"
          description="Goals are created within focus areas. Go to a focus area to add goals."
          action={
            <Link
              href="/focus-areas"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg"
            >
              View Focus Areas
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {objectives.map((goal) => {
            const progress = calculateGoalProgress(goal);
            return (
              <Link
                key={goal.id}
                href={`/goals/${goal.id}`}
                className="block bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{goal.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            goal.focusArea.color || "#2563eb",
                        }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {goal.focusArea.title}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={goal.status} />
                </div>
                <ProgressBar value={progress} className="mb-2" />
                {goal.keyResults.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {goal.keyResults.length} key result
                    {goal.keyResults.length !== 1 ? "s" : ""}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
