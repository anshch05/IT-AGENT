export const knowledgeBase = [
  {
    id: "KB-01",
    title: "Password Reset",
    category: "authentication",
    content: "Employees can reset their own password using the self-service portal at any time. If an account is locked after 5 failed attempts, the employee must contact IT to unlock it manually.",
    keywords: ["password", "forgot", "reset", "locked", "lockout", "failed attempts", "account"]
  },
  {
    id: "KB-02",
    title: "VPN Access",
    category: "network_access",
    content: "Full-time employees get VPN automatically. Contractors need manager approval through the access request form. VPN credentials expire every 90 days and must be renewed by the employee.",
    keywords: ["vpn", "virtual private network", "credentials", "expired", "contractor", "full-time", "access"]
  },
  {
    id: "KB-03",
    title: "Laptop Replacement",
    category: "hardware",
    content: "Eligible after 3 years of service OR earlier if there is a verified hardware failure. Requests should be raised at least 2 weeks before the intended replacement.",
    keywords: ["laptop", "replacement", "dead", "broken", "hardware failure", "years", "old"]
  },
  {
    id: "KB-04",
    title: "Software Installation",
    category: "software",
    content: "Software in the approved catalog can be self-installed. Non-catalog software requires IT Security review. Security review takes 3–5 business days.",
    keywords: ["software", "install", "installation", "catalog", "non-catalog", "security review", "tool"]
  },
  {
    id: "KB-05",
    title: "Printer Troubleshooting",
    category: "hardware",
    content: "Check the printer queue. Restart the print spooler. If the problem persists, create a ticket with the printer asset tag.",
    keywords: ["printer", "print", "paper jam", "queue", "spooler", "asset tag"]
  },
  {
    id: "KB-06",
    title: "Email Mailbox Quota",
    category: "email",
    content: "Default mailbox quota is 25GB. Employees should archive old mail. Increases above 25GB require manager approval. Maximum mailbox size is 50GB.",
    keywords: ["email", "mailbox", "quota", "storage", "gb", "archive", "manager approval"]
  },
  {
    id: "KB-07",
    title: "Guest Wi-Fi",
    category: "network_access",
    content: "Guest credentials are valid for 24 hours. Any employee can generate guest Wi-Fi credentials using the front-desk kiosk. No IT ticket is required.",
    keywords: ["guest", "wi-fi", "wifi", "visitor", "front-desk", "kiosk", "24 hours"]
  },
  {
    id: "KB-08",
    title: "Expense Software Access",
    category: "departmental_access",
    content: "Finance grants expense software access. IT does NOT grant the access. IT only handles login/technical issues once the account already exists.",
    keywords: ["expense", "finance", "software access", "login", "technical issue", "account"]
  },
  {
    id: "KB-09",
    title: "Security Incident Reporting",
    category: "security",
    content: "Suspected phishing, malware, or unauthorized access must be reported immediately to security@veridian-corp.example. The incident should NOT be forwarded to other employees.",
    keywords: ["phishing", "malware", "unauthorized", "security", "incident", "clicked", "email"]
  },
  {
    id: "KB-10",
    title: "Work-From-Home Equipment",
    category: "equipment_allowance",
    content: "Employees working remotely more than 3 days/week are eligible for a one-time home-office equipment allowance. Eligible equipment includes chair and monitor. Manager sign-off is required. Finance processes the allowance. IT handles equipment shipping after approval.",
    keywords: ["work from home", "wfh", "remote", "equipment", "allowance", "chair", "monitor", "finance"]
  },
  {
    id: "ASSET-01",
    title: "Asset Management Policy",
    category: "hardware",
    content: "Company hardware standard refresh cycle is 4 years from date of issue. Early replacement outside the cycle requires Finance sign-off in addition to IT approval. Policy last updated Q2 2026.",
    keywords: ["hardware", "refresh", "cycle", "date of issue", "early replacement", "finance sign-off", "it approval"]
  }
];

export default knowledgeBase;