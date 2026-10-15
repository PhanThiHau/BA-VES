import { useState } from "react";
import {
  BarChart3,
  Download,
  GraduationCap,
  Target,
  Waypoints,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { classNames } from "../../../utils/format";
import { cohortCompetencyAverages } from "../instructorData";

const learnerCompetencyRows = [
  {
    name: "Nguyễn Minh Anh",
    cohort: "Lớp BA-01",
    elicitation: 78,
    strategy: 68,
    analysis: 72,
    traceability: 64,
    evaluation: 70,
    action: "Cần kèm cặp thêm về cách cập nhật rủi ro vào tài liệu",
  },
  {
    name: "Lê Phương Thảo",
    cohort: "Lớp BA-01",
    elicitation: 80,
    strategy: 82,
    analysis: 84,
    traceability: 78,
    evaluation: 84,
    action: "Làm bài rất tốt, có thể giao làm nhóm trưởng hỗ trợ các bạn",
  },
  {
    name: "Trần Hải Nam",
    cohort: "Lớp BA-02",
    elicitation: 66,
    strategy: 62,
    analysis: 68,
    traceability: 60,
    evaluation: 67,
    action: "Cần luyện thêm cách đặt câu hỏi mở thay vì đoán ý",
  },
  {
    name: "Phạm Thanh Tùng",
    cohort: "Lớp BA-01",
    elicitation: 72,
    strategy: 70,
    analysis: 68,
    traceability: 62,
    evaluation: 71,
    action: "Nhắc nhở bạn bổ sung nguồn gốc các yêu cầu phần mềm",
  },
  {
    name: "Hoàng Mỹ Linh",
    cohort: "Lớp BA-01",
    elicitation: 74,
    strategy: 76,
    analysis: 71,
    traceability: 73,
    evaluation: 69,
    action: "Cần kiểm tra kỹ lại giả định với kế toán trước khi viết đề xuất",
  },
];

export function CompetencyAnalyticsTab() {
  const [selectedCohort, setSelectedCohort] = useState<string>("all");

  const handleExport = () => {
    alert("Đang chuẩn bị xuất file báo cáo tổng hợp kết quả học tập của lớp...");
  };

  return (
    <div className="space-y-6">
      {/* Khung Tiêu Đề Dễ Hiểu */}
      <Card className="overflow-hidden border-[#cadce8] bg-[#f8fafc] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#eaf1f7] text-[#2f638c]">
                <BarChart3 size={18} />
              </span>
              <h2 className="text-base font-bold text-[#132d49]">
                Bảng Thống Kê Năng Lực & Kỹ Năng Của Cả Lớp
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#667d93]">
              Tổng hợp điểm số của học viên qua 6 nhóm kỹ năng phân tích nghiệp vụ cốt lõi, giúp thầy cô biết lớp đang mạnh chỗ nào và yếu chỗ nào để phụ đạo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExport} className="gap-1.5 text-xs">
              <Download size={14} /> Xuất Báo Cáo Ra File
            </Button>
          </div>
        </div>
      </Card>

      {/* 6 Thẻ Kỹ Năng Nền Tảng */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cohortCompetencyAverages.map((item) => (
          <Card key={item.area} className="p-5 border-[#d9e4ec]">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-[#132d49] line-clamp-1">{item.area}</span>
              <Badge tone={item.gap.startsWith("+") ? "green" : "amber"}>{item.gap}</Badge>
            </div>
            <p className="mt-1 text-[11px] text-[#667d93] line-clamp-1">{item.desc}</p>
            <div className="mt-4 flex items-baseline justify-between">
              <strong className="font-mono text-3xl font-extrabold text-[#132d49]">
                {item.score}
                <span className="text-xs font-normal text-[#667d93]">/100</span>
              </strong>
              <span className="text-[11px] text-[#667d93]">Điểm chuẩn: {item.benchmark}đ</span>
            </div>
            <div className="mt-3">
              <ProgressBar
                value={item.score}
                color={item.score >= 75 ? "#2d7b60" : item.score >= 68 ? "#2f638c" : "#9b681d"}
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Bảng Năng Lực Chi Tiết Từng Học Viên */}
      <Card className="overflow-hidden border-[#d9e4ec]">
        <div className="flex flex-col gap-3 border-b border-[#e2e9ef] bg-[#f8fafc] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#132d49]">
              Điểm Kỹ Năng Chi Tiết Từng Bạn Học Viên
            </h3>
            <p className="text-xs text-[#667d93]">
              Điểm được tính sau khi thầy cô đã thẩm định và chốt kết quả các bài tập.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#667d93]">Lọc lớp:</span>
            <select
              value={selectedCohort}
              onChange={(e) => setSelectedCohort(e.target.value)}
              className="rounded-xl border border-[#d9e4ec] bg-white px-3 py-1.5 text-xs text-[#132d49] outline-none"
            >
              <option value="all">Tất cả các lớp</option>
              <option value="Lớp BA-01">Lớp BA-01 (Chuỗi cung ứng)</option>
              <option value="Lớp BA-02">Lớp BA-02 (Ngân hàng)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="bg-[#f5f8fa] text-[11px] uppercase tracking-wider text-[#667d93] border-b border-[#e2e9ef]">
              <tr>
                <th className="px-5 py-3.5">Học viên</th>
                <th className="px-4 py-3.5 text-center">Khơi gợi yêu cầu</th>
                <th className="px-4 py-3.5 text-center">Hiểu vấn đề</th>
                <th className="px-4 py-3.5 text-center">Viết tài liệu</th>
                <th className="px-4 py-3.5 text-center">Xử lý thay đổi</th>
                <th className="px-4 py-3.5 text-center">Thuyết phục</th>
                <th className="px-5 py-3.5">Gợi ý hỗ trợ học viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6edf2]">
              {learnerCompetencyRows
                .filter((r) => (selectedCohort === "all" ? true : r.cohort === selectedCohort))
                .map((row) => (
                  <tr key={row.name} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-4">
                      <strong className="text-xs font-bold text-[#132d49]">{row.name}</strong>
                      <span className="block text-[10px] text-[#8291a1]">{row.cohort}</span>
                    </td>
                    {[row.elicitation, row.strategy, row.analysis, row.traceability, row.evaluation].map(
                      (score, index) => (
                        <td key={index} className="px-4 py-4 text-center">
                          <span
                            className={classNames(
                              "inline-flex min-w-10 justify-center rounded-lg px-2 py-1 font-mono text-xs font-bold",
                              score >= 75
                                ? "bg-[#e8f5ef] text-[#2d7b60]"
                                : score >= 68
                                ? "bg-[#eaf1f7] text-[#2f638c]"
                                : "bg-[#fff1dd] text-[#9b681d]"
                            )}
                          >
                            {score}đ
                          </span>
                        </td>
                      )
                    )}
                    <td className="px-5 py-4">
                      <span className="text-xs text-[#526b81]">{row.action}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Lời Khuyên Sư Phạm */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 border-[#d9e4ec]">
          <div className="flex items-center gap-2 text-[#2f638c]">
            <GraduationCap size={18} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#132d49]">
              Lên kế hoạch bài tập bổ trợ
            </h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#667d93]">
            Nếu lớp có điểm phần xử lý thay đổi còn thấp, thầy cô nên giao thêm bài tập có tình huống bất ngờ để các bạn quen dần với việc xử lý sự cố.
          </p>
        </Card>

        <Card className="p-5 border-[#d9e4ec]">
          <div className="flex items-center gap-2 text-[#9b681d]">
            <Target size={18} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#132d49]">
              Nhắc nhở kỹ năng cần rèn
            </h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#667d93]">
            Ở buổi học kế tiếp, hãy dặn học viên tập thói quen tóm tắt lại lời của sếp hoặc khách hàng trước khi đưa ra kết luận để tránh hiểu nhầm.
          </p>
        </Card>

        <Card className="p-5 border-[#d9e4ec]">
          <div className="flex items-center gap-2 text-[#2d7b60]">
            <Waypoints size={18} />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#132d49]">
              Thử thách đa ngành nghề
            </h4>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#667d93]">
            Sau khi học viên đã làm quen với bài tập Kho vận, thầy cô có thể giao thử đề bài Ngân hàng hoặc Bệnh viện để kiểm tra độ linh hoạt của các bạn.
          </p>
        </Card>
      </div>
    </div>
  );
}
