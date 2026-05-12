import { Response } from "express";
import { reportService } from "./report.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess, sendPaginated, sendError } from "../../utils/response";

export class ReportController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const report = await reportService.create(req.body, req.user!.id);
      sendSuccess(res, report, "Laporan berhasil disubmit", 201);
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, status, search } = req.query;
      const result = await reportService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string, search: search as string,
      });
      sendPaginated(res, result.reports, result.total, result.page, result.limit);
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const report = await reportService.findById(req.params.id);
      sendSuccess(res, report);
    } catch (error) { sendError(res, (error as Error).message, 404); }
  }

  async findMyReports(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await reportService.findByUser(req.user!.id, {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      sendPaginated(res, result.reports, result.total, result.page, result.limit);
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const report = await reportService.update(req.params.id, req.body);
      sendSuccess(res, report, "Laporan berhasil diperbarui");
    } catch (error) { sendError(res, (error as Error).message); }
  }
}

export const reportController = new ReportController();
