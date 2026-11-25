import { useState, useEffect } from "react";
import { CheckCircle2, Clock, Copy, ExternalLink, Loader2, QrCode, ShieldCheck, Sparkles, X, AlertTriangle } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { commerceService, type OrderDto } from "../../services/commerceService";

interface PayOsCheckoutModalProps {
  order: OrderDto;
  onClose: () => void;
  onSuccess: (order: OrderDto) => void;
}

export function PayOsCheckoutModal({ order, onClose, onSuccess }: PayOsCheckoutModalProps) {
  const [currentOrder, setCurrentOrder] = useState<OrderDto>(order);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPaid, setIsPaid] = useState(order.status === "Paid");

  // Format currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  // Copy helper
  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Polling order status every 3 seconds
  useEffect(() => {
    if (isPaid) return;

    const interval = setInterval(async () => {
      try {
        const fresh = await commerceService.getOrderById(currentOrder.id);
        setCurrentOrder(fresh);
        if (fresh.status === "Paid") {
          setIsPaid(true);
          clearInterval(interval);
          setTimeout(() => {
            onSuccess(fresh);
          }, 1500);
        }
      } catch (err) {
        console.warn("Polling order status error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentOrder.id, isPaid, onSuccess]);

  // Simulate payment for demo without real banking app
  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      await commerceService.simulatePayOsWebhook(currentOrder.orderCode, currentOrder.amount);
      const fresh = await commerceService.getOrderById(currentOrder.id);
      setCurrentOrder(fresh);
      setIsPaid(true);
      setTimeout(() => {
        onSuccess(fresh);
      }, 1500);
    } catch (err: any) {
      alert(`Mô phỏng thanh toán: ${err.message || "Đã gửi tín hiệu xác nhận thanh toán."}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const transferContent = `BAVES ${currentOrder.orderCode}`;
  const bankAccount = "8888999966";
  const bankName = "Ngân hàng TMCP Quân Đội (MBBank)";
  const accountName = "CONG TY CP CONG NGHE GIAO DUC BA-VES";

  // QR image URL fallback via vietqr.io or direct qr
  const qrImageUrl = `https://img.vietqr.io/image/MB-${bankAccount}-compact2.png?amount=${currentOrder.amount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-deep/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate/20 bg-white shadow-2xl animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate/15 bg-gradient-to-r from-navy to-navy-light px-6 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-brass">
              <QrCode size={20} />
            </span>
            <div>
              <h2 className="text-base font-bold">Thanh toán đơn hàng qua PayOS / VietQR</h2>
              <p className="text-xs text-white/70">Mã đơn: #{currentOrder.orderCode}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Paid Success Banner */}
        {isPaid ? (
          <div className="p-8 text-center animate-in fade-in zoom-in-95">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 shadow-inner">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-navy">Thanh toán thành công!</h3>
            <p className="mt-1 text-xs text-slate">
              Hệ thống đã nhận được số tiền <strong>{formatMoney(currentOrder.amount)}</strong>. Quyền truy cập kịch bản và lượt Credit của bạn đã được kích hoạt ngay lập tức.
            </p>
            <div className="mt-4">
              <Badge tone="green">
                Đơn hàng hoàn tất
              </Badge>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate/15 bg-mist/20 p-4 text-center">
                <div className="relative overflow-hidden rounded-xl bg-white p-2 shadow-sm border border-slate/20">
                  <img
                    src={qrImageUrl}
                    alt="VietQR PayOS"
                    className="h-44 w-44 object-contain"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-navy/80 py-1 text-[10px] font-bold text-white">
                    Quét mã bằng App Ngân hàng
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate">
                  <Clock size={13} className="text-amber-600 animate-spin" />
                  <span>Đang chờ chuyển khoản...</span>
                </div>
              </div>

              {/* Transfer Details */}
              <div className="space-y-3.5 text-xs">
                <div className="rounded-xl border border-brass/30 bg-brass/10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate">Gói đăng ký:</span>
                    <strong className="text-navy">{currentOrder.planName}</strong>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-brass/20 pt-2">
                    <span className="font-semibold text-slate">Số tiền thanh toán:</span>
                    <strong className="text-base font-extrabold text-navy font-mono">
                      {formatMoney(currentOrder.amount)}
                    </strong>
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-slate/15 bg-white p-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate">Ngân hàng thụ hưởng:</span>
                    <p className="font-semibold text-navy">{bankName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate">Số tài khoản:</span>
                    <div className="flex items-center justify-between">
                      <strong className="font-mono text-sm font-bold text-navy">{bankAccount}</strong>
                      <button
                        onClick={() => handleCopy(bankAccount, "account")}
                        className="flex items-center gap-1 rounded bg-slate/10 px-2 py-0.5 text-[10px] font-bold text-navy hover:bg-slate/20"
                      >
                        <Copy size={11} /> {copiedField === "account" ? "Đã chép!" : "Sao chép"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate">Chủ tài khoản:</span>
                    <p className="font-bold text-navy">{accountName}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-700">Nội dung chuyển khoản (Bắt buộc đúng):</span>
                    <div className="flex items-center justify-between mt-0.5 rounded-lg border border-amber-300 bg-amber-50/70 p-1.5">
                      <strong className="font-mono text-xs font-bold text-amber-900">{transferContent}</strong>
                      <button
                        onClick={() => handleCopy(transferContent, "content")}
                        className="flex items-center gap-1 rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold text-amber-900 hover:bg-amber-300"
                      >
                        <Copy size={11} /> {copiedField === "content" ? "Đã chép!" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* External Link */}
                {currentOrder.checkoutUrl && (
                  <a
                    href={currentOrder.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs"
                  >
                    <span>Mở trang thanh toán PayOS</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>

            {/* Sandbox Simulation Helper */}
            <div className="mt-5 rounded-xl border border-slate/20 bg-mist/30 p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-brass shrink-0" />
                <span className="text-[11px] text-slate">
                  <strong>Môi trường phát triển:</strong> Bấm nút bên cạnh để mô phỏng webhook thanh toán thành công ngay lập tức mà không cần quét thẻ thật.
                </span>
              </div>
              <Button
                onClick={handleSimulatePayment}
                disabled={isSimulating}
                className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm"
              >
                {isSimulating ? <Loader2 size={13} className="animate-spin" /> : <ShieldCheck size={14} />}
                {isSimulating ? "Đang xử lý..." : "⚡ Xác nhận thanh toán (Demo)"}
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate/15 bg-mist/10 px-6 py-3">
          <span className="flex items-center gap-1 text-[11px] text-slate">
            <ShieldCheck size={13} className="text-emerald-700" />
            Thanh toán an toàn mã hóa chuẩn PayOS & VietQR
          </span>
          <Button variant="secondary" onClick={onClose} className="border-slate/20 text-xs font-semibold">
            Đóng cửa sổ
          </Button>
        </div>
      </div>
    </div>
  );
}
