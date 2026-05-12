import { describe, it, expect } from "@jest/globals";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password harus mengandung huruf besar, kecil, dan angka"),
  role: z.enum(["ADMIN", "GOVERNMENT", "OPERATOR", "AUDITOR", "PUBLIC"]),
});

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const createBudgetSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  category: z.enum(["INFRASTRUCTURE", "EDUCATION", "HEALTH", "DEFENSE", "SOCIAL_WELFARE", "AGRICULTURE", "TECHNOLOGY", "TRANSPORTATION", "ENERGY", "OTHER"]),
  fiscalYear: z.number().min(2020).max(2100),
  totalAmount: z.number().positive("Total harus positif"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
});

const createTransactionSchema = z.object({
  budgetId: z.string().uuid(),
  description: z.string().min(10),
  amount: z.number().positive(),
  category: z.enum(["DISBURSEMENT", "PROCUREMENT", "SALARY", "GRANT", "SUBSIDY", "MAINTENANCE", "OPERATIONAL", "OTHER"]),
  recipientName: z.string().min(2),
  recipientAccount: z.string().min(5),
});

const verifyTransactionSchema = z.object({
  action: z.enum(["APPROVED", "REJECTED"]),
  notes: z.string().min(5),
});

const createReportSchema = z.object({
  title: z.string().min(10),
  description: z.string().min(20),
  evidence: z.string().optional(),
});

describe("Validation Schemas", () => {
  describe("Register Schema", () => {
    it("should validate correct registration data", () => {
      const data = { name: "Test User", email: "test@email.com", password: "Password123", role: "PUBLIC" as const };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject short name", () => {
      const data = { name: "A", email: "test@email.com", password: "Password123", role: "PUBLIC" as const };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const data = { name: "Test", email: "not-email", password: "Password123", role: "PUBLIC" as const };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject weak password", () => {
      const data = { name: "Test", email: "test@email.com", password: "weak", role: "PUBLIC" as const };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject password without uppercase", () => {
      const data = { name: "Test", email: "test@email.com", password: "password123", role: "PUBLIC" as const };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid role", () => {
      const data = { name: "Test", email: "test@email.com", password: "Password123", role: "INVALID" };
      const result = registerSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all valid roles", () => {
      const roles = ["ADMIN", "GOVERNMENT", "OPERATOR", "AUDITOR", "PUBLIC"] as const;
      roles.forEach((role) => {
        const result = registerSchema.safeParse({ name: "Test", email: "test@email.com", password: "Password123", role });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Login Schema", () => {
    it("should validate correct login data", () => {
      const result = loginSchema.safeParse({ email: "test@email.com", password: "password" });
      expect(result.success).toBe(true);
    });

    it("should reject empty password", () => {
      const result = loginSchema.safeParse({ email: "test@email.com", password: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("Budget Schema", () => {
    it("should validate correct budget data", () => {
      const data = {
        name: "Anggaran Infrastruktur",
        category: "INFRASTRUCTURE" as const,
        fiscalYear: 2025,
        totalAmount: 1000000000,
        description: "Anggaran untuk pembangunan infrastruktur jalan",
      };
      const result = createBudgetSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject negative amount", () => {
      const data = {
        name: "Test", category: "INFRASTRUCTURE" as const,
        fiscalYear: 2025, totalAmount: -1000, description: "Test description minimum",
      };
      const result = createBudgetSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should reject invalid fiscal year", () => {
      const data = {
        name: "Test", category: "INFRASTRUCTURE" as const,
        fiscalYear: 1990, totalAmount: 1000, description: "Test description minimum",
      };
      const result = createBudgetSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all budget categories", () => {
      const categories = ["INFRASTRUCTURE", "EDUCATION", "HEALTH", "DEFENSE", "SOCIAL_WELFARE", "AGRICULTURE", "TECHNOLOGY", "TRANSPORTATION", "ENERGY", "OTHER"] as const;
      categories.forEach((category) => {
        const result = createBudgetSchema.safeParse({
          name: "Test Budget", category, fiscalYear: 2025, totalAmount: 1000, description: "Test description for budget",
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Transaction Schema", () => {
    it("should validate correct transaction data", () => {
      const data = {
        budgetId: "550e8400-e29b-41d4-a716-446655440000",
        description: "Pembayaran kontrak pengadaan barang",
        amount: 50000000,
        category: "PROCUREMENT" as const,
        recipientName: "PT Maju Jaya",
        recipientAccount: "BCA-1234567890",
      };
      const result = createTransactionSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should reject invalid UUID", () => {
      const data = {
        budgetId: "not-a-uuid",
        description: "Test transaction description",
        amount: 1000,
        category: "PROCUREMENT" as const,
        recipientName: "PT Test",
        recipientAccount: "BCA-12345",
      };
      const result = createTransactionSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it("should accept all transaction categories", () => {
      const categories = ["DISBURSEMENT", "PROCUREMENT", "SALARY", "GRANT", "SUBSIDY", "MAINTENANCE", "OPERATIONAL", "OTHER"] as const;
      categories.forEach((category) => {
        const result = createTransactionSchema.safeParse({
          budgetId: "550e8400-e29b-41d4-a716-446655440000",
          description: "Test transaction for " + category,
          amount: 1000,
          category,
          recipientName: "PT Test",
          recipientAccount: "BANK-12345",
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Verify Transaction Schema", () => {
    it("should validate approve action", () => {
      const result = verifyTransactionSchema.safeParse({ action: "APPROVED", notes: "Dokumen lengkap" });
      expect(result.success).toBe(true);
    });

    it("should validate reject action", () => {
      const result = verifyTransactionSchema.safeParse({ action: "REJECTED", notes: "Dokumen tidak valid" });
      expect(result.success).toBe(true);
    });

    it("should reject invalid action", () => {
      const result = verifyTransactionSchema.safeParse({ action: "INVALID", notes: "Some notes" });
      expect(result.success).toBe(false);
    });
  });

  describe("Report Schema", () => {
    it("should validate correct report", () => {
      const result = createReportSchema.safeParse({
        title: "Dugaan markup harga pengadaan",
        description: "Ditemukan perbedaan harga yang signifikan antara harga pasar dan harga kontrak",
      });
      expect(result.success).toBe(true);
    });

    it("should validate report with evidence", () => {
      const result = createReportSchema.safeParse({
        title: "Dugaan markup harga pengadaan barang",
        description: "Ditemukan perbedaan harga yang signifikan antara harga pasar",
        evidence: "https://drive.google.com/file/bukti123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject short title", () => {
      const result = createReportSchema.safeParse({ title: "Short", description: "Description is long enough for validation" });
      expect(result.success).toBe(false);
    });
  });
});
