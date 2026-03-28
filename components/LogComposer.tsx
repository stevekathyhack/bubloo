"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { CARE_LOG_TYPE_LABELS } from "@/lib/domain/constants";
import { formatClockTime } from "@/lib/domain/time";
import { CARE_LOG_TYPES, type CareLogType } from "@/lib/domain/types";

import { useBubloo } from "./BublooProvider";
import { IconClock, IconDiaper, IconFeed, IconMoon, IconNote, IconSun } from "./icons";

function isSelectableLogType(value: string | null): value is CareLogType {
  return value != null && CARE_LOG_TYPES.includes(value as CareLogType);
}

const TYPE_ICONS: Record<CareLogType, React.ReactNode> = {
  feeding: <IconFeed size={22} />,
  sleep_start: <IconMoon size={22} />,
  wake: <IconSun size={22} />,
  diaper: <IconDiaper size={22} />,
  note: <IconNote size={22} />,
};

function FieldShell({ children }: { children: ReactNode }) {
  return (
    <div className="surface-card card-padding">{children}</div>
  );
}

export function LogComposer() {
  const searchParams = useSearchParams();
  const { addLog, isHydrated } = useBubloo();
  const [selectedType, setSelectedType] = useState<CareLogType>("feeding");
  const [amountMl, setAmountMl] = useState("");
  const [noteText, setNoteText] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const queryType = searchParams.get("type");
    if (isSelectableLogType(queryType)) {
      setSelectedType(queryType);
    }
  }, [searchParams]);

  useEffect(() => {
    setStatusMessage(null);
  }, [selectedType]);

  const isOneTapType =
    selectedType === "sleep_start" ||
    selectedType === "wake" ||
    selectedType === "diaper";

  const saveButtonLabel = isOneTapType
    ? `Save ${CARE_LOG_TYPE_LABELS[selectedType].toLowerCase()} now`
    : "Save log";

  const noteIsRequired = selectedType === "note";
  const noteIsEmpty = noteText.trim().length === 0;
  const disableSave = !isHydrated || (noteIsRequired && noteIsEmpty);

  function handleSave() {
    if (disableSave) {
      return;
    }

    const parsedAmount =
      selectedType === "feeding" && amountMl.trim()
        ? Number.parseInt(amountMl, 10)
        : null;

    addLog({
      type: selectedType,
      amount_ml:
        selectedType === "feeding" && Number.isFinite(parsedAmount)
          ? parsedAmount
          : null,
      note:
        selectedType === "feeding" || selectedType === "note"
          ? noteText
          : null,
    });

    setStatusMessage(`${CARE_LOG_TYPE_LABELS[selectedType]} saved just now.`);
    if (selectedType === "feeding") {
      setAmountMl("");
    }
    setNoteText("");
  }

  return (
    <section className="stack">
      <div className="log-type-grid">
        {CARE_LOG_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            className={
              type === selectedType
                ? `log-type-card log-type-card--active${type === "note" ? " log-type-card--wide" : ""}`
                : `log-type-card${type === "note" ? " log-type-card--wide" : ""}`
            }
            onClick={() => setSelectedType(type)}
          >
            <span className="log-type-icon">{TYPE_ICONS[type]}</span>
            {CARE_LOG_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {selectedType === "feeding" ? (
        <div className="stack">
          <FieldShell>
            <div className="stack-tight">
              <label htmlFor="feeding-amount" className="form-label">
                Amount (ml)
              </label>
              <input
                aria-describedby="feeding-amount-hint"
                className="form-input"
                id="feeding-amount"
                inputMode="numeric"
                onChange={(event) => setAmountMl(event.target.value)}
                placeholder="120"
                type="text"
                value={amountMl}
              />
              <p className="meta-text" id="feeding-amount-hint" style={{ margin: 0 }}>
                Leave this empty if you just want to note the feed.
              </p>
            </div>
          </FieldShell>
          <FieldShell>
            <div className="stack-tight">
              <label htmlFor="feeding-note" className="form-label">
                Optional note
              </label>
              <input
                className="form-input"
                id="feeding-note"
                onChange={(event) => setNoteText(event.target.value)}
                placeholder="Add a sweet detail..."
                type="text"
                value={noteText}
              />
            </div>
          </FieldShell>
        </div>
      ) : null}

      {selectedType === "note" ? (
        <FieldShell>
          <div className="stack-tight">
            <label htmlFor="care-note" className="form-label">
              Note
            </label>
            <textarea
              className="form-input"
              id="care-note"
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Add a sweet detail..."
              rows={4}
              style={{ minHeight: "124px", resize: "vertical" }}
              value={noteText}
            />
          </div>
        </FieldShell>
      ) : null}

      {isOneTapType ? (
        <FieldShell>
          <p className="card-text">
            This one is meant to feel near one-tap.
          </p>
        </FieldShell>
      ) : null}

      <button
        className="button-primary"
        disabled={disableSave}
        onClick={handleSave}
        type="button"
      >
        {saveButtonLabel}
      </button>

      <div aria-live="polite" className="status-line" role="status">
        {statusMessage ?? "Missing a few details is okay. Tiny logs still help."}
      </div>
    </section>
  );
}
