import { Router } from "express";
import { userController } from "./user.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validation.middleware";
import { logActivity } from "../../middleware/activity.middleware";
import { z } from "zod";

const router = Router();
router.use(authenticate);
router.use(authorize("ADMIN"));

router.get("/", (req, res) => userController.findAll(req, res));
router.get("/activity-logs", (req, res) => userController.getActivityLogs(req, res));
router.get("/:id", (req, res) => userController.findById(req, res));

router.put(
  "/:id",
  validate(z.object({
    name: z.string().min(3).max(100).optional(),
    email: z.string().email().optional(),
    role: z.enum(["ADMIN", "GOVERNMENT", "OPERATOR", "AUDITOR", "PUBLIC"]).optional(),
    isActive: z.boolean().optional(),
  })),
  logActivity("UPDATE", "User"),
  (req, res) => userController.update(req, res)
);

router.put(
  "/:id/reset-password",
  validate(z.object({ newPassword: z.string().min(8) })),
  logActivity("RESET_PASSWORD", "User"),
  (req, res) => userController.resetPassword(req, res)
);

router.delete("/:id", logActivity("DELETE", "User"), (req, res) => userController.delete(req, res));

export default router;
