import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Boxes, BriefcaseBusiness, Building2, Check, Clock3, Factory, FolderKanban, Landmark, Search, SlidersHorizontal, Sparkles, Users } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { learningApplications, learningDomains } from "../../constants/learningCatalog";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";

const domainIcons = {
  boxes: Boxes,
  sales: BriefcaseBusiness,
  finance: Landmark,
  factory: Factory,
  people: Users,
  project: FolderKanban,
};

const domainNamesVi: Record<string, string> = {
  "supply-chain": "Chuỗi cung ứng & Kho vận",
  "sales-customer": "Kinh doanh & Khách hàng",
  finance: "Tài chính & Kế toán",
  manufacturing: "Sản xuất & Vận hành",
  "human-resources": "Quản trị Nhân sự",
  "project-operations": "Dự án & Dịch vụ",
};

const statusLabel = {
  available: { text: "Khả dụng", tone: "green" as const },
  beta: { text: "Thử nghiệm", tone: "amber" as const },
  "coming-soon": { text: "Sắp ra mắt", tone: "gray" as const },
};

const levelLabelsVi: Record<string, string> = {
  Beginner: "Cơ bản",
  Intermediate: "Trung cấp",
  Advanced: "Nâng cao",
};

const pageSize = 9;

export function ApplicationsPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { selectedDomainId, setSelectedDomainId } = useApp();
  const [query, setQuery] = useState("");
  const [interestedApps, setInterestedApps] = useState<string[]>(["inventory"]);
  const [page, setPage] = useState(1);
  const selectedDomain = learningDomains.find((domain) => domain.id === selectedDomainId);

  const visibleApps = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("en");
    return learningApplications.filter((application) => {
      const domain = learningDomains.find((item) => item.id === application.domainId);
      const matchesDomain = selectedDomainId === "all" || application.domainId === selectedDomainId;
      const domainVi = domainNamesVi[application.domainId] || "";
      const matchesQuery =
        !normalized ||
        `${application.name} ${application.description} ${domain?.name ?? ""} ${domainVi}`
          .toLocaleLowerCase("en")
          .includes(normalized);
      return matchesDomain && matchesQuery;
    });
  }, [query, selectedDomainId]);

  const pageCount = Math.max(1, Math.ceil(visibleApps.length / pageSize));
  const pagedApps = visibleApps.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => setPage(1), [query, selectedDomainId]);

  const toggleInterest = (id: string) =>
    setInterestedApps((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );

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
            Danh mục ứng dụng nghiệp vụ · 24 Phân hệ
          </div>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            {selectedDomain
              ? domainNamesVi[selectedDomain.id] || selectedDomain.name
              : "Tất cả ứng dụng nghiệp vụ"}
          </h1>
          <p className="mt-1 text-xs text-slate">
            Khám phá các phân hệ nghiệp vụ để thực hành phân tích yêu cầu và bàn giao hồ sơ chuẩn BABOK® v3.
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
          Tất cả (24)
        </button>
        {learningDomains.map((domain) => {
          const active = selectedDomainId === domain.id;
          return (
            <button
              key={domain.id}
              onClick={() => setSelectedDomainId(domain.id)}
              className={`shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all duration-200 ${
                active
                  ? "border-navy bg-navy text-white shadow-sm"
                  : "border-slate/20 bg-white text-slate hover:border-slate/40 hover:text-navy"
              }`}
            >
              {domainNamesVi[domain.id] || domain.name}
            </button>
          );
        })}
        <span className="ml-auto shrink-0 pl-3 text-xs text-slate">
          Hiển thị <strong className="text-navy">{visibleApps.length}</strong> ứng dụng
        </span>
      </div>

      {/* Applications Grid */}
      {visibleApps.length > 0 ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
            {pagedApps.map((application) => {
              const domain = learningDomains.find((item) => item.id === application.domainId)!;
              const Icon = domainIcons[domain.icon];
              const selected = interestedApps.includes(application.id);
              const state = statusLabel[application.status];

              return (
                <Card
                  key={application.id}
                  className="reveal-up group relative flex min-h-[270px] flex-col justify-between overflow-hidden rounded-[24px] border border-slate/15 bg-white p-5 shadow-[0_4px_20px_rgba(16,42,67,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-[0_16px_36px_rgba(16,42,67,0.08)]"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-sm transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundColor: application.accent }}
                      >
                        <Icon size={20} />
                      </span>
                      <Badge tone={state.tone}>{state.text}</Badge>
                    </div>

                    <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-slate/75">
                      {domainNamesVi[domain.id] || domain.name}
                    </p>
                    <h2 className="mt-0.5 font-display text-base font-bold text-navy group-hover:text-brass transition-colors">
                      {application.name}
                    </h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate">
                      {application.description}
                    </p>
                  </div>

                  <div>
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-slate/10 pt-3 text-[11px] font-medium text-slate">
                      <span className="flex items-center gap-1.5">
                        <Building2 size={13} className="text-brass" />
                        {application.scenarioCount} kịch bản
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock3 size={13} className="text-brass" />
                        {application.duration}
                      </span>
                      <span className="rounded bg-offwhite px-1.5 py-0.2 font-semibold text-navy">
                        {levelLabelsVi[application.level] || application.level}
                      </span>
                    </div>

                    <div className="mt-4">
                      {application.id === "inventory" ? (
                        <button
                          className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-navy-deep hover:-translate-y-0.5"
                          onClick={() => navigate("scenarios")}
                        >
                          Vào lộ trình đào tạo
                          <ArrowRight size={14} />
                        </button>
                      ) : (
                        <button
                          className={`flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border text-xs font-bold transition-all ${
                            selected
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate/20 bg-white text-navy hover:bg-offwhite"
                          }`}
                          onClick={() => toggleInterest(application.id)}
                        >
                          {selected ? (
                            <>
                              <Check size={14} /> Đã lưu vào lộ trình
                            </>
                          ) : application.status === "coming-soon" ? (
                            "Nhận thông báo khi mở"
                          ) : (
                            "Khám phá phân hệ"
                          )}
                        </button>
                      )}
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
