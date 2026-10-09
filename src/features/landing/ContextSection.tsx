import type { RouteKey } from "../../types/models";
import { contextThemes } from "./data";
import { Reveal } from "./Reveal";
import { Photo } from "./Photo";
import { Eyebrow } from "./primitives";

interface ContextSectionProps {
  navigate: (route: RouteKey) => void;
}

export function ContextSection({ navigate }: ContextSectionProps) {
  return (
    <section id="context" className="scroll-mt-20 bg-offwhite py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow tone="brass">Bối cảnh dự án & Chuẩn BABOK®</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl">
              Thực tế phân tích nghiệp vụ trong doanh nghiệp.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate sm:text-lg">
              Lý thuyết sách vở là bước khởi đầu. Thử thách thực sự nằm ở các bên liên quan bất đồng quan điểm, thông tin bị phân tán và quyết định mang hệ quả vận hành thực tế.
            </p>
          </div>
        </Reveal>

        <div className="mt-20 space-y-20 lg:mt-28 lg:space-y-28">
          {contextThemes.map((theme, i) => {
            const flip = i % 2 === 1;
            return (
              <article key={theme.index} className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
                <Reveal
                  variant={flip ? "right" : "left"}
                  className={`relative ${flip ? "lg:col-start-7 lg:col-span-6" : "lg:col-span-6"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none absolute -top-12 select-none font-display text-8xl font-extrabold leading-none ${flip ? "-right-2 text-navy/5" : "-left-2 text-navy/5"
                      }`}
                  >
                    {theme.index}
                  </span>
                  <Photo src={theme.image} alt={theme.imageAlt} ratio={theme.imageRatio} className="rounded-2xl shadow-2xl" />
                </Reveal>

                <div className={`${flip ? "lg:col-span-5" : "lg:col-start-7 lg:col-span-5"}`}>
                  <Reveal variant="up" delay={80}>
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brass">
                      {theme.index} / Enterprise theme
                    </p>
                    <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy lg:text-3xl">
                      {theme.title}
                    </h3>
                    <p className="mt-4 leading-relaxed text-slate">{theme.body}</p>
                    {theme.route && theme.linkLabel && (
                      <button
                        type="button"
                        onClick={() => navigate(theme.route!)}
                        className="group mt-5 inline-flex items-center gap-2 text-sm font-bold text-navy"
                      >
                        <span className="border-b-2 border-brass pb-0.5 transition-colors group-hover:border-navy">
                          {theme.linkLabel}
                        </span>
                        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </button>
                    )}
                  </Reveal>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}