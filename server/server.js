import "dotenv/config";
import cors from "cors";
import express from "express";
import { connectDatabase } from "./config/db.js";
import { seedInitialTickets } from "./config/seed.js";
import auditRoutes from "./routes/auditRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import knowledgeRoutes from "./routes/knowledgeRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/chat", chatRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/knowledge", knowledgeRoutes);

app.get("/api/health", (_request, response) => {
  response.json({
    success: true,
    service: "veridian-it-agent",
    database: "MongoDB connection is managed at startup"
  });
});

app.use((error, _request, response, _next) => {
  console.error("Unhandled server error:", error);
  response.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

const databaseConnected = await connectDatabase();
if (databaseConnected) await seedInitialTickets();

app.listen(port, () => {
  console.log(`Veridian IT agent server listening on port ${port}.`);
});