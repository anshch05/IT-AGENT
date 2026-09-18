import { randomUUID } from "node:crypto";
import AuditLog from "../models/AuditLog.js";
import Ticket from "../models/Ticket.js";
import { processMessage } from "../services/agentService.js";

async function nextTicketId() {
  const latestTicket = await Ticket.findOne({ ticketId: /^TK-\d+$/ }).sort({ ticketId: -1 }).lean();
  const latestNumber = latestTicket ? Number(latestTicket.ticketId.replace("TK-", "")) : 1051;
  return `TK-${latestNumber + 1}`;
}

export async function chat(request, response) {
  const { message, employeeName = "Demo Employee", employeeEmail = null } = request.body || {};
  if (typeof message !== "string" || !message.trim()) {
    return response.status(400).json({ success: false, error: "message is required" });
  }

  try {
    const requestId = `REQ-${randomUUID().slice(0, 8).toUpperCase()}`;
    const agent = await processMessage(message.trim());
    let ticket = null;

    if (agent.requiresTicket) {
      const ticketId = await nextTicketId();
      ticket = await Ticket.create({
        ticketId,
        employeeName,
        employeeEmail,
        category: agent.intent,
        issue: message.trim(),
        priority: agent.decision === "ESCALATE" ? "high" : "medium",
        status: agent.decision === "ESCALATE" ? "Escalated" : "Open",
        sourcePolicy: agent.source,
        action: agent.decision === "ESCALATE" ? "Escalated for review" : "IT action required",
        escalationReason: agent.escalationReason
      });
    }

    const audit = await AuditLog.create({
      requestId,
      employeeName,
      employeeEmail,
      userMessage: message.trim(),
      action: ticket ? `${agent.decision} - ticket ${ticket.ticketId}` : `${agent.decision} - policy response`,
      details: { ticketId: ticket?.ticketId || null, followUpQuestion: agent.followUpQuestion },
      source: agent.source,
      decision: agent.decision
    });

    return response.status(200).json({
      success: true,
      requestId,
      agent,
      ticket,
      auditId: audit._id
    });
  } catch (error) {
    console.error("Chat processing failed:", error);
    return response.status(500).json({ success: false, error: "Unable to process the support request" });
  }
}