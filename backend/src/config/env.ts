import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: parseInt(process.env.BACKEND_PORT || "5000", 10),
  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "fallback-secret-key",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
  BUDGET_MANAGER_ADDRESS: process.env.BUDGET_MANAGER_ADDRESS || "",
  TRANSACTION_MANAGER_ADDRESS: process.env.TRANSACTION_MANAGER_ADDRESS || "",
  AUDIT_TRAIL_ADDRESS: process.env.AUDIT_TRAIL_ADDRESS || "",
  DEPLOYER_PRIVATE_KEY: process.env.DEPLOYER_PRIVATE_KEY || "",
  BLOCKCHAIN_RPC_URL: process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545",
} as const;
