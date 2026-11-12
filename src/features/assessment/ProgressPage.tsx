import {
  ArrowRight,
  Award,
  CalendarDays,
  MessageSquareText,
  Sparkles,
  TrendingUp,
  BookOpen,
  Loader2,
  PhoneCall,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { RouteKey } from "../../types/models";
import { useApp } from "../../contexts/AppContext";
import {
  assessmentService,
  type BabokTaskDto,
  type FinalSubmissionReportDto,
} from "../../services/assessmentService";
import {
  simulationService,
  type SessionHistoryItemDto,
} from "../../services/simulationService";
import { ConsultationModal } from "../../components/common/ConsultationModal";

export function ProgressPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { currentSessionId, currentSubmissionId, setCurrentSessionId, setCurrentScenarioVersionId } = useApp();
  const [report, setReport] = useState<FinalSubmissionReportDto | null>(null);
  const [babokTasks, setBabokTasks] = useState<BabokTaskDto[]>([]);
  const [mySessions, setMySessions] = useState<SessionHistoryItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);

  useEffect(() => {
    async function loadAssessmentProgress() {
      setLoading(true);
      try {
        const [rep, tasks, sessions] = await Promise.allSettled([
          currentSubmissionId ? assessmentService.getFinalReport(currentSubmissionId) : Promise.resolve(null),
          assessmentService.getBabokTasks(),
          simulationService.getMySessions(),
        ]);
        if (rep.status === "fulfilled" && rep.value) setReport(rep.value);
        if (tasks.status === "fulfilled" && Array.isArray(tasks.value)) setBabokTasks(tasks.value);
        if (sessions.status === "fulfilled" && Array.isArray(sessions.value)) setMySessions(sessions.value);
      } catch (err) {
        console.warn("Chưa tải được dữ liệu tiến độ:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessmentProgress();
  }, [currentSessionId, currentSubmissionId]);

  const knowledgeAreas = useMemo(() => {
    const map = new Map<string, { code: string; name: string; tasksCount: number }>();
    for (const t of babokTasks) {
      const code = t.knowledgeAreaCode || "BABOK";
      const prev = map.get(code);
      if (prev) prev.tasksCount += 1;
      else map.set(code, { code, name: t.knowledgeAreaName || code, tasksCount: 1 });
    }
    return Array.from(map.values());
  }, [babokTasks]);

  const criteriaScores =
    report?.expertReview?.criterionScores && report.expertReview.criterionScores.length > 0
      ? report.expertReview.criterionScores
      : report?.aiFeedback?.criterionScores || [];

  const latestScore =
    report?.finalScore != null
      ? Math.round(Number(report.finalScore))
      : report?.aiFeedback?.suggestedScore != null
      ? Math.round(Number(report.aiFeedback.suggestedScore))
      : null;

  const completedCount = mySessions.filter(
    (s) => String(s.status).toLowerCase() === "completed" || String(s.status).toLowerCase() === "submitted"
  ).length;

  return (
    <>
      <PageHeader
        eyebrow="Hồ sơ năng lực thực chiến · BABOK® v3"
        title="Hồ sơ phát triển Năng lực Thực hành"
        description="Theo dõi sự tiến bộ và tích lũy bằng chứng năng lực qua các kịch bản mô phỏng doanh nghiệp ảo từ hệ thống."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brass/30 bg-brass/10 px-3 py-1 text-xs font-semibold text-brass">
              <Sparkles size={14} /> {mySessions.length} phiên thực hành
            </span>
            <Button
              variant="secondary"
              onClick={() => setShowConsultationModal(true)}
              className="gap-1.5 border-slate/20 text-xs font-semibold text-navy hover:bg-mist/30"
              title="Đặt lịch hoặc mở phòng trao đổi trực tiếp với Chuyên gia BA"
            >
              <PhoneCall size={14} className="text-emerald-700" /> Tư vấn 1-on-1 với Chuyên gia
            </Button>
            <Button
              onClick={() => navigate("scenarios")}
              className="gap-2 bg-navy text-xs font-semibold hover:bg-navy-light text-white shadow-sm"
            >
              Thực hành kịch bản mới <ArrowRight size={14} />
            </Button>
          </div>
        }
      />

      {/* KPI Counters */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [TrendingUp, `${completedCount}/${mySessions.length}`, "Phiên đã hoàn thành / Tổng phiên", "text-emerald-700 bg-emerald-500/10"],
          [Award, latestScore !== null ? `${latestScore}/100` : "--", "Điểm bài nộp gần nhất", "text-navy bg-navy/10"],
          [CalendarDays, `${knowledgeAreas.length} vùng`, "Chuẩn tri thức BABOK® v3 tích hợp", "text-brass bg-brass/10"],
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
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-navy" />
            <h2 className="text-base font-bold text-navy">Khung Tri thức BABOK® v3 từ Hệ thống</h2>
          </div>
          <p className="mt-0.5 text-xs text-slate">Các vùng tri thức và tác vụ nghiệp vụ được đồng bộ từ Backend Assessment module.</p>

          {loading ? (
            <div className="py-10 text-center text-xs text-slate">
              <Loader2 size={20} className="mx-auto mb-2 animate-spin text-navy" />
              Đang tải dữ liệu BABOK...
            </div>
          ) : knowledgeAreas.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate/20 p-6 text-center text-xs text-slate">
              Chưa có dữ liệu BABOK Knowledge Areas trên máy chủ.
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {knowledgeAreas.map((ka) => (
                <div key={ka.code} className="rounded-xl border border-slate/10 bg-white p-4 shadow-xs flex items-center justify-between">
                  <div>
                    <strong className="text-xs font-bold text-navy">{ka.name}</strong>
                    <span className="mt-0.5 block font-mono text-[11px] text-slate">{ka.code}</span>
                  </div>
                  <Badge tone="navy">{ka.tasksCount} Tasks</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 border-slate/15">
          <h2 className="text-base font-bold text-navy">Kết quả Đánh giá theo Tiêu chí (Rubric Criteria)</h2>
          <p className="mt-0.5 text-xs text-slate">Điểm số chi tiết từ lần chấm bài gần nhất của bạn.</p>
          {criteriaScores.length === 0 ? (
            <div className="mt-5 rounded-xl border border-dashed border-slate/20 p-8 text-center text-xs text-slate">
              Chưa có kết quả chấm điểm chi tiết cho bài nộp hiện tại.
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {criteriaScores.map((crit) => {
                const max = crit.maxScore || 100;
                const pct = Math.round((Number(crit.score) / max) * 100);
                return (
                  <div key={crit.rubricCriterionId} className="rounded-xl border border-slate/10 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <strong className="text-xs font-bold text-navy">{crit.criterionName || crit.criterionCode}</strong>
                        {crit.comment && <span className="mt-0.5 block text-[11px] text-slate">{crit.comment}</span>}
                      </div>
                      <strong className="font-mono text-base font-bold text-navy">
                        {Math.round(Number(crit.score))}/{max}
                      </strong>
                    </div>
                    <div className="mt-2.5">
                      <ProgressBar value={pct} color="#c58b52" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* History table */}
      <Card className="mt-6 overflow-hidden border-slate/15">
        <div className="flex items-center gap-3 border-b border-slate/10 p-5">
          <MessageSquareText className="text-navy" size={20} />
          <div>
            <h2 className="text-base font-bold text-navy">Lịch sử các phiên mô phỏng doanh nghiệp của bạn</h2>
            <p className="text-xs text-slate">Dữ liệu thực tế từ hệ thống GET /api/sessions.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="bg-mist/30 text-[11px] uppercase tracking-wider text-slate">
              <tr>
                <th className="px-5 py-3.5">Mã phiên</th>
                <th className="px-5 py-3.5">Phiên bản kịch bản</th>
                <th className="px-5 py-3.5">Tương tác</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5">Bắt đầu lúc</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate/10">
              {mySessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate">
                    Bạn chưa tham gia phiên thực hành mô phỏng nào.
                  </td>
                </tr>
              ) : (
                mySessions.map((ses) => {
                  const st = String(ses.status);
                  const isDone = st.toLowerCase() === "completed" || st.toLowerCase() === "submitted";
                  return (
                    <tr key={ses.id} className="hover:bg-mist/10">
                      <td className="px-5 py-4 font-mono font-bold text-navy">SES-{ses.id} (Lần {ses.attemptNo})</td>
                      <td className="px-5 py-4 font-bold text-navy">Version #{ses.scenarioVersionId}</td>
                      <td className="px-5 py-4 text-slate">
                        {ses.agentCount} AI Stakeholders · {ses.messageCount} tin nhắn
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={isDone ? "green" : "amber"}>{st}</Badge>
                      </td>
                      <td className="px-5 py-4 text-slate">
                        {new Date(ses.startedAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setCurrentSessionId(ses.id);
                            setCurrentScenarioVersionId(ses.scenarioVersionId);
                            navigate(isDone ? "assessment" : "simulation");
                          }}
                          className="border-slate/20 text-[11px] py-1 px-2.5 font-semibold text-navy hover:bg-white"
                        >
                          {isDone ? "Xem báo cáo" : "Tiếp tục phiên"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConsultationModal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
      />
    </>
  );
}
