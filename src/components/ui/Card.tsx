import { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-marble rounded-lg shadow-[0_2px_20px_rgba(17,17,17,0.05)] ${className}`}>
      {children}
    </div>
  );
}

export function FrostedCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`backdrop-blur-sm bg-white/80 border border-white/60 rounded-lg shadow-[0_2px_24px_rgba(17,17,17,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  light = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  light?: boolean;
}) {
  const alignClass = align === "center" ? "text-center items-center" : "text-left items-start";
  const titleColor = light ? "text-white" : "text-black";
  const subColor = light ? "text-silver" : "text-medium-grey";
  return (
    <div className={`flex flex-col ${alignClass} gap-3 mb-10`}>
      {eyebrow && (
        <span className={`text-xs tracking-[0.3em] uppercase ${light ? "text-silver" : "text-medium-grey"}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-3xl md:text-4xl font-semibold ${titleColor} text-balance`}>{title}</h2>
      {subtitle && <p className={`max-w-2xl font-sans text-sm md:text-base ${subColor}`}>{subtitle}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "error" | "black";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-marble text-charcoal",
    success: "bg-success/10 text-success border border-success/30",
    warning: "bg-warning/10 text-warning border border-warning/30",
    error: "bg-error/10 text-error border border-error/30",
    black: "bg-black text-white",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
