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
    }, 450);
  };

  const fillDemoAccount = (demoRole: AppRole) => {
    setLoginRole(demoRole);
    setEmail(demoRole === "learner" ? "user@gmail.com" : "user2@gmail.com");
    setPassword("123456");
    setErrors({});
    setDemoNotice(demoRole === "learner" ? "Đã điền tài khoản Học viên" : "Đã điền tài khoản Giảng viên");
    window.setTimeout(() => setDemoNotice(null), 2200);
  };

  return (
    <AuthLayout navigate={navigate} mode="login">
      {/* Concise Header */}
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          Đăng nhập
        </h2>
        <p className="mt-1 text-xs text-slate">
          Truy cập không gian làm việc mô phỏng doanh nghiệp
        </p>
      </div>

      {/* Compact Role Switcher */}
      <div
        className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-slate/15 bg-[#f4f7fa] p-1"
        role="radiogroup"
        aria-label="Chọn vai trò"
      >
        <button
          type="button"
          role="radio"
          aria-checked={role === "learner"}
          onClick={() => setLoginRole("learner")}
          className={classNames(
            "flex min-h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all duration-200",
            role === "learner"
              ? "bg-navy text-white shadow-sm"
              : "text-slate hover:text-navy hover:bg-white/60"
          )}
        >
          <GraduationCap size={16} className={role === "learner" ? "text-brass" : ""} />
          Học viên
        </button>

        <button
          type="button"
          role="radio"
          aria-checked={role === "instructor"}
          onClick={() => setLoginRole("instructor")}
          className={classNames(
            "flex min-h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all duration-200",
            role === "instructor"
              ? "bg-navy text-white shadow-sm"
              : "text-slate hover:text-navy hover:bg-white/60"
          )}
        >
          <ShieldCheck size={16} className={role === "instructor" ? "text-brass" : ""} />
          Giảng viên
        </button>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3.5" noValidate>
        {/* Email Field */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-navy">
            Email
          </label>
          <div
            className={classNames(
              "group mt-1 flex min-h-11 items-center gap-2.5 rounded-xl border bg-white px-3 transition-all duration-200",
              errors.email
                ? "border-rose-400 ring-2 ring-rose-100"
                : "border-slate/20 hover:border-slate/40 focus-within:border-brass focus-within:ring-2 focus-within:ring-brass/20"
            )}
          >
            <Mail size={16} className="shrink-0 text-slate group-focus-within:text-navy" />
            <input
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-slate/40"
              placeholder={role === "learner" ? "user@gmail.com" : "user2@gmail.com"}
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>
          )}
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy">
              Mật khẩu
            </label>
            <button
              type="button"
              className="text-[11px] font-semibold text-brass hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div
            className={classNames(
              "group mt-1 flex min-h-11 items-center gap-2.5 rounded-xl border bg-white px-3 transition-all duration-200",
              errors.password
                ? "border-rose-400 ring-2 ring-rose-100"
                : "border-slate/20 hover:border-slate/40 focus-within:border-brass focus-within:ring-2 focus-within:ring-brass/20"
            )}
          >
            <LockKeyhole size={16} className="shrink-0 text-slate group-focus-within:text-navy" />
            <input
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              type={showPassword ? "text" : "password"}
              className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-slate/40"
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate hover:text-navy"
              aria-label={showPassword ? "Ẩn" : "Hiện"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <span className="mt-1 block text-xs text-rose-600">{errors.password}</span>
          )}
        </div>

        {/* Helpers: Remember & Quick Demo */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          <label className="flex items-center gap-2 text-xs text-slate cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate/30 accent-navy"
            />
            Ghi nhớ
          </label>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate/70">Thử nhanh:</span>
            <button
              type="button"
              onClick={() => fillDemoAccount("learner")}
              className="inline-flex items-center gap-1 rounded-md border border-slate/20 bg-offwhite px-2 py-0.5 text-[11px] font-medium text-navy hover:bg-white hover:border-brass/50 transition-all"
            >
              <Zap size={11} className="text-brass" /> Học viên
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("instructor")}
              className="inline-flex items-center gap-1 rounded-md border border-slate/20 bg-offwhite px-2 py-0.5 text-[11px] font-medium text-navy hover:bg-white hover:border-brass/50 transition-all"
            >
              <Zap size={11} className="text-brass" /> Giảng viên
            </button>
          </div>
        </div>

        {demoNotice && (
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-800">
            <Check size={13} className="text-emerald-600" />
            {demoNotice} (MK: 123456)
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="group relative mt-2 flex min-h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-navy px-4 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-navy-deep hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          {submitting ? (
            "Đang đăng nhập..."
          ) : (
            <>
              Đăng nhập
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-5 text-center text-xs text-slate">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={() => navigate("register")}
          className="font-bold text-navy hover:text-brass transition-colors"
        >
          Đăng ký ngay
        </button>
      </div>
    </AuthLayout>
  );
}
