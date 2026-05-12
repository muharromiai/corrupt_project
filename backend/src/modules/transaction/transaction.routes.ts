import { Router } from "express";
import { transactionController } from "./transaction.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validation.middleware";
import { logActivity } from "../../middleware/activity.middleware";
import { createTransactionSchema, verifyTransactionSchema } from "./transaction.validation";

const router = Router();
router.use(authenticate);

router.get("/stats", (req, res) => transactionController.getStats(req, res));
router.get("/", (req, res) => transactionController.findAll(req, res));
router.get("/:id", (req, res) => transactionController.findById(req, res));

router.post("/", authorize("OPERATOR", "ADMIN"), validate(createTransactionSchema), logActivity("CREATE", "Transaction"), (req, res) => transactionController.create(req, res));
router.put("/:id/verify", authorize("AUDITOR", "ADMIN"), validate(verifyTransactionSchema), logActivity("VERIFY", "Transaction"), (req, res) => transactionController.verify(req, res));

export default router;
