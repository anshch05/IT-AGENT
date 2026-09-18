import { useRef, useState } from "react";
import { ArrowUp, Bot, CheckCircle2, CircleHelp, FileText, RotateCcw, ShieldAlert, Sparkles, UserRound } from "lucide-react";
import { api } from "../api.js";
import DecisionBadge from "../components/DecisionBadge.jsx";

const suggestions = ["I clicked a phishing email", "I need VPN access", "My laptop is dead and it is 3.5 years old"];

function SourceList({ source = [] }) {
  if (!source.length) return <span className="muted">No policy source matched</span>;
  return <div className="source-list">{source.map((policy) => <span className="source-chip" key={policy.id}><FileText size={13} />{policy.id} · {policy.title}</span>)}</div>;
}

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const conversationVersion = useRef(0);

  function startNewRequest() {
    conversationVersion.current += 1;
    setMessages([]);
    setMessage("");
    setError("");
    setLoading(false);
  }

  async function submitMessage(event) {
    event?.preventDefault();
    if (!message.trim() || loading) return;
    const userMessage = message.trim();
    const requestVersion = conversationVersion.current;
    setMessages((current) => [...current, { type: "user", text: userMessage }]);
    setMessage(""); setLoading(true); setError("");
    try {
      const result = await api.chat({ message: userMessage, employeeName: "Demo Employee", employeeEmail: "demo.employee@veridian-corp.example" });
      if (conversationVersion.current === requestVersion) setMessages((current) => [...current, { type: "agent", ...result }]);
    } catch (requestError) { if (conversationVersion.current === requestVersion) setError(requestError.message); }
    finally { setLoading(false); }
  }

  return <section className="chat-page">
    <div className="page-header chat-header"><div><div className="eyebrow">AI support desk / live</div><h1>How can we help today?</h1><p>Ask about an IT issue and Veridian's policy-grounded agent will find the right next step.</p></div><div className="chat-header-actions"><button className="secondary-button" onClick={startNewRequest}><RotateCcw size={15} /> New Request</button><div className="agent-status"><span className="status-dot" /><div><strong>Agent ready</strong><small>Grounded in 11 approved policies</small></div></div></div></div>
    <div className="chat-layout">
      <div className="chat-panel">
        <div className="conversation-bar"><span><span className="live-dot" /> Conversation</span><small>Policy-aware assistance</small></div>
        <div className="conversation">
          {!messages.length && <div className="empty-conversation"><div className="empty-icon"><Sparkles size={25} /></div><h2>Start with an IT question</h2><p>The agent can resolve routine requests, ask for missing context, or route sensitive issues to the right team.</p><div className="suggestion-row">{suggestions.map((item) => <button key={item} onClick={() => setMessage(item)}>{item}</button>)}</div></div>}
          {messages.map((item, index) => item.type === "user" ? <div className="message-row user-row" key={index}><div className="message-bubble user-bubble">{item.text}</div><div className="message-avatar user-avatar"><UserRound size={16} /></div></div> : <div className="agent-response" key={index}><div className="message-row"><div className="message-avatar bot-avatar"><Bot size={17} /></div><div className="message-bubble agent-bubble"><div className="response-meta"><span>Veridian agent</span><DecisionBadge decision={item.agent.decision} /></div><p>{item.agent.response}</p>{item.agent.followUpQuestion && <div className="follow-up"><CircleHelp size={16} /><strong>{item.agent.followUpQuestion}</strong></div>}</div></div><div className="response-details"><div><small>Source policy</small><SourceList source={item.agent.source} /></div>{item.ticket && <div className="ticket-callout"><CheckCircle2 size={17} /><div><small>Ticket created</small><strong>{item.ticket.ticketId} · {item.ticket.status}</strong></div></div>}<small className="request-id">Request {item.requestId}</small></div></div>)}
          {loading && <div className="message-row"><div className="message-avatar bot-avatar"><Bot size={17} /></div><div className="typing"><span /><span /><span /></div></div>}
        </div>
        {error && <div className="inline-error"><ShieldAlert size={16} />{error}</div>}
        <form className="composer" onSubmit={submitMessage}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Describe your IT issue..." aria-label="Describe your IT issue" /><button className="send-button" type="submit" disabled={!message.trim() || loading} aria-label="Send message"><ArrowUp size={19} /></button></form>
        <div className="composer-note"><ShieldAlert size={13} /> Responses are grounded in Veridian Corp policy data</div>
      </div>
      <aside className="chat-aside"><div className="aside-kicker">Agent behavior</div><h3>Clear answers, careful routing.</h3><p>Every response is tied to a source policy. When the policy is unclear, the agent asks or escalates rather than guessing.</p><div className="behavior-list"><div><CheckCircle2 size={17} /><span><strong>Resolve</strong><small>Policy clearly answers the request</small></span></div><div><CircleHelp size={17} /><span><strong>Ask</strong><small>Important context is missing</small></span></div><div><ShieldAlert size={17} /><span><strong>Escalate</strong><small>Security, Finance, or risk involved</small></span></div></div><div className="demo-tip"><Sparkles size={16} /><span><strong>Demo tip</strong><small>Try “I clicked a phishing email” to see a security escalation with an audit trail.</small></span></div></aside>
    </div>
  </section>;
}