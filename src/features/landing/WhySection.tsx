import { whyPrinciples } from "./data";
import { Reveal } from "./Reveal";
import { Photo } from "./Photo";
import { Eyebrow } from "./primitives";

export function WhySection() {
  return (
    <section id="why" className="scroll-mt-20 bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal variant="left" className="lg:col-span-6">
            <Photo
              src="/images/landing/why-baves.webp"
              alt="Business analysis practised in a real working environment"
              ratio="aspect-[4/5]"
              className="rounded-2xl shadow-2xl"
            />
          </Reveal>

          <div className="lg:col-start-8 lg:col-span-5">
            <Reveal variant="up" delay={80}>
              <Eyebrow tone="brass">Mục tiêu & Tầm nhìn BA-VES</Eyebrow>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-navy sm:text-4xl lg:text-5xl">
                Vượt lên trên lý thuyết phân tích thông thường.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate sm:text-lg">
                Khung lý thuyết liệt kê các bước, nhưng không dạy cách xử lý xung đột hay biến động thực tế. BA-VES tạo môi trường để học viên thực hành công việc thực sự: đối thoại với tác tử AI, kiểm chứng bằng chứng và bảo vệ quyết định bằng hồ sơ BA chuẩn mực.
              </p>

              <ol className="mt-10">
                {whyPrinciples.map((item, i) => (
                  <li
                    key={item.index}
                    className={`flex gap-6 border-t border-slate/15 py-5 ${i === whyPrinciples.length - 1 ? "border-b" : ""}`}
                  >
                    <span className="font-display text-sm font-extrabold text-brass">{item.index}</span>
                    <p className="text-[15px] font-medium leading-relaxed text-navy">{item.text}</p>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}