import dotenv from "dotenv";
dotenv.config({ path: ".env" });

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.PORT = "5001";
