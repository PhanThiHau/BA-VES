import { ArrowRight, FileText, MessageSquareText, SearchCheck } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { RouteKey } from "../../types/models";

/**
 * Phân tích không còn là bước bắt buộc trong luồng mô phỏng.
 * Learner thể hiện phân tích trên Docs; Sprint Review chất vấn artifact.
 * Route #/analysis giữ lại để không gãy deep-link cũ.
 */
export function AnalysisHubPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-1 py-2">
      <PageHeader
        title="Phân tích nằm trong Docs"
        description="Không còn bước phân tích riêng — tránh trùng với hồ sơ BA và làm rối luồng mô phỏng."
      />

      <Card className="border-slate/15 p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-navy">
            <SearchCheck size={18} />
          </span>
          <div className="min-w-0 space-y-2 text-sm leading-6 text-slate">
            <p>
              Phát hiện, giả định, xung đột và yêu cầu nên được ghi trực tiếp trong{" "}
              <span className="font-semibold text-navy">Docs / hồ sơ artifact</span>. Đây là đầu ra
              chính để Review Sprint và nghiệm thu đánh giá.
            </p>
            <p>
              Khi cần góp ý giữa chừng, dùng <span className="font-semibold text-navy">Review Sprint</span>{" "}
              trên trang phỏng vấn — hội đồng chất vấn dựa trên artifact và lịch sử trao đổi, không
              bắt bạn lập thêm bảng phân tích song song.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={() => navigate("docs")} className="gap-1.5">
            <FileText size={14} />
            Soạn Docs
            <ArrowRight size={14} />
          </Button>
          <Button variant="secondary" onClick={() => navigate("simulation")} className="gap-1.5">
            <MessageSquareText size={14} />
            Về phỏng vấn / Review Sprint
          </Button>
          <Button variant="secondary" onClick={() => navigate("artifacts")} className="gap-1.5">
            Xem hồ sơ nộp
          </Button>
        </div>
      </Card>

      <p className="text-center text-[11px] leading-5 text-slate">
        Bằng chứng đánh dấu trong chat vẫn dùng khi soạn Docs. AI Coach trên trang phỏng vấn chỉ là
        gợi ý tuỳ chọn, không bắt buộc.
      </p>
    </div>
  );
}
