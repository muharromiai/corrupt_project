import { Router } from "express";
import { projectController } from "./project.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validation.middleware";
import { logActivity } from "../../middleware/activity.middleware";
import { createProjectSchema, updateProjectSchema } from "./project.validation";

const router = Router();
router.use(authenticate);

router.get("/", (req, res) => projectController.findAll(req, res));
router.get("/:id", (req, res) => projectController.findById(req, res));

router.post("/", authorize("GOVERNMENT", "ADMIN"), validate(createProjectSchema), logActivity("CREATE", "Project"), (req, res) => projectController.create(req, res));
router.put("/:id", authorize("GOVERNMENT", "ADMIN"), validate(updateProjectSchema), logActivity("UPDATE", "Project"), (req, res) => projectController.update(req, res));

export default router;
