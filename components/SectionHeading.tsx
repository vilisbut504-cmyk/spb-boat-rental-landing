type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  center?: boolean;
};

export function SectionHeading({ eyebrow, title, subtitle, center }: Props) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sea-500">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{subtitle}</p>
      )}
    </div>
  );
}
