import { Router } from "express";
import { auditController } from "./audit.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";

const router = Router();
router.use(authenticate);

router.get("/stats", authorize("AUDITOR", "ADMIN"), (req, res) => auditController.getStats(req, res));
router.get("/", authorize("AUDITOR", "ADMIN"), (req, res) => auditController.findAll(req, res));
router.get("/blockchain/:transactionId", authorize("AUDITOR", "ADMIN"), (req, res) => auditController.getBlockchainData(req, res));
router.get("/:id", authorize("AUDITOR", "ADMIN"), (req, res) => auditController.findById(req, res));

export default router;
