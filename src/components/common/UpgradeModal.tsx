import { Check, Sparkles, X, Zap } from "lucide-react";
import { useState } from "react";
import { useApp } from "../../contexts/AppContext";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  reason?: string;
}

export function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  const { setSubscriptionTier } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<"practice" | "pro">("pro");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQrCheckout, setShowQrCheckout] = useState(false);

  if (!open) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setSubscriptionTier("pro");
      alert("🎉 Chúc mừng! Bạn đã nâng cấp thành công gói Pro. Toàn bộ Stakeholder và tính năng nâng cao đã được mở khóa!");
      setShowQrCheckout(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-deep/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-brass/30 bg-white p-6 shadow-2xl font-sans sm:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-slate hover:bg-offwhite hover:text-navy"
        >
          <X size={18} />
        </button>

        {!showQrCheckout ? (
          <div>
            {/* Header */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brass/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brass">
                <Sparkles size={14} />
                Mở khóa trải nghiệm mô phỏng toàn diện
              </span>
              <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
                Nâng cấp Gói Phỏng vấn Chuyên sâu
              </h2>
              <p className="mt-2 text-xs text-slate sm:text-sm">
                {reason || "Gói miễn phí chỉ hỗ trợ 1 Stakeholder demo và 10 câu hỏi. Nâng cấp ngay để đối mặt với tình huống thực chiến đa chiều!"}
              </p>
            </div>

            {/* Plans Comparison */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Free Plan */}
              <div className="rounded-2xl border border-slate/20 bg-offwhite/60 p-5 text-left opacity-80">
                <span className="rounded-md bg-slate/20 px-2 py-0.5 text-[10px] font-bold uppercase text-slate">
                  Gói hiện tại
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-navy">Starter Free</h3>
                <div className="mt-2 text-2xl font-extrabold text-navy">0 đ</div>
                <p className="mt-1 text-xs text-slate">Dành cho trải nghiệm thử tính năng</p>

                <ul className="mt-4 space-y-2 text-xs text-slate">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-slate" /> 1 Stakeholder demo (Trưởng kho)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-slate" /> Tối đa 10 câu hỏi phỏng vấn
                  </li>
                  <li className="flex items-center gap-2 text-slate/50 line-through">
                    Mở khóa 5 Stakeholders cấp quản lý
                  </li>
                  <li className="flex items-center gap-2 text-slate/50 line-through">
                    Tình huống xung đột lợi ích & Sự kiện đột xuất
                  </li>
                  <li className="flex items-center gap-2 text-slate/50 line-through">
                    Chấm điểm năng lực BABOK v3
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div
                onClick={() => setSelectedPlan("pro")}
                className={`relative cursor-pointer rounded-2xl border-2 p-5 text-left transition-all ${
                  selectedPlan === "pro"
                    ? "border-brass bg-brass/5 shadow-md shadow-brass/10"
                    : "border-slate/20 bg-white"
                }`}
              >
                <div className="absolute -top-3 right-4 rounded-full bg-brass px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-navy">
                  Khuyên dùng
                </div>
                <span className="rounded-md bg-brass/20 px-2 py-0.5 text-[10px] font-bold uppercase text-brass">
                  Gói Chuyên Sâu
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-navy">BA Professional</h3>
                <div className="mt-2 text-2xl font-extrabold text-navy">
                  199.000 đ <span className="text-xs font-normal text-slate">/ kịch bản</span>
                </div>
                <p className="mt-1 text-xs text-slate">Mô phỏng doanh nghiệp đầy đủ theo BABOK</p>

                <ul className="mt-4 space-y-2 text-xs text-navy font-medium">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-brass" /> <strong>Mở khóa toàn bộ 6 Stakeholders</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-brass" /> <strong>Không giới hạn số câu hỏi phỏng vấn</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-brass" /> Xung đột quyền lợi & Rớt mạng Wifi kho
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-brass" /> Lưu kho bằng chứng & Ma trận RTM
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-brass" /> Bảng điểm năng lực chuẩn BABOK
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-t border-slate/15 pt-5">
              <span className="text-xs text-slate">
                Thanh toán nhanh chóng qua QR Ngân hàng (NAPAS 24/7) hoặc MoMo.
              </span>
              <button
                onClick={() => setShowQrCheckout(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-navy-deep transition"
              >
                <Zap size={15} className="text-brass" />
                Tiến hành thanh toán (199.000 đ)
              </button>
            </div>
          </div>
        ) : (
          /* VietQR Checkout Screen */
          <div className="text-center py-2">
            <h3 className="font-display text-xl font-extrabold text-navy">Quét mã VietQR để mở khóa</h3>
            <p className="mt-1 text-xs text-slate">
              Mở ứng dụng Ngân hàng (Banking) hoặc MoMo để quét mã thanh toán tự động
            </p>

            <div className="mt-4 mx-auto w-48 h-48 rounded-2xl border-2 border-brass/40 p-2 bg-white shadow-md flex flex-col items-center justify-center">
              {/* Simulated QR Code Canvas */}
              <div className="w-full h-full bg-[#f8fafc] rounded-xl flex flex-col items-center justify-center p-3 text-navy border border-slate/15">
                <span className="text-xs font-mono font-bold text-brass uppercase">VietQR 247</span>
                <div className="my-2 h-20 w-20 border-4 border-navy grid place-items-center">
                  <div className="h-10 w-10 bg-navy" />
                </div>
                <span className="text-[10px] font-mono text-slate">BAVES-PRO-2026</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-offwhite p-3 text-xs max-w-sm mx-auto space-y-1">
              <div className="flex justify-between">
                <span className="text-slate">Ngân hàng:</span>
                <strong className="text-navy">MB Bank (Quân Đội)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Số tài khoản:</span>
                <strong className="text-navy font-mono">0988 123 456</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Số tiền:</span>
                <strong className="text-brass font-bold">199.000 VNĐ</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Nội dung chuyển khoản:</span>
                <strong className="text-navy font-mono">BAVES PRO USR102</strong>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowQrCheckout(false)}
                className="rounded-xl border border-slate/20 px-4 py-2 text-xs font-bold text-slate hover:bg-offwhite transition"
              >
                Quay lại
              </button>
              <button
                disabled={isProcessing}
                onClick={handleSimulatePayment}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isProcessing ? "Đang xác nhận giao dịch..." : "Giả lập đã thanh toán thành công"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
