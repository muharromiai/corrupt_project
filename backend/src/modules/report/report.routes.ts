import { Router } from "express";
import { reportController } from "./report.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validation.middleware";
import { logActivity } from "../../middleware/activity.middleware";
import { createReportSchema, updateReportSchema } from "./report.validation";

const router = Router();
router.use(authenticate);

router.get("/my", (req, res) => reportController.findMyReports(req, res));
router.get("/", authorize("ADMIN", "AUDITOR"), (req, res) => reportController.findAll(req, res));
router.get("/:id", (req, res) => reportController.findById(req, res));

router.post("/", authorize("PUBLIC"), validate(createReportSchema), logActivity("CREATE", "Report"), (req, res) => reportController.create(req, res));
router.put("/:id", authorize("ADMIN"), validate(updateReportSchema), logActivity("UPDATE", "Report"), (req, res) => reportController.update(req, res));

export default router;
