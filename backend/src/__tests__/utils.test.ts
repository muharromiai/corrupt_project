import { describe, it, expect } from "@jest/globals";

describe("Utility Functions", () => {
  describe("Pagination", () => {
    const getPaginationParams = (query: { page?: string; limit?: string }) => {
      const page = Math.max(1, parseInt(query.page || "1"));
      const limit = Math.min(Math.max(1, parseInt(query.limit || "10")), 100);
      const skip = (page - 1) * limit;
      return { page, limit, skip };
    };

    it("should return default values", () => {
      const result = getPaginationParams({});
      expect(result).toEqual({ page: 1, limit: 10, skip: 0 });
    });

    it("should parse page and limit", () => {
      const result = getPaginationParams({ page: "3", limit: "20" });
      expect(result).toEqual({ page: 3, limit: 20, skip: 40 });
    });

    it("should cap limit at 100", () => {
      const result = getPaginationParams({ limit: "500" });
      expect(result.limit).toBe(100);
    });

    it("should set minimum page to 1", () => {
      const result = getPaginationParams({ page: "-1" });
      expect(result.page).toBe(1);
    });

    it("should calculate correct skip value", () => {
      const result = getPaginationParams({ page: "5", limit: "25" });
      expect(result.skip).toBe(100);
    });
  });

  describe("Response Formatters", () => {
    const sendSuccess = (data: any, message = "Success") => ({
      success: true, message, data,
    });

    const sendPaginated = (data: any[], total: number, page: number, limit: number) => ({
      success: true, data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });

    const sendError = (message: string, statusCode = 400) => ({
      success: false, message, statusCode,
    });

    it("should format success response", () => {
      const result = sendSuccess({ id: "1" });
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: "1" });
    });

    it("should format paginated response", () => {
      const result = sendPaginated([{ id: "1" }], 50, 1, 10);
      expect(result.success).toBe(true);
      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.total).toBe(50);
    });

    it("should format error response", () => {
      const result = sendError("Not found", 404);
      expect(result.success).toBe(false);
      expect(result.message).toBe("Not found");
      expect(result.statusCode).toBe(404);
    });

    it("should calculate total pages correctly", () => {
      expect(sendPaginated([], 0, 1, 10).meta.totalPages).toBe(0);
      expect(sendPaginated([], 1, 1, 10).meta.totalPages).toBe(1);
      expect(sendPaginated([], 11, 1, 10).meta.totalPages).toBe(2);
      expect(sendPaginated([], 100, 1, 10).meta.totalPages).toBe(10);
    });
  });

  describe("Role Authorization", () => {
    const checkRole = (userRole: string, allowedRoles: string[]): boolean => {
      return allowedRoles.includes(userRole);
    };

    it("should authorize matching role", () => {
      expect(checkRole("ADMIN", ["ADMIN"])).toBe(true);
      expect(checkRole("AUDITOR", ["AUDITOR", "ADMIN"])).toBe(true);
    });

    it("should deny non-matching role", () => {
      expect(checkRole("PUBLIC", ["ADMIN"])).toBe(false);
      expect(checkRole("OPERATOR", ["GOVERNMENT", "ADMIN"])).toBe(false);
    });

    it("should handle multiple roles", () => {
      expect(checkRole("GOVERNMENT", ["GOVERNMENT", "ADMIN"])).toBe(true);
      expect(checkRole("ADMIN", ["GOVERNMENT", "ADMIN"])).toBe(true);
    });
  });

  describe("Budget Calculations", () => {
    it("should calculate remaining amount", () => {
      const total = 1000000000;
      const allocated = 400000000;
      const remaining = total - allocated;
      expect(remaining).toBe(600000000);
    });

    it("should calculate absorption percentage", () => {
      const total = 1000000000;
      const allocated = 750000000;
      const absorption = (allocated / total) * 100;
      expect(absorption).toBe(75);
    });

    it("should handle zero total amount", () => {
      const total = 0;
      const absorption = total > 0 ? (0 / total) * 100 : 0;
      expect(absorption).toBe(0);
    });

    it("should not exceed 100% allocation", () => {
      const total = 1000000000;
      const allocated = 1200000000;
      const pct = Math.min((allocated / total) * 100, 100);
      expect(pct).toBe(100);
    });
  });

  describe("Status Color Mapping", () => {
    const getStatusColor = (status: string): string => {
      switch (status) {
        case "PENDING": return "text-yellow-400";
        case "APPROVED": return "text-emerald-400";
        case "REJECTED": return "text-red-400";
        default: return "text-muted-foreground";
      }
    };

    it("should return correct colors for each status", () => {
      expect(getStatusColor("PENDING")).toContain("yellow");
      expect(getStatusColor("APPROVED")).toContain("emerald");
      expect(getStatusColor("REJECTED")).toContain("red");
    });

    it("should handle unknown status", () => {
      expect(getStatusColor("UNKNOWN")).toBe("text-muted-foreground");
    });
  });
});
