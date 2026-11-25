import { useEffect, useState } from "react";
import { ArrowRight, Boxes, Clock3, Filter, Loader2, Search, Sparkles, Tag, Users } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import {
  catalogService,
  type ApplicationItem,
  type IndustryItem,
  type ScenarioItem as ApiScenarioItem,
} from "../../services/catalogService";
import { commerceService, entitlementCoversScenario, type EntitlementDto } from "../../services/commerceService";
import { difficultyLabelVi } from "../commerce/scenarioPricing";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

interface LocalScenarioItem {
  id: string | number;
  scenarioVersionId?: number;
  title: string;
  domain: string;
  description: string;
  level: "Cơ bản" | "Trung cấp" | "Nâng cao";
  duration: string;
  people: string;
  techniques: string[];
  image: string;
  active: boolean;
  owned: boolean;
  isFree: boolean;
  progress?: number;
}

export function ScenarioLibraryPage({
  navigate,
  initialAppId,
  initialIndustryId,
  embedded = false,
  hideFilters = false,
}: {
  navigate: (route: RouteKey) => void;
  initialAppId?: number | "all";
  initialIndustryId?: number | "all";
  embedded?: boolean;
  hideFilters?: boolean;
}) {
  const { setCurrentScenarioVersionId } = useApp();

  // FE-06: 3-Tier Filter State directly from API
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [apiScenarios, setApiScenarios] = useState<ApiScenarioItem[]>([]);
  const [entitlements, setEntitlements] = useState<EntitlementDto[]>([]);

  const [selectedIndustryId, setSelectedIndustryId] = useState<number | "all">(initialIndustryId ?? "all");
  const [selectedAppId, setSelectedAppId] = useState<number | "all">(initialAppId ?? "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialAppId !== undefined) {
      setSelectedAppId(initialAppId);
    }
  }, [initialAppId]);

  useEffect(() => {
    if (initialIndustryId !== undefined) {
      setSelectedIndustryId(initialIndustryId);
      if (!hideFilters && initialAppId === undefined) {
        setSelectedAppId("all");
      }
    }
  }, [initialIndustryId, hideFilters, initialAppId]);

  // 1. Tải danh mục ngành khi mở màn hình: GET /api/industries
  useEffect(() => {
    if (hideFilters) return;
    async function loadIndustries() {
      try {
        const data = await catalogService.getIndustries();
        if (data && data.length > 0) {
          setIndustries(data);
        }
      } catch (err) {
        console.warn("Không tải được danh mục ngành từ API:", err);
      }
    }
    loadIndustries();
  }, [hideFilters]);

  // 2. Tải danh mục ứng dụng khi ngành thay đổi: GET /api/applications?industryId={id}
  useEffect(() => {
    if (hideFilters) return;
    async function loadApplications() {
      try {
        const indId = selectedIndustryId === "all" ? undefined : selectedIndustryId;
        const data = await catalogService.getApplications(indId);
        setApplications(data || []);
      } catch (err) {
        console.warn("Lỗi tải danh mục ứng dụng:", err);
      }
    }
    loadApplications();
    setSelectedAppId("all");
  }, [selectedIndustryId, hideFilters]);

  // 3. Tải danh mục kịch bản khi ứng dụng thay đổi: GET /api/scenarios?applicationId={id}&isPublished=true
  useEffect(() => {
    async function loadScenarios() {
      setLoading(true);
      try {
        const appId = selectedAppId === "all" ? undefined : selectedAppId;
        const [data, owned] = await Promise.all([
          catalogService.getScenarios(appId, true),
          commerceService.getMyEntitlements().catch(() => [] as EntitlementDto[]),
        ]);
        setApiScenarios(data || []);
        setEntitlements(owned);
      } catch (err) {
        console.warn("Lỗi tải kịch bản từ server:", err);
      } finally {
        setLoading(false);
      }
    }
    loadScenarios();
  }, [selectedAppId]);

  const displayScenarios: LocalScenarioItem[] = apiScenarios.map((s) => {
    const isFree = Boolean(s.isFreeAccess);
    const owned = entitlementCoversScenario(entitlements, {
      scenarioId: s.id,
      versionId: s.publishedVersionId || s.id,
      applicationId: s.applicationId,
      industryId: applications.find((app) => app.id === s.applicationId)?.industry.id,
      isFreeAccess: isFree,
    });
    const code = (s.code || "").toUpperCase();
    const appCode = (s.application?.code || "").toUpperCase();
    const techniquesByCode: Record<string, string[]> = {
      "BEG-OMS-01": ["Phỏng vấn stakeholder", "As-is / to-be trạng thái đơn", "User story + AC"],
      "BEG-WMS-01": ["Phỏng vấn ca kho lạnh", "Phân mức cảnh báo IoT", "Nhật ký sự cố tối thiểu"],
      "BEG-LOS-01": ["Phỏng vấn Credit Ops", "Taxonomy hold eKYC", "User story màn hình Ops"],
      "BEG-PROMO-01": ["Phỏng vấn Marketing/POS", "Điều kiện voucher", "Acceptance Criteria"],
      "BEG-CAFE-01": ["Phỏng vấn quán F&B", "Checklist đặt hàng tuần", "User story + AC"],
      "OMNI-001": ["Phỏng vấn đào sâu", "Business Rules", "BRD / SRS / RTM"],
      "SCM-001": ["Khảo sát kho lạnh", "Quy tắc GSP/FEFO", "Impact analysis sự cố"],
      "FIN-001": ["Phỏng vấn rủi ro tín dụng", "eKYC & Decision Engine", "BRD Digital LOS"],
      "RET-001": ["Quy tắc khuyến mãi", "Chống cộng dồn voucher", "POS × App sync"],
    };
    const techniquesByApp: Record<string, string[]> = {
      OMS: ["Order lifecycle", "Đồng bộ đa kênh", "Elicitation"],
      WMS_COLD: ["Cold-chain WMS", "Cảnh báo nhiệt độ", "Elicitation"],
      DIGITAL_LOS: ["eKYC", "Credit ops queue", "Elicitation"],
      LMS_PROMO: ["Promotion rules", "POS × App", "Elicitation"],
      CAFE_OPS: ["Cafe ordering", "Checklist tuần", "Elicitation"],
    };
    const imageByCode: Record<string, string> = {
      "BEG-OMS-01": "/images/landing/scenario-warehouse.webp",
      "BEG-WMS-01": "/images/landing/scenario-warehouse.webp",
      "BEG-LOS-01": "/images/landing/scenario-warehouse.webp",
      "BEG-PROMO-01": "/images/landing/scenario-warehouse.webp",
      "BEG-CAFE-01": "/images/landing/scenario-warehouse.webp",
    };
    return {
      id: s.code || s.id,
      scenarioVersionId: s.publishedVersionId || s.id,
      title: s.title,
      domain: s.application?.name || "Chuỗi cung ứng & Bán lẻ",
      description: s.description || "Thực hành phân tích yêu cầu nghiệp vụ chuyên sâu.",
      level: difficultyLabelVi(s.difficulty),
      duration: code.startsWith("BEG-") ? "60–90 phút" : "90 phút",
      people: "Stakeholder AI",
      techniques:
        techniquesByCode[code] ||
        techniquesByApp[appCode] || ["Phỏng vấn stakeholder", "As-is / to-be", "User story"],
      image: imageByCode[code] || "/images/landing/scenario-warehouse.webp",
      active: true,
      owned,
      isFree,
    };
  });

  const filtered = displayScenarios.filter((s) => {
    const matchQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.techniques.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchQuery;
  });

  const handleSelectScenario = (scenario: LocalScenarioItem) => {
    if (scenario.scenarioVersionId) {
      setCurrentScenarioVersionId(scenario.scenarioVersionId);
    }
    // Free / owned → vào detail; chưa mua → vẫn vào detail để CTA mua đúng kịch bản
    navigate("scenario-detail");
  };

  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow="Thư viện kịch bản · BABOK® v3 Practice"
          title="Kịch bản mô phỏng doanh nghiệp"
          description="Lựa chọn bối cảnh doanh nghiệp thực tế từ Database để rèn luyện kỹ năng khơi gợi yêu cầu, phân tích xung đột và lập tài liệu chuẩn quốc tế."
        />
      )}

      {!hideFilters && (
        <Card className="mt-2 p-2.5 sm:p-3 border-slate/15 bg-white shadow-2xs">
          <div className="grid gap-2.5 sm:grid-cols-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
                1. Ngành nghề (Industry)
              </label>
              <select
                value={selectedIndustryId}
                onChange={(e) =>
                  setSelectedIndustryId(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="h-8 w-full rounded-lg border border-slate/20 bg-white px-2.5 text-xs font-semibold text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy/15 transition-colors"
              >
                <option value="all">Tất cả ngành nghề ({industries.length})</option>
                {industries.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name} ({ind.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
                2. Ứng dụng (Application)
              </label>
              <select
                value={selectedAppId}
                onChange={(e) =>
                  setSelectedAppId(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="h-8 w-full rounded-lg border border-slate/20 bg-white px-2.5 text-xs font-semibold text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy/15 transition-colors"
              >
                <option value="all">Tất cả ứng dụng ({applications.length})</option>
                {applications.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy mb-1">
                3. Từ khóa tìm kiếm
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên kịch bản, kỹ thuật..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full rounded-lg border border-slate/20 bg-white pl-8 pr-2.5 text-xs font-semibold text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy/15 transition-colors"
                />
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate" size={13} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Danh sách kịch bản */}
      <div className="mt-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate text-xs">
            <Loader2 className="animate-spin text-navy mb-2" size={20} />
            Đang tải kịch bản từ máy chủ Database...
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-6 text-center border-dashed border-slate/30">
            <Filter className="mx-auto text-slate/50 mb-2" size={28} />
            <p className="text-xs font-bold text-navy">Chưa có kịch bản cho ứng dụng này</p>
            {!hideFilters && (
              <>
                <p className="text-[11px] text-slate mt-0.5">
                  Vui lòng thử chọn ngành nghề khác hoặc xóa từ khóa tìm kiếm.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    setSelectedIndustryId("all");
                    setSelectedAppId("all");
                    setSearchQuery("");
                  }}
                >
                  Đặt lại bộ lọc
                </Button>
              </>
            )}
          </Card>
        ) : (
          <div className="grid gap-3.5 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((scenario) => (
              <Card
                key={scenario.id}
                className="group flex flex-col justify-between overflow-hidden border-slate/15 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <div className="relative h-28 sm:h-30 overflow-hidden bg-navy-deep">
                    <img
                      src={scenario.image}
                      alt={scenario.title}
                      className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      <Badge tone="navy" className="bg-white/90 text-navy backdrop-blur-xs font-semibold text-[9px] px-1.5 py-0">{scenario.domain}</Badge>
                      <Badge tone="amber" className="bg-amber-100/90 text-amber-900 backdrop-blur-xs font-semibold text-[9px] px-1.5 py-0">{scenario.level}</Badge>
                      {scenario.isFree ? (
                        <Badge tone="green" className="bg-emerald-100/95 text-emerald-900 backdrop-blur-xs font-semibold text-[9px] px-1.5 py-0">
                          Miễn phí
                        </Badge>
                      ) : (
                        <Badge tone={scenario.owned ? "green" : "red"} className="bg-white/90 backdrop-blur-xs font-semibold text-[9px] px-1.5 py-0">
                          {scenario.owned ? "Đã mở" : "Trả phí"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate">
                      <span>Mã: {scenario.id}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock3 size={11} /> {scenario.duration}
                      </span>
                    </div>

                    <h3 className="mt-1 font-display text-sm font-bold text-navy group-hover:text-brass transition-colors line-clamp-1" title={scenario.title}>
                      {scenario.title}
                    </h3>

                    <p className="mt-1 text-[11px] text-slate line-clamp-2 leading-snug">
                      {scenario.description}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {scenario.techniques.map((tech) => (
                        <span
                          key={tech}
                          className="rounded bg-offwhite px-1.5 py-0.5 text-[9px] font-medium text-slate"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate/10 p-2.5">
                  <Button
                    size="sm"
                    className="w-full justify-center h-8.5 text-xs font-bold shadow-2xs cursor-pointer"
                    onClick={() => handleSelectScenario(scenario)}
                  >
                    <span>
                      {scenario.isFree
                        ? "Vào học miễn phí"
                        : scenario.owned
                          ? "Vào kịch bản đã mở"
                          : "Xem & mua kịch bản"}
                    </span>
                    <ArrowRight size={13} className="ml-1.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
