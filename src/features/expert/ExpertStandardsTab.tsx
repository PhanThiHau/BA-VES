import { useEffect, useState } from "react";
import { Award, BookOpen, Loader2, RefreshCw } from "lucide-react";
import {
  assessmentService,
  type BabokTaskDto,
  type RubricDetailDto,
} from "../../services/assessmentService";

function weightToPercent(weight: number): number {
  const w = Number(weight) || 0;
  if (w <= 1.5) return Math.round(w * 1000) / 10;
  return Math.round(w * 10) / 10;
}

export function ExpertStandardsTab() {
  const [rubrics, setRubrics] = useState<RubricDetailDto[]>([]);
  const [tasks, setTasks] = useState<BabokTaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [r, t] = await Promise.all([
        assessmentService.getRubrics(),
        assessmentService.getBabokTasks(),
      ]);
      setRubrics(r || []);
      setTasks(t || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được tiêu chí chấm từ API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const published = rubrics.filter(
    (r) => r.status === "Published" || r.status === 1 || String(r.status).toLowerCase() === "published"
  );
  const kaGroups = tasks.reduce<Record<string, BabokTaskDto[]>>((acc, task) => {
    const key = task.knowledgeAreaCode || "OTHER";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-1.5 rounded-xl border border-navy/20 bg-white px-3 py-2 text-xs font-bold text-navy shadow-sm hover:bg-offwhite"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Làm mới
        </button>
      </div>

      {loading && rubrics.length === 0 && tasks.length === 0 ? (
        <div className="rounded-2xl border border-slate/15 bg-white p-12 text-center text-xs text-slate">
          <Loader2 size={22} className="mx-auto animate-spin text-navy" />
          <p className="mt-2">Đang tải tiêu chí chấm...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900">{error}</div>
      ) : (
        <>
          <p className="rounded-xl border border-navy/10 bg-mist/60 px-4 py-3 text-[11px] leading-5 text-slate">
            Rubric là tiêu chí do hệ thống / giảng viên tạo để chấm bài —{" "}
            <strong className="text-navy">không phải</strong> bản chuẩn BABOK của IIBA. Phần task BABOK bên dưới chỉ để đối chiếu tham chiếu.
          </p>
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
              <Award size={16} className="text-brass" /> Rubric hệ thống ({published.length})
            </h3>
            {published.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate/20 bg-white px-4 py-6 text-xs text-slate">
                Chưa có rubric đang dùng.
              </p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {published.map((rubric) => {
                  const sum = rubric.criteria.reduce((a, c) => a + weightToPercent(c.weight), 0);
                  return (
                    <article key={rubric.id} className="rounded-2xl border border-slate/15 bg-white p-4 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-brass">#{rubric.id}</span>
                        <span className="rounded-full bg-[#fbf6ec] px-2 py-0.5 text-[10px] font-bold text-navy">
                          v{rubric.version}
                        </span>
                        <span className="text-[10px] font-semibold text-slate">
                          Tổng trọng số {Math.round(sum * 10) / 10}%
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-navy">{rubric.name}</h4>
                      {rubric.description && (
                        <p className="mt-1 text-[11px] text-slate line-clamp-2">{rubric.description}</p>
                      )}
                      <ul className="mt-3 space-y-1.5">
                        {rubric.criteria.map((c) => (
                          <li
                            key={c.id}
                            className="rounded-lg border border-slate/10 bg-offwhite/50 px-2.5 py-1.5 text-[11px]"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono font-bold text-brass">{c.code}</span>
                              <span className="font-semibold text-navy">{weightToPercent(c.weight)}%</span>
                            </div>
                            <p className="mt-0.5 font-semibold text-navy">{c.name}</p>
                          </li>
                        ))}
                      </ul>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold text-navy">
              <BookOpen size={16} className="text-brass" /> Task BABOK (tham chiếu) ({tasks.length})
            </h3>
            {tasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate/20 bg-white px-4 py-6 text-xs text-slate">
                Chưa có task BABOK trong hệ thống.
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(kaGroups).map(([ka, list]) => (
                  <article key={ka} className="rounded-2xl border border-slate/15 bg-white p-4 shadow-sm">
                    <p className="font-mono text-[10px] font-extrabold text-brass">{ka}</p>
                    <p className="mt-0.5 text-xs font-bold text-navy">
                      {list[0]?.knowledgeAreaName || "Knowledge Area"}
                    </p>
                    <ul className="mt-3 max-h-48 space-y-1.5 overflow-y-auto">
                      {list.map((task) => (
                        <li key={task.id} className="border-b border-slate/10 pb-1.5 text-[11px] last:border-0">
                          <span className="font-mono font-bold text-slate">{task.code}</span>
                          <p className="font-semibold text-navy">{task.name}</p>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
