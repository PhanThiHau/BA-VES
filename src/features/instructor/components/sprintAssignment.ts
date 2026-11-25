export type SprintDurationUnit = "days" | "weeks";

export interface SprintPlan {
  sprintNo: number;
  focus: string;
  /** Độ dài sprint kể từ lúc bắt đầu mô phỏng (sprint 1) hoặc sau khi sprint trước kết thúc. */
  durationValue: number;
  durationUnit: SprintDurationUnit;
  templateCodes: string[];
}

const SPRINTS_SCHEMA = "baves.sprints.v1";
const DELIVERABLES_RE = /\s*\[Deliverables:\s*([^\]]+)\]\s*$/i;
/** Khớp "Sprint N:" cả giữa câu (seed starter: "... bên. Sprint 2: ..."). */
const SPRINT_HEADER_SOURCE =
  "\\bSprint\\s*(\\d+)\\s*" +
  "(?:\\|\\s*(?:Ends:\\s*(\\d{4}-\\d{2}-\\d{2}(?:[T ]\\d{2}:\\d{2}(?::\\d{2})?)?)|Duration:\\s*(\\d+)\\s*([dw]|days?|weeks?))?)?\\s*" +
  ":\\s*";

const DEFAULT_DURATION_VALUE = 1;
const DEFAULT_DURATION_UNIT: SprintDurationUnit = "weeks";

/** Deliverable mới theo sprint — mã khớp artifact templates DEL-01..08. */
export function defaultTemplateCodesForSprint(sprintNo: number): string[] {
  switch (sprintNo) {
    case 1:
      return ["DEL-02", "DEL-03"]; // BAP + Stakeholder Analysis
    case 2:
      return ["DEL-04", "DEL-05"]; // Elicitation Results + BRD
    case 3:
      return ["DEL-07"]; // SRS
    case 4:
      return ["DEL-08"]; // RTM
    default:
      return [];
  }
}

export function createSprintPlan(sprintNo: number, partial?: Partial<SprintPlan>): SprintPlan {
  return {
    sprintNo,
    focus: partial?.focus ?? "",
    durationValue:
      typeof partial?.durationValue === "number" && partial.durationValue > 0
        ? Math.floor(partial.durationValue)
        : DEFAULT_DURATION_VALUE,
    durationUnit: partial?.durationUnit === "days" ? "days" : DEFAULT_DURATION_UNIT,
    templateCodes: partial?.templateCodes ?? defaultTemplateCodesForSprint(sprintNo),
  };
}

export function emptySprintPlans(): SprintPlan[] {
  return [createSprintPlan(1)];
}

export function renumberSprints(sprints: SprintPlan[]): SprintPlan[] {
  return sprints.map((s, idx) => ({ ...s, sprintNo: idx + 1 }));
}

export function sprintDurationToDays(value: number, unit: SprintDurationUnit): number {
  const n = Math.max(1, Math.floor(value || 1));
  return unit === "weeks" ? n * 7 : n;
}

export function formatSprintDuration(value: number, unit: SprintDurationUnit): string {
  const n = Math.max(1, Math.floor(value || 1));
  if (unit === "weeks") return n === 1 ? "1 tuần" : `${n} tuần`;
  return n === 1 ? "1 ngày" : `${n} ngày`;
}

function headerRegex(): RegExp {
  return new RegExp(SPRINT_HEADER_SOURCE, "gi");
}

function parseDurationUnit(raw: string | undefined | null): SprintDurationUnit {
  const t = (raw || "").trim().toLowerCase();
  if (t.startsWith("d")) return "days";
  return "weeks";
}

function readDurationFromRow(row: Record<string, unknown>): {
  durationValue: number;
  durationUnit: SprintDurationUnit;
} {
  const unitRaw = row.durationUnit ?? row.unit;
  let durationUnit = parseDurationUnit(typeof unitRaw === "string" ? unitRaw : "weeks");
  let durationValue =
    typeof row.durationValue === "number"
      ? row.durationValue
      : typeof row.duration === "number"
        ? row.duration
        : DEFAULT_DURATION_VALUE;

  // Legacy absolute date → mặc định 1 tuần (không còn chọn ngày cố định).
  if ((!durationValue || durationValue <= 0) && typeof row.endsAt === "string" && row.endsAt.trim()) {
    durationValue = DEFAULT_DURATION_VALUE;
    durationUnit = DEFAULT_DURATION_UNIT;
  }

  if (!Number.isFinite(durationValue) || durationValue <= 0) {
    durationValue = DEFAULT_DURATION_VALUE;
  }

  return { durationValue: Math.floor(durationValue), durationUnit };
}

function tryParseJsonSprints(text: string): SprintPlan[] | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(trimmed) as
      | { schema?: string; sprints?: unknown[] }
      | unknown[];
    const arr = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.sprints)
        ? parsed.sprints
        : null;
    if (!arr || arr.length === 0) return null;
    return renumberSprints(
      arr.map((item, idx) => {
        const row = (item ?? {}) as Record<string, unknown>;
        const dur = readDurationFromRow(row);
        const codes = Array.isArray(row.templateCodes)
          ? row.templateCodes.map((c) => String(c).trim().toUpperCase()).filter(Boolean)
          : [];
        return createSprintPlan(idx + 1, {
          focus: typeof row.focus === "string" ? row.focus.trim() : "",
          durationValue: dur.durationValue,
          durationUnit: dur.durationUnit,
          templateCodes: codes,
        });
      })
    );
  } catch {
    return null;
  }
}

function parseLegacyText(text: string): SprintPlan[] {
  const headers = [...text.matchAll(headerRegex())];
  if (headers.length === 0) {
    return [createSprintPlan(1, { focus: text.trim() })];
  }

  const byNo = new Map<number, SprintPlan>();
  for (let i = 0; i < headers.length; i++) {
    const match = headers[i];
    const sprintNo = Number(match[1]);
    if (!Number.isFinite(sprintNo) || sprintNo < 1) continue;

    const contentStart = (match.index ?? 0) + match[0].length;
    const contentEnd = i + 1 < headers.length ? (headers[i + 1].index ?? text.length) : text.length;
    let body = text.slice(contentStart, contentEnd).trim().replace(/\s*[-•]\s*$/, "").trim();

    let templateCodes: string[] = [];
    const del = body.match(DELIVERABLES_RE);
    if (del) {
      templateCodes = del[1]
        .split(/[,|]/)
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);
      body = body.replace(DELIVERABLES_RE, "").trim();
    }

    const durationValue = match[3] ? Math.max(1, Number(match[3]) || 1) : DEFAULT_DURATION_VALUE;
    const durationUnit = match[4] ? parseDurationUnit(match[4]) : DEFAULT_DURATION_UNIT;

    byNo.set(
      sprintNo,
      createSprintPlan(sprintNo, { focus: body, durationValue, durationUnit, templateCodes })
    );
  }

  const parsed = [...byNo.values()].sort((a, b) => a.sprintNo - b.sprintNo);
  return parsed.length > 0 ? renumberSprints(parsed) : [createSprintPlan(1, { focus: text.trim() })];
}

/** Nếu 1 ô chứa luôn "Sprint 2/3/..." thì tách lại (scenario cũ / starter bị gộp). */
function splitIfEmbeddedBlob(sprints: SprintPlan[]): SprintPlan[] {
  if (sprints.length !== 1) return sprints;
  const focus = sprints[0].focus || "";
  const embedded = [...focus.matchAll(headerRegex())];
  if (embedded.length === 0) return sprints;
  const text = /^\s*Sprint\s*\d+\s*:/i.test(focus) ? focus : `Sprint 1: ${focus}`;
  const split = parseLegacyText(text);
  if (split.length <= 1) return sprints;
  return renumberSprints(
    split.map((s) =>
      createSprintPlan(s.sprintNo, {
        focus: s.focus,
        durationValue: s.durationValue || sprints[0].durationValue,
        durationUnit: s.durationUnit || sprints[0].durationUnit,
        templateCodes: s.templateCodes.length ? s.templateCodes : sprints[0].templateCodes,
      })
    )
  );
}

export function parseAssignmentToSprints(assignment: string | undefined | null): SprintPlan[] {
  if (!assignment?.trim()) return emptySprintPlans();
  const text = assignment.trim();
  const parsed = tryParseJsonSprints(text) ?? parseLegacyText(text);
  return splitIfEmbeddedBlob(parsed);
}

/** Assignment đang chứa JSON sprint (legacy) thay vì brief free-text. */
export function looksLikeSprintPayload(assignment: string | undefined | null): boolean {
  if (!assignment?.trim()) return false;
  const t = assignment.trim();
  if (!t.startsWith("{") && !t.startsWith("[")) return false;
  return tryParseJsonSprints(t) !== null;
}

/** @deprecated JSON nhét vào Assignment — chỉ còn dùng khi tương thích legacy. */
export function composeAssignmentFromSprints(sprints: SprintPlan[]): string {
  const payload = {
    schema: SPRINTS_SCHEMA,
    sprints: renumberSprints(sprints).map((s) => ({
      sprintNo: s.sprintNo,
      focus: s.focus.trim(),
      durationValue: Math.max(1, Math.floor(s.durationValue || DEFAULT_DURATION_VALUE)),
      durationUnit: s.durationUnit === "days" ? "days" : "weeks",
      templateCodes: s.templateCodes.map((c) => c.trim().toUpperCase()).filter(Boolean),
    })),
  };
  return JSON.stringify(payload);
}

/** Assignment bị đổ danh sách sprint — không phải brief free-text. */
export function looksLikeSprintDump(assignment: string | undefined | null): boolean {
  if (!assignment?.trim()) return false;
  if (looksLikeSprintPayload(assignment)) return true;
  return /\bSprint\s*\d+\s*(?:\([^)]*\))?\s*:/i.test(assignment);
}

/** Chỉ giữ brief thật; xóa JSON/dump sprint. */
export function sanitizeAssignmentBrief(assignment: string | undefined | null): string {
  if (!assignment?.trim()) return "";
  return looksLikeSprintDump(assignment) ? "" : assignment.trim();
}

export function sprintsFromDefinition(
  sprints: Array<{
    sprintNo?: number;
    focus?: string;
    durationValue?: number;
    durationUnit?: string;
    templateCodes?: string[];
  }> | null | undefined,
  assignmentFallback?: string | null
): SprintPlan[] {
  if (sprints && sprints.length > 0) {
    return renumberSprints(
      sprints.map((row, idx) =>
        createSprintPlan(idx + 1, {
          focus: typeof row.focus === "string" ? row.focus : "",
          durationValue:
            typeof row.durationValue === "number" && row.durationValue > 0
              ? row.durationValue
              : DEFAULT_DURATION_VALUE,
          durationUnit: row.durationUnit === "days" ? "days" : DEFAULT_DURATION_UNIT,
          templateCodes: Array.isArray(row.templateCodes)
            ? row.templateCodes.map((c) => String(c).trim().toUpperCase()).filter(Boolean)
            : [],
        })
      )
    );
  }
  // Legacy fallback only when bảng Sprint chưa có dữ liệu.
  return assignmentFallback?.trim()
    ? parseAssignmentToSprints(assignmentFallback)
    : emptySprintPlans();
}

export function toUpsertSprintPayload(sprints: SprintPlan[]) {
  return renumberSprints(sprints).map((s) => ({
    focus: s.focus.trim(),
    durationValue: Math.max(1, Math.floor(s.durationValue || DEFAULT_DURATION_VALUE)),
    durationUnit: (s.durationUnit === "days" ? "days" : "weeks") as SprintDurationUnit,
    templateCodes: s.templateCodes.map((c) => c.trim().toUpperCase()).filter(Boolean),
  }));
}

export function sprintsHaveFocus(sprints: SprintPlan[]): boolean {
  return sprints.length > 0 && sprints.every((s) => s.focus.trim().length > 0);
}

export function sprintsHaveDuration(sprints: SprintPlan[]): boolean {
  return (
    sprints.length > 0 &&
    sprints.every(
      (s) =>
        Number.isFinite(s.durationValue) &&
        s.durationValue >= 1 &&
        (s.durationUnit === "days" || s.durationUnit === "weeks")
    )
  );
}

export function sprintsAreValid(sprints: SprintPlan[]): boolean {
  return sprintsHaveFocus(sprints) && sprintsHaveDuration(sprints);
}
