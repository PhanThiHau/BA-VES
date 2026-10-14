import { useState } from "react";
import type { RouteKey } from "../../types/models";
import { contextThemes, babokKnowledgeAreas } from "./data";
import { Reveal } from "./Reveal";
import { Photo } from "./Photo";
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface ContextSectionProps {
  navigate: (route: RouteKey) => void;
}

export function ContextSection({ navigate }: ContextSectionProps) {
  const [activeThemeIdx, setActiveThemeIdx] = useState(0);
  const [selectedKaId, setSelectedKaId] = useState<string>("ec"); // Default to Elicitation & Collaboration

  const handlePrevTheme = () => {
    setActiveThemeIdx((prev) => (prev > 0 ? prev - 1 : contextThemes.length - 1));
  };

  const handleNextTheme = () => {
    setActiveThemeIdx((prev) => (prev < contextThemes.length - 1 ? prev + 1 : 0));
  };

  const activeTheme = contextThemes[activeThemeIdx];
  const selectedKa = babokKnowledgeAreas.find((k) => k.id === selectedKaId) || babokKnowledgeAreas[1];



  return (
    <section id="context" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-offwhite via-white to-offwhite py-24 lg:py-32">
      {/* Background Subtle Accent Gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_rgba(197,139,82,0.08)_0%,_transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 top-1/3 h-96 w-96 rounded-full bg-mist/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 bottom-1/4 h-96 w-96 rounded-full bg-brass/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* Section Header */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl">
              Bối cảnh Dự án & Chuẩn BABOK®
            </h2>

            <p className="mt-5 text-base leading-relaxed text-slate sm:text-lg">
              Lý thuyết sách vở chỉ là bước xuất phát điểm. Trong doanh nghiệp thực tế, thách thức cốt lõi của một Business Analyst là đối mặt với các bên liên quan bất đồng quyền lợi, dữ liệu ẩn và đưa ra quyết định chịu trách nhiệm trước rủi ro vận hành.
            </p>
          </div>
        </Reveal>

        {/* =========================================================================
            SECTION PART 1: 3-PILLAR INTERACTIVE SPOTLIGHT SLIDER
           ========================================================================= */}
        <div className="mt-12 lg:mt-16">
          <Reveal variant="up">
            <div className="overflow-hidden rounded-3xl border border-mist/80 bg-white shadow-xl shadow-navy/5 transition-all lg:grid lg:grid-cols-12">
              {/* Left Content Area */}
              <div className="flex flex-col justify-between p-7 sm:p-10 lg:col-span-7">
                <div>
                  {/* Header tags with Slider Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mist/60 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-brass/15 px-3 py-1 text-xs font-bold text-brass">
                        {activeTheme.badge || "Enterprise Theme"}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate">
                        Trụ cột {activeTheme.index} / 03
                      </span>
                    </div>

                    {/* Compact Slider Arrow Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevTheme}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-mist bg-offwhite text-navy transition-all hover:border-brass hover:bg-brass/10 hover:text-brass cursor-pointer"
                        title="Trụ cột trước"
                        aria-label="Trụ cột trước"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="text-[11px] font-mono font-bold text-slate px-1">
                        {activeTheme.index} / 03
                      </span>
                      <button
                        type="button"
                        onClick={handleNextTheme}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-mist bg-offwhite text-navy transition-all hover:border-brass hover:bg-brass/10 hover:text-brass cursor-pointer"
                        title="Trụ cột tiếp theo"
                        aria-label="Trụ cột tiếp theo"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                    <h4 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                      {activeTheme.title}
                    </h4>
                    {activeTheme.tagline && (
                      <p className="mt-1 text-sm font-semibold text-brass sm:text-base">
                        {activeTheme.tagline}
                      </p>
                    )}

                    <p className="mt-4 text-sm leading-relaxed text-slate sm:text-base">
                      {activeTheme.body}
                    </p>

                    {/* DYNAMIC WIDGETS BASED ON THEME */}
                    {/* Theme 01: Comparison Widget */}
                    {activeThemeIdx === 0 && activeTheme.comparison && (
                      <div className="mt-6 space-y-3 rounded-2xl bg-offwhite/80 p-5 border border-mist/70">
                        <div className="flex items-start gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xs font-bold">
                            ✕
                          </span>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Cách học tĩnh thông thường</span>
                            <p className="mt-0.5 text-xs text-slate sm:text-sm">
                              {activeTheme.comparison.traditional}
                            </p>
                          </div>
                        </div>

                        <div className="h-px w-full bg-mist/60" />

                        <div className="flex items-start gap-3">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            ✓
                          </span>
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Đột phá mô phỏng BA-VES</span>
                            <p className="mt-0.5 text-xs text-navy sm:text-sm font-medium">
                              {activeTheme.comparison.baves}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Theme 02: Stakeholder Personas & Conflicts Widget */}
                    {activeThemeIdx === 1 && activeTheme.personas && (
                      <div className="mt-6 space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-brass">
                          Hồ sơ tác tử AI & Xung đột mục tiêu thực tế
                        </p>
                        <div className="grid gap-2 sm:grid-cols-3">
                          {activeTheme.personas.map((persona, pIdx) => (
                            <div
                              key={pIdx}
                              className="rounded-2xl border border-mist/80 bg-offwhite/70 p-3.5 transition-all hover:border-brass/40 hover:bg-white"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-navy truncate">{persona.name}</span>
                                <span className="rounded bg-navy/5 px-1.5 py-0.5 text-[10px] font-semibold text-brass shrink-0">
                                  {persona.badge}
                                </span>
                              </div>
                              <p className="text-[11px] font-medium text-slate mt-0.5">{persona.role}</p>
                              <p className="mt-2 text-xs italic text-navy/80 line-clamp-3">
                                &ldquo;{persona.quote}&rdquo;
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Theme 03: Rubric & Evidence Widget */}
                    {activeThemeIdx === 2 && activeTheme.rubricItems && (
                      <div className="mt-6 space-y-2.5">
                        <p className="text-xs font-bold uppercase tracking-wider text-brass">
                          Bộ tiêu chí Rubric đối soát chuẩn BABOK® v3
                        </p>
                        <div className="space-y-2">
                          {activeTheme.rubricItems.map((item, rIdx) => (
                            <div
                              key={rIdx}
                              className="flex items-center justify-between gap-3 rounded-xl border border-mist/80 bg-offwhite/70 px-4 py-2.5"
                            >
                              <div>
                                <span className="text-xs font-bold text-navy sm:text-sm">{item.title}</span>
                                <p className="text-[11px] text-slate">{item.desc}</p>
                              </div>
                              <span className="shrink-0 rounded-full bg-navy/10 px-2.5 py-1 text-[11px] font-extrabold text-navy">
                                {item.weight}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Stats & Actions */}
                  <div className="mt-8 border-t border-mist/70 pt-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {activeTheme.tags?.map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 rounded-full bg-mist/30 px-3 py-1 text-xs font-medium text-slate"
                          >
                            <Check className="h-3 w-3 text-brass" />
                            {t}
                          </span>
                        ))}
                      </div>

                      {/* Action Button */}
                      {activeTheme.linkLabel && activeTheme.route && (
                        <button
                          type="button"
                          onClick={() => navigate(activeTheme.route!)}
                          className="group inline-flex items-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-navy-deep hover:shadow-md"
                        >
                          <span>{activeTheme.linkLabel}</span>
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Image & Visual Preview Area */}
                <div className="relative bg-navy-deep p-6 sm:p-10 lg:col-span-5 flex flex-col justify-center">
                  <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/10 group">
                    <Photo
                      src={activeTheme.image}
                      alt={activeTheme.imageAlt}
                      ratio="aspect-[4/3]"
                      className="transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-navy-deep/20 to-transparent pointer-events-none" />

                    {/* Slider Navigation Arrows Over Image */}
                    <button
                      type="button"
                      onClick={handlePrevTheme}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-navy/85 text-white backdrop-blur-md border border-white/25 transition-all hover:bg-brass hover:text-navy-deep shadow-xl hover:scale-110 cursor-pointer"
                      title="Lướt sang trụ cột trước"
                      aria-label="Lướt sang trụ cột trước"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleNextTheme}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-navy/85 text-white backdrop-blur-md border border-white/25 transition-all hover:bg-brass hover:text-navy-deep shadow-xl hover:scale-110 cursor-pointer"
                      title="Lướt sang trụ cột tiếp theo"
                      aria-label="Lướt sang trụ cột tiếp theo"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Floating Chip Top-Left */}
                    <div className="absolute left-4 top-4 rounded-full bg-navy-deep/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Mô phỏng doanh nghiệp thời gian thực</span>
                    </div>

                    {/* Floating Chip Bottom-Right */}
                    <div className="absolute bottom-4 right-4 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-extrabold text-navy shadow-lg backdrop-blur-md border border-mist flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-brass" />
                      <span>Chuẩn IIBA® BABOK®</span>
                    </div>

                    {/* Slider Indicator Dots at Bottom Center */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full bg-navy-deep/80 px-2.5 py-1 backdrop-blur-md border border-white/20">
                      {contextThemes.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveThemeIdx(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === activeThemeIdx ? "w-5 bg-brass" : "w-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                          aria-label={`Trụ cột ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Quick Stat Counter Cards under image */}
                  {activeTheme.stats && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      {activeTheme.stats.map((st, sIdx) => (
                        <div key={sIdx} className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm border border-white/10">
                          <div className="font-display text-lg font-extrabold text-white">{st.value}</div>
                          <div className="text-[11px] font-medium text-mist/80">{st.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

        {/* =========================================================================
            SECTION PART 2: BABOK® 6 KNOWLEDGE AREAS & VIDEO REEL SHOWCASE
           ========================================================================= */}
        <div className="mt-24 lg:mt-32">
          <Reveal>
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-navy/20 bg-navy/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-navy">
                <Compass className="h-3.5 w-3.5 text-brass" />
                <span>6 Vùng Tri Thức BABOK® v3 · Thực Hành Đa Tác Tử AI</span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl lg:text-4xl">
                Khám phá Ma Trận Kỹ Năng BABOK® trong BA-VES
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base max-w-2xl mx-auto">
                Trực quan hóa lộ trình thực hành chuẩn IIBA® qua mô phỏng tác tử AI sống động. Dễ dàng theo dõi mục tiêu, kỹ năng cốt lõi và hồ sơ bàn giao thực tế.
              </p>
            </div>
          </Reveal>

          {/* AUTO-SCROLLING MARQUEE REEL (Runs Permanently & Automatically) */}
          <div className="mt-8">

            {/* Infinite Marquee Container */}
            <div className="relative overflow-hidden py-4 -mx-6 px-6 lg:-mx-10 lg:px-10">
              {/* Side Fade Gradients for smooth infinite look */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-offwhite to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-offwhite to-transparent" />

              <div className="animate-marquee flex gap-5">
                {/* Render 2 sets of cards to create a seamless infinite loop */}
                {[...babokKnowledgeAreas, ...babokKnowledgeAreas].map((ka, idx) => {
                  const isSelected = ka.id === selectedKaId;
                  return (
                    <div
                      key={`${ka.id}-${idx}`}
                      onClick={() => setSelectedKaId(ka.id)}
                      className={`group relative flex w-[300px] sm:w-[340px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "border-2 border-brass bg-white shadow-xl shadow-brass/15 scale-[1.02]"
                          : "border border-mist/80 bg-white/95 hover:bg-white hover:border-brass/50 hover:shadow-lg hover:-translate-y-1"
                      }`}
                    >
                      {/* Card Image Banner */}
                      <div className="relative h-32 w-full overflow-hidden bg-navy">
                        {ka.image ? (
                          <img
                            src={ka.image}
                            alt={ka.nameVi}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-navy to-navy-deep" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />

                        {/* Code and Category Badges */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                          <span className="rounded-lg bg-brass px-2.5 py-0.5 text-xs font-mono font-extrabold text-navy-deep shadow-sm">
                            {ka.code}
                          </span>
                          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-navy backdrop-blur-sm border border-white/20">
                            {ka.badge}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                        <div>
                          <h4 className="font-display text-base font-bold text-navy group-hover:text-brass transition-colors line-clamp-1">
                            {ka.nameVi}
                          </h4>
                          <p className="text-[11px] italic text-slate line-clamp-1">{ka.nameEn}</p>

                          <p className="mt-2 text-xs leading-relaxed text-slate line-clamp-2">
                            {ka.shortDesc || ka.description}
                          </p>

                          {/* Crisp Skill Tags */}
                          {ka.tags && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {ka.tags.map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="rounded-md bg-offwhite px-2 py-0.5 text-[10px] font-semibold text-navy/80 border border-mist/60"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="mt-4 flex items-center justify-between border-t border-mist/50 pt-3 text-[11px]">
                          <span className="font-bold text-navy group-hover:text-brass transition-colors">
                            {isSelected ? "Đang chọn vùng này" : "Bấm xem nhiệm vụ & đầu ra"}
                          </span>
                          <ArrowRight className={`h-3.5 w-3.5 text-brass transition-transform ${isSelected ? "translate-x-1" : "group-hover:translate-x-1"}`} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* INTERACTIVE SELECTED KA SPOTLIGHT DETAILS DRAWER */}
          {selectedKa && (
            <Reveal variant="up">
              <div className="mt-8 rounded-3xl border border-brass/40 bg-gradient-to-br from-navy via-navy to-navy-deep p-6 text-white shadow-2xl sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-md bg-brass px-2.5 py-0.5 text-xs font-mono font-extrabold text-navy-deep">
                        {selectedKa.code}
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-brass border border-brass/20">
                        {selectedKa.badge}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-mist/70">
                        Chi tiết vùng tri thức đang chọn
                      </span>
                    </div>

                    <h4 className="mt-3 font-display text-xl font-bold sm:text-2xl text-white">
                      {selectedKa.nameVi} — <span className="text-mist font-normal text-lg sm:text-xl italic">{selectedKa.nameEn}</span>
                    </h4>

                    <p className="mt-2 text-sm leading-relaxed text-mist/90">
                      {selectedKa.description}
                    </p>

                    {/* 3 Simulation Tasks in modern pills layout */}
                    <div className="mt-4 space-y-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brass">
                        Nhiệm vụ mô phỏng BA thực tế:
                      </span>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {selectedKa.tasks.map((task, tIdx) => (
                          <div
                            key={tIdx}
                            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white border border-white/10"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brass" />
                            <span className="line-clamp-2">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brass">Hồ sơ bàn giao:</span>
                      <span className="rounded-lg bg-brass/20 px-3 py-1 text-xs font-semibold text-white border border-brass/40">
                        📄 {selectedKa.deliverables}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("scenario-detail")}
                      className="group inline-flex items-center justify-center gap-2 rounded-xl bg-brass px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-navy-deep shadow-lg transition-all hover:bg-brass/90 hover:scale-102"
                    >
                      <span>Trải nghiệm mô phỏng ngay</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}