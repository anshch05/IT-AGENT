export default function LoadingState({ label = "Loading workspace data" }) {
  return <div className="loading-state"><span className="loader" />{label}</div>;
}