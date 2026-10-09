import { useState } from "react";
import { journeySteps } from "./data";
import { Reveal } from "./Reveal";
import { Eyebrow } from "./primitives";
import {
  FileText,
  MessagesSquare,
  Zap,
  FileCheck,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function JourneySection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const currentStep = journeySteps[activeIdx];

  const getStepIcon = (name?: string, active = false) => {
    const cls = `h-5 w-5 ${active ? "text-brass" : "text-slate"}`;
    switch (name) {
      case "FileText":
        return <FileText className={cls} />;
      case "MessagesSquare":
        return <MessagesSquare className={cls} />;
      case "Zap":
        return <Zap className={cls} />;
      case "FileCheck":
        return <FileCheck className={cls} />;
      case "Award":
        return <Award className={cls} />;
      default:
        return <Sparkles className={cls} />;
    }
  };

  const handlePrev = () => {
    setActiveIdx((prev) => (prev > 0 ? prev - 1 : journeySteps.length - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev < journeySteps.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="journey" className="scroll-mt-20 bg-offwhite py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        {/* Header */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow tone="brass">Quy trình đào tạo 5 bước</Eyebrow>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
              Hành trình mô phỏng chuẩn BABOK®
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate sm:text-base">
              Năm giai đoạn tinh gọn giúp học viên trải nghiệm trọn vẹn chu trình làm việc của một Business Analyst thực thụ.
            </p>
          </div>
        </Reveal>

        {/* Stepper Tabs Bar */}
        <div className="mt-12">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-5">
            {journeySteps.map((step, idx) => {
              const isActive = idx === activeIdx;
              return (
                <button
                  key={step.index}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`group relative flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200 sm:flex-col sm:items-start sm:p-4 ${
                    isActive
                      ? "border-navy bg-navy text-white shadow-md"
                      : "border-slate/15 bg-white text-navy hover:border-slate/30 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span
                      className={`font-display text-xs font-black tracking-wider ${
                        isActive ? "text-brass" : "text-slate"
                      }`}
                    >
                      {step.index}
                    </span>
                    <div className="hidden sm:block">
                      {getStepIcon(step.icon, isActive)}
                    </div>
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isActive ? "text-white" : "text-navy"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`mt-0.5 line-clamp-1 text-[11px] ${
                        isActive ? "text-mist/80" : "text-slate"
                      }`}
                    >
                      {step.babokArea}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Step Spotlight Card */}
        <div className="mt-6">
          <div className="overflow-hidden rounded-3xl border border-slate/15 bg-white shadow-xl transition-all duration-300">
            <div className="grid items-center gap-8 p-6 lg:grid-cols-12 lg:gap-12 lg:p-10">
              {/* Left Column: Details & Navigation */}
              <div className="flex flex-col justify-between lg:col-span-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-navy px-3 py-1 font-display text-xs font-bold text-white">
                      Bước {currentStep.index} / 05
                    </span>
                    <span className="rounded-full bg-brass/15 px-3 py-1 text-xs font-bold text-brass">
                      {currentStep.label}
                    </span>
                    {currentStep.babokArea && (
                      <span className="text-xs font-medium text-slate">
                        · {currentStep.babokArea}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                    {currentStep.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
                    {currentStep.body}
                  </p>

                  {/* Output Box */}
                  {currentStep.keyOutcome && (
                    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brass/25 bg-brass/5 p-4 text-xs text-navy">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                      <div>
                        <strong className="block font-bold text-brass">
                          Kết quả đầu ra dự kiến:
                        </strong>
                        <span className="mt-0.5 block text-slate">
                          {currentStep.keyOutcome}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Step Navigator Bar */}
                <div className="mt-8 flex items-center justify-between border-t border-slate/10 pt-6">
                  <div className="flex items-center gap-2">
                    {journeySteps.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveIdx(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === activeIdx
                            ? "w-7 bg-navy"
                            : "w-2 bg-slate/25 hover:bg-slate/40"
                        }`}
                        aria-label={`Chuyển tới bước ${i + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate/20 text-navy transition-colors hover:bg-slate-100"
                      aria-label="Bước trước"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-bold text-slate">
                      {activeIdx + 1} / {journeySteps.length}
                    </span>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-navy text-white transition-colors hover:bg-navy-deep"
                      aria-label="Bước tiếp theo"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Stage Image */}
              <div className="relative overflow-hidden rounded-2xl border border-slate/10 lg:col-span-6">
                <img
                  key={currentStep.index}
                  src={currentStep.image}
                  alt={currentStep.imageAlt}
                  className="aspect-[16/10] w-full object-cover transition-all duration-500 hover:scale-[1.02]"
                />
                <div className="absolute bottom-3 left-3 rounded-full bg-navy/85 px-3.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                  Giai đoạn: {currentStep.label} · {currentStep.index}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}