import { Response, NextFunction } from "express";
import prisma from "../config/database";
import { AuthRequest } from "./auth.middleware";

export function logActivity(action: string, entity: string) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (req.user) {
      try {
        await prisma.activityLog.create({
          data: {
            userId: req.user.id,
            action,
            entity,
            entityId: req.params.id || undefined,
            details: req.method === "GET" ? undefined : req.body,
            ipAddress: req.ip || req.socket.remoteAddress,
          },
        });
      } catch (err) {
        console.error("Failed to log activity:", err);
      }
    }
    next();
  };
}
