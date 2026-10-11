import { ArrowRight, Check, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck, Zap } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useApp } from "../../contexts/AppContext";
import type { AppRole, RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";
import { AuthLayout } from "./AuthLayout";

export function LoginPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { setRole, setSelectedDomainId } = useApp();
  const [role, setLoginRole] = useState<AppRole>("learner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Vui lòng nhập địa chỉ email hợp lệ.";
    }
    if (password.length < 6) {
      nextErrors.password = "Mật khẩu phải chứa ít nhất 6 ký tự.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    window.setTimeout(() => {
      setRole(role);
      if (role === "learner") {
        setSelectedDomainId("all");
        navigate("dashboard");
      } else {
        navigate("instructor");
      }
    }, 400);
  };

  const fillDemoAccount = (demoRole: AppRole) => {
    setLoginRole(demoRole);
    setEmail(demoRole === "learner" ? "user@gmail.com" : "user2@gmail.com");
    setPassword("123456");
    setErrors({});
    setDemoNotice(
      demoRole === "learner"
        ? "Đã điền tài khoản Học viên (user@gmail.com • 123456)"
        : "Đã điền tài khoản Giảng viên (user2@gmail.com • 123456)"
    );
    window.setTimeout(() => setDemoNotice(null), 3000);
  };

  return (
    <AuthLayout navigate={navigate} mode="login">
      {/* Title & Subtitle */}
      <div>
        <h2 className="font-['Josefin_Sans',sans-serif] text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Đăng nhập hệ thống
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          Truy cập không gian làm việc mô phỏng doanh nghiệp BA-VES
        </p>
      </div>

      {/* Segmented Role Switcher */}
      <div className="mt-5">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Chọn vai trò đăng nhập
        </label>
        <div
          className="grid grid-cols-2 gap-1 rounded-xl bg-[#171c35] p-1 border border-white/10"
          role="radiogroup"
          aria-label="Chọn vai trò"
        >
          <button
            type="button"
            role="radio"
            aria-checked={role === "learner"}
            onClick={() => setLoginRole("learner")}
            className={classNames(
              "flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-all duration-150",
              role === "learner"
                ? "bg-blue-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-white"
            )}
          >
            <GraduationCap size={15} />
            Học viên (Learner)
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={role === "instructor"}
            onClick={() => setLoginRole("instructor")}
            className={classNames(
              "flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-xs font-semibold transition-all duration-150",
              role === "instructor"
                ? "bg-blue-600 text-white shadow-md font-bold"
                : "text-slate-400 hover:text-white"
            )}
          >
            <ShieldCheck size={15} />
            Giảng viên (Instructor)
          </button>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={submit} className="mt-4 space-y-3.5" noValidate>
        {/* Email Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Địa chỉ Email
          </label>
          <div
            className={classNames(
              "flex items-center gap-2.5 rounded-xl border bg-[#171c35]/90 px-3 py-2 transition-all duration-150",
              errors.email
                ? "border-rose-400 ring-2 ring-rose-500/20"
                : "border-white/15 hover:border-white/25 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
            )}
          >
            <Mail size={15} className="shrink-0 text-slate-400" />
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((cur) => ({ ...cur, email: undefined }));
              }}
              type="email"
              autoComplete="email"
              placeholder={role === "learner" ? "user@gmail.com" : "user2@gmail.com"}
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">
              Mật khẩu
            </label>
            <button
              type="button"
              className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div
            className={classNames(
              "flex items-center gap-2.5 rounded-xl border bg-[#171c35]/90 px-3 py-2 transition-all duration-150",
              errors.password
                ? "border-rose-400 ring-2 ring-rose-500/20"
                : "border-white/15 hover:border-white/25 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
            )}
          >
            <LockKeyhole size={15} className="shrink-0 text-slate-400" />
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((cur) => ({ ...cur, password: undefined }));
              }}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-400 hover:text-slate-200 focus:outline-none"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{errors.password}</p>
          )}
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center pt-0.5">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-white/20 bg-[#171c35] text-blue-600 focus:ring-blue-500 accent-blue-600"
            />
            Ghi nhớ đăng nhập trên thiết bị này
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-70 transition-all"
        >
          {submitting ? (
            "Đang xác thực..."
          ) : (
            <>
              Đăng nhập vào hệ thống
              <ArrowRight size={15} />
            </>
          )}
        </button>

        {/* Demo Notification Banner */}
        {demoNotice && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300 animate-in fade-in">
            <Check size={13} className="text-emerald-400 shrink-0" />
            <span>{demoNotice}</span>
          </div>
        )}
      </form>

      {/* Quick Demo Fillers */}
      <div className="mt-4 rounded-xl border border-white/10 bg-[#171c35]/80 p-2.5 text-xs">
        <div className="flex items-center justify-between text-blue-300 font-semibold mb-1.5">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Zap size={13} className="text-blue-400" />
            Tài khoản dùng thử nhanh:
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemoAccount("learner")}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-[#232846] py-1 px-2.5 text-xs font-medium text-slate-200 hover:border-blue-400/40 hover:bg-blue-600/15 hover:text-white transition-colors"
          >
            <span>Học viên</span>
            <span className="text-[10px] text-blue-300">user@gmail.com</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemoAccount("instructor")}
            className="flex items-center justify-between rounded-lg border border-white/10 bg-[#232846] py-1 px-2.5 text-xs font-medium text-slate-200 hover:border-indigo-400/40 hover:bg-indigo-600/15 hover:text-white transition-colors"
          >
            <span>Giảng viên</span>
            <span className="text-[10px] text-indigo-300">user2@gmail.com</span>
          </button>
        </div>
      </div>

      {/* Switch to Register */}
      <div className="mt-4 text-center text-xs text-slate-400">
        Chưa có tài khoản BA-VES?{" "}
        <button
          type="button"
          onClick={() => navigate("register")}
          className="font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          Đăng ký ngay
        </button>
      </div>
    </AuthLayout>
  );
}
