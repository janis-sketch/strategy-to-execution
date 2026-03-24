"use client";

import Link from "next/link";
import { Target, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ProgressBar } from "@/components/shared/progress-bar";
import { calculateFocusAreaProgress } from "@/lib/progress";
import { useState } from "react";

interface FocusAreaCardProps {
  focusArea: {
    id: string;
    title: string;
    description?: string | null;
    color?: string | null;
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
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function FocusAreaCard({
  focusArea,
  onEdit,
  onDelete,
}: FocusAreaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = calculateFocusAreaProgress(focusArea);
  const goalCount = focusArea._count?.goals ?? focusArea.goals.length;
  const initCount =
    focusArea._count?.initiatives ?? focusArea.initiatives.length;

  return (
    <div className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div
        className="h-1.5"
        style={{ backgroundColor: focusArea.color || "#2563eb" }}
      />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Link
            href={`/focus-areas/${focusArea.id}`}
            className="flex items-center gap-2 group"
          >
            <Target
              size={18}
              style={{ color: focusArea.color || "#2563eb" }}
            />
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {focusArea.title}
            </h3>
          </Link>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded hover:bg-gray-100 text-muted-foreground"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 bg-white border rounded-lg shadow-lg py-1 w-36">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete();
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {focusArea.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {focusArea.description}
          </p>
        )}

        <ProgressBar value={progress} className="mb-3" />

        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{goalCount} goals</span>
          <span>{initCount} initiatives</span>
        </div>
      </div>
    </div>
  );
}
