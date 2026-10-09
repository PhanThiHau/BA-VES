import { ArrowRight, BarChart3, BookOpenCheck, Bot, CheckCircle2, GraduationCap, Layers3, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";

export function RoleSelectionPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { setRole, setSelectedDomainId } = useApp();
  const enterLearner = () => {
    setRole("learner");
    setSelectedDomainId("all");
    navigate("dashboard");
  };
  const enterInstructor = () => {
    setRole("instructor");
    navigate("instructor");
  };

  return (
    <main className="relative min-h-[100dvh] bg-navy-deep text-white overflow-hidden font-sans selection:bg-brass/25 selection:text-white">
      {/* Background Image & Atmospheric Gradients */}
      <div className="absolute inset-0 opacity-20 mix-blend-luminosity pointer-events-none" aria-hidden="true">
        <img
          src="/images/landing/hero.webp"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brass/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] rounded-full bg-mist/10 blur-[150px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent)] pointer-events-none" />

      <div className="relative z-10 mx-auto grid min-h-[100dvh] max-w-[1536px] lg:grid-cols-[1fr_1.2fr]">
        {/* Left Section - Brand & Philosophy */}
        <section className="flex flex-col justify-between p-8 sm:p-12 lg:p-20">
          <div>
            <button
              onClick={() => navigate("landing")}
              className="group flex items-center gap-3.5 text-left transition-opacity hover:opacity-90"
              aria-label="Về trang chủ BA-VES"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-white font-display text-xl font-extrabold text-navy shadow-lg transition-transform group-hover:scale-105">
                B
              </span>
              <span>
                <span className="flex items-center gap-2">
                  <span className="block font-display text-xl font-extrabold tracking-tight text-white">
                    BA-VES
                  </span>
                  <span className="rounded-full bg-brass/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brass">
                    FA26SE185
                  </span>
                </span>
                <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-mist/80">
                  Mô phỏng BA Đa tác tử AI
                </span>
              </span>
            </button>

            <div className="mt-20">
              <p className="flex w-fit items-center gap-2 rounded-full border border-brass/30 bg-brass/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brass backdrop-blur-md">
                <Sparkles size={14} />
                Không gian làm việc chuyên biệt
              </p>
              <h1 className="mt-6 max-w-xl font-display text-[clamp(2.4rem,4.8vw,4.6rem)] font-extrabold leading-[1.05] tracking-tight">
                Một doanh nghiệp ảo.<br />
                <span className="text-brass">Hai góc nhìn thực chiến.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-mist/85">
                Thực hành phân tích yêu cầu trong môi trường doanh nghiệp giả lập trung thực, hoặc điều hành và theo dõi toàn bộ hoạt động đào tạo từ trung tâm kiểm soát giảng viên.
              </p>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            <div className="flex flex-col gap-1">
              <strong className="font-display text-3xl font-bold tracking-tight text-white">04</strong>
              <span className="text-xs font-medium uppercase tracking-wider text-mist/70">Lĩnh vực nghiệp vụ</span>
            </div>
            <div className="flex flex-col gap-1">
              <strong className="font-display text-3xl font-bold tracking-tight text-white">24</strong>
              <span className="text-xs font-medium uppercase tracking-wider text-mist/70">Ứng dụng mô phỏng</span>
            </div>
            <div className="flex flex-col gap-1">
              <strong className="font-display text-3xl font-bold tracking-tight text-white">AI</strong>
              <span className="text-xs font-medium uppercase tracking-wider text-mist/70">Multi-Agent Stakeholders</span>
            </div>
          </div>
        </section>

        {/* Right Section - Role Cards */}
        <section className="relative flex flex-col justify-center p-8 sm:p-12 lg:p-20">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brass">Lựa chọn vai trò</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Bạn muốn bắt đầu ở đâu?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist/80">
              Mỗi không gian được thiết kế tỉ mỉ với bộ công cụ và luồng công việc tối ưu cho từng mục tiêu.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-5">
            {/* Learner Card */}
            <button
              onClick={enterLearner}
              className="group relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-1 text-left transition-all duration-300 hover:-translate-y-1 hover:border-brass/40 hover:bg-white/[0.07] hover:shadow-[0_20px_60px_rgba(197,139,82,0.15)] focus:outline-none focus:ring-2 focus:ring-brass/50 backdrop-blur-xl"
            >
              <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-brass/30 bg-brass/15 text-brass shadow-md transition-transform duration-300 group-hover:scale-105">
                  <GraduationCap size={30} strokeWidth={1.75} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <strong className="font-display text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-brass">
                      Không gian Học viên (Learner)
                    </strong>
                    <span className="rounded-full border border-brass/30 bg-brass/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brass">
                      Thực hành
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-mist/80">
                    Chọn kịch bản nghiệp vụ, phỏng vấn các tác tử AI đa vai trò, bóc tách bằng chứng và hoàn thiện hồ sơ đặc tả theo chuẩn BABOK®.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-mist/60">
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-mist">
                      <BookOpenCheck size={14} className="text-brass" /> Kịch bản thực chiến
                    </span>
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-mist">
                      <Bot size={14} className="text-brass" /> Tác tử AI phản hồi
                    </span>
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-mist">
                      <CheckCircle2 size={14} className="text-brass" /> Đánh giá minh chứng
                    </span>
                  </div>
                </div>

                <div className="hidden sm:grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-300 group-hover:bg-brass group-hover:text-navy group-hover:border-transparent">
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </button>

            {/* Instructor Card */}
            <button
              onClick={enterInstructor}
              className="group relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-1 text-left transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.07] hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-xl"
            >
              <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-md transition-transform duration-300 group-hover:scale-105">
                  <ShieldCheck size={30} strokeWidth={1.75} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <strong className="font-display text-2xl font-bold tracking-tight text-white transition-colors group-hover:text-mist">
                      Không gian Giảng viên (Instructor)
                    </strong>
                    <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-mist">
                      Quản trị
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-mist/80">
                    Cấu hình kịch bản đào tạo, phân bổ tác tử AI, theo dõi tiến độ lớp học và hiệu chuẩn bảng điểm đánh giá của học viên.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-mist/60">
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-mist">
                      <Layers3 size={14} className="text-mist" /> Quản lý kịch bản
                    </span>
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-mist">
                      <Users size={14} className="text-mist" /> Giám sát lớp học
                    </span>
                    <span className="flex items-center gap-1.5 transition-colors group-hover:text-mist">
                      <BarChart3 size={14} className="text-mist" /> Phân tích & Hiệu chuẩn
                    </span>
                  </div>
                </div>

                <div className="hidden sm:grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition-all duration-300 group-hover:bg-white group-hover:text-navy group-hover:border-transparent">
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          </div>

          <div className="mt-10 flex items-center justify-between text-xs text-mist/60">
            <button
              onClick={() => navigate("landing")}
              className="inline-flex items-center gap-1.5 text-mist/80 hover:text-white transition-colors"
            >
              ← Quay lại trang chủ
            </button>
            <span>Dữ liệu kịch bản: Chuỗi cung ứng & Quản lý kho</span>
          </div>
        </section>
      </div>
    </main>
  );
}
