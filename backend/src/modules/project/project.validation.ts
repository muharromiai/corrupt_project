import { z } from "zod";

export const createProjectSchema = z.object({
  budgetId: z.string().uuid(),
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  location: z.string().min(2).max(200),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  contractorName: z.string().min(2).max(200),
  contractValue: z.number().positive(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  description: z.string().min(10).max(2000).optional(),
  location: z.string().min(2).max(200).optional(),
  status: z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  contractorName: z.string().min(2).max(200).optional(),
  contractValue: z.number().positive().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
