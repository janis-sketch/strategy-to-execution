"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Rocket } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { calculateInitiativeProgress } from "@/lib/progress";

interface Initiative {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  focusArea: { id: string; title: string; color?: string | null };
  tasks: Array<{ status: string }>;
}

export default function InitiativesPage() {
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInitiatives = useCallback(async () => {
    const res = await fetch("/api/initiatives");
    const data = await res.json();
    setInitiatives(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInitiatives();
  }, [fetchInitiatives]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-40" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Initiatives"
        description="Projects and efforts driving your strategic priorities"
      />

      {initiatives.length === 0 ? (
        <EmptyState
          icon={<Rocket size={48} />}
          title="No initiatives yet"
          description="Initiatives are created within focus areas. Go to a focus area to add initiatives."
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
        <div className="space-y-3">
          {initiatives.map((init) => {
            const progress = calculateInitiativeProgress(init);
            return (
              <Link
                key={init.id}
                href={`/initiatives/${init.id}`}
                className="flex items-center gap-4 bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium truncate">{init.title}</h3>
                    <StatusBadge status={init.status} />
                    <PriorityBadge priority={init.priority} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          init.focusArea.color || "#2563eb",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {init.focusArea.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      &middot; {init.tasks.length} tasks
                    </span>
                  </div>
                </div>
                <ProgressBar value={progress} className="w-32 shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
