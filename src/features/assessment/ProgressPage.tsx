import {
  ArrowRight,
  Download,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { ProgressBar } from "../../components/ui/ProgressBar";
import type { RouteKey } from "../../types/models";
import { useApp } from "../../contexts/AppContext";
import {
  assessmentService,
  type CompetencyKnowledgeAreaDto,
  type CompetencyProgressDto,
  type CompetencySessionScoreDto,
} from "../../services/assessmentService";
import { resolveBabokAreaMeta, sortBabokAreas } from "./babokCatalog";

type AreaView = {
  code: string;
  nameVi: string;
  score: number | null;
};

function levelFromScore(score: number | null): { label: string; hint: string } {
  if (score == null) {
    return {
      label: "Chưa định hình",
      hint: "Hoàn thành và chấm ít nhất một phiên để thấy chân dung năng lực.",
    };
  }
  if (score >= 85) {
    return { label: "Vững chắc", hint: "Duy trì phong độ và thử kịch bản khó hơn." };
  }
  if (score >= 70) {
    return { label: "Khá tốt", hint: "Đã có nền tảng — hãy khoét sâu vùng còn thấp." };
  }
  if (score >= 55) {
    return { label: "Đang phát triển", hint: "Cần luyện thêm để các vùng đạt mức ổn định." };
  }
  return { label: "Cần củng cố", hint: "Ưu tiên 1–2 vùng yếu trước khi mở rộng phạm vi." };
}

function toAreaViews(areas: CompetencyKnowledgeAreaDto[]): AreaView[] {
  return sortBabokAreas(areas).map((area) => {
    const meta = resolveBabokAreaMeta(area.code, area.name);
    return {
      code: meta.code,
      nameVi: meta.nameVi,
      score: area.averageScore != null ? Math.round(Number(area.averageScore)) : null,
    };
  });
}

function CompetencyRadar({ areas }: { areas: AreaView[] }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 78;
  const n = Math.max(areas.length, 1);

  const pointAt = (index: number, value: number) => {
    const angle = (-Math.PI / 2) + (index * 2 * Math.PI) / n;
    const r = (Math.max(0, Math.min(100, value)) / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const rings = [25, 50, 75, 100];
  const polygon = areas
    .map((area, i) => {
      const p = pointAt(i, area.score ?? 0);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  return (
    <div className="relative mx-auto w-full max-w-[260px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full" role="img" aria-label="Biểu đồ năng lực BABOK">
        {rings.map((ring) => (
          <polygon
            key={ring}
            fill="none"
            stroke="#d9e4ec"
            strokeWidth="1"
            points={Array.from({ length: n }, (_, i) => {
              const p = pointAt(i, ring);
              return `${p.x},${p.y}`;
            }).join(" ")}
          />
        ))}
        {areas.map((_, i) => {
          const edge = pointAt(i, 100);
          return <line key={i} x1={cx} y1={cy} x2={edge.x} y2={edge.y} stroke="#e5edf4" strokeWidth="1" />;
        })}
        <polygon points={polygon} fill="rgba(16,42,67,0.18)" stroke="#102a43" strokeWidth="2" />
        {areas.map((area, i) => {
          const p = pointAt(i, area.score ?? 0);
          return <circle key={area.code} cx={p.x} cy={p.y} r="3.5" fill={area.score == null ? "#94a3b8" : "#102a43"} />;
        })}
      </svg>
      <div className="mt-1 grid grid-cols-3 gap-1.5 text-center">
        {areas.map((area) => (
          <div key={area.code} className="rounded-md bg-mist/40 px-1 py-1">
            <span className="block font-mono text-[10px] font-bold text-navy">{area.code}</span>
            <span className="font-mono text-[10px] text-slate">{area.score != null ? `${area.score}%` : "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionSparkline({ sessions }: { sessions: CompetencySessionScoreDto[] }) {
  const points = [...sessions]
    .filter((s) => s.displayScore != null)
    .slice(0, 8)
    .reverse()
    .map((s) => Math.round(Number(s.displayScore)));

  if (points.length === 0) {
    return <p className="py-6 text-center text-xs text-slate">Chưa có điểm phiên để vẽ xu hướng.</p>;
  }

  const max = Math.max(100, ...points);
  return (
    <div className="flex h-28 items-end gap-1.5">
      {points.map((value, idx) => (
        <div key={idx} className="flex flex-1 flex-col items-center justify-end gap-1">
          <span className="font-mono text-[10px] font-semibold text-navy">{value}</span>
          <div
            className="w-full rounded-t-md bg-navy/85 transition-all"
            style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
            title={`${value}/100`}
          />
        </div>
      ))}
    </div>
  );
}

export function ProgressPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { setCurrentSessionId, setCurrentSubmissionId } = useApp();
  const [progress, setProgress] = useState<CompetencyProgressDto | null>(null);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        setProgress(await assessmentService.getCompetencyProgress());
      } catch (err) {
        console.warn("Chưa tải được hồ sơ năng lực:", err);
        setProgress(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const exportPdf = () => {
    const node = printRef.current;
    if (!node) return;
    const popup = window.open("", "_blank", "noopener,noreferrer,width=960,height=720");
    if (!popup) {
      window.print();
      return;
    }
    popup.document.write(`<!doctype html><html><head><title>Hồ sơ năng lực BA-VES</title>
      <style>
        body{font-family:Segoe UI,Arial,sans-serif;color:#102a43;padding:24px;line-height:1.45}
        h1{font-size:22px;margin:0 0 6px} h2{font-size:14px;margin:18px 0 8px}
        .muted{color:#667d93;font-size:12px} .row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e5edf4}
        .kpi{font-size:28px;font-weight:800}
      </style></head><body>${node.innerHTML}</body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const averageScore =
    progress?.averageDisplayScore != null ? Math.round(Number(progress.averageDisplayScore)) : null;
  const sessions = progress?.sessions ?? [];
  const areas = useMemo(() => toAreaViews(progress?.knowledgeAreas ?? []), [progress]);
  const level = levelFromScore(averageScore);

  const scoredAreas = areas.filter((a) => a.score != null) as Array<AreaView & { score: number }>;
  const strengths = [...scoredAreas].sort((a, b) => b.score - a.score).slice(0, 2);
  const strengthCodes = new Set(strengths.map((s) => s.code));
  const weakest = [...scoredAreas]
    .sort((a, b) => a.score - b.score)
    .filter((a) => !strengthCodes.has(a.code) || scoredAreas.length <= 2)
    .slice(0, 2);
  const unscored = areas.filter((a) => a.score == null);
  const improveList = [...weakest, ...unscored].slice(0, 3);

  const coveredCount = scoredAreas.length;
  const focusArea = improveList[0] ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Hồ sơ năng lực · BABOK® v3"
        title="Chân dung năng lực của bạn"
        description="Nhìn nhanh: đang ở mức nào, mạnh ở đâu, cần luyện gì tiếp."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={exportPdf}
              disabled={!progress}
              className="gap-2 border-slate/20 text-xs font-semibold text-navy"
            >
              <Download size={14} /> Xuất PDF
            </Button>
            <Button
              onClick={() => navigate("scenarios")}
              className="gap-2 bg-navy text-xs font-semibold text-white shadow-sm hover:bg-navy-light"
            >
              Luyện tiếp <ArrowRight size={14} />
            </Button>
          </div>
        }
      />

      <div ref={printRef} className="space-y-5">
        {/* Snapshot */}
        <section className="overflow-hidden rounded-2xl border border-slate/15 bg-gradient-to-br from-navy via-navy to-[#1a3a5c] p-5 text-white shadow-sm sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
                Mức năng lực hiện tại
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <strong className="font-display text-4xl font-black tracking-tight sm:text-5xl">
                  {loading ? "…" : averageScore != null ? averageScore : "—"}
                </strong>
                <span className="mb-1 text-sm text-white/70">/ 100</span>
                <span className="mb-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold">
                  {loading ? "Đang tải" : level.label}
                </span>
              </div>
              <p className="mt-2 max-w-xl text-sm text-white/75">{level.hint}</p>

              <div className="mt-5 flex flex-wrap gap-4 text-xs">
                <div>
                  <span className="block text-white/50">Phiên hoàn thành</span>
                  <strong className="mt-0.5 block font-mono text-base">
                    {progress?.completedSessions ?? 0}/{progress?.totalSessions ?? 0}
                  </strong>
                </div>
                <div>
                  <span className="block text-white/50">Vùng đã có điểm</span>
                  <strong className="mt-0.5 block font-mono text-base">{coveredCount}/6</strong>
                </div>
                <div>
                  <span className="block text-white/50">Đã chấm</span>
                  <strong className="mt-0.5 block font-mono text-base">
                    {sessions.filter((s) => s.displayScore != null).length} phiên
                  </strong>
                </div>
              </div>

              {focusArea && (
                <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs">
                  <Target size={14} className="text-brass" />
                  <span>
                    Ưu tiên tiếp theo:{" "}
                    <strong>
                      {focusArea.code} — {focusArea.nameVi}
                    </strong>
                    {focusArea.score != null ? ` (${focusArea.score}%)` : " (chưa có điểm)"}
                  </span>
                  <Button
                    onClick={() => navigate("scenarios")}
                    className="ml-1 h-7 gap-1 bg-brass px-2.5 text-[11px] font-bold text-navy hover:bg-brass/90"
                  >
                    Chọn kịch bản <ArrowRight size={12} />
                  </Button>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white/95 p-4 text-navy shadow-inner">
              {areas.length > 0 ? (
                <CompetencyRadar areas={areas} />
              ) : (
                <p className="py-10 text-center text-xs text-slate">
                  {loading ? "Đang tải bản đồ năng lực…" : "Chưa có dữ liệu vùng tri thức."}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Strengths / Improve */}
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="border-emerald-200/70 bg-emerald-50/40 p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-600/15 text-emerald-700">
                <Zap size={16} />
              </span>
              <h2 className="text-sm font-bold text-navy">Điểm mạnh — phát huy</h2>
            </div>
            <div className="mt-4 space-y-3">
              {strengths.length > 0 ? (
                strengths.map((area) => (
                  <div key={area.code} className="flex items-center justify-between gap-3">
                    <div>
                      <strong className="text-xs font-bold text-navy">
                        {area.code} — {area.nameVi}
                      </strong>
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-700">{area.score}%</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate">
                  Chưa đủ điểm để nhận diện điểm mạnh. Hoàn thành thêm phiên đã chấm.
                </p>
              )}
            </div>
          </Card>

          <Card className="border-amber-200/80 bg-amber-50/35 p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/15 text-amber-700">
                <TrendingUp size={16} />
              </span>
              <h2 className="text-sm font-bold text-navy">Cần cải thiện</h2>
            </div>
            <div className="mt-4 space-y-3">
              {improveList.length > 0 ? (
                improveList.map((area) => (
                  <div key={area.code} className="flex items-center justify-between gap-3">
                    <strong className="text-xs font-bold text-navy">
                      {area.code} — {area.nameVi}
                    </strong>
                    <span className="font-mono text-sm font-bold text-amber-700">
                      {area.score != null ? `${area.score}%` : "Chưa có"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate">Chưa có gợi ý cải thiện — hãy bắt đầu một phiên mô phỏng.</p>
              )}
            </div>
          </Card>
        </section>

        {/* KA bars + trend */}
        <section className="grid gap-4 xl:grid-cols-2">
          <Card className="border-slate/15 p-5">
            <h2 className="text-sm font-bold text-navy">Sáu vùng tri thức</h2>
            <div className="mt-4 space-y-3.5">
              {areas.length > 0 ? (
                areas.map((area) => {
                  const isStrength = strengths.some((s) => s.code === area.code);
                  const isFocus = focusArea?.code === area.code;
                  return (
                    <div key={area.code}>
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-navy">
                          {area.code} — {area.nameVi}
                          {isStrength ? (
                            <span className="ml-2 text-[10px] font-bold text-emerald-700">Mạnh</span>
                          ) : null}
                          {isFocus ? (
                            <span className="ml-2 text-[10px] font-bold text-amber-700">Ưu tiên</span>
                          ) : null}
                        </span>
                        <span className="font-mono text-xs font-bold text-navy">
                          {area.score != null ? `${area.score}%` : "—"}
                        </span>
                      </div>
                      <ProgressBar
                        value={area.score ?? 0}
                        color={isStrength ? "#047857" : isFocus ? "#b45309" : "#102a43"}
                      />
                    </div>
                  );
                })
              ) : (
                <p className="py-6 text-center text-xs text-slate">
                  {loading ? "Đang tải…" : "Chưa có dữ liệu vùng tri thức."}
                </p>
              )}
            </div>
          </Card>

          <Card className="border-slate/15 p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-navy">Xu hướng gần đây</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate">
                <Sparkles size={12} /> {sessions.length} phiên
              </span>
            </div>
            <div className="mt-4">
              <SessionSparkline sessions={sessions} />
            </div>
            <div className="mt-4 max-h-48 space-y-2 overflow-y-auto pr-1">
              {sessions.slice(0, 5).map((ses) => {
                const done =
                  ses.status.toLowerCase().includes("completed") || ses.completedAt != null;
                return (
                  <button
                    key={ses.sessionId}
                    type="button"
                    onClick={() => {
                      setCurrentSessionId(ses.sessionId);
                      setCurrentSubmissionId(ses.latestSubmissionId ?? null);
                      navigate(ses.latestSubmissionId ? "assessment" : "simulation");
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate/10 bg-white px-3 py-2.5 text-left transition hover:border-navy/25 hover:bg-mist/20"
                  >
                    <div>
                      <span className="font-mono text-[10px] font-bold text-brass">
                        SES-{String(ses.sessionId).padStart(4, "0")}
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold text-navy">
                        Kịch bản #{ses.scenarioVersionId} · Lần {ses.attemptNo}
                      </span>
                    </div>
                    <Badge tone={ses.displayScore != null ? "green" : done ? "amber" : "amber"}>
                      {ses.displayScore != null
                        ? `${Math.round(Number(ses.displayScore))}/100`
                        : "Chưa chấm"}
                    </Badge>
                  </button>
                );
              })}
              {sessions.length === 0 && (
                <p className="py-4 text-center text-xs text-slate">
                  {loading ? "Đang tải…" : "Chưa có phiên. Bắt đầu từ Thư viện kịch bản."}
                </p>
              )}
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
