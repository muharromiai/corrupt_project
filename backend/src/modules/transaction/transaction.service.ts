import prisma from "../../config/database";
import { blockchainService } from "../../services/blockchain.service";
import { CreateTransactionInput } from "./transaction.validation";
import { Prisma } from "@prisma/client";

export class TransactionService {
  async create(data: CreateTransactionInput, userId: string) {
    const budget = await prisma.budget.findUnique({ where: { id: data.budgetId } });
    if (!budget) throw new Error("Anggaran tidak ditemukan");
    if (budget.status !== "ACTIVE") throw new Error("Anggaran belum aktif");

    if (data.projectId) {
      const project = await prisma.project.findUnique({ where: { id: data.projectId } });
      if (!project) throw new Error("Proyek tidak ditemukan");
      if (project.budgetId !== data.budgetId) throw new Error("Proyek tidak terkait dengan anggaran ini");
    }

    const transaction = await prisma.transaction.create({
      data: { ...data, createdById: userId, status: "PENDING" },
      include: {
        budget: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, role: true } },
      },
    });

    try {
      const result = await blockchainService.createTransactionOnChain(
        transaction.id, data.budgetId, data.description, data.amount, data.recipientName
      );
      if (result) {
        await prisma.transaction.update({
          where: { id: transaction.id },
          data: { blockchainTxHash: result.txHash, blockchainBlockNumber: result.blockNumber },
        });
        transaction.blockchainTxHash = result.txHash;
        transaction.blockchainBlockNumber = result.blockNumber;
      }
    } catch (err) {
      console.error("Blockchain recording failed:", err);
    }

    const auditors = await prisma.user.findMany({ where: { role: "AUDITOR", isActive: true }, select: { id: true } });
    if (auditors.length > 0) {
      await prisma.notification.createMany({
        data: auditors.map((a) => ({
          userId: a.id,
          title: "Transaksi Baru Perlu Verifikasi",
          message: `Transaksi "${data.description}" senilai Rp ${data.amount.toLocaleString("id-ID")} menunggu verifikasi.`,
          type: "INFO" as const,
        })),
      });
    }

    return transaction;
  }

  async findAll(query: { page?: number; limit?: number; status?: string; budgetId?: string; category?: string; search?: string }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.budgetId) where.budgetId = query.budgetId;
    if (query.category) where.category = query.category as any;
    if (query.search) {
      where.OR = [
        { description: { contains: query.search, mode: "insensitive" } },
        { recipientName: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          budget: { select: { id: true, name: true } },
          project: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, role: true } },
          _count: { select: { auditLogs: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return { transactions, total, page, limit };
  }

  async findById(id: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        budget: true,
        project: true,
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        auditLogs: { orderBy: { createdAt: "desc" }, include: { auditor: { select: { id: true, name: true, role: true } } } },
      },
    });
    if (!transaction) throw new Error("Transaksi tidak ditemukan");
    return transaction;
  }

  async verify(id: string, action: "APPROVED" | "REJECTED", notes: string, auditorId: string) {
    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) throw new Error("Transaksi tidak ditemukan");
    if (transaction.status !== "PENDING") throw new Error("Transaksi sudah diverifikasi");

    const auditLog = await prisma.auditLog.create({
      data: {
        transactionId: id,
        auditorId,
        action,
        status: action === "APPROVED" ? "Transaksi disetujui" : "Transaksi ditolak",
        notes,
      },
    });

    const updated = await prisma.transaction.update({
      where: { id },
      data: { status: action },
      include: {
        budget: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    try {
      const auditAction = action === "APPROVED" ? 0 : 1;
      const auditResult = await blockchainService.recordAuditOnChain(auditLog.id, id, auditAction, notes);
      if (auditResult) {
        await prisma.auditLog.update({ where: { id: auditLog.id }, data: { blockchainTxHash: auditResult.txHash } });
      }

      if (action === "APPROVED") {
        await blockchainService.approveTransactionOnChain(id);
      } else {
        await blockchainService.rejectTransactionOnChain(id);
      }
    } catch (err) {
      console.error("Blockchain verification failed:", err);
    }

    await prisma.notification.create({
      data: {
        userId: transaction.createdById,
        title: action === "APPROVED" ? "Transaksi Disetujui" : "Transaksi Ditolak",
        message: `Transaksi "${transaction.description}" telah ${action === "APPROVED" ? "disetujui" : "ditolak"} oleh auditor.`,
        type: action === "APPROVED" ? "SUCCESS" : "ERROR",
      },
    });

    return updated;
  }

  async getStats() {
    const [total, pending, approved, rejected, sumApproved] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: "PENDING" } }),
      prisma.transaction.count({ where: { status: "APPROVED" } }),
      prisma.transaction.count({ where: { status: "REJECTED" } }),
      prisma.transaction.aggregate({ _sum: { amount: true }, where: { status: "APPROVED" } }),
    ]);

    return { total, pending, approved, rejected, totalApprovedAmount: Number(sumApproved._sum.amount || 0) };
  }
}

export const transactionService = new TransactionService();
