import Ticket from "../models/Ticket.js";
import { initialTickets } from "../data/initialTickets.js";

export async function seedInitialTickets() {
  const ticketCount = await Ticket.countDocuments();
  if (ticketCount > 0) return;

  await Ticket.insertMany(initialTickets.map((ticket) => ({
    ...ticket,
    category: "historical",
    priority: "medium",
    sourcePolicy: null,
    action: "Supplied historical ticket"
  })));
  console.log(`Seeded ${initialTickets.length} supplied historical tickets.`);
}