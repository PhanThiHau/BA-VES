import type { RouteKey } from "../../types/models";
import { workspacePoints } from "./data";
import { Reveal } from "./Reveal";
import { Photo } from "./Photo";
import { Eyebrow } from "./primitives";

interface WorkspacesSectionProps {
  navigate: (route: RouteKey) => void;
}

export function WorkspacesSection({ navigate }: WorkspacesSectionProps) {
  return (
    <section id="workspaces" className="scroll-mt-20 bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow tone="brass">Hai không gian làm việc đồng bộ</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl">
              Thực hành nghiệp vụ. Đánh giá bằng chứng.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate sm:text-lg">
              Học viên làm bài tập trọn vẹn trong môi trường tương tác. Giảng viên kiểm tra lập luận đằng sau mỗi hồ sơ và theo dõi tiến độ năng lực.
            </p>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Reveal variant="left" className="flex">
            <article className="flex w-full flex-col overflow-hidden rounded-3xl border border-slate/15 bg-offwhite">
              <Photo
                src="/images/landing/workspace-learner.webp"
                alt="Learners collaborating on a business analysis workspace"
                ratio="aspect-[16/10]"
              />
              <div className="flex flex-1 flex-col p-8 lg:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brass">Không gian học viên</p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-navy lg:text-3xl">
                  Thực hành vai trò BA thực thụ.
                </h3>
                <p className="mt-4 leading-relaxed text-slate">
                  Thực hiện kịch bản từ đầu đến cuối mà không có kịch bản mẫu định sẵn, được đánh giá dựa trên lập luận và bằng chứng thu thập.
                </p>
                <ul className="mt-6 space-y-3">
                  {workspacePoints.learner.map((point) => (
                    <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-navy">
                      <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-brass" />
                      {point}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => navigate("register")}
                  className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full border-2 border-navy px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white"
                >
                  Đăng ký tài khoản học viên
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </article>
          </Reveal>

          <Reveal variant="right" delay={100} className="flex">
            <article className="flex w-full flex-col overflow-hidden rounded-3xl bg-navy-deep text-white">
              <div className="relative">
                <img
                  src="/images/landing/workspace-instructor.webp"
                  alt="Instructors reviewing evidence and submissions together"
                  loading="lazy"
                  decoding="async"
                  className="aspect-[16/10] h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/50 to-transparent" aria-hidden="true" />
              </div>
              <div className="flex flex-1 flex-col p-8 lg:p-10">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-brass">Không gian giảng viên</p>
                <h3 className="mt-3 font-display text-2xl font-bold tracking-tight lg:text-3xl">
                  Kiểm tra bằng chứng. Hiệu chuẩn đánh giá.
                </h3>
                <p className="mt-4 leading-relaxed text-mist/80">
                  Xem chuỗi bằng chứng phỏng vấn của học viên, kích hoạt sự kiện kịch bản và theo dõi tiến độ năng lực chuẩn BABOK.
                </p>
                <ul className="mt-6 space-y-3">
                  {workspacePoints.instructor.map((point) => (
                    <li key={point} className="flex gap-3 text-[15px] leading-relaxed text-mist/90">
                      <span aria-hidden="true" className="mt-2.5 h-px w-5 shrink-0 bg-brass" />
                      {point}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => navigate("login")}
                  className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-navy transition-colors hover:bg-offwhite"
                >
                  Vào không gian giảng viên
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}