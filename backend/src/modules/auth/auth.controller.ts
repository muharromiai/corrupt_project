import { Request, Response } from "express";
import { authService } from "./auth.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess, sendError } from "../../utils/response";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, "Registrasi berhasil", 201);
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, "Login berhasil");
    } catch (error) {
      sendError(res, (error as Error).message, 401);
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }
      const user = await authService.getProfile(req.user.id);
      sendSuccess(res, user, "Profil berhasil diambil");
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }
      const user = await authService.updateProfile(req.user.id, req.body);
      sendSuccess(res, user, "Profil berhasil diperbarui");
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, "Unauthorized", 401);
        return;
      }
      const { oldPassword, newPassword } = req.body;
      await authService.changePassword(req.user.id, oldPassword, newPassword);
      sendSuccess(res, null, "Password berhasil diubah");
    } catch (error) {
      sendError(res, (error as Error).message, 400);
    }
  }
}

export const authController = new AuthController();
