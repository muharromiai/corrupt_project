import { Response } from "express";
import { transactionService } from "./transaction.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess, sendPaginated, sendError } from "../../utils/response";

export class TransactionController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tx = await transactionService.create(req.body, req.user!.id);
      sendSuccess(res, tx, "Transaksi berhasil dibuat", 201);
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, status, budgetId, category, search } = req.query;
      const result = await transactionService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string, budgetId: budgetId as string,
        category: category as string, search: search as string,
      });
      sendPaginated(res, result.transactions, result.total, result.page, result.limit);
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tx = await transactionService.findById(req.params.id);
      sendSuccess(res, tx);
    } catch (error) { sendError(res, (error as Error).message, 404); }
  }

  async verify(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { action, notes } = req.body;
      const tx = await transactionService.verify(req.params.id, action, notes, req.user!.id);
      sendSuccess(res, tx, `Transaksi berhasil ${action === "APPROVED" ? "disetujui" : "ditolak"}`);
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async getStats(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await transactionService.getStats();
      sendSuccess(res, stats);
    } catch (error) { sendError(res, (error as Error).message); }
  }
}

export const transactionController = new TransactionController();
