import { Response } from "express";
import { userService } from "./user.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess, sendPaginated, sendError } from "../../utils/response";

export class UserController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, role, search, isActive } = req.query;
      const result = await userService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        role: role as string, search: search as string, isActive: isActive as string,
      });
      sendPaginated(res, result.users, result.total, result.page, result.limit);
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await userService.findById(req.params.id);
      sendSuccess(res, user);
    } catch (error) { sendError(res, (error as Error).message, 404); }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await userService.update(req.params.id, req.body);
      sendSuccess(res, user, "User berhasil diperbarui");
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async resetPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      await userService.resetPassword(req.params.id, req.body.newPassword);
      sendSuccess(res, null, "Password berhasil direset");
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await userService.delete(req.params.id);
      sendSuccess(res, null, "User berhasil dinonaktifkan");
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async getActivityLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, userId, entity, action } = req.query;
      const result = await userService.getActivityLogs({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        userId: userId as string, entity: entity as string, action: action as string,
      });
      sendPaginated(res, result.logs, result.total, result.page, result.limit);
    } catch (error) { sendError(res, (error as Error).message); }
  }
}

export const userController = new UserController();
