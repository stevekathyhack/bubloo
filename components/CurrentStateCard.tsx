import { EMPTY_SLEEP_STATUS_TEXT } from "@/lib/domain/constants";
import type { CurrentStateResponse } from "@/lib/domain/types";

import { IconCloud, IconDiaper, IconFeed, IconMoon } from "./icons";

function StateRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="state-row">
      <div className="state-icon-circle">{icon}</div>
      <div className="state-row-body">
        <div className="state-row-label">{label}</div>
        <div className="state-row-value">{value}</div>
      </div>
    </div>
  );
}

export function CurrentStateCard({
  isHydrated,
  state,
}: {
  isHydrated: boolean;
  state: CurrentStateResponse;
}) {
  const hasSignals =
    state.lastFeed != null ||
    state.lastDiaper != null ||
    state.recentNote != null ||
    state.sleepStatusText !== EMPTY_SLEEP_STATUS_TEXT;

  if (!isHydrated) {
    return (
      <section className="surface-card card-padding state-card">
        <div className="state-card-header">
          <h2 className="state-card-title">Current state</h2>
        </div>
        <p className="card-text">
          Bubloo is warming up your latest notes.
        </p>
      </section>
    );
  }

  return (
    <section className="surface-card card-padding state-card">
      <IconCloud className="state-card-cloud" size={90} />
      <div className="state-card-header">
        <h2 className="state-card-title">Current state</h2>
        {hasSignals ? <span className="state-badge">Active</span> : null}
      </div>

      {hasSignals ? (
        <>
          <StateRow
            label="Last feed"
            icon={<IconFeed size={20} />}
            value={
              state.lastFeed
                ? state.lastFeed.amount_ml
                  ? `${state.lastFeed.amount_ml} ml ${state.lastFeed.relative_text}`
                  : state.lastFeed.relative_text
                : "No recent feed note yet."
            }
          />
          <StateRow
            label="Sleep status"
            icon={<IconMoon size={20} />}
            value={state.sleepStatusText}
          />
          <StateRow
            label="Last diaper"
            icon={<IconDiaper size={20} />}
            value={
              state.lastDiaper
                ? state.lastDiaper.relative_text
                : "No recent diaper note yet."
            }
          />

          {state.recentNote ? (
            <div className="state-note-section">
              <div className="state-note-label">Recent note</div>
              <p className="state-note-text">
                &ldquo;{state.recentNote.note}&rdquo;
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <p className="card-text">
          Even a couple of notes can be enough to make the next handoff easier.
        </p>
      )}
    </section>
  );
}
