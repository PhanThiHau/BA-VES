import { ArrowLeft, Bot, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import type { RouteKey } from "../../types/models";

interface AuthLayoutProps {
  children: ReactNode;
  navigate: (route: RouteKey) => void;
  mode: "login" | "register";
}

/**
 * Interactive canvas background: renders an animated neural constellation of
 * enterprise simulation nodes drifting and dynamically connecting to each other
 * and to the user's cursor.
 */
function InteractiveNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const mouse = { x: -1000, y: -1000, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const particleCount = Math.min(Math.floor((width * height) / 24000), 50);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 2 + 1,
      baseAlpha: Math.random() * 0.4 + 0.3,
      isBrass: Math.random() > 0.4,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.18;
            ctx.strokeStyle = p1.isBrass
              ? `rgba(197, 139, 82, ${alpha})`
              : `rgba(216, 229, 238, ${alpha * 0.8})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Connection to mouse
        if (mouse.active) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 150) {
            const alpha = (1 - mdist / 150) * 0.4;
            ctx.strokeStyle = `rgba(197, 139, 82, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle points
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = p.isBrass
          ? `rgba(197, 139, 82, ${p.baseAlpha})`
          : `rgba(216, 229, 238, ${p.baseAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-75"
      aria-hidden="true"
    />
  );
}

export function AuthLayout({ children, navigate, mode }: AuthLayoutProps) {
  // Select imagery matching the flow
  const showcaseImage =
    mode === "login"
      ? "/images/landing/workspace-learner.webp"
      : "/images/landing/theme-stakeholders.webp";

  const showcaseSubtitle =
    mode === "login"
      ? "Không gian thực hành phân tích yêu cầu với AI Stakeholders"
      : "Trải nghiệm mô phỏng quy trình nghiệp vụ chuẩn BABOK®";

  return (
    <main className="relative min-h-[100dvh] bg-navy-deep text-white font-sans selection:bg-brass/25 selection:text-white flex flex-col justify-between overflow-x-hidden">
      
      {/* 1. Underlying Backdrop */}
      <div className="absolute inset-0 opacity-15 mix-blend-luminosity pointer-events-none" aria-hidden="true">
        <img
          src="/images/landing/hero.webp"
          alt=""
          className="h-full w-full object-cover scale-105"
        />
      </div>

      {/* 2. Interactive Canvas Dynamic Particle Mesh */}
      <InteractiveNetworkBackground />

      {/* 3. Subtle Ambient Light Orbs */}
      <div className="pointer-events-none absolute -left-24 top-1/4 h-[420px] w-[420px] rounded-full bg-brass/15 blur-[140px] animate-float-slow" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-[420px] w-[420px] rounded-full bg-mist/15 blur-[140px] animate-float-reverse" />
      <div className="pointer-events-none absolute left-1/2 -top-20 -translate-x-1/2 h-[300px] w-[550px] rounded-full bg-brass/10 blur-[150px]" />

      {/* 4. Deep Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/80 to-navy-deep/95" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-deep/90 via-transparent to-navy-deep/95" />

      {/* Top Header Bar */}
      <header className="relative z-20 w-full border-b border-white/10 bg-navy-deep/50 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("landing")}
            className="group flex items-center gap-3 text-left transition-all hover:opacity-90"
            aria-label="Về trang chủ BA-VES"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white font-display text-base font-extrabold text-navy shadow-md transition-transform group-hover:scale-105">
              B
            </span>
            <span className="flex items-center gap-2">
              <span className="block font-display text-lg font-extrabold tracking-tight text-white">
                BA-VES
              </span>
              <span className="rounded-full border border-brass/30 bg-brass/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brass">
                FA26SE185
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("landing")}
            className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold text-mist/90 backdrop-blur-sm transition-all hover:border-white/50 hover:bg-white/15 hover:text-white hover:-translate-x-0.5"
          >
            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            Về trang chủ
          </button>
        </div>
      </header>

      {/* Main Symmetrical 50/50 Area */}
      <div className="relative z-10 mx-auto my-auto w-full max-w-[1280px] px-6 py-6 sm:py-10 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          
          {/* Left Column: Visual Image Showcase (Lược bỏ bớt chữ, tập trung vào ảnh và thông điệp tinh tế) */}
          <section className="hidden lg:flex flex-col justify-center">
            
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-brass/30 bg-brass/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brass backdrop-blur-md">
              <Sparkles size={13} className="animate-pulse" />
              Virtual Enterprise Simulation
            </div>

            <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-4xl">
              Mô phỏng doanh nghiệp ảo cho{" "}
              <span className="text-brass">đào tạo Business Analysis thực chiến.</span>
            </h1>

            <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-mist/85">
              Khơi gợi yêu cầu với các tác tử AI đa vai trò, giải quyết mâu thuẫn nghiệp vụ và hoàn thiện hồ sơ BA chuẩn BABOK® v3.
            </p>

            {/* Featured Image Card with Glass Elements */}
            <div className="group relative mt-6 overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl transition-all duration-500 hover:border-brass/40">
              <div className="aspect-[16/10] w-full overflow-hidden">
                <img
                  src={showcaseImage}
                  alt="Không gian mô phỏng BA-VES"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Gradient Overlay for photo depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent pointer-events-none" />

              {/* Glass Info Pill on top of image */}
              <div className="absolute bottom-3.5 inset-x-3.5 flex items-center justify-between rounded-xl border border-white/15 bg-navy-deep/80 p-3 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brass/25 text-brass">
                    <Bot size={16} />
                  </span>
                  <div>
                    <strong className="block text-xs font-semibold text-white">
                      Mô phỏng Đa tác tử AI
                    </strong>
                    <span className="block text-[11px] text-mist/75">
                      {showcaseSubtitle}
                    </span>
                  </div>
                </div>
                <span className="rounded-md border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] font-medium text-mist">
                  BABOK®
                </span>
              </div>
            </div>

            {/* Concise Feature Pills (Tinh gọn thay cho 4 thẻ dài) */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs text-mist/90">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <Zap size={13} className="text-brass" /> Tác tử AI phản ứng linh hoạt
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                <CheckCircle2 size={13} className="text-emerald-400" /> Chuẩn BABOK® v3
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                🌐 4 Lĩnh vực nghiệp vụ
              </span>
            </div>
          </section>

          {/* Right Column: Clean, Elegant, Breathable Form Card */}
          <section className="flex flex-col items-center justify-center">
            <div className="w-full max-w-[460px]">
              {/* Outer Shell with Soft Ambient Light */}
              <div className="relative rounded-[28px] p-[1px] bg-gradient-to-b from-white/30 via-brass/20 to-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                
                {/* Form Card */}
                <div className="relative overflow-hidden rounded-[27px] bg-white p-7 sm:p-9 text-navy shadow-inner">
                  {/* Delicate Golden Top Accent Line */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brass to-transparent animate-glow-line" />
                  
                  {/* Form Component */}
                  <div className="relative z-10">
                    {children}
                  </div>
                </div>

              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Symmetrical Bottom Footer */}
      <footer className="relative z-20 w-full border-t border-white/10 bg-navy-deep/50 py-3.5 text-center text-xs text-mist/60 backdrop-blur-md">
        © {new Date().getFullYear()} BA-VES · Virtual Enterprise Simulation for Business Analysis
      </footer>
    </main>
  );
}
