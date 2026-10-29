import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  Sparkles,
  Target,
  Users,
  Waypoints,
} from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { catalogService, type ScenarioContextDto } from "../../services/catalogService";
import { simulationService } from "../../services/simulationService";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";

const systems = [
  [
    "Hệ thống POS Cửa hàng",
    "20 cửa hàng",
    "Gửi giao dịch bán theo lô (batch), thường xuyên bị trễ từ 30–90 phút so với thực tế.",
  ],
  [
    "Phần mềm WMS Kho vận",
    "Tổng kho DC + 3 kho vùng",
    "Quản lý đóng gói (picking), điều chuyển nội bộ, hàng trả về và điều chỉnh số lượng tồn.",
  ],
  [
    "Hệ thống ERP Tài chính",
    "Khối Kế toán - Tài chính",
    "Ghi nhận giá trị tài sản kho, kỳ khóa sổ kế toán và kiểm soát phê duyệt bù trừ thất thoát.",
  ],
  [
    "Kế hoạch qua Excel",
    "Chuyên viên Kế hoạch (Planner)",
    "Dự báo nhu cầu, định mức min-max và chương trình khuyến mãi hiện vẫn tính thủ công.",
  ],
];

const handoverFiles = [
  [
    "Hồ sơ dự án (Project Brief v1.0)",
    "Mục tiêu tối ưu, ngân sách 4 tỷ VNĐ và phạm vi triển khai thử nghiệm 6 tháng.",
  ],
  [
    "Báo cáo tồn kho thực tế 31/08",
    "Số liệu snapshot theo từng mã SKU, kho vật lý và trạng thái hàng khả dụng (ATP).",
  ],
  [
    "SOP Quy trình Nhập & Trả hàng v2.1",
    "Quy trình kiểm đếm, lưu kho cách ly (quarantine) và xử lý đổi trả.",
  ],
  [
    "Đặc tả kỹ thuật API POS–WMS",
    "Luồng đồng bộ giao dịch hiện tại, mã lỗi kết nối và thời gian trễ dữ liệu.",
  ],
  [
    "Báo cáo mức độ phục vụ Quý 3",
    "Tỷ lệ đứt hàng (stockout 12%), tỷ lệ đáp ứng đơn hàng (fill rate) và độ chính xác tồn kho.",
  ],
];

const defaultAssignmentTasks = [
  "Làm rõ bài toán nghiệp vụ, phạm vi dự án và bộ chỉ số KPI đo lường",
  "Lập kế hoạch phỏng vấn và tiếp cận 6 Stakeholder AI chủ chốt",
  "Khơi gợi sự thật (facts), quy tắc ngầm, ngoại lệ và các ràng buộc",
  "Mô hình hóa quy trình hiện trạng As-Is và đề xuất quy trình tương lai To-Be",
  "Xử lý xung đột mục tiêu giữa Kho - Kế hoạch - Tài chính và sự kiện thay đổi",
  "Nghiệm thu và bàn giao bộ tài liệu đặc tả chuẩn truy vết (BRD, RTM, BPMN)",
];

export function ScenarioDetailPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { currentScenarioVersionId, setCurrentSessionId, setActiveAgents } = useApp();

  // FE-07: Load Scenario Context: GET /api/scenario-versions/{id}/context
  const [context, setContext] = useState<ScenarioContextDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const versionId = currentScenarioVersionId || 1;

  useEffect(() => {
    async function loadContext() {
      setLoading(true);
      try {
        const data = await catalogService.getScenarioContext(versionId);
        setContext(data);
      } catch (err) {
        console.warn("Không tải được bối cảnh từ API, hiển thị bối cảnh mẫu mặc định:", err);
      } finally {
        setLoading(false);
      }
    }
    loadContext();
  }, [versionId]);

  // FE-08: Bắt đầu làm bài / Khởi tạo phiên luyện tập: POST /api/sessions
  const handleStartSession = async (targetRoute: RouteKey = "planning") => {
    setStarting(true);
    setStartError(null);
    try {
      const session = await simulationService.startSession(versionId);
      setCurrentSessionId(session.id);
      if (session.agents && session.agents.length > 0) {
        setActiveAgents(session.agents);
      }
      navigate(targetRoute);
    } catch (err: any) {
      console.warn("Không thể tạo phiên qua API, vào phòng thực hành với dữ liệu offline:", err);
      navigate(targetRoute);
    } finally {
      setStarting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => navigate("scenarios")}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate transition-colors hover:text-navy"
      >
        <ArrowLeft size={16} /> Quay lại thư viện kịch bản
      </button>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {/* Main Hero Card with Visual Backdrop */}
          <Card className="overflow-hidden border-slate/15">
            <div className="relative overflow-hidden bg-navy-deep p-8 text-white sm:p-10">
              <img
                src="/images/landing/scenario-warehouse.webp"
                alt="Warehouse Scenario"
                className="absolute inset-0 h-full w-full object-cover opacity-20"
              />
              <div className="relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="navy">Chuỗi cung ứng</Badge>
                  <Badge tone="amber">Cấp độ: Trung cấp</Badge>
                  <Badge tone="green">Phiên thực hành chuẩn BABOK® v3</Badge>
                </div>
                <p className="mt-5 font-mono text-xs font-bold uppercase tracking-widest text-brass-light">
                  {context ? `${context.scenarioCode} · Phiên bản v${context.versionNo}` : "BÀI TOÁN DOANH NGHIỆP THỰC TẾ · INV-2026-014"}
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  {context?.scenarioTitle || "Quản lý tồn kho & Điều phối chuỗi cung ứng"}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
                  {context?.businessContext ||
                    "Bạn được giao trọng trách Business Analyst (BA) cho VinaSupply Retail. Doanh nghiệp vận hành 1 trung tâm phân phối chính (DC), 3 kho khu vực và 20 siêu thị bán lẻ. Tỷ lệ đứt gãy hàng hóa (stockout) đang ở mức 12%, trong khi dữ liệu tồn kho giữa POS, WMS và ERP lệch pha khiến khách hàng thất vọng và chi phí lưu kho tăng vọt."}
                </p>
              </div>
            </div>

            {/* FE-07: Context & Authority Grid */}
            <div className="p-7 sm:p-9">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Vấn đề nghiệp vụ (businessProblem) */}
                <div className="rounded-2xl border border-slate/10 bg-mist/20 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy/10 text-navy">
                      <Building2 size={20} />
                    </span>
                    <h2 className="text-base font-bold text-navy">Vấn đề cốt lõi (Business Problem)</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate">
                    {context?.businessProblem ||
                      "Hàng được giữ sai thời điểm, một số đơn bị xử lý trùng, quy trình hủy đơn và hoàn tiền chưa rõ ràng, và các phòng ban có kỳ vọng khác nhau về tốc độ cập nhật trạng thái tồn."}
                  </p>
                </div>

                {/* Mục tiêu nghiệp vụ (businessObjectives) */}
                <div className="rounded-2xl border border-slate/10 bg-mist/20 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-brass/10 text-brass">
                      <Target size={20} />
                    </span>
                    <h2 className="text-base font-bold text-navy">Mục tiêu giải pháp (Objectives)</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate">
                    {context?.businessObjectives ||
                      "Giảm tỷ lệ đứt hàng xuống dưới 5%, tăng tỷ lệ đáp ứng đơn hàng lên tối thiểu 96%, kiểm soát chi phí lưu kho tăng không quá 8% và đồng bộ luồng phê duyệt kế toán."}
                  </p>
                </div>
              </div>

              {/* Assignment Tasks Checklist */}
              <h2 className="mt-8 text-lg font-bold text-navy">Nhiệm vụ trọng tâm của bạn ({context?.baRole || "Business Analyst"})</h2>
              <p className="mt-1 text-xs text-slate">
                {context?.assignment || "Lập kế hoạch BA, phỏng vấn các stakeholder, phân tích thông tin và tạo hồ sơ BRD chuẩn."}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {defaultAssignmentTasks.map((task) => (
                  <div key={task} className="flex items-start gap-3 rounded-xl border border-slate/10 p-3.5">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-brass" size={18} />
                    <span className="text-sm font-medium text-navy/90">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Current System Landscape */}
          <Card className="overflow-hidden border-slate/15">
            <div className="flex items-center gap-3 border-b border-slate/10 p-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy/10 text-navy">
                <Database size={20} />
              </span>
              <div>
                <h2 className="text-base font-bold text-navy">Hệ thống công nghệ hiện hữu</h2>
                <p className="text-xs text-slate">Bức tranh công nghệ hiện tại giúp BA nhận diện nguồn dữ liệu và điểm đứt gãy thông tin.</p>
              </div>
            </div>
            <div className="grid gap-3.5 p-5 md:grid-cols-2">
              {systems.map(([name, owner, issue]) => (
                <div key={name} className="rounded-xl border border-slate/15 bg-mist/10 p-4 transition-colors hover:bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="text-sm font-bold text-navy">{name}</strong>
                    <span className="rounded-full bg-navy/10 px-2.5 py-0.5 text-[11px] font-bold text-navy">
                      {owner}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate">{issue}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Handover & Knowledge Boundaries */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 border-slate/15">
              <div className="flex items-center gap-3">
                <FileText className="text-navy" size={20} />
                <h2 className="font-display text-base font-bold text-navy">Tài liệu bàn giao ban đầu</h2>
              </div>
              <p className="mt-1 text-xs text-slate">BA cần đọc kỹ trước khi bắt đầu phỏng vấn</p>
              <div className="mt-4 space-y-3">
                {handoverFiles.map(([doc, summary]) => (
                  <div key={doc} className="rounded-xl border border-slate/15 bg-offwhite/50 p-3.5">
                    <p className="font-semibold text-xs text-navy">{doc}</p>
                    <p className="mt-1 text-xs text-slate leading-relaxed">{summary}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-slate/15">
              <div className="flex items-center gap-3">
                <Users className="text-brass" size={20} />
                <h2 className="font-display text-base font-bold text-navy">Ràng buộc & Phạm vi (Scope)</h2>
              </div>
              <p className="mt-1 text-xs text-slate">Quy định từ Ban Lãnh đạo và Giảng viên</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                  <p className="font-bold text-xs text-emerald-800">Trong phạm vi (In-Scope)</p>
                  <p className="mt-1 text-xs text-emerald-900 leading-relaxed">
                    {context?.inScope || "Quy trình tiếp nhận đơn, giữ và trả tồn kho, hủy đơn, hoàn tiền, thông báo trạng thái cho khách."}
                  </p>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                  <p className="font-bold text-xs text-rose-800">Ngoài phạm vi (Out-of-Scope)</p>
                  <p className="mt-1 text-xs text-rose-900 leading-relaxed">
                    {context?.outOfScope || "Lập trình hệ thống bán hàng, thay đổi nhà cung cấp thanh toán, chương trình khách hàng thân thiết."}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
                  <p className="font-bold text-xs text-amber-800">Ràng buộc đã biết (Known Constraints)</p>
                  <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                    {context?.knownConstraints || "Ngân sách không vượt quá 4 tỷ VNĐ. Không thay thế hệ thống POS trong đợt này."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar: Execution Actions */}
        <aside className="space-y-6">
          <Card className="p-6 border-slate/15">
            <h2 className="font-display text-base font-bold text-navy">Sẵn sàng thực hành</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate">
              Khởi tạo không gian làm việc mô phỏng, kết nối trực tiếp với 6 Stakeholder AI.
            </p>

            {startError && (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
                {startError}
              </div>
            )}

            {/* FE-07 / FE-08 CTA: "Bắt đầu từ Kế hoạch BA (Khuyến nghị)" & "Vào thẳng phỏng vấn" */}
            <Button
              disabled={starting}
              onClick={() => handleStartSession("planning")}
              className="mt-6 w-full justify-center gap-2 bg-navy py-3 text-sm font-bold hover:bg-navy-light shadow-md"
            >
              {starting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Đang khởi tạo phiên...
                </>
              ) : (
                <>
                  Bắt đầu từ Kế hoạch BA (Khuyến nghị) <ArrowRight size={16} />
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              disabled={starting}
              onClick={() => handleStartSession("simulation")}
              className="mt-2.5 w-full justify-center border-slate/20 text-xs font-semibold text-slate hover:text-navy hover:bg-offwhite"
            >
              Vào thẳng phỏng vấn Stakeholder →
            </Button>
          </Card>

          <Card className="p-6 border-slate/15">
            <p className="text-xs font-bold uppercase tracking-wider text-brass">
              Mục tiêu đầu ra của phiên
            </p>
            <p className="mt-3 text-xs leading-6 text-slate">
              Đề xuất giải pháp MVP dựa trên bằng chứng xác thực, giải quyết xung đột kiểm soát vận hành - tài chính và truy vết từ mục tiêu chiến lược đến tiêu chí nghiệm thu.
            </p>
          </Card>

          <Card className="border-navy/15 bg-navy text-white p-6">
            <div className="flex items-center gap-2 text-brass">
              <Sparkles size={16} />
              <p className="text-xs font-bold uppercase tracking-wider text-white">
                Nguyên lý mô phỏng BA-VES
              </p>
            </div>
            <p className="mt-3 text-xs leading-6 text-white/80">
              BA-VES không dạy lại lý thuyết sách vở. Bạn trực tiếp chọn kỹ thuật, đặt câu hỏi, phân tích mâu thuẫn; hệ thống mô phỏng phản ứng doanh nghiệp thực và chấm điểm năng lực theo rubric quốc tế.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
