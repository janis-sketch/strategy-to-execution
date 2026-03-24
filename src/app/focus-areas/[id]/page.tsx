"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trophy, Rocket } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Modal } from "@/components/shared/modal";
import { GoalForm } from "@/components/goals/goal-form";
import { InitiativeForm } from "@/components/initiatives/initiative-form";
import {
  calculateFocusAreaProgress,
  calculateGoalProgress,
  calculateInitiativeProgress,
} from "@/lib/progress";

interface FocusAreaDetail {
  id: string;
  title: string;
  description?: string | null;
  color?: string | null;
  parent?: { id: string; title: string } | null;
  goals: Array<{
    id: string;
    title: string;
    goalType: string;
    status: string;
    currentValue: number;
    targetValue: number;
    startValue: number;
    keyResults: Array<{
      id: string;
      title: string;
      goalType: string;
      status: string;
      currentValue: number;
      targetValue: number;
      startValue: number;
    }>;
  }>;
  initiatives: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    tasks: Array<{ id: string; status: string }>;
  }>;
  assignments: Array<{
    id: string;
    role?: string | null;
    teamMember: { id: string; name: string; role?: string | null };
  }>;
}

export default function FocusAreaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [focusArea, setFocusArea] = useState<FocusAreaDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"goals" | "initiatives">("goals");
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showInitForm, setShowInitForm] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/focus-areas/${id}`);
    if (res.ok) {
      setFocusArea(await res.json());
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!focusArea) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64" />
        <div className="h-4 bg-gray-100 rounded w-96" />
      </div>
    );
  }

  const progress = calculateFocusAreaProgress(focusArea);
  const objectives = focusArea.goals.filter((g) => g.goalType === "objective");

  const handleCreateGoal = async (data: Record<string, unknown>) => {
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, focusAreaId: id }),
    });
    setShowGoalForm(false);
    fetchData();
  };

  const handleCreateInitiative = async (data: Record<string, unknown>) => {
    await fetch("/api/initiatives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, focusAreaId: id }),
    });
    setShowInitForm(false);
    fetchData();
  };

  return (
    <>
      <Link
        href="/focus-areas"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft size={14} /> Back to Focus Areas
      </Link>

      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-1 h-12 rounded-full shrink-0"
          style={{ backgroundColor: focusArea.color || "#2563eb" }}
        />
        <div className="flex-1">
          <PageHeader
            title={focusArea.title}
            description={focusArea.description || undefined}
          />
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-2xl font-bold">{progress}%</span>
        </div>
        <ProgressBar value={progress} showLabel={false} size="lg" />
        <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
          <span>{focusArea.goals.length} goals</span>
          <span>{focusArea.initiatives.length} initiatives</span>
          <span>{focusArea.assignments.length} team members</span>
        </div>
      </div>

      <div className="flex gap-1 border-b mb-6">
        <button
          onClick={() => setActiveTab("goals")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "goals"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Goals ({focusArea.goals.length})
        </button>
        <button
          onClick={() => setActiveTab("initiatives")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "initiatives"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Initiatives ({focusArea.initiatives.length})
        </button>
      </div>

      {activeTab === "goals" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowGoalForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus size={14} /> Add Goal
            </button>
          </div>

          {objectives.length === 0 ? (
            <EmptyState
              icon={<Trophy size={40} />}
              title="No goals yet"
              description="Add objectives and key results to track progress toward this focus area."
            />
          ) : (
            <div className="space-y-4">
              {objectives.map((goal) => {
                const goalProgress = calculateGoalProgress(goal);
                return (
                  <div
                    key={goal.id}
                    className="bg-white border rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Link
                        href={`/goals/${goal.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {goal.title}
                      </Link>
                      <StatusBadge status={goal.status} />
                    </div>
                    <ProgressBar value={goalProgress} className="mb-3" />
                    {goal.keyResults.length > 0 && (
                      <div className="ml-4 space-y-2 mt-3 border-l-2 border-gray-100 pl-4">
                        {goal.keyResults.map((kr) => (
                          <div key={kr.id} className="flex items-center gap-3">
                            <span className="text-sm text-muted-foreground flex-1">
                              {kr.title}
                            </span>
                            <span className="text-xs font-medium">
                              {kr.currentValue}/{kr.targetValue}
                            </span>
                            <ProgressBar
                              value={calculateGoalProgress(kr)}
                              className="w-24"
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "initiatives" && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowInitForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              <Plus size={14} /> Add Initiative
            </button>
          </div>

          {focusArea.initiatives.length === 0 ? (
            <EmptyState
              icon={<Rocket size={40} />}
              title="No initiatives yet"
              description="Add initiatives to track the projects driving this focus area."
            />
          ) : (
            <div className="space-y-3">
              {focusArea.initiatives.map((init) => {
                const initProgress = calculateInitiativeProgress(init);
                return (
                  <Link
                    key={init.id}
                    href={`/initiatives/${init.id}`}
                    className="flex items-center gap-4 bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{init.title}</span>
                        <StatusBadge status={init.status} />
                        <PriorityBadge priority={init.priority} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {init.tasks.length} tasks
                      </span>
                    </div>
                    <ProgressBar value={initProgress} className="w-32" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      <Modal
        open={showGoalForm}
        onClose={() => setShowGoalForm(false)}
        title="New Goal"
      >
        <GoalForm
          focusAreaId={id}
          objectives={objectives}
          onSubmit={handleCreateGoal}
          onCancel={() => setShowGoalForm(false)}
        />
      </Modal>

      <Modal
        open={showInitForm}
        onClose={() => setShowInitForm(false)}
        title="New Initiative"
      >
        <InitiativeForm
          focusAreaId={id}
          onSubmit={handleCreateInitiative}
          onCancel={() => setShowInitForm(false)}
        />
      </Modal>
    </>
  );
}
