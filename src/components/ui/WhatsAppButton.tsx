function toWhatsAppLink(number: string, message?: string) {
  const digits = number.replace(/[^0-9]/g, "");
  const withCountryCode = digits.startsWith("0") ? `27${digits.slice(1)}` : digits;
  const base = `https://wa.me/${withCountryCode}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function WhatsAppButton({
  whatsapp,
  message = "Hi Jess! I'd like to find out more about booking an appointment.",
  className = "",
  variant = "primary",
}: {
  whatsapp: string;
  message?: string;
  className?: string;
  variant?: "primary" | "outline";
}) {
  const styles =
    variant === "primary"
      ? "bg-black text-white border border-black hover:bg-charcoal"
      : "bg-white text-black border border-black hover:bg-bg";
  return (
    <a
      href={toWhatsAppLink(whatsapp, message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-sm px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 ${styles} ${className}`}
    >
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
        <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.44 1.26 4.89L2 22l5.25-1.38A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.2c-1.6 0-3.13-.42-4.46-1.22l-.32-.19-3.12.82.83-3.04-.21-.32a8.19 8.19 0 0 1-1.26-4.35c0-4.53 3.68-8.2 8.2-8.2 2.19 0 4.25.86 5.8 2.4a8.14 8.14 0 0 1 2.4 5.8c0 4.53-3.68 8.3-8.86 8.3Zm4.52-6.14c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.12-.56.12-.17.25-.65.8-.79.96-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.36-.77-1.86-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.87.85-.87 2.08 0 1.23.89 2.41 1.02 2.58.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28Z" />
      </svg>
      WhatsApp Us
    </a>
  );
}
