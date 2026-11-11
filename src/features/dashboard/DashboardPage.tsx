import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  Boxes,
  FileStack,
  GraduationCap,
  Loader2,
  MessageSquare,
  Play,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useApp } from "../../contexts/AppContext";
import {
  catalogService,
  type ApplicationItem,
  type IndustryItem,
  type ScenarioItem,
} from "../../services/catalogService";
import {
  simulationService,
  type SessionHistoryItemDto,
} from "../../services/simulationService";
import type { RouteKey } from "../../types/models";

const domainColors = ["#102a43", "#1e3a5f", "#2f638c", "#0f766e", "#8b6a35"];

export function DashboardPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { setSelectedDomainId, setCurrentSessionId, setCurrentScenarioVersionId } = useApp();
  const [query, setQuery] = useState("");
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [mySessions, setMySessions] = useState<SessionHistoryItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    Promise.all([
      catalogService.getIndustries().catch(() => []),
      catalogService.getApplications().catch(() => []),
      catalogService.getScenarios().catch(() => []),
      simulationService.getMySessions().catch(() => []),
    ])
      .then(([indData, appData, scenData, sessData]) => {
        if (!isMounted) return;
        setIndustries(indData || []);
        setApplications(appData || []);
        setScenarios(scenData || []);
        setMySessions(sessData || []);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleIndustries = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en");
    return industries.filter((ind) => {
      const searchTarget = `${ind.name} ${ind.code} ${ind.description || ""}`.toLocaleLowerCase("en");
      return !normalized || searchTarget.includes(normalized);
    });
  }, [industries, query]);

  const activeSession = useMemo(() => {
    if (mySessions.length === 0) return null;
    const inProgress = mySessions.find(
      (s) => String(s.status).toLowerCase() === "inprogress" || s.status === 0 || s.status === 1
    );
    return inProgress || mySessions[0];
  }, [mySessions]);

  const activeScenario = useMemo(() => {
    if (activeSession) {
      return scenarios.find((s) => s.id === activeSession.scenarioVersionId) || scenarios[0] || null;
    }
    return scenarios[0] || null;
  }, [activeSession, scenarios]);

  const openDomain = (industryId: number) => {
    setSelectedDomainId(String(industryId));
    navigate("applications");
  };

  const openAllApplications = () => {
    setSelectedDomainId("all");
    navigate("applications");
  };

  const handleContinueSession = () => {
    if (activeSession) {
      setCurrentSessionId(activeSession.id);
      setCurrentScenarioVersionId(activeSession.scenarioVersionId);
      navigate("simulation");
    } else if (activeScenario) {
      setCurrentScenarioVersionId(activeScenario.id);
      navigate("scenario-detail");
    } else {
      navigate("scenarios");
    }
  };

  const handleViewScenarioDetail = () => {
    if (activeSession) {
      setCurrentScenarioVersionId(activeSession.scenarioVersionId);
      navigate("scenario-detail");
    } else if (activeScenario) {
      setCurrentScenarioVersionId(activeScenario.id);
      navigate("scenario-detail");
    } else {
      navigate("scenarios");
    }
  };

  return (
    <div className="space-y-8 font-sans pb-8">
      {/* 1. Page Greeting Header */}
      <section className="reveal-up flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-brass/20 text-brass">
              <GraduationCap size={13} />
            </span>
            Không gian thực hành học viên · BA-VES Studio
          </div>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            Tổng quan & Khám phá Miền nghiệp vụ
          </h1>
          <p className="text-xs sm:text-sm text-slate">
            {activeSession
              ? "Chào mừng bạn quay lại hệ thống mô phỏng. Hãy tiếp tục giải quyết phiên thực hành gần nhất."
              : "Chọn một lĩnh vực hoặc kịch bản doanh nghiệp từ thư viện để bắt đầu phiên thực hành đầu tiên."}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-navy shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            AI Simulation Active
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/30 bg-brass/10 px-3.5 py-1.5 text-xs font-bold text-brass">
            Chuẩn BABOK® v3
          </span>
        </div>
      </section>

      {/* 2. Active Scenario / Session Spotlight Banner */}
      <section className="reveal-up reveal-delay-1 relative overflow-hidden rounded-[28px] border border-white/20 bg-navy-deep text-white shadow-[0_20px_50px_rgba(11,31,51,0.22)]">
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity pointer-events-none" aria-hidden="true">
          <img
            src="/images/landing/scenario-warehouse.webp"
            alt="BA-VES Simulation"
            className="h-full w-full object-cover scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/95 to-navy-deep/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-transparent to-navy-deep/40 pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-[1fr_390px] gap-8 p-7 sm:p-9 items-center">
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  {activeSession ? `Phiên #${activeSession.id} · Lần thử ${activeSession.attemptNo}` : "Sẵn sàng thực chiến"}
                </span>
                {activeScenario && (
                  <span className="text-xs font-bold uppercase tracking-wider text-brass">
                    {activeScenario.code} · {activeScenario.application?.name || "Nghiệp vụ doanh nghiệp"}
                  </span>
                )}
              </div>

              <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {activeScenario ? activeScenario.title : "Thư viện Kịch bản Mô phỏng Doanh nghiệp Ảo"}
              </h2>

              <p className="mt-2.5 text-sm leading-relaxed text-mist/90 max-w-2xl">
                {activeScenario?.description ||
                  "Thực hành khai thác yêu cầu (Elicitation) trực tiếp với các AI Stakeholder đa chiều, lập ma trận truy xuất nguồn gốc RTM và chuẩn hóa tài liệu đặc tả BRD."}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={handleContinueSession}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-5 py-3 text-xs font-bold text-navy shadow-lg transition-all duration-300 hover:bg-brass hover:text-white hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play size={14} fill="currentColor" className="text-brass group-hover:text-white transition-colors" />
                {activeSession ? "Tiếp tục phỏng vấn AI" : "Khám phá & Bắt đầu ngay"}
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={handleViewScenarioDetail}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-xs font-bold text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/50"
              >
                <BookOpenCheck size={15} />
                Chi tiết đề bài & Hồ sơ
              </button>
            </div>
          </div>

          {/* Right Metrics Glass Card Panel */}
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 sm:p-6 backdrop-blur-xl flex flex-col justify-between shadow-inner">
            <div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-mist uppercase tracking-wider">Hoạt động trên hệ thống</span>
                <span className="metric-number text-xl font-extrabold text-brass">
                  {mySessions.length} phiên
                </span>
              </div>

              <div className="mt-2.5">
                <ProgressBar value={activeSession ? Math.min(100, (activeSession.messageCount || 1) * 10) : 0} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4 text-center">
              <div>
                <strong className="metric-number block text-xl font-extrabold text-white">
                  {activeSession ? activeSession.agentCount : scenarios.length}
                </strong>
                <span className="mt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-mist/80">
                  <Users size={12} className="text-brass" /> {activeSession ? "Tác tử AI" : "Kịch bản"}
                </span>
              </div>

              <div className="border-x border-white/10">
                <strong className="metric-number block text-xl font-extrabold text-white">
                  {activeSession ? activeSession.messageCount : applications.length}
                </strong>
                <span className="mt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-mist/80">
                  <MessageSquare size={12} className="text-brass" /> {activeSession ? "Tin nhắn" : "Ứng dụng"}
                </span>
              </div>

              <div>
                <strong className="metric-number block text-xl font-extrabold text-white">
                  {industries.length}
                </strong>
                <span className="mt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-mist/80">
                  <FileStack size={12} className="text-brass" /> Lĩnh vực
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-navy-deep/60 p-3 text-[11px] leading-relaxed text-mist/85 border border-white/10">
              💡 <strong>Gợi ý:</strong> Lập kế hoạch câu hỏi (Planning) trước khi phỏng vấn giúp tăng tỷ lệ khai thác được dữ liệu ẩn từ Stakeholder AI.
            </div>
          </div>
        </div>
      </section>

      {/* 3. Domain Experience Catalog Grid */}
      <section className="reveal-up reveal-delay-2 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brass">
              Danh mục đào tạo theo lĩnh vực
            </p>
            <h2 className="mt-0.5 font-display text-xl font-extrabold tracking-tight text-navy sm:text-2xl">
              Khám phá các miền nghiệp vụ
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Lọc lĩnh vực..."
                className="h-9 w-full rounded-xl border border-slate/20 bg-white pl-8 pr-3 text-xs text-navy outline-none placeholder:text-slate/60 focus:border-navy focus:ring-2 focus:ring-navy/10 transition-all shadow-sm"
              />
            </div>

            <button
              onClick={openAllApplications}
              className="group hidden sm:inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-navy hover:text-brass transition-colors"
            >
              Xem tất cả {applications.length} ứng dụng ({industries.length} ngành)
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid min-h-48 place-items-center rounded-2xl border border-slate/15 bg-white p-8 text-slate">
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-navy" />
              <span className="text-xs">Đang đồng bộ danh mục lĩnh vực từ Backend API...</span>
            </div>
          </div>
        ) : visibleIndustries.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleIndustries.map((ind, index) => {
              const appCount = applications.filter(
                (a) => a.industry?.id === ind.id
              ).length;
              const scenCount = scenarios.filter((s) =>
                applications.some((a) => a.industry?.id === ind.id && (s.applicationId === a.id || s.application?.id === a.id))
              ).length;
              const color = domainColors[index % domainColors.length];

              return (
                <button
                  key={ind.id}
                  onClick={() => openDomain(ind.id)}
                  className="reveal-up group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-slate/15 bg-white p-5 text-left shadow-[0_4px_20px_rgba(16,42,67,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-[0_16px_36px_rgba(16,42,67,0.08)]"
                  style={{ animationDelay: `${index * 50 + 100}ms` }}
                >
                  <span
                    className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
                    style={{ backgroundColor: color }}
                  />

                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundColor: color }}
                      >
                        <Boxes size={22} />
                      </span>
                      <span className="rounded-full bg-offwhite border border-slate/10 px-2.5 py-1 text-[11px] font-bold text-slate">
                        {appCount} Ứng dụng
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-base font-bold text-navy group-hover:text-brass transition-colors">
                      {ind.name}
                    </h3>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate/75">
                      {ind.code}
                    </p>

                    <p className="mt-2.5 min-h-12 text-xs leading-relaxed text-slate">
                      {ind.description || "Khám phá các phân hệ nghiệp vụ và tình huống thực chiến."}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate/10 pt-3.5 text-xs">
                    <span className="text-[11px] font-medium text-slate">
                      {scenCount} kịch bản khả dụng
                    </span>
                    <span className="flex items-center gap-1 font-bold text-navy group-hover:text-brass transition-colors">
                      Khám phá
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-56 place-items-center rounded-2xl border border-slate/20 bg-white p-8 text-center shadow-sm">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-offwhite text-slate">
                <Search size={22} />
              </span>
              <h3 className="mt-4 font-bold text-navy text-base">
                Không tìm thấy lĩnh vực phù hợp
              </h3>
              <p className="mt-1 text-xs text-slate">
                {industries.length === 0
                  ? "Hiện chưa có danh mục lĩnh vực nào trên máy chủ."
                  : "Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc."}
              </p>
              {query && (
                <button
                  className="mt-4 rounded-xl border border-slate/20 bg-white px-4 py-2 text-xs font-bold text-navy hover:bg-offwhite"
                  onClick={() => setQuery("")}
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 4. Competency Recommendation Banner */}
      <section className="reveal-up flex flex-col gap-4 rounded-[26px] border border-brass/30 bg-gradient-to-r from-offwhite via-white to-brass/10 p-6 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy text-brass shadow-md">
            <Sparkles size={22} />
          </span>
          <div>
            <h3 className="font-display text-base font-extrabold text-navy">
              Xây dựng hồ sơ năng lực BA chuẩn BABOK® v3
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate max-w-xl">
              Hệ thống tự động chấm điểm minh chứng phỏng vấn của bạn qua 6 vùng kiến thức BABOK để theo dõi mức độ thành thạo và gợi ý kịch bản rèn luyện tiếp theo.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("progress")}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate/20 bg-white px-5 py-3 text-xs font-bold text-navy shadow-sm transition hover:bg-navy hover:text-white hover:border-transparent"
        >
          Xem hồ sơ năng lực
          <ArrowRight size={14} />
        </button>
      </section>
    </div>
  );
}
