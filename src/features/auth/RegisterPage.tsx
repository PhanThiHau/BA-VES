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
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [created, setCreated] = useState(false);
  const strength = useMemo(() => [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length, [password]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: RegisterErrors = {};
    if (name.trim().length < 2) next.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirm !== password) next.confirm = "Passwords do not match.";
    if (!terms) next.terms = "You must accept the terms to continue.";
    setErrors(next);
    if (!Object.keys(next).length) setCreated(true);
  };

  if (created) return <AuthLayout navigate={navigate} mode="register"><div className="reveal-up text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#e4f3eb] text-[#2f7a5b]"><CheckCircle2 size={31}/></span><p className="mt-7 text-xs font-bold uppercase tracking-[.16em] text-[#64829b]">Account created</p><h2 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#17314d]">Welcome to BA-VES, {name.split(" ")[0]}.</h2><p className="mx-auto mt-4 max-w-md leading-7 text-[#718498]">{role === "learner" ? "Your learner workspace is ready. Sign in to choose a domain and begin your first enterprise scenario." : "Your instructor request has been recorded. You can sign in after a program administrator approves access."}</p><button onClick={() => navigate("login")} className="mt-8 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#285d82] px-5 text-sm font-bold text-white">Continue to sign in <ArrowRight size={16}/></button></div></AuthLayout>;

  const inputFrame = (error?: string) => classNames("mt-2 flex min-h-13 items-center gap-3 rounded-2xl border bg-white px-4 transition focus-within:ring-4", error ? "border-[#d99aa4] focus-within:border-[#b75d6c] focus-within:ring-[#f8e8eb]" : "border-[#d5e0e8] focus-within:border-[#7798b5] focus-within:ring-[#e5eff6]");
  return <AuthLayout navigate={navigate} mode="register">
    <div className="reveal-up"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#64829b]">Create your account</p><h2 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#17314d] sm:text-4xl">Join the virtual enterprise</h2><p className="mt-3 leading-7 text-[#718498]">Set up your workspace and start building evidence of your BA practice.</p></div>

    <div className="mt-7 grid grid-cols-2 gap-2 rounded-2xl border border-[#dce5ec] bg-[#f1f5f8] p-1.5" role="radiogroup" aria-label="Registration role">
      {(["learner", "instructor"] as AppRole[]).map((item) => { const Icon = item === "learner" ? GraduationCap : ShieldCheck; return <button key={item} type="button" role="radio" aria-checked={role === item} onClick={() => setRole(item)} className={classNames("rounded-xl p-3 text-left transition", role === item ? "bg-white text-[#244d6d] shadow-sm" : "text-[#718498]")}><span className="flex items-center gap-2 text-sm font-bold capitalize"><Icon size={17}/>{item}</span><span className="mt-1 block pl-6 text-[11px] font-medium text-[#8594a2]">{item === "learner" ? "Start practising now" : "Approval required"}</span></button>; })}
    </div>

    <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-sm font-bold text-[#36516b]">Full name</span><span className={inputFrame(errors.name)}><UserRound size={17} className="text-[#7890a5]"/><input value={name} onChange={(event) => {setName(event.target.value);setErrors(current=>({...current,name:undefined}));}} className="w-full bg-transparent text-sm outline-none" placeholder="Your full name" autoComplete="name"/></span>{errors.name && <span className="mt-1 block text-xs text-[#aa4457]">{errors.name}</span>}</label><label className="block"><span className="text-sm font-bold text-[#36516b]">Organization <span className="font-normal text-[#8a99a7]">(optional)</span></span><span className={inputFrame()}><ShieldCheck size={17} className="text-[#7890a5]"/><input value={organization} onChange={(event)=>setOrganization(event.target.value)} className="w-full bg-transparent text-sm outline-none" placeholder="University or company"/></span></label></div>
      <label className="block"><span className="text-sm font-bold text-[#36516b]">Email address</span><span className={inputFrame(errors.email)}><Mail size={17} className="text-[#7890a5]"/><input value={email} onChange={(event)=>{setEmail(event.target.value);setErrors(current=>({...current,email:undefined}));}} className="w-full bg-transparent text-sm outline-none" placeholder="name@company.com" autoComplete="email"/></span>{errors.email && <span className="mt-1 block text-xs text-[#aa4457]">{errors.email}</span>}</label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="text-sm font-bold text-[#36516b]">Password</span><span className={inputFrame(errors.password)}><LockKeyhole size={17} className="text-[#7890a5]"/><input value={password} onChange={(event)=>{setPassword(event.target.value);setErrors(current=>({...current,password:undefined}));}} type={showPassword?"text":"password"} className="w-full bg-transparent text-sm outline-none" placeholder="At least 8 characters" autoComplete="new-password"/><button type="button" onClick={()=>setShowPassword(value=>!value)} className="text-[#71879a]" aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span>{errors.password && <span className="mt-1 block text-xs text-[#aa4457]">{errors.password}</span>}</label><label className="block"><span className="text-sm font-bold text-[#36516b]">Confirm password</span><span className={inputFrame(errors.confirm)}><LockKeyhole size={17} className="text-[#7890a5]"/><input value={confirm} onChange={(event)=>{setConfirm(event.target.value);setErrors(current=>({...current,confirm:undefined}));}} type={showPassword?"text":"password"} className="w-full bg-transparent text-sm outline-none" placeholder="Repeat password" autoComplete="new-password"/></span>{errors.confirm && <span className="mt-1 block text-xs text-[#aa4457]">{errors.confirm}</span>}</label></div>

      <div><div className="flex gap-1.5">{[1,2,3,4].map(level=><span key={level} className={classNames("h-1.5 flex-1 rounded-full",level<=strength ? strength<3?"bg-[#d59a38]":"bg-[#3f8a69]":"bg-[#e3e9ee]")}/>)}</div><div className="mt-2 grid gap-x-3 gap-y-1 text-[11px] text-[#7d8e9d] sm:grid-cols-2">{[[password.length>=8,"8+ characters"],[/[A-Z]/.test(password),"One uppercase letter"],[/[0-9]/.test(password),"One number"],[/[^A-Za-z0-9]/.test(password),"One special character"]].map(([valid,label])=><span key={String(label)} className={classNames("flex items-center gap-1.5",valid&&"text-[#34745b]")}><span className={classNames("grid h-3.5 w-3.5 place-items-center rounded-full border",valid?"border-[#4b9172] bg-[#e5f3ec]":"border-[#c8d3dc]")}>{valid&&<Check size={9}/>}</span>{String(label)}</span>)}</div></div>

      {role === "instructor" && <div className="rounded-xl border border-[#eadfc9] bg-[#fffaf1] p-3 text-xs leading-5 text-[#75694f]">Instructor accounts require approval because they can configure scenarios, observe sessions, and moderate learner assessments.</div>}
      <label className="flex items-start gap-3 text-sm leading-6 text-[#63788c]"><input type="checkbox" checked={terms} onChange={(event)=>{setTerms(event.target.checked);setErrors(current=>({...current,terms:undefined}));}} className="mt-1 h-4 w-4 shrink-0 accent-[#315f84]"/><span>I agree to the <button type="button" className="font-bold text-[#4a7293]">Terms of Use</button> and <button type="button" className="font-bold text-[#4a7293]">Privacy Policy</button>.</span></label>{errors.terms && <p className="-mt-2 text-xs text-[#aa4457]">{errors.terms}</p>}
      <button type="submit" className="group inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#285d82] px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(40,93,130,.22)] transition hover:-translate-y-0.5">Create {role} account <ArrowRight size={16} className="transition group-hover:translate-x-1"/></button>
    </form>
    <p className="mt-6 text-center text-sm text-[#74879a]">Already have an account? <button onClick={()=>navigate("login")} className="font-bold text-[#376688] hover:text-[#244f70]">Sign in</button></p>
  </AuthLayout>;
}
