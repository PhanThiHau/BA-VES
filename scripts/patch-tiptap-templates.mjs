import fs from "node:fs";

const p = "D:/BA-VES/BA-VES/src/features/docs/TipTapEditor.tsx";
let t = fs.readFileSync(p, "utf8");

t = t.replace(
  `import {
  JIRA_DOC_TEMPLATES,
  COMMON_BUILDING_BLOCKS,
  type JiraDocTemplate,
} from "./jiraTemplates";`,
  `import {
  COMMON_BUILDING_BLOCKS,
  type JiraDocTemplate,
} from "./jiraTemplates";
import { mapArtifactTemplateToDocTemplate, sortDocTemplates } from "./docTemplateMapper";`
);

const emptyTmpl = `const EMPTY_DOC_TEMPLATE: JiraDocTemplate = {
  id: "",
  templateCode: "",
  name: "Đang tải biểu mẫu...",
  category: "Business Analysis",
  jiraBadge: "",
  summary: "",
  issueKeyPrefix: "",
  defaultTitle: "",
  htmlContent: "<p></p>",
  skeletonHtmlContent: "<p></p>",
  checklist: [],
};

`;

if (!t.includes("EMPTY_DOC_TEMPLATE")) {
  t = t.replace("export function TipTapEditor", emptyTmpl + "export function TipTapEditor");
}

t = t.replace(
  'const [selectedTemplateId, setSelectedTemplateId] = useState("problem-statement");',
  `const [selectedTemplateId, setSelectedTemplateId] = useState(() => localStorage.getItem(STORAGE_TEMPLATE_ID_KEY) || "del-01");
  const [docTemplates, setDocTemplates] = useState<JiraDocTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);`
);

t = t.replace(
  `  const activeTemplate = useMemo(() => {
    return JIRA_DOC_TEMPLATES.find((t) => t.id === selectedTemplateId) || JIRA_DOC_TEMPLATES[0];
  }, [selectedTemplateId]);`,
  `  const activeTemplate = useMemo(() => {
    return docTemplates.find((t) => t.id === selectedTemplateId) || docTemplates[0] || EMPTY_DOC_TEMPLATE;
  }, [docTemplates, selectedTemplateId]);`
);

const oldInitStart = t.indexOf("  // Initial Content resolver:");
if (oldInitStart < 0) throw new Error("initialContent block not found");
const oldInitEnd = t.indexOf("  }, []);", oldInitStart);
if (oldInitEnd < 0) throw new Error("initialContent end not found");
const end = t.indexOf(");", oldInitEnd) + 2;

const newInit = `  // Initial content: local draft only; templates come from API after mount
  const initialContent = useMemo(() => {
    let savedHtml = localStorage.getItem(STORAGE_HTML_KEY);
    if (savedHtml && savedHtml.trim().length > 100) {
      const looksCorrupted =
        savedHtml.endsWith('<div style=\\\\"') ||
        savedHtml.endsWith('<div style="') ||
        savedHtml.includes('\\\\n<h1>') ||
        savedHtml.includes('&#x5C;n');
      if (looksCorrupted) {
        localStorage.removeItem(STORAGE_HTML_KEY);
        return "<p></p>";
      }
      savedHtml = savedHtml.replace(/<div class="a4-page-break"[\\s\\S]*?<\\/div><\\/div>/g, "");
      return savedHtml;
    }
    return "<p></p>";
  }, []);`;

const loadEffect = `

  // Load DEL-01..DEL-08 templates from API (no FE mock)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setTemplatesLoading(true);
        setTemplatesError(null);
        const apiTemplates = await artifactService.getTemplates();
        const mapped = sortDocTemplates(apiTemplates.map(mapArtifactTemplateToDocTemplate));
        if (cancelled) return;
        setDocTemplates(mapped);

        const savedId = localStorage.getItem(STORAGE_TEMPLATE_ID_KEY);
        const legacyMap: Record<string, string> = {
          "problem-statement": "del-01",
          bap: "del-02",
          "stakeholder-analysis": "del-03",
          "elicitation-notes": "del-04",
          brd: "del-05",
          "bpmn-process": "del-06",
          "srs-usecases": "del-07",
          rtm: "del-08",
        };
        const preferred = legacyMap[savedId || ""] || savedId || "del-01";
        const matched = mapped.find((x) => x.id === preferred) || mapped[0];
        if (matched) {
          setSelectedTemplateId(matched.id);
          localStorage.setItem(STORAGE_TEMPLATE_ID_KEY, matched.id);
        }
      } catch (err: any) {
        if (!cancelled) {
          setTemplatesError(err?.message || "Không tải được thư viện biểu mẫu từ API");
          setDocTemplates([]);
        }
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
`;

// Insert scaffold apply effect after useEditor is declared
const scaffoldHook = `
  // When templates arrive and editor has no meaningful draft, apply selected scaffold
  useEffect(() => {
    if (!editor || docTemplates.length === 0) return;
    const saved = localStorage.getItem(STORAGE_HTML_KEY);
    if (saved && saved.trim().length > 100) return;
    const tmpl = docTemplates.find((x) => x.id === selectedTemplateId) || docTemplates[0];
    if (!tmpl?.skeletonHtmlContent) return;
    editor.commands.setContent(tmpl.skeletonHtmlContent);
    setDocTitle(tmpl.defaultTitle);
    localStorage.setItem(STORAGE_HTML_KEY, tmpl.skeletonHtmlContent);
    localStorage.setItem(STORAGE_TITLE_KEY, tmpl.defaultTitle);
    localStorage.setItem(STORAGE_TEMPLATE_ID_KEY, tmpl.id);
  }, [docTemplates, editor, selectedTemplateId]);
`;

t = t.slice(0, oldInitStart) + newInit + loadEffect + t.slice(end);

if (!t.includes("When templates arrive and editor has no meaningful draft")) {
  const marker = "  // Calculate Page Count dynamically from TipTap Pagination storage";
  if (t.includes(marker)) {
    t = t.replace(marker, scaffoldHook + "\n" + marker);
  } else {
    const alt = "  // Handle direct navigation to edit a specific doc from ArtifactsPage";
    if (!t.includes(alt)) throw new Error("Cannot find insertion point for scaffold effect");
    t = t.replace(alt, scaffoldHook + "\n" + alt);
  }
}

t = t.replace(/JIRA_DOC_TEMPLATES/g, "docTemplates");

t = t.replace(
  "}, [activeDocTarget, editor, currentSessionId]);",
  "}, [activeDocTarget, editor, currentSessionId, docTemplates, setActiveDocTarget]);"
);

t = t.replace("Mẫu Confluence BABOK", "Thư viện biểu mẫu");
t = t.replace(
  "Tự tay viết các mục theo cấu trúc chuẩn BABOK bên dưới.",
  "Tự tay viết các mục theo cấu trúc biểu mẫu bên dưới."
);
t = t.replace("💡 Quy trình nộp bài chuẩn BABOK:", "💡 Quy trình nộp bài:");
t = t.replace(
  "Thư viện Biểu mẫu BA Chuẩn Confluence & BABOK",
  "Thư viện biểu mẫu phân tích nghiệp vụ"
);
t = t.replace('{ id: "BABOK & Business", label: "BABOK & Doanh nghiệp" },', '{ id: "Business Analysis", label: "Phân tích nghiệp vụ" },');
t = t.replace(
  "✨ {tmpl.checklist?.length || 0} mục tiêu chuẩn BABOK",
  "✨ {tmpl.checklist?.length || 0} mục hướng dẫn"
);
t = t.replace("biểu mẫu Confluence chuẩn", "biểu mẫu từ hệ thống");
t = t.replace(
  "// Apply Confluence / BABOK Template into TipTap (Skeleton or Sample)",
  "// Apply API template into TipTap (Skeleton or Sample)"
);

// Modal empty / loading states near template grid
t = t.replace(
  `{filteredTemplates.map((tmpl) => (`,
  `{templatesLoading && (
                <div className="col-span-full rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                  Đang tải thư viện biểu mẫu từ API...
                </div>
              )}
              {!templatesLoading && templatesError && (
                <div className="col-span-full rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                  {templatesError}
                </div>
              )}
              {!templatesLoading && !templatesError && filteredTemplates.length === 0 && (
                <div className="col-span-full rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                  Không có biểu mẫu nào trong database.
                </div>
              )}
              {filteredTemplates.map((tmpl) => (`
);

fs.writeFileSync(p, t);
console.log("patched TipTapEditor");
console.log("BABOK left:", (t.match(/BABOK/g) || []).length);
console.log("has load effect:", t.includes("Load DEL-01..DEL-08 templates from API"));
