import { Router } from "express";
import { getAuditByRequestId, listAuditLogs } from "../controllers/auditController.js";

const router = Router();
router.get("/", listAuditLogs);
router.get("/:requestId", getAuditByRequestId);

export default router;