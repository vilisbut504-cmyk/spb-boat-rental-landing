type IconProps = { name: string; className?: string };

const paths: Record<string, React.ReactNode> = {
  wheel: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5" />
      <path d="M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8" />
      <circle cx="12" cy="3.2" r="0.6" fill="currentColor" />
      <circle cx="12" cy="20.8" r="0.6" fill="currentColor" />
      <circle cx="3.2" cy="12" r="0.6" fill="currentColor" />
      <circle cx="20.8" cy="12" r="0.6" fill="currentColor" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  map: (
    <>
      <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
      <path d="M16 6a3 3 0 010 6M21 20c0-2.5-1.5-4-3.5-4.5" />
    </>
  ),
  boat: (
    <>
      <path d="M3 15h18l-2.5 4H6L3 15z" />
      <path d="M6 15V9.5L13 8l5 7" />
      <path d="M9 9v-3" />
      <path d="M2 21c1 .8 2.2.8 3.2 0 1-.8 2.2-.8 3.2 0 1 .8 2.2.8 3.2 0 1-.8 2.2-.8 3.2 0 1 .8 2.2.8 3.2 0 1-.8 2.2-.8 3.2 0" opacity="0.6" />
    </>
  ),
  motor: (
    <>
      <rect x="8.5" y="3" width="7" height="6" rx="1.4" />
      <path d="M10.5 9v4.5a1.8 1.8 0 003.6 0V9" />
      <path d="M12.3 15.5v3" />
      <path d="M9.8 18.5h5a1.6 1.6 0 01-1.6 2h-1.8a1.6 1.6 0 01-1.6-2z" />
      <path d="M17.5 5.5h2M17.5 7.5h1.3" opacity="0.7" />
      <path d="M4.5 5.5h2M5.2 7.5h1.3" opacity="0.7" />
    </>
  ),
  heart: (
    <>
      <path d="M12 20s-7-4.6-9-9c-1.2-2.7.4-6 3.5-6 2 0 3.5 1.2 4.2 2.6L12 9l1.3-1.4C14 6.2 15.5 5 17.5 5c3.1 0 4.7 3.3 3.5 6-2 4.4-9 9-9 9z" />
      <path d="M19 2.5l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5.5-1.2z" strokeWidth="1.2" />
    </>
  ),
  cake: (
    <>
      <path d="M5 12h14v8H5v-8z" />
      <path d="M5 15c1 .9 2.1.9 3.1 0 1-.9 2.1-.9 3.1 0 1 .9 2.1.9 3.1 0 1-.9 2.1-.9 3.1 0 .8.7 1.7.9 2.6.3" />
      <path d="M8 12V9.5M12 12V9.5M16 12V9.5" />
      <path d="M8 7.5v-1M12 7.5v-1M16 7.5v-1" strokeWidth="1.2" />
      <circle cx="8" cy="5.4" r="0.4" fill="currentColor" />
      <circle cx="12" cy="5.4" r="0.4" fill="currentColor" />
      <circle cx="16" cy="5.4" r="0.4" fill="currentColor" />
    </>
  ),
  "moon-water": (
    <>
      <path d="M15.5 3a7 7 0 102.8 12.2A7.5 7.5 0 0115.5 3z" />
      <path d="M2.5 19c1 .8 2.3.8 3.3 0 1-.8 2.3-.8 3.3 0 1 .8 2.3.8 3.3 0 1-.8 2.3-.8 3.3 0 1 .8 2.3.8 3.3 0 1-.8 2.3-.8 3.3 0" />
    </>
  ),
  family: (
    <>
      <circle cx="8" cy="6.5" r="2.4" />
      <circle cx="16.5" cy="7.5" r="2" />
      <circle cx="12.3" cy="12.5" r="1.6" />
      <path d="M3.5 20c0-3 2-4.8 4.5-4.8S12.5 17 12.5 20" />
      <path d="M13.5 15.9c.7-.5 1.6-.8 2.7-.8 2.2 0 4 1.5 4 4.2" />
      <path d="M10 20.5c0-1.8 1-3 2.3-3s2.3 1.2 2.3 3" />
    </>
  ),
  speaker: (
    <>
      <rect x="7.5" y="3" width="9" height="18" rx="2.2" />
      <circle cx="12" cy="8" r="1.5" />
      <circle cx="12" cy="14.8" r="3" />
      <circle cx="12" cy="14.8" r="0.5" fill="currentColor" />
      <path d="M19.5 9c.9 1.8.9 4.2 0 6M22 7.5c1.4 2.7 1.4 6.3 0 9" opacity="0.6" strokeWidth="1.3" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
      <circle cx="12" cy="13" r="3.4" />
      <circle cx="18.3" cy="10.3" r="0.5" fill="currentColor" />
    </>
  ),
};

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name] ?? null}
    </svg>
  );
}
