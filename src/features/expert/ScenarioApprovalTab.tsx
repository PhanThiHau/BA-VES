import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Layers3,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { CollapsibleDetail } from "../../components/common/CollapsibleDetail";
import {
  ReadableProse,
  toListItems as sharedToListItems,
  toReadableLines,
} from "../../components/common/ReadableProse";
import {
  scenarioAuthoringService,
  type AuthoringBusinessRuleDto,
  type AuthoringKnowledgeItemDto,
  type AuthoringPersonaDto,
  type AuthoringScenarioEventDto,
  type ScenarioDefinitionDto,
  type ScenarioReviewQueueItemDto,
} from "../../services/scenarioAuthoringService";
import { sprintsFromDefinition } from "../instructor/components/sprintAssignment";

const DIFFICULTY_LABEL: Record<number, string> = {
  0: "Beginner",
  1: "Intermediate",
  2: "Advanced",
};

type DetailTab = "definition" | "personas" | "knowledge" | "rules" | "events";

function splitLines(value?: string | null): string[] {
  return toReadableLines(value || "");
}

function toListItems(value?: string | null): string[] {
  return sharedToListItems(value);
}

function splitSprints(
  sprints?: ScenarioDefinitionDto["sprints"] | null
): Array<{ label: string; body: string; durationLabel?: string }> {
  if (!sprints || sprints.length === 0) return [];
  return sprintsFromDefinition(sprints).map((s) => ({
    label: `Sprint ${s.sprintNo}`,
    body: s.focus || "(trống)",
    durationLabel: `${s.durationValue} ${s.durationUnit === "days" ? "ngày" : "tuần"}`,
  }));
}

type QueueMode = "pending" | "reviewed";

export function ScenarioApprovalTab() {
  const [queueMode, setQueueMode] = useState<QueueMode>("pending");
  const [items, setItems] = useState<ScenarioReviewQueueItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [definition, setDefinition] = useState<ScenarioDefinitionDto | null>(null);
  const [loadingDef, setLoadingDef] = useState(false);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>("definition");
  const isPendingMode = queueMode === "pending";

  const load = async (mode: QueueMode = queueMode) => {
    setLoading(true);
    setNotice(null);
    try {
      const list =
        mode === "pending"
          ? await scenarioAuthoringService.listReviewQueue()
          : await scenarioAuthoringService.listReviewedByMe();
      setItems(list || []);
      setSelectedId((current) => {
        if (current && list?.some((i) => i.versionId === current)) return current;
        return list?.[0]?.versionId ?? null;
      });
    } catch (err) {
      console.warn("Could not load scenario review list:", err);
      setItems([]);
      setSelectedId(null);
      setNotice(
        mode === "pending"
          ? "Không tải được hàng đợi duyệt. Hãy đăng nhập bằng tài khoản Expert."
          : "Không tải được lịch sử đã duyệt. Hãy đăng nhập bằng tài khoản Expert."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(queueMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueMode]);

  useEffect(() => {
    if (!selectedId) {
      setDefinition(null);
      return;
    }
    let cancelled = false;
    setLoadingDef(true);
    setTab("definition");
    scenarioAuthoringService
      .getDefinition(selectedId)
      .then((def) => {
        if (!cancelled) setDefinition(def);
      })
      .catch(() => {
        if (!cancelled) setDefinition(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingDef(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const selected = items.find((item) => item.versionId === selectedId) ?? null;

  const meta = useMemo(() => {
    if (!selected) return null;
    return {
      summary: definition?.summary || selected.summary || "",
      context: definition?.businessContext || selected.businessContext || "",
      problem: definition?.businessProblem || selected.businessProblem || "",
      objectives: definition?.businessObjectives || selected.businessObjectives || "",
      baRole: definition?.baRole || selected.baRole || "",
      sprints: definition?.sprints || [],
      inScope: definition?.inScope || selected.inScope || "",
      outOfScope: definition?.outOfScope || selected.outOfScope || "",
      constraints: definition?.knownConstraints || selected.knownConstraints || "",
      difficulty: definition?.difficulty ?? 0,
      personas: definition?.personas || [],
      knowledge: definition?.knowledgeItems || [],
      rules: definition?.businessRules || [],
      events: definition?.events || [],
      personaCount: definition?.personas?.length ?? selected.personaCount,
      knowledgeCount: definition?.knowledgeItems?.length ?? selected.knowledgeItemCount,
      ruleCount: definition?.businessRules?.length ?? selected.businessRuleCount,
      eventCount: definition?.events?.length ?? selected.eventCount,
    };
  }, [selected, definition]);

  const approve = async () => {
    if (!selected) return;
    setBusy(true);
    setNotice(null);
    try {
      await scenarioAuthoringService.approveVersion(selected.versionId);
      setItems((prev) => prev.filter((item) => item.versionId !== selected.versionId));
      setSelectedId(null);
      setDefinition(null);
      setNotice(`Đã duyệt ${selected.code}.`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Không duyệt được.");
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!selected) return;
    if (comment.trim().length < 10) {
      setNotice("Lý do từ chối cần ít nhất 10 ký tự.");
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await scenarioAuthoringService.rejectVersion(selected.versionId, comment.trim());
      setItems((prev) => prev.filter((item) => item.versionId !== selected.versionId));
      setSelectedId(null);
      setDefinition(null);
      setComment("");
      setNotice(`Đã từ chối ${selected.code}.`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Không từ chối được.");
    } finally {
      setBusy(false);
    }
  };

  const tabs: Array<{ id: DetailTab; label: string; count?: number }> = meta
    ? [
        { id: "definition", label: "Định nghĩa" },
        { id: "personas", label: "Personas", count: meta.personaCount },
        { id: "knowledge", label: "Knowledge", count: meta.knowledgeCount },
        { id: "rules", label: "Rules", count: meta.ruleCount },
        { id: "events", label: "Events", count: meta.eventCount },
      ]
    : [];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-navy/10 bg-white p-2 shadow-sm">
        <button
          type="button"
          onClick={() => setQueueMode("pending")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
            isPendingMode ? "bg-navy text-white" : "text-slate hover:bg-mist"
          }`}
        >
          Chờ duyệt
        </button>
        <button
          type="button"
          onClick={() => setQueueMode("reviewed")}
          className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
            !isPendingMode ? "bg-navy text-white" : "text-slate hover:bg-mist"
          }`}
        >
          Đã duyệt bởi tôi
        </button>
        <button
          type="button"
          onClick={() => void load(queueMode)}
          className="ml-auto rounded-lg p-1.5 text-navy hover:bg-mist"
          aria-label="Tải lại"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-navy/10 bg-white shadow-sm lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden">
        <div className="border-b border-navy/8 bg-gradient-to-r from-mist/80 to-white px-4 py-3">
          <h2 className="text-sm font-bold text-navy">
            {isPendingMode ? "Chờ duyệt" : "Đã xử lý bởi bạn"}
          </h2>
          <p className="text-[11px] text-slate">{items.length} kịch bản</p>
        </div>
        <div className="max-h-[70vh] space-y-2 overflow-y-auto p-3 lg:max-h-[calc(100vh-10rem)]">
          {loading && items.length === 0 ? (
            <p className="flex items-center gap-2 px-1 py-6 text-xs text-slate">
              <Loader2 size={14} className="animate-spin" /> Đang tải...
            </p>
          ) : items.length === 0 ? (
            <p className="px-1 py-6 text-center text-xs leading-5 text-slate">
              {isPendingMode
                ? "Chưa có kịch bản chờ duyệt."
                : "Bạn chưa duyệt hoặc từ chối kịch bản nào."}
            </p>
          ) : (
            items.map((item) => {
              const active = selectedId === item.versionId;
              const statusTone =
                item.status === "Published" || item.status === "Đã ban hành"
                  ? "green"
                  : item.status === "Rejected" || item.status === "Từ chối"
                    ? "red"
                    : "amber";
              return (
                <button
                  key={item.versionId}
                  type="button"
                  onClick={() => setSelectedId(item.versionId)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    active
                      ? "border-brass/50 bg-[#fbf6ec] shadow-sm ring-1 ring-brass/20"
                      : "border-navy/10 bg-white hover:border-brass/35 hover:bg-[#fbf6ec]/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-brass">{item.code}</span>
                    <Badge tone={statusTone}>
                      {isPendingMode ? `v${item.versionNo}` : statusLabel(item.status)}
                    </Badge>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs font-bold text-navy">{item.title}</p>
                  {!isPendingMode && item.reviewedAt ? (
                    <p className="mt-1 text-[10px] text-slate">
                      {new Date(item.reviewedAt).toLocaleString("vi-VN")}
                    </p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1">
                    <MetaChip label={`${item.personaCount}P`} />
                    <MetaChip label={`${item.knowledgeItemCount}K`} />
                    <MetaChip label={`${item.businessRuleCount}R`} />
                    <MetaChip label={`${item.eventCount}E`} />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section className="min-w-0">
        {!selected || !meta ? (
          <div className="grid place-items-center rounded-2xl border border-navy/10 bg-white px-6 py-20 text-center shadow-sm">
            <div>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mist text-navy">
                <Layers3 size={22} />
              </div>
              <p className="mt-3 text-sm font-bold text-navy">Chưa chọn kịch bản</p>
              <p className="mt-1 max-w-sm text-xs text-slate">
                Chọn kịch bản bên trái. Tab Định nghĩa hiển thị dạng trang A4 với đủ field.
              </p>
              {notice && (
                <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-navy">
                  <ShieldAlert size={13} className="mt-0.5 shrink-0 text-brass" />
                  {notice}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border border-navy/10 bg-white px-4 py-3 shadow-sm sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-brass/30 bg-[#fbf6ec] px-2 py-0.5 font-mono text-[11px] font-bold text-brass">
                  {selected.code}
                </span>
                <Badge tone="amber">v{selected.versionNo}</Badge>
                <Badge tone="navy">{DIFFICULTY_LABEL[meta.difficulty] || `Level ${meta.difficulty}`}</Badge>
                <Badge
                  tone={
                    isPendingMode
                      ? "amber"
                      : selected.status === "Published"
                        ? "green"
                        : selected.status === "Rejected"
                          ? "red"
                          : "amber"
                  }
                >
                  {isPendingMode ? "Chờ duyệt" : statusLabel(selected.status)}
                </Badge>
                {loadingDef && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-slate">
                    <Loader2 size={12} className="animate-spin" /> Đang tải
                  </span>
                )}
              </div>
              <h2 className="mt-1.5 text-base font-bold leading-snug text-navy">{selected.title}</h2>
              <p className="mt-1 text-[11px] text-slate">
                Tác giả #{selected.createdByUserId}
                {selected.submittedForReviewAt
                  ? ` · Gửi duyệt ${new Date(selected.submittedForReviewAt).toLocaleString("vi-VN")}`
                  : ""}
                {!isPendingMode && selected.reviewedAt
                  ? ` · Bạn xử lý ${new Date(selected.reviewedAt).toLocaleString("vi-VN")}`
                  : ""}
              </p>
              {!isPendingMode && selected.reviewComment ? (
                <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                  <strong>Nhận xét từ chối:</strong> {selected.reviewComment}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-1 border-t border-navy/8 pt-3">
                {tabs.map((item) => {
                  const active = tab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition ${
                        active
                          ? "bg-navy text-white shadow-sm"
                          : "border border-navy/10 bg-offwhite text-slate hover:text-navy"
                      }`}
                    >
                      {item.label}
                      {typeof item.count === "number" ? (
                        <span className={`ml-1 ${active ? "text-brass-light" : "text-slate/70"}`}>
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {tab === "definition" ? (
              <DefinitionPage
                meta={meta}
                code={selected.code}
                title={selected.title}
                versionNo={selected.versionNo}
                difficulty={meta.difficulty}
              />
            ) : (
              <div className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm sm:p-5">
                {tab === "personas" && <PersonaList items={meta.personas} />}
                {tab === "knowledge" && <KnowledgeList items={meta.knowledge} />}
                {tab === "rules" && <RuleList items={meta.rules} />}
                {tab === "events" && <EventList items={meta.events} />}
              </div>
            )}

            {isPendingMode ? (
              <div className="sticky bottom-3 z-10 rounded-2xl border border-navy/10 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-navy/15 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                    placeholder="Lý do từ chối (tối thiểu 10 ký tự)..."
                  />
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void approve()}
                      className="gap-1.5 bg-navy text-white hover:bg-navy-deep"
                    >
                      <CheckCircle2 size={14} /> Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => void reject()}
                      className="gap-1.5 border-red-200 text-red-800 hover:bg-red-50"
                    >
                      <XCircle size={14} /> Từ chối
                    </Button>
                  </div>
                </div>
                {notice && (
                  <p className="mt-2 inline-flex items-start gap-1.5 text-xs text-navy">
                    <ShieldAlert size={13} className="mt-0.5 shrink-0 text-brass" />
                    {notice}
                  </p>
                )}
              </div>
            ) : (
              notice && (
                <p className="inline-flex items-start gap-1.5 rounded-2xl border border-navy/10 bg-white px-4 py-3 text-xs text-navy shadow-sm">
                  <ShieldAlert size={13} className="mt-0.5 shrink-0 text-brass" />
                  {notice}
                </p>
              )
            )}
          </div>
        )}
      </section>
    </div>
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "Published") return "Đã duyệt";
  if (status === "Rejected") return "Đã từ chối";
  return status;
}

type MetaShape = {
  summary: string;
  context: string;
  problem: string;
  objectives: string;
  baRole: string;
  sprints: NonNullable<ScenarioDefinitionDto["sprints"]>;
  inScope: string | null | undefined;
  outOfScope: string | null | undefined;
  constraints: string | null | undefined;
  personas: AuthoringPersonaDto[];
  knowledge: AuthoringKnowledgeItemDto[];
  rules: AuthoringBusinessRuleDto[];
  events: AuthoringScenarioEventDto[];
};

/**
 * Trang định nghĩa kiểu tờ A4: field xếp form, nội dung hiện đủ, không cắt/cuộn trong ô.
 */
function DefinitionPage({
  meta,
  code,
  title,
  versionNo,
  difficulty,
}: {
  meta: MetaShape;
  code: string;
  title: string;
  versionNo: number;
  difficulty: number;
}) {
  const sprints = splitSprints(meta.sprints);

  return (
    <div className="flex justify-center bg-[#e8eef3] px-2 py-4 sm:px-4">
      <article
        className="w-full max-w-[210mm] bg-white text-navy shadow-[0_8px_40px_rgba(16,42,67,0.12)]"
        style={{ minHeight: "297mm" }}
      >
        <div className="border-b border-navy/15 px-[14mm] py-[10mm]">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brass">
            BA-VES · Hồ sơ kịch bản mô phỏng
          </p>
          <h1 className="mt-2 text-[18px] font-bold leading-snug text-navy">{title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-navy/10 pt-3 text-[11px] text-slate">
            <span>
              <strong className="text-navy">Mã:</strong> {code}
            </span>
            <span>
              <strong className="text-navy">Phiên bản:</strong> {versionNo}
            </span>
            <span>
              <strong className="text-navy">Độ khó:</strong>{" "}
              {DIFFICULTY_LABEL[difficulty] || `Level ${difficulty}`}
            </span>
          </div>
        </div>

        <div className="space-y-0 px-[14mm] py-[8mm]">
          <A4Field label="1. Tóm tắt">{meta.summary}</A4Field>
          <A4Field label="2. Bối cảnh doanh nghiệp">{meta.context}</A4Field>
          <A4Field label="3. Vấn đề nghiệp vụ" list={toListItems(meta.problem)} fallback={meta.problem} />
          <A4Field
            label="4. Mục tiêu kinh doanh"
            list={toListItems(meta.objectives)}
            fallback={meta.objectives}
          />
          <A4Field label="5. Vai trò BA">{meta.baRole}</A4Field>

          <div className="border-b border-navy/10 py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate">6. Phạm vi</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-3">
              <A4SubField label="In scope" items={splitLines(meta.inScope)} />
              <A4SubField label="Out of scope" items={splitLines(meta.outOfScope)} />
              <A4SubField label="Constraints" items={splitLines(meta.constraints)} />
            </div>
          </div>

          <div className="py-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate">
              7. Lộ trình sprint
            </p>
            {sprints.length === 0 ? (
              <EmptyValue />
            ) : (
              <div className="mt-3 space-y-3">
                {sprints.map((sprint) => (
                  <div key={sprint.label} className="rounded-lg border border-navy/10 bg-[#f8fafc] px-3 py-2.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[11px] font-bold text-brass">{sprint.label}</p>
                      {sprint.durationLabel && (
                        <p className="text-[11px] font-semibold text-slate">
                          Thời hạn: {sprint.durationLabel}
                        </p>
                      )}
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-[13px] leading-6 text-navy">{sprint.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-navy/10 px-[14mm] py-4 text-[10px] text-slate">
          Trang định nghĩa kịch bản · Nội dung hiển thị đầy đủ để Expert duyệt
        </div>
      </article>
    </div>
  );
}

function A4Field({
  label,
  children,
  list,
  fallback,
}: {
  label: string;
  children?: string;
  list?: string[];
  fallback?: string;
}) {
  return (
    <section className="border-b border-navy/10 py-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate">{label}</p>
      <div className="mt-2">
        {list && list.length > 0 ? (
          <NumberedList items={list} fallback={fallback} />
        ) : (
          <PlainOrEmpty text={children ?? fallback} />
        )}
      </div>
    </section>
  );
}

function A4SubField({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-navy">{label}</p>
      <div className="mt-1.5">
        <BulletList items={items} />
      </div>
    </div>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <span className="rounded border border-navy/10 bg-offwhite px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate">
      {label}
    </span>
  );
}

function PlainOrEmpty({ text }: { text?: string }) {
  if (!text?.trim()) return <EmptyValue />;
  return <ReadableProse text={text} lineClassName="text-[13px] leading-6 text-navy" />;
}

function NumberedList({ items, fallback }: { items: string[]; fallback?: string }) {
  if (!items.length) {
    if (!fallback?.trim()) return <EmptyValue />;
    return <PlainOrEmpty text={fallback} />;
  }
  return (
    <ol className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-2.5 text-[13px] leading-6 text-navy">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded bg-navy/10 font-mono text-[10px] font-bold text-navy">
            {idx + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items }: { items: string[] }) {
  if (!items.length) return <EmptyValue />;
  return (
    <ul className="space-y-1.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-2 text-[12px] leading-5 text-navy">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
          <span>{item.replace(/^[-•*]\s*/, "")}</span>
        </li>
      ))}
    </ul>
  );
}

function EmptyValue() {
  return <p className="text-xs italic text-slate">— Chưa có dữ liệu —</p>;
}

function PersonaList({ items }: { items: AuthoringPersonaDto[] }) {
  if (!items.length) return <EmptyValue />;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {items.map((p) => (
        <CollapsibleDetail
          key={p.id}
          className="rounded-xl border-navy/10 bg-offwhite/50 p-3"
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              <Users size={12} className="text-brass" />
              {p.name}
              <Badge tone="navy">{p.stakeholderRole}</Badge>
            </span>
          }
          meta={p.department || undefined}
          detail={
            <div className="space-y-2">
              {p.goals ? (
                <div>
                  <p className="text-[11px] font-bold text-navy">Mục tiêu</p>
                  <ReadableProse text={p.goals} lineClassName="text-[11px] leading-5 text-slate" />
                </div>
              ) : null}
              {p.painPoints ? (
                <div>
                  <p className="text-[11px] font-bold text-navy">Pain</p>
                  <ReadableProse text={p.painPoints} lineClassName="text-[11px] leading-5 text-slate" />
                </div>
              ) : null}
            </div>
          }
        />
      ))}
    </div>
  );
}

function KnowledgeList({ items }: { items: AuthoringKnowledgeItemDto[] }) {
  if (!items.length) return <EmptyValue />;
  return (
    <div className="space-y-2">
      {items.map((k) => (
        <CollapsibleDetail
          key={k.id}
          className="rounded-xl border-navy/10 bg-offwhite/50 p-3"
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              <BookOpen size={12} className="text-brass" />
              <span className="font-mono text-[10px] font-bold text-brass">{k.code}</span>
              {k.title}
            </span>
          }
          detailText={k.content}
        />
      ))}
    </div>
  );
}

function RuleList({ items }: { items: AuthoringBusinessRuleDto[] }) {
  if (!items.length) return <EmptyValue />;
  return (
    <div className="space-y-2">
      {items.map((r) => (
        <CollapsibleDetail
          key={r.id}
          className="rounded-xl border-navy/10 bg-offwhite/50 p-3"
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              <Layers3 size={12} className="text-brass" />
              <span className="font-mono text-[10px] font-bold text-brass">{r.code}</span>
              {r.title}
              {r.isHidden ? <Badge tone="amber">Ẩn HV</Badge> : <Badge tone="green">Hiện</Badge>}
            </span>
          }
          detailText={r.description}
        />
      ))}
    </div>
  );
}

function EventList({ items }: { items: AuthoringScenarioEventDto[] }) {
  if (!items.length) return <EmptyValue />;
  return (
    <div className="space-y-2">
      {items.map((e) => (
        <CollapsibleDetail
          key={e.id}
          className="rounded-xl border-navy/10 bg-offwhite/50 p-3"
          title={
            <span className="inline-flex items-center gap-2">
              <Zap size={12} className="text-brass" />
              {e.title}
            </span>
          }
          detail={
            <div className="space-y-2">
              {e.description ? (
                <ReadableProse text={e.description} lineClassName="text-[11px] leading-5 text-slate" />
              ) : null}
              {e.eventContent ? (
                <div className="rounded-lg border border-brass/20 bg-[#fbf6ec] px-2.5 py-2">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brass">Fact</p>
                  <ReadableProse text={e.eventContent} lineClassName="text-[11px] leading-5 text-navy" />
                </div>
              ) : null}
            </div>
          }
        />
      ))}
    </div>
  );
}
