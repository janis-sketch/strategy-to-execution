"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { calculateGoalProgress } from "@/lib/progress";

interface GoalDetail {
  id: string;
  title: string;
  description?: string | null;
  goalType: string;
  status: string;
  currentValue: number;
  targetValue: number;
  startValue: number;
  unit?: string | null;
  dueDate?: string | null;
  focusArea: { id: string; title: string; color?: string | null };
  keyResults: Array<{
    id: string;
    title: string;
    goalType: string;
    status: string;
    currentValue: number;
    targetValue: number;
    startValue: number;
    unit?: string | null;
  }>;
}

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [goal, setGoal] = useState<GoalDetail | null>(null);

  const fetchGoal = useCallback(async () => {
    const res = await fetch(`/api/goals/${id}`);
    if (res.ok) setGoal(await res.json());
  }, [id]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal]);

  if (!goal) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64" />
      </div>
    );
  }

  const progress = calculateGoalProgress(goal);

  const updateKeyResult = async (krId: string, currentValue: number) => {
    await fetch(`/api/goals/${krId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentValue }),
    });
    fetchGoal();
  };

  return (
    <>
      <Link
        href="/goals"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft size={14} /> Back to Goals
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <Trophy size={20} className="text-primary" />
        <PageHeader title={goal.title} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <StatusBadge status={goal.status} />
        <Link
          href={`/focus-areas/${goal.focusArea.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          <span
            className="inline-block w-2 h-2 rounded-full mr-1"
            style={{
              backgroundColor: goal.focusArea.color || "#2563eb",
            }}
          />
          {goal.focusArea.title}
        </Link>
      </div>

      {goal.description && (
        <p className="text-muted-foreground mb-6">{goal.description}</p>
      )}

      <div className="bg-white border rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-3xl font-bold">{progress}%</span>
        </div>
        <ProgressBar value={progress} showLabel={false} size="lg" />
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span>
            Current: {goal.currentValue}
            {goal.unit}
          </span>
          <span>
            Target: {goal.targetValue}
            {goal.unit}
          </span>
        </div>
      </div>

      {goal.keyResults.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Key Results</h2>
          <div className="space-y-3">
            {goal.keyResults.map((kr) => {
              const krProgress = calculateGoalProgress(kr);
              return (
                <div
                  key={kr.id}
                  className="bg-white border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-medium text-sm">{kr.title}</span>
                    <StatusBadge status={kr.status} />
                  </div>
                  <ProgressBar value={krProgress} className="mb-2" />
                  <div className="flex items-center gap-3 text-sm">
                    <label className="text-muted-foreground">
                      Current:
                    </label>
                    <input
                      type="number"
                      value={kr.currentValue}
                      onChange={(e) =>
                        updateKeyResult(kr.id, Number(e.target.value))
                      }
                      className="w-20 px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-muted-foreground">
                      / {kr.targetValue} {kr.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
