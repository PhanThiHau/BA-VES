import { useEffect, useState } from "react";
import AOS from "aos";
import { ArrowUp } from "lucide-react";
import type { RouteKey } from "../../types/models";
import { LandingNav } from "./LandingNav";
import { HeroSection } from "./HeroSection";
import { ContextSection } from "./ContextSection";
import { WhySection } from "./WhySection";
import { JourneySection } from "./JourneySection";
import { ScenarioSection } from "./ScenarioSection";
import { WorkspacesSection } from "./WorkspacesSection";
import { CtaSection } from "./CtaSection";
import { FooterSection } from "./FooterSection";
import { useScrollProgress, useScrolledPast } from "./hooks";

function ScrollToTopWidget() {
  const visible = useScrolledPast(100);
  const progress = useScrollProgress();
  const [isHovered, setIsHovered] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const radius = 15;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-400 ease-out ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center gap-2 rounded-xl bg-navy/95 p-2 text-white shadow-xl shadow-navy/30 backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-brass hover:text-navy-deep hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
        aria-label="Cuộn lên đầu trang"
        title="Cuộn lên đầu trang"
      >
        <div className="relative flex h-8 w-8 items-center justify-center">
          <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              className="stroke-white/20"
              strokeWidth="2.5"
            />
            <circle
              cx="18"
              cy="18"
              r={radius}
              fill="none"
              className="stroke-brass group-hover:stroke-navy-deep transition-all duration-150 ease-out"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowUp className="h-4 w-4 text-brass group-hover:text-navy-deep transition-transform duration-300 group-hover:-translate-y-0.5" />
          </div>
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out whitespace-nowrap text-xs font-bold ${
            isHovered ? "max-w-28 pr-2 opacity-100" : "max-w-0 pr-0 opacity-0"
          }`}
        >
          <span>Lên đầu</span>
          <span className="ml-1 opacity-80">{Math.round(progress)}%</span>
        </div>
      </button>
    </div>
  );
}

export function LandingPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: "ease-in-out",
      once: true,
      mirror: false,
      offset: 80,
    });
    AOS.refresh();
  }, []);

  return (
    <div className="relative min-h-[100dvh] overflow-x-clip bg-white font-sans text-navy">
      <LandingNav navigate={navigate} />
      <main>
        <HeroSection navigate={navigate} />
        <ContextSection navigate={navigate} />
        <WhySection />
        <JourneySection />
        <ScenarioSection navigate={navigate} />
        <WorkspacesSection navigate={navigate} />
        <CtaSection navigate={navigate} />
      </main>
      <FooterSection navigate={navigate} />
      <ScrollToTopWidget />
    </div>
  );
}