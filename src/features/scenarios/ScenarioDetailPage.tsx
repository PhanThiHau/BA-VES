import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Clock3, Database, FileText, LockKeyhole, Sparkles, Target, Users, Waypoints } from "lucide-react";
import { stakeholders } from "../../constants/scenario";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { RouteKey } from "../../types/models";

const systems = [
  ["Hệ thống POS Cửa hàng", "20 cửa hàng", "Gửi giao dịch bán theo lô (batch), thường xuyên bị trễ từ 30–90 phút so với thực tế."],
  ["Phần mềm WMS Kho vận", "Tổng kho DC + 3 kho vùng", "Quản lý đóng gói (picking), điều chuyển nội bộ, hàng trả về và điều chỉnh số lượng tồn."],
  ["Hệ thống ERP Tài chính", "Khối Kế toán - Tài chính", "Ghi nhận giá trị tài sản kho, kỳ khóa sổ kế toán và kiểm soát phê duyệt bù trừ thất thoát."],
  ["Kế hoạch qua Excel", "Chuyên viên Kế hoạch (Planner)", "Dự báo nhu cầu, định mức min-max và chương trình khuyến mãi hiện vẫn tính thủ công."],
];

const handoverFiles = [
  ["Hồ sơ dự án (Project Brief v1.0)", "Mục tiêu tối ưu, ngân sách 4 tỷ VNĐ và phạm vi triển khai thử nghiệm 6 tháng."],
  ["Báo cáo tồn kho thực tế 31/08", "Số liệu snapshot theo từng mã SKU, kho vật lý và trạng thái hàng khả dụng (ATP)."],
  ["SOP Quy trình Nhập & Trả hàng v2.1", "Quy trình kiểm đếm, lưu kho cách ly (quarantine) và xử lý đổi trả."],
  ["Đặc tả kỹ thuật API POS–WMS", "Luồng đồng bộ giao dịch hiện tại, mã lỗi kết nối và thời gian trễ dữ liệu."],
  ["Báo cáo mức độ phục vụ Quý 3", "Tỷ lệ đứt hàng (stockout 12%), tỷ lệ đáp ứng đơn hàng (fill rate) và độ chính xác tồn kho."],
];

const assignmentTasks = [
  "Làm rõ bài toán nghiệp vụ, phạm vi dự án và bộ chỉ số KPI đo lường",
  "Lập kế hoạch phỏng vấn và tiếp cận 6 Stakeholder AI chủ chốt",
  "Khơi gợi sự thật (facts), quy tắc ngầm, ngoại lệ và các ràng buộc",
  "Mô hình hóa quy trình hiện trạng As-Is và đề xuất quy trình tương lai To-Be",
  "Xử lý xung đột mục tiêu giữa Kho - Kế hoạch - Tài chính và sự kiện thay đổi",
  "Nghiệm thu và bàn giao bộ tài liệu đặc tả chuẩn truy vết (BRD, RTM, BPMN)",
];

export function ScenarioDetailPage({ navigate }: { navigate: (route: RouteKey) => void }) {
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
                  <Badge tone="navy">Chuỗi cung ứng & Bán lẻ</Badge>
                  <Badge tone="amber">Cấp độ: Trung cấp</Badge>
                  <Badge tone="green">Phiên thực hành chuẩn BABOK® v3</Badge>
                </div>
                <p className="mt-5 font-mono text-xs font-bold uppercase tracking-widest text-brass-light">
                  BÀI TOÁN DOANH NGHIỆP THỰC TẾ · INV-2026-014
                </p>
                <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Quản lý tồn kho & Điều phối chuỗi cung ứng
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 sm:text-base">
                  Bạn được giao trọng trách Business Analyst (BA) cho VinaSupply Retail. Doanh nghiệp vận hành 1 trung tâm phân phối chính (DC), 3 kho khu vực và 20 siêu thị bán lẻ. Tỷ lệ đứt gãy hàng hóa (stockout) đang ở mức 12%, trong khi dữ liệu tồn kho giữa POS, WMS và ERP lệch pha khiến khách hàng thất vọng và chi phí lưu kho tăng vọt.
                </p>
              </div>
            </div>

            {/* Context & Authority Grid */}
            <div className="p-7 sm:p-9">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-slate/10 bg-mist/20 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy/10 text-navy">
                      <Building2 size={20} />
                    </span>
                    <h2 className="text-base font-bold text-navy">Bối cảnh vận hành</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate">
                    Đội Kho cần tốc độ xử lý nhanh; Kế toán đòi hỏi kiểm soát chặt chẽ bút toán bù trừ; Chuyên viên Kế hoạch muốn ưu tiên điều chuyển nội bộ trước khi mua mới; Cửa hàng cần tồn khả dụng (ATP) chính xác để cam kết với khách.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate/10 bg-mist/20 p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy/10 text-navy">
                      <Waypoints size={20} />
                    </span>
                    <h2 className="text-base font-bold text-navy">Quyền hạn của BA</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate">
                    Bạn có toàn quyền phỏng vấn 6 Stakeholder, truy cập dữ liệu mẫu, đề xuất phạm vi MVP và điều phối phiên thẩm định. Sponsor giữ quyền duyệt phạm vi cuối cùng, Giám đốc Vận hành quyết định ưu tiên thực địa.
                  </p>
                </div>
              </div>

              {/* Assignment Tasks Checklist */}
              <h2 className="mt-8 text-lg font-bold text-navy">Nhiệm vụ trọng tâm của bạn</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {assignmentTasks.map((task) => (
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
                <h2 className="text-base font-bold text-navy">Hồ sơ bàn giao ban đầu</h2>
              </div>
              <div className="mt-5 space-y-3">
                {handoverFiles.map(([name, detail], index) => (
                  <div key={name} className="flex gap-3 rounded-xl border border-slate/10 p-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-navy/10 text-xs font-bold text-navy">
                      0{index + 1}
                    </span>
                    <div>
                      <strong className="block text-sm font-semibold text-navy">{name}</strong>
                      <span className="mt-0.5 block text-xs leading-5 text-slate">{detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 border-slate/15">
              <div className="flex items-center gap-3">
                <LockKeyhole className="text-brass" size={20} />
                <h2 className="text-base font-bold text-navy">Biên giới thông tin</h2>
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <strong className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Đã biết (Tài liệu sơ cấp)
                  </strong>
                  <p className="mt-1.5 text-xs leading-5 text-emerald-900/80">
                    Chỉ số KPI hiện tại, quy mô mạng lưới 20 điểm bán, tên hệ thống và danh sách trưởng bộ phận.
                  </p>
                </div>
                <div className="rounded-xl border border-brass/30 bg-brass/10 p-4">
                  <strong className="text-xs font-bold uppercase tracking-wider text-brass">
                    BA phải tự khám phá (Khơi gợi)
                  </strong>
                  <p className="mt-1.5 text-xs leading-5 text-navy/80">
                    Nguyên nhân gốc của độ trễ, quy tắc ngầm chưa văn bản hóa, ngoại lệ kiểm kê, xung đột KPI giữa các bên và tiêu chí chấp nhận nghiệm thu.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate">
                * Lưu ý: Mỗi Stakeholder AI chỉ nắm góc nhìn trong phạm vi chức trách của họ. Hệ thống đánh giá năng lực đặt câu hỏi và truy vấn sự thật của bạn.
              </p>
            </Card>
          </div>

          {/* Available Stakeholders */}
          <Card className="p-6 border-slate/15">
            <h2 className="text-base font-bold text-navy">Danh sách Stakeholder AI tham gia phỏng vấn</h2>
            <p className="mt-1 text-xs text-slate">
              Mỗi nhân sự có mục tiêu, quyền hạn và định kiến nghiệp vụ riêng biệt.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {stakeholders.map((person) => (
                <div key={person.id} className="flex items-center gap-3 rounded-xl border border-slate/15 p-3.5 transition-colors hover:bg-mist/20">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl text-xs font-bold text-navy shadow-sm"
                    style={{ backgroundColor: person.color }}
                  >
                    {person.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <strong className="block truncate text-sm font-bold text-navy">{person.name}</strong>
                    <span className="block truncate text-xs text-slate">{person.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Action Sidebar */}
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Card className="p-6 border-slate/15">
            <h2 className="text-base font-bold text-navy">Thông tin phiên thực hành</h2>
            <div className="mt-5 space-y-4 text-xs">
              {[
                [Clock3, "Thời lượng ước tính: 90 phút"],
                [Users, "6 Nhân vật AI độc lập"],
                [FileText, "5 Tài liệu bàn giao bắt buộc"],
                [Target, "Quan sát 6 Vùng tri thức BABOK®"],
              ].map(([Icon, text]) => (
                <div key={String(text)} className="flex items-center gap-3 font-medium text-slate">
                  <Icon size={18} className="text-navy" />
                  {String(text)}
                </div>
              ))}
            </div>

            <Button
              onClick={() => navigate("simulation")}
              className="mt-7 w-full justify-center gap-2 bg-navy py-3 text-sm font-semibold hover:bg-navy-light"
            >
              Bắt đầu phỏng vấn Stakeholder <ArrowRight size={16} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("planning")}
              className="mt-2.5 w-full justify-center border-slate/20 text-xs font-semibold text-slate"
            >
              Xem kế hoạch BA chi tiết
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
