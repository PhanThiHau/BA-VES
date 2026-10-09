import type { RouteKey } from "../../types/models";
import { Reveal } from "./Reveal";

interface CtaSectionProps {
  navigate: (route: RouteKey) => void;
}

export function CtaSection({ navigate }: CtaSectionProps) {
  return (
    <section id="cta" className="relative overflow-hidden bg-navy-deep py-28 text-white lg:py-36">
      <div aria-hidden="true" className="absolute inset-0">
        <img
          src="/images/landing/cta-warehouse.webp"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-navy-deep/95 via-navy-deep/85 to-navy-deep/60"
      />

      <div className="relative z-10 mx-auto max-w-[860px] px-6 text-center lg:px-10">
        <Reveal variant="up">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Chuyển hóa kiến thức BABOK thành <span className="text-brass">năng lực thực chiến</span>.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-mist/85 sm:text-lg">
            Bắt đầu với kịch bản doanh nghiệp ảo, tương tác với các tác tử AI và xây dựng hồ sơ phân tích nghiệp vụ chuẩn mực có thể kiểm chứng.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate("register")}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-navy transition-colors hover:bg-offwhite"
            >
              Tạo tài khoản học viên
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </button>
            <button
              type="button"
              onClick={() => navigate("login")}
              className="rounded-full border border-white/40 px-7 py-3.5 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10"
            >
              Đăng nhập hệ thống
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}