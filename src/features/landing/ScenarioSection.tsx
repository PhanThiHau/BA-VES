import type { RouteKey } from "../../types/models";
import { scenarioChallenges, scenarioFacts } from "./data";
import { scenarioObjectives, conflicts } from "../../constants/trainingScenario";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./primitives";

interface ScenarioSectionProps {
  navigate: (route: RouteKey) => void;
}

export function ScenarioSection({ navigate }: ScenarioSectionProps) {
  const openConflict = conflicts.find((c) => c.status === "open");

  return (
    <section id="scenario" className="scroll-mt-20 bg-navy py-24 text-white lg:py-32">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <div className="grid items-end gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal variant="up">
              <Eyebrow tone="brass">Kịch bản mô phỏng đa miền</Eyebrow>
              <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight lg:text-5xl">
                {scenarioFacts.heading}
              </h2>
              <p className="mt-6 font-display text-xl font-semibold leading-snug tracking-tight text-mist">
                {scenarioFacts.tagline}
              </p>

              <ul className="mt-9 space-y-4">
                {scenarioChallenges.map((item) => (
                  <li key={item.label} className="flex gap-4">
                    <span aria-hidden="true" className="mt-2 h-px w-6 shrink-0 bg-brass" />
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-mist/70">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => navigate("scenario-detail")}
                className="group mt-10 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-navy transition-colors hover:bg-offwhite"
              >
                Vào kịch bản mô phỏng
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </button>
            </Reveal>
          </div>

          <Reveal variant="right" className="lg:col-start-6 lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-white/15">
              <img
                src="/images/landing/scenario-warehouse.webp"
                alt="Distribution centre where the Supply Chain Inventory Management scenario plays out"
                loading="lazy"
                decoding="async"
                className="aspect-[16/10] h-full w-full object-cover"
              />
              <span className="absolute bottom-4 left-4 rounded-full bg-navy-deep/80 px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur">
                {scenarioFacts.company} · {scenarioFacts.code}
              </span>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 lg:mt-16">
          <Reveal variant="up">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-mist/60">
              Mục tiêu đo lường · Căn cứ theo bằng chứng phỏng vấn (Baseline → Target)
            </p>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/15 lg:grid-cols-4">
              {scenarioObjectives.map((objective) => (
                <div key={objective.label} className="bg-navy-deep/80 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist/60">{objective.label}</p>
                  <p className="mt-2 font-display text-lg font-extrabold tracking-tight">
                    {objective.baseline} <span className="text-brass">→</span> {objective.target}
                  </p>
                  <p className="mt-1.5 text-xs text-mist/60">{objective.owner}</p>
                </div>
              ))}
            </div>
            {openConflict && (
              <p className="mt-5 text-sm leading-relaxed text-mist/70">
                <span className="font-semibold text-brass">Xung đột đang mở — </span>
                {openConflict.topic}. Ngưỡng phê duyệt và quy tắc ưu tiên theo phân loại SKU chưa được định nghĩa rõ ràng.
              </p>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}