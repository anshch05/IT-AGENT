export default function DecisionBadge({ decision }) {
  return <span className={`decision-badge ${decision?.toLowerCase() || ""}`}><span />{decision || "PENDING"}</span>;
}