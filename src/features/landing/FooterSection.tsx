import type { RouteKey } from "../../types/models";
import { navItems } from "./data";
import { scrollToSection } from "./primitives";

interface FooterSectionProps {
  navigate: (route: RouteKey) => void;
}

const accessLinks = [
  { label: "Create account", route: "register" as const },
  { label: "Sign in", route: "login" as const },
  { label: "Instructor workspace", route: "login" as const },
  { label: "All scenarios", route: "scenarios" as const },
];

export function FooterSection({ navigate }: FooterSectionProps) {
  return (
    <footer className="border-t border-slate/10 bg-white">
      <div className="mx-auto max-w-[1240px] px-6 py-16 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-extrabold tracking-tight text-navy">
              BA-VES
            </p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate">
              AI-Powered Multi-Domain BA Simulation
            </p>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate">
              Mô phỏng doanh nghiệp ảo đa tác tử cho đào tạo Business Analysis theo chuẩn BABOK®.
            </p>
          </div>

          <nav aria-label="Explore">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate">Khám phá</p>
            <ul className="mt-4 space-y-2.5">
              {navItems.map((item) => (
                <li key={item.section}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(item.section)}
                    className="text-sm font-medium text-slate transition-colors hover:text-navy"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Access">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate">Truy cập</p>
            <ul className="mt-4 space-y-2.5">
              {accessLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => navigate(link.route)}
                    className="text-sm font-medium text-slate transition-colors hover:text-navy"
                  >
                    {link.label === "Create account" ? "Đăng ký tài khoản" : link.label === "Sign in" ? "Đăng nhập" : link.label === "Instructor workspace" ? "Không gian giảng viên" : "Tất cả kịch bản"}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-slate/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate">
            © 2026 BA-VES. All rights reserved.
          </p>
          <p className="text-xs text-slate/70">
            Nền tảng đào tạo Business Analysis ứng dụng AI Đa tác tử & Chuẩn BABOK®.
          </p>
        </div>
      </div>
    </footer>
  );
}