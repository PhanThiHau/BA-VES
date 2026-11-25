import { useEffect, useState } from "react";
import { ShoppingCart, Trash2, RefreshCcw, QrCode, ArrowLeft } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import type { RouteKey } from "../../types/models";
import {
  commerceService,
  type CartDto,
  type OrderDto,
} from "../../services/commerceService";
import { formatVnd } from "./learnerPlansCatalog";
import { PayOsCheckoutModal } from "./PayOsCheckoutModal";
import { CheckoutPreviewModal } from "./CheckoutPreviewModal";

export function CartPage({
  navigate,
  embedded = false,
  onCartChange,
}: {
  navigate: (route: RouteKey) => void;
  /** Nhúng trong trang Gói mô phỏng — ẩn PageHeader riêng */
  embedded?: boolean;
  onCartChange?: (count: number) => void;
}) {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | "checkout" | "clear" | null>(null);
  const [checkoutOrder, setCheckoutOrder] = useState<OrderDto | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await commerceService.getCart();
      setCart(next);
      onCartChange?.(next.items.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const removeItem = async (itemId: number) => {
    setBusyId(itemId);
    try {
      const next = await commerceService.removeCartItem(itemId);
      setCart(next);
      onCartChange?.(next.items.length);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không xóa được mục.");
    } finally {
      setBusyId(null);
    }
  };

  const clearAll = async () => {
    if (!confirm("Xóa toàn bộ giỏ hàng?")) return;
    setBusyId("clear");
    try {
      const next = await commerceService.clearCart();
      setCart(next);
      onCartChange?.(next.items.length);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không xóa được giỏ.");
    } finally {
      setBusyId(null);
    }
  };

  const checkout = async () => {
    if (!cart?.items.length) return;
    setBusyId("checkout");
    setError(null);
    try {
      const order = await commerceService.checkoutCart({
        returnUrl: window.location.href,
        cancelUrl: window.location.href,
      });
      setShowPreview(false);
      const next = await commerceService.getCart();
      setCart(next);
      onCartChange?.(next.items.length);
      if (order.status === "Paid" || order.amount === 0) {
        alert("Đã kích hoạt các mục trong giỏ (miễn phí / đã thanh toán).");
        await load();
      } else {
        setCheckoutOrder(order);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout thất bại.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow="BA-VES Commerce"
          title="Giỏ hàng"
          description="Gom nhiều Scenario / Application / Industry rồi thanh toán một lần qua PayOS."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="gap-1.5 text-xs"
                onClick={() => {
                  window.location.hash = "#/payment?tab=cart";
                  navigate("payment");
                }}
              >
                <ArrowLeft size={13} /> Gói mô phỏng
              </Button>
              <Button
                variant="secondary"
                className="gap-1.5 text-xs"
                disabled={loading}
                onClick={() => void load()}
              >
                <RefreshCcw size={13} className={loading ? "animate-spin" : ""} /> Làm mới
              </Button>
            </div>
          }
        />
      )}

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <Card className="overflow-hidden border-slate/15">
        <div className="flex items-center justify-between gap-3 border-b border-slate/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-navy" />
            <h2 className="text-sm font-bold text-navy">
              {cart?.items.length ?? 0} mục · Tổng {formatVnd(cart?.totalAmount ?? 0)}
            </h2>
          </div>
          {(cart?.items.length ?? 0) > 0 && (
            <button
              type="button"
              className="text-[11px] font-bold text-rose-600 hover:underline"
              disabled={busyId === "clear"}
              onClick={() => void clearAll()}
            >
              Xóa hết
            </button>
          )}
        </div>

        {loading ? (
          <p className="px-5 py-10 text-center text-xs text-slate">Đang tải giỏ hàng…</p>
        ) : !cart?.items.length ? (
          <div className="px-5 py-12 text-center">
            <p className="text-xs text-slate">Giỏ trống. Thêm gói từ trang Gói mô phỏng hoặc chi tiết kịch bản.</p>
            <Button
              variant="primary"
              className="mt-4 text-xs text-white"
              onClick={() => navigate("payment")}
            >
              Chọn gói để thêm
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate/10">
            {cart.items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-navy">{item.planName}</p>
                  <p className="mt-0.5 font-mono text-[10px] font-semibold text-slate">
                    {item.planCode}
                    {item.scopeType ? ` · ${item.scopeType}` : ""}
                    {item.targetScopeId != null ? ` #${item.targetScopeId}` : ""}
                  </p>
                  {item.targetLabel && (
                    <p className="mt-1 text-xs font-semibold text-teal-800">{item.targetLabel}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-navy">{formatVnd(item.unitPrice)}</span>
                  <button
                    type="button"
                    className="rounded-lg border border-slate/20 p-1.5 text-slate hover:bg-rose-50 hover:text-rose-600"
                    disabled={busyId === item.id}
                    onClick={() => void removeItem(item.id)}
                    aria-label="Xóa khỏi giỏ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {(cart?.items.length ?? 0) > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate/10 bg-offwhite/50 px-5 py-4">
            <div>
              <p className="text-[11px] text-slate">Thanh toán một lần · cấp entitlement từng mục sau khi Paid</p>
              <p className="font-mono text-lg font-black text-navy">{formatVnd(cart!.totalAmount)}</p>
            </div>
            <Button
              variant="primary"
              className="gap-1.5 text-xs font-bold text-white"
              disabled={busyId === "checkout"}
              onClick={() => setShowPreview(true)}
            >
              <QrCode size={14} />
              Thanh toán giỏ hàng
            </Button>
          </div>
        )}
      </Card>

      {showPreview && cart && (
        <CheckoutPreviewModal
          title="Xem trước giỏ hàng trước khi tạo mã"
          confirming={busyId === "checkout"}
          lines={cart.items.map((item) => ({
            id: String(item.id),
            title: item.planName,
            subtitle: item.targetLabel
              ? `${item.planCode} · ${item.targetLabel}`
              : item.planCode,
            price: item.unitPrice,
          }))}
          onCancel={() => setShowPreview(false)}
          onConfirm={() => void checkout()}
        />
      )}

      {checkoutOrder && (
        <PayOsCheckoutModal
          order={checkoutOrder}
          onClose={() => {
            setCheckoutOrder(null);
            void load();
          }}
          onSuccess={() => {
            setCheckoutOrder(null);
            void load();
          }}
        />
      )}
    </>
  );
}
