import { Response } from "express";
import { projectService } from "./project.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess, sendPaginated, sendError } from "../../utils/response";

export class ProjectController {
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const project = await projectService.create(req.body, req.user!.id);
      sendSuccess(res, project, "Proyek berhasil dibuat", 201);
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async findAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, limit, status, budgetId, search } = req.query;
      const result = await projectService.findAll({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        status: status as string, budgetId: budgetId as string, search: search as string,
      });
      sendPaginated(res, result.projects, result.total, result.page, result.limit);
    } catch (error) { sendError(res, (error as Error).message); }
  }

  async findById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const project = await projectService.findById(req.params.id);
      sendSuccess(res, project);
    } catch (error) { sendError(res, (error as Error).message, 404); }
  }

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const project = await projectService.update(req.params.id, req.body);
      sendSuccess(res, project, "Proyek berhasil diperbarui");
    } catch (error) { sendError(res, (error as Error).message); }
  }
}

export const projectController = new ProjectController();
