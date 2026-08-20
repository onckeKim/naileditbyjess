const ICONS = {
  hand: (
    <path d="M9 12V5.5a1.5 1.5 0 0 1 3 0V11m0-6.5a1.5 1.5 0 0 1 3 0V11m0-4.5a1.5 1.5 0 0 1 3 0V13m0-3a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6h-2a6 6 0 0 1-5-2.7L4.2 15a1.4 1.4 0 0 1 2.2-1.7L9 16" />
  ),
  sparkle: (
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
  ),
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11Z" />,
  foot: (
    <path d="M8 21c-2 0-3-1.4-3-3.5 0-3 1.5-4 1.5-7C6.5 7 6 5 8 5s3 2 3 4.5c0 2 .8 2.5 2 2.5 1.6 0 2.5-2 2.5-4 0-1.7 1-3 2.5-3s2.5 1.6 2.5 3.5c0 4-2.5 5-2.5 9 0 2-1 3.5-3 3.5H8Z" />
  ),
};

export function PlaceholderArt({
  icon = "sparkle",
  className = "",
  label,
}: {
  icon?: keyof typeof ICONS;
  className?: string;
  label?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-marble flex items-center justify-center ${className}`}>
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 90% 60% at 20% 20%, rgba(255,255,255,0.6), transparent 60%), radial-gradient(ellipse 80% 60% at 80% 80%, rgba(136,136,134,0.25), transparent 60%)",
        }}
      />
      <svg
        viewBox="0 0 24 24"
        width="15%"
        height="15%"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative text-black/25"
      >
        {ICONS[icon]}
      </svg>
      {label && (
        <span className="absolute bottom-3 left-3 text-[10px] tracking-[0.2em] uppercase text-medium-grey">
          {label}
        </span>
      )}
    </div>
  );
}
