const PATHS: Record<string, React.ReactNode> = {
  "arrow-right": <path d="M2.5 8h10M9 4.2 12.8 8 9 11.8" />,
  check: <path d="M3 8.4 6.3 11.7 13 4.6" />,
  share: <path d="M11.5 6.2a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6ZM4.5 10.3a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6ZM11.5 14.4a2.3 2.3 0 1 0 0-4.6 2.3 2.3 0 0 0 0 4.6ZM6.6 6.3 9.5 4.4M6.6 9.7l2.9 1.9" />,
  camera: <path d="M2 5.6h2.2L5.5 3.7h5l1.3 1.9H14v7.1H2z M8 11.2a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z" />,
  close: <path d="M4 4l8 8M12 4l-8 8" />,
  swap: <path d="M3 6h9l-2.4-2.4M13 10H4l2.4 2.4" />,
  exclude: <path d="M8 2.6a5.4 5.4 0 1 0 0 10.8 5.4 5.4 0 0 0 0-10.8ZM5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" />,
};

export type IconName = keyof typeof PATHS;

/** Directional cues are icons, never characters, so a screen reader says the
 *  label rather than "right arrow". */
export function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      className={className}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.55}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
