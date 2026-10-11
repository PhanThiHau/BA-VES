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
    { label: "8+ ký tự", valid: password.length >= 8 },
    { label: "Chữ hoa (A-Z)", valid: /[A-Z]/.test(password) },
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
        <div className="text-center py-6">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
            <CheckCircle2 size={36} />
          </div>

          <h2 className="mt-4 font-['Josefin_Sans',sans-serif] text-2xl font-bold tracking-tight text-white">
            Đăng ký tài khoản thành công!
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-xs sm:text-sm leading-relaxed text-slate-300">
            Chào mừng <strong className="text-white">{name}</strong>. Tài khoản {role === "learner" ? "Học viên" : "Giảng viên"} của bạn đã sẵn sàng trên hệ thống BA-VES.
          </p>

          <button
            type="button"
            onClick={() => navigate("login")}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 active:bg-blue-700 transition-colors"
          >
            Đăng nhập ngay
            <ArrowRight size={15} />
          </button>
        </div>
      </AuthLayout>
    );
  }

  const inputFrame = (error?: string) =>
    classNames(
      "flex items-center gap-2.5 rounded-xl border bg-[#171c35]/90 px-3 py-2 transition-all duration-150",
      error
        ? "border-rose-400 ring-2 ring-rose-500/20"
        : "border-white/15 hover:border-white/25 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20"
    );

  return (
    <AuthLayout navigate={navigate} mode="register">
      {/* Title & Subtitle */}
      <div>
        <h2 className="font-['Josefin_Sans',sans-serif] text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Tạo tài khoản mới
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          Bắt đầu hành trình phân tích nghiệp vụ thực chiến cùng BA-VES
        </p>
      </div>

      {/* Segmented Role Switcher */}
      <div className="mt-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          Chọn vai trò đăng ký
        </label>
        <div
          className="grid grid-cols-2 gap-1 rounded-xl bg-[#171c35] p-1 border border-white/10"
          role="radiogroup"
          aria-label="Chọn vai trò đăng ký"
        >
          <button
            type="button"
            role="radio"
            aria-checked={role === "learner"}
            onClick={() => setRole("learner")}
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
            onClick={() => setRole("instructor")}
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

      {/* Main Register Form */}
      <form onSubmit={submit} className="mt-3.5 space-y-3" noValidate>
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Họ và tên
          </label>
          <div className={inputFrame(errors.name)}>
            <UserRound size={15} className="shrink-0 text-slate-400" />
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((c) => ({ ...c, name: undefined }));
              }}
              type="text"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>
          {errors.name && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Địa chỉ Email
          </label>
          <div className={inputFrame(errors.email)}>
            <Mail size={15} className="shrink-0 text-slate-400" />
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((c) => ({ ...c, email: undefined }));
              }}
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.email}</p>}
        </div>

        {/* Password & Confirm Password Row */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Mật khẩu
            </label>
            <div className={inputFrame(errors.password)}>
              <LockKeyhole size={15} className="shrink-0 text-slate-400" />
              <input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((c) => ({ ...c, password: undefined }));
                }}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Tối thiểu 8 ký tự"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-slate-400 hover:text-slate-200 focus:outline-none"
                aria-label={showPassword ? "Ẩn" : "Hiện"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Xác nhận mật khẩu
            </label>
            <div className={inputFrame(errors.confirm)}>
              <LockKeyhole size={15} className="shrink-0 text-slate-400" />
              <input
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setErrors((c) => ({ ...c, confirm: undefined }));
                }}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="text-slate-400 hover:text-slate-200 focus:outline-none"
                aria-label={showConfirmPassword ? "Ẩn" : "Hiện"}
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.confirm && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.confirm}</p>
            )}
          </div>
        </div>

        {/* Compact Password Strength Indicator */}
        <div className="rounded-xl border border-white/10 bg-[#171c35]/80 p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Độ bảo mật mật khẩu:</span>
            {password.length > 0 && (
              <span className={classNames(
                "font-bold text-[11px]",
                validCount <= 1 ? "text-rose-400" : validCount <= 2 ? "text-amber-400" : "text-emerald-400"
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
                    "h-full flex-1 rounded-full transition-all duration-200",
                    lvl <= validCount
                      ? validCount <= 1
                        ? "bg-rose-500"
                        : validCount <= 2
                        ? "bg-amber-400"
                        : "bg-emerald-400"
                      : "bg-white/10"
                  )}
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-4 gap-1 text-[10px]">
            {passwordCriteria.map((c) => (
              <div
                key={c.label}
                className={classNames(
                  "flex items-center gap-1",
                  c.valid ? "text-emerald-300 font-medium" : "text-slate-500"
                )}
              >
                <span
                  className={classNames(
                    "grid h-3 w-3 place-items-center rounded-full border transition-all shrink-0",
                    c.valid
                      ? "border-emerald-400 bg-emerald-500/20 text-emerald-400"
                      : "border-white/15 bg-white/5"
                  )}
                >
                  {c.valid ? <Check size={8} /> : <span className="h-0.5 w-0.5 rounded-full bg-slate-500" />}
                </span>
                <span className="truncate">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div>
          <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => {
                setTerms(e.target.checked);
                setErrors((c) => ({ ...c, terms: undefined }));
              }}
              className="mt-0.5 h-3.5 w-3.5 rounded border-white/20 bg-[#171c35] text-blue-600 focus:ring-blue-500 accent-blue-600"
            />
            <span>
              Tôi đồng ý với{" "}
              <button type="button" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
                Điều khoản dịch vụ
              </button>{" "}
              và{" "}
              <button type="button" className="font-semibold text-blue-400 hover:text-blue-300 hover:underline">
                Chính sách bảo mật
              </button>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-xs text-rose-400 font-medium">{errors.terms}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 active:bg-blue-700 transition-all"
        >
          Đăng ký tài khoản {role === "learner" ? "Học viên" : "Giảng viên"}
          <ArrowRight size={15} />
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-3.5 text-center text-xs text-slate-400">
        Đã có tài khoản trên BA-VES?{" "}
        <button
          type="button"
          onClick={() => navigate("login")}
          className="font-bold text-blue-400 hover:text-blue-300 hover:underline transition-colors"
        >
          Đăng nhập ngay
        </button>
      </div>
    </AuthLayout>
  );
}
