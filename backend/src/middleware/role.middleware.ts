import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { AuthRequest } from "./auth.middleware";
import { sendError } from "../utils/response";

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Authentication required.", 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, "You do not have permission to access this resource.", 403);
      return;
    }

    next();
  };
}
