import { PrismaClient, Role, BudgetCategory, BudgetStatus, ProjectStatus, TransactionCategory, TransactionStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@corruption-killer.id" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@corruption-killer.id",
      password: passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const government = await prisma.user.upsert({
    where: { email: "pemerintah@corruption-killer.id" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "pemerintah@corruption-killer.id",
      password: passwordHash,
      role: Role.GOVERNMENT,
      isActive: true,
    },
  });

  const operator = await prisma.user.upsert({
    where: { email: "operator@corruption-killer.id" },
    update: {},
    create: {
      name: "Siti Rahayu",
      email: "operator@corruption-killer.id",
      password: passwordHash,
      role: Role.OPERATOR,
      isActive: true,
    },
  });

  const auditor = await prisma.user.upsert({
    where: { email: "auditor@corruption-killer.id" },
    update: {},
    create: {
      name: "Ahmad Wijaya",
      email: "auditor@corruption-killer.id",
      password: passwordHash,
      role: Role.AUDITOR,
      isActive: true,
    },
  });

  const publicUser = await prisma.user.upsert({
    where: { email: "masyarakat@corruption-killer.id" },
    update: {},
    create: {
      name: "Dewi Lestari",
      email: "masyarakat@corruption-killer.id",
      password: passwordHash,
      role: Role.PUBLIC,
      isActive: true,
    },
  });

  console.log("Users seeded:", { admin: admin.id, government: government.id, operator: operator.id, auditor: auditor.id, publicUser: publicUser.id });

  const budget1 = await prisma.budget.create({
    data: {
      createdById: government.id,
      name: "Anggaran Infrastruktur Jalan Nasional 2025",
      category: BudgetCategory.INFRASTRUCTURE,
      fiscalYear: 2025,
      totalAmount: 500000000000,
      allocatedAmount: 150000000000,
      remainingAmount: 350000000000,
      description: "Anggaran untuk pembangunan dan perbaikan jalan nasional di seluruh Indonesia tahun 2025",
      status: BudgetStatus.ACTIVE,
    },
  });

  const budget2 = await prisma.budget.create({
    data: {
      createdById: government.id,
      name: "Anggaran Pendidikan Digital 2025",
      category: BudgetCategory.EDUCATION,
      fiscalYear: 2025,
      totalAmount: 200000000000,
      allocatedAmount: 50000000000,
      remainingAmount: 150000000000,
      description: "Anggaran program digitalisasi pendidikan di seluruh daerah Indonesia",
      status: BudgetStatus.ACTIVE,
    },
  });

  const budget3 = await prisma.budget.create({
    data: {
      createdById: government.id,
      name: "Anggaran Kesehatan Masyarakat 2025",
      category: BudgetCategory.HEALTH,
      fiscalYear: 2025,
      totalAmount: 300000000000,
      allocatedAmount: 0,
      remainingAmount: 300000000000,
      description: "Anggaran untuk peningkatan fasilitas kesehatan dan program vaksinasi nasional",
      status: BudgetStatus.DRAFT,
    },
  });

  console.log("Budgets seeded:", { budget1: budget1.id, budget2: budget2.id, budget3: budget3.id });

  const project1 = await prisma.project.create({
    data: {
      budgetId: budget1.id,
      createdById: government.id,
      name: "Pembangunan Jalan Tol Trans-Sumatra Segmen 5",
      description: "Pembangunan jalan tol sepanjang 120km di Sumatra Selatan",
      location: "Sumatra Selatan",
      startDate: new Date("2025-03-01"),
      endDate: new Date("2026-12-31"),
      status: ProjectStatus.IN_PROGRESS,
      progress: 35,
      contractorName: "PT Hutama Karya",
      contractValue: 100000000000,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      budgetId: budget1.id,
      createdById: government.id,
      name: "Perbaikan Jalan Nasional Kalimantan Barat",
      description: "Perbaikan dan peningkatan kualitas jalan nasional di Kalimantan Barat sepanjang 80km",
      location: "Kalimantan Barat",
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-11-30"),
      status: ProjectStatus.IN_PROGRESS,
      progress: 60,
      contractorName: "PT Waskita Karya",
      contractValue: 50000000000,
    },
  });

  const project3 = await prisma.project.create({
    data: {
      budgetId: budget2.id,
      createdById: government.id,
      name: "Program Laptop untuk Sekolah Daerah Terpencil",
      description: "Distribusi 10.000 laptop ke sekolah di daerah 3T (Tertinggal, Terdepan, Terluar)",
      location: "Nasional (34 Provinsi)",
      startDate: new Date("2025-04-01"),
      endDate: new Date("2025-09-30"),
      status: ProjectStatus.PLANNING,
      progress: 10,
      contractorName: "PT Telkom Indonesia",
      contractValue: 50000000000,
    },
  });

  console.log("Projects seeded:", { project1: project1.id, project2: project2.id, project3: project3.id });

  const tx1 = await prisma.transaction.create({
    data: {
      budgetId: budget1.id,
      projectId: project1.id,
      createdById: operator.id,
      description: "Pembayaran tahap 1 - Pembebasan lahan Tol Trans-Sumatra",
      amount: 25000000000,
      category: TransactionCategory.DISBURSEMENT,
      recipientName: "PT Hutama Karya",
      recipientAccount: "BNI-1234567890",
      status: TransactionStatus.APPROVED,
    },
  });

  const tx2 = await prisma.transaction.create({
    data: {
      budgetId: budget1.id,
      projectId: project2.id,
      createdById: operator.id,
      description: "Pengadaan material aspal dan beton untuk Jalan Kalbar",
      amount: 15000000000,
      category: TransactionCategory.PROCUREMENT,
      recipientName: "PT Semen Indonesia",
      recipientAccount: "BRI-9876543210",
      status: TransactionStatus.APPROVED,
    },
  });

  const tx3 = await prisma.transaction.create({
    data: {
      budgetId: budget1.id,
      projectId: project1.id,
      createdById: operator.id,
      description: "Pembayaran gaji pekerja proyek bulan Maret 2025",
      amount: 5000000000,
      category: TransactionCategory.SALARY,
      recipientName: "Payroll PT Hutama Karya",
      recipientAccount: "MANDIRI-1122334455",
      status: TransactionStatus.PENDING,
    },
  });

  const tx4 = await prisma.transaction.create({
    data: {
      budgetId: budget2.id,
      projectId: project3.id,
      createdById: operator.id,
      description: "Pengadaan 5000 unit laptop batch pertama",
      amount: 25000000000,
      category: TransactionCategory.PROCUREMENT,
      recipientName: "PT Telkom Indonesia",
      recipientAccount: "BCA-5566778899",
      status: TransactionStatus.PENDING,
    },
  });

  console.log("Transactions seeded:", { tx1: tx1.id, tx2: tx2.id, tx3: tx3.id, tx4: tx4.id });

  await prisma.auditLog.create({
    data: {
      transactionId: tx1.id,
      auditorId: auditor.id,
      action: "APPROVED",
      status: "Transaksi sesuai dengan anggaran dan dokumen pendukung lengkap",
      notes: "Dokumen pembebasan lahan telah diverifikasi. Semua sertifikat tanah valid.",
    },
  });

  await prisma.auditLog.create({
    data: {
      transactionId: tx2.id,
      auditorId: auditor.id,
      action: "APPROVED",
      status: "Pengadaan material sesuai spesifikasi teknis",
      notes: "Harga material sesuai dengan HPS. Proses tender telah dilakukan secara terbuka.",
    },
  });

  console.log("Audit logs seeded");

  await prisma.report.create({
    data: {
      reporterId: publicUser.id,
      transactionId: tx1.id,
      budgetId: budget1.id,
      title: "Dugaan Mark-up Harga Pembebasan Lahan",
      description: "Harga pembebasan lahan di lokasi proyek Tol Trans-Sumatra diduga di atas harga pasar sebesar 30%. Berdasarkan data BPN, harga tanah di area tersebut berkisar Rp 500.000/m2 namun dibeli dengan harga Rp 750.000/m2.",
      status: "UNDER_REVIEW",
      adminNotes: "Laporan sedang ditindaklanjuti oleh tim investigasi",
    },
  });

  console.log("Reports seeded");

  const notifications = [
    { userId: auditor.id, title: "Transaksi Baru Perlu Verifikasi", message: "Transaksi pembayaran gaji pekerja proyek senilai Rp 5.000.000.000 menunggu verifikasi Anda.", type: "INFO" as const },
    { userId: auditor.id, title: "Transaksi Baru Perlu Verifikasi", message: "Transaksi pengadaan 5000 unit laptop senilai Rp 25.000.000.000 menunggu verifikasi Anda.", type: "WARNING" as const },
    { userId: government.id, title: "Transaksi Disetujui", message: "Transaksi pembayaran tahap 1 pembebasan lahan telah disetujui oleh auditor.", type: "SUCCESS" as const },
    { userId: publicUser.id, title: "Laporan Sedang Ditinjau", message: "Laporan Anda tentang dugaan mark-up harga pembebasan lahan sedang ditinjau oleh tim.", type: "INFO" as const },
  ];

  for (const n of notifications) {
    await prisma.notification.create({ data: n });
  }

  console.log("Notifications seeded");

  const activities = [
    { userId: government.id, action: "CREATE", entity: "Budget", entityId: budget1.id, details: { name: budget1.name } },
    { userId: government.id, action: "CREATE", entity: "Budget", entityId: budget2.id, details: { name: budget2.name } },
    { userId: government.id, action: "CREATE", entity: "Project", entityId: project1.id, details: { name: project1.name } },
    { userId: operator.id, action: "CREATE", entity: "Transaction", entityId: tx1.id, details: { amount: 25000000000 } },
    { userId: auditor.id, action: "APPROVE", entity: "Transaction", entityId: tx1.id, details: { status: "APPROVED" } },
    { userId: publicUser.id, action: "CREATE", entity: "Report", details: { title: "Dugaan Mark-up Harga Pembebasan Lahan" } },
  ];

  for (const a of activities) {
    await prisma.activityLog.create({ data: a });
  }

  console.log("Activity logs seeded");
  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
