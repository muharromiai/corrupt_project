import { Router } from "express";
import { budgetController } from "./budget.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validation.middleware";
import { logActivity } from "../../middleware/activity.middleware";
import { createBudgetSchema, updateBudgetSchema } from "./budget.validation";

const router = Router();

router.use(authenticate);

router.get("/stats", (req, res) => budgetController.getStats(req, res));
router.get("/", (req, res) => budgetController.findAll(req, res));
router.get("/:id", (req, res) => budgetController.findById(req, res));

router.post(
  "/",
  authorize("GOVERNMENT", "ADMIN"),
  validate(createBudgetSchema),
  logActivity("CREATE", "Budget"),
  (req, res) => budgetController.create(req, res)
);

router.put(
  "/:id",
  authorize("GOVERNMENT", "ADMIN"),
  validate(updateBudgetSchema),
  logActivity("UPDATE", "Budget"),
  (req, res) => budgetController.update(req, res)
);

export default router;
