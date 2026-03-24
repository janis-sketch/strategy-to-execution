"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Target, Trophy, Rocket, Users, ArrowRight, Plus } from "lucide-react";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  calculateFocusAreaProgress,
  calculateOverallProgress,
} from "@/lib/progress";

interface FocusAreaData {
  id: string;
  title: string;
  color?: string | null;
  parentId?: string | null;
  goals: Array<{
    goalType: string;
    currentValue: number;
    targetValue: number;
    startValue: number;
    status: string;
    keyResults?: Array<{
      goalType: string;
      currentValue: number;
      targetValue: number;
      startValue: number;
      status: string;
    }>;
  }>;
  initiatives: Array<{
    status: string;
    tasks: Array<{ status: string }>;
  }>;
}

interface GoalData {
  id: string;
  title: string;
  status: string;
  goalType: string;
  focusArea: { title: string; color?: string | null };
}

interface InitiativeData {
  id: string;
  title: string;
  status: string;
  tasks: Array<{ status: string }>;
}

interface DashboardState {
  focusAreas: FocusAreaData[];
  goals: GoalData[];
  initiatives: InitiativeData[];
  teamCount: number;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  subtext?: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border rounded-xl p-5 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon size={20} className="text-primary" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </Link>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardState | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [faRes, goalRes, initRes, teamRes] = await Promise.all([
      fetch("/api/focus-areas"),
      fetch("/api/goals"),
      fetch("/api/initiatives"),
      fetch("/api/team"),
    ]);

    const [focusAreas, goals, initiatives, team] = await Promise.all([
      faRes.json(),
      goalRes.json(),
      initRes.json(),
      teamRes.json(),
    ]);

    setData({
      focusAreas,
      goals,
      initiatives,
      teamCount: team.length,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const topLevelFAs = data.focusAreas.filter((fa) => !fa.parentId);
  const overallProgress = calculateOverallProgress(topLevelFAs);
  const totalTasks = data.initiatives.reduce(
    (sum, i) => sum + i.tasks.length,
    0
  );
  const completedTasks = data.initiatives.reduce(
    (sum, i) => sum + i.tasks.filter((t) => t.status === "done").length,
    0
  );
  const objectives = data.goals.filter((g) => g.goalType === "objective");
  const onTrackGoals = objectives.filter(
    (g) => g.status === "on_track" || g.status === "completed"
  ).length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Strategy Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect your strategic priorities to daily execution
        </p>
      </div>

      {/* Overall Progress */}
      {topLevelFAs.length > 0 && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">
              Overall Strategy Progress
            </h2>
            <span className="text-4xl font-bold text-primary">
              {overallProgress}%
            </span>
          </div>
          <ProgressBar value={overallProgress} showLabel={false} size="lg" />
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          label="Focus Areas"
          value={topLevelFAs.length}
          href="/focus-areas"
        />
        <StatCard
          icon={Trophy}
          label="Objectives"
          value={objectives.length}
          subtext={
            objectives.length > 0
              ? `${Math.round((onTrackGoals / objectives.length) * 100)}% on track`
              : undefined
          }
          href="/goals"
        />
        <StatCard
          icon={Rocket}
          label="Initiatives"
          value={data.initiatives.length}
          subtext={
            totalTasks > 0
              ? `${completedTasks}/${totalTasks} tasks done`
              : undefined
          }
          href="/initiatives"
        />
        <StatCard
          icon={Users}
          label="Team Members"
          value={data.teamCount}
          href="/team"
        />
      </div>

      {/* Focus Area Progress */}
      {topLevelFAs.length > 0 && (
        <div className="bg-white border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Focus Area Progress</h2>
            <Link
              href="/focus-areas"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {topLevelFAs.map((fa) => {
              const progress = calculateFocusAreaProgress(fa);
              return (
                <div key={fa.id}>
                  <div className="flex items-center justify-between mb-1">
                    <Link
                      href={`/focus-areas/${fa.id}`}
                      className="flex items-center gap-2 text-sm font-medium hover:text-primary"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: fa.color || "#2563eb",
                        }}
                      />
                      {fa.title}
                    </Link>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <ProgressBar
                    value={progress}
                    showLabel={false}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Goals Status Overview */}
      {objectives.length > 0 && (
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Goals Overview</h2>
            <Link
              href="/goals"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {objectives.slice(0, 5).map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: goal.focusArea.color || "#2563eb",
                    }}
                  />
                  <Link
                    href={`/goals/${goal.id}`}
                    className="text-sm font-medium hover:text-primary"
                  >
                    {goal.title}
                  </Link>
                </div>
                <StatusBadge status={goal.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for new users */}
      {topLevelFAs.length === 0 && (
        <div className="bg-white border rounded-xl p-12 text-center">
          <Target size={48} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            Welcome to StrategyHub
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start by creating your strategic focus areas, then add goals and
            initiatives to connect strategy to execution.
          </p>
          <Link
            href="/focus-areas"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
          >
            <Plus size={18} /> Create Your First Focus Area
          </Link>
        </div>
      )}
    </>
  );
}
