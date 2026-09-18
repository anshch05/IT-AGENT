import { useEffect, useState } from "react";
import { ChevronDown, Filter, RefreshCw, Search } from "lucide-react";
import { api } from "../api.js";
import PageHeader from "../components/PageHeader.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorState from "../components/ErrorState.jsx";

function TicketStatus({ ticket, onUpdate }) {
  const [open, setOpen] = useState(false);
  const options = ["Open", "In progress", "Escalated", "Resolved / closed"];
  return <div className="status-control"><button className="status-button" onClick={() => setOpen(!open)}>{ticket.status}<ChevronDown size={14} /></button>{open && <div className="status-menu">{options.map((status) => <button key={status} onClick={() => { setOpen(false); onUpdate(ticket.ticketId, status); }}>{status}</button>)}</div>}</div>;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]); const [query, setQuery] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  async function load() { setLoading(true); setError(""); try { setTickets((await api.tickets()).tickets); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  async function updateStatus(id, status) { try { const result = await api.updateTicketStatus(id, status); setTickets((current) => current.map((ticket) => ticket.ticketId === id ? result.ticket : ticket)); } catch (requestError) { setError(requestError.message); } }
  const filtered = tickets.filter((ticket) => `${ticket.ticketId} ${ticket.employeeName} ${ticket.issue} ${ticket.category}`.toLowerCase().includes(query.toLowerCase()));
  return <section><PageHeader eyebrow="Operations / queue" title="Ticket queue" description="Track employee requests and route work to the right team." action={<button className="secondary-button" onClick={load}><RefreshCw size={15} /> Refresh</button>} /><div className="stat-strip"><div><span>Total tickets</span><strong>{tickets.length}</strong></div><div><span>Open work</span><strong>{tickets.filter((ticket) => !ticket.status.toLowerCase().includes("closed") && !ticket.status.toLowerCase().includes("resolved")).length}</strong></div><div><span>Escalated</span><strong>{tickets.filter((ticket) => ticket.status.toLowerCase().includes("escalat")).length}</strong></div></div><div className="table-panel"><div className="table-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tickets..." /></div><span className="table-label"><Filter size={14} /> {filtered.length} records</span></div>{loading ? <LoadingState label="Loading ticket queue" /> : error ? <ErrorState message={error} onRetry={load} /> : <div className="table-wrap"><table><thead><tr><th>Ticket</th><th>Employee</th><th>Issue</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead><tbody>{filtered.map((ticket) => <tr key={ticket.ticketId}><td><strong className="ticket-id">{ticket.ticketId}</strong>{ticket.sourcePolicy?.length > 0 && <small className="table-source">{ticket.sourcePolicy.map((policy) => policy.id).join(" · ")}</small>}</td><td>{ticket.employeeName}<small>{ticket.employeeEmail || "Historical record"}</small></td><td className="issue-cell">{ticket.issue}</td><td><span className="category-tag">{ticket.category}</span></td><td><span className={`priority ${ticket.priority}`}>{ticket.priority}</span></td><td><TicketStatus ticket={ticket} onUpdate={updateStatus} /></td><td>{new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</td></tr>)}</tbody></table></div>}</div></section>;
}