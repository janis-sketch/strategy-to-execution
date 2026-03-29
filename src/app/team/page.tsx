"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Users, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Modal } from "@/components/shared/modal";
import { getInitials } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  assignments: Array<{
    id: string;
    role?: string | null;
    focusArea: { id: string; title: string; color?: string | null };
  }>;
  taskAssignments: Array<{
    id: string;
    status: string;
  }>;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const fetchMembers = useCallback(async () => {
    const res = await fetch("/api/team");
    const data = await res.json();
    setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role: role || null }),
    });
    setName("");
    setEmail("");
    setRole("");
    setShowForm(false);
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/team/${id}`, { method: "DELETE" });
    fetchMembers();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Team"
        description="Manage team members and see who works on what"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            <Plus size={16} /> Add Member
          </button>
        }
      />

      {members.length === 0 ? (
        <EmptyState
          icon={<Users size={48} />}
          title="No team members yet"
          description="Add your team members to assign them to focus areas and tasks."
          action={
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg"
            >
              Add Team Member
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const totalTasks = member.taskAssignments.length;
            const doneTasks = member.taskAssignments.filter(
              (t) => t.status === "done"
            ).length;

            return (
              <div
                key={member.id}
                className="bg-white border rounded-xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                      {getInitials(member.name)}
                    </div>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      {member.role && (
                        <p className="text-xs text-muted-foreground">
                          {member.role}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="text-muted-foreground hover:text-red-500 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <p className="text-xs text-muted-foreground mt-3">
                  {member.email}
                </p>

                {member.assignments.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Focus Areas
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {member.assignments.map((a) => (
                        <span
                          key={a.id}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor:
                              (a.focusArea.color || "#2563eb") + "20",
                            color: a.focusArea.color || "#2563eb",
                          }}
                        >
                          {a.focusArea.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {totalTasks > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    {doneTasks}/{totalTasks} tasks completed
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Team Member"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Engineering Lead"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium rounded-md border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !email.trim()}
              className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Add Member
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
