import { askGemini } from "./aiService.js";
import { retrieveKnowledge } from "./knowledgeService.js";

const source = (policies) => policies.map(({ id, title }) => ({ id, title }));

function deterministicDecision(message, policies) {
  const normalized = message.toLowerCase();
  const hasPolicy = policies.length > 0;
  const explicitlyNotLocked = /\b(?:not|never|haven't|have not|hasn't|has not)\b[^.!?]{0,24}\blocked\b/.test(normalized);

  if (/phishing|malware|unauthorized access|clicked.*email/.test(normalized)) {
    return { intent: "security_incident", decision: "ESCALATE", response: "Report the suspected security incident immediately to security@veridian-corp.example. Do not forward the incident to other employees.", sourcePolicyIds: ["KB-09"], requiresTicket: true, escalationReason: "Security incident requires immediate Security reporting." };
  }
  if (/expense software|expense management|expense app/.test(normalized) && /access|permission|grant/.test(normalized)) {
    return { intent: "expense_software_access", decision: "ESCALATE", response: "Finance grants expense software access. IT does not grant this access. IT can help with login or technical issues once the account already exists.", sourcePolicyIds: ["KB-08"], requiresTicket: true, escalationReason: "Expense software access is owned by Finance." };
  }
  if (/vpn/.test(normalized) && /access|need|request/.test(normalized) && !/expired|renew/.test(normalized)) {
    return { intent: "vpn_access", decision: "ASK", response: "I need one detail before I can apply the VPN policy.", sourcePolicyIds: ["KB-02"], requiresTicket: false, followUpQuestion: "Are you a full-time employee or a contractor?" };
  }
  if (!explicitlyNotLocked && /locked|lockout|failed.*(5|six|6)|6 times/.test(normalized) && /password|account/.test(normalized)) {
    return { intent: "password_unlock", decision: "RESOLVE", response: "Because the account was locked after more than 5 failed attempts, IT must unlock it manually. I will create an IT ticket for the manual unlock.", sourcePolicyIds: ["KB-01"], requiresTicket: true, escalationReason: null };
  }
  if (/password|reset/.test(normalized) && /forgot|reset|change/.test(normalized)) {
    return { intent: "password_reset", decision: "RESOLVE", response: "You can reset your password at any time using the self-service portal.", sourcePolicyIds: ["KB-01"], requiresTicket: false, escalationReason: null };
  }
  if (/vpn/.test(normalized) && /expired|renew|stopped/.test(normalized)) {
    return { intent: "vpn_credentials", decision: "RESOLVE", response: "VPN credentials expire every 90 days and must be renewed by the employee.", sourcePolicyIds: ["KB-02"], requiresTicket: false, escalationReason: null };
  }
  if (/non-?catalog|not in the catalog|outside the catalog/.test(normalized) && /software|install|tool/.test(normalized)) {
    return { intent: "software_installation", decision: "ESCALATE", response: "Non-catalog software requires IT Security review. The supplied policy says the review takes 3-5 business days.", sourcePolicyIds: ["KB-04"], requiresTicket: true, escalationReason: "Non-catalog software requires IT Security review." };
  }
  if (/work from home|wfh|remote/.test(normalized) && /equipment|allowance|chair|monitor/.test(normalized)) {
    return { intent: "home_office_equipment", decision: "RESOLVE", response: "Employees working remotely more than 3 days per week are eligible for a one-time home-office equipment allowance. Eligible equipment includes a chair and monitor. Manager sign-off is required, Finance processes the allowance, and IT handles equipment shipping after approval.", sourcePolicyIds: ["KB-10"], requiresTicket: false, escalationReason: null };
  }
  if (/laptop|computer/.test(normalized) && /dead|broken|replace|replacement/.test(normalized)) {
    return { intent: "laptop_replacement", decision: "ESCALATE", response: "A verified hardware failure can qualify for earlier laptop replacement under KB-03. The standard hardware refresh cycle is 4 years, and early replacement outside that cycle requires Finance sign-off in addition to IT approval. Requests should normally be raised at least 2 weeks before the intended replacement. I will create a ticket for review.", sourcePolicyIds: ["KB-03", "ASSET-01"], requiresTicket: true, escalationReason: "Laptop replacement requires hardware verification and the supplied approval requirements." };
  }
  if (/printer|print/.test(normalized) && /persist|still|paper jam|problem/.test(normalized)) {
    return { intent: "printer_troubleshooting", decision: "RESOLVE", response: "Check the printer queue and restart the print spooler. If the problem persists, an IT ticket should include the printer asset tag.", sourcePolicyIds: ["KB-05"], requiresTicket: true, escalationReason: null };
  }
  if (!hasPolicy) {
    return { intent: "unsupported_request", decision: "ASK", response: "The available Veridian IT knowledge base does not contain enough information to answer this request safely.", requiresTicket: false, followUpQuestion: "Could you provide more detail about the IT issue?" };
  }
  return null;
}

function enforceGuardrails(message, policies, aiDecision) {
  const deterministic = deterministicDecision(message, policies);
  if (deterministic) return { ...deterministic, sourcePolicyIds: deterministic.sourcePolicyIds || [] };
  if (aiDecision) return aiDecision;
  return { intent: "unsupported_request", decision: "ASK", response: "The available Veridian IT knowledge base does not contain enough information to answer this request safely.", sourcePolicyIds: [], requiresTicket: false, escalationReason: null, followUpQuestion: "Could you provide more detail about the IT issue?" };
}

export async function processMessage(message) {
  const policies = retrieveKnowledge(message);
  const aiDecision = await askGemini({ message, policies });
  const decision = enforceGuardrails(message, policies, aiDecision);
  const sourcePolicies = policies.filter((policy) => decision.sourcePolicyIds.includes(policy.id));
  return {
    ...decision,
    source: source(sourcePolicies.length ? sourcePolicies : policies),
    requiresTicket: Boolean(decision.requiresTicket)
  };
}