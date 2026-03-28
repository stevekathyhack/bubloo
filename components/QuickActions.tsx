"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CARE_LOG_TYPE_LABELS } from "@/lib/domain/constants";
import type { CareLogType } from "@/lib/domain/types";

import { useBubloo } from "./BublooProvider";
import { IconDiaper, IconFeed, IconMoon, IconNote, IconSun } from "./icons";

function OneTapButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <button className="quick-action-button" onClick={onPress} type="button">
      <div className="quick-action-icon-circle">{icon}</div>
      <p className="quick-action-label">{label}</p>
    </button>
  );
}

export function QuickActions() {
  const { addLog, isHydrated } = useBubloo();
  const [feedback, setFeedback] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function saveOneTap(type: CareLogType) {
    if (!isHydrated) {
      return;
    }

    addLog({ type });
    setFeedback(`${CARE_LOG_TYPE_LABELS[type]} saved just now.`);

    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setFeedback(null);
    }, 2400);
  }

  return (
    <section className="stack">
      <div className="section-header">
        <h2 className="section-header-title">Quick actions</h2>
      </div>

      <div className="quick-action-grid">
        <Link className="quick-action-button" href="/log?type=feeding">
          <div className="quick-action-icon-circle">
            <IconFeed size={24} />
          </div>
          <p className="quick-action-label">Feed</p>
        </Link>
        <OneTapButton
          label="Sleep"
          icon={<IconMoon size={24} />}
          onPress={() => saveOneTap("sleep_start")}
        />
        <OneTapButton
          label="Wake"
          icon={<IconSun size={24} />}
          onPress={() => saveOneTap("wake")}
        />
        <OneTapButton
          label="Diaper"
          icon={<IconDiaper size={24} />}
          onPress={() => saveOneTap("diaper")}
        />
      </div>

      <Link className="quick-action-note-button" href="/log?type=note">
        <IconNote size={18} />
        Add Note
      </Link>

      <div aria-live="polite" className="status-line" role="status">
        {feedback ?? "Small notes are enough for the next handoff."}
      </div>
    </section>
  );
}
