import type { ReactNode } from "react";

export function scrollToSection(id: string): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

interface EyebrowProps {
  children: ReactNode;
  tone?: "navy" | "brass";
  className?: string;
}

export function Eyebrow({ children, tone = "navy", className = "" }: EyebrowProps) {
  return (
    <p
      className={`text-[11px] font-bold uppercase tracking-[0.28em] ${tone === "brass" ? "text-brass" : "text-navy"} ${className}`}
    >
      {children}
    </p>
  );
}