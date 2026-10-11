import { ArrowRight, Check, CheckCircle2, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import type { AppRole, RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";
import { AuthLayout } from "./AuthLayout";

type RegisterErrors = Partial<Record<"name" | "email" | "password" | "confirm" | "terms", string>>;

export function RegisterPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const [role, setRole] = useState<AppRole>("learner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [created, setCreated] = useState(false);

  // Password validation criteria
  const passwordCriteria = useMemo(() => [
    { label: "Tối thiểu 8 ký tự", valid: password.length >= 8 },
    { label: "Chữ in hoa (A-Z)", valid: /[A-Z]/.test(password) },
    { label: "Chữ số (0-9)", valid: /[0-9]/.test(password) },
    { label: "Ký tự đặc biệt", valid: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  const validCount = passwordCriteria.filter((c) => c.valid).length;
  const strengthLabels = ["", "Yếu", "Trung bình", "Khá", "Rất mạnh"];

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: RegisterErrors = {};

    if (name.trim().length < 2) {
      next.name = "Vui lòng nhập họ và tên của bạn.";
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      next.email = "Vui lòng nhập địa chỉ email hợp lệ.";
    }

    // Explicit password validation rules
    if (password.length < 8) {
      next.password = "Mật khẩu phải có ít nhất 8 ký tự.";
    } else if (!/[A-Z]/.test(password)) {
      next.password = "Mật khẩu phải chứa ít nhất 1 chữ in hoa (A-Z).";
    } else if (!/[0-9]/.test(password)) {
      next.password = "Mật khẩu phải chứa ít nhất 1 chữ số (0-9).";
    }

    if (confirm !== password) {
      next.confirm = "Mật khẩu xác nhận không trùng khớp.";
    }

    if (!terms) {
      next.terms = "Bạn cần đồng ý với Điều khoản dịch vụ để tiếp tục.";
    }

    setErrors(next);
    if (!Object.keys(next).length) setCreated(true);
  };

  if (created) {
    return (
      <AuthLayout navigate={navigate} mode="register">
        <div className="reveal-up text-center py-4">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm border border-emerald-200">
            <CheckCircle2 size={34} />
          </div>

          <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-navy">
            Đăng ký thành công!
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-slate">
            Chào mừng <strong className="text-navy">{name}</strong>. Tài khoản {role === "learner" ? "Học viên" : "Giảng viên"} của bạn đã sẵn sàng trên hệ thống BA-VES.
          </p>

          <button
            type="button"
            onClick={() => navigate("login")}
            className="group relative mt-6 flex min-h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-navy px-4 text-sm font-bold text-white shadow-md transition-all hover:bg-navy-deep hover:-translate-y-0.5"
          >
            Đăng nhập ngay
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </AuthLayout>
    );
  }

  const inputFrame = (error?: string) =>
    classNames(
      "group mt-1 flex min-h-11 items-center gap-2.5 rounded-xl border bg-white px-3 transition-all duration-200",
      error
        ? "border-rose-400 ring-2 ring-rose-100"
        : "border-slate/20 hover:border-slate/40 focus-within:border-brass focus-within:ring-2 focus-within:ring-brass/20"
    );

  return (
    <AuthLayout navigate={navigate} mode="register">
      {/* Header */}
      <div>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
          Tạo tài khoản
        </h2>
        <p className="mt-1 text-xs text-slate">
          Bắt đầu hành trình thực hành phân tích nghiệp vụ thực chiến
        </p>
      </div>

      {/* Role Switcher */}
      <div
        className="mt-5 grid grid-cols-2 gap-1 rounded-xl border border-slate/15 bg-[#f4f7fa] p-1"
        role="radiogroup"
        aria-label="Chọn vai trò đăng ký"
      >
        <button
          type="button"
          role="radio"
          aria-checked={role === "learner"}
          onClick={() => setRole("learner")}
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
          onClick={() => setRole("instructor")}
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

      <form onSubmit={submit} className="mt-4 space-y-3" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-navy">
            Họ và tên
          </label>
          <div className={inputFrame(errors.name)}>
            <UserRound size={16} className="shrink-0 text-slate group-focus-within:text-navy" />
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((c) => ({ ...c, name: undefined }));
              }}
              className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-slate/40"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
            />
          </div>
          {errors.name && <span className="mt-1 block text-xs text-rose-600">{errors.name}</span>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-navy">
            Email
          </label>
          <div className={inputFrame(errors.email)}>
            <Mail size={16} className="shrink-0 text-slate group-focus-within:text-navy" />
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((c) => ({ ...c, email: undefined }));
              }}
              className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-slate/40"
              placeholder="name@example.com"
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="mt-1 block text-xs text-rose-600">{errors.email}</span>}
        </div>

        {/* Password & Confirm Password Grid */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy">
              Mật khẩu
            </label>
            <div className={inputFrame(errors.password)}>
              <LockKeyhole size={16} className="shrink-0 text-slate group-focus-within:text-navy" />
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((c) => ({ ...c, password: undefined }));
                }}
                type={showPassword ? "text" : "password"}
                className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-slate/40"
                placeholder="Tối thiểu 8 ký tự"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate hover:text-navy"
                aria-label={showPassword ? "Ẩn" : "Hiện"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <span className="mt-1 block text-xs text-rose-600">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-navy">
              Xác nhận mật khẩu
            </label>
            <div className={inputFrame(errors.confirm)}>
              <LockKeyhole size={16} className="shrink-0 text-slate group-focus-within:text-navy" />
              <input
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setErrors((c) => ({ ...c, confirm: undefined }));
                }}
                type={showConfirmPassword ? "text" : "password"}
                className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-slate/40"
                placeholder="Nhập lại mật khẩu"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="text-slate hover:text-navy"
                aria-label={showConfirmPassword ? "Ẩn" : "Hiện"}
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.confirm && (
              <span className="mt-1 block text-xs text-rose-600">{errors.confirm}</span>
            )}
          </div>
        </div>

        {/* Live Password Requirements & Micro Strength Indicator */}
        <div className="rounded-xl border border-slate/15 bg-[#f8fafc] p-2.5 space-y-2">
          {/* Strength Bar */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate/80">Yêu cầu bảo mật mật khẩu:</span>
            {password.length > 0 && (
              <span className={classNames(
                "font-bold text-[10px]",
                validCount <= 1 ? "text-rose-500" : validCount <= 2 ? "text-amber-500" : "text-emerald-600"
              )}>
                {strengthLabels[validCount]}
              </span>
            )}
          </div>

          {password.length > 0 && (
            <div className="flex h-1 gap-1">
              {[1, 2, 3, 4].map((lvl) => (
                <span
                  key={lvl}
                  className={classNames(
                    "h-full flex-1 rounded-full transition-all duration-300",
                    lvl <= validCount
                      ? validCount <= 1
                        ? "bg-rose-500"
                        : validCount <= 2
                        ? "bg-amber-400"
                        : "bg-emerald-500"
                      : "bg-slate/20"
                  )}
                />
              ))}
            </div>
          )}

          {/* Interactive Checklist Pills */}
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            {passwordCriteria.map((c) => (
              <div
                key={c.label}
                className={classNames(
                  "flex items-center gap-1.5 transition-colors duration-200",
                  c.valid ? "text-emerald-700 font-semibold" : "text-slate/70"
                )}
              >
                <span
                  className={classNames(
                    "grid h-3.5 w-3.5 place-items-center rounded-full border transition-all duration-200",
                    c.valid
                      ? "border-emerald-600 bg-emerald-100 text-emerald-700 scale-105"
                      : "border-slate/30 bg-white"
                  )}
                >
                  {c.valid ? <Check size={9} /> : <span className="h-1 w-1 rounded-full bg-slate/40" />}
                </span>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="pt-0.5">
          <label className="flex items-center gap-2 text-xs text-slate cursor-pointer select-none">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => {
                setTerms(e.target.checked);
                setErrors((c) => ({ ...c, terms: undefined }));
              }}
              className="h-3.5 w-3.5 rounded border-slate/30 accent-navy"
            />
            <span>
              Tôi đồng ý với{" "}
              <button type="button" className="font-semibold text-navy hover:text-brass underline">
                Điều khoản dịch vụ
              </button>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-xs text-rose-600">{errors.terms}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="group relative mt-2 flex min-h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-navy px-4 text-sm font-bold text-white shadow-md transition-all duration-300 hover:bg-navy-deep hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          Đăng ký tài khoản {role === "learner" ? "Học viên" : "Giảng viên"}
          <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-4 text-center text-xs text-slate">
        Đã có tài khoản?{" "}
        <button
          type="button"
          onClick={() => navigate("login")}
          className="font-bold text-navy hover:text-brass transition-colors"
        >
          Đăng nhập ngay
        </button>
      </div>
    </AuthLayout>
  );
}
