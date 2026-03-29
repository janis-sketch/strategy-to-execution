"use client";

import { useState } from "react";

interface GoalFormProps {
  focusAreaId: string;
  objectives?: Array<{ id: string; title: string }>;
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export function GoalForm({
  focusAreaId,
  objectives = [],
  initialData,
  onSubmit,
  onCancel,
}: GoalFormProps) {
  const [title, setTitle] = useState(
    (initialData?.title as string) || ""
  );
  const [goalType, setGoalType] = useState(
    (initialData?.goalType as string) || "objective"
  );
  const [parentGoalId, setParentGoalId] = useState(
    (initialData?.parentGoalId as string) || ""
  );
  const [targetValue, setTargetValue] = useState(
    (initialData?.targetValue as number) ?? 100
  );
  const [unit, setUnit] = useState((initialData?.unit as string) || "%");
  const [status, setStatus] = useState(
    (initialData?.status as string) || "not_started"
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        title,
        goalType,
        parentGoalId: goalType === "key_result" ? parentGoalId || null : null,
        targetValue,
        unit,
        status,
        focusAreaId,
        metricType: unit === "%" ? "percentage" : "number",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="objective"
              checked={goalType === "objective"}
              onChange={(e) => setGoalType(e.target.value)}
            />
            Objective
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              value="key_result"
              checked={goalType === "key_result"}
              onChange={(e) => setGoalType(e.target.value)}
            />
            Key Result
          </label>
        </div>
      </div>

      {goalType === "key_result" && objectives.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Parent Objective
          </label>
          <select
            value={parentGoalId}
            onChange={(e) => setParentGoalId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Select objective...</option>
            {objectives.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            goalType === "objective"
              ? "e.g., Increase customer retention"
              : "e.g., Reduce churn rate to 5%"
          }
          className="w-full px-3 py-2 border rounded-lg text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Target Value
          </label>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Unit</label>
          <input
            type="text"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value="not_started">Not Started</option>
          <option value="on_track">On Track</option>
          <option value="at_risk">At Risk</option>
          <option value="behind">Behind</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Create Goal"}
        </button>
      </div>
    </form>
  );
}
