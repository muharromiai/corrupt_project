import prisma from "../../config/database";
import { Prisma } from "@prisma/client";
import { blockchainService } from "../../services/blockchain.service";

export class AuditService {
  async findAll(query: { page?: number; limit?: number; transactionId?: string; auditorId?: string }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};
    if (query.transactionId) where.transactionId = query.transactionId;
    if (query.auditorId) where.auditorId = query.auditorId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          transaction: { select: { id: true, description: true, amount: true, status: true, recipientName: true } },
          auditor: { select: { id: true, name: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  }

  async findById(id: string) {
    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        transaction: { include: { budget: true, project: true, createdBy: { select: { id: true, name: true } } } },
        auditor: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    if (!log) throw new Error("Audit log tidak ditemukan");
    return log;
  }

  async getBlockchainData(transactionId: string) {
    const [dbData, chainData] = await Promise.all([
      prisma.transaction.findUnique({
        where: { id: transactionId },
        include: { auditLogs: { include: { auditor: { select: { id: true, name: true } } } } },
      }),
      blockchainService.getTransactionFromChain(transactionId),
    ]);

    return { database: dbData, blockchain: chainData };
  }

  async getStats() {
    const [dbStats, chainStats] = await Promise.all([
      prisma.auditLog.groupBy({ by: ["action"], _count: true }),
      blockchainService.getAuditSummaryFromChain(),
    ]);

    return { database: dbStats, blockchain: chainStats };
  }
}

export const auditService = new AuditService();
