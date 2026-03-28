function InitialAvatar({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="handoff-transfer-person">
      <div className="handoff-transfer-avatar">{initial}</div>
      <span className="handoff-transfer-name">{name}</span>
    </div>
  );
}

export function HandoffTransfer({
  from,
  to,
}: {
  from: { name: string };
  to: { name: string };
}) {
  return (
    <div className="handoff-transfer">
      <InitialAvatar name={from.name} />
      <div className="handoff-transfer-arrow">
        <svg width="28" height="12" viewBox="0 0 28 12" fill="none" aria-hidden="true">
          <path
            d="M0 6h24m0 0l-4.5-4.5M24 6l-4.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <InitialAvatar name={to.name} />
    </div>
  );
}
