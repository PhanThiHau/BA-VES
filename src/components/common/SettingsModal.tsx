import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Settings,
  Sparkles,
  Trash2,
  User,
  X,
  XCircle,
} from "lucide-react";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Badge as AstryxBadge } from "@astryxdesign/core/Badge";
import { Button as AstryxButton } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { List, ListItem } from "@astryxdesign/core/List";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { useApp, type SettingsTab } from "../../contexts/AppContext";
import { aiService } from "../../services/aiService";
import type { AiUsageEntry } from "../../services/apiClient";
import { userService } from "../../services/userService";

const ROLE_LABELS: Record<string, string> = {
  learner: "Học viên",
  instructor: "Giảng viên",
  expert: "Chuyên gia BA",
  admin: "Quản trị viên",
  LEARNER: "Học viên",
  INSTRUCTOR: "Giảng viên",
  BAEXPERT: "Chuyên gia BA",
  BAExpert: "Chuyên gia BA",
  EXPERT: "Chuyên gia BA",
  ADMIN: "Quản trị viên",
};

export function SettingsModal() {
  const {
    role,
    user,
    refreshUser,
    settingsModalOpen,
    setSettingsModalOpen,
    settingsTab,
    setSettingsTab,
  } = useApp();

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // API Key (BYOK) state
  const [provider, setProvider] = useState<"OpenAI" | "Gemini">("Gemini");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Usage state
  const [usageLogs, setUsageLogs] = useState<AiUsageEntry[]>([]);

  const reloadUsage = () => {
    setUsageLogs(aiService.getUsageLogs());
  };

  useEffect(() => {
    if (!settingsModalOpen) return;

    if (user) {
      setFullName(user.fullName || "");
      setAvatarUrl(user.avatarUrl || "");
    }
    setProfileMessage(null);
    setPasswordMessage(null);

    const saved = aiService.getSavedConfig();
    if (saved) {
      setProvider(saved.provider);
      let targetModel = saved.model;
      if (
        saved.provider === "Gemini" &&
        (targetModel === "gemini-1.5-pro" ||
          targetModel === "gemini-1.5-flash" ||
          targetModel === "gemini-2.0-flash" ||
          !targetModel)
      ) {
        targetModel = "gemini-2.5-flash";
      }
      setModel(targetModel);
      setApiKey(saved.apiKey);
    } else {
      setProvider("Gemini");
      setModel("gemini-2.5-flash");
      setApiKey("");
    }
    setTestResult(null);
    setShowKey(false);
    reloadUsage();
  }, [settingsModalOpen, user]);

  useEffect(() => {
    if (settingsModalOpen && settingsTab === "usage") {
      reloadUsage();
    }
  }, [settingsModalOpen, settingsTab]);

  const savedConfig = settingsModalOpen ? aiService.getSavedConfig() : null;
  const activeKeyMask = savedConfig?.apiKey ? aiService.maskApiKey(savedConfig.apiKey) : null;

  const usageStats = useMemo(() => {
    const relevantLogs = activeKeyMask
      ? usageLogs.filter((item) => item.keyMask === activeKeyMask)
      : usageLogs;
    const totalCalls = relevantLogs.length;
    const successCalls = relevantLogs.filter((item) => item.status === "success").length;
    const totalTokens = relevantLogs.reduce((acc, item) => acc + (item.tokens || 0), 0);
    const avgLatency =
      totalCalls > 0
        ? Math.round(relevantLogs.reduce((acc, item) => acc + (item.durationMs || 0), 0) / totalCalls)
        : 0;

    const byFeature = new Map<string, { count: number; tokens: number }>();
    for (const item of relevantLogs) {
      const prev = byFeature.get(item.feature) || { count: 0, tokens: 0 };
      byFeature.set(item.feature, {
        count: prev.count + 1,
        tokens: prev.tokens + (item.tokens || 0),
      });
    }

    return {
      relevantLogs,
      totalCalls,
      successCalls,
      successRate: totalCalls > 0 ? Math.round((successCalls / totalCalls) * 100) : 0,
      totalTokens,
      avgLatency,
      featureBreakdown: Array.from(byFeature.entries()),
    };
  }, [usageLogs, activeKeyMask]);

  if (!settingsModalOpen) return null;

  const currentRoleLabel =
    ROLE_LABELS[role] ||
    (user?.roles?.[0] ? ROLE_LABELS[user.roles[0]] || user.roles[0] : "Thành viên");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setProfileMessage({ type: "error", text: "Họ và tên không được để trống." });
      return;
    }

    setIsUpdatingProfile(true);
    setProfileMessage(null);
    try {
      await userService.updateMe({
        fullName: fullName.trim(),
        avatarUrl: avatarUrl.trim() || null,
      });
      await refreshUser();
      setProfileMessage({ type: "success", text: "Cập nhật thông tin cá nhân thành công!" });
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err?.message || "Không thể cập nhật thông tin." });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 8 ký tự." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage(null);
    try {
      const res = await userService.changePassword({
        currentPassword,
        newPassword,
      });
      setPasswordMessage({ type: "success", text: res.message || "Đổi mật khẩu thành công!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({
        type: "error",
        text: err?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProviderChange = (p: "OpenAI" | "Gemini") => {
    setProvider(p);
    setModel(p === "Gemini" ? "gemini-2.5-flash" : "gpt-4o");
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: "Vui lòng nhập API Key trước khi kiểm tra." });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await aiService.validateConnection({ provider, model, apiKey: apiKey.trim() });
      reloadUsage();
      if (res.isValid) {
        aiService.saveConfig({ provider, model, apiKey: apiKey.trim() });
        setTestResult({
          success: true,
          message: res.message || "Kết nối AI thành công! Đã lưu API Key trên thiết bị.",
        });
      } else {
        setTestResult({
          success: false,
          message: res.message || "Xác thực API Key thất bại.",
        });
      }
    } catch (err: any) {
      reloadUsage();
      setTestResult({
        success: false,
        message: err?.message || "Không thể kết nối tới máy chủ kiểm tra API Key.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveKeyOnly = () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: "Vui lòng nhập API Key." });
      return;
    }
    aiService.saveConfig({ provider, model, apiKey: apiKey.trim() });
    setTestResult({ success: true, message: "Đã lưu cấu hình API Key thành công!" });
  };

  const handleClearKey = () => {
    aiService.clearConfig();
    setApiKey("");
    setTestResult({ success: true, message: "Đã gỡ API Key khỏi thiết bị." });
  };

  const handleClearUsage = () => {
    aiService.clearUsageLogs();
    reloadUsage();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate/20 bg-white shadow-2xl font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate/15 px-5 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-brass shadow-xs">
              <Settings size={18} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-base font-extrabold text-navy truncate">
                  Cài đặt hệ thống & Tài khoản
                </h2>
                <AstryxBadge variant="neutral" label={currentRoleLabel} />
              </div>
              <p className="text-xs text-slate truncate">
                Quản lý hồ sơ cá nhân, bảo mật, API Key AI và theo dõi mức sử dụng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSettingsModalOpen(false)}
            aria-label="Đóng cài đặt"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate hover:bg-offwhite hover:text-navy transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs (Astryx SegmentedControl) */}
        <div className="border-b border-slate/10 bg-slate-50/70 px-5 py-2.5">
          <SegmentedControl
            label="Danh mục cài đặt"
            layout="fill"
            size="sm"
            value={settingsTab}
            onChange={(val) => setSettingsTab(val as SettingsTab)}
          >
            <SegmentedControlItem value="profile" label="Hồ sơ cá nhân" icon={<User size={13} />} />
            <SegmentedControlItem value="password" label="Đổi mật khẩu" icon={<Lock size={13} />} />
            <SegmentedControlItem value="ai" label="Cấu hình API Key" icon={<KeyRound size={13} />} />
            <SegmentedControlItem value="usage" label="Usage API Key" icon={<Activity size={13} />} />
          </SegmentedControl>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: HỒ SƠ CÁ NHÂN (Mọi role) */}
          {settingsTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-3.5 rounded-xl border border-slate/15 bg-offwhite/60 p-3.5">
                <Avatar
                  src={avatarUrl || user?.avatarUrl || undefined}
                  name={fullName || user?.fullName || "BA"}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-navy truncate">
                      {fullName || user?.fullName || "Tài khoản BA-VES"}
                    </span>
                    <AstryxBadge variant="info" label={currentRoleLabel} />
                  </div>
                  <p className="text-xs text-slate truncate mt-0.5">{user?.email || "—"}</p>
                  {user?.roles && user.roles.length > 1 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <AstryxBadge key={r} variant="neutral" label={ROLE_LABELS[r] || r} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {profileMessage && (
                <div
                  className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
                    profileMessage.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 size={15} className="shrink-0" />
                  ) : (
                    <AlertCircle size={15} className="shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate">Email đăng nhập</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || "—"}
                    className="h-9 w-full cursor-not-allowed rounded-xl border border-slate/20 bg-offwhite px-3 text-xs font-semibold text-slate"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate">Vai trò hiện tại</label>
                  <input
                    type="text"
                    disabled
                    value={currentRoleLabel}
                    className="h-9 w-full cursor-not-allowed rounded-xl border border-slate/20 bg-offwhite px-3 text-xs font-semibold text-slate"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="h-9 w-full rounded-xl border border-slate/20 bg-white px-3 text-xs text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Đường dẫn ảnh đại diện (Avatar URL)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="h-9 w-full rounded-xl border border-slate/20 bg-white px-3 text-xs text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate/10 pt-3">
                <AstryxButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  label="Đóng"
                  onClick={() => setSettingsModalOpen(false)}
                />
                <AstryxButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  label={isUpdatingProfile ? "Đang lưu..." : "Lưu thông tin"}
                  isDisabled={isUpdatingProfile}
                />
              </div>
            </form>
          )}

          {/* TAB 2: ĐỔI MẬT KHẨU */}
          {settingsTab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordMessage && (
                <div
                  className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
                    passwordMessage.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 size={15} className="shrink-0" />
                  ) : (
                    <AlertCircle size={15} className="shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold text-navy">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 w-full rounded-xl border border-slate/20 bg-white px-3 text-xs text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                />
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 8 ký tự"
                    className="h-9 w-full rounded-xl border border-slate/20 bg-white px-3 text-xs text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-navy">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="h-9 w-full rounded-xl border border-slate/20 bg-white px-3 text-xs text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate/10 pt-3">
                <AstryxButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  label="Đóng"
                  onClick={() => setSettingsModalOpen(false)}
                />
                <AstryxButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  label={isChangingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                  isDisabled={isChangingPassword}
                />
              </div>
            </form>
          )}

          {/* TAB 3: CẤU HÌNH API KEY (BYOK) */}
          {settingsTab === "ai" && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between rounded-xl border border-slate/15 bg-offwhite/60 px-3.5 py-2.5">
                <StatusDot
                  variant={activeKeyMask ? "success" : "neutral"}
                  label={
                    activeKeyMask
                      ? `Đang gắn: ${savedConfig?.provider} (${savedConfig?.model}) · ${activeKeyMask}`
                      : "Chưa gắn API Key cá nhân"
                  }
                />
                {activeKeyMask && (
                  <button
                    type="button"
                    onClick={() => setSettingsTab("usage")}
                    className="text-[11px] font-bold text-navy underline hover:text-brass cursor-pointer"
                  >
                    Xem Usage →
                  </button>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-navy">
                  Nhà cung cấp AI (Provider)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleProviderChange("Gemini")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-bold transition cursor-pointer ${
                      provider === "Gemini"
                        ? "border-navy bg-navy text-white shadow-xs"
                        : "border-slate/20 bg-offwhite text-slate hover:border-slate/40 hover:text-navy"
                    }`}
                  >
                    <Sparkles size={14} className="text-brass" /> Google Gemini
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProviderChange("OpenAI")}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 font-bold transition cursor-pointer ${
                      provider === "OpenAI"
                        ? "border-navy bg-navy text-white shadow-xs"
                        : "border-slate/20 bg-offwhite text-slate hover:border-slate/40 hover:text-navy"
                    }`}
                  >
                    OpenAI (ChatGPT)
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-navy">
                  Mô hình (Model)
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-9 w-full rounded-xl border border-slate/20 bg-white px-3 font-medium text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                >
                  {provider === "Gemini" ? (
                    <>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Nhanh & Ổn định)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Suy luận sâu)</option>
                    </>
                  ) : (
                    <>
                      <option value="gpt-4o">GPT-4o (Khuyên dùng)</option>
                      <option value="gpt-4o-mini">GPT-4o Mini (Tiết kiệm)</option>
                      <option value="o1-preview">OpenAI o1-preview</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-navy">
                  API Key bí mật
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={provider === "Gemini" ? "AIzaSy..." : "sk-..."}
                    className="h-9 w-full rounded-xl border border-slate/20 bg-white pl-3 pr-9 font-mono text-xs text-navy outline-none focus:border-navy focus:ring-2 focus:ring-navy/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    aria-label={showKey ? "Ẩn API Key" : "Hiện API Key"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate hover:text-navy cursor-pointer"
                  >
                    {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-slate">
                  Lấy API Key tại{" "}
                  <a
                    href={
                      provider === "Gemini"
                        ? "https://aistudio.google.com/app/apikey"
                        : "https://platform.openai.com/api-keys"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-navy underline hover:text-brass"
                  >
                    {provider === "Gemini" ? "Google AI Studio" : "OpenAI Platform"}
                  </a>
                  . Key được lưu cục bộ trên trình duyệt/thiết bị của bạn.
                </p>
              </div>

              {testResult && (
                <div
                  className={`flex items-start gap-2 rounded-xl border p-3 font-medium ${
                    testResult.success
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate/10 pt-3">
                {activeKeyMask ? (
                  <AstryxButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    label="Gỡ Key"
                    icon={<Trash2 size={13} />}
                    onClick={handleClearKey}
                  />
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <AstryxButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    label="Lưu nhanh"
                    onClick={handleSaveKeyOnly}
                  />
                  <AstryxButton
                    type="button"
                    variant="primary"
                    size="sm"
                    label={testing ? "Đang kiểm tra..." : "Kiểm tra & Lưu"}
                    onClick={handleTestConnection}
                    isDisabled={testing}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: USAGE API KEY */}
          {settingsTab === "usage" && (
            <div className="space-y-4 text-xs">
              {/* Attached Key Status & Summary Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate/15 bg-offwhite/60 px-3.5 py-2.5">
                <StatusDot
                  variant={activeKeyMask ? "success" : "neutral"}
                  label={
                    activeKeyMask
                      ? `Key đang gắn: ${activeKeyMask} (${savedConfig?.provider} · ${savedConfig?.model})`
                      : "Chưa gắn API Key — đang hiển thị lịch sử chung"
                  }
                />
                <div className="flex items-center gap-3">
                  <a
                    href={
                      savedConfig?.provider === "OpenAI"
                        ? "https://platform.openai.com/usage"
                        : "https://aistudio.google.com/usage"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-navy underline hover:text-brass"
                  >
                    Quota nhà cung cấp <ExternalLink size={11} />
                  </a>
                  {usageLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearUsage}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      <Trash2 size={11} /> Xóa nhật ký
                    </button>
                  )}
                </div>
              </div>

              {/* Compact Usage Strip */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="rounded-xl border border-slate/15 bg-white px-3 py-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate">
                    Lượt gọi AI
                  </span>
                  <strong className="mt-0.5 block font-mono text-lg font-extrabold text-navy">
                    {usageStats.totalCalls}
                  </strong>
                </div>
                <div className="rounded-xl border border-slate/15 bg-white px-3 py-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate">
                    Tỉ lệ thành công
                  </span>
                  <strong className="mt-0.5 block font-mono text-lg font-extrabold text-emerald-700">
                    {usageStats.successRate}%
                  </strong>
                </div>
                <div className="rounded-xl border border-slate/15 bg-white px-3 py-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate">
                    Token ghi nhận
                  </span>
                  <strong className="mt-0.5 block font-mono text-lg font-extrabold text-navy">
                    {usageStats.totalTokens.toLocaleString("vi-VN")}
                  </strong>
                </div>
                <div className="rounded-xl border border-slate/15 bg-white px-3 py-2.5">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate">
                    Phản hồi TB
                  </span>
                  <strong className="mt-0.5 block font-mono text-lg font-extrabold text-navy">
                    {usageStats.avgLatency} ms
                  </strong>
                </div>
              </div>

              {/* Feature breakdown */}
              {usageStats.featureBreakdown.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate">
                    Phân bổ theo tính năng
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {usageStats.featureBreakdown.map(([feature, stat]) => (
                      <AstryxBadge
                        key={feature}
                        variant="neutral"
                        label={`${feature}: ${stat.count} lượt · ${stat.tokens.toLocaleString("vi-VN")} tok`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Request Logs */}
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate">
                  Nhật ký sử dụng gần đây
                </p>
                {usageStats.relevantLogs.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate/20 p-4">
                    <EmptyState
                      title="Chưa có dữ liệu sử dụng"
                      description="Các lượt gọi AI (Phỏng vấn, AI Coach, Phân tích, Kiểm tra kết nối) khi gắn API Key sẽ được tự động ghi nhận tại đây."
                    />
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto rounded-xl border border-slate/15">
                    <List density="compact" hasDividers>
                      {usageStats.relevantLogs.slice(0, 30).map((entry) => (
                        <ListItem
                          key={entry.id}
                          label={
                            <div className="flex items-center gap-1.5">
                              <span className="truncate font-semibold text-navy">
                                {entry.feature}
                              </span>
                              <AstryxBadge
                                variant={entry.status === "success" ? "success" : "error"}
                                label={entry.status === "success" ? "OK" : `HTTP ${entry.statusCode}`}
                              />
                            </div>
                          }
                          description={`${entry.provider} · ${entry.model} · ${new Date(entry.timestamp).toLocaleString("vi-VN")}`}
                          startContent={
                            <StatusDot
                              variant={entry.status === "success" ? "success" : "error"}
                              label=""
                            />
                          }
                          endContent={
                            <div className="text-right font-mono text-[11px]">
                              <span className="font-bold text-navy">
                                {entry.tokens.toLocaleString("vi-VN")} tok
                                {entry.isEstimatedTokens ? "*" : ""}
                              </span>
                              <span className="block text-[10px] text-slate">
                                {entry.durationMs}ms
                              </span>
                            </div>
                          }
                        />
                      ))}
                    </List>
                  </div>
                )}
                {usageStats.relevantLogs.some((l) => l.isEstimatedTokens) && (
                  <p className="mt-1.5 text-[10px] text-slate">
                    * Giá trị token ước tính theo kích thước nội dung khi máy chủ không trả về trường usage chi tiết.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
