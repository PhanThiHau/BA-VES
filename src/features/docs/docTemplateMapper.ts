import type { ArtifactTemplateDto } from "../../services/artifactService";
import type { JiraDocTemplate, TemplateChecklistItem } from "./jiraTemplates";

const BADGE_BY_CODE: Record<string, string> = {
  "DEL-01": "Problem Statement",
  "DEL-02": "BA Plan",
  "DEL-03": "Stakeholder Analysis",
  "DEL-04": "Elicitation",
  "DEL-05": "BRD",
  "DEL-06": "Process Model",
  "DEL-07": "SRS",
  "DEL-08": "RTM",
};

function parseChecklist(raw: string | null | undefined): TemplateChecklistItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item, index) => ({
      id: String(item.id ?? `item-${index}`),
      title: String(item.title ?? `Section ${index + 1}`),
      description: String(item.description ?? ""),
      rubricHint: String(item.rubricHint ?? ""),
      snippetHtml: String(item.snippetHtml ?? ""),
    }));
  } catch {
    return [];
  }
}

function checklistFromSections(template: ArtifactTemplateDto): TemplateChecklistItem[] {
  return (template.sections ?? []).map((section, index) => ({
    id: section.sectionKey || `section-${index}`,
    title: section.title,
    description: section.instructions ?? "",
    rubricHint: "",
    snippetHtml: `<h2>${section.title}</h2><p>${section.instructions ?? ""}</p>`,
  }));
}

/** Fix UTF-8 content that was mis-decoded as Windows-1252 (e.g. â€¢, PhÃ¢n). */
export function repairMojibake(text: string | null | undefined): string {
  if (!text) return "";
  if (!/[ÃÂâð]|á»|áº/.test(text) && !text.includes("â€¢")) return text;
  try {
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i += 1) bytes[i] = text.charCodeAt(i) & 0xff;
    const fixed = new TextDecoder("utf-8").decode(bytes);
    const badBefore = (text.match(/Ã.|â€|ðŸ/g) || []).length;
    const badAfter = (fixed.match(/Ã.|â€|ðŸ/g) || []).length;
    return badAfter < badBefore ? fixed : text;
  } catch {
    return text;
  }
}

function normalizeTemplateHtml(html: string): string {
  return repairMojibake(html)
    .replace(/â€¢/g, "&bull;")
    .replace(/\u2022/g, "&bull;")
    .replace(/\s+-\s*<\/h1>/gi, "</h1>");
}

export function mapArtifactTemplateToDocTemplate(template: ArtifactTemplateDto): JiraDocTemplate {
  const code = (template.deliverableCode || template.code || `TMP-${template.id}`).toUpperCase();
  const checklist = parseChecklist(repairMojibake(template.checklistJson));
  return {
    id: code.toLowerCase(),
    templateCode: code,
    name: repairMojibake(template.name),
    category: (template.category as JiraDocTemplate["category"]) || "Business Analysis",
    jiraBadge: BADGE_BY_CODE[code] || "BA Template",
    summary: repairMojibake(template.description || ""),
    issueKeyPrefix: template.issueKeyPrefix || code.replace("DEL-", ""),
    defaultTitle: repairMojibake(template.defaultTitle || template.name),
    htmlContent: normalizeTemplateHtml(template.sampleHtmlContent || ""),
    skeletonHtmlContent: normalizeTemplateHtml(
      template.skeletonHtmlContent || template.sampleHtmlContent || ""
    ),
    checklist: checklist.length > 0 ? checklist : checklistFromSections(template),
  };
}

export function sortDocTemplates(templates: JiraDocTemplate[]): JiraDocTemplate[] {
  return [...templates].sort((a, b) => a.templateCode.localeCompare(b.templateCode, "en"));
}
