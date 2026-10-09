import { useEffect, type ReactNode } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { PageTransition } from "../components/PageTransition";
import { AssessmentPage } from "../features/assessment/AssessmentPage";
import { ProgressPage } from "../features/assessment/ProgressPage";
import { ArtifactsPage } from "../features/artifacts/ArtifactsPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { ApplicationsPage } from "../features/applications/ApplicationsPage";
import { InstructorPage } from "../features/instructor/InstructorPage";
import { PlanningPage } from "../features/planning/PlanningPage";
import { ScenarioDetailPage } from "../features/scenarios/ScenarioDetailPage";
import { ScenarioLibraryPage } from "../features/scenarios/ScenarioLibraryPage";
import { SimulationPage } from "../features/simulation/SimulationPage";
import { AnalysisHubPage } from "../features/analysis/AnalysisHubPage";
import { RoleSelectionPage } from "../features/auth/RoleSelectionPage";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { LandingPage } from "../features/landing/LandingPage";
import { useHashRoute } from "../hooks/useHashRoute";
import { useApp } from "../contexts/AppContext";

export function AppRoutes() {
  const { route, navigate } = useHashRoute();
  const { setRole } = useApp();
  useEffect(() => {
    if (route === "instructor") setRole("instructor");
    if (["dashboard", "applications", "scenarios", "scenario-detail", "planning", "simulation", "analysis", "artifacts", "assessment", "progress"].includes(route)) setRole("learner");
  }, [route, setRole]);
  if (route === "landing") return <PageTransition route={route}><LandingPage navigate={navigate} /></PageTransition>;
  if (route === "login") return <PageTransition route={route}><LoginPage navigate={navigate} /></PageTransition>;
  if (route === "register") return <PageTransition route={route}><RegisterPage navigate={navigate} /></PageTransition>;
  if (route === "role-selection") return <PageTransition route={route}><RoleSelectionPage navigate={navigate} /></PageTransition>;
  const screens: Record<string, ReactNode> = {
    landing: null,
    login: null,
    register: null,
    "role-selection": null,
    dashboard: <DashboardPage navigate={navigate} />,
    applications: <ApplicationsPage navigate={navigate} />,
    scenarios: <ScenarioLibraryPage navigate={navigate} />,
    "scenario-detail": <ScenarioDetailPage navigate={navigate} />,
    planning: <PlanningPage navigate={navigate} />,
    simulation: <SimulationPage navigate={navigate} />,
    analysis: <AnalysisHubPage navigate={navigate} />,
    artifacts: <ArtifactsPage navigate={navigate} />,
    assessment: <AssessmentPage />,
    progress: <ProgressPage />,
    instructor: <InstructorPage />,
  };
  return (
    <PageTransition route={route}>
      <MainLayout route={route} navigate={navigate}>{screens[route]}</MainLayout>
    </PageTransition>
  );
}
