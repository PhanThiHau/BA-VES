import { useState } from "react";
import type { RouteKey } from "../../types/models";
import { contextThemes, babokKnowledgeAreas, type BabokArea } from "./data";
import { Reveal } from "./Reveal";
import { Photo } from "./Photo";
import { Eyebrow } from "./primitives";
import {
  Compass,
  MessagesSquare,
  Layers,
  Target,
  FileCheck,
  Award,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Users,
  Bot,
  Zap,
  BookOpen,
  Check,
  Building2,
  Scale,
  Activity,
} from "lucide-react";

interface ContextSectionProps {
  navigate: (route: RouteKey) => void;
}

export function ContextSection({ navigate }: ContextSectionProps) {
  const [activeThemeIdx, setActiveThemeIdx] = useState(0);
  const [selectedKaId, setSelectedKaId] = useState<string>("ec"); // Default to Elicitation & Collaboration

  const activeTheme = contextThemes[activeThemeIdx];
  const selectedKa = babokKnowledgeAreas.find((k) => k.id === selectedKaId) || babokKnowledgeAreas[1];

  const renderKaIcon = (iconName: string, className = "h-5 w-5") => {
    switch (iconName) {
      case "Compass":
        return <Compass className={className} />;
      case "MessagesSquare":
        return <MessagesSquare className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "Target":
        return <Target className={className} />;
      case "FileCheck":
        return <FileCheck className={className} />;
      case "Award":
        return <Award className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

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
            <div className="inline-flex items-center gap-2 rounded-full border border-brass/30 bg-brass/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-brass backdrop-blur-sm shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Chuẩn Quốc Tế IIBA® BABOK® v3 · AI Virtual Enterprise</span>
            </div>

            <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl">
              Bối cảnh Dự án & Chuẩn BABOK®
            </h2>

            <p className="mt-5 text-base leading-relaxed text-slate sm:text-lg">
              Lý thuyết sách vở chỉ là bước xuất phát điểm. Trong doanh nghiệp thực tế, thách thức cốt lõi của một Business Analyst là đối mặt với các bên liên quan bất đồng quyền lợi, dữ liệu ẩn và đưa ra quyết định chịu trách nhiệm trước rủi ro vận hành.
            </p>
          </div>
        </Reveal>

        {/* 4 Value Pillars Micro-Stats Banner */}
        <Reveal delay={60}>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <div className="group rounded-2xl border border-mist/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy group-hover:bg-brass/15 group-hover:text-brass transition-colors">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-extrabold text-navy sm:text-xl">6/6 Vùng Tri Thức</div>
                  <div className="text-xs font-medium text-slate">Chuẩn hóa IIBA® BABOK® v3</div>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-mist/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy group-hover:bg-brass/15 group-hover:text-brass transition-colors">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-extrabold text-navy sm:text-xl">Multi-Agent AI</div>
                  <div className="text-xs font-medium text-slate">Tác tử có mục tiêu đối lập</div>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-mist/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy group-hover:bg-brass/15 group-hover:text-brass transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-extrabold text-navy sm:text-xl">4 Miền Nghiệp Vụ</div>
                  <div className="text-xs font-medium text-slate">FinTech · Logistics · Y Tế · EdTech</div>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-mist/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brass/40 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-navy group-hover:bg-brass/15 group-hover:text-brass transition-colors">
                  <Scale className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-display text-lg font-extrabold text-navy sm:text-xl">Hiệu Chuẩn Kép</div>
                  <div className="text-xs font-medium text-slate">AI Rubric + Giảng viên đối soát</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* =========================================================================
            SECTION PART 1: 3-PILLAR INTERACTIVE SPOTLIGHT SHOWCASE
           ========================================================================= */}
        <div className="mt-16 lg:mt-24">
          <Reveal>
            <div className="flex flex-col items-center justify-between gap-4 border-b border-mist/80 pb-6 sm:flex-row">
              <div>
                <Eyebrow tone="brass">Trụ cột mô phỏng</Eyebrow>
                <h3 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                  3 Đột Phá Đào Tạo Thực Chiến BA-VES
                </h3>
              </div>

              {/* Theme Tab Selector */}
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-mist/80">
                {contextThemes.map((theme, idx) => {
                  const isActive = idx === activeThemeIdx;
                  return (
                    <button
                      key={theme.index}
                      type="button"
                      onClick={() => setActiveThemeIdx(idx)}
                      className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm cursor-pointer ${
                        isActive
                          ? "bg-navy text-white shadow-md shadow-navy/20"
                          : "text-slate hover:bg-offwhite hover:text-navy"
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ${isActive ? "bg-brass text-navy-deep font-bold" : "bg-mist/50 text-slate"}`}>
                        {theme.index}
                      </span>
                      <span>{theme.tabLabel || theme.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Active Theme Spotlight Card */}
          <div className="mt-8">
            <Reveal variant="up">
              <div className="overflow-hidden rounded-3xl border border-mist/80 bg-white shadow-xl shadow-navy/5 transition-all lg:grid lg:grid-cols-12">
                {/* Left Content Area */}
                <div className="flex flex-col justify-between p-7 sm:p-10 lg:col-span-7">
                  <div>
                    {/* Header tags */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-full bg-brass/15 px-3 py-1 text-xs font-bold text-brass">
                        {activeTheme.badge || "Enterprise Theme"}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate">
                        Trụ cột {activeTheme.index} / 03
                      </span>
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
        </div>

        {/* =========================================================================
            SECTION PART 2: BABOK® 6 KNOWLEDGE AREAS MATRIX INTERACTIVE EXPLORER
           ========================================================================= */}
        <div className="mt-24 lg:mt-32">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 rounded-full border border-navy/20 bg-navy/5 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-navy">
                <Compass className="h-3.5 w-3.5 text-brass" />
                <span>6 Vùng Tri Thức BABOK® v3 (Knowledge Areas)</span>
              </div>
              <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl lg:text-4xl">
                Khám phá Ma Trận Kỹ Năng BABOK® trong BA-VES
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
                Mỗi kỹ năng trong chuẩn BABOK® của Viện Phân tích Nghiệp vụ Quốc tế (IIBA®) đều được tích hợp sâu vào các nhiệm vụ thực hành và kịch bản đối thoại AI.
              </p>
            </div>
          </Reveal>

          {/* 6 Knowledge Areas Grid */}
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {babokKnowledgeAreas.map((ka) => {
              const isSelected = ka.id === selectedKaId;
              return (
                <div
                  key={ka.id}
                  onClick={() => setSelectedKaId(ka.id)}
                  className={`group relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? "border-2 border-brass bg-white shadow-xl shadow-brass/10 -translate-y-1"
                      : "border border-mist/80 bg-white/80 hover:bg-white hover:border-brass/40 hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  <div>
                    {/* Top Meta row */}
                    <div className="flex items-center justify-between">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-mono font-extrabold ${
                        isSelected ? "bg-brass text-navy-deep" : "bg-navy/5 text-navy group-hover:bg-brass/20 group-hover:text-brass"
                      }`}>
                        {ka.code}
                      </span>
                      <span className="rounded-full bg-offwhite px-2.5 py-0.5 text-[11px] font-semibold text-slate border border-mist/60">
                        {ka.badge}
                      </span>
                    </div>

                    {/* Icon and Titles */}
                    <div className="mt-4 flex items-start gap-3.5">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                        isSelected ? "bg-navy text-brass shadow-md shadow-navy/20" : "bg-offwhite text-navy group-hover:bg-navy group-hover:text-brass"
                      }`}>
                        {renderKaIcon(ka.iconName)}
                      </div>
                      <div>
                        <h4 className="font-display text-base font-bold text-navy group-hover:text-brass transition-colors">
                          {ka.nameVi}
                        </h4>
                        <p className="text-[11px] italic text-slate line-clamp-1">{ka.nameEn}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs leading-relaxed text-slate line-clamp-2">
                      {ka.description}
                    </p>

                    {/* Tasks list preview */}
                    <div className="mt-4 space-y-1.5 border-t border-mist/60 pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brass">
                        Nhiệm vụ mô phỏng BA:
                      </span>
                      {ka.tasks.map((task, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-2 text-xs text-navy/90">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brass" />
                          <span className="line-clamp-1">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables Footer */}
                  <div className="mt-5 rounded-xl bg-offwhite/80 p-2.5 border border-mist/60 text-xs">
                    <span className="font-bold text-navy">Sản phẩm đầu ra: </span>
                    <span className="text-slate font-medium">{ka.deliverables}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Selected KA Spotlight Details Drawer */}
          {selectedKa && (
            <Reveal variant="up">
              <div className="mt-8 rounded-3xl border border-brass/30 bg-gradient-to-r from-navy via-navy to-navy-deep p-6 text-white shadow-xl sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-md bg-brass px-2.5 py-0.5 text-xs font-mono font-extrabold text-navy-deep">
                        {selectedKa.code}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-brass">
                        Vùng tri thức đang chọn
                      </span>
                    </div>

                    <h4 className="mt-2 font-display text-xl font-bold sm:text-2xl">
                      {selectedKa.nameVi} — <span className="text-mist font-normal text-lg sm:text-xl italic">{selectedKa.nameEn}</span>
                    </h4>

                    <p className="mt-2 text-sm leading-relaxed text-mist/90">
                      {selectedKa.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brass">Hồ sơ bàn giao:</span>
                      <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-white border border-white/10">
                        📄 {selectedKa.deliverables}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate("scenario-detail")}
                      className="group inline-flex items-center gap-2 rounded-xl bg-brass px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-deep shadow-lg transition-all hover:bg-brass/90"
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