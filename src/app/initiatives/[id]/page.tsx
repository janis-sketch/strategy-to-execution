"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { calculateInitiativeProgress } from "@/lib/progress";

interface InitiativeDetail {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  focusArea: { id: string; title: string; color?: string | null };
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    assignee?: { id: string; name: string } | null;
    dueDate?: string | null;
  }>;
}

export default function InitiativeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [initiative, setInitiative] = useState<InitiativeDetail | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/initiatives/${id}`);
    if (res.ok) setInitiative(await res.json());
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!initiative) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-64" />
      </div>
    );
  }

  const progress = calculateInitiativeProgress(initiative);

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTaskTitle, initiativeId: id }),
    });
    setNewTaskTitle("");
    fetchData();
  };

  const toggleTask = async (
    taskId: string,
    currentStatus: string
  ) => {
    const nextStatus =
      currentStatus === "done"
        ? "todo"
        : currentStatus === "todo"
          ? "in_progress"
          : "done";
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    fetchData();
  };

  const deleteTask = async (taskId: string) => {
    await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
    fetchData();
  };

  const updateStatus = async (status: string) => {
    await fetch(`/api/initiatives/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const taskIcon = (status: string) => {
    if (status === "done")
      return <CheckCircle2 size={18} className="text-green-500" />;
    if (status === "in_progress")
      return <Clock size={18} className="text-blue-500" />;
    return <Circle size={18} className="text-gray-300" />;
  };

  return (
    <>
      <Link
        href="/initiatives"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft size={14} /> Back to Initiatives
      </Link>

      <PageHeader title={initiative.title} />

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <select
          value={initiative.status}
          onChange={(e) => updateStatus(e.target.value)}
          className="px-3 py-1.5 border rounded-lg text-sm"
        >
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <PriorityBadge priority={initiative.priority} />
        <Link
          href={`/focus-areas/${initiative.focusArea.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          <span
            className="inline-block w-2 h-2 rounded-full mr-1"
            style={{
              backgroundColor:
                initiative.focusArea.color || "#2563eb",
            }}
          />
          {initiative.focusArea.title}
        </Link>
      </div>

      {initiative.description && (
        <p className="text-muted-foreground mb-6">{initiative.description}</p>
      )}

      <div className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Task Progress</span>
          <span className="text-2xl font-bold">{progress}%</span>
        </div>
        <ProgressBar value={progress} showLabel={false} size="lg" />
        <p className="text-xs text-muted-foreground mt-2">
          {initiative.tasks.filter((t) => t.status === "done").length} of{" "}
          {initiative.tasks.length} tasks completed
        </p>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Tasks</h2>
        </div>

        <div className="divide-y">
          {initiative.tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50"
            >
              <button onClick={() => toggleTask(task.id, task.status)}>
                {taskIcon(task.status)}
              </button>
              <span
                className={`flex-1 text-sm ${
                  task.status === "done"
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {task.title}
              </span>
              {task.assignee && (
                <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                  {task.assignee.name}
                </span>
              )}
              <PriorityBadge priority={task.priority} />
              <button
                onClick={() => deleteTask(task.id)}
                className="text-muted-foreground hover:text-red-500 p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTask();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              <Plus size={14} /> Add
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
