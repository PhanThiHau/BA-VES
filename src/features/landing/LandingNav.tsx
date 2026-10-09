import { useState } from "react";
import type { RouteKey } from "../../types/models";
import { navItems } from "./data";
import { scrollToSection } from "./primitives";
import { useReducedMotion, useScrolledPast } from "./hooks";

interface LandingNavProps {
  navigate: (route: RouteKey) => void;
}

export function LandingNav({ navigate }: LandingNavProps) {
  const scrolled = useScrolledPast(24);
  const [open, setOpen] = useState(false);

  const go = (route: RouteKey) => {
    setOpen(false);
    navigate(route);
  };

  const linkClass = (muted: boolean) =>
    `text-sm font-semibold tracking-tight transition-colors ${muted ? "hover:text-white max-lg:text-navy" : "hover:text-navy max-lg:text-navy"} ${scrolled ? "text-slate max-lg:text-navy lg:hover:text-navy" : "text-white/80 lg:hover:text-white"
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-slate/10 bg-white/95 backdrop-blur-md" : "border-b border-transparent bg-transparent"
        }`}
    >
      <div className="mx-auto flex h-18 max-w-[1360px] items-center justify-between px-6 py-4 lg:px-10">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex items-center gap-3 text-left"
          aria-label="BA-VES, back to top"
        >
          <span
            className={`grid h-10 w-10 place-items-center rounded-xl text-center font-display text-lg font-extrabold leading-none transition-colors ${scrolled ? "bg-navy text-white" : "bg-white text-navy"
              }`}
            aria-hidden="true"
          >
            B
          </span>
          <span className="hidden sm:block">
            <span className="flex items-center gap-2">
              <span className={`block font-display text-lg font-extrabold tracking-tight ${scrolled ? "text-navy" : "text-white"}`}>
                BA-VES
              </span>
              <span className="rounded-full bg-brass/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brass">
                FA26SE185
              </span>
            </span>
            <span className={`block text-[10px] font-semibold uppercase tracking-[0.16em] ${scrolled ? "text-slate" : "text-mist/80"}`}>
              Mô phỏng BA Đa tác tử AI
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Landing page sections">
          {navItems.map((item) => (
            <button
              key={item.section}
              type="button"
              onClick={() => scrollToSection(item.section)}
              className={linkClass(true)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            onClick={() => go("login")}
            className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors ${scrolled
                ? "border-navy/20 text-navy hover:border-navy/50"
                : "border-white/40 text-white hover:border-white/80"
              }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => go("register")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${scrolled
                ? "bg-navy text-white hover:bg-navy-deep"
                : "bg-white text-navy hover:bg-offwhite"
              }`}
          >
            Đăng ký
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className={`flex h-10 w-10 items-center justify-center lg:hidden ${scrolled ? "text-navy" : "text-white"
            }`}
        >
          <span className="relative block h-3.5 w-6">
            <span className={`absolute left-0 top-0 h-0.5 w-6 bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : ""}`} />
            <span className={`absolute left-0 top-1.5 h-0.5 w-6 bg-current transition-opacity duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-3 h-0.5 w-6 bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      <div
        className={`overflow-hidden bg-white transition-[max-height] duration-300 lg:hidden ${open ? "max-h-96 border-b border-slate/10" : "max-h-0"
          }`}
      >
        <nav className="space-y-1 px-6 py-5" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <button
              key={item.section}
              type="button"
              onClick={() => {
                setOpen(false);
                scrollToSection(item.section);
              }}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-base font-semibold text-navy"
            >
              {item.label}
            </button>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-slate/10 pt-4">
            <button
              type="button"
              onClick={() => go("login")}
              className="w-full rounded-full border border-navy/20 px-5 py-2.5 text-sm font-semibold text-navy"
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => go("register")}
              className="w-full rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white"
            >
              Đăng ký
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}