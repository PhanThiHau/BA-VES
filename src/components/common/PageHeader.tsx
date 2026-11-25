import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-2.5 flex flex-col justify-between gap-1.5 md:flex-row md:items-end">
      <div>
        {eyebrow && <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[.14em] text-slate">{eyebrow}</p>}
        <h1 className="text-lg font-extrabold tracking-tight text-navy sm:text-xl">{title}</h1>
        {description && <p className="mt-0.5 max-w-3xl text-xs text-slate leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
