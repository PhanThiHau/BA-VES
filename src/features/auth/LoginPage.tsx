import { ArrowRight, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
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

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length < 6) nextErrors.password = "Password must contain at least 6 characters.";
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

  const useDemo = () => {
    setEmail(role === "learner" ? "user@gmail.com" : "user2@gmail.com");
    setPassword("123456");
    setErrors({});
  };

  return <AuthLayout navigate={navigate} mode="login">
    <div className="reveal-up">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-[#64829b]">Welcome back</p>
      <h2 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#17314d] sm:text-4xl">Sign in to BA-VES</h2>
      <p className="mt-3 leading-7 text-[#718498]">Continue your simulation or manage the training environment.</p>
    </div>

    <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl border border-[#dce5ec] bg-[#f1f5f8] p-1.5" role="radiogroup" aria-label="Account role">
      {(["learner", "instructor"] as AppRole[]).map((item) => { const Icon = item === "learner" ? GraduationCap : ShieldCheck; return <button key={item} type="button" role="radio" aria-checked={role === item} onClick={() => setLoginRole(item)} className={classNames("flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-bold capitalize transition", role === item ? "bg-white text-[#244d6d] shadow-sm" : "text-[#718498] hover:text-[#385b77]")}><Icon size={17}/>{item}</button>; })}
    </div>

    <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
      <label className="block"><span className="text-sm font-bold text-[#36516b]">Email address</span><span className={classNames("mt-2 flex min-h-13 items-center gap-3 rounded-2xl border bg-white px-4 transition focus-within:ring-4", errors.email ? "border-[#d99aa4] focus-within:border-[#b75d6c] focus-within:ring-[#f8e8eb]" : "border-[#d5e0e8] focus-within:border-[#7798b5] focus-within:ring-[#e5eff6]")}><Mail size={18} className="shrink-0 text-[#7890a5]"/><input value={email} onChange={(event) => { setEmail(event.target.value); setErrors(current => ({...current,email:undefined})); }} className="w-full bg-transparent text-sm text-[#29445f] outline-none placeholder:text-[#9aa8b5]" placeholder="name@company.com" autoComplete="email"/></span>{errors.email && <span className="mt-1.5 block text-xs font-medium text-[#aa4457]">{errors.email}</span>}</label>

      <label className="block"><span className="flex items-center justify-between"><span className="text-sm font-bold text-[#36516b]">Password</span><button type="button" className="text-xs font-bold text-[#4f7697] hover:text-[#2e5c80]">Forgot password?</button></span><span className={classNames("mt-2 flex min-h-13 items-center gap-3 rounded-2xl border bg-white px-4 transition focus-within:ring-4", errors.password ? "border-[#d99aa4] focus-within:border-[#b75d6c] focus-within:ring-[#f8e8eb]" : "border-[#d5e0e8] focus-within:border-[#7798b5] focus-within:ring-[#e5eff6]")}><LockKeyhole size={18} className="shrink-0 text-[#7890a5]"/><input value={password} onChange={(event) => { setPassword(event.target.value); setErrors(current => ({...current,password:undefined})); }} type={showPassword ? "text" : "password"} className="w-full bg-transparent text-sm text-[#29445f] outline-none placeholder:text-[#9aa8b5]" placeholder="Enter your password" autoComplete="current-password"/><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="text-[#71879a] hover:text-[#355f80]">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></span>{errors.password && <span className="mt-1.5 block text-xs font-medium text-[#aa4457]">{errors.password}</span>}</label>

      <div className="flex flex-wrap items-center justify-between gap-3"><label className="flex items-center gap-2 text-sm text-[#63788c]"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded accent-[#315f84]"/>Keep me signed in</label><button type="button" onClick={useDemo} className="text-xs font-bold text-[#4c7596] hover:text-[#2d5c80]">Use demo account</button></div>

      <button type="submit" disabled={submitting} className="group inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#285d82] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(40,93,130,.22)] transition hover:-translate-y-0.5 hover:bg-[#214f70] disabled:cursor-wait disabled:opacity-70">{submitting ? "Signing in…" : <>Sign in <ArrowRight size={16} className="transition group-hover:translate-x-1"/></>}</button>
    </form>

    <div className="mt-7 flex items-center gap-3"><span className="h-px flex-1 bg-[#dfe7ed]"/><span className="text-xs text-[#8b9aa8]">New to BA-VES?</span><span className="h-px flex-1 bg-[#dfe7ed]"/></div>
    <button onClick={() => navigate("register")} className="mt-5 min-h-12 w-full rounded-2xl border border-[#cbd9e4] bg-white text-sm font-bold text-[#315978] transition hover:-translate-y-0.5 hover:border-[#91abc0] hover:shadow-sm">Create an account</button>
    <p className="mt-6 text-center text-xs leading-5 text-[#8a99a7]">Instructor access may require approval from your BA-VES program administrator.</p>
  </AuthLayout>;
}
