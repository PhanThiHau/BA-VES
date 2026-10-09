import { ArrowRight, Boxes, CheckCircle2, Clock3, Filter, Layers, Search, Sparkles, Tag, Users } from "lucide-react";
import { useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

interface ScenarioItem {
  id: string;
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

const scenarioList: ScenarioItem[] = [
  {
    id: "INV-2026-014",
    title: "Quản lý tồn kho & Điều phối chuỗi cung ứng",
    domain: "Chuỗi cung ứng & Bán lẻ",
    description: "Phân tích tình trạng đứt gãy tồn kho, đối soát chênh lệch dữ liệu giữa hệ thống POS, WMS và ERP trên mạng lưới 1 tổng kho và 20 cửa hàng.",
    level: "Trung cấp",
    duration: "90 phút",
    people: "6 Stakeholder AI",
    techniques: ["Phỏng vấn đào sâu", "Mô hình hóa BPMN", "Ma trận truy vết RTM", "Phân tích nguyên nhân gốc"],
    image: "/images/landing/scenario-warehouse.webp",
    active: true,
    progress: 42,
  },
  {
    id: "REC-2026-008",
    title: "Kiểm soát số lô & Thu hồi sản phẩm lỗi",
    domain: "Sản xuất & Truy xuất nguồn gốc",
    description: "Thiết kế quy trình truy vết 2 chiều (end-to-end) từ nhà cung cấp nguyên liệu đến khách hàng cuối khi lô hàng không đạt tiêu chuẩn kiểm nghiệm vi sinh.",
    level: "Nâng cao",
    duration: "75 phút",
    people: "5 Stakeholder AI",
    techniques: ["Phân tích tác động", "Cây quyết định", "Sơ đồ luồng dữ liệu DFD", "Đặc tả Use Case"],
    image: "/images/landing/workspace-learner.webp",
    active: false,
  },
  {
    id: "VAR-2026-003",
    title: "Giảm thiểu sai lệch kiểm kê tại chuỗi cửa hàng",
    domain: "Bán lẻ đa kênh",
    description: "Phân tích nguyên nhân chênh lệch giữa số tồn vật lý và số sổ sách qua quy trình Cycle-Count, đề xuất quy tắc kiểm soát và cải tiến phần mềm POS.",
    level: "Cơ bản",
    duration: "60 phút",
    people: "4 Stakeholder AI",
    techniques: ["Quan sát hiện trường", "Biểu đồ xương cá", "Đặc tả quy tắc nghiệp vụ"],
    image: "/images/landing/theme-evidence.webp",
    active: false,
  },
];

const domainFilters = [
  "Tất cả",
  "Chuỗi cung ứng & Bán lẻ",
  "Sản xuất & Truy xuất nguồn gốc",
  "Bán lẻ đa kênh",
];

export function ScenarioLibraryPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const [selectedDomain, setSelectedDomain] = useState("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = scenarioList.filter((s) => {
    const matchDomain = selectedDomain === "Tất cả" || s.domain === selectedDomain;
    const matchQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.techniques.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchDomain && matchQuery;
  });

  return (
    <>
      <PageHeader
        eyebrow="Thư viện kịch bản · BABOK® v3 Practice"
        title="Kịch bản mô phỏng doanh nghiệp"
        description="Lựa chọn bối cảnh doanh nghiệp thực tế để rèn luyện kỹ năng khơi gợi yêu cầu, phân tích xung đột và lập tài liệu chuẩn quốc tế."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/30 bg-brass/10 px-3 py-1 text-xs font-semibold text-brass">
              <Sparkles size={14} /> 3 Kịch bản sẵn sàng
            </span>
          </div>
        }
      />

      {/* Filter & Search Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-slate/15 bg-white p-3 shadow-sm sm:flex-row sm:items-center">
          <label className="flex min-h-11 flex-1 items-center gap-3 rounded-xl bg-mist/30 px-4 text-slate">
            <Search size={18} className="shrink-0 text-slate" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-navy placeholder:text-slate/70 outline-none"
              placeholder="Tìm kiếm theo kịch bản, kỹ thuật (BPMN, RTM, Phỏng vấn) hoặc mã case..."
            />
          </label>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="border-slate/20 text-xs">
              <Filter size={15} /> Bộ lọc nâng cao
            </Button>
          </div>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {domainFilters.map((domain) => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={classNames(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-all",
                selectedDomain === domain
                  ? "bg-navy text-white shadow-sm"
                  : "border border-slate/15 bg-white text-slate hover:bg-mist/30 hover:text-navy"
              )}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {filtered.map((scenario) => (
          <Card
            key={scenario.id}
            className="group flex flex-col overflow-hidden border-slate/15 transition-all duration-300 hover:-translate-y-1 hover:border-slate/30 hover:shadow-lg"
          >
            {/* Visual Thumbnail */}
            <div className="relative h-44 w-full overflow-hidden bg-navy-deep">
              <img
                src={scenario.image}
                alt={scenario.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/40 to-transparent" />
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-navy-deep/80 px-2.5 py-1 font-mono text-[11px] font-bold text-white/90 backdrop-blur-sm">
                  {scenario.id}
                </span>
                <span className="rounded-md bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  {scenario.domain}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <Badge
                  tone={
                    scenario.active
                      ? "green"
                      : scenario.level === "Nâng cao"
                      ? "amber"
                      : "navy"
                  }
                >
                  {scenario.active ? `Đang học · ${scenario.progress}%` : scenario.level}
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-medium text-white/70">Mô phỏng doanh nghiệp ảo</p>
                <h3 className="mt-0.5 line-clamp-1 text-base font-bold text-white">
                  {scenario.title}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col p-6">
              <p className="line-clamp-3 text-sm leading-6 text-slate">
                {scenario.description}
              </p>

              {/* Techniques Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {scenario.techniques.map((tech) => (
                  <span
                    key={tech}
                    className="inline-flex items-center gap-1 rounded-md bg-mist/40 px-2 py-0.5 text-[11px] font-medium text-navy/80"
                  >
                    <Tag size={10} className="text-brass" /> {tech}
                  </span>
                ))}
              </div>

              {/* Meta stats */}
              <div className="mt-6 flex items-center justify-between border-t border-slate/10 pt-4 text-xs font-semibold text-slate">
                <span className="flex items-center gap-1.5">
                  <Clock3 size={15} className="text-brass" />
                  {scenario.duration}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={15} className="text-navy" />
                  {scenario.people}
                </span>
              </div>

              {/* CTA Action Button */}
              <div className="mt-5 pt-1">
                <Button
                  onClick={() => navigate("scenario-detail")}
                  className={classNames(
                    "w-full justify-center gap-2",
                    scenario.active
                      ? "bg-navy hover:bg-navy-light"
                      : "border border-slate/20 bg-white text-navy hover:bg-mist/30"
                  )}
                >
                  {scenario.active ? "Tiếp tục thực hành" : "Xem chi tiết kịch bản"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate/20 bg-white p-12 text-center">
          <Boxes size={36} className="mx-auto text-slate/40" />
          <h3 className="mt-3 text-base font-bold text-navy">Không tìm thấy kịch bản phù hợp</h3>
          <p className="mt-1 text-sm text-slate">Thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc.</p>
        </div>
      )}
    </>
  );
}
