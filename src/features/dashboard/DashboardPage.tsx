import { useEffect, useMemo, useState } from "react";
import { AppWindow, ArrowRight, BookOpenCheck, Boxes, BriefcaseBusiness, Factory, FileStack, FolderKanban, GraduationCap, Landmark, Loader2, Play, Search, SearchCheck, Sparkles, Users } from "lucide-react";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useApp } from "../../contexts/AppContext";
import { catalogService, type IndustryItem, type ApplicationItem } from "../../services/catalogService";
import { simulationService, type SessionHistoryItemDto } from "../../services/simulationService";
import type { RouteKey } from "../../types/models";

const industryIcons: Record<string, any> = {
  RETAIL: BriefcaseBusiness,
  SUPPLY_CHAIN: Boxes,
  SCM: Boxes,
  FINANCE: Landmark,
  MANUFACTURING: Factory,
  DEFAULT: FolderKanban,
};

export function DashboardPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { setSelectedDomainId, currentSessionId, setCurrentSessionId } = useApp();
  const [query, setQuery] = useState("");
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [sessions, setSessions] = useState<SessionHistoryItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [indList, appList, sessList] = await Promise.allSettled([
          catalogService.getIndustries(),
          catalogService.getApplications(),
          simulationService.getMySessions(),
        ]);

        if (indList.status === "fulfilled") setIndustries(indList.value || []);
        if (appList.status === "fulfilled") setApplications(appList.value || []);
        if (sessList.status === "fulfilled") {
          const list = sessList.value || [];
          setSessions(list);
          if (!currentSessionId && list.length > 0) {
            const active = list.find((s) => s.status === 0 || s.status === "Active") || list[0];
            if (active?.id) setCurrentSessionId(active.id);
          }
        }
      } catch (err) {
        console.warn("Lỗi tải dữ liệu Dashboard từ máy chủ:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const latestSession = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;
    return sessions.find((s) => s.id === currentSessionId) || sessions[0];
  }, [sessions, currentSessionId]);

  const visibleIndustries = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en");
    return industries.filter((ind) => {
      const searchTarget = `${ind.name} ${ind.code} ${ind.description || ""}`.toLocaleLowerCase("en");
      return !normalized || searchTarget.includes(normalized);
    });
  }, [industries, query]);

  const openIndustry = (industryId: number) => {
    setSelectedDomainId(String(industryId));
    navigate("applications");
  };

  const openAllApplications = () => {
    setSelectedDomainId("all");
    navigate("applications");
  };

  return (
    <div className="space-y-4 font-sans pb-6">
      {/* 1. Page Greeting Header */}
      <section className="reveal-up flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate">
            <span className="grid h-4.5 w-4.5 place-items-center rounded bg-brass/20 text-brass">
              <GraduationCap size={12} />
            </span>
            Không gian học viên · BA-VES Platform
          </div>
          <h1 className="mt-0.5 font-display text-lg font-extrabold tracking-tight text-navy sm:text-xl">
            Tổng quan & Khám phá Miền nghiệp vụ
          </h1>
          <p className="text-xs text-slate">
            Hệ thống mô phỏng thực chiến kết nối trực tiếp với dữ liệu doanh nghiệp và tác tử AI.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-1 sm:pt-0 shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate/20 bg-white px-2.5 py-1 text-[11px] font-semibold text-navy shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Database Connected
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/30 bg-brass/10 px-2.5 py-1 text-[11px] font-bold text-brass">
            Chuẩn BABOK® v3
          </span>
        </div>
      </section>

      {/* 2. Active Scenario Spotlight Cockpit Banner */}
      <section className="reveal-up reveal-delay-1 relative overflow-hidden rounded-2xl border border-white/20 bg-navy-deep text-white shadow-sm">
        <div className="absolute inset-0 opacity-20 mix-blend-luminosity pointer-events-none" aria-hidden="true">
          <img
            src="/images/landing/scenario-warehouse.webp"
            alt="Scenario Background"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/95 to-navy/85" />

        <div className="relative z-10 grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.4fr_1fr] lg:gap-6 lg:items-center">
          {/* Left Info Panel */}
          <div className="flex flex-col justify-between space-y-2.5">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-amber-400 px-2.5 py-0.5 font-extrabold text-slate-950 uppercase tracking-wider text-[10px]">
                  {latestSession ? `Phiên #${latestSession.id}` : "Bắt đầu học"}
                </span>
                <span className="text-slate-200 text-[11px]">
                  {latestSession ? `Kịch bản phiên bản v${latestSession.scenarioVersionId}` : "Chưa có kịch bản đang chạy"}
                </span>
              </div>

              <h2 className="mt-1.5 font-display text-base font-bold text-white sm:text-lg">
                {latestSession ? `Phiên thực hành v${latestSession.scenarioVersionId} (#${latestSession.id})` : "Khám phá danh mục kịch bản thực tế"}
              </h2>

              <p className="mt-1 text-xs text-slate-200 line-clamp-1 sm:line-clamp-2 max-w-xl">
                {latestSession
                  ? `Mã phiên: ${latestSession.id} · Cập nhật gần nhất: ${new Date(latestSession.startedAt).toLocaleDateString("vi-VN")}`
                  : "Chọn một kịch bản từ kho nghiệp vụ để kích hoạt phiên mô phỏng với các tác tử AI Stakeholder từ Database."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => navigate(latestSession ? "simulation" : "applications")}
                className="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-amber-400 px-3.5 text-xs font-extrabold text-slate-950 shadow-sm transition hover:bg-amber-300 cursor-pointer whitespace-nowrap"
              >
                <Play size={13} className="fill-slate-950" />
                {latestSession ? "Vào phiên phỏng vấn" : "Chọn kịch bản thực hành"}
              </button>

              <button
                onClick={() => navigate("applications")}
                className="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-white/25 bg-white/15 px-3 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/25 cursor-pointer whitespace-nowrap"
              >
                <AppWindow size={13} />
                Ngành & Kịch bản
              </button>

              <button
                onClick={() => navigate("cohorts")}
                className="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-amber-300/50 bg-amber-400/20 px-3 text-xs font-bold text-amber-200 backdrop-blur-md transition hover:bg-amber-400/30 cursor-pointer whitespace-nowrap"
              >
                <Users size={13} />
                Lớp học & Giảng viên
              </button>
            </div>
          </div>

          {/* Right Metrics Panel */}
          <div className="rounded-xl border border-white/15 bg-white/10 p-3.5 sm:p-4 backdrop-blur-md flex flex-col justify-between shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-200 uppercase tracking-wider text-[11px]">Trạng thái phiên học</span>
              <span className="text-xs sm:text-sm font-bold text-amber-300">
                {latestSession ? (latestSession.completedAt ? "Hoàn tất" : "Đang thực hành") : "Chưa kích hoạt"}
              </span>
            </div>

            <div className="mt-2">
              <ProgressBar value={latestSession?.completedAt ? 100 : latestSession ? 50 : 0} />
            </div>

            {/* Metrics Box */}
            <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/10 pt-2.5 text-center">
              <div>
                <strong className="metric-number block text-base font-extrabold text-white">
                  {industries.length}
                </strong>
                <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-mist/80">
                  <Boxes size={11} className="text-brass" /> Ngành
                </span>
              </div>

              <div className="border-x border-white/10">
                <strong className="metric-number block text-base font-extrabold text-white">
                  {applications.length}
                </strong>
                <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-mist/80">
                  <SearchCheck size={11} className="text-brass" /> Phân hệ
                </span>
              </div>

              <div>
                <strong className="metric-number block text-base font-extrabold text-white">
                  {sessions.length}
                </strong>
                <span className="mt-0.5 flex items-center justify-center gap-1 text-[10px] font-semibold text-mist/80">
                  <FileStack size={11} className="text-brass" /> Phiên học
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Domain Experience Catalog Grid */}
      <section className="reveal-up reveal-delay-2 space-y-3">
        {/* Section Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-brass">
              Danh mục đào tạo theo lĩnh vực
            </p>
            <h2 className="mt-0.5 font-display text-base font-extrabold tracking-tight text-navy sm:text-lg">
              Khám phá các miền nghiệp vụ
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Domain Filter Input */}
            <div className="relative w-full sm:w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate" size={13} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Lọc lĩnh vực..."
                className="h-8 w-full rounded-lg border border-slate/20 bg-white pl-8 pr-3 text-xs text-navy outline-none placeholder:text-slate/60 focus:border-navy focus:ring-1 focus:ring-navy/15 transition-all shadow-2xs"
              />
            </div>

            <button
              onClick={openAllApplications}
              className="group hidden sm:inline-flex shrink-0 items-center gap-1 text-xs font-bold text-navy hover:text-brass transition-colors cursor-pointer"
            >
              <span>Xem tất cả {industries.length} ngành</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid min-h-40 place-items-center rounded-xl border border-slate/15 bg-white p-6">
            <div className="flex flex-col items-center gap-2 text-slate text-xs font-semibold">
              <Loader2 className="animate-spin text-navy" size={20} />
              Đang tải danh mục lĩnh vực từ Database...
            </div>
          </div>
        ) : visibleIndustries.length > 0 ? (
          <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleIndustries.map((ind, index) => {
              const appCount = applications.filter(
                (a) => a.industry?.id === ind.id || (a as any).industryId === ind.id
              ).length;
              const Icon = industryIcons[ind.code.toUpperCase()] || industryIcons.DEFAULT;

              return (
                <button
                  key={ind.id}
                  onClick={() => openIndustry(ind.id)}
                  className="reveal-up group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate/15 bg-white p-3.5 text-left shadow-2xs transition hover:-translate-y-0.5 hover:border-navy/30 hover:shadow-md cursor-pointer"
                  style={{ animationDelay: `${index * 50 + 100}ms` }}
                >
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-navy transition-transform duration-300 group-hover:scale-x-100" />
                  <div>
                    <div className="flex items-start justify-between gap-2.5">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-brass shadow-2xs transition-transform duration-300 group-hover:scale-105">
                        <Icon size={18} />
                      </span>
                      <span className="rounded-full bg-offwhite border border-slate/10 px-2 py-0.5 text-[10px] font-bold text-slate">
                        {appCount} phân hệ
                      </span>
                    </div>

                    <h3 className="mt-2.5 font-display text-sm font-bold text-navy group-hover:text-brass transition-colors line-clamp-1">
                      {ind.name}
                    </h3>
                    <p className="mt-0.5 text-[9.5px] font-bold uppercase tracking-wider text-slate/75">
                      Mã: {ind.code}
                    </p>

                    <p className="mt-1.5 text-[11px] leading-snug text-slate line-clamp-2 min-h-[30px]">
                      {ind.description || "Chưa có mô tả chi tiết cho lĩnh vực này."}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate/10 pt-2 text-xs">
                    <span className="text-[10px] font-medium text-slate">
                      Trạng thái: {ind.status === "Active" || ind.status === 0 ? "Khả dụng" : "Bảo trì"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-navy group-hover:text-brass transition-colors">
                      Khám phá
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid min-h-40 place-items-center rounded-xl border border-slate/20 bg-white p-6 text-center shadow-2xs">
            <div>
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-offwhite text-slate">
                <Search size={18} />
              </span>
              <h3 className="mt-3 font-bold text-navy text-sm">
                Không tìm thấy lĩnh vực phù hợp trong Database
              </h3>
              <p className="mt-0.5 text-[11px] text-slate">Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
              <button
                className="mt-3 rounded-lg border border-slate/20 bg-white px-3 py-1.5 text-xs font-bold text-navy hover:bg-offwhite cursor-pointer"
                onClick={() => setQuery("")}
              >
                Xóa bộ lọc tìm kiếm
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3.5. Instructor & Cohort Join Quick Banner */}
      <section className="reveal-up flex flex-col gap-3 rounded-xl border border-navy/20 bg-gradient-to-r from-navy/5 via-white to-brass/10 p-3.5 sm:p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-white shadow-2xs">
            <Users size={18} />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-navy">
              Tham gia Lớp học của Giảng viên (Instructor Cohorts)
            </h3>
            <p className="text-[11px] text-slate">
              Tìm kiếm lớp học theo Giảng viên hoặc nhập Mã lớp để gửi yêu cầu tham gia và nhận bài tập tình huống BA được giao.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("cohorts")}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-navy px-3.5 text-xs font-bold text-white shadow-2xs transition hover:bg-navy-light cursor-pointer whitespace-nowrap"
        >
          <span>Gửi yêu cầu vào lớp</span>
          <ArrowRight size={13} />
        </button>
      </section>

      {/* 4. Competency Recommendation Banner */}
      <section className="reveal-up flex flex-col gap-3 rounded-xl border border-brass/30 bg-gradient-to-r from-offwhite via-white to-brass/10 p-3.5 sm:p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-brass shadow-2xs">
            <Sparkles size={18} />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold text-navy">
              Xây dựng hồ sơ năng lực BA chuẩn BABOK® v3
            </h3>
            <p className="text-[11px] text-slate line-clamp-1">
              Hệ thống tự động đánh giá minh chứng phỏng vấn qua 6 vùng kiến thức BABOK để gợi ý kịch bản tiếp theo.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("progress")}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate/20 bg-white px-3 text-xs font-bold text-navy shadow-2xs transition hover:bg-navy hover:text-white cursor-pointer whitespace-nowrap"
        >
          <span>Xem hồ sơ</span>
          <ArrowRight size={13} />
        </button>
      </section>
    </div>
  );
}
