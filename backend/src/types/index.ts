import { Role } from "@prisma/client";

export interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: JwtPayload;
}
