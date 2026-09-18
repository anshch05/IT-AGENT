import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, trim: true },
  employeeName: { type: String, required: true, trim: true },
  employeeEmail: { type: String, trim: true, default: null },
  category: { type: String, required: true, trim: true },
  issue: { type: String, required: true, trim: true },
  priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
  status: { type: String, required: true, default: "Open", trim: true },
  sourcePolicy: { type: mongoose.Schema.Types.Mixed, default: null },
  action: { type: String, default: null },
  escalationReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: false, versionKey: false });

export default mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);