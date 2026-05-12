import prisma from "../../config/database";
import { blockchainService } from "../../services/blockchain.service";
import { CreateBudgetInput, UpdateBudgetInput } from "./budget.validation";
import { Prisma } from "@prisma/client";

export class BudgetService {
  async create(data: CreateBudgetInput, userId: string) {
    const budget = await prisma.budget.create({
      data: {
        ...data,
        totalAmount: data.totalAmount,
        remainingAmount: data.totalAmount,
        allocatedAmount: 0,
        createdById: userId,
      },
      include: { createdBy: { select: { id: true, name: true, email: true, role: true } } },
    });

    try {
      const result = await blockchainService.createBudgetOnChain(
        budget.id, budget.name, budget.category, Number(budget.totalAmount), budget.fiscalYear
      );
      if (result) {
        await prisma.budget.update({ where: { id: budget.id }, data: { blockchainTxHash: result.txHash } });
        budget.blockchainTxHash = result.txHash;
      }
    } catch (err) {
      console.error("Blockchain recording failed, budget saved to DB only:", err);
    }

    return budget;
  }

  async findAll(query: { page?: number; limit?: number; status?: string; category?: string; fiscalYear?: number; search?: string }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.BudgetWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.category) where.category = query.category as any;
    if (query.fiscalYear) where.fiscalYear = query.fiscalYear;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          createdBy: { select: { id: true, name: true, role: true } },
          _count: { select: { projects: true, transactions: true } },
        },
      }),
      prisma.budget.count({ where }),
    ]);

    return { budgets, total, page, limit };
  }

  async findById(id: string) {
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        projects: { orderBy: { createdAt: "desc" }, take: 10 },
        transactions: { orderBy: { createdAt: "desc" }, take: 10, include: { createdBy: { select: { id: true, name: true } } } },
        _count: { select: { projects: true, transactions: true, reports: true } },
      },
    });
    if (!budget) throw new Error("Anggaran tidak ditemukan");
    return budget;
  }

  async update(id: string, data: UpdateBudgetInput) {
    const existing = await prisma.budget.findUnique({ where: { id } });
    if (!existing) throw new Error("Anggaran tidak ditemukan");

    const updateData: any = { ...data };
    if (data.totalAmount) {
      const allocated = Number(existing.allocatedAmount);
      if (data.totalAmount < allocated) throw new Error("Total anggaran tidak boleh kurang dari yang sudah dialokasikan");
      updateData.remainingAmount = data.totalAmount - allocated;
    }

    const budget = await prisma.budget.update({
      where: { id }, data: updateData,
      include: { createdBy: { select: { id: true, name: true, role: true } } },
    });

    if (data.name || data.totalAmount) {
      try {
        await blockchainService.updateBudgetOnChain(id, budget.name, Number(budget.totalAmount));
      } catch (err) {
        console.error("Blockchain update failed:", err);
      }
    }

    return budget;
  }

  async getStats() {
    const [totalBudgets, activeBudgets, stats] = await Promise.all([
      prisma.budget.count(),
      prisma.budget.count({ where: { status: "ACTIVE" } }),
      prisma.budget.aggregate({
        _sum: { totalAmount: true, allocatedAmount: true, remainingAmount: true },
        where: { status: "ACTIVE" },
      }),
    ]);

    return {
      totalBudgets,
      activeBudgets,
      totalAmount: Number(stats._sum.totalAmount || 0),
      allocatedAmount: Number(stats._sum.allocatedAmount || 0),
      remainingAmount: Number(stats._sum.remainingAmount || 0),
    };
  }
}

export const budgetService = new BudgetService();
