import { useState, useEffect, useRef } from "react";
import {
  Check,
  CreditCard,
  Crown,
  ExternalLink,
  Loader2,
  QrCode,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import {
  commerceService,
  PlanDto,
  OrderDto,
  OrderStatus,
  CreditBalanceSummaryDto,
  fallbackPlans,
} from "../../services/commerceService";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [plans, setPlans] = useState<PlanDto[]>(fallbackPlans);
  const [selectedPlan, setSelectedPlan] = useState<PlanDto | null>(null);
  const [step, setStep] = useState<"plans" | "checkout" | "success">("plans");
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "vnpay" | "payos">("vietqr");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [activeOrder, setActiveOrder] = useState<OrderDto | null>(null);
  const [creditSummary, setCreditSummary] = useState<CreditBalanceSummaryDto | null>(null);

  const pollIntervalRef = useRef<any>(null);

  // Load plans & credits summary on modal open
  useEffect(() => {
    if (isOpen) {
      setIsLoadingPlans(true);
      Promise.all([
        commerceService.getPlans().catch(() => fallbackPlans),
        commerceService.getMyCreditsSummary().catch(() => null),
      ])
        .then(([fetchedPlans, credits]) => {
          if (fetchedPlans && fetchedPlans.length > 0) {
            setPlans(fetchedPlans);
            setSelectedPlan(fetchedPlans.find((p) => p.code === "PRO") || fetchedPlans[1] || fetchedPlans[0]);
          }
          if (credits) {
            setCreditSummary(credits);
          }
        })
        .finally(() => setIsLoadingPlans(false));
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectCheckout = async (plan: PlanDto) => {
    if (plan.price === 0) return;
    setSelectedPlan(plan);
    setStep("checkout");
    setIsProcessing(true);

    try {
      // Call backend API: POST /api/orders
      const order = await commerceService.createOrder({
        planId: plan.id,
        returnUrl: window.location.origin,
        cancelUrl: window.location.origin,
      });
      setActiveOrder(order);

      // Start polling order status every 3 seconds
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(async () => {
        try {
          const freshOrder = await commerceService.getOrderById(order.id);
          if (freshOrder.status === OrderStatus.Paid) {
            clearInterval(pollIntervalRef.current);
            setActiveOrder(freshOrder);
            setStep("success");
          }
        } catch (e) {
          console.warn("Lỗi khi kiểm tra trạng thái đơn hàng:", e);
        }
      }, 3000);
    } catch (e) {
      console.warn("Không thể tạo đơn hàng từ API, chuyển sang chế độ dự phòng:", e);
      // Fallback local order for demonstration
      setActiveOrder({
        id: Date.now(),
        orderCode: Math.floor(100000 + Math.random() * 900000),
        userId: 1,
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        currency: "VND",
        status: OrderStatus.Pending,
        checkoutUrl: null,
        qrCode: null,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        paidAt: null,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setIsProcessing(false);
      setStep("success");
    }, 1200);
  };

  const handleReset = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setStep("plans");
    onClose();
  };

  const formatPrice = (val: number, cur: string) => {
    if (val === 0) return "0 VNĐ";
    return new Intl.NumberFormat("vi-VN").format(val) + " " + cur;
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-deep/60 p-4 backdrop-blur-sm animate-fade-in font-sans">
      <Card className="w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border-slate/20">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate/15 bg-white p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brass/20 text-navy font-bold shadow-xs">
              <Crown size={20} className="text-navy" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-navy">Gói dịch vụ &amp; Đăng ký hội viên (BA-VES Subscriptions)</h2>
                <Badge tone="green">Cổng thanh toán PayOS / VietQR</Badge>
              </div>
              <p className="text-xs text-slate mt-0.5">
                Nâng cấp tài khoản để mở khóa toàn bộ mô phỏng doanh nghiệp ảo và đánh giá chuyên gia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate hover:bg-offwhite hover:text-navy transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === "plans" && (
            <div>
              {/* Credits Balance Banner if user has credits */}
              {creditSummary && (creditSummary.reviewCredits > 0 || creditSummary.consultationCredits > 0) && (
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-emerald-900">Số dư quyền lợi hiện tại của bạn:</span>
                  </div>
                  <div className="flex items-center gap-4 text-emerald-800 font-semibold">
                    <span>
                      Chuyên gia chấm bài: <strong>{creditSummary.reviewCredits} lượt</strong>
                    </span>
                    <span>
                      Tư vấn 1-on-1: <strong>{creditSummary.consultationCredits} lượt</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-6 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brass/15 px-3 py-1 text-xs font-bold text-brass uppercase tracking-wide">
                  <Sparkles size={13} /> Đầu tư kỹ năng thực chiến BABOK® v3
                </span>
                <h3 className="mt-2 text-xl font-extrabold text-navy sm:text-2xl">
                  Chọn gói học tập phù hợp với mục tiêu của bạn
                </h3>
                <p className="mt-1 text-xs text-slate max-w-md mx-auto">
                  Hệ thống tự động kích hoạt gói qua cổng thanh toán PayOS, VNPay và quét mã VietQR 24/7.
                </p>
              </div>

              {isLoadingPlans ? (
                <div className="py-16 text-center text-slate flex flex-col items-center justify-center gap-2">
                  <Loader2 className="animate-spin text-navy" size={28} />
                  <span className="text-xs">Đang tải biểu phí dịch vụ từ máy chủ...</span>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-3">
                  {plans.map((plan) => {
                    const isPro = plan.code.toUpperCase() === "PRO" || plan.price === 199000;
                    const isEnterprise = plan.code.toUpperCase() === "ENTERPRISE" || plan.price >= 900000;
                    const isCurrent = plan.price === 0;

                    return (
                      <div
                        key={plan.id}
                        className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                          isPro
                            ? "border-brass bg-gradient-to-b from-brass/10 via-white to-white shadow-lg ring-2 ring-brass/30"
                            : "border-slate/20 bg-white hover:border-slate/40 shadow-xs"
                        }`}
                      >
                        {isPro && (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brass px-3 py-0.5 text-[10px] font-extrabold text-navy-deep uppercase tracking-wider shadow-sm">
                            Khuyên dùng
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-navy">{plan.name}</h4>
                            {isCurrent && <Badge tone="gray">Đang dùng</Badge>}
                          </div>
                          <p className="mt-1 text-xs text-slate min-h-[36px]">{plan.description}</p>

                          <div className="mt-4 flex items-baseline gap-1 border-b border-slate/10 pb-4">
                            <span className="text-2xl font-black text-navy">{formatPrice(plan.price, plan.currency || "VNĐ")}</span>
                            <span className="text-xs text-slate">
                              {plan.durationDays ? `/${plan.durationDays} ngày` : isCurrent ? "Miễn phí" : "/gói"}
                            </span>
                          </div>

                          <ul className="mt-4 space-y-2.5 text-xs text-navy/90">
                            <li className="flex items-start gap-2">
                              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 mt-0.5">
                                <Check size={10} strokeWidth={3} />
                              </span>
                              <span>
                                {isEnterprise
                                  ? "Mở khóa 100% kịch bản & quản lý lớp học (Cohorts)"
                                  : isPro
                                  ? "Mở khóa 100% kịch bản đa ngành (OmniMart, WMS, Banking)"
                                  : "Truy cập 3 kịch bản cơ bản (Retail, Supply Chain, Finance)"}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 mt-0.5">
                                <Check size={10} strokeWidth={3} />
                              </span>
                              <span>
                                {plan.sessionQuota ? `Giới hạn ${plan.sessionQuota} phiên học` : "Không giới hạn phiên thực hành mô phỏng AI"}
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 mt-0.5">
                                <Check size={10} strokeWidth={3} />
                              </span>
                              <span>
                                {plan.reviewCredits > 0
                                  ? `Tặng ${plan.reviewCredits} lượt Chuyên gia BA chấm bài & phản biện`
                                  : "AI Rubric tự động chấm bài tức thì"}
                              </span>
                            </li>
                            {plan.consultationCredits > 0 && (
                              <li className="flex items-start gap-2">
                                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 mt-0.5">
                                  <Check size={10} strokeWidth={3} />
                                </span>
                                <span className="font-semibold text-brass">
                                  Tặng {plan.consultationCredits} buổi tư vấn 1-on-1 trực tiếp với Chuyên gia
                                </span>
                              </li>
                            )}
                          </ul>
                        </div>

                        <div className="mt-6 pt-2">
                          {isCurrent ? (
                            <Button variant="secondary" disabled className="w-full justify-center text-xs opacity-60">
                              Gói hiện tại của bạn
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleSelectCheckout(plan)}
                              className={`w-full justify-center gap-1.5 text-xs font-bold shadow-sm ${
                                isPro
                                  ? "bg-brass text-navy-deep hover:bg-brass-light"
                                  : "bg-navy text-white hover:bg-navy-light"
                              }`}
                            >
                              <Zap size={14} /> Nâng cấp ngay
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === "checkout" && selectedPlan && (
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => {
                  if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                  setStep("plans");
                }}
                className="mb-4 text-xs font-bold text-slate hover:text-navy hover:underline flex items-center gap-1"
              >
                ← Quay lại danh sách gói
              </button>

              <div className="grid gap-6 md:grid-cols-2 bg-offwhite p-6 rounded-2xl border border-slate/20">
                {/* Thông tin đơn */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate">Đơn hàng thanh toán</span>
                  <h3 className="text-base font-extrabold text-navy mt-1">{selectedPlan.name}</h3>
                  <div className="mt-4 space-y-2 border-y border-slate/15 py-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate">Mã đơn hàng:</span>
                      <strong className="font-mono text-navy">#{activeOrder?.orderCode || "ORDER-2026"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate">Phí dịch vụ:</span>
                      <strong className="text-navy">{formatPrice(selectedPlan.price, selectedPlan.currency || "VNĐ")}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate">Thời hạn kích hoạt:</span>
                      <span className="text-navy">{selectedPlan.durationDays ? `${selectedPlan.durationDays} ngày` : "Vô hạn"}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-1 border-t border-slate/10">
                      <span className="text-navy">Tổng thanh toán:</span>
                      <span className="text-emerald-700">{formatPrice(selectedPlan.price, selectedPlan.currency || "VNĐ")}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-bold text-navy mb-2">Chọn cổng thanh toán:</label>
                    <div className="space-y-2">
                      {[
                        { id: "vietqr", label: "Quét mã VietQR (Ngân hàng 24/7)", icon: QrCode },
                        { id: "vnpay", label: "Cổng thanh toán VNPAY-QR", icon: CreditCard },
                        { id: "payos", label: "Cổng thanh toán PayOS Open Banking", icon: Zap },
                      ].map((m) => (
                        <label
                          key={m.id}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition ${
                            paymentMethod === m.id
                              ? "border-navy bg-navy/5 text-navy font-bold ring-1 ring-navy"
                              : "border-slate/20 bg-white text-slate hover:border-slate/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="method"
                            checked={paymentMethod === m.id}
                            onChange={() => setPaymentMethod(m.id as any)}
                            className="text-navy focus:ring-navy"
                          />
                          <m.icon size={16} className="text-brass" />
                          <span>{m.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* QR Code & PayOS link */}
                <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl border border-slate/20 text-center shadow-xs">
                  <span className="text-xs font-bold text-navy uppercase tracking-wide">Mã QR Thanh Toán Tự Động</span>
                  <div className="my-3 p-3 bg-white border-2 border-dashed border-slate/30 rounded-xl shadow-xs">
                    <img
                      src={
                        activeOrder?.qrCode ||
                        `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=BAVES_${selectedPlan.code}_ORDER_${activeOrder?.orderCode || Date.now()}`
                      }
                      alt="VietQR Demo"
                      className="h-36 w-36 object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate">
                    Nội dung CK: <strong className="font-mono text-navy">BAVES {activeOrder?.orderCode || selectedPlan.code}</strong>
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                    Đang tự động lắng nghe Webhook IPN để mở khóa tài khoản...
                  </p>

                  {activeOrder?.checkoutUrl && (
                    <a
                      href={activeOrder.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full inline-flex items-center justify-center gap-1.5 p-2 rounded-xl bg-navy text-white text-xs font-bold hover:bg-navy-light"
                    >
                      <ExternalLink size={14} /> Mở trang thanh toán PayOS
                    </a>
                  )}

                  <Button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="mt-3 w-full justify-center gap-2 bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-sm"
                  >
                    <Check size={15} />
                    {isProcessing ? "Đang xử lý Webhook IPN..." : "Mô phỏng Giao dịch Thành công"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "success" && selectedPlan && (
            <div className="py-8 text-center max-w-md mx-auto animate-fade-in">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
                <Check size={32} strokeWidth={3} />
              </span>
              <h3 className="mt-4 text-xl font-black text-navy">Giao dịch thành công!</h3>
              <p className="mt-1 text-xs text-slate">
                Cổng thanh toán đã gửi xác nhận (IPN Webhook). Tài khoản của bạn đã được nâng cấp lên gói{" "}
                <strong>{selectedPlan.name}</strong>.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-offwhite border border-slate/20 text-left text-xs space-y-1">
                <div>
                  • Mã đơn hàng: <strong className="font-mono text-navy">#{activeOrder?.orderCode || Date.now()}</strong>
                </div>
                <div>
                  • Cổng xử lý: <strong className="text-navy">{paymentMethod.toUpperCase()} Gateway</strong>
                </div>
                <div>
                  • Thời hạn gói:{" "}
                  <strong>{selectedPlan.durationDays ? `${selectedPlan.durationDays} ngày tiếp theo` : "Vô hạn"}</strong>
                </div>
                {selectedPlan.reviewCredits > 0 && (
                  <div>
                    • Lượt chuyên gia chấm bài được cộng:{" "}
                    <strong className="text-emerald-700">+{selectedPlan.reviewCredits} lượt</strong>
                  </div>
                )}
                {selectedPlan.consultationCredits > 0 && (
                  <div>
                    • Lượt tư vấn 1-on-1 được cộng:{" "}
                    <strong className="text-brass">+{selectedPlan.consultationCredits} buổi</strong>
                  </div>
                )}
              </div>
              <Button onClick={handleReset} className="mt-6 w-full justify-center bg-navy text-white text-xs font-bold hover:bg-navy-light">
                Bắt đầu học tập ngay
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
