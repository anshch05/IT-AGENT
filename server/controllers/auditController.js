import AuditLog from "../models/AuditLog.js";

export async function listAuditLogs(_request, response) {
  try {
    const auditLogs = await AuditLog.find().sort({ timestamp: -1 }).lean();
    return response.json({ success: true, auditLogs });
  } catch (error) {
    console.error("Audit listing failed:", error);
    return response.status(500).json({ success: false, error: "Unable to retrieve audit logs" });
  }
}

export async function getAuditByRequestId(request, response) {
  try {
    const auditLogs = await AuditLog.find({ requestId: request.params.requestId }).sort({ timestamp: -1 }).lean();
    if (!auditLogs.length) return response.status(404).json({ success: false, error: "Audit record not found" });
    return response.json({ success: true, auditLogs });
  } catch (error) {
    console.error("Audit retrieval failed:", error);
    return response.status(500).json({ success: false, error: "Unable to retrieve audit record" });
  }
}