interface TaskLike {
  status: string;
}

interface InitiativeLike {
  tasks: TaskLike[];
  status: string;
}

interface GoalLike {
  goalType: string;
  currentValue: number;
  targetValue: number;
  startValue: number;
  status: string;
  keyResults?: GoalLike[];
}

interface FocusAreaLike {
  goals: GoalLike[];
  initiatives: InitiativeLike[];
}

export function calculateTaskCompletionRate(tasks: TaskLike[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}

export function calculateInitiativeProgress(
  initiative: InitiativeLike
): number {
  if (initiative.status === "completed") return 100;
  if (initiative.status === "cancelled") return 0;
  return calculateTaskCompletionRate(initiative.tasks);
}

export function calculateGoalProgress(goal: GoalLike): number {
  if (goal.status === "completed") return 100;

  // If it has key results, average their progress
  if (goal.keyResults && goal.keyResults.length > 0) {
    const totalProgress = goal.keyResults.reduce(
      (sum, kr) => sum + calculateGoalProgress(kr),
      0
    );
    return Math.round(totalProgress / goal.keyResults.length);
  }

  // Otherwise use current/target values
  const range = goal.targetValue - goal.startValue;
  if (range === 0) return goal.currentValue >= goal.targetValue ? 100 : 0;
  const progress =
    ((goal.currentValue - goal.startValue) / range) * 100;
  return Math.round(Math.max(0, Math.min(100, progress)));
}

export function calculateFocusAreaProgress(focusArea: FocusAreaLike): number {
  const goalProgresses = focusArea.goals
    .filter((g) => g.goalType === "objective")
    .map((g) => calculateGoalProgress(g));

  const initiativeProgresses = focusArea.initiatives.map((i) =>
    calculateInitiativeProgress(i)
  );

  const allProgresses = [...goalProgresses, ...initiativeProgresses];
  if (allProgresses.length === 0) return 0;

  return Math.round(
    allProgresses.reduce((sum, p) => sum + p, 0) / allProgresses.length
  );
}

export function calculateOverallProgress(focusAreas: FocusAreaLike[]): number {
  if (focusAreas.length === 0) return 0;
  const total = focusAreas.reduce(
    (sum, fa) => sum + calculateFocusAreaProgress(fa),
    0
  );
  return Math.round(total / focusAreas.length);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    not_started: "bg-gray-100 text-gray-700",
    on_track: "bg-green-100 text-green-700",
    at_risk: "bg-yellow-100 text-yellow-700",
    behind: "bg-red-100 text-red-700",
    completed: "bg-blue-100 text-blue-700",
    planned: "bg-gray-100 text-gray-700",
    in_progress: "bg-blue-100 text-blue-700",
    on_hold: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    todo: "bg-gray-100 text-gray-700",
    done: "bg-green-100 text-green-700",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: "bg-slate-100 text-slate-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    critical: "bg-red-100 text-red-700",
  };
  return colors[priority] || "bg-gray-100 text-gray-700";
}

export function getProgressColor(progress: number): string {
  if (progress >= 75) return "bg-green-500";
  if (progress >= 50) return "bg-blue-500";
  if (progress >= 25) return "bg-yellow-500";
  return "bg-red-500";
}

export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
