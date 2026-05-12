import { z } from "zod";

export const createBudgetSchema = z.object({
  name: z.string().min(3).max(200),
  category: z.enum(["INFRASTRUCTURE", "EDUCATION", "HEALTH", "DEFENSE", "SOCIAL_WELFARE", "AGRICULTURE", "TECHNOLOGY", "TRANSPORTATION", "ENERGY", "OTHER"]),
  fiscalYear: z.number().int().min(2000).max(2100),
  totalAmount: z.number().positive("Total amount harus lebih dari 0"),
  description: z.string().min(10).max(2000),
});

export const updateBudgetSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  category: z.enum(["INFRASTRUCTURE", "EDUCATION", "HEALTH", "DEFENSE", "SOCIAL_WELFARE", "AGRICULTURE", "TECHNOLOGY", "TRANSPORTATION", "ENERGY", "OTHER"]).optional(),
  totalAmount: z.number().positive().optional(),
  description: z.string().min(10).max(2000).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
