import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validation.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { registerSchema, loginSchema } from "./auth.validation";
import { z } from "zod";

const router = Router();

router.post("/register", validate(registerSchema), (req, res) => authController.register(req, res));

router.post("/login", validate(loginSchema), (req, res) => authController.login(req, res));

router.get("/profile", authenticate, (req, res) => authController.getProfile(req, res));

router.put(
  "/profile",
  authenticate,
  validate(
    z.object({
      name: z.string().min(3).max(100).optional(),
      email: z.string().email().optional(),
    })
  ),
  (req, res) => authController.updateProfile(req, res)
);

router.put(
  "/change-password",
  authenticate,
  validate(
    z.object({
      oldPassword: z.string().min(1, "Password lama wajib diisi"),
      newPassword: z
        .string()
        .min(8, "Password baru minimal 8 karakter")
        .regex(/[A-Z]/, "Password harus mengandung huruf besar")
        .regex(/[0-9]/, "Password harus mengandung angka"),
    })
  ),
  (req, res) => authController.changePassword(req, res)
);

export default router;
