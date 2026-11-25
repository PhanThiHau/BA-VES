import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock3, Loader2, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  simulationService,
  type SprintBoardDto,
  type SprintReviewTurnDto,
} from "../../services/simulationService";

type GateProps = {
  sessionId: number;
  onBoardChange?: (board: SprintBoardDto) => void;
  onReviewed?: (result: SprintReviewTurnDto, board: SprintBoardDto) => void;
};

function normalizeStatus(status: string | null | undefined) {
  return (status || "").trim().toLowerCase();
}

function readErrorMessage(err: unknown) {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string") return err;
  return "Không đánh giá được sprint.";
}

export function SprintGateBar({ sessionId, onBoardChange, onReviewed }: GateProps) {
  const [board, setBoard] = useState<SprintBoardDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<SprintReviewTurnDto | null>(null);
  const onBoardChangeRef = useRef(onBoardChange);
  const onReviewedRef = useRef(onReviewed);
  onBoardChangeRef.current = onBoardChange;
  onReviewedRef.current = onReviewed;

  const load = useCallback(async () => {
    try {
      const next = await simulationService.getSprintBoard(sessionId);
      setBoard(next);
      onBoardChangeRef.current?.(next);
      setError(null);
      return next;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được lộ trình sprint.");
      return null;
    }
  }, [sessionId]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 20_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const runReview = async () => {
    if (!board || busy) return;
    const current =
      board.sprints.find((sprint) => sprint.sprintNo === board.currentSprintNo) ?? board.sprints[0];
    if (!current || normalizeStatus(current.status) === "finalized" || board.projectFinalized) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const result = await simulationService.reviewSprint(sessionId, current.sprintNo, "", true);
      setLastResult(result);
      const next = await load();
      if (next) onReviewedRef.current?.(result, next);
    } catch (err) {
      setError(readErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!board) {
    return error ? <p className="px-3 py-2 text-xs font-semibold text-rose-700">{error}</p> : null;
  }

  const current = board.sprints.find((sprint) => sprint.sprintNo === board.currentSprintNo) ?? board.sprints[0];
  const canReview = !board.projectFinalized && normalizeStatus(current?.status) !== "finalized";
  const missingCount = current?.missingTemplateCodes?.length ?? 0;
  const justFinalized =
    lastResult &&
    normalizeStatus(lastResult.status) === "finalized" &&
    lastResult.sprintNo === current?.sprintNo;

  return (
    <section className="border-b border-slate/15 bg-white px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate">
            Sprint {board.currentSprintNo}/{board.totalSprints}
            {board.projectFinalized
              ? " · Đã hoàn tất"
              : board.isOverdue
                ? " · Đã trễ hạn"
                : normalizeStatus(current?.status) === "finalized"
                  ? " · Đã đánh giá"
                  : " · Đang mô phỏng"}
          </p>
          <p className="truncate text-xs font-semibold text-navy">{current?.name}</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {board.sprints.map((sprint) => (
              <span
                key={sprint.sprintNo}
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  sprint.sprintNo === board.currentSprintNo
                    ? "bg-navy text-white"
                    : normalizeStatus(sprint.status) === "finalized"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate"
                }`}
              >
                {sprint.sprintNo}. {sprint.name.replace(/^Sprint\s*\d+\s*:\s*/i, "")}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!board.projectFinalized && (
            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold ${
                board.isOverdue ? "bg-amber-50 text-amber-900" : "bg-slate-50 text-slate-700"
              }`}
            >
              <Clock3 size={13} />
              {board.isOverdue
                ? "Hết thời gian sprint"
                : current?.durationValue
                  ? `Thời hạn ${current.durationValue} ${
                      current.durationUnit === "days" ? "ngày" : "tuần"
                    }`
                  : board.minutesRemaining != null
                    ? `Còn ~${Math.ceil((board.minutesRemaining || 0) / (60 * 24))} ngày`
                    : "Theo thời hạn sprint"}
            </span>
          )}
          {canReview && (
            <Button type="button" size="sm" onClick={() => void runReview()} disabled={busy} className="gap-1.5">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {busy ? "AI đang đánh giá..." : "Review Sprint"}
            </Button>
          )}
        </div>
      </div>

      {canReview && missingCount > 0 && (
        <p className="mt-2 text-[11px] leading-5 text-amber-800">
          Còn thiếu {missingCount} deliverable — AI vẫn chấm phần đã nộp và ghi nhận phần thiếu trong kết quả hồ sơ.
        </p>
      )}

      {(justFinalized || (lastResult && normalizeStatus(lastResult.status) === "finalized")) && (
        <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-950">
          <p className="flex items-center gap-1.5 font-bold">
            <CheckCircle2 size={14} />
            Đã đánh giá Sprint {lastResult!.sprintNo}
          </p>
          <p className="mt-1 whitespace-pre-wrap">{lastResult!.chairReply}</p>
          {(lastResult!.improvementNotes?.length ?? 0) > 0 && (
            <ul className="mt-1.5 list-disc pl-4 text-emerald-900">
              {lastResult!.improvementNotes.slice(0, 3).map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          )}
          <p className="mt-1.5 text-[11px] text-emerald-800">
            Xem đầy đủ theo từng sprint tại hồ sơ (Artifacts / Đánh giá).
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-xs font-semibold text-rose-700">{error}</p>}
    </section>
  );
}
