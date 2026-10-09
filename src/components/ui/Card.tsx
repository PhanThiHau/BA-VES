import type { ReactNode } from "react";
import { classNames } from "../../utils/format";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={classNames("app-card rounded-xl border border-white/90 bg-white/90 shadow-[0_10px_32px_rgba(25,58,86,.06),0_1px_2px_rgba(25,58,86,.05)] backdrop-blur-sm sm:rounded-2xl", className)}>{children}</section>;
}
