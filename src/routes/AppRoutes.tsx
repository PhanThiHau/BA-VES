import { useEffect, type ReactNode } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { PageTransition } from "../components/PageTransition";
import { AssessmentPage } from "../features/assessment/AssessmentPage";
import { ProgressPage } from "../features/assessment/ProgressPage";
import { ArtifactsPage } from "../features/artifacts/ArtifactsPage";
import { DocsWorkspacePage } from "../features/docs/DocsWorkspacePage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { ApplicationsPage } from "../features/applications/ApplicationsPage";
import { InstructorPage } from "../features/instructor/InstructorPage";
import { AdminPage } from "../features/admin/AdminPage";
import { ExpertPage } from "../features/expert/ExpertPage";
import { PlanningPage } from "../features/planning/PlanningPage";
import { ScenarioDetailPage } from "../features/scenarios/ScenarioDetailPage";
import { ScenarioLibraryPage } from "../features/scenarios/ScenarioLibraryPage";
import { LearnerCohortsPage } from "../features/cohorts/LearnerCohortsPage";
import { SimulationPage } from "../features/simulation/SimulationPage";
import { AnalysisHubPage } from "../features/analysis/AnalysisHubPage";
import { RoleSelectionPage } from "../features/auth/RoleSelectionPage";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { LandingPage } from "../features/landing/LandingPage";
import { PaymentPage } from "../features/commerce/PaymentPage";
import { CartPage } from "../features/commerce/CartPage";
import { BookingPage } from "../features/booking/BookingPage";
import { useHashRoute } from "../hooks/useHashRoute";
import { useApp } from "../contexts/AppContext";
import { resolveAppRole } from "../utils/roles";

export function AppRoutes() {
  const { route, navigate } = useHashRoute();
  const { user, setRole, setActiveDocTarget } = useApp();

  // Keep shell role aligned with account roles — never force "learner" just because
  // the hash is a learner route (that was sending Expert accounts into learner UI).
  useEffect(() => {
    if (!user?.roles?.length) return;
    setRole(resolveAppRole(user.roles));
  }, [user, setRole]);

  useEffect(() => {
    if (route === "planning") {
      setActiveDocTarget({ templateId: "bap" });
      navigate("docs");
    }
  }, [route, setActiveDocTarget, navigate]);
  if (route === "landing") return <PageTransition route={route}><LandingPage navigate={navigate} /></PageTransition>;
  if (route === "login") return <PageTransition route={route}><LoginPage navigate={navigate} /></PageTransition>;
  if (route === "register") return <PageTransition route={route}><RegisterPage navigate={navigate} /></PageTransition>;
  if (route === "role-selection") return <PageTransition route={route}><RoleSelectionPage navigate={navigate} /></PageTransition>;
  if (route === "docs") return <DocsWorkspacePage navigate={navigate} />;
  const screens: Record<string, ReactNode> = {
    landing: null,
    login: null,
    register: null,
    "role-selection": null,
    dashboard: <DashboardPage navigate={navigate} />,
    applications: <ApplicationsPage navigate={navigate} initialTab="apps" />,
    scenarios: <ApplicationsPage navigate={navigate} initialTab="scenarios" />,
    "scenario-detail": <ScenarioDetailPage navigate={navigate} />,
    cohorts: <LearnerCohortsPage navigate={navigate} />,
    planning: <PlanningPage navigate={navigate} />,
    simulation: <SimulationPage navigate={navigate} />,
    analysis: <AnalysisHubPage navigate={navigate} />,
    artifacts: <ArtifactsPage navigate={navigate} />,
    docs: <DocsWorkspacePage navigate={navigate} />,
    assessment: <AssessmentPage navigate={navigate} />,
    progress: <ProgressPage navigate={navigate} />,
    payment: <PaymentPage navigate={navigate} />,
    // Deep-link cũ #/cart → vẫn mở giỏ (nhúng cùng CartPage)
    cart: <CartPage navigate={navigate} />,
    booking: <BookingPage navigate={navigate} />,
    instructor: <InstructorPage />,
    admin: <AdminPage />,
    expert: <ExpertPage />,
  };
  return (
    <PageTransition route={route}>
      <MainLayout route={route} navigate={navigate}>{screens[route]}</MainLayout>
    </PageTransition>
  );
}
