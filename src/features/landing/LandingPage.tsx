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

export function LandingPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-white font-sans text-navy">
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
    </div>
  );
}