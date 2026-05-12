import { Response } from "express";
import { auditService } from "./audit.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess, sendPaginated, sendError } from "../../utils/response";

export class AuditController {
  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, transactionId, auditorId } = req.query;
      const result = await auditService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        transactionId: transactionId as string, auditorId: auditorId as string,
      });
      sendPaginated(res, result.logs, result.total, result.page, result.limit);
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const log = await auditService.findById(req.params.id);
      sendSuccess(res, log);
    } catch (error) { sendError(res, (error as Error).message, 404); }
  }

  async getBlockchainData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = await auditService.getBlockchainData(req.params.transactionId);
      sendSuccess(res, data, "Data blockchain dan database");
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async getStats(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await auditService.getStats();
      sendSuccess(res, stats);
    } catch (error) { sendError(res, (error as Error).message); }
  }
}

export const auditController = new AuditController();
