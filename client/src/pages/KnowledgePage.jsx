import { useEffect, useState } from "react";
import { FileText, Search } from "lucide-react";
import { api } from "../api.js";
import PageHeader from "../components/PageHeader.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ErrorState from "../components/ErrorState.jsx";

export default function KnowledgePage() {
  const [policies, setPolicies] = useState([]); const [query, setQuery] = useState(""); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  async function load() { setLoading(true); try { setPolicies((await api.knowledge()).knowledgeBase); } catch (requestError) { setError(requestError.message); } finally { setLoading(false); } }
  useEffect(() => { load(); }, []);
  const filtered = policies.filter((policy) => `${policy.id} ${policy.title} ${policy.category} ${policy.content}`.toLowerCase().includes(query.toLowerCase()));
  return <section><PageHeader eyebrow="Reference / approved data" title="Knowledge base" description="The policy library available to Veridian's internal support agent." /><div className="knowledge-toolbar"><div className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search policies..." /></div><span>{policies.length} approved policies</span></div>{loading ? <LoadingState label="Loading knowledge base" /> : error ? <ErrorState message={error} onRetry={load} /> : <div className="policy-grid">{filtered.map((policy) => <article className="policy-card" key={policy.id}><div className="policy-card-top"><span className="policy-id"><FileText size={14} />{policy.id}</span><span className="category-tag">{policy.category}</span></div><h2>{policy.title}</h2><p>{policy.content}</p><div className="keyword-row">{policy.keywords.slice(0, 5).map((keyword) => <span key={keyword}>{keyword}</span>)}</div></article>)}</div>}</section>;
}