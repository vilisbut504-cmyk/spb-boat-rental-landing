type IconProps = { className?: string };

/** Phone handset — matches Icon.tsx stroke style */
export function PhoneIcon({ className }: IconProps) {
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
      <path d="M6.6 3.8c.5-.5 1.3-.6 1.9-.2l2.1 1.4c.6.4.8 1.2.5 1.8l-.8 1.6c-.2.4-.1.8.2 1.1l2.8 2.8c.3.3.7.4 1.1.2l1.6-.8c.6-.3 1.4-.1 1.8.5l1.4 2.1c.4.6.3 1.4-.2 1.9l-1.2 1.2c-.6.6-1.5.9-2.4.7-2.2-.4-4.7-2-6.9-4.2S4.7 10.2 4.3 8c-.2-.9.1-1.8.7-2.4l1.6-1.8z" />
    </svg>
  );
}

export function TelegramIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M21.9 4.3c.3-1.2-.8-2.2-2-1.8L2.8 8.4c-1.3.4-1.3 2.3.1 2.7l4.5 1.3 1.7 5.3c.3 1 1.6 1.2 2.2.4l2.4-3.1 4.5 3.3c.9.7 2.2.2 2.5-.9l2.2-12.1zM9.3 13.1l-.3 3.1-1.1-3.5 9.4-6.1-8 6.5z" />
    </svg>
  );
}

export function VkIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.6 17.5h-1.4c-4.5 0-7.1-3.1-7.2-8.3h2.2c.1 3.8 1.8 5.4 3.1 5.7V9.2h2.1v3.4c1.3-.1 2.7-1.7 3.2-3.4h2.1c-.4 2.1-2 3.7-3.1 4.4 1.1.5 2.9 2 3.6 4h-2.3c-.5-1.5-1.9-2.9-3.7-3.1v3.1z" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
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
      <path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
