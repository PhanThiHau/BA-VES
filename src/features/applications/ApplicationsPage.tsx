import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Building2,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  catalogService,
  type ApplicationItem,
  type IndustryItem,
  type ScenarioItem,
} from "../../services/catalogService";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";

const accentColors = ["#102a43", "#1e3a5f", "#2f638c", "#0f766e", "#8b6a35"];
const pageSize = 9;

export function ApplicationsPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { selectedDomainId, setSelectedDomainId } = useApp();
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      catalogService.getIndustries().catch(() => []),
      catalogService.getApplications().catch(() => []),
      catalogService.getScenarios().catch(() => []),
    ])
      .then(([indData, appData, scenData]) => {
        if (!isMounted) return;
        setIndustries(indData || []);
        setApplications(appData || []);
        setScenarios(scenData || []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedIndustry = industries.find(
    (ind) =>
      String(ind.id) === selectedDomainId ||
      ind.code.toLowerCase() === selectedDomainId.toLowerCase()
  );

  const visibleApps = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en");
    return applications.filter((app) => {
      const matchesDomain =
        selectedDomainId === "all" ||
        String(app.industry?.id) === selectedDomainId ||
        app.industry?.code?.toLowerCase() === selectedDomainId.toLowerCase();

      const matchesQuery =
        !normalized ||
        `${app.name} ${app.code} ${app.description || ""} ${app.industry?.name || ""}`
          .toLocaleLowerCase("en")
          .includes(normalized);
      return matchesDomain && matchesQuery;
    });
  }, [applications, query, selectedDomainId]);

  const pageCount = Math.max(1, Math.ceil(visibleApps.length / pageSize));
  const pagedApps = visibleApps.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [query, selectedDomainId]);

  return (
    <div className="space-y-6 font-sans pb-8">
      {/* Top Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button
            onClick={() => navigate("dashboard")}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate transition hover:text-navy"
          >
            <ArrowLeft size={14} />
            Quay lại Tổng quan
          </button>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brass">
            <SlidersHorizontal size={14} />
            Danh mục ứng dụng nghiệp vụ · {applications.length} Phân hệ · {industries.length} Ngành trọng điểm
          </div>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            {selectedIndustry ? selectedIndustry.name : "Tất cả ứng dụng nghiệp vụ"}
          </h1>
          <p className="mt-1 text-xs text-slate">
            Khám phá các phân hệ nghiệp vụ thực tế từ hệ thống để thực hành phân tích yêu cầu và bàn giao hồ sơ chuẩn BABOK® v3.
          </p>
        </div>

        <div className="relative w-full lg:w-[320px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm ứng dụng, phân hệ..."
            className="h-10 w-full rounded-xl border border-slate/20 bg-white pl-9 pr-4 text-xs font-medium text-navy outline-none transition placeholder:text-slate/60 focus:border-navy focus:ring-2 focus:ring-navy/10 shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs by Domain */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedDomainId("all")}
          className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
            selectedDomainId === "all"
              ? "border-navy bg-navy text-white shadow-sm"
              : "border-slate/20 bg-white text-slate hover:border-slate/40 hover:text-navy"
          }`}
        >
          Tất cả ({applications.length})
        </button>
        {industries.map((ind) => {
          const active =
            selectedDomainId === String(ind.id) ||
            selectedDomainId.toLowerCase() === ind.code.toLowerCase();
          return (
            <button
              key={ind.id}
              onClick={() => setSelectedDomainId(String(ind.id))}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                active
                  ? "border-navy bg-navy text-white shadow-sm"
                  : "border-slate/20 bg-white text-slate hover:border-slate/40 hover:text-navy"
              }`}
            >
              {ind.name}
            </button>
          );
        })}
        <span className="ml-auto shrink-0 pl-3 text-xs text-slate">
          Hiển thị <strong className="text-navy">{visibleApps.length}</strong> ứng dụng
        </span>
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="grid min-h-56 place-items-center p-8 text-slate">
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={28} className="animate-spin text-navy" />
            <span className="text-xs">Đang tải danh mục ứng dụng từ Backend API...</span>
          </div>
        </div>
      ) : visibleApps.length > 0 ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {pagedApps.map((app, index) => {
              const scenarioCount = scenarios.filter(
                (s) => s.applicationId === app.id || s.application?.id === app.id
              ).length;
              const isActive = String(app.status).toLowerCase() === "active" || app.status === 1;
              const accent = accentColors[index % accentColors.length];

              return (
                <Card
                  key={app.id}
                  className="reveal-up group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[24px] border border-slate/15 bg-white p-5 shadow-[0_4px_20px_rgba(16,42,67,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-[0_16px_36px_rgba(16,42,67,0.08)]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundColor: accent }}
                      >
                        <Boxes size={20} />
                      </span>
                      <Badge tone={isActive ? "green" : "amber"}>
                        {isActive ? "Khả dụng" : String(app.status)}
                      </Badge>
                    </div>

                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate/75">
                      {app.industry?.name || "Nghiệp vụ doanh nghiệp"} · {app.code}
                    </p>
                    <h2 className="mt-0.5 font-display text-base font-bold text-navy group-hover:text-brass transition-colors">
                      {app.name}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate line-clamp-3">
                      {app.description || "Phân hệ nghiệp vụ thực hành phân tích yêu cầu và mô hình hóa quy trình."}
                    </p>
                  </div>

                  <div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate/10 pt-3 text-[11px] font-medium text-slate">
                      <span className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-brass" />
                        {scenarioCount} kịch bản thực hành
                      </span>
                    </div>

                    <div className="mt-4">
                      <button
                        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-navy-deep hover:-translate-y-0.5"
                        onClick={() => navigate("scenarios")}
                      >
                        Xem các kịch bản đào tạo
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {pageCount > 1 && (
            <nav className="flex flex-wrap items-center justify-center gap-2 pt-4" aria-label="Phân trang">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage((current) => current - 1)}
              >
                <ArrowLeft size={14} /> Trang trước
              </Button>
              <span className="px-3 text-xs font-bold text-slate">
                Trang {page} / {pageCount}
              </span>
              <Button
                variant="secondary"
                disabled={page === pageCount}
                onClick={() => setPage((current) => current + 1)}
              >
                Trang sau <ArrowRight size={14} />
              </Button>
            </nav>
          )}
        </>
      ) : (
        <Card className="grid min-h-56 place-items-center p-6 text-center rounded-[24px]">
          <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-offwhite text-slate">
              <Search size={22} />
            </span>
            <h2 className="mt-4 font-bold text-navy text-base">Không tìm thấy ứng dụng phù hợp</h2>
            <p className="mt-1 text-xs text-slate">Thử tìm kiếm với từ khóa khác hoặc xem toàn bộ danh mục.</p>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => {
                setQuery("");
                setSelectedDomainId("all");
              }}
            >
              Xóa bộ lọc tìm kiếm
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
