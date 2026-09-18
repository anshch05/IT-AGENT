# Veridian Corp AI Internal IT Support Agent

## 1. Problem Statement

Veridian Corp employees need quick, reliable answers to common internal IT issues. An effective support agent should understand an employee's issue, find the relevant company policy, ask for missing information when necessary, resolve simple requests, and escalate risky, unclear, or approval-required cases.

The agent should also create structured tickets when action is required and maintain an audit trail of decisions, source policies, and actions.

## 2. Solution

This project provides a policy-grounded internal IT support agent with a React support desk and an Express API. The backend retrieves relevant entries from the supplied Veridian Corp knowledge base and includes those entries in the Gemini reasoning prompt.

The agent returns one of three decisions:

- `RESOLVE`: the supplied policy clearly answers the request.
- `ASK`: important information is missing, so the agent asks a focused follow-up question.
- `ESCALATE`: the request is security-sensitive, owned by another department, approval-dependent, unclear, or otherwise requires review.

The backend validates Gemini's structured JSON response and also applies deterministic guardrails for important supported scenarios. The response includes the source policy used. Applicable cases create a MongoDB ticket, and every chat interaction creates an audit record.

## 3. Key Features

- Natural-language IT support through the Support Desk.
- Simple keyword-based knowledge-base and policy retrieval.
- `RESOLVE`, `ASK`, and `ESCALATE` decisions.
- Follow-up questions when policy-relevant context is missing.
- Automatic ticket creation for applicable cases.
- Source policy displayed with agent responses.
- Ticket Queue page with status updates.
- Knowledge Base page showing the supplied policies.
- Audit Trail page showing agent decisions and actions.
- `New Request` action that clears the current conversation without a page refresh or data deletion.
- Bounded Gemini retry handling for transient `429` and `5xx` errors.
- MongoDB Atlas persistence through Mongoose.
- Supplied historical tickets seeded into MongoDB when the ticket collection is empty.

## 4. Agent Workflow

```text
Employee
   |
   v
React Support Desk
   |
   v
Express API
   |
   v
Agent Service
   |
   +--> Knowledge Retrieval
   |
   +--> Gemini reasoning with retrieved policy text
   |
   v
Decision
   |
   +--> RESOLVE
   +--> ASK
   +--> ESCALATE
             |
             v
      Ticket creation when required
             |
             v
          MongoDB
          /      \
     Tickets   Audit Log
             |
             v
Response with source policy
```

## 5. Architecture

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- `lucide-react` for interface icons

The frontend provides these routes:

- `/` - Support Desk / Chat
- `/tickets` - Ticket Queue
- `/knowledge` - Knowledge Base
- `/audit` - Audit Trail

### Backend

- Node.js with ESM modules
- Express
- `@google/genai`
- Mongoose
- CORS
- dotenv

The backend exposes chat, ticket, audit, knowledge, and health endpoints. It validates request input, coordinates the agent pipeline, persists tickets and audit logs, and returns safe error responses.

### Database

- MongoDB Atlas
- `Ticket` Mongoose model
- `AuditLog` Mongoose model

### AI

- Google Gemini API through the official `@google/genai` package
- Structured JSON response schema
- Current model is selected through `GEMINI_MODEL` when provided, with the project default configured in `server/services/aiService.js`

## 6. Knowledge Sources

The application uses the supplied Veridian Corp policy/data pack as its source of truth:

- `KB-01` Password Reset
- `KB-02` VPN Access
- `KB-03` Laptop Replacement
- `KB-04` Software Installation
- `KB-05` Printer Troubleshooting
- `KB-06` Email Mailbox Quota
- `KB-07` Guest Wi-Fi
- `KB-08` Expense Software Access
- `KB-09` Security Incident Reporting
- `KB-10` Work-From-Home Equipment
- Asset Management Policy

The policies are stored in `server/data/knowledgeBase.js`. The agent is designed to use the supplied policy/data pack and must not invent company policies, contacts, permissions, approval processes, or unsupported procedures.

## 7. Demo Scenarios

### Password Reset

Input:

```text
I forgot my password and haven't been locked out.
```

Expected and verified:

- Decision: `RESOLVE`
- Source: `KB-01`
- Guidance: use the self-service password reset
- `requiresTicket: false`
- No ticket created

The agent respects the explicit statement that the employee is not locked out and does not infer a lockout from the word "password" alone.

### VPN Access

Input:

```text
I need VPN access.
```

Verified:

- Decision: `ASK`
- Source: `KB-02`
- Follow-up: asks whether the employee is full-time or a contractor
- No ticket created

### Phishing

Input:

```text
I clicked a phishing email.
```

Verified:

- Decision: `ESCALATE`
- Source: `KB-09`
- Tells the employee to report immediately to `security@veridian-corp.example`
- Tells the employee not to forward the incident to other employees
- Ticket created

### Laptop Replacement

The laptop hardware-failure scenario was tested and routed using `KB-03` plus the Asset Management Policy. The response preserves the supplied requirements around verified hardware failure, the refresh cycle, Finance sign-off, IT approval, and replacement request timing.

## 8. Ticket and Audit Trail

When a chat decision requires operational action, the backend creates a structured ticket with fields including:

- Ticket ID, such as `TK-1052`
- Employee name and email
- Category and issue
- Priority and status
- Source policy
- Action
- Escalation reason
- Created and updated timestamps

Every chat interaction creates an audit record containing:

- Request ID
- Employee identity
- Original user message
- Agent action
- Decision
- Source policy
- Timestamp
- Created ticket ID when applicable

The supplied historical ticket queue is stored in `server/data/initialTickets.js` and is seeded only when the MongoDB ticket collection is empty.

## 9. Error Handling

The backend validates empty chat messages, validates Gemini structured JSON before using it, catches Gemini failures, and returns a safe fallback response when the AI response is unavailable or malformed.

Transient Gemini errors with status codes `429`, `500`, `502`, `503`, and `504` use bounded exponential backoff with a small jitter. The implementation allows a maximum of three retries with approximately 1, 2, and 4 second base delays. Permanent errors such as `400`, `401`, `403`, and `404` are not blindly retried.

This retry behavior improves resilience but does not guarantee Gemini or MongoDB availability.

## 10. Project Structure

```text
veridian-it-agent/
|
+-- client/
|   +-- package.json
|   +-- vite.config.js
|   +-- tailwind.config.js
|   +-- src/
|       +-- App.jsx
|       +-- api.js
|       +-- main.jsx
|       +-- styles.css
|       +-- pages/
|       |   +-- ChatPage.jsx
|       |   +-- TicketsPage.jsx
|       |   +-- KnowledgePage.jsx
|       |   +-- AuditPage.jsx
|       +-- components/
|           +-- DecisionBadge.jsx
|           +-- ErrorState.jsx
|           +-- LoadingState.jsx
|
+-- server/
    +-- server.js
    +-- config/
    |   +-- db.js
    |   +-- seed.js
    +-- services/
    |   +-- agentService.js
    |   +-- aiService.js
    |   +-- knowledgeService.js
    +-- controllers/
    |   +-- chatController.js
    |   +-- ticketController.js
    |   +-- auditController.js
    +-- routes/
    |   +-- chatRoutes.js
    |   +-- ticketRoutes.js
    |   +-- auditRoutes.js
    |   +-- knowledgeRoutes.js
    +-- models/
    |   +-- Ticket.js
    |   +-- AuditLog.js
    +-- data/
    |   +-- knowledgeBase.js
    |   +-- employeeRequests.js
    |   +-- initialTickets.js
    +-- package.json
    +-- .env.example
```

## 11. Environment Variables

Create a local `server/.env` file with values for the following variables:

```env
PORT=
MONGODB_URI=
GEMINI_API_KEY=
```

`GEMINI_API_KEY` is used only by the backend. Never expose it to the React frontend, commit it to GitHub, or add it to `.env.example` with a real value. The repository `.gitignore` excludes `.env` files.

## 12. Running Locally

### Backend

```powershell
cd server
npm install
npm start
```

The backend runs on port `5000` by default:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```powershell
cd client
npm install
npm run dev
```

The Vite frontend runs on port `5173`:

```text
http://localhost:5173
```

Run the backend before submitting chat requests from the frontend.

## 13. API Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Backend health check |
| `POST` | `/api/chat` | Process an employee support message |
| `GET` | `/api/tickets` | List tickets |
| `GET` | `/api/tickets/:id` | Get one ticket |
| `POST` | `/api/tickets` | Create a ticket manually |
| `PATCH` | `/api/tickets/:id/status` | Update ticket status |
| `GET` | `/api/audit` | List audit records |
| `GET` | `/api/audit/:requestId` | Get audit records for a request |
| `GET` | `/api/knowledge` | List knowledge-base policies |

## 14. AI Tools Used

### AI used by the application

- Google Gemini API through `@google/genai` for policy-grounded structured reasoning.

### Tools used during development

- Codex/AI coding assistance for implementation, debugging, testing, and refinement.

These are separate concerns: Gemini is part of the running application, while coding assistance was used to develop and validate the project.

## 15. Assumptions and Constraints

- The supplied Veridian Corp data pack is treated as the source of truth.
- The agent must not invent unsupported company policies or procedures.
- If important context is missing, the agent asks a follow-up question.
- Risky, security-sensitive, Finance-owned, or approval-required cases can be escalated.
- The prototype uses the supplied internal policy dataset rather than an enterprise-wide live IT knowledge system.
- Authentication and authorization are intentionally outside this six-hour MVP scope.
- Historical tickets are context data and are not treated as new company policy.

## 16. Limitations / Future Improvements

The following are not currently implemented and would be appropriate future improvements:

- Employee authentication and SSO.
- Role-based access control for tickets, policies, and audit data.
- Production monitoring, alerting, and observability.
- Larger-scale semantic or vector-based retrieval.
- Integration with a real enterprise ticketing system.
- Richer multi-turn conversation state and follow-up context handling.
- Automated backend unit and integration test coverage.
- Production deployment configuration and secret management.

## 17. Demo and Submission

- GitHub Repository: `[add link]`
- Demo Video: `[add link]`
- Presentation: `[add link if needed]`
