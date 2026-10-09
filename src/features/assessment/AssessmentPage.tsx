import { ArrowUpRight, Award, CheckCircle2, Download, Eye, Lightbulb, MessageCircleMore, Quote, RefreshCcw, Sparkles, Target } from "lucide-react";
import { babokScores } from "../../constants/scenario";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { ProgressBar } from "../../components/ui/ProgressBar";

const underlyingCompetencies = [
  ["Tư duy phân tích & Giải quyết vấn đề", 78, "Phân biệt rõ ràng giữa sự thật và giả định, nhận diện mâu thuẫn chỉ số KPI giữa Kho và Kế toán"],
  ["Kỹ năng giao tiếp & Lắng nghe", 81, "Sử dụng câu hỏi mở tự nhiên, đào sâu đúng trọng tâm và biết tóm lược lại thông tin (playback)"],
  ["Kỹ năng tương tác & Đàm phán", 76, "Điều phối bất đồng giữa Trưởng kho và Kế toán dựa trên căn cứ số liệu thay vì cảm tính"],
  ["Hiểu biết kinh doanh (Domain)", 70, "Nắm chắc nghiệp vụ xuất nhập tồn kho; cần hiểu sâu hơn về ảnh hưởng của việc khóa sổ kế toán"],
  ["Phẩm chất hành vi nghề nghiệp", 74, "Chủ động theo dõi câu hỏi mở, giữ thái độ trung lập và tôn trọng mục tiêu các bên"],
  ["Công cụ & Công nghệ phân tích", 68, "Áp dụng tốt ma trận RTM; cần làm rõ cơ chế lưu trữ offline và tính toàn vẹn dữ liệu máy quét"],
];

export function AssessmentPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kết quả phiên thực hành · INV-2026-014"
        title="Báo cáo Đánh giá Năng lực Thực chiến"
        description="Đo lường năng lực hành vi thực tế qua biên bản phỏng vấn, quyết định xử lý tình huống và chất lượng hồ sơ bàn giao theo chuẩn BABOK® v3."
        actions={
          <Button variant="secondary" className="gap-2 border-slate/20 text-xs font-semibold text-navy">
            <Download size={15} /> Xuất báo cáo PDF
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* Overall Score Badge */}
        <Card className="p-7 text-center border-slate/15">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-navy/10 text-navy">
            <Award size={28} />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate">Điểm năng lực tổng thể</p>
          <strong className="mt-1 block text-6xl font-bold tracking-tight text-navy">72</strong>
          <div className="mt-2">
            <Badge tone="green">Đạt yêu cầu doanh nghiệp</Badge>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate">
            Bạn xử lý tốt xung đột giữa các bên và thu thập bằng chứng đầy đủ. Điểm cần hoàn thiện là phân tích tác động thay đổi và đo lường giá trị MVP sau golive.
          </p>

          <div className="mt-6 border-t border-slate/10 pt-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate">Điểm bằng chứng AI (Rubric):</span>
              <strong className="text-navy font-mono font-bold">71/100</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate">Giảng viên điều chỉnh:</span>
              <strong className="text-navy font-mono font-bold">73/100</strong>
            </div>
          </div>
        </Card>

        {/* 6 Knowledge Areas */}
        <Card className="p-6 border-slate/15">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy">Ứng dụng qua 6 Vùng tri thức BABOK® v3</h2>
              <p className="mt-0.5 text-xs text-slate">Đánh giá khả năng vận dụng tri thức vào giải quyết tình huống thực tế.</p>
            </div>
            <span className="rounded-full bg-mist/40 px-2.5 py-1 text-[11px] font-bold text-navy">
              Độ tin cậy: 0.86
            </span>
          </div>

          <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2">
            {babokScores.map((skill) => (
              <div key={skill.short}>
                <div className="mb-2 flex justify-between text-xs font-semibold">
                  <span className="text-navy">{skill.name}</span>
                  <strong className="font-mono text-navy">{skill.score}%</strong>
                </div>
                <ProgressBar
                  value={skill.score}
                  color={skill.score >= 70 ? "#102a43" : skill.score >= 60 ? "#4f779d" : "#c58b52"}
                />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Observed Underlying Competencies */}
      <Card className="mt-6 p-6 border-slate/15">
        <div className="flex items-center gap-3">
          <Eye className="text-navy" size={20} />
          <div>
            <h2 className="text-base font-bold text-navy">6 Nhóm Năng lực Cốt lõi (Underlying Competencies)</h2>
            <p className="text-xs text-slate">Năng lực thể hiện qua hành vi đối thoại, tư duy và lập luận phản biện của học viên.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {underlyingCompetencies.map(([name, score, evidence]) => (
            <div key={String(name)} className="rounded-xl border border-slate/15 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <strong className="text-xs font-bold text-navy leading-5">{String(name)}</strong>
                <span className="font-mono text-base font-black text-navy">{String(score)}</span>
              </div>
              <div className="mt-3">
                <ProgressBar value={Number(score)} />
              </div>
              <p className="mt-3 text-[11px] leading-4 text-slate">{String(evidence)}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths & Improvement Opportunities */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-6 border-slate/15">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-700" size={20} />
            <h2 className="text-base font-bold text-navy">Điểm mạnh dựa trên bằng chứng</h2>
          </div>
          <div className="mt-4 space-y-3.5">
            {[
              [
                "Chất lượng khơi gợi yêu cầu (Elicitation)",
                "Bạn sử dụng khéo léo câu hỏi mở và đào sâu tiếp nối để phát hiện việc hàng đổi trả chỉ được nhập hệ thống vào cuối ca làm việc.",
              ],
              [
                "Hòa giải xung đột mục tiêu",
                "Bạn cân bằng xuất sắc giữa nhu cầu tốc độ soạn hàng của Kho với nguyên tắc phân tách nhiệm vụ kiểm toán của Kế toán.",
              ],
              [
                "Tính truy vết yêu cầu (Traceability)",
                "4/5 yêu cầu phần mềm được truy vết trực tiếp về biên bản phỏng vấn và mục tiêu kinh doanh ban đầu.",
              ],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-xl bg-mist/30 p-4">
                <strong className="text-xs font-bold text-navy">{title}</strong>
                <p className="mt-1.5 text-xs leading-5 text-slate">{copy}</p>
                <button className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-navy hover:underline">
                  <Quote size={12} /> Xem bằng chứng trích dẫn
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border-slate/15">
          <div className="flex items-center gap-3">
            <Target className="text-brass" size={20} />
            <h2 className="text-base font-bold text-navy">Cơ hội cải thiện chuyên môn</h2>
          </div>
          <div className="mt-4 space-y-3.5">
            {[
              [
                "Đánh giá giải pháp (Solution Evaluation)",
                "Chưa xác định mốc baseline ban đầu và bộ chỉ số đo lường hiệu quả MVP sau khi golive thực tế.",
              ],
              [
                "Tiêu chí nghiệm thu định lượng",
                "Hai yêu cầu còn sử dụng từ ngữ chung chung như “nhanh chóng” và “dễ sử dụng” mà không có ngưỡng giây hoặc phần trăm.",
              ],
              [
                "Phân tích tác động sự kiện thay đổi",
                "Sự cố nhà cung ứng giao hàng trễ chưa được cập nhật đồng bộ vào Nhật ký rủi ro và Danh mục yêu cầu.",
              ],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-4">
                <strong className="text-xs font-bold text-amber-900">{title}</strong>
                <p className="mt-1.5 text-xs leading-5 text-amber-900/80">{copy}</p>
                <button className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:underline">
                  Xem hướng dẫn khắc phục <ArrowUpRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Debrief Discussion */}
      <Card className="mt-6 overflow-hidden border-slate/15">
        <div className="border-b border-slate/10 bg-mist/20 p-5">
          <div className="flex items-center gap-3">
            <MessageCircleMore className="text-navy" size={20} />
            <div>
              <h2 className="text-base font-bold text-navy">Họp tổng kết: Diễn biến thực tế tại doanh nghiệp (Debrief)</h2>
              <p className="text-xs text-slate">Đối chiếu quyết định của bạn với các tín hiệu bị bỏ lỡ và phản hồi từ ban lãnh đạo.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate">Tín hiệu quan trọng bị bỏ sót</p>
            <ul className="mt-3 space-y-2.5 text-xs leading-5 text-slate">
              <li>• Kế toán đã nhắc nhở về kỳ kế toán tháng có thể bị khóa sổ.</li>
              <li>• Máy quét cũ hoàn toàn không hiển thị danh sách đơn chờ đồng bộ.</li>
              <li>• Chiến dịch khuyến mãi toàn chuỗi MILK-01 bắt đầu sau đúng 7 ngày.</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate">Phản hồi của Giám đốc điều hành</p>
            <p className="mt-3 rounded-xl bg-mist/30 p-4 text-xs italic leading-5 text-navy">
              “Giải pháp ưu tiên chuyển kho nội bộ là đúng hướng, nhưng tôi cần bạn chỉ rõ ai có thẩm quyền ghi đè quyết định và sự ảnh hưởng đến chỉ tiêu chi phí lưu kho.” — Giám đốc Chuỗi cung ứng
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate">Ghi chú tự suy ngẫm (Self-reflection)</p>
            <textarea
              className="mt-3 min-h-24 w-full rounded-xl border border-slate/20 bg-white p-3 text-xs text-navy outline-none focus:border-navy"
              defaultValue="Nếu thực hiện lại phiên này, tôi sẽ xác nhận ngay lịch trình khuyến mãi và quy tắc khóa sổ kế toán trước khi chốt phương án..."
            />
            <button className="mt-2 text-xs font-bold text-navy hover:underline">Lưu ghi chú suy ngẫm</button>
          </div>
        </div>
      </Card>

      {/* Next Experience */}
      <Card className="mt-6 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between border-slate/15">
        <div className="flex gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy">
            <Lightbulb size={22} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-brass" />
              <h2 className="text-sm font-bold text-navy">Bước phát triển tiếp theo</h2>
            </div>
            <p className="mt-1 text-xs leading-5 text-slate">
              Thực hành lại sự kiện nhà cung ứng trễ hàng để thử nghiệm phương án khác, hoặc mở kịch bản &quot;Kiểm soát số lô & Thu hồi sản phẩm lỗi&quot; để rèn luyện kỹ năng truy vết sâu hơn.
            </p>
          </div>
        </div>
        <Button variant="secondary" className="gap-2 border-slate/20 text-xs font-semibold text-navy shrink-0">
          <RefreshCcw size={15} /> Thực hành lại từ điểm lưu
        </Button>
      </Card>
    </>
  );
}
