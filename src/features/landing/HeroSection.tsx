import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { RouteKey } from "../../types/models";
import { useParallax, useReducedMotion } from "./hooks";
import { scrollToSection } from "./primitives";

interface HeroSectionProps {
  navigate: (route: RouteKey) => void;
}

export function HeroSection({ navigate }: HeroSectionProps) {
  const photoRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [coarsePointer, setCoarsePointer] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCoarsePointer(window.matchMedia("(pointer: coarse)").matches);
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useParallax(photoRef, 0.14, reduced || coarsePointer);

  const enter = (delay: number): CSSProperties => ({ "--hero-delay": `${delay}ms` } as CSSProperties);
  const enterClass = ready ? "is-ready" : "";

  return (
    <section id="top" className="relative flex min-h-[92svh] items-end overflow-hidden bg-navy-deep text-white">
      <div ref={photoRef} className="hero-photo absolute inset-0" aria-hidden="true">
        <img
          src="/images/landing/hero.webp"
          alt=""
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

      <div
        className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/60 to-navy-deep/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-navy-deep/40"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1360px] px-6 pb-20 pt-36 lg:px-10 lg:pb-24">
        <div className="max-w-3xl">
          <div className={`hero-enter ${enterClass} flex flex-wrap items-center gap-2`} style={enter(0)}>
            <span className="rounded-full bg-brass/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-brass backdrop-blur-sm">
              FA26SE185 · GFA26SE16
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-mist/80">
              Chuẩn BABOK® · Mô phỏng Đa tác tử AI
            </span>
          </div>

          <h1
            className={`hero-enter ${enterClass} mt-5 font-display text-[clamp(2.3rem,5.5vw,4.2rem)] font-extrabold leading-[1.08] tracking-[-0.03em]`}
            style={enter(100)}
          >
            Mô phỏng doanh nghiệp ảo đa lĩnh vực cho <span className="text-brass">đào tạo Business Analysis</span>.
          </h1>

          <p
            className={`hero-enter ${enterClass} mt-6 max-w-2xl text-base leading-relaxed text-mist/90 sm:text-lg`}
            style={enter(200)}
          >
            Thu hẹp khoảng cách giữa lý thuyết BABOK và thực hành thực tế. Luyện tập khơi gợi yêu cầu với các tác tử AI đa vai trò, ứng phó biến động kinh doanh và hoàn thiện hồ sơ BA có thể kiểm chứng.
          </p>

          <div className={`hero-enter ${enterClass} mt-6 flex flex-wrap gap-2 text-xs text-mist/80`} style={enter(250)}>
            <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1">🤖 AI Multi-Agent</span>
            <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1">🌐 4 Lĩnh vực (Ngân hàng, Y tế, Logistics, Giáo dục)</span>
            <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1">⚡ Sự kiện kịch bản động</span>
            <span className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1">🎯 Đánh giá Rubric & Hiệu chuẩn</span>
          </div>

          <div className={`hero-enter ${enterClass} mt-9 flex flex-wrap items-center gap-4`} style={enter(300)}>
            <button
              type="button"
              onClick={() => navigate("scenarios")}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-navy transition-colors hover:bg-offwhite"
            >
              Vào không gian mô phỏng
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("journey")}
              className="rounded-full border border-white/40 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Cách thức hoạt động
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}