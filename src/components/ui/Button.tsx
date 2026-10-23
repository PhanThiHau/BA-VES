import type { ButtonHTMLAttributes, ReactNode } from "react";
import { classNames } from "../../utils/format";

export function Button({ children, variant = "primary", size = "md", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg" }) {
  const styles = { primary: "bg-[#2f638c] text-white shadow-[0_8px_18px_rgba(47,99,140,.18)] hover:-translate-y-0.5 hover:bg-[#275777] hover:shadow-[0_12px_24px_rgba(47,99,140,.22)]", secondary: "border border-[#cbd9e5] bg-white/90 text-[#203a5c] shadow-sm hover:-translate-y-0.5 hover:border-[#9db4c8] hover:bg-white", ghost: "text-[#536f89] hover:bg-[#e8f0f6]", danger: "bg-[#fff1f1] text-[#b42318] hover:bg-[#ffe4e4]" };
  const sizeStyles = { sm: "min-h-8 px-2.5 py-1 text-xs rounded-lg", md: "min-h-10 px-3.5 py-2 text-sm rounded-xl sm:px-4", lg: "min-h-12 px-5 py-3 text-base rounded-2xl" };
  return <button className={classNames("inline-flex items-center justify-center gap-2 font-semibold transition duration-200 ease-out active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50", styles[variant], sizeStyles[size], className)} {...props}>{children}</button>;
}
