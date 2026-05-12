import { z } from "zod";

export const createReportSchema = z.object({
  transactionId: z.string().uuid().optional(),
  budgetId: z.string().uuid().optional(),
  title: z.string().min(10).max(200),
  description: z.string().min(20).max(5000),
  evidence: z.string().optional(),
});

export const updateReportSchema = z.object({
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "RESOLVED", "DISMISSED"]).optional(),
  adminNotes: z.string().min(5).max(2000).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportInput = z.infer<typeof updateReportSchema>;
