import { Router } from "express";
import { getKnowledgeBase } from "../services/knowledgeService.js";

const router = Router();
router.get("/", (_request, response) => response.json({ success: true, knowledgeBase: getKnowledgeBase() }));

export default router;