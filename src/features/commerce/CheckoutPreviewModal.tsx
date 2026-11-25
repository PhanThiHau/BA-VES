import { QrCode, X } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { formatVnd } from "./learnerPlansCatalog";

export type CheckoutPreviewLine = {
  id: string;
  title: string;
  subtitle?: string;
  price: number;
};

export function CheckoutPreviewModal({
  title = "Xác nhận trước khi tạo mã thanh toán",
  lines,
  currencyNote,
  confirming,
  onCancel,
  onConfirm,
}: {
  title?: string;
  lines: CheckoutPreviewLine[];
  currencyNote?: string;
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const total = lines.reduce((sum, line) => sum + line.price, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate/15 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate/10 px-5 py-4">
          <div>
            <h3 className="font-display text-base font-extrabold text-navy">{title}</h3>
            <p className="mt-1 text-xs text-slate">
              Kiểm tra lại nội dung. Mã PayOS chỉ được tạo sau khi bạn xác nhận.
            </p>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            className="rounded-lg p-1.5 text-navy/60 hover:bg-slate/10 hover:text-navy"
            onClick={onCancel}
            disabled={confirming}
          >
            <X size={16} />
          </button>
        </div>

        <ul className="max-h-[40vh] space-y-2 overflow-y-auto px-5 py-4">
          {lines.map((line) => (
            <li
              key={line.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate/15 bg-offwhite/60 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-navy line-clamp-2">{line.title}</p>
                {line.subtitle ? (
                  <p className="mt-0.5 text-[11px] font-semibold text-slate">{line.subtitle}</p>
                ) : null}
              </div>
              <span className="shrink-0 font-mono text-sm font-bold text-navy">{formatVnd(line.price)}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-slate/10 bg-mist/30 px-5 py-4">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold text-slate">Tổng thanh toán</span>
            <span className="font-mono text-xl font-black text-navy">{formatVnd(total)}</span>
          </div>
          {currencyNote ? <p className="mb-3 text-[11px] text-slate">{currencyNote}</p> : null}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={confirming} onClick={onCancel}>
              Quay lại
            </Button>
            <Button
              disabled={confirming || lines.length === 0}
              className="gap-1.5 bg-[#1b365d] text-white hover:bg-[#12243e]"
              onClick={onConfirm}
            >
              <QrCode size={14} />
              {confirming ? "Đang tạo mã…" : "Xác nhận tạo mã thanh toán"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
