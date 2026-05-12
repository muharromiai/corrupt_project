import { describe, it, expect } from "@jest/globals";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

describe("Auth Unit Tests", () => {
  const JWT_SECRET = "test-jwt-secret-key-for-testing";

  describe("Password Hashing", () => {
    it("should hash password correctly", async () => {
      const password = "password123";
      const hash = await bcrypt.hash(password, 10);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
    });

    it("should verify correct password", async () => {
      const password = "password123";
      const hash = await bcrypt.hash(password, 10);
      const match = await bcrypt.compare(password, hash);
      expect(match).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "password123";
      const hash = await bcrypt.hash(password, 10);
      const match = await bcrypt.compare("wrongpassword", hash);
      expect(match).toBe(false);
    });
  });

  describe("JWT Token", () => {
    it("should generate valid JWT token", () => {
      const payload = { userId: "test-id", email: "test@email.com", role: "ADMIN" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
      expect(token).toBeDefined();
      expect(token.split(".")).toHaveLength(3);
    });

    it("should decode JWT token correctly", () => {
      const payload = { userId: "test-id", email: "test@email.com", role: "GOVERNMENT" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      expect(decoded.userId).toBe("test-id");
      expect(decoded.email).toBe("test@email.com");
      expect(decoded.role).toBe("GOVERNMENT");
    });

    it("should reject invalid JWT token", () => {
      expect(() => {
        jwt.verify("invalid.token.here", JWT_SECRET);
      }).toThrow();
    });

    it("should reject expired JWT token", () => {
      const token = jwt.sign({ userId: "test" }, JWT_SECRET, { expiresIn: "0s" });
      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow();
    });

    it("should reject token with wrong secret", () => {
      const token = jwt.sign({ userId: "test" }, JWT_SECRET);
      expect(() => {
        jwt.verify(token, "wrong-secret");
      }).toThrow();
    });
  });
});
