import Image from "next/image";
import Link from "next/link";

export function Logo({
  logoUrl,
  established = "2021",
  size = "md",
  light = false,
}: {
  logoUrl?: string | null;
  established?: string;
  size?: "sm" | "md" | "lg";
  light?: boolean;
}) {
  if (logoUrl) {
    const dims = size === "lg" ? 96 : size === "sm" ? 40 : 56;
    return (
      <Link href="/" className="inline-flex items-center">
        <Image src={logoUrl} alt="Nailed It Jess" width={dims * 3} height={dims} className="h-auto" style={{ height: dims }} />
      </Link>
    );
  }

  const headingSize = size === "lg" ? "text-5xl md:text-6xl" : size === "sm" ? "text-xl" : "text-2xl md:text-3xl";
  const scriptSize = size === "lg" ? "text-4xl md:text-5xl" : size === "sm" ? "text-lg" : "text-xl md:text-2xl";
  const color = light ? "text-white" : "text-black";
  const mutedColor = light ? "text-silver" : "text-medium-grey";

  return (
    <Link href="/" className="inline-flex flex-col items-center leading-none group">
      <span className={`font-display font-semibold tracking-wide ${headingSize} ${color}`}>NAILED IT</span>
      <span className={`font-signature -mt-1 ${scriptSize} ${color}`}>Jess</span>
      <span className={`mt-1 text-[10px] tracking-[0.3em] ${mutedColor}`}>EST. {established}</span>
    </Link>
  );
}
