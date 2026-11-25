import { Fragment, type ReactNode } from "react";
import { classNames } from "../../utils/format";

/** Chuẩn hóa khối text dày thành nhiều dòng (dùng cho textarea / lưu tạm). */
export function normalizeMultilineText(raw?: string | null): string {
  return toReadableLines(raw || "").join("\n");
}

/** Tách thành từng dòng/mục dễ đọc: 1) 2), 1. 2., bullet, bảng markdown, yêu cầu… */
export function toReadableLines(raw: string): string[] {
  const text = (raw || "").replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  // Đã có xuống dòng: vẫn tách thêm từng dòng đặc nếu còn dính 1) 2)
  const base = text.includes("\n")
    ? text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .flatMap((line) => splitDenseLine(line))
    : splitDenseLine(text);

  return mergeOrphanListMarkers(base);
}

/** Ghép "1." / "2)" đứng một mình với dòng kế tiếp (lỗi tách câu cũ). */
function mergeOrphanListMarkers(lines: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    const next = lines[i + 1];
    if (next && /^\d+[.)]$/.test(cur)) {
      out.push(`${cur} ${next}`);
      i += 1;
      continue;
    }
    // "1.Giai đoạn" thiếu khoảng trắng
    if (/^\d+[.)]\S/.test(cur)) {
      out.push(cur.replace(/^(\d+[.)])/, "$1 "));
      continue;
    }
    out.push(cur);
  }
  return out;
}

/** Dùng cho list đánh số (Expert A4 / UI). */
export function toListItems(value?: string | null): string[] {
  const lines = toReadableLines(value || "");
  if (lines.length <= 1) {
    const only = lines[0] || "";
    if (!only) return [];
    return [stripListMarker(only)];
  }
  return lines.map(stripListMarker).filter(Boolean);
}

function stripListMarker(line: string): string {
  return line
    .replace(/^\s*(?:\d+[.)]\s+|[-•*]\s+)/, "")
    .replace(/^\*\*|\*\*$/g, "")
    .trim();
}

function splitDenseLine(line: string): string[] {
  const trimmed = line.trim();
  if (!trimmed) return [];

  // Markdown table phẳng: "...: | a | b || --- || c | d | ngoài phạm vi..."
  if (trimmed.includes("|") && (trimmed.match(/\|/g) || []).length >= 3) {
    return splitMarkdownTableBlob(trimmed);
  }

  // "…: 1. ... 2. ... 3. ..." hoặc "1) ... 2) ..." — giữ số dính với nội dung mục
  if (/(?:^|\s)\d+[.)]\s+\S/.test(trimmed) && (trimmed.match(/(?:^|\s)\d+[.)]\s+/g) || []).length >= 2) {
    const firstMarker = trimmed.search(/(?:^|\s)\d+[.)]\s+\S/);
    const intro =
      firstMarker > 0
        ? trimmed.slice(0, firstMarker).trim()
        : "";
    const listBlob = (firstMarker > 0 ? trimmed.slice(firstMarker) : trimmed).trim();
    const parts = listBlob
      .split(/(?=(?:^|\s)\d+[.)]\s+\S)/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => p.replace(/^\s+/, ""));
    if (parts.length >= 2) {
      return intro ? [intro, ...parts] : parts;
    }
  }

  // "- A. - B." hoặc "• A • B"
  if (/(?:^|\s)[-•]\s+\S/.test(trimmed) && (trimmed.match(/(?:^|\s)[-•]\s+/g) || []).length > 1) {
    return trimmed
      .split(/(?=(?:^|\s)[-•]\s+)/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => (p.startsWith("-") || p.startsWith("•") ? p : `• ${p}`));
  }

  // "Yêu cầu learner (...): A; B; C — ghi chú"
  const reqMatch = trimmed.match(/^(.*?Yêu cầu[^:]{0,80}:)\s*(.+)$/i);
  if (reqMatch) {
    const intro = reqMatch[1].trim();
    const rest = reqMatch[2].trim();
    const [tasksPart, ...noteParts] = rest.split(/\s+[—–]\s+/);
    const tasks = (tasksPart || "")
      .split(/\s*;\s*/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("•") || t.startsWith("-") ? t : `• ${t}`));
    const notes = noteParts
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => (n.startsWith("•") || n.startsWith("-") ? n : `• ${n}`));
    return [intro, ...tasks, ...notes].filter(Boolean);
  }

  // "Mỗi thứ Hai sáng: 1. ... 2. ... 3. ..."
  const stepIntro = trimmed.match(/^(.+?:)\s*((?:(?:\d+\.\s+).+))$/);
  if (stepIntro && /\d+\.\s+\S/.test(stepIntro[2])) {
    const intro = stepIntro[1].trim();
    const steps = stepIntro[2]
      .split(/(?=\d+\.\s+)/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (steps.length > 1) return [intro, ...steps];
  }

  // Câu kết thúc bằng . ! ? — KHÔNG tách sau số thứ tự "1." / "2."
  const sentences = trimmed
    .split(/(?<=(?<!\d)[.!?…])\s+(?=(?:\*\*)?[A-ZÀ-ỸÀ-ỹ])/u)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length > 1) {
    return sentences.flatMap((s) => {
      if (/(?:^|\s)\d+[.)]\s+\S/.test(s) && (s.match(/(?:^|\s)\d+[.)]\s+/g) || []).length > 1) {
        const firstMarker = s.search(/(?:^|\s)\d+[.)]\s+\S/);
        const head = firstMarker > 0 ? s.slice(0, firstMarker).trim() : "";
        const blob = (firstMarker > 0 ? s.slice(firstMarker) : s).trim();
        const parts = blob
          .split(/(?=(?:^|\s)\d+[.)]\s+\S)/)
          .map((p) => p.trim())
          .filter(Boolean);
        return head ? [head, ...parts] : parts;
      }
      return [s];
    });
  }

  // Danh sách ngăn bằng ;
  if (trimmed.includes(";") && (trimmed.match(/;/g) || []).length >= 1) {
    const chunks = trimmed
      .split(/\s*;\s*/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (chunks.length > 1) {
      return chunks.map((s, idx) => (idx === 0 || s.startsWith("•") || s.startsWith("-") || /^\d+[.)]/.test(s) ? s : `• ${s}`));
    }
  }

  return [trimmed];
}

function splitMarkdownTableBlob(text: string): string[] {
  const firstPipe = text.indexOf("|");
  const intro = text.slice(0, firstPipe).trim();
  let rest = text.slice(firstPipe).trim();

  // Phần sau bảng (không còn |)
  let trailing = "";
  // Tách trailing nếu có câu sau khi hết bảng (ký tự không phải | sau cụm bảng)
  const trailingMatch = rest.match(/^(.*?\|)\s+([^|].*)$/);
  if (trailingMatch && !trailingMatch[2].includes("|")) {
    rest = trailingMatch[1].trim();
    trailing = trailingMatch[2].trim();
  } else {
    // "|| Ngoài phạm vi: ..." — row cuối không phải table
    const outMatch = rest.match(/^(.*\|)\s*((?:Ngoài phạm vi|Out of scope|Ghi chú|Note)[:：].*)$/i);
    if (outMatch) {
      rest = outMatch[1].trim();
      trailing = outMatch[2].trim();
    }
  }

  // Hàng ngăn bằng ||
  const rawRows = rest
    .split(/\|\|/)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => (r.startsWith("|") ? r : `|${r}`))
    .map((r) => (r.endsWith("|") ? r : `${r}|`));

  const lines: string[] = [];
  if (intro) lines.push(intro);

  for (const row of rawRows) {
    const cells = row
      .split("|")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    if (cells.length === 0) continue;
    // Bỏ hàng separator ---
    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) {
      lines.push("—");
      continue;
    }
    lines.push(cells.join(" · "));
  }

  if (trailing) lines.push(trailing);
  return lines.length > 0 ? lines : [text];
}

/** Render `**bold**` thành <strong>. */
export function renderInlineMarkdown(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) {
      return (
        <strong key={i} className="font-semibold text-navy">
          {bold[1]}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function isTableBlock(lines: string[]): boolean {
  // Intro + header + separator "—" + data rows
  const sepIdx = lines.findIndex((l) => l === "—");
  return sepIdx > 0 && lines.some((l) => l.includes(" · "));
}

function renderAsTable(lines: string[], lineClassName?: string): ReactNode {
  const sepIdx = lines.findIndex((l) => l === "—");
  const before = sepIdx >= 0 ? lines.slice(0, sepIdx) : lines.slice(0, 1);
  const headerLine = before[before.length - 1];
  const introLines = before.slice(0, -1);
  const dataLines = (sepIdx >= 0 ? lines.slice(sepIdx + 1) : lines.slice(1)).filter((l) => l.includes(" · "));
  const trailing = (sepIdx >= 0 ? lines.slice(sepIdx + 1) : lines.slice(1)).filter((l) => !l.includes(" · "));

  const headers = (headerLine || "").split(" · ").map((h) => h.trim());
  const rows = dataLines.map((row) => row.split(" · ").map((c) => c.trim()));

  return (
    <div className="space-y-2">
      {introLines.map((line, i) => (
        <p key={`i-${i}`} className={classNames("text-xs leading-5 text-slate", lineClassName)}>
          {renderInlineMarkdown(line)}
        </p>
      ))}
      {headers.length > 0 && rows.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate/20">
          <table className="w-full min-w-[240px] border-collapse text-left text-[11px]">
            <thead>
              <tr className="bg-offwhite/80">
                {headers.map((h) => (
                  <th key={h} className="border-b border-slate/20 px-2.5 py-1.5 font-bold text-navy">
                    {renderInlineMarkdown(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-slate/10 last:border-0">
                  {headers.map((_, ci) => (
                    <td key={ci} className="px-2.5 py-1.5 text-navy/90">
                      {renderInlineMarkdown(row[ci] || "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {trailing.map((line, i) => (
        <p key={`t-${i}`} className={classNames("text-xs leading-5 text-slate", lineClassName)}>
          {renderInlineMarkdown(line)}
        </p>
      ))}
    </div>
  );
}

export function ReadableProse({
  text,
  className,
  lineClassName,
}: {
  text?: string | null;
  className?: string;
  lineClassName?: string;
}) {
  const lines = toReadableLines(text || "");
  if (lines.length === 0) return null;

  if (isTableBlock(lines)) {
    return <div className={classNames(className)}>{renderAsTable(lines, lineClassName)}</div>;
  }

  return (
    <div className={classNames("space-y-1.5", className)}>
      {lines.map((line, i) => {
        const numbered = line.match(/^(\d+[.)])\s+(.+)$/);
        if (numbered) {
          return (
            <div
              key={`${i}-${line.slice(0, 24)}`}
              className={classNames("flex gap-2 text-xs leading-5 text-slate", lineClassName)}
            >
              <span className="shrink-0 font-bold text-navy">{numbered[1]}</span>
              <span className="min-w-0 flex-1">{renderInlineMarkdown(numbered[2])}</span>
            </div>
          );
        }
        return (
          <p
            key={`${i}-${line.slice(0, 24)}`}
            className={classNames("text-xs leading-5 text-slate", lineClassName)}
          >
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}
