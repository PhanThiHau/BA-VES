import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  FileCheck2,
  Plus,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { classNames } from "../../../utils/format";
import type { ReviewItem, LiveSessionItem, ScenarioVersion } from "../instructorData";

interface OverviewTabProps {
  scenarios: ScenarioVersion[];
  liveSessions: LiveSessionItem[];
  reviewItems: ReviewItem[];
  onSelectTab: (tabId: string) => void;
  onQuickReview: (item: ReviewItem) => void;
  onQuickObserve: (session: LiveSessionItem) => void;
}

export function OverviewTab({
  scenarios,
  liveSessions,
  reviewItems,
  onSelectTab,
  onQuickReview,
  onQuickObserve,
}: OverviewTabProps) {
  const pendingReviews = reviewItems.filter((i) => i.status === "pending");

  const kpiStats = [
    {
      icon: Users,
      value: "85",
      unit: "học viên",
      label: "Tổng sĩ số các lớp",
      note: "3 lớp đang hoạt động",
      tone: "bg-[#e8f1f7] text-[#2f638c]",
      trend: "Ổn định",
    },
    {
      icon: Activity,
      value: String(liveSessions.length).padStart(2, "0"),
      unit: "phiên",
      label: "Đang phỏng vấn trực tiếp",
      note: "Học viên đang hỏi đáp với AI",
      tone: "bg-[#e8f5ef] text-[#2d7b60]",
      trend: "Trực tuyến",
      hasPulse: true,
    },
    {
      icon: FileCheck2,
      value: String(pendingReviews.length).padStart(2, "0"),
      unit: "bài nộp",
      label: "Bài chờ thầy cô duyệt",
      note: `${reviewItems.filter((r) => r.tone === "red").length} bài độ tin cậy AI thấp`,
      tone: "bg-[#fff3e0] text-[#9b681d]",
      trend: "Cần xử lý",
    },
    {
      icon: BarChart3,
      value: "71.4",
      unit: "/100",
      label: "Điểm năng lực trung bình",
      note: "+4.6 điểm so với bài trước",
      tone: "bg-[#f1eef8] text-[#605594]",
      trend: "Tăng trưởng",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Bento Hero Card: Trung tâm Điều hành Thời gian Thực */}
      <Card className="overflow-hidden border-[#d9e4ec] shadow-[0_4px_20px_rgba(19,45,73,0.04)]">
        <div className="grid lg:grid-cols-[1.25fr_0.75fr]">
          {/* Cột trái: Lời chào & Tình trạng nhanh */}
          <div className="relative bg-gradient-to-br from-[#132d49] via-[#1a3f66] to-[#2a6691] p-7 text-white">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/12 text-[#c3e0ef] shadow-inner">
                <ShieldCheck size={26} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#d3e5f2]">
                    Bảng điều khiển Giảng viên
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Hệ thống đang hoạt động
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  Chào Thầy/Cô, hôm nay có {liveSessions.length} bạn đang thực hành và {pendingReviews.length} bài chờ chấm.
                </h2>
                <p className="mt-2 text-xs leading-6 text-[#d2e2ec] max-w-2xl">
                  Thầy cô có thể quan sát trực tiếp buổi phỏng vấn của học viên, chủ động gửi sự cố bất ngờ để thử thách phản xạ và duyệt lại điểm số theo tiêu chí năng lực thực tế.
                </p>

                {/* Các nút hành động chính */}
                <div className="mt-5 flex flex-wrap gap-2.5">
                  <Button
                    onClick={() => onSelectTab("live")}
                    className="bg-white text-[#132d49] hover:bg-[#f0f5fa] hover:text-[#132d49] text-xs font-bold shadow-md"
                  >
                    <Radio size={14} className="text-[#2d7b60] mr-1" />
                    Vào phòng quan sát trực tiếp
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onSelectTab("review")}
                    className="bg-white/15 text-white border-white/20 hover:bg-white/25 text-xs font-semibold"
                  >
                    <FileCheck2 size={14} className="mr-1 text-amber-200" />
                    Chấm bài trong hàng đợi ({pendingReviews.length})
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: 2 Lời khuyên Sư phạm Mộc mạc */}
          <div className="grid grid-cols-1 divide-y divide-[#e6edf2] bg-[#f8fafc]">
            <div className="p-5">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2d7b60]">
                <Check size={14} /> Thầy cô nên ưu tiên
              </span>
              <p className="mt-1.5 text-xs text-[#526b81] leading-5">
                Quan sát xem học viên có biết đặt <strong>câu hỏi gợi mở</strong> để tìm ra nguyên nhân sâu xa không, hay chỉ hỏi đoán mò có/không.
              </p>
            </div>
            <div className="p-5 bg-[#fffdf9]">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#9b681d]">
                <Sparkles size={14} /> Gợi ý sư phạm
              </span>
              <p className="mt-1.5 text-xs text-[#72664f] leading-5">
                Nếu thấy học viên phỏng vấn quá êm xuôi, thầy cô hãy bấm <strong>&quot;Gửi sự cố&quot;</strong> (như nhà cung ứng trễ hàng) để xem bạn ấy ứng biến ra sao.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 4 Thẻ Số liệu Nhanh dạng Bento */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiStats.map(({ icon: Icon, value, unit, label, note, tone, trend, hasPulse }) => (
          <Card
            key={label}
            className="p-5 border-[#d9e4ec] transition-all duration-200 hover:shadow-md hover:border-[#b8cfdf]"
          >
            <div className="flex items-center justify-between">
              <span className={classNames("grid h-10 w-10 place-items-center rounded-xl", tone)}>
                <Icon size={19} />
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#f0f4f8] px-2 py-0.5 text-[10px] font-bold text-[#5b738b]">
                {hasPulse && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                {trend}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <strong className="font-mono text-3xl font-extrabold text-[#132d49]">
                {value}
              </strong>
              <span className="text-xs font-bold text-[#667d93]">{unit}</span>
            </div>
            <span className="mt-1 block text-xs font-bold text-[#203a5c]">{label}</span>
            <span className="mt-1 block text-[11px] text-[#8291a1]">{note}</span>
          </Card>
        ))}
      </div>

      {/* Khung Bento Đôi: Cột Trái Chấm Bài - Cột Phải Phòng Giám Sát */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        {/* Cột Trái: Hàng Đợi Chấm Bài Cần Thầy Cô Xem Xét */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-[#d9e4ec] shadow-xs">
            <div className="flex flex-col gap-3 border-b border-[#e3e9ef] p-5 sm:flex-row sm:items-center sm:justify-between bg-[#f8fafc]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-[#fff3e0] text-[#9b681d]">
                    <FileCheck2 size={15} />
                  </span>
                  <h3 className="text-sm font-bold text-[#132d49]">
                    Hàng đợi Bài nộp Cần Thầy/Cô Duyệt Điểm
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-[#667d93]">
                  Hệ thống AI đã chấm nháp trước. Thầy cô chỉ cần đối chiếu bằng chứng và chốt điểm chính thức.
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectTab("review")}
                className="gap-1.5 text-xs text-[#2f638c] font-bold"
              >
                Mở toàn bộ ({pendingReviews.length}) <ArrowRight size={14} />
              </Button>
            </div>

            <div className="divide-y divide-[#e6edf2]">
              {reviewItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 p-4 transition-colors hover:bg-[#f8fafc] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eaf1f7] text-xs font-black text-[#2f638c]">
                      {item.learner
                        .split(" ")
                        .slice(-2)
                        .map((p) => p[0])
                        .join("")}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-bold text-[#132d49]">{item.learner}</strong>
                        <span className="rounded-md bg-[#f0f4f8] px-1.5 py-0.5 text-[10px] font-semibold text-[#667d93]">
                          {item.cohort}
                        </span>
                        <Badge tone={item.status === "calibrated" ? "green" : item.tone}>
                          {item.status === "calibrated" ? "Đã chốt điểm" : "Chờ thầy cô duyệt"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-[#526b81]">{item.issueSummary}</p>
                      <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-[#8291a1]">
                        <span>Tài liệu: {item.deliverablesSubmitted.join(", ")}</span>
                        <span>•</span>
                        <span>Hạn xử lý: {item.due}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:shrink-0">
                    <div className="text-right">
                      <div className="text-[11px] text-[#667d93]">AI chấm / Thầy cô</div>
                      <div className="font-mono text-xs font-bold text-[#132d49]">
                        {item.aiScore}/100{" "}
                        <span className="text-[#8291a1]">({item.aiConfidence}% tin cậy)</span>
                        {item.humanScore !== null && (
                          <span className="ml-1 text-[#2d7b60] font-bold">➔ {item.humanScore}đ</span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onQuickReview(item)}
                      className="text-xs font-bold"
                    >
                      Duyệt bài
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Đề bài Kịch bản Đang Mở Cho Học Viên */}
          <Card className="overflow-hidden border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] p-5 bg-[#f8fafc]">
              <div>
                <h3 className="text-sm font-bold text-[#132d49]">
                  Đề bài & Tình huống Thực hành Sẵn có ({scenarios.length})
                </h3>
                <p className="mt-0.5 text-xs text-[#667d93]">
                  Mỗi đề bài bao gồm dàn nhân vật AI, bí mật doanh nghiệp và tiêu chí chấm điểm.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectTab("authoring")}
                className="gap-1.5 text-xs text-[#2f638c] font-bold"
              >
                Quản lý đề bài <ArrowRight size={14} />
              </Button>
            </div>
            <div className="divide-y divide-[#e6edf2]">
              {scenarios.map((sc) => (
                <div key={sc.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-[#fafcfd]">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-[#132d49]">{sc.scenarioTitle}</strong>
                      <span className="rounded-md bg-[#eaf1f7] px-1.5 py-0.5 text-[10px] font-bold text-[#2f638c]">
                        {sc.versionNumber}
                      </span>
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-[#667d93]">
                        {sc.domain}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-[#667d93]">{sc.baselineProblem}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-[#8291a1]">
                      <span>{sc.stakeholdersCount} Nhân vật AI</span>
                      <span>•</span>
                      <span>{sc.eventsCount} Tình huống sự cố</span>
                      <span>•</span>
                      <span>{sc.rubricCriteriaCount} Tiêu chí đánh giá</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone={sc.status === "Đã ban hành" ? "green" : "amber"}>
                      {sc.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Cột Phải: Phòng Giám Sát Trực Tiếp Nhỏ & Lối Tắt */}
        <div className="space-y-6">
          <Card className="p-5 border-[#d9e4ec] shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2d7b60]" />
                </span>
                <h3 className="text-sm font-bold text-[#132d49]">
                  Học viên đang thực hành ({liveSessions.length})
                </h3>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectTab("live")}
                className="text-xs text-[#2f638c] font-bold"
              >
                Mở phòng quan sát
              </Button>
            </div>
            <p className="mt-1 text-xs text-[#667d93]">
              Theo dõi trực tiếp những gì học viên đang hỏi các nhân vật AI.
            </p>

            <div className="mt-4 space-y-3">
              {liveSessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-xl border border-[#dfe8ee] bg-[#fbfcfd] p-3 transition-colors hover:bg-[#f4f8fb]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-xs font-bold text-[#132d49]">
                        {session.learner}
                      </strong>
                      <p className="text-[11px] text-[#667d93]">
                        Đang nói chuyện: <span className="text-[#132d49] font-semibold">{session.currentStakeholder}</span>
                      </p>
                    </div>
                    <Badge
                      tone={
                        session.severity === "Đang làm tốt"
                          ? "green"
                          : session.severity === "Có sự kiện thay đổi"
                          ? "navy"
                          : "amber"
                      }
                    >
                      {session.severity}
                    </Badge>
                  </div>
                  <div className="mt-2.5">
                    <div className="flex justify-between text-[11px] text-[#667d93] mb-1">
                      <span>Tiến độ khám phá</span>
                      <span className="font-mono font-bold text-[#132d49]">{session.progress}%</span>
                    </div>
                    <ProgressBar value={session.progress} />
                  </div>
                  <p className="mt-2 text-[11px] text-[#526b81] line-clamp-1 italic">
                    Ghi nhận: &quot;{session.signal}&quot;
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#edf2f6]">
                    <span className="text-[10px] text-[#8291a1]">Thời gian: {session.elapsed}</span>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onQuickObserve(session)}
                      className="h-7 px-2.5 text-[11px]"
                    >
                      Xem đoạn chat
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Lối Tắt Hành Động Nhanh */}
          <Card className="p-5 border-[#cadce8] bg-[#f5f9fc]">
            <div className="flex items-center gap-2 text-[#2f638c]">
              <Zap size={18} />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#132d49]">
                Thao tác nhanh cho Thầy/Cô
              </h4>
            </div>
            <div className="mt-3 space-y-2">
              <Button
                variant="secondary"
                onClick={() => onSelectTab("authoring")}
                className="w-full justify-start text-xs bg-white text-[#132d49] font-semibold shadow-xs"
              >
                <Plus size={15} className="mr-2 text-[#2f638c]" />
                Tạo đề bài kịch bản mới
              </Button>
              <Button
                variant="secondary"
                onClick={() => onSelectTab("cohorts")}
                className="w-full justify-start text-xs bg-white text-[#132d49] font-semibold shadow-xs"
              >
                <Users size={15} className="mr-2 text-[#2f638c]" />
                Giao đề bài cho lớp học
              </Button>
              <Button
                variant="secondary"
                onClick={() => onSelectTab("live")}
                className="w-full justify-start text-xs bg-white text-[#132d49] font-semibold shadow-xs"
              >
                <Radio size={15} className="mr-2 text-[#9b681d]" />
                Gửi sự cố thử thách học viên
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
