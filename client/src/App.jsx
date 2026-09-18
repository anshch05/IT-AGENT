import { useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { Activity, BookOpen, ChevronRight, ClipboardList, Headset, Menu, MessageSquare, X } from "lucide-react";
import ChatPage from "./pages/ChatPage.jsx";
import TicketsPage from "./pages/TicketsPage.jsx";
import KnowledgePage from "./pages/KnowledgePage.jsx";
import AuditPage from "./pages/AuditPage.jsx";

const navItems = [
  { to: "/", label: "Support desk", icon: MessageSquare, end: true },
  { to: "/tickets", label: "Ticket queue", icon: ClipboardList },
  { to: "/knowledge", label: "Knowledge base", icon: BookOpen },
  { to: "/audit", label: "Audit trail", icon: Activity }
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const pageName = navItems.find((item) => item.to === location.pathname)?.label || "Support desk";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Headset size={21} strokeWidth={2.4} /></div>
          <div><strong>veridian</strong><span>INTERNAL SYSTEMS</span></div>
          <button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>
        <div className="workspace-label">Workspace <span className="status-dot" /> Online</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`} onClick={() => setMenuOpen(false)}>
              <Icon size={18} /><span>{label}</span>{label === "Ticket queue" && <span className="nav-count">15</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer"><div className="security-badge"><span>●</span> Policy-grounded agent</div><small>Data pack · Sep 2026</small></div>
      </aside>
      {menuOpen && <button className="mobile-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Veridian Corp</span><ChevronRight size={14} /><strong>{pageName}</strong></div>
          <div className="topbar-right"><div className="pulse-label"><span className="status-dot" /> Agent online</div><div className="avatar">DE</div></div>
        </header>
        <div className="page-content"><Routes><Route path="/" element={<ChatPage />} /><Route path="/tickets" element={<TicketsPage />} /><Route path="/knowledge" element={<KnowledgePage />} /><Route path="/audit" element={<AuditPage />} /></Routes></div>
      </main>
    </div>
  );
}

export default App;