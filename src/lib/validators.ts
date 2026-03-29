import { z } from "zod";

export const focusAreaSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional()
    .nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export const goalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  goalType: z.enum(["objective", "key_result"]),
  metricType: z
    .enum(["percentage", "number", "currency", "boolean"])
    .optional()
    .nullable(),
  currentValue: z.number().optional().default(0),
  targetValue: z.number().optional().default(100),
  startValue: z.number().optional().default(0),
  unit: z.string().max(20).optional().nullable(),
  status: z
    .enum(["not_started", "on_track", "at_risk", "behind", "completed"])
    .optional()
    .default("not_started"),
  dueDate: z.string().optional().nullable(),
  focusAreaId: z.string().min(1, "Focus area is required"),
  parentGoalId: z.string().optional().nullable(),
});

export const initiativeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z
    .enum(["planned", "in_progress", "completed", "on_hold", "cancelled"])
    .optional()
    .default("planned"),
  priority: z
    .enum(["low", "medium", "high", "critical"])
    .optional()
    .default("medium"),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  focusAreaId: z.string().min(1, "Focus area is required"),
});

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["todo", "in_progress", "done"]).optional().default("todo"),
  priority: z
    .enum(["low", "medium", "high", "critical"])
    .optional()
    .default("medium"),
  dueDate: z.string().optional().nullable(),
  initiativeId: z.string().min(1, "Initiative is required"),
  assigneeId: z.string().optional().nullable(),
});

export const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  role: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const assignmentSchema = z.object({
  teamMemberId: z.string().min(1),
  focusAreaId: z.string().min(1),
  role: z.enum(["lead", "contributor"]).optional().nullable(),
});

export type FocusAreaInput = z.infer<typeof focusAreaSchema>;
export type GoalInput = z.infer<typeof goalSchema>;
export type InitiativeInput = z.infer<typeof initiativeSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
