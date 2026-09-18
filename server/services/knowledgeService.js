import { knowledgeBase } from "../data/knowledgeBase.js";

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9@./-]+/g, " ").trim();

export function retrieveKnowledge(message) {
  const normalizedMessage = normalize(message);
  const messageTerms = new Set(normalizedMessage.split(/\s+/).filter(Boolean));

  const isSecurityIncident = /phishing|malware|unauthorized access|clicked.*email|suspicious email/.test(normalizedMessage);
  const isLaptopReplacement = /laptop|computer/.test(normalizedMessage) && /dead|broken|replace|replacement|year|old|hardware/.test(normalizedMessage);

  if (isSecurityIncident) {
    return knowledgeBase.filter((policy) => policy.id === "KB-09");
  }

  if (isLaptopReplacement) {
    return knowledgeBase.filter((policy) => ["KB-03", "ASSET-01"].includes(policy.id));
  }

  const scoredPolicies = knowledgeBase.map((policy) => {
    const score = policy.keywords.reduce((total, keyword) => {
      const normalizedKeyword = normalize(keyword);
      if (normalizedMessage.includes(normalizedKeyword)) return total + (normalizedKeyword.includes(" ") ? 3 : 2);
      return total + (messageTerms.has(normalizedKeyword) ? 1 : 0);
    }, 0);
    return { policy, score };
  });

  const matches = scoredPolicies
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 3)
    .map(({ policy }) => policy);

  return matches;
}

export function getKnowledgeBase() {
  return knowledgeBase;
}