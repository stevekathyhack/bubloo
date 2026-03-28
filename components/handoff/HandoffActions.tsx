import { IconCopy, IconRefresh } from "../icons";

export function HandoffActions({
  onCopy,
  onRefresh,
  pending,
  copied,
}: {
  onCopy: () => void;
  onRefresh: () => void;
  pending: boolean;
  copied: boolean;
}) {
  return (
    <div className="action-row">
      <button type="button" className="button-primary" onClick={onCopy} disabled={pending}>
        <IconCopy size={18} />
        {copied ? "Copied!" : "Copy handoff"}
      </button>
      <button
        type="button"
        className="button-secondary"
        onClick={onRefresh}
        disabled={pending}
      >
        <IconRefresh size={18} />
        Refresh summary
      </button>
    </div>
  );
}
