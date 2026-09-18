import { GoogleGenAI } from "@google/genai";

const allowedDecisions = new Set(["RESOLVE", "ASK", "ESCALATE"]);
const transientGeminiStatuses = new Set([429, 500, 502, 503, 504]);
const maxGeminiRetries = 3;
const initialRetryDelayMs = 1000;

const responseSchema = {
  type: "OBJECT",
  properties: {
    intent: { type: "STRING" },
    decision: { type: "STRING", enum: ["RESOLVE", "ASK", "ESCALATE"] },
    response: { type: "STRING" },
    sourcePolicyIds: { type: "ARRAY", items: { type: "STRING" } },
    requiresTicket: { type: "BOOLEAN" },
    escalationReason: { type: "STRING", nullable: true },
    followUpQuestion: { type: "STRING", nullable: true }
  },
  required: ["intent", "decision", "response", "sourcePolicyIds", "requiresTicket", "escalationReason", "followUpQuestion"]
};

function validateAiResponse(value, policies) {
  if (!value || typeof value !== "object" || !allowedDecisions.has(value.decision)) return null;
  if (typeof value.intent !== "string" || typeof value.response !== "string" || !Array.isArray(value.sourcePolicyIds)) return null;
  if (typeof value.requiresTicket !== "boolean") return null;
  if (!value.sourcePolicyIds.every((id) => policies.some((policy) => policy.id === id))) return null;
  return {
    intent: value.intent,
    decision: value.decision,
    response: value.response,
    sourcePolicyIds: value.sourcePolicyIds,
    requiresTicket: value.requiresTicket,
    escalationReason: value.escalationReason || null,
    followUpQuestion: value.followUpQuestion || null
  };
}

function getGeminiStatus(error) {
  const status = error?.status ?? error?.code ?? error?.error?.status ?? error?.error?.code ?? error?.response?.status;
  const numericStatus = Number(status);
  return Number.isInteger(numericStatus) ? numericStatus : null;
}

function isTransientGeminiError(error) {
  return transientGeminiStatuses.has(getGeminiStatus(error));
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function generateWithRetry(ai, request) {
  for (let attempt = 0; attempt <= maxGeminiRetries; attempt += 1) {
    try {
      return await ai.models.generateContent(request);
    } catch (error) {
      const isLastAttempt = attempt === maxGeminiRetries;
      if (!isTransientGeminiError(error) || isLastAttempt) throw error;

      const exponentialDelay = initialRetryDelayMs * (2 ** attempt);
      const jitter = Math.floor(Math.random() * 250);
      console.warn(`Transient Gemini error (${getGeminiStatus(error)}); retrying in ${exponentialDelay + jitter}ms.`);
      await wait(exponentialDelay + jitter);
    }
  }
}

export async function askGemini({ message, policies }) {
  if (!process.env.GEMINI_API_KEY) return null;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const policyText = policies.length
    ? policies.map((policy) => `${policy.id} - ${policy.title}: ${policy.content}`).join("\n")
    : "No relevant policy was retrieved.";
  const prompt = `You are Veridian Corp's internal IT support agent. Use only the retrieved policy text below. Never invent policies, contacts, approvals, timelines, or procedures. Choose exactly one decision: RESOLVE, ASK, or ESCALATE. Ask a focused follow-up when the policy requires missing employee information. Escalate security-sensitive, Finance-owned, unclear, or unsupported requests. Return JSON matching the schema.\n\nEmployee message:\n${message}\n\nRetrieved policies:\n${policyText}`;

  try {
    const result = await generateWithRetry(ai, {
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema }
    });
    const text = result.text || result.response?.text?.();
    if (!text) return null;
    return validateAiResponse(JSON.parse(text), policies);
  } catch (error) {
    console.error("Gemini request failed:", error.message);
    return null;
  }
}