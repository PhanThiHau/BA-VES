import { useState, useEffect, useMemo } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  History,
  Layers,
  MessageSquare,
  QrCode,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { PageHeader } from "../../components/common/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";
import {
  commerceService,
  type PlanDto,
  type OrderDto,
  type EntitlementDto,
} from "../../services/commerceService";
import {
  catalogService,
  type ApplicationItem,
  type IndustryItem,
  type ScenarioItem,
} from "../../services/catalogService";
import { PayOsCheckoutModal } from "./PayOsCheckoutModal";
import { CartPage } from "./CartPage";
import { CheckoutPreviewModal, type CheckoutPreviewLine } from "./CheckoutPreviewModal";
import { formatVnd, getLearnerPlanMeta } from "./learnerPlansCatalog";
import {
  difficultyLabelVi,
  normalizeDifficulty,
  type ScenarioDifficultyKey,
} from "./scenarioPricing";
import { hashQueryParam } from "../../constants/routes";

type OrderPreview = {
  plan: PlanDto;
  targetScopeId?: number;
  targetLabel?: string;
};

interface PaymentPageProps {
  navigate: (route: RouteKey) => void;
}

type ScopeKind = "Scenario" | "Application" | "Industry";
type ScopePick = { plan: PlanDto; kind: ScopeKind };

function scenarioDifficultyForPlan(planCode: string): ScenarioDifficultyKey | null {
  if (planCode === "PLAN-SCENARIO-BEGINNER") return "Beginner";
  if (planCode === "PLAN-SCENARIO-INTERMEDIATE") return "Intermediate";
  if (planCode === "PLAN-SCENARIO-ADVANCED") return "Advanced";
  return null;
}

export function PaymentPage({ navigate }: PaymentPageProps) {
  const [plans, setPlans] = useState<PlanDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [entitlements, setEntitlements] = useState<EntitlementDto[]>([]);
  const [reviewCredits, setReviewCredits] = useState<number>(0);
  const [consultationCredits, setConsultationCredits] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"plans" | "cart" | "orders" | "entitlements">(() =>
    hashQueryParam("tab") === "cart" ? "cart" : "plans"
  );
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdering, setIsOrdering] = useState<number | null>(null);

  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [scopePick, setScopePick] = useState<ScopePick | null>(null);
  const [pickedScopeId, setPickedScopeId] = useState<number | "">("");
  const [scopeSearch, setScopeSearch] = useState("");
  /** buy-now = tạo đơn ngay; cart = thêm vào giỏ */
  const [scopeIntent, setScopeIntent] = useState<"buy" | "cart">("buy");
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [orderPreview, setOrderPreview] = useState<OrderPreview | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [plansRes, ordersRes, entRes, revRes, conRes, appsRes, indRes, scenRes] =
        await Promise.allSettled([
          commerceService.getPlans(),
          commerceService.getMyOrders(),
          commerceService.getMyEntitlements(),
          commerceService.getReviewCredits(),
          commerceService.getConsultationCredits(),
          catalogService.getApplications(),
          catalogService.getIndustries(),
          catalogService.getScenarios(undefined, true),
        ]);

      if (plansRes.status === "fulfilled") setPlans(plansRes.value);
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value);
      if (entRes.status === "fulfilled") setEntitlements(entRes.value);
      if (revRes.status === "fulfilled") setReviewCredits(revRes.value.credits);
      if (conRes.status === "fulfilled") setConsultationCredits(conRes.value.credits);
      if (appsRes.status === "fulfilled") setApplications(appsRes.value);
      if (indRes.status === "fulfilled") setIndustries(indRes.value);
      if (scenRes.status === "fulfilled") setScenarios(scenRes.value);
      try {
        const cart = await commerceService.getCart();
        setCartCount(cart.items.length);
      } catch {
        /* ignore cart bootstrap errors */
      }
    } catch (err) {
      console.warn("Could not load commerce data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAllData();
  }, []);

  const sortedPlans = useMemo(
    () =>
      [...plans].sort((a, b) => {
        const ao = a.displayOrder ?? 99;
        const bo = b.displayOrder ?? 99;
        return ao - bo;
      }),
    [plans]
  );

  const corePlans = sortedPlans.filter((p) =>
    [
      "PLAN-SCENARIO-BEGINNER",
      "PLAN-SCENARIO-INTERMEDIATE",
      "PLAN-SCENARIO-ADVANCED",
      "PLAN-APPLICATION",
      "PLAN-INDUSTRY",
      "PLAN-ALL-ACCESS",
    ].includes(p.code)
  );
  const addonPlans = sortedPlans.filter((p) => p.code.startsWith("PLAN-EXPERT"));
  const otherPlans = sortedPlans.filter(
    (p) => !corePlans.includes(p) && !addonPlans.includes(p) && p.code !== "PLAN-FREE"
  );

  const planNeedsScope = (plan: PlanDto): ScopeKind | null => {
    // Ưu tiên code gói — luôn bắt chọn phạm vi trước khi mua (không gắn sẵn OmniMart/OMS).
    if (plan.code.startsWith("PLAN-SCENARIO")) return "Scenario";
    if (plan.code === "PLAN-APPLICATION") return "Application";
    if (plan.code === "PLAN-INDUSTRY") return "Industry";

    const scope = plan.scopes?.[0];
    if (!scope || scope.scopeId != null) return null;
    if (scope.scopeType === "Scenario" || scope.scopeType === "2") return "Scenario";
    if (scope.scopeType === "Application" || scope.scopeType === "1") return "Application";
    if (
      scope.scopeType === "Industry" ||
      scope.scopeType === "Domain" ||
      scope.scopeType === "0"
    ) {
      return "Industry";
    }
    return null;
  };

  const placeOrder = async (plan: PlanDto, targetScopeId?: number) => {
    setIsOrdering(plan.id);
    try {
      const order = await commerceService.createOrder({
        planId: plan.id,
        targetScopeId,
        returnUrl: window.location.href,
        cancelUrl: window.location.href,
      });

      if (plan.price === 0 || order.status === "Paid") {
        alert(`Đã kích hoạt gói ${plan.name}.`);
        await loadAllData();
      } else {
        setSelectedOrder(order);
      }
    } catch (err: unknown) {
      alert(`Lỗi tạo đơn hàng: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsOrdering(null);
      setOrderPreview(null);
      setScopePick(null);
      setPickedScopeId("");
      setScopeSearch("");
    }
  };

  const openScopePicker = (plan: PlanDto, kind: ScopeKind, intent: "buy" | "cart") => {
    setScopeIntent(intent);
    setScopePick({ plan, kind });
    setPickedScopeId("");
    setScopeSearch("");
  };

  const openOrderPreview = (plan: PlanDto, targetScopeId?: number, targetLabel?: string) => {
    setOrderPreview({ plan, targetScopeId, targetLabel });
  };

  const handleCreateOrder = async (plan: PlanDto) => {
    const need = planNeedsScope(plan);
    if (need) {
      openScopePicker(plan, need, "buy");
      return;
    }
    if (plan.price === 0) {
      await placeOrder(plan);
      return;
    }
    openOrderPreview(plan);
  };

  const handleAddToCart = async (plan: PlanDto) => {
    const need = planNeedsScope(plan);
    if (need) {
      openScopePicker(plan, need, "cart");
      return;
    }
    setAddingToCart(true);
    try {
      const cart = await commerceService.addCartItem({ planId: plan.id });
      setCartCount(cart.items.length);
      alert(`Đã thêm “${plan.name}” vào giỏ (${cart.items.length} mục).`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thêm được vào giỏ.");
    } finally {
      setAddingToCart(false);
    }
  };

  const resolveScopeLabel = (kind: ScopeKind, scopeId: number): string => {
    if (kind === "Scenario") {
      const s = scenarios.find((x) => x.id === scopeId);
      return s ? `${s.code} — ${s.title}` : `Scenario #${scopeId}`;
    }
    if (kind === "Application") {
      const a = applications.find((x) => x.id === scopeId);
      return a ? `${a.code} — ${a.name}` : `Application #${scopeId}`;
    }
    const i = industries.find((x) => x.id === scopeId);
    return i ? `${i.code} — ${i.name}` : `Industry #${scopeId}`;
  };

  const confirmScopeOrder = async () => {
    if (!scopePick || pickedScopeId === "") return;
    const scopeId = Number(pickedScopeId);
    const label = resolveScopeLabel(scopePick.kind, scopeId);
    if (scopeIntent === "cart") {
      setAddingToCart(true);
      try {
        const cart = await commerceService.addCartItem({
          planId: scopePick.plan.id,
          targetScopeId: scopeId,
          targetLabel: label,
        });
        setCartCount(cart.items.length);
        setScopePick(null);
        setPickedScopeId("");
        setScopeSearch("");
        alert(`Đã thêm vào giỏ (${cart.items.length} mục).`);
      } catch (err) {
        alert(err instanceof Error ? err.message : "Không thêm được vào giỏ.");
      } finally {
        setAddingToCart(false);
      }
      return;
    }
    setScopePick(null);
    openOrderPreview(scopePick.plan, scopeId, label);
  };

  const paidOrders = useMemo(
    () => orders.filter((o) => o.status === "Paid"),
    [orders]
  );

  const orderPreviewLines: CheckoutPreviewLine[] = orderPreview
    ? [
        {
          id: `plan-${orderPreview.plan.id}`,
          title: orderPreview.plan.name,
          subtitle: orderPreview.targetLabel
            ? `${orderPreview.plan.code} · ${orderPreview.targetLabel}`
            : orderPreview.plan.code,
          price: orderPreview.plan.price,
        },
      ]
    : [];

  const describeEntitlement = (e: EntitlementDto) => {
    const scope = String(e.scopeType);
    const id = e.scopeId;
    if (scope === "All" || scope === "3") {
      return {
        title: "Toàn bộ thư viện kịch bản",
        detail: "All Access — mọi Industry / Application / Scenario đang publish.",
        kind: "All Access",
      };
    }
    if ((scope === "Scenario" || scope === "2") && id != null) {
      const s = scenarios.find((x) => x.id === id || x.publishedVersionId === id);
      return {
        title: s?.title || `Kịch bản #${id}`,
        detail: s
          ? `${s.code} · ${s.application?.name || "Application"} · ${difficultyLabelVi(s.difficulty)}`
          : "Quyền mở 1 kịch bản cụ thể.",
        kind: "Scenario",
      };
    }
    if ((scope === "Application" || scope === "1") && id != null) {
      const a = applications.find((x) => x.id === id);
      return {
        title: a?.name || `Application #${id}`,
        detail: a
          ? `${a.code} · Ngành: ${a.industry?.name || "—"} — mở mọi scenario trong ứng dụng.`
          : "Quyền mở mọi kịch bản trong một Application.",
        kind: "Application",
      };
    }
    if ((scope === "Industry" || scope === "0") && id != null) {
      const i = industries.find((x) => x.id === id);
      return {
        title: i?.name || `Industry #${id}`,
        detail: i
          ? `${i.code} — mở mọi Application / Scenario trong ngành.`
          : "Quyền mở mọi kịch bản trong một Industry.",
        kind: "Industry",
      };
    }
    return {
      title: `Quyền ${scope}${id != null ? ` #${id}` : ""}`,
      detail: "Entitlement đã kích hoạt trên tài khoản learner.",
      kind: scope,
    };
  };

  const scopePickOptions = useMemo(() => {
    if (!scopePick) return [] as { id: number; title: string; subtitle: string; meta?: string }[];
    const q = scopeSearch.trim().toLowerCase();

    if (scopePick.kind === "Scenario") {
      const wantDiff = scenarioDifficultyForPlan(scopePick.plan.code);
      return scenarios
        .filter((s) => s.hasPublishedVersion)
        .filter((s) => !s.isFreeAccess)
        .filter((s) => (wantDiff ? normalizeDifficulty(s.difficulty) === wantDiff : true))
        .filter((s) => {
          if (!q) return true;
          return (
            s.title.toLowerCase().includes(q) ||
            s.code.toLowerCase().includes(q) ||
            (s.application?.name || "").toLowerCase().includes(q)
          );
        })
        .map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: `${s.code} · ${s.application?.name || "Application"}`,
          meta: `${difficultyLabelVi(s.difficulty)}${s.isFreeAccess ? " · Miễn phí" : ""}`,
        }));
    }

    if (scopePick.kind === "Application") {
      return applications
        .filter((a) => {
          const scenCount = scenarios.filter(
            (s) => s.applicationId === a.id && s.hasPublishedVersion
          ).length;
          if (scenCount === 0) return false;
          if (!q) return true;
          return (
            a.name.toLowerCase().includes(q) ||
            a.code.toLowerCase().includes(q) ||
            (a.industry?.name || "").toLowerCase().includes(q)
          );
        })
        .map((a) => {
          const scenCount = scenarios.filter(
            (s) => s.applicationId === a.id && s.hasPublishedVersion
          ).length;
          return {
            id: a.id,
            title: a.name,
            subtitle: `${a.code} · ${scenCount} kịch bản`,
            meta: a.industry?.name || "Industry",
          };
        });
    }

    return industries
      .filter((i) => {
        const appsInIndustry = applications.filter((a) => a.industry?.id === i.id);
        if (appsInIndustry.length === 0) return false;
        if (!q) return true;
        return i.name.toLowerCase().includes(q) || i.code.toLowerCase().includes(q);
      })
      .map((i) => {
        const appsInIndustry = applications.filter((a) => a.industry?.id === i.id);
        const scenCount = scenarios.filter(
          (s) =>
            s.hasPublishedVersion &&
            appsInIndustry.some((a) => a.id === s.applicationId)
        ).length;
        return {
          id: i.id,
          title: i.name,
          subtitle: `${i.code} · ${appsInIndustry.length} application · ${scenCount} kịch bản`,
          meta: i.description || undefined,
        };
      });
  }, [scopePick, scenarios, applications, industries, scopeSearch]);

  const scopePickTitle =
    scopePick?.kind === "Scenario"
      ? "Chọn kịch bản"
      : scopePick?.kind === "Application"
        ? "Chọn Application"
        : "Chọn Industry";

  const scopePickHint =
    scopePick?.kind === "Scenario"
      ? `Gói ${scopePick.plan.name} mở khóa 1 kịch bản ${
          scenarioDifficultyForPlan(scopePick.plan.code)
            ? difficultyLabelVi(scenarioDifficultyForPlan(scopePick.plan.code)!)
            : ""
        }. Chọn bên dưới rồi thanh toán — không cần vào thư viện.`
      : scopePick?.kind === "Application"
        ? `Gói ${scopePick?.plan.name} mở mọi kịch bản trong một Application.`
        : `Gói ${scopePick?.plan.name} mở mọi Application / kịch bản trong một Industry.`;

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge tone="green">Đã thanh toán</Badge>;
      case "Pending":
        return <Badge tone="amber">Chờ chuyển khoản</Badge>;
      case "Cancelled":
        return <Badge tone="gray">Đã hủy</Badge>;
      case "Expired":
        return <Badge tone="red">Quá hạn</Badge>;
      default:
        return <Badge tone="gray">{status}</Badge>;
    }
  };

  const renderPlanCard = (p: PlanDto, featured = false) => {
    const meta = getLearnerPlanMeta(p.code);
    const isFeatured = featured || p.code === "PLAN-INDUSTRY" || p.code === "PLAN-ALL-ACCESS";
    const privileges =
      meta?.privileges ??
      ([
        {
          label: p.sessionQuota ? `${p.sessionQuota} phiên thực hành` : "Phiên không giới hạn",
          included: true,
        },
        {
          label: p.reviewCredits > 0 ? `${p.reviewCredits} lượt Expert chấm` : "Không có Expert chấm",
          included: p.reviewCredits > 0,
        },
        {
          label:
            p.consultationCredits > 0
              ? `${p.consultationCredits} buổi cố vấn 1-on-1`
              : "Không có cố vấn 1-on-1",
          included: p.consultationCredits > 0,
        },
      ] as { label: string; included: boolean; note?: string }[]);

    return (
      <Card
        key={p.id}
        className={classNames(
          "relative flex flex-col justify-between overflow-hidden p-6 transition-all hover:shadow-md",
          isFeatured ? "border-2 border-brass/50 bg-gradient-to-b from-brass/5 to-white shadow-xs" : "border-slate/15"
        )}
      >
        {(meta?.badge || isFeatured) && (
          <div className="absolute right-0 top-0 rounded-bl-xl bg-brass px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-navy-deep shadow-xs">
            {meta?.badge || "Khuyên dùng"}
          </div>
        )}

        <div>
          <p className="font-mono text-[11px] font-bold uppercase text-slate">{p.code}</p>
          <h3 className="mt-1 text-base font-bold leading-snug text-navy">{p.name}</h3>
          <p className="mt-2 text-xs leading-5 text-slate line-clamp-3">
            {meta?.tagline || p.description}
          </p>
          {meta && (
            <p className="mt-2 text-[11px] font-semibold text-teal-800">
              Phạm vi: {meta.scopeLabel} · {meta.durationLabel}
            </p>
          )}

          <div className="my-5 border-y border-slate/10 py-4">
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-black tracking-tight text-navy">
                {formatVnd(p.price)}
              </span>
              {p.durationDays && (
                <span className="text-xs font-semibold text-slate">/ {p.durationDays} ngày</span>
              )}
            </div>
            {meta?.bestFor && <p className="mt-1 text-[11px] text-slate">Phù hợp: {meta.bestFor}</p>}
          </div>

          <ul className="space-y-2 text-xs text-slate">
            {privileges.map((priv) => (
              <li key={priv.label} className="flex items-start gap-2">
                {priv.included ? (
                  <Check size={14} className="mt-0.5 shrink-0 text-emerald-700" />
                ) : (
                  <X size={14} className="mt-0.5 shrink-0 text-slate/40" />
                )}
                <span className={priv.included ? "text-navy" : "text-slate/70"}>
                  {priv.label}
                  {priv.note ? <span className="text-slate"> — {priv.note}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 space-y-2 border-t border-slate/10 pt-4">
          <Button
            variant="primary"
            onClick={() => void handleCreateOrder(p)}
            disabled={isOrdering === p.id || addingToCart}
            className="w-full justify-center gap-1.5 py-2.5 text-xs font-bold text-white shadow-xs"
          >
            {isOrdering === p.id ? (
              <>
                <RefreshCcw size={13} className="animate-spin" /> Đang tạo đơn...
              </>
            ) : p.price === 0 ? (
              <>
                <Sparkles size={14} /> Kích hoạt miễn phí
              </>
            ) : p.code.startsWith("PLAN-SCENARIO") ? (
              <>
                <Layers size={14} /> Chọn kịch bản rồi thanh toán
              </>
            ) : p.code === "PLAN-APPLICATION" ? (
              <>
                <Layers size={14} /> Chọn Application rồi thanh toán
              </>
            ) : p.code === "PLAN-INDUSTRY" ? (
              <>
                <Layers size={14} /> Chọn Industry rồi thanh toán
              </>
            ) : (
              <>
                <QrCode size={14} /> Mua ngay qua PayOS
              </>
            )}
          </Button>
          {p.price > 0 && (
            <Button
              variant="secondary"
              disabled={addingToCart || isOrdering === p.id}
              className="w-full justify-center gap-1.5 border-navy/25 bg-white py-2 text-xs font-bold text-navy hover:bg-navy/5"
              onClick={() => void handleAddToCart(p)}
            >
              <ShoppingCart size={14} />
              {planNeedsScope(p) ? "Chọn phạm vi & thêm giỏ" : "Thêm vào giỏ"}
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="BA-VES Commerce · Learner packs"
        title="Gói mô phỏng 1–4 & Credits Expert"
        description="Gói 1 mua theo kịch bản (AI). Gói 2–4 mở rộng Application → Industry → All, kèm lượt Expert khan hiếm. Add-on Expert khi cần thêm."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              className="relative gap-1.5 text-xs font-bold text-white"
              onClick={() => {
                setActiveTab("cart");
                window.location.hash = "#/payment?tab=cart";
              }}
            >
              <ShoppingCart size={13} />
              <span>Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Button>
            <Button
              onClick={() => void loadAllData()}
              disabled={isLoading}
              variant="secondary"
              className="gap-1.5 border-navy/25 bg-white text-xs font-bold text-navy hover:bg-navy/5"
            >
              <RefreshCcw size={13} className={isLoading ? "animate-spin" : ""} />
              Làm mới
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate/15 bg-white px-4 py-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <UserCheck size={15} />
            </span>
            <div>
              <span className="text-[11px] text-slate">Lượt Expert chấm:</span>{" "}
              <strong className="font-bold text-navy">{reviewCredits ?? 0} lượt</strong>
            </div>
          </div>
          <span className="hidden h-4 w-px bg-slate/20 sm:inline-block" />
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <MessageSquare size={15} />
            </span>
            <div>
              <span className="text-[11px] text-slate">Cố vấn 1-on-1:</span>{" "}
              <strong className="font-bold text-navy">{consultationCredits ?? 0} buổi</strong>
            </div>
          </div>
          <span className="hidden h-4 w-px bg-slate/20 sm:inline-block" />
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
              <ShieldCheck size={15} />
            </span>
            <div>
              <span className="text-[11px] text-slate">Entitlement đang hiệu lực:</span>{" "}
              <strong className="font-bold text-navy">{entitlements.length}</strong>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate("booking")}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate/20 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-navy transition hover:bg-slate-100"
        >
          <MessageSquare size={13} className="text-blue-600" />
          Đặt lịch cố vấn
        </button>
      </div>

      <div className="mb-5">
        <SegmentedControl
          value={activeTab}
          onChange={(val) => {
            const next = val as "plans" | "cart" | "orders" | "entitlements";
            setActiveTab(next);
            window.location.hash = next === "cart" ? "#/payment?tab=cart" : "#/payment";
          }}
          label="Danh mục gói dịch vụ và đơn hàng"
          size="md"
        >
          <SegmentedControlItem
            value="plans"
            label="Gói dịch vụ"
            icon={<CreditCard size={14} />}
          />
          <SegmentedControlItem
            value="cart"
            className="relative"
            label={
              (
                <>
                  <span>Giỏ hàng</span>
                  {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 z-10 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-extrabold leading-none text-white shadow-sm ring-2 ring-white">
                      {cartCount}
                    </span>
                  )}
                </>
              ) as unknown as string
            }
            icon={<ShoppingCart size={14} />}
          />
          <SegmentedControlItem
            value="orders"
            label="Đã thanh toán"
            icon={<History size={14} />}
          />
          <SegmentedControlItem
            value="entitlements"
            label="Đã sở hữu"
            icon={<Layers size={14} />}
          />
        </SegmentedControl>
      </div>

      {activeTab === "cart" && (
        <CartPage
          navigate={navigate}
          embedded
          onCartChange={(count) => setCartCount(count)}
        />
      )}

      {activeTab === "plans" && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm font-bold text-navy">Gói mô phỏng learner (1 → 4)</h2>
            <p className="mb-3 text-[11px] text-slate">
              Bấm thanh toán → chọn ngay Scenario / Application / Industry trong hộp thoại. Kịch bản Beginner gắn “Miễn phí” không cần mua.
            </p>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {corePlans.map((p) => renderPlanCard(p))}
            </div>
          </section>

          {addonPlans.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-navy">Add-on Expert (không mở kịch bản mới)</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {addonPlans.map((p) => renderPlanCard(p))}
              </div>
            </section>
          )}

          {otherPlans.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold text-navy">Gói khác</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {otherPlans.map((p) => renderPlanCard(p))}
              </div>
            </section>
          )}

          {plans.length === 0 && !isLoading && (
            <Card className="p-10 text-center text-xs text-slate">
              Chưa có gói Published. Chạy script <code className="font-mono">seed-learner-plans-v2.sql</code>.
            </Card>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <Card className="overflow-hidden border-slate/15">
          <div className="border-b border-slate/10 p-5">
            <h3 className="text-base font-bold text-navy">Đơn hàng đã thanh toán</h3>
            <p className="mt-1 text-[11px] text-slate">
              Chỉ hiển thị đơn đã Paid. Đơn chờ thanh toán không lưu trong danh sách này.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate/10 bg-mist/20 text-[11px] uppercase tracking-wider text-slate">
                <tr>
                  <th className="px-4 py-3 font-bold">Mã đơn</th>
                  <th className="px-4 py-3 font-bold">Nội dung</th>
                  <th className="px-4 py-3 font-bold">Số tiền</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 font-bold">Thanh toán lúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {paidOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-slate">
                      Chưa có đơn đã thanh toán.
                    </td>
                  </tr>
                ) : (
                  paidOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-offwhite/40">
                      <td className="px-4 py-3 font-mono font-bold text-navy">#{o.orderCode}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy">{o.planName}</p>
                        {o.lines && o.lines.length > 1 ? (
                          <p className="mt-0.5 text-[11px] text-slate">{o.lines.length} mục trong đơn</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 font-mono">{formatVnd(o.amount)}</td>
                      <td className="px-4 py-3">{getOrderStatusBadge(o.status)}</td>
                      <td className="px-4 py-3 text-slate">
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />{" "}
                          {new Date(o.paidAt || o.createdAt).toLocaleString("vi-VN")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "entitlements" && (
        <div className="grid gap-4 md:grid-cols-2">
          {entitlements.length === 0 ? (
            <Card className="p-10 text-center text-xs text-slate md:col-span-2">
              Bạn chưa sở hữu entitlement nào. Mua Gói 1–4 để mở kịch bản.
            </Card>
          ) : (
            entitlements.map((e) => {
              const info = describeEntitlement(e);
              const active = e.status === "Active" || e.status === "0";
              return (
                <Card key={e.id} className="border-slate/15 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge tone="navy" className="bg-navy/10 text-[10px] font-bold text-navy">
                        {info.kind}
                      </Badge>
                      <h3 className="mt-2 font-display text-sm font-extrabold text-navy">{info.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate">{info.detail}</p>
                    </div>
                    <Badge tone={active ? "green" : "gray"}>{String(e.status)}</Badge>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 rounded-xl border border-slate/10 bg-offwhite/70 p-3 text-[11px]">
                    <div>
                      <dt className="font-semibold text-slate">Nguồn</dt>
                      <dd className="mt-0.5 font-bold text-navy">{String(e.sourceType)}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate">Đơn nguồn</dt>
                      <dd className="mt-0.5 font-mono font-bold text-navy">
                        {e.sourceOrderId != null ? `#${e.sourceOrderId}` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate">Hiệu lực từ</dt>
                      <dd className="mt-0.5 font-bold text-navy">
                        {new Date(e.startsAt).toLocaleDateString("vi-VN")}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-slate">Hết hạn</dt>
                      <dd className="mt-0.5 font-bold text-navy">
                        {e.endsAt ? new Date(e.endsAt).toLocaleDateString("vi-VN") : "Không thời hạn"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="font-semibold text-slate">Phiên thực hành</dt>
                      <dd className="mt-0.5 font-bold text-navy">
                        Đã dùng {e.sessionsUsed} / {e.sessionQuota ?? "không giới hạn"}
                      </dd>
                    </div>
                  </dl>
                </Card>
              );
            })
          )}
        </div>
      )}

      {scopePick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm">
          <div className="flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col rounded-2xl border border-slate/15 bg-white shadow-xl">
            <div className="border-b border-slate/10 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-extrabold text-navy">{scopePickTitle}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate">{scopePickHint}</p>
                  <p className="mt-1 font-mono text-[10px] font-bold text-teal-800">
                    {scopePick.plan.code} · {formatVnd(scopePick.plan.price)}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Đóng"
                  className="rounded-lg p-1.5 text-slate hover:bg-slate/10"
                  onClick={() => {
                    setScopePick(null);
                    setPickedScopeId("");
                    setScopeSearch("");
                  }}
                >
                  <X size={16} />
                </button>
              </div>
              <input
                type="search"
                value={scopeSearch}
                onChange={(e) => setScopeSearch(e.target.value)}
                placeholder={
                  scopePick.kind === "Scenario"
                    ? "Tìm theo mã, tên kịch bản, application…"
                    : scopePick.kind === "Application"
                      ? "Tìm application / ngành…"
                      : "Tìm ngành…"
                }
                className="mt-3 w-full rounded-xl border border-slate/20 bg-offwhite px-3 py-2 text-sm text-navy outline-none focus:border-navy/30"
              />
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
              {scopePickOptions.length === 0 ? (
                <p className="px-2 py-8 text-center text-xs text-slate">
                  Không có mục phù hợp
                  {scopePick.kind === "Scenario"
                    ? " (đã lọc theo độ khó gói; kịch bản miễn phí không hiện ở đây)."
                    : "."}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {scopePickOptions.map((opt) => {
                    const selected = pickedScopeId === opt.id;
                    return (
                      <li key={opt.id}>
                        <button
                          type="button"
                          onClick={() => setPickedScopeId(opt.id)}
                          className={classNames(
                            "flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                            selected
                              ? "border-brass/60 bg-brass/10 shadow-2xs"
                              : "border-slate/15 bg-white hover:border-slate/30 hover:bg-offwhite/80"
                          )}
                        >
                          <span
                            className={classNames(
                              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              selected ? "border-brass bg-brass text-navy-deep" : "border-slate/30"
                            )}
                          >
                            {selected ? <Check size={10} strokeWidth={3} /> : null}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-navy line-clamp-2">{opt.title}</span>
                            <span className="mt-0.5 block font-mono text-[10px] font-semibold text-slate">
                              {opt.subtitle}
                            </span>
                            {opt.meta ? (
                              <span className="mt-1 inline-block rounded-md bg-navy/5 px-1.5 py-0.5 text-[10px] font-bold text-navy">
                                {opt.meta}
                              </span>
                            ) : null}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-slate/10 px-5 py-3">
              <span className="text-[11px] text-slate">
                {scopePickOptions.length} lựa chọn
                {pickedScopeId !== "" ? " · đã chọn 1" : ""}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setScopePick(null);
                    setPickedScopeId("");
                    setScopeSearch("");
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  className="text-white"
                  disabled={
                    pickedScopeId === "" ||
                    isOrdering === scopePick.plan.id ||
                    addingToCart
                  }
                  onClick={() => void confirmScopeOrder()}
                >
                  {scopeIntent === "cart"
                    ? addingToCart
                      ? "Đang thêm..."
                      : "Thêm vào giỏ"
                    : "Xem trước & thanh toán"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {orderPreview && (
        <CheckoutPreviewModal
          lines={orderPreviewLines}
          confirming={isOrdering === orderPreview.plan.id}
          onCancel={() => setOrderPreview(null)}
          onConfirm={() =>
            void placeOrder(orderPreview.plan, orderPreview.targetScopeId)
          }
        />
      )}

      {selectedOrder && (
        <PayOsCheckoutModal
          order={selectedOrder}
          onClose={() => {
            setSelectedOrder(null);
            void loadAllData();
          }}
          onSuccess={() => {
            setSelectedOrder(null);
            void loadAllData();
          }}
        />
      )}
    </>
  );
}
