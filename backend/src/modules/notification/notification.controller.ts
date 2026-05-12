import { Response } from "express";
import { notificationService } from "./notification.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess, sendPaginated, sendError } from "../../utils/response";

export class NotificationController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, unreadOnly } = req.query;
      const result = await notificationService.findByUser(req.user!.id, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        unreadOnly: unreadOnly === "true",
      });
      sendSuccess(res, { ...result });
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      await notificationService.markAsRead(req.params.id, req.user!.id);
      sendSuccess(res, null, "Notifikasi ditandai sudah dibaca");
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      await notificationService.markAllAsRead(req.user!.id);
      sendSuccess(res, null, "Semua notifikasi ditandai sudah dibaca");
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const count = await notificationService.getUnreadCount(req.user!.id);
      sendSuccess(res, { count });
    } catch (error) { sendError(res, (error as Error).message); }
  }
}

export const notificationController = new NotificationController();
