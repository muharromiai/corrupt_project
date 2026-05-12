import prisma from "../../config/database";
import { CreateProjectInput, UpdateProjectInput } from "./project.validation";
import { Prisma } from "@prisma/client";

export class ProjectService {
  async create(data: CreateProjectInput, userId: string) {
    const budget = await prisma.budget.findUnique({ where: { id: data.budgetId } });
    if (!budget) throw new Error("Anggaran tidak ditemukan");
    if (budget.status !== "ACTIVE") throw new Error("Anggaran belum aktif");

    const remaining = Number(budget.remainingAmount);
    if (data.contractValue > remaining) throw new Error(`Nilai kontrak melebihi sisa anggaran (Rp ${remaining.toLocaleString("id-ID")})`);

    const project = await prisma.project.create({
      data: { ...data, startDate: new Date(data.startDate), endDate: new Date(data.endDate), createdById: userId },
      include: { budget: { select: { id: true, name: true } }, createdBy: { select: { id: true, name: true } } },
    });

    await prisma.budget.update({
      where: { id: data.budgetId },
      data: {
        allocatedAmount: { increment: data.contractValue },
        remainingAmount: { decrement: data.contractValue },
      },
    });

    return project;
  }

  async findAll(query: { page?: number; limit?: number; status?: string; budgetId?: string; search?: string }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.budgetId) where.budgetId = query.budgetId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { location: { contains: query.search, mode: "insensitive" } },
        { contractorName: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          budget: { select: { id: true, name: true, category: true } },
          createdBy: { select: { id: true, name: true } },
          _count: { select: { transactions: true } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, total, page, limit };
  }

  async findById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        budget: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        transactions: { orderBy: { createdAt: "desc" }, include: { createdBy: { select: { id: true, name: true } } } },
        _count: { select: { transactions: true } },
      },
    });
    if (!project) throw new Error("Proyek tidak ditemukan");
    return project;
  }

  async update(id: string, data: UpdateProjectInput) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) throw new Error("Proyek tidak ditemukan");

    return prisma.project.update({
      where: { id }, data,
      include: { budget: { select: { id: true, name: true } }, createdBy: { select: { id: true, name: true } } },
    });
  }
}

export const projectService = new ProjectService();
