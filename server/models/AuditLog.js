import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  requestId: { type: String, required: true, index: true },
  employeeName: { type: String, required: true, trim: true },
  employeeEmail: { type: String, trim: true, default: null },
  userMessage: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  source: { type: mongoose.Schema.Types.Mixed, default: null },
  decision: { type: String, enum: ["RESOLVE", "ASK", "ESCALATE"], required: true },
  timestamp: { type: Date, default: Date.now }
}, { versionKey: false });

export default mongoose.models.AuditLog || mongoose.model("AuditLog", auditLogSchema);