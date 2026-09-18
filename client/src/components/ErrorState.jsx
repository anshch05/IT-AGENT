import { RefreshCw } from "lucide-react";

export default function ErrorState({ message, onRetry }) {
  return <div className="error-state"><div><strong>Could not load this view</strong><p>{message}</p></div>{onRetry && <button className="secondary-button" onClick={onRetry}><RefreshCw size={15} /> Retry</button>}</div>;
}