import { Router } from "express";
import { notificationController } from "./notification.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();
router.use(authenticate);

router.get("/", (req, res) => notificationController.findAll(req, res));
router.get("/unread-count", (req, res) => notificationController.getUnreadCount(req, res));
router.put("/read-all", (req, res) => notificationController.markAllAsRead(req, res));
router.put("/:id/read", (req, res) => notificationController.markAsRead(req, res));

export default router;
