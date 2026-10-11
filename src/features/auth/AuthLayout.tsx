import { ArrowLeft, BookOpen, Bot, CheckCircle2, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { RouteKey } from "../../types/models";

interface AuthLayoutProps {
  children: ReactNode;
  navigate: (route: RouteKey) => void;
  mode: "login" | "register";
}

export function AuthLayout({ children, navigate, mode }: AuthLayoutProps) {
  const isLogin = mode === "login";

  return (
    <div className="min-h-screen w-full bg-[#171c35] text-white font-sans flex flex-col justify-between relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Ambient Lighting & Pattern Overlay */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-blue-500/5 blur-[160px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* 1. Header Bar (Full width, seamless blue backdrop) */}
      <header className="relative z-20 w-full border-b border-white/10 bg-[#171c35]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("landing")}
            className="group flex items-center gap-3 text-left transition-opacity hover:opacity-95"
            aria-label="Về trang chủ BA-VES"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 font-display text-base font-extrabold text-white shadow-md shadow-blue-600/30 transition-transform group-hover:scale-105">
              B
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Josefin_Sans',sans-serif] text-lg font-bold tracking-tight text-white">
                  BA-VES
                </span>
                <span className="rounded-md border border-blue-400/30 bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                  FA26SE185
                </span>
              </div>
              <p className="text-[10px] text-white/60 hidden sm:block">
                Nền tảng mô phỏng doanh nghiệp đào tạo BA
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("landing")}
            className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-sm transition-all hover:border-blue-400 hover:bg-blue-600/20 hover:text-white"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1 text-blue-400" />
            Về trang chủ
          </button>
        </div>
      </header>

      {/* 2. Main Center Container: Cohesive Symmetrical Grid on All-Blue Background */}
      <main className="relative z-10 mx-auto my-auto w-full max-w-7xl px-6 py-6 sm:py-8 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          
          {/* Left Column: Visual & Academic Showcase */}
          <div className="hidden lg:flex flex-col justify-center bg-transparent !p-0">
            {/* Category Pill */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
              <Sparkles size={13} className="text-blue-400" />
              {isLogin ? "Chuẩn đào tạo IIBA BABOK® v3" : "Hệ sinh thái đào tạo Business Analyst"}
            </div>

            {/* Heading */}
            <h1 className="mt-4 font-['Josefin_Sans',sans-serif] text-2xl xl:text-3xl font-bold leading-snug tracking-tight text-white">
              {isLogin ? (
                <>
                  Không gian thực hành phân tích nghiệp vụ thực chiến với{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200 bg-clip-text text-transparent">
                    AI Stakeholders.
                  </span>
                </>
              ) : (
                <>
                  Chuẩn hóa năng lực phân tích nghiệp vụ cùng{" "}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200 bg-clip-text text-transparent">
                    doanh nghiệp ảo thông minh.
                  </span>
                </>
              )}
            </h1>

            <p className="mt-3 text-xs xl:text-sm leading-relaxed text-white/75 max-w-xl">
              {isLogin
                ? "Trải nghiệm phỏng vấn 12+ tác tử AI đại diện các bên liên quan, nhận diện yêu cầu ẩn, xử lý xung đột nghiệp vụ và nhận phản hồi rubric chi tiết."
                : "Khởi tạo tài khoản để thực hành 24 kịch bản quy trình thuộc 4 lĩnh vực: Bán lẻ, Ngân hàng, Y tế và Chuỗi cung ứng."}
            </p>

            {/* Visual Showcase Card */}
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#232846] shadow-xl backdrop-blur-sm">
              <div className="aspect-[16/9] max-h-[220px] w-full overflow-hidden bg-slate-900/50">
                <img
                  src={isLogin ? "/elevate/img/about/about-5.webp" : "/elevate/img/about/about-square-8.webp"}
                  alt="BA-VES Training Environment"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-102"
                />
              </div>
              <div className="p-3.5 bg-[#171c35]/95 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-white/90">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-600/30 text-blue-300">
                    {isLogin ? <Bot size={15} /> : <Trophy size={15} />}
                  </span>
                  <span>
                    <strong className="block text-white font-semibold text-xs">
                      {isLogin ? "Phỏng vấn Đa tác tử AI" : "Đánh giá Năng lực Tự động"}
                    </strong>
                    <span className="text-[11px] text-white/60">
                      {isLogin ? "Mô phỏng hội thoại ngữ cảnh thực tế" : "Chấm điểm rubric theo chuẩn quốc tế"}
                    </span>
                  </span>
                </div>
                <span className="rounded-md bg-blue-500/20 px-2.5 py-1 text-[11px] font-semibold text-blue-300 border border-blue-400/20">
                  BABOK® v3
                </span>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="mt-4 grid grid-cols-3 gap-2.5">
              <div className="rounded-xl border border-white/10 bg-[#232846]/70 p-2.5 text-left">
                <div className="flex items-center gap-1.5 text-blue-400 mb-0.5">
                  <BookOpen size={13} />
                  <span className="text-xs font-bold text-white">4 Lĩnh vực</span>
                </div>
                <p className="text-[11px] text-white/65 leading-tight">
                  Bán lẻ, Ngân hàng, Y tế & Chuỗi cung ứng
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#232846]/70 p-2.5 text-left">
                <div className="flex items-center gap-1.5 text-emerald-400 mb-0.5">
                  <CheckCircle2 size={13} />
                  <span className="text-xs font-bold text-white">24 Kịch bản</span>
                </div>
                <p className="text-[11px] text-white/65 leading-tight">
                  Tình huống thực tế có mâu thuẫn yêu cầu
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#232846]/70 p-2.5 text-left">
                <div className="flex items-center gap-1.5 text-indigo-400 mb-0.5">
                  <Users size={13} />
                  <span className="text-xs font-bold text-white">2 Vai trò</span>
                </div>
                <p className="text-[11px] text-white/65 leading-tight">
                  Học viên & Giảng viên chuyên biệt
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Harmonious Navy Form Card */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-[460px]">
              {/* Sleek Dark Navy Form Card matching Elevate --surface-color (#232846) */}
              <div className="relative rounded-2xl border border-white/10 bg-[#232846] p-6 sm:p-8 shadow-2xl backdrop-blur-md">
                {/* Subtle Top Blue Accent Line */}
                <div className="absolute top-0 inset-x-0 h-1 rounded-t-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400" />
                
                {children}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 3. Footer Bar (Seamless all-blue bottom) */}
      <footer className="relative z-20 w-full border-t border-white/10 bg-[#171c35]/80 py-3.5 text-center text-xs text-white/50 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between px-6 lg:px-8 gap-2">
          <span>© 2026 BA-VES (FA26SE185 • GFA26SE16). All rights reserved.</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate("landing")} className="hover:text-white transition-colors">
              Điều khoản dịch vụ
            </button>
            <span>•</span>
            <button type="button" onClick={() => navigate("landing")} className="hover:text-white transition-colors">
              Chính sách bảo mật
            </button>
            <span>•</span>
            <button type="button" onClick={() => navigate("landing")} className="hover:text-white transition-colors">
              Trợ giúp
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
