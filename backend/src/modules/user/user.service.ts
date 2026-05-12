import prisma from "../../config/database";
import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcrypt";

export class UserService {
  async findAll(query: { page?: number; limit?: number; role?: string; search?: string; isActive?: string }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 10, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role as Role;
    if (query.isActive !== undefined) where.isActive = query.isActive === "true";
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, limit };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true,
        _count: { select: { budgets: true, projects: true, transactions: true, reports: true, auditLogs: true } },
      },
    });
    if (!user) throw new Error("User tidak ditemukan");
    return user;
  }

  async update(id: string, data: { name?: string; email?: string; role?: Role; isActive?: boolean }) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) throw new Error("User tidak ditemukan");

    if (data.email && data.email !== existing.email) {
      const dup = await prisma.user.findUnique({ where: { email: data.email } });
      if (dup) throw new Error("Email sudah digunakan");
    }

    return prisma.user.update({
      where: { id }, data,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
  }

  async resetPassword(id: string, newPassword: string) {
    const hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id }, data: { password: hash } });
  }

  async delete(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("User tidak ditemukan");
    if (user.role === "ADMIN") throw new Error("Tidak dapat menghapus admin");
    await prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  async getActivityLogs(query: { page?: number; limit?: number; userId?: string; entity?: string; action?: string }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityLogWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where, skip, take: limit, orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true, role: true } } },
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { logs, total, page, limit };
  }
}

export const userService = new UserService();
