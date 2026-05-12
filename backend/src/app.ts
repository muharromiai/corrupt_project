import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/user.routes";
import budgetRoutes from "./modules/budget/budget.routes";
import projectRoutes from "./modules/project/project.routes";
import transactionRoutes from "./modules/transaction/transaction.routes";
import auditRoutes from "./modules/audit/audit.routes";
import reportRoutes from "./modules/report/report.routes";
import notificationRoutes from "./modules/notification/notification.routes";
import transparencyRoutes from "./modules/transparency/transparency.routes";
import { isBlockchainConnected } from "./config/blockchain";
import prisma from "./config/database";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

app.get("/api/health", async (_req, res) => {
  const blockchain = await isBlockchainConnected();
  let database = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    database = true;
  } catch {
    database = false;
  }

  res.json({
    success: true,
    message: "Corruption Killer API is running",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: { database, blockchain },
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/transparency", transparencyRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   Corruption Killer API Server               ║
  ║   Running on http://localhost:${env.PORT}    ║
  ║   Environment: ${env.NODE_ENV}               ║
  ╚══════════════════════════════════════════════╝
  `);
});

export default app;
