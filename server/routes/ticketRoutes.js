import { Router } from "express";
import { createTicket, getTicket, listTickets, updateTicketStatus } from "../controllers/ticketController.js";

const router = Router();
router.get("/", listTickets);
router.get("/:id", getTicket);
router.post("/", createTicket);
router.patch("/:id/status", updateTicketStatus);

export default router;