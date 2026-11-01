import { useState } from "react";
import { Check, CreditCard, Crown, QrCode, Shield, Sparkles, X, Zap } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const pricingPlans = [
  {
    id: "free",
    name: "Gói Học viên Cơ bản",
    price: "0 VNĐ",
    period: "Miễn phí",
    desc: "Trải nghiệm các kịch bản nền tảng và nhận xét AI cơ bản.",
    features: [
      "Truy cập 3 kịch bản cơ bản (Retail, Supply Chain, Finance)",
      "Phỏng vấn 3 AI Stakeholders tiêu chuẩn",
      "AI Rubric đánh giá tự động sau mỗi phiên",
      "Lưu trữ 5 hồ sơ tài liệu BA (BRD, BPMN)",
    ],
    current: true,
    tone: "gray" as const,
  },
  {
    id: "pro",
    name: "Gói BA Thực chiến Pro",
    price: "199.000 VNĐ",
    period: "/ tháng",
    desc: "Mở khóa toàn bộ kịch bản phức tạp, sự kiện khẩn cấp và AI Coach không giới hạn.",
    features: [
      "Mở khóa 100% kịch bản đa ngành (WMS, ERP, POS, Banking)",
      "Không giới hạn Token AI GPT-4o / Gemini 1.5 Pro",
      "Kích hoạt biến cố khẩn cấp tự động (Dynamic Events)",
      "Huấn luyện viên Real-time AI Coach theo sát từng câu hỏi",
      "Hồ sơ năng lực chuẩn hóa BABOK® v3 xuất khẩu PDF",
      "Ưu tiên gửi Chuyên gia BA thẩm định & hiệu chỉnh điểm",
    ],
    highlight: true,
    popular: true,
    tone: "brass" as const,
  },
  {
    id: "enterprise",
    name: "Gói Trường học / Doanh nghiệp",
    price: "Liên hệ",
    period: "Hợp đồng đào tạo",
    desc: "Dành cho trường đại học hoặc trung tâm đào tạo quản lý nhiều lớp sinh viên.",
    features: [
      "Quản lý không giới hạn lớp học (Cohorts) và sinh viên",
      "Hệ thống chấm thi, duyệt điểm và xuất Gradebook CSV",
      "Bộ công cụ Soạn thảo Kịch bản & Nhân vật AI độc quyền",
      "Tích hợp API BYOK tùy chỉnh máy chủ doanh nghiệp",
      "Hỗ trợ kỹ thuật 24/7 và cam kết SLA 99.9%",
    ],
    current: false,
    tone: "navy" as const,
  },
];

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [step, setStep] = useState<"plans" | "checkout" | "success">("plans");
  const [paymentMethod, setPaymentMethod] = useState<"vnpay" | "vietqr" | "payos">("vietqr");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSelectCheckout = (planId: string) => {
    if (planId === "free") return;
    setSelectedPlan(planId);
    setStep("checkout");
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep("success");
    }, 1200);
  };

  const handleReset = () => {
    setStep("plans");
    onClose();
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
                <h2 className="text-base font-bold text-navy">Gói dịch vụ & Đăng ký hội viên (BA-VES Subscriptions)</h2>
                <Badge tone="green">Cổng thanh toán điện tử</Badge>
              </div>
              <p className="text-xs text-slate mt-0.5">Nâng cấp tài khoản để mở khóa toàn bộ mô phỏng doanh nghiệp ảo và đánh giá chuyên gia</p>
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
              <div className="mb-6 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brass/15 px-3 py-1 text-xs font-bold text-brass uppercase tracking-wide">
                  <Sparkles size={13} /> Đầu tư kỹ năng thực chiến BABOK® v3
                </span>
                <h3 className="mt-2 text-xl font-extrabold text-navy sm:text-2xl">
                  Chọn gói học tập phù hợp với mục tiêu của bạn
                </h3>
                <p className="mt-1 text-xs text-slate max-w-md mx-auto">
                  Hỗ trợ thanh toán nhanh qua VNPay, PayOS và quét mã VietQR tự động kích hoạt tức thì.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                      plan.highlight
                        ? "border-brass bg-gradient-to-b from-brass/10 via-white to-white shadow-lg ring-2 ring-brass/30"
                        : "border-slate/20 bg-white hover:border-slate/40 shadow-xs"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brass px-3 py-0.5 text-[10px] font-extrabold text-navy-deep uppercase tracking-wider shadow-sm">
                        Khuyên dùng
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-navy">{plan.name}</h4>
                        {plan.current && <Badge tone="gray">Đang dùng</Badge>}
                      </div>
                      <p className="mt-1 text-xs text-slate min-h-[36px]">{plan.desc}</p>

                      <div className="mt-4 flex items-baseline gap-1 border-b border-slate/10 pb-4">
                        <span className="text-2xl font-black text-navy">{plan.price}</span>
                        <span className="text-xs text-slate">{plan.period}</span>
                      </div>

                      <ul className="mt-4 space-y-2.5 text-xs text-navy/90">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-700 mt-0.5">
                              <Check size={10} strokeWidth={3} />
                            </span>
                            <span className="leading-tight">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-2">
                      {plan.current ? (
                        <Button variant="secondary" disabled className="w-full justify-center text-xs opacity-60">
                          Gói hiện tại của bạn
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleSelectCheckout(plan.id)}
                          className={`w-full justify-center gap-1.5 text-xs font-bold shadow-sm ${
                            plan.highlight
                              ? "bg-brass text-navy-deep hover:bg-brass-light"
                              : "bg-navy text-white hover:bg-navy-light"
                          }`}
                        >
                          <Zap size={14} /> Nâng cấp ngay
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === "checkout" && (
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => setStep("plans")}
                className="mb-4 text-xs font-bold text-slate hover:text-navy hover:underline flex items-center gap-1"
              >
                ← Quay lại danh sách gói
              </button>

              <div className="grid gap-6 md:grid-cols-2 bg-offwhite p-6 rounded-2xl border border-slate/20">
                {/* Thông tin đơn */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate">Đơn hàng thanh toán</span>
                  <h3 className="text-base font-extrabold text-navy mt-1">Gói BA Thực chiến Pro (1 tháng)</h3>
                  <div className="mt-4 space-y-2 border-y border-slate/15 py-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate">Phí dịch vụ:</span>
                      <strong className="text-navy">199.000 VNĐ</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate">Thuế VAT (0%):</span>
                      <span className="text-navy">0 VNĐ</span>
                    </div>
                    <div className="flex justify-between text-sm font-black pt-1 border-t border-slate/10">
                      <span className="text-navy">Tổng thanh toán:</span>
                      <span className="text-emerald-700">199.000 VNĐ</span>
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

                {/* QR Code demo */}
                <div className="flex flex-col items-center justify-center bg-white p-5 rounded-xl border border-slate/20 text-center shadow-xs">
                  <span className="text-xs font-bold text-navy uppercase tracking-wide">Mã QR Thanh Toán Tự Động</span>
                  <div className="my-3 p-3 bg-white border-2 border-dashed border-slate/30 rounded-xl shadow-xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=BAVES_PRO_ORDER_INV2026_${Date.now()}`}
                      alt="VietQR Demo"
                      className="h-36 w-36 object-contain"
                    />
                  </div>
                  <p className="text-[11px] text-slate">
                    Nội dung CK: <strong className="font-mono text-navy">BAVES PRO 2026</strong>
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">
                    Hệ thống tự động kích hoạt sau khi nhận IPN webhook
                  </p>

                  <Button
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                    className="mt-4 w-full justify-center gap-2 bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-sm"
                  >
                    <Check size={15} />
                    {isProcessing ? "Đang xử lý Webhook IPN..." : "Mô phỏng Giao dịch Thành công"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="py-8 text-center max-w-md mx-auto animate-fade-in">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
                <Check size={32} strokeWidth={3} />
              </span>
              <h3 className="mt-4 text-xl font-black text-navy">Giao dịch thành công!</h3>
              <p className="mt-1 text-xs text-slate">
                Cổng thanh toán đã gửi xác nhận (IPN Webhook). Tài khoản của bạn đã được nâng cấp lên gói <strong>BA Thực chiến Pro</strong>.
              </p>
              <div className="mt-4 p-3 rounded-xl bg-offwhite border border-slate/20 text-left text-xs space-y-1">
                <div>• Mã giao dịch: <strong className="font-mono text-navy">TXN-{Date.now().toString().slice(-8)}</strong></div>
                <div>• Cổng xử lý: <strong className="text-navy">{paymentMethod.toUpperCase()} Gateway</strong></div>
                <div>• Hạn dùng gói: <strong>30 ngày tiếp theo</strong></div>
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

