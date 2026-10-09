import { Award, CalendarDays, CheckCircle2, MessageSquareText, Sparkles, TrendingUp } from "lucide-react";
import { babokScores } from "../../constants/scenario";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { ProgressBar } from "../../components/ui/ProgressBar";

const observedBehaviors = [
  ["Tư duy phân tích (Analytical Thinking)", 78, "+9", "Phân biệt Fact vs Assumption · Phân tích xung đột"],
  ["Kỹ năng giao tiếp (Communication)", 81, "+12", "Câu hỏi mở · Đào sâu · Tóm lược Playback"],
  ["Kỹ năng tương tác (Interaction Skills)", 76, "+8", "Điều phối phiên họp · Đàm phán"],
  ["Kiến thức nghiệp vụ (Business Knowledge)", 70, "+10", "Quản lý tồn kho · Điều chuyển · Kiểm soát tài chính"],
  ["Phẩm chất hành vi (Behavioral)", 74, "+6", "Tính thích ứng · Đạo đức nghề nghiệp · Trách nhiệm"],
  ["Công cụ & Công nghệ (Tools & Tech)", 68, "+14", "Ma trận RTM · Mô hình hóa BPMN · Phân tích dữ liệu"],
];

const history = [
  ["INV-2026-014", "Quản lý tồn kho & Điều phối chuỗi cung ứng", "Đang hoàn tất Debrief", "72", "Phỏng vấn · Phân tích quyết định · Mô hình hóa BPMN"],
  ["INV-2026-009", "Sai lệch kiểm kê tại chuỗi cửa hàng", "Đã hoàn thành", "67", "Quan sát thực địa · Biểu đồ xương cá Ishikawa"],
  ["INV-2026-003", "Bổ sung hàng khuyến mãi chuỗi bán lẻ", "Đã hoàn thành", "61", "Phân tích dữ liệu · Quy tắc nghiệp vụ"],
];

export function ProgressPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hồ sơ năng lực thực chiến · BABOK® v3"
        title="Hồ sơ phát triển Năng lực Thực hành"
        description="Theo dõi sự tiến bộ và tích lũy bằng chứng năng lực qua các kịch bản mô phỏng doanh nghiệp ảo đa dạng."
        actions={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/30 bg-brass/10 px-3 py-1 text-xs font-semibold text-brass">
              <Sparkles size={14} /> Tích lũy 3 phiên thực hành
            </span>
          </div>
        }
      />

      {/* KPI Counters */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [TrendingUp, "+11%", "Tăng trưởng qua 3 phiên thực chiến", "text-emerald-700 bg-emerald-500/10"],
          [Award, "72/100", "Mức độ hoàn thành gần nhất", "text-navy bg-navy/10"],
          [CalendarDays, "6.4 giờ", "Tổng thời lượng thực hành", "text-brass bg-brass/10"],
        ].map(([Icon, value, label, tone]) => (
          <Card key={String(label)} className="flex items-center gap-4 p-5 border-slate/15">
            <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone}`}>
              <Icon size={22} />
            </span>
            <div>
              <strong className="block text-2xl font-bold text-navy">{String(value)}</strong>
              <span className="text-xs font-medium text-slate">{String(label)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* 2 Main Columns */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-6 border-slate/15">
          <h2 className="text-base font-bold text-navy">Ứng dụng 6 Vùng tri thức BABOK® v3</h2>
          <p className="mt-0.5 text-xs text-slate">Điểm số tổng hợp từ bằng chứng thu thập và tài liệu hoàn thành qua các kịch bản.</p>
          <div className="mt-5 space-y-4">
            {babokScores.map((skill) => (
              <div key={skill.short} className="rounded-xl border border-slate/10 bg-white p-4 shadow-xs">
                <div className="mb-2.5 flex justify-between items-start">
                  <div>
                    <strong className="text-xs font-bold text-navy">{skill.name}</strong>
                    <span className="mt-0.5 block font-mono text-[11px] text-slate">{skill.short}</span>
                  </div>
                  <strong className="font-mono text-base font-bold text-navy">{skill.score}%</strong>
                </div>
                <ProgressBar value={skill.score} color="#102a43" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-slate/15">
          <h2 className="text-base font-bold text-navy">6 Nhóm Năng lực Cốt lõi (Underlying Competencies)</h2>
          <p className="mt-0.5 text-xs text-slate">Hành vi được ghi nhận tự động qua các phiên đối thoại và phân tích tình huống.</p>
          <div className="mt-5 space-y-4">
            {observedBehaviors.map(([name, score, trend, evidence]) => (
              <div key={String(name)} className="rounded-xl border border-slate/10 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <strong className="text-xs font-bold text-navy">{String(name)}</strong>
                    <span className="mt-0.5 block text-[11px] text-slate">{String(evidence)}</span>
                  </div>
                  <div className="text-right">
                    <strong className="block font-mono text-base font-bold text-navy">{String(score)}%</strong>
                    <span className="text-[11px] font-bold text-emerald-700">{String(trend)} đ</span>
                  </div>
                </div>
                <div className="mt-2.5">
                  <ProgressBar value={Number(score)} color="#c58b52" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* History table */}
      <Card className="mt-6 overflow-hidden border-slate/15">
        <div className="flex items-center gap-3 border-b border-slate/10 p-5">
          <MessageSquareText className="text-navy" size={20} />
          <div>
            <h2 className="text-base font-bold text-navy">Lịch sử các phiên mô phỏng doanh nghiệp</h2>
            <p className="text-xs text-slate">Mỗi dòng ghi nhận một bài toán kinh doanh, kỹ thuật BABOK đã áp dụng và điểm số đạt được.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="bg-mist/30 text-[11px] uppercase tracking-wider text-slate">
              <tr>
                <th className="px-5 py-3.5">Mã phiên</th>
                <th className="px-5 py-3.5">Kịch bản doanh nghiệp</th>
                <th className="px-5 py-3.5">Kỹ thuật BABOK đã áp dụng</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5">Điểm năng lực</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/10">
              {history.map(([id, name, status, score, techniques]) => (
                <tr key={id} className="hover:bg-mist/10">
                  <td className="px-5 py-4 font-mono font-bold text-navy">{id}</td>
                  <td className="px-5 py-4 font-bold text-navy">{name}</td>
                  <td className="px-5 py-4 text-slate">{techniques}</td>
                  <td className="px-5 py-4">
                    <Badge tone={status === "Đã hoàn thành" ? "green" : "amber"}>{status}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 font-mono font-bold text-navy">
                      <CheckCircle2 size={14} className="text-emerald-700" />
                      {score}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
