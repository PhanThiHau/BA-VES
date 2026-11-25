import type { ButtonHTMLAttributes, ReactNode } from "react";
import { classNames } from "../../utils/format";

export function Button({ children, variant = "primary", size = "md", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg" }) {
  const styles = {
    primary: "bg-[#1b365d] text-white shadow-2xs hover:bg-[#12243e] transition-colors",
    secondary: "border border-slate/20 bg-white text-navy shadow-2xs hover:bg-mist/30 hover:border-slate/30 transition-colors",
    ghost: "text-slate hover:bg-mist/40 hover:text-navy transition-colors",
    danger: "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors",
  };
  const sizeStyles = {
    sm: "min-h-7 px-2.5 py-1 text-[11px] font-semibold gap-1 rounded-lg leading-normal",
    md: "min-h-8.5 px-3 py-1.5 text-xs font-semibold gap-1.5 rounded-lg leading-normal",
    lg: "min-h-10 px-4 py-2 text-xs font-bold gap-2 rounded-xl leading-normal",
  };
  return <button className={classNames("inline-flex items-center justify-center font-sans transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer", styles[variant], sizeStyles[size], className)} {...props}>{children}</button>;
}
