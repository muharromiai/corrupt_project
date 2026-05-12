import { Response } from "express";
import { budgetService } from "./budget.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess, sendPaginated, sendError } from "../../utils/response";

export class BudgetController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const budget = await budgetService.create(req.body, req.user!.id);
      sendSuccess(res, budget, "Anggaran berhasil dibuat", 201);
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, status, category, fiscalYear, search } = req.query;
      const result = await budgetService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string,
        category: category as string,
        fiscalYear: fiscalYear ? parseInt(fiscalYear as string) : undefined,
        search: search as string,
      });
      sendPaginated(res, result.budgets, result.total, result.page, result.limit, "Daftar anggaran");
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const budget = await budgetService.findById(req.params.id);
      sendSuccess(res, budget, "Detail anggaran");
    } catch (error) {
      sendError(res, (error as Error).message, 404);
    }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const budget = await budgetService.update(req.params.id, req.body);
      sendSuccess(res, budget, "Anggaran berhasil diperbarui");
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  }

  async getStats(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await budgetService.getStats();
      sendSuccess(res, stats, "Statistik anggaran");
    } catch (error) {
      sendError(res, (error as Error).message);
    }
  }
}

export const budgetController = new BudgetController();
