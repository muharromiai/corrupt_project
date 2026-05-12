import prisma from "../../config/database";
import { CreateReportInput, UpdateReportInput } from "./report.validation";
import { Prisma } from "@prisma/client";

export class ReportService {
  async create(data: CreateReportInput, userId: string) {
    const report = await prisma.report.create({
      data: { ...data, reporterId: userId },
      include: {
        reporter: { select: { id: true, name: true } },
        transaction: { select: { id: true, description: true, amount: true } },
        budget: { select: { id: true, name: true } },
      },
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN", isActive: true }, select: { id: true } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map((a) => ({
          userId: a.id,
          title: "Laporan Penyimpangan Baru",
          message: `Laporan baru: "${data.title}" telah disubmit oleh masyarakat.`,
          type: "WARNING" as const,
        })),
      });
    }

    return report;
  }

  async findAll(query: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {};
    if (query.status) where.status = query.status as any;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: {
          reporter: { select: { id: true, name: true } },
          transaction: { select: { id: true, description: true } },
          budget: { select: { id: true, name: true } },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, total, page, limit };
  }

  async findById(id: string) {
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        transaction: { include: { budget: true, auditLogs: true } },
        budget: true,
      },
    });
    if (!report) throw new Error("Laporan tidak ditemukan");
    return report;
  }

  async findByUser(userId: string, query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { reporterId: userId }, skip, take: limit, orderBy: { createdAt: "desc" },
        include: { transaction: { select: { id: true, description: true } }, budget: { select: { id: true, name: true } } },
      }),
      prisma.report.count({ where: { reporterId: userId } }),
    ]);

    return { reports, total, page, limit };
  }

  async update(id: string, data: UpdateReportInput) {
    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) throw new Error("Laporan tidak ditemukan");

    const report = await prisma.report.update({
      where: { id }, data,
      include: { reporter: { select: { id: true, name: true } } },
    });

    if (data.status) {
      await prisma.notification.create({
        data: {
          userId: existing.reporterId,
          title: "Status Laporan Diperbarui",
          message: `Laporan "${existing.title}" statusnya diperbarui menjadi ${data.status}.`,
          type: "INFO",
        },
      });
    }

    return report;
  }
}

export const reportService = new ReportService();
