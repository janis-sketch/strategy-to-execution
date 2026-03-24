"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FocusAreaCard } from "@/components/focus-areas/focus-area-card";
import { FocusAreaForm } from "@/components/focus-areas/focus-area-form";
import { Modal } from "@/components/shared/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

interface FocusArea {
  id: string;
  title: string;
  description?: string | null;
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
  _count?: { goals: number; initiatives: number };
}

export default function FocusAreasPage() {
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFA, setEditingFA] = useState<FocusArea | null>(null);

  const fetchFocusAreas = useCallback(async () => {
    const res = await fetch("/api/focus-areas");
    const data = await res.json();
    setFocusAreas(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFocusAreas();
  }, [fetchFocusAreas]);

  const handleCreate = async (data: {
    title: string;
    description: string;
    color: string;
    parentId: string;
  }) => {
    await fetch("/api/focus-areas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        parentId: data.parentId || null,
      }),
    });
    setShowForm(false);
    fetchFocusAreas();
  };

  const handleUpdate = async (data: {
    title: string;
    description: string;
    color: string;
    parentId: string;
  }) => {
    if (!editingFA) return;
    await fetch(`/api/focus-areas/${editingFA.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        parentId: data.parentId || null,
      }),
    });
    setEditingFA(null);
    fetchFocusAreas();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/focus-areas/${id}`, { method: "DELETE" });
    fetchFocusAreas();
  };

  const topLevel = focusAreas.filter((fa) => !fa.parentId);
  const parentOptions = focusAreas.map((fa) => ({
    id: fa.id,
    title: fa.title,
  }));

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Focus Areas"
        description="Strategic priorities that drive your business forward"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus size={16} /> New Focus Area
          </button>
        }
      />

      {topLevel.length === 0 ? (
        <EmptyState
          icon={<Target size={48} />}
          title="No focus areas yet"
          description="Create your first strategic focus area to start connecting strategy to execution."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Create Focus Area
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topLevel.map((fa) => (
            <FocusAreaCard
              key={fa.id}
              focusArea={fa}
              onEdit={() => setEditingFA(fa)}
              onDelete={() => {}}
            />
          ))}
          {topLevel.map((fa) => (
            <ConfirmDialog
              key={`del-${fa.id}`}
              trigger={<span />}
              title="Delete Focus Area"
              description={`Are you sure you want to delete "${fa.title}"? This will also delete all its goals and initiatives.`}
              onConfirm={() => handleDelete(fa.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New Focus Area"
      >
        <FocusAreaForm
          parentOptions={parentOptions}
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <Modal
        open={!!editingFA}
        onClose={() => setEditingFA(null)}
        title="Edit Focus Area"
      >
        {editingFA && (
          <FocusAreaForm
            initialData={{
              title: editingFA.title,
              description: editingFA.description || "",
              color: editingFA.color || "#2563eb",
              parentId: editingFA.parentId || "",
            }}
            parentOptions={parentOptions.filter(
              (p) => p.id !== editingFA.id
            )}
            onSubmit={handleUpdate}
            onCancel={() => setEditingFA(null)}
          />
        )}
      </Modal>
    </>
  );
}
