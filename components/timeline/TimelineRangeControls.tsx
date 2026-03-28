import type { TimelineRange } from "../../lib/bubloo/types";

const RANGES: TimelineRange[] = ["12h", "24h", "48h"];

export function TimelineRangeControls({
  value,
  onChange,
  disabled,
}: {
  value: TimelineRange;
  onChange: (range: TimelineRange) => void;
  disabled?: boolean;
}) {
  return (
    <div className="chip-row" role="group" aria-label="Timeline range">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          className={
            range === value ? "chip-button chip-button--active" : "chip-button"
          }
          onClick={() => onChange(range)}
          disabled={disabled}
          aria-pressed={range === value}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
