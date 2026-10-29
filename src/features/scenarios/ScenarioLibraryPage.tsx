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
  progress?: number;
}

const defaultLocalScenarios: LocalScenarioItem[] = [
  {
    id: "INV-2026-014",
    scenarioVersionId: 1,
    title: "Quản lý tồn kho & Điều phối chuỗi cung ứng",
    domain: "Chuỗi cung ứng",
    description:
      "Phân tích tình trạng đứt gãy tồn kho, đối soát chênh lệch dữ liệu giữa hệ thống POS, WMS và ERP trên mạng lưới 1 tổng kho và 20 cửa hàng.",
    level: "Trung cấp",
    duration: "90 phút",
    people: "6 Stakeholder AI",
    techniques: ["Phỏng vấn đào sâu", "Mô hình hóa BPMN", "Ma trận truy vết RTM", "Phân tích nguyên nhân gốc"],
    image: "/images/landing/scenario-warehouse.webp",
    active: true,
    progress: 42,
  },
  {
    id: "RET-2026-003",
    scenarioVersionId: 2,
    title: "Cải tiến xử lý đơn hàng & Điểm bán lẻ POS đa kênh (OmniMart)",
    domain: "Bán lẻ",
    description:
      "Phân tích nguyên nhân chênh lệch tồn kho giữa website và cửa hàng, tối ưu hóa quy trình bán hàng tại quầy POS và chính sách đổi trả hàng đa kênh.",
    level: "Cơ bản",
    duration: "60 phút",
    people: "5 Stakeholder AI",
    techniques: ["Quan sát hiện trường", "Biểu đồ xương cá", "Đặc tả quy tắc nghiệp vụ", "User Story Mapping"],
    image: "/images/landing/theme-evidence.webp",
    active: false,
  },
  {
    id: "FIN-2026-008",
    scenarioVersionId: 3,
    title: "Tự động hóa đối soát hóa đơn & Phê duyệt hạn mức thanh toán",
    domain: "Tài chính",
    description:
      "Thiết kế quy trình đối soát 3 chiều tự động giữa đơn mua, biên bản nghiệm thu và hóa đơn tài chính, rút ngắn chu kỳ thanh toán công nợ nhà cung cấp.",
    level: "Nâng cao",
    duration: "75 phút",
    people: "5 Stakeholder AI",
    techniques: ["Phân tích tác động", "Cây quyết định", "Sơ đồ luồng dữ liệu DFD", "Đặc tả Use Case"],
    image: "/images/landing/workspace-learner.webp",
    active: false,
  },
];

const fallbackIndustries: IndustryItem[] = [
  { id: 1, code: "RETAIL", name: "Bán lẻ", description: "Bán lẻ đa kênh OmniMart, POS, thương mại điện tử", status: "Active", displayOrder: 1 },
  { id: 2, code: "SUPPLY_CHAIN", name: "Chuỗi cung ứng", description: "Logistics, kho vận WMS, thu mua và điều phối", status: "Active", displayOrder: 2 },
  { id: 3, code: "FINANCE", name: "Tài chính", description: "Kế toán, kiểm toán, ngân hàng và đối soát hóa đơn", status: "Active", displayOrder: 3 },
];

export function ScenarioLibraryPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { setCurrentScenarioVersionId } = useApp();

  // FE-06: 3-Tier Filter State
  const [industries, setIndustries] = useState<IndustryItem[]>(fallbackIndustries);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [apiScenarios, setApiScenarios] = useState<ApiScenarioItem[]>([]);

  const [selectedIndustryId, setSelectedIndustryId] = useState<number | "all">("all");
  const [selectedAppId, setSelectedAppId] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Tải danh mục ngành khi mở màn hình: GET /api/industries
  useEffect(() => {
    async function loadIndustries() {
      try {
        const data = await catalogService.getIndustries();
        if (data && data.length > 0) {
          setIndustries(data);
        }
      } catch (err) {
        console.warn("Không tải được danh mục ngành từ API, sử dụng dữ liệu mặc định:", err);
      }
    }
    loadIndustries();
  }, []);

  // 2. Tải danh mục ứng dụng khi ngành thay đổi: GET /api/applications?industryId={id}
  useEffect(() => {
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
  }, [selectedIndustryId]);

  // 3. Tải danh mục kịch bản khi ứng dụng thay đổi: GET /api/scenarios?applicationId={id}&isPublished=true
  useEffect(() => {
    async function loadScenarios() {
      setLoading(true);
      try {
        const appId = selectedAppId === "all" ? undefined : selectedAppId;
        const data = await catalogService.getScenarios(appId, true);
        setApiScenarios(data || []);
      } catch (err) {
        console.warn("Lỗi tải kịch bản:", err);
      } finally {
        setLoading(false);
      }
    }
    loadScenarios();
  }, [selectedAppId]);

  // Kết hợp danh sách hiển thị
  const displayScenarios: LocalScenarioItem[] =
    apiScenarios.length > 0
      ? apiScenarios.map((s, index) => ({
          id: s.code || s.id,
          scenarioVersionId: s.id,
          title: s.title,
          domain: s.application?.name || "Chuỗi cung ứng & Bán lẻ",
          description: s.description || "Thực hành phân tích yêu cầu nghiệp vụ chuyên sâu.",
          level: "Trung cấp",
          duration: "90 phút",
          people: "6 Stakeholder AI",
          techniques: ["Phỏng vấn đào sâu", "Mô hình hóa BPMN", "Ma trận truy vết RTM"],
          image: defaultLocalScenarios[index % defaultLocalScenarios.length].image,
          active: true,
        }))
      : defaultLocalScenarios;

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
    navigate("scenario-detail");
  };

  return (
    <>
      <PageHeader
        eyebrow="Thư viện kịch bản · BABOK® v3 Practice"
        title="Kịch bản mô phỏng doanh nghiệp"
        description="Lựa chọn bối cảnh doanh nghiệp thực tế để rèn luyện kỹ năng khơi gợi yêu cầu, phân tích xung đột và lập tài liệu chuẩn quốc tế."
      />

      {/* FE-06: Bộ lọc 3 cấp (Ngành -> Ứng dụng -> Từ khóa) */}
      <Card className="mt-4 p-4 border-slate/15 bg-white shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Cấp 1: Ngành (GET /api/industries) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
              1. Ngành nghề (Industry)
            </label>
            <select
              value={selectedIndustryId}
              onChange={(e) =>
                setSelectedIndustryId(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="h-10 w-full rounded-xl border border-slate/20 bg-white px-3 text-xs font-semibold text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            >
              <option value="all">Tất cả ngành nghề</option>
              {industries.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cấp 2: Ứng dụng nghiệp vụ (GET /api/applications) */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
              2. Phân hệ ứng dụng (Application)
            </label>
            <select
              value={selectedAppId}
              onChange={(e) =>
                setSelectedAppId(e.target.value === "all" ? "all" : Number(e.target.value))
              }
              className="h-10 w-full rounded-xl border border-slate/20 bg-white px-3 text-xs font-semibold text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
            >
              <option value="all">Tất cả ứng dụng</option>
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name} ({app.code})
                </option>
              ))}
            </select>
          </div>

          {/* Cấp 3: Tìm kiếm từ khóa */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy mb-1">
              3. Tìm kiếm kịch bản
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" size={15} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên, kỹ năng hoặc bài toán..."
                className="h-10 w-full rounded-xl border border-slate/20 bg-white pl-9 pr-3 text-xs text-navy outline-none placeholder:text-slate/60 focus:border-navy focus:ring-2 focus:ring-navy/10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Grid danh sách kịch bản (FE-06) */}
      <div className="mt-6">
        {loading ? (
          <div className="flex h-48 items-center justify-center text-xs text-slate">
            <Loader2 className="animate-spin text-brass mr-2" size={18} /> Đang tải danh sách kịch bản...
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((scenario) => (
              <Card
                key={scenario.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border-slate/15 transition-all duration-300 hover:-translate-y-1 hover:border-navy/30 hover:shadow-xl"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-navy-deep">
                    <img
                      src={scenario.image}
                      alt={scenario.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-transparent" />
                    <div className="absolute left-3 top-3 flex gap-2">
                      <Badge tone={scenario.active ? "green" : "gray"}>
                        {scenario.active ? "Sẵn sàng thực hành" : "Sắp ra mắt"}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-brass-light">
                        {scenario.id}
                      </p>
                      <h2 className="mt-0.5 line-clamp-1 font-display text-base font-bold text-white group-hover:text-brass transition-colors">
                        {scenario.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="line-clamp-2 text-xs leading-relaxed text-slate">
                      {scenario.description}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {scenario.techniques.slice(0, 3).map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-offwhite px-2 py-0.5 text-[10px] font-medium text-navy border border-slate/10"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate/10 p-4 pt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate font-medium mb-3">
                    <span className="flex items-center gap-1">
                      <Clock3 size={13} className="text-brass" /> {scenario.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={13} className="text-brass" /> {scenario.people}
                    </span>
                    <span className="rounded bg-navy/10 px-1.5 py-0.2 font-bold text-navy text-[10px]">
                      {scenario.level}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleSelectScenario(scenario)}
                    className="w-full justify-center gap-1.5 text-xs font-bold py-2.5"
                  >
                    Xem chi tiết đề bài <ArrowRight size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate/20 p-8 text-center text-xs text-slate">
            Không tìm thấy kịch bản nào phù hợp với bộ lọc hiện tại.
          </div>
        )}
      </div>
    </>
  );
}
