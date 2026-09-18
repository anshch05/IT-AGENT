import Ticket from "../models/Ticket.js";

async function nextTicketId() {
  const latestTicket = await Ticket.findOne({ ticketId: /^TK-\d+$/ }).sort({ ticketId: -1 }).lean();
  const latestNumber = latestTicket ? Number(latestTicket.ticketId.replace("TK-", "")) : 1051;
  return `TK-${latestNumber + 1}`;
}

export async function listTickets(_request, response) {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 }).lean();
    return response.json({ success: true, tickets });
  } catch (error) {
    console.error("Ticket listing failed:", error);
    return response.status(500).json({ success: false, error: "Unable to retrieve tickets" });
  }
}

export async function getTicket(request, response) {
  try {
    const ticket = await Ticket.findOne({ ticketId: request.params.id }).lean();
    if (!ticket) return response.status(404).json({ success: false, error: "Ticket not found" });
    return response.json({ success: true, ticket });
  } catch (error) {
    console.error("Ticket retrieval failed:", error);
    return response.status(500).json({ success: false, error: "Unable to retrieve ticket" });
  }
}

export async function createTicket(request, response) {
  const { employeeName, employeeEmail, category, issue, priority = "medium", status = "Open", sourcePolicy = null, action = null, escalationReason = null } = request.body || {};
  if (!employeeName || !category || !issue) return response.status(400).json({ success: false, error: "employeeName, category, and issue are required" });

  try {
    const ticket = await Ticket.create({ ticketId: await nextTicketId(), employeeName, employeeEmail, category, issue, priority, status, sourcePolicy, action, escalationReason });
    return response.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error("Ticket creation failed:", error);
    return response.status(500).json({ success: false, error: "Unable to create ticket" });
  }
}

export async function updateTicketStatus(request, response) {
  const { status } = request.body || {};
  if (typeof status !== "string" || !status.trim()) return response.status(400).json({ success: false, error: "status is required" });

  try {
    const ticket = await Ticket.findOneAndUpdate({ ticketId: request.params.id }, { status: status.trim(), updatedAt: new Date() }, { returnDocument: "after", runValidators: true }).lean();
    if (!ticket) return response.status(404).json({ success: false, error: "Ticket not found" });
    return response.json({ success: true, ticket });
  } catch (error) {
    console.error("Ticket status update failed:", error);
    return response.status(500).json({ success: false, error: "Unable to update ticket status" });
  }
}