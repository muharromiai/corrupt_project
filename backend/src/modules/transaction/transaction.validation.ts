import { z } from "zod";

export const createTransactionSchema = z.object({
  budgetId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  description: z.string().min(10).max(2000),
  amount: z.number().positive("Jumlah harus lebih dari 0"),
  category: z.enum(["DISBURSEMENT", "PROCUREMENT", "SALARY", "GRANT", "SUBSIDY", "MAINTENANCE", "OPERATIONAL", "OTHER"]),
  recipientName: z.string().min(2).max(200),
  recipientAccount: z.string().min(5).max(100),
});

export const verifyTransactionSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().min(5).max(2000),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type VerifyTransactionInput = z.infer<typeof verifyTransactionSchema>;
