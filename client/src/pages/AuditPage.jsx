import { useEffect, useState } from "react";
import { Activity, CheckCircle2, Search, ShieldAlert } from "lucide-react";
import { api } from "../api.js";
import PageHeader from "../components/PageHeader.jsx";
import DecisionBadge from "../components/DecisionBadge.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorState from "../components/ErrorState.jsx";

export default function AuditPage() {
  const [logs, setLogs] = useState([]); const [query, setQuery] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  async function load() { setLoading(true); try { setLogs((await api.audit()).auditLogs); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const filtered = logs.filter((log) => `${log.requestId} ${log.employeeName} ${log.userMessage} ${log.decision}`.toLowerCase().includes(query.toLowerCase()));
  return <section><PageHeader eyebrow="Governance / traceability" title="Audit trail" description="A record of every agent decision, source policy, and action taken." action={<div className="audit-health"><Activity size={15} /> Logging active</div>} /><div className="audit-summary"><div><CheckCircle2 size={19} /><span><strong>{logs.length}</strong><small>decisions recorded</small></span></div><div><ShieldAlert size={19} /><span><strong>{logs.filter((log) => log.decision === "ESCALATE").length}</strong><small>escalations</small></span></div><div><Activity size={19} /><span><strong>{logs.filter((log) => log.decision === "ASK").length}</strong><small>clarifications</small></span></div></div><div className="table-panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search audit records..." /></div></div>{loading ? <LoadingState label="Loading audit trail" /> : error ? <ErrorState message={error} onRetry={load} /> : <div className="table-wrap"><table><thead><tr><th>Request</th><th>Employee</th><th>Message</th><th>Decision</th><th>Source</th><th>Action</th><th>Timestamp</th></tr></thead><tbody>{filtered.map((log) => <tr key={log._id}><td><strong className="ticket-id">{log.requestId}</strong></td><td>{log.employeeName}<small>{log.employeeEmail}</small></td><td className="issue-cell">{log.userMessage}</td><td><DecisionBadge decision={log.decision} /></td><td><div className="audit-source">{(log.source || []).map((policy) => <span key={policy.id}>{policy.id}</span>)}</div></td><td>{log.action}</td><td>{new Date(log.timestamp).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td></tr>)}</tbody></table></div>}</div></section>;
}