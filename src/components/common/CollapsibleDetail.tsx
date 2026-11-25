import { useId, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { classNames } from "../../utils/format";
import { ReadableProse } from "./ReadableProse";

/**
 * Mặc định chỉ hiện title (+ meta). Bấm "Xem chi tiết" để mở nội dung dài.
 */
export function CollapsibleDetail({
  title,
  meta,
  detail,
  detailText,
  actions,
  defaultOpen = false,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  /** Nội dung chi tiết tùy chỉnh (ưu tiên hơn detailText). */
  detail?: ReactNode;
  /** Văn bản dài — render bằng ReadableProse. */
  detailText?: string | null;
  actions?: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const hasDetail = Boolean(detail) || Boolean((detailText || "").trim());

  return (
    <div className={classNames("rounded-2xl border border-[#d9e4ec] bg-white p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-navy">{title}</div>
          {meta ? <div className="mt-1 text-[11px] leading-4 text-slate">{meta}</div> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {hasDetail ? (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-navy/15 bg-offwhite/70 px-2.5 py-1.5 text-[11px] font-bold text-navy transition hover:border-navy/30 hover:bg-white"
            >
              {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {open ? "Thu gọn" : "Xem chi tiết"}
            </button>
          ) : null}
        </div>
      </div>

      {hasDetail && open ? (
        <div
          id={panelId}
          className="mt-3 space-y-2 border-t border-slate/15 pt-3"
        >
          {detail ?? (
            <ReadableProse text={detailText} lineClassName="text-navy" />
          )}
        </div>
      ) : null}
    </div>
  );
}
