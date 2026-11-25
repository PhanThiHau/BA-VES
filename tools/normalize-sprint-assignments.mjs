/**
 * Tách Assignment legacy (gom Sprint 1..N) → JSON baves.sprints.v1 + duration weeks.
 * Chạy: node tools/normalize-sprint-assignments.mjs
 */
import { execFileSync } from "node:child_process";

const SPRINT_HEADER_RE =
  /(?:^|[\n\r]|[-•]\s*)Sprint\s*(\d+)\s*(?:\|\s*(?:Ends:\s*[^\n:]+|Duration:\s*\d+\s*[dw]|days?|weeks?)?)?\s*[:.\-–]?\s*/gi;

function parseLegacy(text) {
  const headers = [...text.matchAll(new RegExp(SPRINT_HEADER_RE.source, "gi"))];
  if (headers.length === 0) {
    return [{ sprintNo: 1, focus: text.trim(), durationValue: 1, durationUnit: "weeks", templateCodes: [] }];
  }
  const byNo = new Map();
  for (let i = 0; i < headers.length; i++) {
    const m = headers[i];
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n < 1) continue;
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < headers.length ? (headers[i + 1].index ?? text.length) : text.length;
    const body = text.slice(start, end).trim().replace(/\s*[-•]\s*$/, "").trim();
    byNo.set(n, {
      sprintNo: n,
      focus: body,
      durationValue: 1,
      durationUnit: "weeks",
      templateCodes: [],
    });
  }
  return [...byNo.values()].sort((a, b) => a.sprintNo - b.sprintNo);
}

function splitIfBlob(sprints) {
  if (sprints.length !== 1) return sprints;
  const focus = sprints[0].focus || "";
  const embedded = [...focus.matchAll(new RegExp(SPRINT_HEADER_RE.source, "gi"))];
  if (embedded.length === 0) return sprints;
  const text = /^\s*Sprint\s*\d+/i.test(focus) ? focus : `Sprint 1:\n${focus}`;
  const split = parseLegacy(text);
  return split.length > 1 ? split.map((s, i) => ({ ...s, sprintNo: i + 1 })) : sprints;
}

function normalize(assignment) {
  const text = (assignment || "").trim();
  if (!text) {
    return JSON.stringify({
      schema: "baves.sprints.v1",
      sprints: [{ sprintNo: 1, focus: "", durationValue: 1, durationUnit: "weeks", templateCodes: [] }],
    });
  }

  let sprints;
  if (text.startsWith("{") || text.startsWith("[")) {
    try {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : parsed.sprints;
      if (Array.isArray(arr) && arr.length) {
        sprints = arr.map((row, idx) => ({
          sprintNo: idx + 1,
          focus: String(row.focus || "").trim(),
          durationValue: Math.max(1, Number(row.durationValue || row.duration || 1) || 1),
          durationUnit: String(row.durationUnit || "weeks").toLowerCase().startsWith("d")
            ? "days"
            : "weeks",
          templateCodes: Array.isArray(row.templateCodes)
            ? row.templateCodes.map((c) => String(c).toUpperCase())
            : [],
        }));
      }
    } catch {
      sprints = null;
    }
  }
  if (!sprints) sprints = parseLegacy(text);
  sprints = splitIfBlob(sprints).map((s, i) => ({ ...s, sprintNo: i + 1 }));

  return JSON.stringify({ schema: "baves.sprints.v1", sprints });
}

function sqlEscape(value) {
  return "N'" + String(value).replace(/'/g, "''") + "'";
}

function query(sql) {
  const out = execFileSync(
    "sqlcmd",
    ["-S", "localhost", "-U", "sa", "-P", "123456", "-C", "-d", "BAVES", "-h", "-1", "-W", "-Q", sql],
    { encoding: "utf8" }
  );
  return out;
}

const rowsRaw = query(
  "SET NOCOUNT ON; SELECT CAST(Id AS varchar(20)) + CHAR(9) + REPLACE(REPLACE(ISNULL(Assignment,''), CHAR(13), ' '), CHAR(10), ' ') FROM scenario.ScenarioVersions;"
);

const lines = rowsRaw
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("(") && !l.startsWith("Msg"));

let updated = 0;
for (const line of lines) {
  const tab = line.indexOf("\t");
  if (tab < 0) continue;
  const id = line.slice(0, tab).trim();
  // Re-fetch full Assignment with XML to avoid truncation — use separate query per id
  const full = query(
    `SET NOCOUNT ON; SELECT Assignment FROM scenario.ScenarioVersions WHERE Id = ${Number(id)};`
  )
    .replace(/\r?\n\(.*rows affected\).*/is, "")
    .replace(/\r?\n+/g, "\n")
    .trim();

  // sqlcmd may still mangle newlines; fetch via FOR JSON
  const jsonWrap = query(
    `SET NOCOUNT ON; SELECT Assignment AS a FROM scenario.ScenarioVersions WHERE Id = ${Number(id)} FOR JSON PATH, WITHOUT_ARRAY_WRAPPER;`
  )
    .replace(/\r?\n\(.*rows affected\).*/is, "")
    .trim();

  let assignment = "";
  try {
    assignment = JSON.parse(jsonWrap).a ?? "";
  } catch {
    assignment = full;
  }

  const next = normalize(assignment);
  if (next === assignment) continue;

  const sprintCount = JSON.parse(next).sprints.length;
  query(
    `SET NOCOUNT ON; UPDATE scenario.ScenarioVersions SET Assignment = ${sqlEscape(next)} WHERE Id = ${Number(id)};`
  );
  updated += 1;
  console.log(`Updated version ${id} → ${sprintCount} sprints`);
}

console.log(`Done. Updated ${updated} version(s).`);
