import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function defaults(props: IconProps, size = 20) {
  const s = props.size ?? size;
  return {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
    size: undefined,
  };
}

export function IconFeed(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

export function IconDiaper(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="M4 7c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v2c0 5.52-3.58 10-8 10S4 14.52 4 9Z" />
      <path d="M8 5v1" />
      <path d="M16 5v1" />
      <path d="M9 12h6" />
    </svg>
  );
}

export function IconNote(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

export function IconCloud(props: IconProps) {
  return (
    <svg {...defaults(props, 24)} aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function IconSparkle(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function IconHandoff(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="M16 3h5v5" />
      <path d="m21 3-7 7" />
      <path d="M8 21H3v-5" />
      <path d="m3 21 7-7" />
    </svg>
  );
}

export function IconTimeline(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

export function IconBullet(props: IconProps) {
  return (
    <svg {...defaults(props, 16)} viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTrend(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function IconFolder(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconLightbulb(props: IconProps) {
  return (
    <svg {...defaults(props)} aria-hidden="true">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}
