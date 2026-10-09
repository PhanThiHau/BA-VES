import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end"><div>{eyebrow && <p className="mb-1.5 text-xs font-bold uppercase tracking-[.16em] text-[#6c86a3]">{eyebrow}</p>}<h1 className="text-2xl font-bold tracking-[-.03em] text-[#152b46] sm:text-[1.75rem]">{title}</h1>{description && <p className="mt-2 max-w-3xl text-sm leading-6 text-[#6b7d91] sm:text-base">{description}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>;
}
