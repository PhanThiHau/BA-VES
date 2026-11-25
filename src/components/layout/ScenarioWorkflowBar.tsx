import {
  ClipboardCheck,
  FileStack,
  FileText,
  MessageSquareText,
  Sparkles,
  Target,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

interface ScenarioWorkflowBarProps {
  currentRoute: RouteKey;
  navigate: (route: RouteKey) => void;
}

const scenarioSteps: Array<{
  id: string;
  label: string;
  stepNum: string;
  icon: typeof Target;
  targetRoute: RouteKey;
  docTemplateId?: string;
  isMatch: (route: RouteKey, docTarget?: { templateId: string } | null) => boolean;
}> = [
  {
    id: "bap",
    label: "Kế hoạch",
    stepNum: "1",
    icon: Target,
    targetRoute: "docs",
    docTemplateId: "bap",
    isMatch: (route, docTarget) =>
      route === "planning" || (route === "docs" && docTarget?.templateId === "bap"),
  },
  {
    id: "simulation",
    label: "Phỏng vấn",
    stepNum: "2",
    icon: MessageSquareText,
    targetRoute: "simulation",
    isMatch: (route) => route === "simulation",
  },
  {
    id: "docs",
    label: "Soạn Docs",
    stepNum: "3",
    icon: FileText,
    targetRoute: "docs",
    isMatch: (route, docTarget) => route === "docs" && (!docTarget || docTarget?.templateId !== "bap"),
  },
  {
    id: "artifacts",
    label: "Hồ sơ",
    stepNum: "4",
    icon: FileStack,
    targetRoute: "artifacts",
    isMatch: (route) => route === "artifacts",
  },
  {
    id: "assessment",
    label: "Nghiệm thu",
    stepNum: "5",
    icon: ClipboardCheck,
    targetRoute: "assessment",
    isMatch: (route) => route === "assessment",
  },
];

export function ScenarioWorkflowBar({ currentRoute, navigate }: ScenarioWorkflowBarProps) {
  const { activeDocTarget, setActiveDocTarget } = useApp();

  const handleStepClick = (step: (typeof scenarioSteps)[number]) => {
    if (step.docTemplateId) {
      setActiveDocTarget({ templateId: step.docTemplateId });
    } else if (step.id === "docs") {
      setActiveDocTarget(null);
    }
    navigate(step.targetRoute);
  };

  return (
    <div className="sticky top-14 z-15 border-b border-slate/15 bg-white/95 px-4 sm:px-6 py-1.5 shadow-2xs backdrop-blur-md">
      <div className="mx-auto flex max-w-[1560px] items-center justify-between gap-2">
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate("scenario-detail")}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1 text-[11px] font-bold text-[#102a43] hover:bg-blue-100 transition cursor-pointer"
            title="Xem lại đề bài kịch bản"
          >
            <Sparkles size={12} className="text-amber-600" />
            <span>Đề bài</span>
          </button>
          <button
            type="button"
            onClick={() => navigate("scenarios")}
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 hover:text-navy transition cursor-pointer"
            title="Đổi sang kịch bản khác"
          >
            Đổi kịch bản
          </button>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar" aria-label="Thao tác kịch bản">
          {scenarioSteps.map((step) => {
            const Icon = step.icon;
            const isActive = step.isMatch(currentRoute, activeDocTarget);

            return (
              <button
                type="button"
                key={step.id}
                onClick={() => handleStepClick(step)}
                className={classNames(
                  "flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-[#1b365d] text-white shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-navy"
                )}
              >
                <span
                  className={classNames(
                    "grid h-4.5 w-4.5 place-items-center rounded text-[10px] font-extrabold font-mono",
                    isActive ? "bg-white text-[#1b365d]" : "bg-slate-200/80 text-slate-700"
                  )}
                >
                  {step.stepNum}
                </span>
                <Icon size={13} className={isActive ? "text-amber-300" : "text-slate-500"} />
                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
