import { Router, Request, Response } from "express";
import prisma from "../../config/database";
import { blockchainService } from "../../services/blockchain.service";

const router = Router();

router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [budgetStats, txStats, projectCount, reportCount] = await Promise.all([
      prisma.budget.aggregate({
        where: { status: "ACTIVE" },
        _sum: { totalAmount: true, allocatedAmount: true, remainingAmount: true },
        _count: true,
      }),
      prisma.transaction.groupBy({
        by: ["status"],
        _count: true,
        _sum: { amount: true },
      }),
      prisma.project.count(),
      prisma.report.count(),
    ]);

    const txMap: Record<string, { count: number; amount: number }> = {};
    for (const t of txStats) {
      txMap[t.status] = { count: t._count, amount: Number(t._sum.amount || 0) };
    }

    res.json({
      success: true,
      data: {
        budgets: {
          active: budgetStats._count,
          totalAmount: Number(budgetStats._sum.totalAmount || 0),
          allocatedAmount: Number(budgetStats._sum.allocatedAmount || 0),
          remainingAmount: Number(budgetStats._sum.remainingAmount || 0),
        },
        transactions: {
          total: Object.values(txMap).reduce((a, b) => a + b.count, 0),
          pending: txMap.PENDING?.count || 0,
          approved: txMap.APPROVED?.count || 0,
          rejected: txMap.REJECTED?.count || 0,
          totalApprovedAmount: txMap.APPROVED?.amount || 0,
        },
        projects: projectCount,
        reports: reportCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch transparency stats" });
  }
});

router.get("/budgets", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const [budgets, total] = await Promise.all([
      prisma.budget.findMany({
        where: { status: "ACTIVE" },
        select: {
          id: true, name: true, category: true, fiscalYear: true,
          totalAmount: true, allocatedAmount: true, remainingAmount: true,
          status: true, blockchainTxHash: true, createdAt: true,
          _count: { select: { projects: true, transactions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.budget.count({ where: { status: "ACTIVE" } }),
    ]);

    res.json({ success: true, data: budgets, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch budgets" });
  }
});

router.get("/transactions", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { status: "APPROVED" },
        select: {
          id: true, description: true, amount: true, category: true,
          recipientName: true, status: true, blockchainTxHash: true, createdAt: true,
          budget: { select: { name: true, category: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { status: "APPROVED" } }),
    ]);

    res.json({ success: true, data: transactions, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
});

router.get("/projects", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        select: {
          id: true, name: true, description: true, location: true,
          startDate: true, endDate: true, status: true, progress: true,
          contractorName: true, contractValue: true, createdAt: true,
          budget: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.project.count(),
    ]);

    res.json({ success: true, data: projects, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
});

router.get("/blockchain", async (_req: Request, res: Response) => {
  try {
    const stats = await blockchainService.getBlockchainStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.json({ success: true, data: { connected: false, blockNumber: 0, budgets: 0, transactions: 0, audits: 0 } });
  }
});

export default router;
