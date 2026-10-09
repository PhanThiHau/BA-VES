import { AlertTriangle, CheckCircle2, Clock3, Eye, FileCheck2, FileText, History, Link2, MessageSquareText, Sparkles, UploadCloud } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

const tabs = [
  "Gói tài liệu bàn giao",
  "Tải lên & Quản lý phiên bản",
  "AI & Chuyên gia phản biện",
  "Nghiệm thu phiên học",
] as const;
type Tab = typeof tabs[number];

type DeliverableStatus = "approved" | "needs-revision" | "ai-reviewed" | "missing";

interface Deliverable {
  id: string;
  title: string;
  purpose: string;
  files: string;
  formats: string;
  version: string;
  status: DeliverableStatus;
  evidence: string;
  reviewer: string;
  required: boolean;
}

const deliverables: Deliverable[] = [
  {
    id: "DEL-01",
    title: "Kế hoạch Phân tích Nghiệp vụ (BA Plan)",
    purpose: "Phương pháp tiếp cận BA, kế hoạch gắn kết Stakeholder, quy chế quản trị và quản lý thông tin.",
    files: "BA_Plan_v1.1.docx",
    formats: "DOCX · PDF",
    version: "v1.1",
    status: "approved",
    evidence: "Đầy đủ",
    reviewer: "Giảng viên hướng dẫn",
    required: true,
  },
  {
    id: "DEL-02",
    title: "Tài liệu Yêu cầu Nghiệp vụ (BRD)",
    purpose: "Bài toán của VinaSupply, mục tiêu kinh doanh, phạm vi dự án, nhu cầu của các bên và yêu cầu mức cao.",
    files: "BRD_Inventory_v1.2.docx",
    formats: "DOCX · PDF",
    version: "v1.2",
    status: "needs-revision",
    evidence: "7/9 bằng chứng",
    reviewer: "AI Reviewer + Sponsor",
    required: true,
  },
  {
    id: "DEL-03",
    title: "Mô hình quy trình BPMN Hiện trạng & Tương lai",
    purpose: "Quy trình bổ sung tồn kho hiện tại (As-Is) và tương lai (To-Be), điểm kiểm soát và xử lý ngoại lệ.",
    files: "Replenishment_Process.drawio · .pdf",
    formats: "DRAWIO + PDF/PNG",
    version: "v1.0",
    status: "ai-reviewed",
    evidence: "4/4 phát hiện",
    reviewer: "Trưởng kho vận",
    required: true,
  },
  {
    id: "DEL-04",
    title: "Đặc tả danh mục Yêu cầu Phần mềm (URD / SRS)",
    purpose: "Phân loại yêu cầu nghiệp vụ, yêu cầu các bên liên quan, chức năng, phi chức năng và chuyển giao.",
    files: "Requirements_Catalogue.xlsx",
    formats: "XLSX · DOCX · PDF",
    version: "v1.1",
    status: "needs-revision",
    evidence: "8/9 bằng chứng",
    reviewer: "AI Reviewer + Product Owner",
    required: true,
  },
  {
    id: "DEL-05",
    title: "Ma trận truy vết yêu cầu (RTM)",
    purpose: "Liên kết chuỗi: Mục tiêu → Bằng chứng → Yêu cầu → Tiêu chí nghiệm thu → Chỉ số KPI.",
    files: "RTM_Inventory_v1.0.xlsx",
    formats: "XLSX · CSV",
    version: "v1.0",
    status: "ai-reviewed",
    evidence: "4/5 yêu cầu",
    reviewer: "AI Reviewer",
    required: true,
  },
  {
    id: "DEL-06",
    title: "Báo cáo Đánh giá Giải pháp & Thay đổi",
    purpose: "Phân tích tác động sự cố nhà cung ứng trễ hàng, so sánh phương án và kế hoạch đo lường giá trị MVP.",
    files: "Chưa tải lên",
    formats: "DOCX · PDF",
    version: "—",
    status: "missing",
    evidence: "0/3 quyết định",
    reviewer: "Giám đốc Vận hành + Giảng viên",
    required: true,
  },
  {
    id: "DEL-07",
    title: "Mô hình giao diện Wireframe / Prototype",
    purpose: "Minh họa màn hình hiển thị tồn kho đa kênh và gợi ý điều chuyển hàng nội bộ cho người dùng.",
    files: "Figma link",
    formats: "FIGMA URL · PDF · PNG",
    version: "v0.3",
    status: "ai-reviewed",
    evidence: "Tùy chọn",
    reviewer: "Chuyên viên Kế hoạch",
    required: false,
  },
];

const statusBadge = (status: DeliverableStatus) => {
  if (status === "approved") return <Badge tone="green">Đã phê duyệt</Badge>;
  if (status === "needs-revision") return <Badge tone="amber">Cần sửa đổi</Badge>;
  if (status === "ai-reviewed") return <Badge tone="navy">AI đã phản biện</Badge>;
  return <Badge tone="red">Chưa nộp</Badge>;
};

export function ArtifactsPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const [tab, setTab] = useState<Tab>("Gói tài liệu bàn giao");
  const [selectedId, setSelectedId] = useState("DEL-02");
  const selected = deliverables.find((item) => item.id === selectedId) ?? deliverables[1];

  return (
    <>
      <PageHeader
        eyebrow="Bước 4/5 · Sản phẩm bàn giao BA"
        title="Bộ tài liệu bàn giao (BA Artifacts)"
        description="Nộp, quản lý phiên bản và nhận phản biện đa chiều từ AI và chuyên gia dựa trên bằng chứng thu thập thực tế."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("analysis")} className="border-slate/20 text-xs">
              <Eye size={16} /> Trung tâm Phân tích
            </Button>
            <Button onClick={() => setTab("Tải lên & Quản lý phiên bản")} className="bg-navy text-xs font-semibold hover:bg-navy-light">
              <UploadCloud size={16} /> Tải lên bản mới
            </Button>
          </>
        }
      />

      {/* Tabs navigation */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate/15 bg-white p-1.5 shadow-xs">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={classNames(
              "shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
              tab === item
                ? "bg-navy text-white shadow-xs"
                : "text-slate hover:bg-mist/30 hover:text-navy"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "Gói tài liệu bàn giao" && (
        <DeliverableList selectedId={selectedId} onSelect={setSelectedId} onUpload={() => setTab("Tải lên & Quản lý phiên bản")} />
      )}
      {tab === "Tải lên & Quản lý phiên bản" && (
        <UploadWorkspace selected={selected} onSelect={setSelectedId} />
      )}
      {tab === "AI & Chuyên gia phản biện" && (
        <ReviewWorkspace navigate={navigate} />
      )}
      {tab === "Nghiệm thu phiên học" && (
        <CompletionGate navigate={navigate} />
      )}
    </>
  );
}

function DeliverableList({
  selectedId,
  onSelect,
  onUpload,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  onUpload: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="overflow-hidden border-slate/15">
        <div className="flex flex-col gap-3 border-b border-slate/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-navy">Gói tài liệu · Quản lý tồn kho VinaSupply</h2>
            <p className="text-xs text-slate">6 tài liệu bắt buộc · 1 tài liệu tùy chọn mở rộng</p>
          </div>
          <Badge tone="amber">4/6 tài liệu đạt điều kiện</Badge>
        </div>

        <div className="divide-y divide-slate/10">
          {deliverables.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={classNames(
                "grid w-full gap-4 p-5 text-left transition-colors md:grid-cols-[1fr_170px_140px] md:items-center",
                selectedId === item.id ? "bg-mist/30" : "bg-white hover:bg-mist/10"
              )}
            >
              <div className="flex gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy">
                  <FileText size={20} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate">{item.id}</span>
                    {item.required ? (
                      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase">
                        Bắt buộc
                      </span>
                    ) : (
                      <span className="rounded-md bg-slate/10 px-2 py-0.5 text-[10px] font-bold text-slate uppercase">
                        Tùy chọn
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-navy">{item.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate line-clamp-2">{item.purpose}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-medium text-slate">Tệp hiện tại</p>
                <p className="mt-1 break-words font-mono text-xs font-semibold text-navy">{item.files}</p>
              </div>

              <div className="md:text-right">
                {statusBadge(item.status)}
                <p className="mt-1.5 text-[11px] text-slate">{item.evidence}</p>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <aside className="space-y-5">
        <Card className="p-5 border-slate/15">
          <p className="text-xs font-bold uppercase tracking-wider text-slate">Tiến độ hoàn thiện hồ sơ</p>
          <div className="mt-3 flex items-end justify-between">
            <strong className="text-4xl font-bold text-navy">67%</strong>
            <span className="text-xs font-semibold text-slate">4/6 tài liệu đạt chuẩn</span>
          </div>
          <div className="mt-4">
            <ProgressBar value={67} />
          </div>

          <div className="mt-5 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate">Đã duyệt (Approved)</span>
              <strong className="font-bold text-emerald-700">1</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate">Đang phản biện / Cần sửa</span>
              <strong className="font-bold text-amber-700">4</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate">Chưa nộp (Missing)</span>
              <strong className="font-bold text-rose-700">1</strong>
            </div>
          </div>

          <Button onClick={onUpload} className="mt-6 w-full justify-center gap-2 bg-navy text-xs font-semibold hover:bg-navy-light">
            <UploadCloud size={16} /> Tải lên phiên bản mới
          </Button>
        </Card>

        <Card className="p-5 border-slate/15">
          <h2 className="text-sm font-bold text-navy">Quy tắc nộp hồ sơ chuẩn</h2>
          <ul className="mt-3 space-y-2.5 text-xs leading-5 text-slate">
            <li>• Soạn thảo bằng công cụ chuyên dụng (Word, Excel, Draw.io, Figma).</li>
            <li>• Không ghi đè phiên bản cũ; luôn tăng số hiệu v1.0, v1.1, v1.2.</li>
            <li>• Sơ đồ Draw.io phải đính kèm file xuất PDF hoặc PNG để chấm điểm.</li>
            <li>• Mọi yêu cầu bắt buộc phải liên kết với mã bằng chứng đã lưu.</li>
            <li>• AI không viết hộ tài liệu; chỉ đóng vai trò rà soát và phản biện.</li>
          </ul>
        </Card>
      </aside>
    </div>
  );
}

function UploadWorkspace({
  selected,
  onSelect,
}: {
  selected: Deliverable;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <Card className="h-fit overflow-hidden border-slate/15">
        <div className="border-b border-slate/10 p-5">
          <h2 className="text-sm font-bold text-navy">Chọn tài liệu cần tải lên</h2>
        </div>
        <div className="p-2 space-y-1">
          {deliverables
            .filter((item) => item.required)
            .map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={classNames(
                  "flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors",
                  selected.id === item.id ? "bg-mist/40 font-semibold" : "hover:bg-mist/10"
                )}
              >
                <div>
                  <span className="font-mono text-xs font-bold text-slate">{item.id}</span>
                  <p className="mt-0.5 text-xs font-medium text-navy">{item.title}</p>
                </div>
                {statusBadge(item.status)}
              </button>
            ))}
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6 border-slate/15">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold text-slate">
                {selected.id} · {selected.required ? "Bắt buộc" : "Tùy chọn"}
              </p>
              <h2 className="mt-1 text-lg font-bold text-navy">{selected.title}</h2>
              <p className="mt-1.5 text-xs leading-5 text-slate">{selected.purpose}</p>
            </div>
            {statusBadge(selected.status)}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-mist/30 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate">Định dạng hỗ trợ</span>
              <strong className="mt-1 block font-mono text-xs text-navy">{selected.formats}</strong>
            </div>
            <div className="rounded-xl bg-mist/30 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate">Người phản biện</span>
              <strong className="mt-1 block text-xs text-navy">{selected.reviewer}</strong>
            </div>
            <div className="rounded-xl bg-mist/30 p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate">Phiên bản hiện tại</span>
              <strong className="mt-1 block font-mono text-xs text-navy">{selected.version}</strong>
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div className="mt-6 grid min-h-48 place-items-center rounded-2xl border-2 border-dashed border-slate/30 bg-mist/10 p-8 text-center transition-colors hover:border-navy">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-navy/10 text-navy">
                <UploadCloud size={24} />
              </span>
              <h3 className="mt-4 text-sm font-bold text-navy">Kéo và thả tệp tài liệu vào đây hoặc bấm để chọn tệp</h3>
              <p className="mt-1.5 text-xs text-slate">Hỗ trợ các định dạng: {selected.formats} · Dung lượng tối đa 50 MB</p>
              <Button className="mt-4 bg-navy text-xs font-semibold hover:bg-navy-light">Chọn tệp từ máy tính</Button>
            </div>
          </div>

          <label className="mt-5 block">
            <span className="text-xs font-bold text-navy">Mô tả những điểm thay đổi trong phiên bản này:</span>
            <textarea
              className="mt-2 min-h-24 w-full rounded-xl border border-slate/20 bg-white p-3 text-xs text-navy outline-none focus:border-navy"
              placeholder="Ví dụ: Đã bổ sung ngoại lệ khi khóa sổ kế toán và cập nhật tiêu chí nghiệm thu định lượng cho FR-08..."
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button className="gap-2 bg-navy text-xs font-semibold hover:bg-navy-light">
              <UploadCloud size={15} /> Tải lên & Tạo phiên bản mới
            </Button>
            <Button variant="secondary" className="gap-2 border-slate/20 text-xs font-semibold text-slate">
              <Link2 size={15} /> Liên kết mã bằng chứng
            </Button>
          </div>
        </Card>

        {/* Version History */}
        <Card className="overflow-hidden border-slate/15">
          <div className="flex items-center gap-3 border-b border-slate/10 p-5">
            <History className="text-navy" size={20} />
            <h2 className="text-base font-bold text-navy">Lịch sử các phiên bản nộp</h2>
          </div>
          <div className="divide-y divide-slate/10">
            {[
              ["v1.2", "18/09 · 16:42", "Bổ sung quy tắc nghiệp vụ và các chỉ số KPI", "Cần sửa đổi"],
              ["v1.1", "17/09 · 10:15", "Điều chỉnh phạm vi theo góp ý từ Sponsor", "AI đã phản biện"],
              ["v1.0", "16/09 · 17:05", "Bản nộp sơ thảo ban đầu", "Đã thay thế"],
            ].map(([version, time, change, status]) => (
              <div key={version} className="grid gap-3 p-5 sm:grid-cols-[90px_1fr_150px] sm:items-center">
                <strong className="font-mono text-sm font-bold text-navy">{version}</strong>
                <div>
                  <p className="text-xs font-semibold text-navy">{change}</p>
                  <span className="text-[11px] text-slate">{time} · Minh Nguyen (BA)</span>
                </div>
                <span className="text-xs font-medium text-slate sm:text-right">{status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReviewWorkspace({ navigate }: { navigate: (route: RouteKey) => void }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card className="p-6 border-slate/15">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-bold text-slate">DEL-02 · BRD Inventory v1.2</p>
              <h2 className="mt-1 text-base font-bold text-navy">Kết quả AI Pre-review (Phản biện sơ bộ)</h2>
            </div>
            <Badge tone="amber">3 phát hiện cần điều chỉnh</Badge>
          </div>

          <div className="mt-5 space-y-3">
            {[
              [
                "Cao",
                "Yêu cầu REQ-08 chưa đo lường được",
                "Cụm từ “lựa chọn kho phù hợp nhất” chưa định lượng rõ tiêu chí dựa trên thời gian giao hàng (ETA), chi phí vận chuyển hay lượng tồn sau mức an toàn.",
                "Mục 5.3",
              ],
              [
                "Trung bình",
                "Thiếu kịch bản xử lý ngoại lệ",
                "Tài liệu BRD chưa mô tả cách thức ghi nhận điều chỉnh tồn kho khi kỳ kế toán đã bị khóa sổ kiểm toán.",
                "Mục 6.2",
              ],
              [
                "Trung bình",
                "Độ phủ bằng chứng chưa đạt",
                "Quy tắc nghiệp vụ về lượng tăng thêm mùa khuyến mãi chưa được gắn với trích dẫn phỏng vấn EV-07 từ Chuyên viên Kế hoạch.",
                "Mục 4.4",
              ],
            ].map(([severity, title, copy, location]) => (
              <div key={title} className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge tone={severity === "Cao" ? "red" : "amber"}>Mức độ: {severity}</Badge>
                    <strong className="ml-2 text-xs font-bold text-amber-900">{title}</strong>
                  </div>
                  <span className="font-mono text-[11px] text-slate">{location}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-amber-900/80">{copy}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-slate/15">
          <div className="flex items-center gap-3">
            <MessageSquareText className="text-navy" size={20} />
            <h2 className="text-base font-bold text-navy">Phản hồi từ Stakeholder & Giảng viên</h2>
          </div>
          <div className="mt-4 space-y-3.5">
            <div className="rounded-xl bg-mist/30 p-4">
              <strong className="text-xs font-bold text-navy">Giám đốc Chuỗi cung ứng</strong>
              <p className="mt-1.5 text-xs italic leading-5 text-slate">
                “Quy tắc ưu tiên chuyển kho rất hợp lý, nhưng tôi cần làm rõ thẩm quyền ai được quyền ghi đè (override) và chi phí lưu kho phát sinh phải thể hiện trong cùng một bảng quyết định.”
              </p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <strong className="text-xs font-bold text-emerald-800">Giảng viên hướng dẫn · Trần Minh Anh</strong>
              <p className="mt-1.5 text-xs leading-5 text-emerald-900/80">
                Hãy cập nhật sự kiện thay đổi của nhà cung ứng vào cả BRD, RTM và Báo cáo đánh giá giải pháp để đảm bảo tính nhất quán end-to-end.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <aside className="space-y-5">
        <Card className="p-5 border-slate/15">
          <h2 className="text-sm font-bold text-navy">Quy trình thẩm định hồ sơ</h2>
          <div className="mt-4 space-y-3.5">
            {[
              ["Tải lên & Quét kiểm tra định dạng", true],
              ["AI kiểm tra cấu trúc & tính đầy đủ", true],
              ["Đối soát độ phủ bằng chứng (Traceability)", true],
              ["Stakeholder doanh nghiệp rà soát", false],
              ["Giảng viên phê duyệt chính thức", false],
            ].map(([label, done], index) => (
              <div key={String(label)} className="flex items-center gap-3">
                <span
                  className={classNames(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold",
                    done ? "bg-emerald-100 text-emerald-700" : "bg-mist text-slate"
                  )}
                >
                  {done ? <CheckCircle2 size={14} /> : index + 1}
                </span>
                <span className="text-xs font-semibold text-navy">{String(label)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 border-slate/15">
          <div className="flex items-center gap-2 text-brass">
            <Sparkles size={16} />
            <h2 className="text-sm font-bold text-navy">Nguyên lý đánh giá</h2>
          </div>
          <p className="mt-2 text-xs leading-5 text-slate">
            Hệ thống đối soát tài liệu của bạn trực tiếp với các bằng chứng đã lưu tại Trung tâm Phân tích. AI không tự tiện sinh thêm yêu cầu hay tự duyệt thay cho giảng viên.
          </p>
          <Button
            variant="secondary"
            onClick={() => navigate("analysis")}
            className="mt-4 w-full justify-center gap-2 border-slate/20 text-xs font-semibold text-navy"
          >
            <Link2 size={15} /> Đối soát lại bằng chứng
          </Button>
        </Card>
      </aside>
    </div>
  );
}

function CompletionGate({ navigate }: { navigate: (route: RouteKey) => void }) {
  const processChecks = [
    ["Đã phỏng vấn toàn bộ Stakeholder chủ chốt", true, "6/6 nhân sự đã tham gia"],
    ["Bằng chứng có nguồn gốc và độ tin cậy", true, "9 bằng chứng đã lưu"],
    ["Phát hiện nghiệp vụ đã được xác thực", false, "3/4 phát hiện đã xác nhận"],
    ["Xung đột mục tiêu có phương án xử lý", true, "1 giải quyết · 1 đang theo dõi"],
    ["Phân tích tác động sự kiện thay đổi", true, "Sự kiện MILK-01 đã đánh giá"],
  ];

  const fileChecks = [
    ["Nộp đầy đủ các tài liệu bắt buộc", false, "5/6 tài liệu đã tải lên"],
    ["Không còn lỗi nghiêm trọng mức Cao", false, "BRD còn 1 lỗi mức Cao"],
    ["Độ phủ bằng chứng đạt ngưỡng tối thiểu", true, "87% yêu cầu truy vết"],
    ["Biên bản ký nhận từ các bên liên quan", false, "2 tài liệu đang chờ ký"],
    ["Phê duyệt từ Giảng viên hướng dẫn", false, "1/6 tài liệu đã duyệt"],
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-6 lg:grid-cols-2">
        <GateCard
          title="Cổng A · Tiến trình Phân tích (BA Process)"
          description="Đánh giá từ hoạt động tại Trung tâm Phân tích & Thẩm định"
          items={processChecks}
        />
        <GateCard
          title="Cổng B · Chất lượng Tài liệu (Deliverables)"
          description="Đánh giá từ các tệp tài liệu bàn giao tải lên hệ thống"
          items={fileChecks}
        />
      </div>

      <aside className="space-y-5">
        <Card className="p-6 border-slate/15">
          <FileCheck2 className="text-navy" size={24} />
          <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate">Nghiệm thu phiên thực hành</p>
          <h2 className="mt-1 text-lg font-bold text-navy">Chưa đủ điều kiện hoàn tất phiên</h2>
          <p className="mt-2 text-xs leading-5 text-slate">
            Học viên cần vượt qua cả Cổng A (tiến trình làm việc thực chiến) và Cổng B (chất lượng hồ sơ bàn giao).
          </p>

          <div className="mt-5 space-y-3.5">
            <div>
              <div className="mb-1.5 flex justify-between text-xs font-semibold">
                <span className="text-slate">Cổng A (Tiến trình)</span>
                <strong className="text-navy">80%</strong>
              </div>
              <ProgressBar value={80} />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs font-semibold">
                <span className="text-slate">Cổng B (Hồ sơ)</span>
                <strong className="text-amber-700">42%</strong>
              </div>
              <ProgressBar value={42} color="#c58b52" />
            </div>
          </div>

          <Button disabled className="mt-6 w-full justify-center bg-navy text-xs font-semibold disabled:opacity-40">
            Nghiệm thu & Xem bảng đánh giá năng lực
          </Button>
        </Card>

        <Card className="border-amber-400/20 bg-amber-500/5 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={18} />
            <div>
              <h3 className="text-xs font-bold text-amber-900 uppercase">Hành động cần làm tiếp:</h3>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-amber-900/80">
                <li>• Phỏng vấn nhân viên kho để xác thực phát hiện FND-04.</li>
                <li>• Tải lên Báo cáo Đánh giá Giải pháp & Thay đổi (DEL-06).</li>
                <li>• Khắc phục lỗi định lượng không đo lường được trong BRD.</li>
                <li>• Gửi hồ sơ cho Stakeholder và giảng viên ký duyệt.</li>
              </ul>
            </div>
          </div>
        </Card>

        <button
          onClick={() => navigate("analysis")}
          className="w-full text-center text-xs font-bold text-navy hover:underline"
        >
          ← Quay lại Trung tâm Phân tích & Thẩm định
        </button>
      </aside>
    </div>
  );
}

function GateCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Array<(string | boolean)[]>;
}) {
  return (
    <Card className="p-6 border-slate/15">
      <h2 className="text-base font-bold text-navy">{title}</h2>
      <p className="mt-1 text-xs text-slate">{description}</p>
      <div className="mt-4 space-y-3">
        {items.map(([label, done, note]) => (
          <div key={String(label)} className="rounded-xl border border-slate/10 p-3.5">
            <div className="flex items-start gap-3">
              {done ? (
                <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={18} />
              ) : (
                <Clock3 className="mt-0.5 shrink-0 text-amber-700" size={18} />
              )}
              <div>
                <strong className="text-xs font-bold text-navy">{String(label)}</strong>
                <p className="mt-0.5 text-[11px] text-slate">{String(note)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
