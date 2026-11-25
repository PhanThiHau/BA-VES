import { useState, type ReactNode } from "react";
import type { RouteKey } from "../../types/models";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ScenarioWorkflowBar } from "./ScenarioWorkflowBar";
import { useApp } from "../../contexts/AppContext";

export function MainLayout({
  route,
  navigate,
  children,
}: {
  route: RouteKey;
  navigate: (route: RouteKey) => void;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { role } = useApp();

  const isScenarioRoute =
    role === "learner" &&
    ["scenario-detail", "planning", "simulation", "analysis", "artifacts", "docs", "assessment"].includes(route);

  return (
    <div className="min-h-[100dvh] bg-[#f2f6fa] text-navy font-sans selection:bg-brass/25 selection:text-navy">
      <Sidebar
        active={route}
        navigate={navigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />
      <div className="lg:pl-64 flex min-h-[100dvh] flex-col">
        <Header onMenu={() => setMenuOpen(true)} navigate={navigate} />
        {isScenarioRoute && <ScenarioWorkflowBar currentRoute={route} navigate={navigate} />}
        <main className="mx-auto w-full max-w-[1560px] flex-1 px-4 py-3 sm:px-6 sm:py-4">
          {children}
        </main>
      </div>
    </div>
  );
}
