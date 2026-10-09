import { useMemo, useState } from "react";
import { ArrowRight, BookOpenCheck, Boxes, BriefcaseBusiness, CheckCircle2, Factory, FileStack, FolderKanban, GraduationCap, Landmark, MessageSquareText, Play, Search, SearchCheck, Sparkles, Users, Zap } from "lucide-react";
import { learningApplications, learningDomains } from "../../constants/learningCatalog";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useApp } from "../../contexts/AppContext";
import type { LearningDomain, RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

const domainIcons = {
  boxes: Boxes,
  sales: BriefcaseBusiness,
  finance: Landmark,
  factory: Factory,
  people: Users,
  project: FolderKanban,
};

const domainTranslations: Record<
  string,
  { title: string; subtitle: string; desc: string; tag: string }
> = {
  "supply-chain": {
    title: "Chuỗi cung ứng & Kho vận",
    subtitle: "Supply Chain & Logistics",
    desc: "Mua hàng, quản lý hàng tồn kho, điều phối vận chuyển và cân đối nhu cầu cung ứng đa kho.",
    tag: "Đang học · INV-2026",
  },
  "sales-customer": {
    title: "Kinh doanh & Khách hàng",
    subtitle: "Sales & Customer CRM",
    desc: "Quản lý khách hàng tiềm năng, cơ hội bán hàng, đơn đặt hàng và điểm bán lẻ POS đa kênh.",
    tag: "4 Ứng dụng",
  },
  finance: {
    title: "Tài chính & Kế toán",
    subtitle: "Finance & Accounting",
    desc: "Hóa đơn, công nợ, phân tích chi phí vận hành, dòng tiền và kiểm soát ngân sách định kỳ.",
    tag: "4 Ứng dụng",
  },
  manufacturing: {
    title: "Sản xuất & Vận hành",
    subtitle: "Manufacturing & MRP",
    desc: "Kế hoạch sản xuất, định mức vật tư BOM, bảo trì máy móc và kiểm soát chất lượng quy trình.",
    tag: "4 Ứng dụng",
  },
  "human-resources": {
    title: "Quản trị Nhân sự",
    subtitle: "Human Resources",
    desc: "Quy trình tuyển dụng, hồ sơ nhân sự, chấm công nghỉ phép và đánh giá hiệu suất nhân viên.",
    tag: "4 Ứng dụng",
  },
  "project-operations": {
    title: "Dự án & Dịch vụ",
    subtitle: "Project Operations",
    desc: "Quản lý tiến độ dự án, bảng chấm công timesheet, dịch vụ hiện trường và hỗ trợ Helpdesk.",
    tag: "4 Ứng dụng",
  },
};

export function DashboardPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { setSelectedDomainId } = useApp();
  const [query, setQuery] = useState("");

  const visibleDomains = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en");
    return learningDomains.filter((domain) => {
      const trans = domainTranslations[domain.id];
      const searchTarget = `${domain.name} ${domain.shortName} ${domain.description} ${trans?.title || ""} ${trans?.desc || ""}`.toLocaleLowerCase("en");
      return !normalized || searchTarget.includes(normalized);
    });
  }, [query]);

  const openDomain = (domainId: string) => {
    setSelectedDomainId(domainId);
    navigate("applications");
  };

  const openAllApplications = () => {
    setSelectedDomainId("all");
    navigate("applications");
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
            Không gian thực hành học viên · FA26SE185
          </div>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            Tổng quan & Khám phá Miền nghiệp vụ
          </h1>
          <p className="text-xs sm:text-sm text-slate">
            Chào mừng bạn quay lại hệ thống mô phỏng. Hãy tiếp tục giải quyết kịch bản đang tiến hành.
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

      {/* 2. Active Scenario Spotlight Cockpit Banner (Thiết kế Studio sang trọng với hình ảnh kho hàng thực tế) */}
      <section className="reveal-up reveal-delay-1 relative overflow-hidden rounded-[28px] border border-white/20 bg-navy-deep text-white shadow-[0_20px_50px_rgba(11,31,51,0.22)]">
        {/* Background Photo with Depth Overlays */}
        <div className="absolute inset-0 opacity-25 mix-blend-luminosity pointer-events-none" aria-hidden="true">
          <img
            src="/images/landing/scenario-warehouse.webp"
            alt="VinaSupply Warehouse Simulation"
            className="h-full w-full object-cover scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/95 to-navy-deep/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-transparent to-navy-deep/40 pointer-events-none" />

        <div className="relative z-10 grid lg:grid-cols-[1fr_390px] gap-8 p-7 sm:p-9 items-center">
          
          {/* Main Info Side */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  Đang thực hiện
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-brass">
                  Kịch bản INV-2026-014 · VinaSupply Retail
                </span>
              </div>

              <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                Quản lý tồn kho Chuỗi cung ứng{" "}
                <span className="text-brass">(Inventory Management)</span>
              </h2>

              <p className="mt-2.5 text-sm leading-relaxed text-mist/90 max-w-2xl">
                Điều tra nguyên nhân đứt hàng tồn kho đột biến tại chuỗi bán lẻ, phỏng vấn Giám đốc Kho vận Dave Miller và hoàn thiện tài liệu đặc tả quy trình bổ sung hàng tự động chuẩn BABOK® v3.
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("simulation")}
                className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-5 py-3 text-xs font-bold text-navy shadow-lg transition-all duration-300 hover:bg-brass hover:text-white hover:-translate-y-0.5 active:translate-y-0"
              >
                <Play size={14} fill="currentColor" className="text-brass group-hover:text-white transition-colors" />
                Tiếp tục phỏng vấn AI
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigate("scenario-detail")}
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
                <span className="text-mist uppercase tracking-wider">Tiến độ kịch bản</span>
                <span className="metric-number text-xl font-extrabold text-brass">42%</span>
              </div>

              <div className="mt-2.5">
                <ProgressBar value={42} />
              </div>
            </div>

            {/* 3 Metrics Box */}
            <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4 text-center">
              <div>
                <strong className="metric-number block text-xl font-extrabold text-white">3/6</strong>
                <span className="mt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-mist/80">
                  <Users size={12} className="text-brass" /> Tác tử AI
                </span>
              </div>

              <div className="border-x border-white/10">
                <strong className="metric-number block text-xl font-extrabold text-white">08</strong>
                <span className="mt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-mist/80">
                  <SearchCheck size={12} className="text-brass" /> Bằng chứng
                </span>
              </div>

              <div>
                <strong className="metric-number block text-xl font-extrabold text-white">2/5</strong>
                <span className="mt-1 flex items-center justify-center gap-1 text-[10px] font-semibold text-mist/80">
                  <FileStack size={12} className="text-brass" /> Hồ sơ BA
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-navy-deep/60 p-3 text-[11px] leading-relaxed text-mist/85 border border-white/10">
              💡 <strong>Gợi ý tiếp theo:</strong> Bóc tách mâu thuẫn giữa Giám đốc Kho và Trưởng phòng Mua hàng để kiểm chứng các giả định (Assumptions).
            </div>
          </div>

        </div>
      </section>

      {/* 3. Domain Experience Catalog Grid */}
      <section className="reveal-up reveal-delay-2 space-y-4">
        
        {/* Section Header with Integrated Domain Filter */}
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
            {/* Domain Filter Input */}
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
              Xem tất cả 24 ứng dụng
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {visibleDomains.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleDomains.map((domain, index) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                index={index}
                onClick={() => openDomain(domain.id)}
              />
            ))}
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
              <p className="mt-1 text-xs text-slate">Thử tìm kiếm với từ khóa khác như "kho", "tài chính", "bán hàng"...</p>
              <button
                className="mt-4 rounded-xl border border-slate/20 bg-white px-4 py-2 text-xs font-bold text-navy hover:bg-offwhite"
                onClick={() => setQuery("")}
              >
                Xóa bộ lọc tìm kiếm
              </button>
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

function DomainCard({ domain, index, onClick }: { domain: LearningDomain; index: number; onClick: () => void }) {
  const Icon = domainIcons[domain.icon];
  const trans = domainTranslations[domain.id] || {
    title: domain.name,
    subtitle: domain.shortName,
    desc: domain.description,
    tag: `${domain.applicationIds.length} Ứng dụng`,
  };
  const available = learningApplications.filter(
    (item) => item.domainId === domain.id && item.status !== "coming-soon"
  ).length;

  return (
    <button
      onClick={onClick}
      className="reveal-up group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-slate/15 bg-white p-5 text-left shadow-[0_4px_20px_rgba(16,42,67,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-[0_16px_36px_rgba(16,42,67,0.08)]"
      style={{ animationDelay: `${index * 50 + 100}ms` }}
    >
      {/* Top Accent Line */}
      <span
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: domain.color }}
      />

      <div>
        <div className="flex items-start justify-between gap-3">
          <span
            className="grid h-12 w-12 place-items-center rounded-2xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundColor: domain.color }}
          >
            <Icon size={22} />
          </span>
          <span className="rounded-full bg-offwhite border border-slate/10 px-2.5 py-1 text-[11px] font-bold text-slate">
            {trans.tag}
          </span>
        </div>

        <h3 className="mt-4 font-display text-base font-bold text-navy group-hover:text-brass transition-colors">
          {trans.title}
        </h3>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate/75">
          {trans.subtitle}
        </p>

        <p className="mt-2.5 min-h-12 text-xs leading-relaxed text-slate">
          {trans.desc}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate/10 pt-3.5 text-xs">
        <span className="text-[11px] font-medium text-slate">
          {available} kịch bản khả dụng
        </span>
        <span className="flex items-center gap-1 font-bold text-navy group-hover:text-brass transition-colors">
          Khám phá
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </button>
  );
}
