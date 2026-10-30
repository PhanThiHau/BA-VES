import { useState, useEffect } from "react";
import { KeyRound, Lock, Shield, User, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { useApp } from "../../contexts/AppContext";
import { userService } from "../../services/userService";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, refreshUser } = useApp();

  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  // Profile Form state
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setAvatarUrl(user.avatarUrl || "");
    }
    setProfileMessage(null);
    setPasswordMessage(null);
  }, [user, isOpen]);

  if (!isOpen) return null;

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
      setProfileMessage({ type: "success", text: "Cập nhật hồ sơ cá nhân thành công!" });
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err?.message || "Không thể cập nhật hồ sơ." });
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
      setPasswordMessage({ type: "error", text: err?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại." });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-navy-deep/60 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate/15 bg-white p-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy/10 text-navy">
              <User size={18} />
            </span>
            <div>
              <h2 className="text-base font-bold text-navy">Tài khoản & Bảo mật</h2>
              <p className="text-xs text-slate">Quản lý thông tin hồ sơ và đổi mật khẩu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate hover:text-navy text-lg font-bold"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate/15 bg-offwhite px-5 pt-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "profile"
                ? "border-navy text-navy"
                : "border-transparent text-slate hover:text-navy"
            }`}
          >
            <User size={14} /> Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "password"
                ? "border-navy text-navy"
                : "border-transparent text-slate hover:text-navy"
            }`}
          >
            <KeyRound size={14} /> Đổi mật khẩu
          </button>
        </div>

        <div className="p-6 bg-white">
          {/* TAB 1: THÔNG TIN CÁ NHÂN */}
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileMessage && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                    profileMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 size={16} className="shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate mb-1">Email đăng nhập</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || "—"}
                  className="w-full rounded-xl border border-slate/20 bg-offwhite px-3.5 py-2 text-xs font-semibold text-slate cursor-not-allowed"
                />
                <span className="text-[10px] text-slate/75 mt-1 block">Email được dùng làm tài khoản định danh duy nhất.</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên..."
                  className="w-full rounded-xl border border-slate/20 bg-white px-3.5 py-2 text-xs text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">Đường dẫn ảnh đại diện (Avatar URL)</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-xl border border-slate/20 bg-white px-3.5 py-2 text-xs text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy/20"
                />
              </div>

              <div className="rounded-xl border border-slate/15 bg-offwhite p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate font-semibold">Vai trò hệ thống:</span>
                  <div className="flex gap-1.5">
                    {user?.roles?.map((role) => (
                      <Badge key={role} tone="navy">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate/10">
                  <span className="text-slate">Ngày tham gia:</span>
                  <span className="font-semibold text-navy">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—"}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate/10">
                <Button variant="secondary" type="button" onClick={onClose}>
                  Đóng
                </Button>
                <Button disabled={isUpdatingProfile} type="submit" className="bg-navy hover:bg-navy-light text-white text-xs">
                  {isUpdatingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          )}

          {/* TAB 2: ĐỔI MẬT KHẨU */}
          {activeTab === "password" && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordMessage && (
                <div
                  className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                    passwordMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 size={16} className="shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang dùng..."
                  className="w-full rounded-xl border border-slate/20 bg-white px-3.5 py-2 text-xs text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ít nhất 8 ký tự..."
                  className="w-full rounded-xl border border-slate/20 bg-white px-3.5 py-2 text-xs text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-1">
                  Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới..."
                  className="w-full rounded-xl border border-slate/20 bg-white px-3.5 py-2 text-xs text-navy outline-none focus:border-navy focus:ring-1 focus:ring-navy/20"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate/10">
                <Button variant="secondary" type="button" onClick={onClose}>
                  Hủy
                </Button>
                <Button disabled={isChangingPassword} type="submit" className="bg-navy hover:bg-navy-light text-white text-xs">
                  {isChangingPassword ? "Đang đổi mật khẩu..." : "Cập nhật mật khẩu"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}

