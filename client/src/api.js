const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "The server could not complete this request.");
  return payload;
}

export const api = {
  chat: (body) => request("/chat", { method: "POST", body: JSON.stringify(body) }),
  tickets: () => request("/tickets"),
  ticket: (id) => request(`/tickets/${id}`),
  updateTicketStatus: (id, status) => request(`/tickets/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  knowledge: () => request("/knowledge"),
  audit: () => request("/audit"),
  auditByRequest: (id) => request(`/audit/${id}`)
};