import { useEffect, useMemo, useState } from "react";
import {
  AppWindow,
  ArrowLeft,
  ArrowRight,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Factory,
  FolderKanban,
  Landmark,
  Loader2,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { catalogService, type IndustryItem, type ApplicationItem } from "../../services/catalogService";
import { useApp } from "../../contexts/AppContext";
import { ScenarioLibraryPage } from "../scenarios/ScenarioLibraryPage";
import type { RouteKey } from "../../types/models";

const industryIcons: Record<string, typeof Building2> = {
  RETAIL: BriefcaseBusiness,
  SUPPLY_CHAIN: Boxes,
  SCM: Boxes,
  FINANCE: Landmark,
  MANUFACTURING: Factory,
  DEFAULT: FolderKanban,
};

type ViewLevel = "industries" | "applications" | "scenarios";

export function ApplicationsPage({
  navigate,
}: {
  navigate: (route: RouteKey) => void;
  initialTab?: "apps" | "scenarios";
}) {
  const { setSelectedDomainId, catalogBrowse, setCatalogBrowse } = useApp();
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const view = catalogBrowse.view;
  const selectedIndustry = useMemo(
    () => industries.find((i) => i.id === catalogBrowse.industryId) ?? null,
    [industries, catalogBrowse.industryId]
  );
  const selectedApplication = useMemo(
    () => applications.find((a) => a.id === catalogBrowse.applicationId) ?? null,
    [applications, catalogBrowse.applicationId]
  );

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [indList, appList] = await Promise.allSettled([
          catalogService.getIndustries(),
          catalogService.getApplications(),
        ]);
        if (indList.status === "fulfilled") setIndustries(indList.value || []);
        if (appList.status === "fulfilled") setApplications(appList.value || []);
      } catch (err) {
        console.warn("Lỗi tải danh mục ngành từ máy chủ:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Nếu state còn trỏ scenarios nhưng thiếu application → hạ về tầng hợp lệ.
  useEffect(() => {
    if (isLoading) return;
    if (view === "scenarios" && catalogBrowse.applicationId == null) {
      setCatalogBrowse((prev) => ({
        ...prev,
        view: prev.industryId != null ? "applications" : "industries",
        applicationId: null,
      }));
      return;
    }
    if (view === "applications" && catalogBrowse.industryId == null) {
      setCatalogBrowse({ view: "industries", industryId: null, applicationId: null });
    }
  }, [isLoading, view, catalogBrowse.applicationId, catalogBrowse.industryId, setCatalogBrowse]);

  const appsOfIndustry = useMemo(() => {
    if (!selectedIndustry) return [];
    return applications.filter(
      (app) =>
        app.industry?.id === selectedIndustry.id ||
        (app as { industryId?: number }).industryId === selectedIndustry.id
    );
  }, [applications, selectedIndustry]);

  const appCountByIndustry = useMemo(() => {
    const map = new Map<number, number>();
    for (const app of applications) {
      const industryId = app.industry?.id ?? (app as { industryId?: number }).industryId;
      if (industryId == null) continue;
      map.set(industryId, (map.get(industryId) || 0) + 1);
    }
    return map;
  }, [applications]);

  const openIndustry = (industry: IndustryItem) => {
    setSelectedDomainId(String(industry.id));
    setCatalogBrowse({
      view: "applications",
      industryId: industry.id,
      applicationId: null,
    });
  };

  const openApplication = (app: ApplicationItem) => {
    setCatalogBrowse({
      view: "scenarios",
      industryId: catalogBrowse.industryId ?? app.industry?.id ?? null,
      applicationId: app.id,
    });
  };

  const backFromApplications = () => {
    setSelectedDomainId("all");
    setCatalogBrowse({ view: "industries", industryId: null, applicationId: null });
  };

  const backFromScenarios = () => {
    setCatalogBrowse((prev) => ({
      ...prev,
      view: "applications",
      applicationId: null,
    }));
  };

  const title =
    view === "industries"
      ? "Ngành"
      : view === "applications"
        ? selectedIndustry?.name || "Ứng dụng"
        : selectedApplication?.name || "Kịch bản";

  const subtitle =
    view === "industries"
      ? "Chọn ngành để xem các ứng dụng thuộc ngành đó."
      : view === "applications"
        ? "Chọn ứng dụng để xem kịch bản của ứng dụng đó."
        : "Các kịch bản thuộc ứng dụng đã chọn.";

  return (
    <div className="space-y-4 font-sans pb-6">
      <div>
        <button
          onClick={() => {
            if (view === "scenarios") backFromScenarios();
            else if (view === "applications") backFromApplications();
            else navigate("dashboard");
          }}
          className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate transition hover:text-navy cursor-pointer"
        >
          <ArrowLeft size={13} />
          {view === "industries"
            ? "Quay lại Tổng quan"
            : view === "applications"
              ? "Quay lại Ngành"
              : "Quay lại Ứng dụng"}
        </button>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brass">
          <Building2 size={12} />
          {view === "industries"
            ? "Hệ thống Ngành"
            : view === "applications"
              ? `Ngành · ${selectedIndustry?.code || ""}`
              : `Ứng dụng · ${selectedApplication?.code || ""}`}
        </div>
        <h1 className="mt-0.5 font-display text-xl font-extrabold tracking-tight text-navy sm:text-2xl">
          {title}
        </h1>
        <p className="mt-0.5 text-xs text-slate">{subtitle}</p>
      </div>

      {isLoading ? (
        <div className="grid min-h-56 place-items-center rounded-2xl border border-slate/15 bg-white p-8">
          <div className="flex flex-col items-center gap-2 text-slate text-xs font-semibold">
            <Loader2 className="animate-spin text-navy" size={24} />
            Đang tải danh mục...
          </div>
        </div>
      ) : view === "industries" ? (
        industries.length === 0 ? (
          <Card className="grid min-h-56 place-items-center p-6 text-center rounded-2xl">
            <p className="text-sm font-bold text-navy">Chưa có ngành trong hệ thống</p>
          </Card>
        ) : (
          <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
            {industries.map((industry) => {
              const Icon = industryIcons[industry.code?.toUpperCase() || "DEFAULT"] || industryIcons.DEFAULT;
              const isAvailable = industry.status === "Active" || industry.status === 0;
              const appCount = appCountByIndustry.get(industry.id) || 0;

              return (
                <Card
                  key={industry.id}
                  className="reveal-up group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[24px] border border-slate/15 bg-white p-5 shadow-[0_4px_20px_rgba(16,42,67,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-[0_16px_36px_rgba(16,42,67,0.08)]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-navy text-brass shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <Icon size={20} />
                      </span>
                      <Badge tone={isAvailable ? "green" : "gray"}>
                        {isAvailable ? "Khả dụng" : "Đang phát triển"}
                      </Badge>
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate/75">
                      Industry · {industry.code}
                    </p>
                    <h2 className="mt-0.5 font-display text-base font-bold text-navy group-hover:text-brass transition-colors">
                      {industry.name}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate line-clamp-3">
                      {industry.description || "Ngành nghề dùng cho các kịch bản mô phỏng BA."}
                    </p>
                  </div>

                  <div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate/10 pt-3 text-[11px] font-medium text-slate">
                      <span className="flex items-center gap-1.5">
                        <AppWindow size={13} className="text-brass" />
                        {appCount} ứng dụng
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock3 size={13} className="text-brass" />
                        Chuẩn đào tạo
                      </span>
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        className="flex min-h-[34px] w-full items-center justify-center gap-1.5 rounded-xl bg-navy px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-all hover:bg-navy-deep cursor-pointer"
                        onClick={() => openIndustry(industry)}
                      >
                        <span>Xem ứng dụng</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : view === "applications" ? (
        appsOfIndustry.length === 0 ? (
          <Card className="grid min-h-56 place-items-center p-6 text-center rounded-2xl">
            <p className="text-sm font-bold text-navy">Ngành này chưa có ứng dụng</p>
          </Card>
        ) : (
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {appsOfIndustry.map((app) => {
              const isAvailable = app.status === "Active" || app.status === 0;
              return (
                <Card
                  key={app.id}
                  className="reveal-up group relative flex min-h-[230px] flex-col justify-between overflow-hidden rounded-[24px] border border-slate/15 bg-white p-5 shadow-[0_4px_20px_rgba(16,42,67,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-[0_16px_36px_rgba(16,42,67,0.08)]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-navy text-brass shadow-sm">
                        <AppWindow size={20} />
                      </span>
                      <Badge tone={isAvailable ? "green" : "gray"}>
                        {isAvailable ? "Khả dụng" : "Đang phát triển"}
                      </Badge>
                    </div>
                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate/75">
                      Application · {app.code}
                    </p>
                    <h2 className="mt-0.5 font-display text-base font-bold text-navy group-hover:text-brass transition-colors">
                      {app.name}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate line-clamp-3">
                      {app.description || "Ứng dụng nghiệp vụ trong ngành đã chọn."}
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="flex min-h-[34px] w-full items-center justify-center gap-1.5 rounded-xl bg-navy px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs transition-all hover:bg-navy-deep cursor-pointer"
                      onClick={() => openApplication(app)}
                    >
                      <span>Xem kịch bản</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : selectedApplication ? (
        <ScenarioLibraryPage
          navigate={navigate}
          initialAppId={selectedApplication.id}
          initialIndustryId={selectedIndustry?.id ?? "all"}
          embedded
          hideFilters
        />
      ) : (
        <div className="grid min-h-40 place-items-center rounded-2xl border border-slate/15 bg-white p-6 text-xs font-semibold text-slate">
          <Loader2 className="mb-2 animate-spin text-navy" size={20} />
          Đang khôi phục danh sách kịch bản...
        </div>
      )}
    </div>
  );
}
