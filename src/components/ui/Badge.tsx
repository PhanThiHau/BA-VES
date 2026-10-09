import type { ReactNode } from "react";
import { classNames } from "../../utils/format";

export function Badge({ children, tone = "navy" }: { children: ReactNode; tone?: "navy" | "green" | "amber" | "red" | "gray" }) {
  const tones = { navy: "bg-[#eaf0f7] text-[#24466f]", green: "bg-[#e8f7ef] text-[#18794e]", amber: "bg-[#fff6df] text-[#91610d]", red: "bg-[#fff0f0] text-[#b42318]", gray: "bg-[#f1f4f7] text-[#66788d]" };
  return <span className={classNames("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}
