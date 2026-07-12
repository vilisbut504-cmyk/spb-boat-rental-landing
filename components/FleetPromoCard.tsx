export function FleetPromoCardView({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-marine-200 bg-gradient-to-br from-milk via-white to-marine-50 p-8 text-center shadow-sm">
      <div
        className="relative flex h-28 w-40 items-center justify-center"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 160 90"
          className="h-full w-full text-marine-600"
          fill="none"
        >
          <path
            d="M18 58c12-6 28-10 46-10s34 4 46 10l8 4H10l8-4Z"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            d="M22 56c14-8 34-12 50-12s36 4 50 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.55"
          />
          <path
            d="M30 56c8-14 24-24 42-24s34 10 42 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M48 52h64M72 40v-8M88 40v-6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.45"
          />
        </svg>
        <span className="absolute -right-1 -top-1 flex h-10 w-10 items-center justify-center rounded-full bg-marine-600 text-xl font-light text-white shadow-sm">
          +
        </span>
      </div>

      <h3 className="mt-6 max-w-xs text-xl font-bold leading-snug text-ink">
        {title}
      </h3>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
        {description}
      </p>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-marine-600">
        Парк расширяется
      </p>
    </article>
  );
}
