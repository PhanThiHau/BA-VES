import { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Pagination, createPageLayout } from "tiptap-a4-pagination";
import "tiptap-a4-pagination/styles.css";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileCheck2,
  FileText,
  LayoutTemplate,
  Loader2,
  Printer,
  Save,
  Send,
  Search,
  ExternalLink,
  Sparkles,
  BookOpen,
  Layers,
  Plus,
  CheckSquare,
  Square,
  Copy,
  Eye,
  X,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Undo2,
  Redo2,
  RemoveFormatting,
  Highlighter,
  Minus,
  Rows,
  Columns,
  Trash2,
  RotateCcw,
} from "lucide-react";

import type { RouteKey } from "../../types/models";
import {
  COMMON_BUILDING_BLOCKS,
  type JiraDocTemplate,
} from "./jiraTemplates";
import {
  mapArtifactTemplateToDocTemplate,
  repairMojibake,
  sortDocTemplates,
} from "./docTemplateMapper";
import { useApp } from "../../contexts/AppContext";
import {
  artifactService,
  type ArtifactDto,
  type ArtifactTemplateDto,
} from "../../services/artifactService";

const STORAGE_HTML_KEY = "baves_docs_html_content";
const STORAGE_TITLE_KEY = "baves_docs_workspace_title";
const STORAGE_STATUS_KEY = "baves_docs_workspace_status";
const STORAGE_TEMPLATE_ID_KEY = "baves_docs_workspace_template_id";
const STORAGE_ARTIFACT_ID_KEY = "baves_docs_current_artifact_id";

type DocStatus = "DRAFT" | "IN REVIEW" | "APPROVED" | "NEEDS REVISION";

const DRAFT_FORMAT = "tiptap-html-v1";

/** Pack TipTap HTML + JSON so reopen/submit keeps headings & tables. */
function packDraftStructuredContent(html: string, json: unknown, extra?: Record<string, unknown>) {
  return JSON.stringify({
    format: DRAFT_FORMAT,
    html,
    json,
    ...extra,
  });
}

/** Resolve rich content from draft/version structured JSON (never prefer plain text first). */
function extractRichDocContent(structuredJson: string | null | undefined): string | Record<string, unknown> | null {
  if (!structuredJson?.trim()) return null;
  try {
    const parsed = JSON.parse(structuredJson) as Record<string, unknown>;
    if (typeof parsed.html === "string" && parsed.html.trim().length > 0) {
      return parsed.html;
    }
    if (parsed.type === "doc") {
      return parsed;
    }
    if (parsed.json && typeof parsed.json === "object" && (parsed.json as { type?: string }).type === "doc") {
      return parsed.json as Record<string, unknown>;
    }
    if (typeof parsed.json === "string" && parsed.json.trim()) {
      const inner = JSON.parse(parsed.json) as Record<string, unknown>;
      if (inner.type === "doc") return inner;
      if (typeof inner.html === "string" && inner.html.trim()) return inner.html;
    }
  } catch {
    // ignore malformed payloads
  }
  return null;
}

function escapeHtmlText(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const a4Layout = createPageLayout({
  size: "A4",
  marginTop: 20,
  marginBottom: 20,
  gap: 24,
});

interface TipTapEditorProps {
  navigate: (route: RouteKey) => void;
}

const EMPTY_DOC_TEMPLATE: JiraDocTemplate = {
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

export function TipTapEditor({ navigate }: TipTapEditorProps) {
  const { currentSessionId, setCurrentSubmissionId, activeDocTarget, setActiveDocTarget } = useApp();

  const [docTitle, setDocTitle] = useState("PRB-2026: Tuyên ngôn Vấn đề & Cơ hội Cải tiến Đồng bộ Tồn kho Đa kênh");
  const [docStatus, setDocStatus] = useState<DocStatus>("DRAFT");
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => localStorage.getItem(STORAGE_TEMPLATE_ID_KEY) || "del-01");
  const [docTemplates, setDocTemplates] = useState<JiraDocTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(1);


  const [backendArtifactId, setBackendArtifactId] = useState<number | null>(() => {
    const saved = localStorage.getItem(STORAGE_ARTIFACT_ID_KEY);
    return saved ? parseInt(saved, 10) : null;
  });

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Guide Drawer & Building Blocks state
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideTab, setGuideTab] = useState<"checklist" | "blocks" | "sample">("checklist");
  const [completedChecklist, setCompletedChecklist] = useState<Record<string, boolean>>({});
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [tableMenuPos, setTableMenuPos] = useState<{ top: number; left: number } | null>(null);
  const tableButtonRef = useRef<HTMLButtonElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);

  // Saving & Submitting states
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [changeNote, setChangeNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; actionLabel?: string; onAction?: () => void } | null>(null);

  const showToast = (message: string, actionLabel?: string, onAction?: () => void) => {
    setToast({ message, actionLabel, onAction });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const activeTemplate = useMemo(() => {
    return docTemplates.find((t) => t.id === selectedTemplateId) || docTemplates[0] || EMPTY_DOC_TEMPLATE;
  }, [docTemplates, selectedTemplateId]);

  // Initial content: local draft only; templates come from API after mount
  const initialContent = useMemo(() => {
    let savedHtml = localStorage.getItem(STORAGE_HTML_KEY);
    if (savedHtml && savedHtml.trim().length > 100) {
      const looksCorrupted =
        savedHtml.endsWith('<div style=\\"') ||
        savedHtml.endsWith('<div style="') ||
        savedHtml.includes('\\n<h1>') ||
        savedHtml.includes('&#x5C;n');
      if (looksCorrupted) {
        localStorage.removeItem(STORAGE_HTML_KEY);
        return "<p></p>";
      }
      // Drop drafts that still contain seed encoding garbage (â€¢ / PhÃ¢n…)
      if (/â€¢|PhÃ¢n|Ã¡|ðŸ/.test(savedHtml)) {
        localStorage.removeItem(STORAGE_HTML_KEY);
        return "<p></p>";
      }
      savedHtml = repairMojibake(savedHtml)
        .replace(/\u2022/g, "&bull;")
        .replace(/<div class="a4-page-break"[\s\S]*?<\/div><\/div>/g, "");
      return savedHtml;
    }
    return "<p></p>";
  }, []);

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


  // Initialize TipTap Editor with A4 Pagination extension
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
        link: {
          openOnClick: false,
          HTMLAttributes: {
            class: "text-blue-600 underline hover:text-blue-800",
          },
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: "Bắt đầu soạn thảo tài liệu phân tích nghiệp vụ...",
      }),
      TextStyle,
      Color,
      Pagination.configure({
        pageSelector: ".baves-a4-page",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "tiptap prose prose-slate max-w-none focus:outline-none text-slate-800 text-[14px] leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save HTML content locally
      const html = editor.getHTML();
      localStorage.setItem(STORAGE_HTML_KEY, html);
    },
  });

  // Activate A4 pagination layout and listen for page count updates
  useEffect(() => {
    if (!editor) return;

    editor.commands.setPageLayout(a4Layout);

    const updatePageCount = () => {
      const pages = (editor.storage as any)?.pagination?.pageCount ?? 1;
      setPageCount(pages > 0 ? pages : 1);
    };

    editor.on("transaction", updatePageCount);
    const timer = setTimeout(updatePageCount, 200);

    return () => {
      clearTimeout(timer);
      editor.off("transaction", updatePageCount);
    };
  }, [editor]);


  // Load saved title & status on mount
  useEffect(() => {
    const savedTitle = localStorage.getItem(STORAGE_TITLE_KEY);
    const savedStatus = localStorage.getItem(STORAGE_STATUS_KEY) as DocStatus | null;
    const savedTmplId = localStorage.getItem(STORAGE_TEMPLATE_ID_KEY);
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

    if (savedTitle) setDocTitle(savedTitle);
    if (savedStatus) setDocStatus(savedStatus);
    if (savedTmplId) setSelectedTemplateId(legacyMap[savedTmplId] || savedTmplId);
  }, []);

  // Table menu: fixed position (toolbar overflow-x-auto clips absolute dropdowns)
  useEffect(() => {
    if (!tableMenuOpen) return;

    const placeMenu = () => {
      const button = tableButtonRef.current;
      if (!button) return;
      const rect = button.getBoundingClientRect();
      const menuWidth = 208;
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - menuWidth - 8);
      setTableMenuPos({ top: rect.bottom + 4, left });
    };

    placeMenu();
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (tableButtonRef.current?.contains(target) || tableMenuRef.current?.contains(target)) return;
      setTableMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTableMenuOpen(false);
    };

    window.addEventListener("resize", placeMenu);
    window.addEventListener("scroll", placeMenu, true);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", placeMenu);
      window.removeEventListener("scroll", placeMenu, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [tableMenuOpen]);


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

  // Handle direct navigation to edit a specific doc from ArtifactsPage
  useEffect(() => {
    if (!activeDocTarget || !editor) return;

    const targetCode = activeDocTarget.templateId.toLowerCase();
    const matched = docTemplates.find(
      (t) =>
        t.id.toLowerCase() === targetCode ||
        t.templateCode.toLowerCase() === targetCode ||
        t.issueKeyPrefix.toLowerCase() === targetCode
    );

    if (matched) {
      setSelectedTemplateId(matched.id);
      localStorage.setItem(STORAGE_TEMPLATE_ID_KEY, matched.id);

      if (activeDocTarget.artifactId) {
        setBackendArtifactId(activeDocTarget.artifactId);
        localStorage.setItem(STORAGE_ARTIFACT_ID_KEY, String(activeDocTarget.artifactId));

        if (currentSessionId) {
          void (async () => {
            try {
              const arts = await artifactService.getSessionArtifacts(currentSessionId);
              const foundArt = arts.find((a) => a.id === activeDocTarget.artifactId);
              if (!foundArt) return;

              setDocTitle(foundArt.title);
              const rich = extractRichDocContent(foundArt.draftStructuredContentJson);
              if (rich) {
                editor.commands.setContent(rich);
                localStorage.setItem(STORAGE_HTML_KEY, typeof rich === "string" ? rich : editor.getHTML());
                showToast(`📂 Đã mở bản làm việc "${foundArt.title}"!`);
                return;
              }

              try {
                const versions = await artifactService.getVersions(foundArt.id);
                const latest = versions[0];
                const versionRich = extractRichDocContent(latest?.structuredContentJson);
                if (versionRich) {
                  editor.commands.setContent(versionRich);
                  localStorage.setItem(STORAGE_HTML_KEY, editor.getHTML());
                  showToast(`📂 Đã mở phiên bản đã nộp của "${foundArt.title}" (giữ format).`);
                  return;
                }
              } catch {
                // ignore version lookup errors
              }

              if (foundArt.draftPlainTextContent) {
                editor.commands.setContent(
                  `<p>${escapeHtmlText(foundArt.draftPlainTextContent).replace(/\n/g, "<br/>")}</p>`
                );
                showToast(
                  `⚠️ Chỉ có bản plain text của "${foundArt.title}". Dùng chèn template nếu cần lấy lại khung BAP.`
                );
              }
            } catch {
              // ignore
            }
          })();
        }
      } else {
        setDocTitle(matched.defaultTitle);
        setBackendArtifactId(null);
        localStorage.removeItem(STORAGE_ARTIFACT_ID_KEY);
        editor.commands.setContent(matched.skeletonHtmlContent || matched.htmlContent);
      }
      showToast(`📝 Đang chỉnh sửa tài liệu: "${matched.name}"`);
    }

    setActiveDocTarget(null);
  }, [activeDocTarget, editor, currentSessionId, docTemplates, setActiveDocTarget]);


  // Save Draft (Local + Backend API)
  const handleSave = async (showUserToast = true): Promise<number | null> => {
    if (!editor) return null;

    setIsSaving(true);
    let resolvedArtifactId = backendArtifactId;

    try {
      const html = editor.getHTML();
      const plainText = editor.getText();
      const tipTapJson = editor.getJSON();

      // Local storage backup (always HTML — never plain text)
      localStorage.setItem(STORAGE_HTML_KEY, html);
      localStorage.setItem(STORAGE_TITLE_KEY, docTitle);
      localStorage.setItem(STORAGE_STATUS_KEY, docStatus);
      localStorage.setItem(STORAGE_TEMPLATE_ID_KEY, selectedTemplateId);

      // Synchronize to Backend if session is active
      if (currentSessionId) {
        try {
          const [sessionArtifacts, backendTemplates] = await Promise.all([
            artifactService.getSessionArtifacts(currentSessionId).catch(() => [] as ArtifactDto[]),
            artifactService.getTemplates().catch(() => [] as ArtifactTemplateDto[]),
          ]);

          let artifact = sessionArtifacts.find(
            (a) =>
              (resolvedArtifactId && a.id === resolvedArtifactId) ||
              a.templateCode === activeTemplate.templateCode ||
              a.title === docTitle
          );

          if (!artifact) {
            const matchedTemplate =
              backendTemplates.find((t) => t.code === activeTemplate.templateCode) ||
              backendTemplates.find((t) => t.name.toLowerCase().includes(activeTemplate.issueKeyPrefix.toLowerCase())) ||
              backendTemplates[0];

            if (matchedTemplate) {
              artifact = await artifactService.createSessionArtifact(currentSessionId, {
                artifactTemplateId: matchedTemplate.id,
                title: docTitle,
              });
            }
          }

          if (artifact) {
            resolvedArtifactId = artifact.id;
            setBackendArtifactId(artifact.id);
            localStorage.setItem(STORAGE_ARTIFACT_ID_KEY, String(artifact.id));

            await artifactService.updateDraft(artifact.id, {
              draftStructuredContentJson: packDraftStructuredContent(html, tipTapJson),
              draftPlainTextContent: plainText,
            });
          }

          if (showUserToast) {
            showToast(
              `✅ Đã lưu bản nháp vào Hồ sơ bàn giao (#${resolvedArtifactId || ""})!`,
              "Nộp bài ngay →",
              () => setIsSubmitModalOpen(true)
            );
          }
        } catch (apiErr: any) {
          console.warn("Could not sync draft to backend:", apiErr);
          if (showUserToast) {
            showToast("💾 Đã lưu vào bộ nhớ máy (Lỗi đồng bộ máy chủ: " + (apiErr.message || "") + ")");
          }
        }
      } else {
        if (showUserToast) {
          showToast(
            "💾 Đã lưu bản nháp cục bộ! (Hãy chọn phiên tình huống để đồng bộ vào Hồ sơ bàn giao)",
            "Xem Hồ sơ BA",
            () => navigate("artifacts")
          );
        }
      }

      return resolvedArtifactId;
    } catch (e: any) {
      if (showUserToast) {
        showToast("Lỗi khi lưu tài liệu: " + e.message);
      }
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [docTitle, docStatus, selectedTemplateId, backendArtifactId, currentSessionId, editor]);

  // Submit Deliverable (Freeze Version & Submit)
  const handleConfirmSubmit = async () => {
    if (!currentSessionId) {
      alert("Bạn chưa chọn phiên làm việc (Session). Vui lòng vào Dashboard hoặc Tình huống để bắt đầu phiên học trước khi nộp bài!");
      return;
    }

    if (!editor) return;

    setIsSubmitting(true);
    try {
      const targetArtifactId = await handleSave(false);
      if (!targetArtifactId) {
        throw new Error("Chưa thể khởi tạo hồ sơ tài liệu trên máy chủ.");
      }

      const html = editor.getHTML();
      const plainText = editor.getText();
      const tipTapJson = editor.getJSON();

      // Keep draft rich payload in sync before freeze (reopen after submit)
      await artifactService.updateDraft(targetArtifactId, {
        draftStructuredContentJson: packDraftStructuredContent(html, tipTapJson, {
          changeNote: changeNote || `Nộp tài liệu ${activeTemplate.name} qua Docs Workspace`,
        }),
        draftPlainTextContent: plainText,
      });
      localStorage.setItem(STORAGE_HTML_KEY, html);

      const frozenVersion = await artifactService.freezeVersion(targetArtifactId, {
        plainTextContent: plainText || `Tài liệu ${docTitle}`,
        structuredContentJson: packDraftStructuredContent(html, tipTapJson, {
          changeNote: changeNote || `Nộp tài liệu ${activeTemplate.name} qua Docs Workspace`,
          timestamp: new Date().toISOString(),
          templateCode: activeTemplate.templateCode,
        }),
      });

      const submission = await artifactService.submitArtifactVersion(currentSessionId, frozenVersion.id);
      if (submission?.id) {
        setCurrentSubmissionId(submission.id);
      }

      setDocStatus("IN REVIEW");
      localStorage.setItem(STORAGE_STATUS_KEY, "IN REVIEW");
      setSubmitSuccessNotice(true);
    } catch (err: any) {
      alert("Lỗi khi nộp bài: " + (err.message || "Vui lòng thử lại"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Apply API template into TipTap (Skeleton or Sample)
  const applyTemplate = (tmpl: JiraDocTemplate, mode: "skeleton" | "sample" = "skeleton") => {
    if (!editor) return;
    try {
      const contentToApply = mode === "skeleton" ? (tmpl.skeletonHtmlContent || tmpl.htmlContent) : tmpl.htmlContent;
      editor.commands.setContent(contentToApply);

      setDocTitle(tmpl.defaultTitle);
      setSelectedTemplateId(tmpl.id);
      setBackendArtifactId(null);
      localStorage.setItem(STORAGE_HTML_KEY, contentToApply);
      localStorage.setItem(STORAGE_TITLE_KEY, tmpl.defaultTitle);
      localStorage.setItem(STORAGE_TEMPLATE_ID_KEY, tmpl.id);
      localStorage.removeItem(STORAGE_ARTIFACT_ID_KEY);
      setIsTemplateModalOpen(false);

      if (mode === "skeleton") {
        showToast(
          `📐 Đã nạp khung sườn làm bài "${tmpl.name}" (${tmpl.templateCode})! Hãy mở Sổ tay Hướng dẫn để xem tiêu chí.`
        );
      } else {
        showToast(`✨ Đã nạp bài mẫu đầy đủ "${tmpl.name}" (${tmpl.templateCode})!`);
      }
    } catch (e: any) {
      showToast("Không thể chèn mẫu: " + e.message);
    }
  };

  // Open Guide drawer for template
  const openGuideForTemplate = (tmpl: JiraDocTemplate) => {
    setSelectedTemplateId(tmpl.id);
    localStorage.setItem(STORAGE_TEMPLATE_ID_KEY, tmpl.id);
    setIsGuideOpen(true);
    setIsTemplateModalOpen(false);
    showToast(`📖 Đã mở Sổ tay Hướng dẫn & Tiêu chí cho biểu mẫu "${tmpl.name}" (${tmpl.templateCode})`);
  };

  // Insert individual block snippet into editor
  const handleInsertSnippet = (snippetHtml: string, snippetName?: string) => {
    if (!editor) {
      showToast("Trình soạn thảo chưa sẵn sàng!");
      return;
    }
    try {
      editor.commands.insertContent(snippetHtml);
      editor.commands.focus();
      showToast(`✅ Đã chèn khối "${snippetName || "thành phần"}" vào vị trí con trỏ!`);
    } catch (err: any) {
      showToast("Lỗi khi chèn khối: " + err.message);
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Filter templates
  const filteredTemplates = docTemplates.filter((tmpl) => {
    const matchCategory = selectedCategory === "All" || tmpl.category === selectedCategory;
    const matchSearch =
      tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.issueKeyPrefix.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.templateCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-100 font-sans overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-xs font-medium text-slate-800 shadow-2xl animate-fade-in select-none">
          <span>{toast.message}</span>
          {toast.actionLabel && toast.onAction && (
            <button
              onClick={toast.onAction}
              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}

      {/* TOP HEADER: Clean, Sleek Confluence style */}
      <header className="flex h-13 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-xs px-3 sm:px-4 z-30 select-none shadow-xs">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 max-w-2xl">
          <button
            onClick={() => navigate("artifacts")}
            title="Quay lại Hồ sơ bàn giao"
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition shrink-0 whitespace-nowrap"
          >
            <ArrowLeft size={15} />
            <span className="hidden sm:inline font-medium">Hồ sơ bàn giao</span>
          </button>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#0052cc] text-white shadow-xs">
            <FileText size={15} />
          </span>

          <div className="min-w-0 flex-1">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Nhập tên tài liệu..."
              className="w-full truncate rounded border border-transparent px-1.5 py-0.5 text-xs sm:text-sm font-bold text-slate-900 hover:border-slate-300 focus:border-[#0052cc] focus:bg-white outline-none transition"
            />
            <div className="flex items-center gap-1.5 px-1.5 text-[11px] text-slate-500 whitespace-nowrap truncate">
              <span className="font-bold text-[#0052cc] shrink-0">{activeTemplate.templateCode}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium truncate">{activeTemplate.name}</span>
              {currentSessionId && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-semibold shrink-0">Phiên #{currentSessionId}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Status lozenge (Fixed: whitespace-nowrap & sleek pill) */}
        <div className="relative mx-2 shrink-0">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold border transition whitespace-nowrap shrink-0 shadow-2xs ${
              docStatus === "APPROVED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100/80"
                : docStatus === "IN REVIEW"
                ? "bg-blue-50 text-[#0052cc] border-blue-200 hover:bg-blue-100/80"
                : docStatus === "NEEDS REVISION"
                ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                docStatus === "APPROVED"
                  ? "bg-emerald-600"
                  : docStatus === "IN REVIEW"
                  ? "bg-[#0052cc]"
                  : docStatus === "NEEDS REVISION"
                  ? "bg-rose-600"
                  : "bg-slate-500"
              }`}
            />
            <span className="tracking-wide uppercase text-[10px]">{docStatus}</span>
            <ChevronDown size={11} className="opacity-60 shrink-0 ml-0.5" />
          </button>

          {showStatusMenu && (
            <div className="absolute left-0 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-fade-in">
              {(["DRAFT", "IN REVIEW", "APPROVED", "NEEDS REVISION"] as DocStatus[]).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setDocStatus(st);
                    setShowStatusMenu(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50 transition"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        st === "APPROVED"
                          ? "bg-emerald-600"
                          : st === "IN REVIEW"
                          ? "bg-[#0052cc]"
                          : st === "NEEDS REVISION"
                          ? "bg-rose-600"
                          : "bg-slate-400"
                      }`}
                    />
                    {st}
                  </span>
                  {docStatus === st && <Check size={14} className="text-[#0052cc]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Guide Drawer Toggle */}
          <button
            onClick={() => setIsGuideOpen(!isGuideOpen)}
            title="Mở Sổ tay Biểu mẫu & Tiêu chí chấm điểm của Giảng viên & AI"
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 sm:px-3 h-8 text-xs font-bold transition shadow-2xs whitespace-nowrap shrink-0 ${
              isGuideOpen
                ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                : "border-amber-200 bg-amber-50/90 text-amber-900 hover:bg-amber-100"
            }`}
          >
            <BookOpen size={13} className="shrink-0" />
            <span className="hidden md:inline">Sổ tay Biểu mẫu</span>
            <span className="md:hidden">Sổ tay</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold shrink-0 ${
                isGuideOpen ? "bg-white text-amber-700" : "bg-amber-200 text-amber-950"
              }`}
            >
              Guide
            </span>
          </button>

          {/* Template Picker */}
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-[#0052cc] px-2.5 sm:px-3 h-8 text-xs font-bold transition shadow-2xs whitespace-nowrap shrink-0"
          >
            <LayoutTemplate size={13} className="text-[#0052cc] shrink-0" />
            <span className="hidden md:inline">Thư viện biểu mẫu</span>
            <span className="md:hidden">Biểu mẫu</span>
          </button>

          {/* Reset Template button */}
          <button
            onClick={() => {
              if (window.confirm(`Bạn có chắc muốn đặt lại tài liệu về khung sườn chuẩn "${activeTemplate.name}"?`)) {
                applyTemplate(activeTemplate, "skeleton");
              }
            }}
            title="Đặt lại nội dung về khung sườn chuẩn của biểu mẫu hiện tại"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 px-2 sm:px-2.5 h-8 text-xs font-medium transition shadow-2xs whitespace-nowrap shrink-0"
          >
            <RotateCcw size={13} className="text-slate-500 shrink-0" />
            <span className="hidden xl:inline">Đặt lại mẫu</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            title="Lưu bản nháp vào Hồ sơ bàn giao (Ctrl+S)"
            className="flex items-center gap-1.5 rounded-lg bg-[#0052cc] hover:bg-[#0747a6] text-white px-3 sm:px-3.5 h-8 text-xs font-bold transition shadow-xs whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={13} className="animate-spin shrink-0" /> : <Save size={13} className="shrink-0" />}
            <span>{isSaving ? "Đang lưu..." : "Lưu"}</span>
          </button>

          {/* Submit Deliverable */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            title="Nộp bài chính thức vào Hồ sơ bàn giao để AI & Giảng viên chấm điểm"
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-3.5 h-8 text-xs font-bold transition shadow-xs whitespace-nowrap shrink-0"
          >
            <Send size={13} className="shrink-0" />
            <span>Nộp bài</span>
          </button>

          {/* Print / PDF */}
          <button
            onClick={handlePrint}
            title="In / Xuất PDF"
            className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-2xs shrink-0"
          >
            <Printer size={14} />
          </button>
        </div>
      </header>

      {/* RICH TEXT FORMATTING TOOLBAR: Sleek, Segmented & Compact */}
      <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xs px-3 sm:px-4 py-1.5 flex items-center gap-1.5 shrink-0 z-20 select-none overflow-x-auto">
        {/* Group 1: History */}
        <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60 shrink-0">
          <button
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            title="Hoàn tác (Ctrl+Z)"
            className="p-1 rounded-md hover:bg-white hover:text-slate-900 disabled:opacity-30 text-slate-600 transition"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            title="Làm lại (Ctrl+Y)"
            className="p-1 rounded-md hover:bg-white hover:text-slate-900 disabled:opacity-30 text-slate-600 transition"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Group 2: Headings */}
        <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60 shrink-0">
          <button
            onClick={() => editor?.chain().focus().setParagraph().run()}
            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition ${
              editor?.isActive("paragraph")
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
            title="Đoạn văn thường"
          >
            Văn bản
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-1.5 py-1 text-[11px] font-bold rounded-md transition ${
              editor?.isActive("heading", { level: 1 })
                ? "bg-white text-[#0052cc] shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
            title="Tiêu đề 1 (H1)"
          >
            H1
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-1.5 py-1 text-[11px] font-bold rounded-md transition ${
              editor?.isActive("heading", { level: 2 })
                ? "bg-white text-[#0052cc] shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
            title="Tiêu đề 2 (H2)"
          >
            H2
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-1.5 py-1 text-[11px] font-bold rounded-md transition ${
              editor?.isActive("heading", { level: 3 })
                ? "bg-white text-[#0052cc] shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
            title="Tiêu đề 3 (H3)"
          >
            H3
          </button>
        </div>

        {/* Group 3: Formatting */}
        <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60 shrink-0">
          <button
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-1 rounded-md transition ${
              editor?.isActive("bold") ? "bg-white text-[#0052cc] shadow-2xs" : "text-slate-600 hover:bg-white/50"
            }`}
            title="Đậm (Ctrl+B)"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-1 rounded-md transition ${
              editor?.isActive("italic") ? "bg-white text-[#0052cc] shadow-2xs" : "text-slate-600 hover:bg-white/50"
            }`}
            title="Nghiêng (Ctrl+I)"
          >
            <Italic size={14} />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            className={`p-1 rounded-md transition ${
              editor?.isActive("underline") ? "bg-white text-[#0052cc] shadow-2xs" : "text-slate-600 hover:bg-white/50"
            }`}
            title="Gạch chân (Ctrl+U)"
          >
            <UnderlineIcon size={14} />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            className={`p-1 rounded-md transition ${
              editor?.isActive("strike") ? "bg-white text-[#0052cc] shadow-2xs" : "text-slate-600 hover:bg-white/50"
            }`}
            title="Gạch ngang"
          >
            <Strikethrough size={14} />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleHighlight().run()}
            className={`p-1 rounded-md transition ${
              editor?.isActive("highlight") ? "bg-amber-100 text-amber-800 shadow-2xs" : "text-slate-600 hover:bg-white/50"
            }`}
            title="Highlight vàng"
          >
            <Highlighter size={14} />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleCode().run()}
            className={`p-1 rounded-md transition ${
              editor?.isActive("code") ? "bg-white text-[#0052cc] shadow-2xs" : "text-slate-600 hover:bg-white/50"
            }`}
            title="Mã nguồn inline"
          >
            <Code size={14} />
          </button>
        </div>

        {/* Group 4: Lists & Structure */}
        <div className="flex items-center gap-0.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/60 shrink-0">
          <button
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-1 rounded-md transition ${
              editor?.isActive("bulletList") ? "bg-white text-[#0052cc] shadow-2xs" : "text-slate-600 hover:bg-white/50"
            }`}
            title="Danh sách gạch đầu dòng"
          >
            <List size={14} />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-1 rounded-md transition ${
              editor?.isActive("orderedList") ? "bg-white text-[#0052cc] shadow-2xs" : "text-slate-600 hover:bg-white/50"
            }`}
            title="Danh sách đánh số"
          >
            <ListOrdered size={14} />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            className={`p-1 rounded-md transition ${
              editor?.isActive("taskList") ? "bg-white text-[#0052cc] shadow-2xs" : "text-slate-600 hover:bg-white/50"
            }`}
            title="Danh sách công việc (Checkbox)"
          >
            <CheckSquare size={14} />
          </button>
          <button
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            className={`p-1 rounded-md transition ${
              editor?.isActive("blockquote") ? "bg-white text-[#0052cc] shadow-2xs" : "text-slate-600 hover:bg-white/50"
            }`}
            title="Trích dẫn (Quote)"
          >
            <Quote size={14} />
          </button>
        </div>

        {/* Group 5: Table & Reset */}
        <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
          {/* Table Management dropdown — portal avoids toolbar overflow clipping */}
          <div className="relative shrink-0">
            <button
              ref={tableButtonRef}
              type="button"
              onClick={() => {
                setTableMenuOpen((open) => {
                  const next = !open;
                  if (next && tableButtonRef.current) {
                    const rect = tableButtonRef.current.getBoundingClientRect();
                    const menuWidth = 208;
                    setTableMenuPos({
                      top: rect.bottom + 4,
                      left: Math.min(Math.max(8, rect.left), window.innerWidth - menuWidth - 8),
                    });
                  }
                  return next;
                });
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition shadow-2xs ${
                editor?.isActive("table") || tableMenuOpen
                  ? "bg-blue-50 border-blue-200 text-[#0052cc]"
                  : "bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50"
              }`}
              title="Thao tác Bảng (Table)"
              aria-expanded={tableMenuOpen}
              aria-haspopup="menu"
            >
              <TableIcon size={13} className="text-[#0052cc]" />
              <span>Bảng biểu</span>
              <ChevronDown size={11} className="opacity-60" />
            </button>

            {tableMenuOpen &&
              tableMenuPos &&
              createPortal(
                <div
                  ref={tableMenuRef}
                  role="menu"
                  className="fixed w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-[200] animate-fade-in text-xs space-y-0.5"
                  style={{ top: tableMenuPos.top, left: tableMenuPos.left }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                      setTableMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Plus size={13} className="text-[#0052cc]" />
                    <span>Chèn bảng 3x3</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      editor?.chain().focus().addRowAfter().run();
                      setTableMenuOpen(false);
                    }}
                    disabled={!editor?.can().addRowAfter()}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Rows size={13} />
                    <span>Thêm dòng bên dưới</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      editor?.chain().focus().deleteRow().run();
                      setTableMenuOpen(false);
                    }}
                    disabled={!editor?.can().deleteRow()}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Minus size={13} />
                    <span>Xóa dòng hiện tại</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      editor?.chain().focus().addColumnAfter().run();
                      setTableMenuOpen(false);
                    }}
                    disabled={!editor?.can().addColumnAfter()}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Columns size={13} />
                    <span>Thêm cột bên phải</span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      editor?.chain().focus().deleteColumn().run();
                      setTableMenuOpen(false);
                    }}
                    disabled={!editor?.can().deleteColumn()}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Minus size={13} />
                    <span>Xóa cột hiện tại</span>
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      editor?.chain().focus().deleteTable().run();
                      setTableMenuOpen(false);
                    }}
                    disabled={!editor?.can().deleteTable()}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-700 hover:bg-rose-50 font-bold disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Trash2 size={13} />
                    <span>Xóa toàn bộ bảng</span>
                  </button>
                </div>,
                document.body
              )}
          </div>

          {/* Clear formatting */}
          <button
            onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
            className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition shadow-2xs"
            title="Xóa toàn bộ định dạng"
          >
            <RemoveFormatting size={14} />
          </button>
        </div>
      </div>

      {/* MAIN DOCUMENT CANVAS + SỔ TAY BIỂU MẪU DRAWER */}
      <div className="w-full flex-1 min-h-0 relative flex overflow-hidden bg-[#f4f5f7]">
        {/* Editor Page Container with generous breathing space */}
        <div className="flex-1 min-h-0 overflow-y-auto px-3 py-6 sm:px-6 sm:py-8 md:px-10 flex flex-col items-center">
          {/* Subtle page indicator badge above the document */}
          <div className="w-full max-w-[794px] mb-3 flex items-center justify-between text-xs text-slate-500 font-medium px-1 select-none">
            <span className="flex items-center gap-1.5 bg-white/90 border border-slate-200/80 px-2.5 py-1 rounded-md shadow-2xs">
              <FileText size={12} className="text-[#0052cc]" />
              <span>Khổ chuẩn A4 (210 × 297 mm)</span>
            </span>
            <span className="bg-white/90 border border-slate-200/80 px-2.5 py-1 rounded-md shadow-2xs font-semibold text-slate-700">
              Tổng số trang: <span className="text-[#0052cc]">{pageCount} trang</span> (Tự động dàn trang)
            </span>
          </div>

          <div
            className="baves-a4-page bg-white shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-200/90 rounded-xs mb-24 transition-all relative"
            style={{
              width: `${a4Layout.pageWidth}px`,
              maxWidth: "100%",
              padding: "20mm",
              minHeight: `${Math.max(a4Layout.pageHeight, (pageCount ?? 1) * (a4Layout.pageHeight + a4Layout.gap) - a4Layout.gap)}px`,
              background: "white",
            }}
          >
            <EditorContent editor={editor} />
          </div>
        </div>


        {/* SỔ TAY BIỂU MẪU & TIÊU CHÍ (SIDE GUIDE DRAWER) */}
        {isGuideOpen && (
          <aside className="w-[420px] h-full shrink-0 border-l border-slate-200 bg-white flex flex-col shadow-2xl z-20 animate-fade-in">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500 text-white shadow-xs shrink-0">
                  <BookOpen size={16} />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">Sổ tay Biểu mẫu & Tiêu chí</span>
                    <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-[#0052cc]">
                      {activeTemplate.templateCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{activeTemplate.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsGuideOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
              >
                <X size={15} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-2 pt-1 shrink-0">
              <button
                onClick={() => setGuideTab("checklist")}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                  guideTab === "checklist"
                    ? "border-[#0052cc] text-[#0052cc]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <CheckSquare size={13} />
                <span>Cấu trúc ({activeTemplate.checklist?.length || 0})</span>
              </button>
              <button
                onClick={() => setGuideTab("blocks")}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                  guideTab === "blocks"
                    ? "border-[#0052cc] text-[#0052cc]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layers size={13} />
                <span>Khối mẫu ({COMMON_BUILDING_BLOCKS.length})</span>
              </button>
              <button
                onClick={() => setGuideTab("sample")}
                className={`flex-1 py-2 text-xs font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
                  guideTab === "sample"
                    ? "border-[#0052cc] text-[#0052cc]"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Eye size={13} />
                <span>Bài mẫu</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* TAB 1: CHECKLIST & RUBRIC */}
              {guideTab === "checklist" && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-blue-50/80 border border-blue-200 p-3 text-xs text-blue-900 leading-relaxed">
                    <p className="font-bold flex items-center gap-1 text-[#0052cc]">
                      <Sparkles size={14} />
                      <span>Hướng dẫn hoàn thiện hồ sơ {activeTemplate.templateCode}:</span>
                    </p>
                    <p className="mt-1 text-[11px] text-blue-800">
                      Tự tay viết các mục theo cấu trúc biểu mẫu bên dưới. Bạn có thể đánh dấu tích khi viết xong hoặc bấm <strong>"Chèn khối này"</strong> nếu bị thiếu bảng.
                    </p>
                  </div>

                  {activeTemplate.checklist?.map((item) => {
                    const isDone = !!completedChecklist[item.id];
                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border p-3.5 transition ${
                          isDone
                            ? "bg-emerald-50/60 border-emerald-300"
                            : "bg-white border-slate-200 shadow-xs hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() =>
                              setCompletedChecklist((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }))
                            }
                            className="mt-0.5 text-slate-400 hover:text-emerald-600 transition shrink-0"
                          >
                            {isDone ? (
                              <CheckSquare size={17} className="text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Square size={17} />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs font-bold ${
                                isDone ? "line-through text-slate-500" : "text-slate-900"
                              }`}
                            >
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                              {item.description}
                            </p>

                            {/* Rubric Criteria box */}
                            {item.rubricHint && (
                              <div className="mt-2.5 rounded-lg bg-amber-50 border border-amber-200/90 p-2.5 text-[11px] text-amber-900 leading-relaxed">
                                <strong className="font-semibold text-amber-800 flex items-center gap-1 mb-0.5">
                                  <span>🎯 Tiêu chí chấm điểm (AI & Giảng viên):</span>
                                </strong>
                                <span>{item.rubricHint}</span>
                              </div>
                            )}

                            {/* Action to insert this snippet */}
                            {item.snippetHtml && (
                              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                                <button
                                  onClick={() => handleInsertSnippet(item.snippetHtml, item.title)}
                                  className="flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052cc] px-2.5 py-1 text-[11px] font-bold transition"
                                >
                                  <Plus size={12} />
                                  <span>Chèn khối này vào văn bản</span>
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.snippetHtml);
                                    showToast("📋 Đã sao chép HTML của khối vào Clipboard!");
                                  }}
                                  title="Sao chép nội dung"
                                  className="text-slate-400 hover:text-slate-600 transition p-1"
                                >
                                  <Copy size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: BUILDING BLOCKS LIBRARY */}
              {guideTab === "blocks" && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Chọn các thành phần định dạng chuẩn Confluence bên dưới để chèn nhanh vào trang Word tại vị trí con trỏ:
                  </p>
                  <div className="space-y-2.5">
                    {COMMON_BUILDING_BLOCKS.map((blk) => (
                      <div
                        key={blk.id}
                        className="rounded-xl border border-slate-200 bg-white p-3 hover:border-[#0052cc] hover:shadow-xs transition"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="inline-block rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 mb-1">
                              {blk.category}
                            </span>
                            <h4 className="text-xs font-bold text-slate-900">{blk.name}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                              {blk.description}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
                          <button
                            onClick={() => handleInsertSnippet(blk.htmlContent, blk.name)}
                            className="flex items-center gap-1 rounded-lg bg-[#0052cc] hover:bg-[#0747a6] text-white px-2.5 py-1 text-[11px] font-bold transition shadow-xs"
                          >
                            <Plus size={12} />
                            <span>Chèn vào vị trí con trỏ</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SAMPLE REFERENCE PREVIEW */}
              {guideTab === "sample" && (
                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 leading-relaxed">
                    <p className="font-bold text-slate-800">📖 Bài mẫu tham khảo của Dự án OMS VinaSupply:</p>
                    <p className="mt-1 text-[11px]">
                      Xem trước cách hành văn, cấu trúc bảng biểu và lập luận của một Lead BA chuẩn để học hỏi tư duy phân tích mà không ảnh hưởng tới bài làm của bạn.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 max-h-[500px] overflow-y-auto text-xs leading-relaxed space-y-3 select-text font-sans">
                    <div
                      dangerouslySetInnerHTML={{ __html: activeTemplate.htmlContent }}
                      className="prose prose-xs max-w-none [&_h1]:text-sm [&_h1]:font-bold [&_h1]:text-[#0052cc] [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-slate-800 [&_table]:text-[11px] [&_td]:p-1.5 [&_th]:p-1.5"
                    />
                  </div>

                  <button
                    onClick={() => applyTemplate(activeTemplate, "sample")}
                    className="w-full rounded-xl border border-slate-200 bg-white hover:bg-slate-50 py-2 text-xs font-bold text-slate-700 transition"
                  >
                    Dán toàn bộ bài mẫu này vào tài liệu
                  </button>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* MODAL: SUBMIT DELIVERABLE (NỘP BÀI) */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {submitSuccessNotice ? (
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <FileCheck2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Nộp bài thành công!</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tài liệu <strong>{docTitle}</strong> đã được đóng băng phiên bản và ghi nhận vào <strong>Hồ sơ bàn giao</strong> của Phiên học #{currentSessionId}. AI và Giảng viên đang tiến hành phản biện & đối soát bằng chứng.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => {
                      setIsSubmitModalOpen(false);
                      setSubmitSuccessNotice(false);
                      navigate("artifacts");
                    }}
                    className="rounded-xl bg-navy px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-light transition shadow-sm"
                  >
                    Xem phản biện tại Hồ sơ bàn giao →
                  </button>
                  <button
                    onClick={() => {
                      setIsSubmitModalOpen(false);
                      setSubmitSuccessNotice(false);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Tiếp tục chỉnh sửa
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Send className="text-emerald-600" size={18} />
                    <h3 className="text-sm font-bold text-slate-900">Nộp bài đánh giá Hồ sơ bàn giao</h3>
                  </div>
                  <button
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mã tài liệu:</span>
                      <strong className="font-mono text-[#0052cc]">{activeTemplate.templateCode}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tên sản phẩm:</span>
                      <strong className="text-slate-800 text-right truncate max-w-xs">{docTitle}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phiên thực hành:</span>
                      <strong className="text-emerald-700">{currentSessionId ? `Session #${currentSessionId}` : "Chưa chọn phiên"}</strong>
                    </div>
                  </div>

                  {!currentSessionId && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                      ⚠️ Bạn chưa tham gia một phiên thực hành (Simulation Session). Hãy vào Dashboard hoặc mục Tình huống để bắt đầu một phiên trước khi nộp bài.
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Ghi chú phiên bản nộp bài (Change Note):
                    </label>
                    <textarea
                      value={changeNote}
                      onChange={(e) => setChangeNote(e.target.value)}
                      placeholder="Mô tả tóm tắt những nội dung, quy tắc nghiệp vụ bạn đã hoàn thiện trong bài nộp này..."
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-none focus:border-[#0052cc] min-h-24 resize-none"
                    />
                  </div>

                  <div className="rounded-xl bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-800 space-y-1">
                    <p className="font-semibold">💡 Quy trình nộp bài:</p>
                    <p>• Hệ thống sẽ tự động lưu bản nháp mới nhất, tạo mốc đóng băng phiên bản và gửi bài vào danh mục <strong>Hồ sơ bàn giao</strong>.</p>
                    <p>• AI và Giảng viên sẽ tự động đối soát nội dung với dữ liệu phỏng vấn thu thập được.</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
                  <button
                    onClick={() => {
                      setIsSubmitModalOpen(false);
                      navigate("artifacts");
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    <span>Đến Hồ sơ bàn giao</span>
                    <ExternalLink size={13} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsSubmitModalOpen(false)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleConfirmSubmit}
                      disabled={isSubmitting || !currentSessionId}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      <span>{isSubmitting ? "Đang nộp..." : "Xác nhận nộp bài"}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TEMPLATE PICKER MODAL: Refined, Sleek & Airy */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-4xl max-h-[88vh] rounded-2xl bg-white shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 bg-white shrink-0">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#0052cc] border border-blue-100 shrink-0">
                  <LayoutTemplate size={20} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Thư viện biểu mẫu phân tích nghiệp vụ
                    </h3>
                    <span className="rounded-full bg-blue-100/80 text-[#0052cc] px-2.5 py-0.5 text-[11px] font-bold">
                      {docTemplates.length} Biểu mẫu Chuẩn
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tối ưu hóa cấu trúc chuẩn quốc tế để nạp trực tiếp vào TipTap Editor với đầy đủ bảng biểu và gợi ý phân tích.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Filter & Search Bar: Modern Segmented Control */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-6 py-2.5 shrink-0">
              <div className="flex items-center gap-1 p-1 bg-slate-200/60 rounded-xl overflow-x-auto">
                {[
                  { id: "All", label: `Tất cả mẫu (${docTemplates.length})` },
                  { id: "Business Analysis", label: "Phân tích nghiệp vụ" },
                  { id: "Requirements & Specs", label: "Yêu cầu & Đặc tả" },
                  { id: "Process & Traceability", label: "Quy trình & Ma trận" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? "bg-white text-[#0052cc] shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64 shrink-0">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo mã DEL, tên biểu mẫu..."
                  className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            {/* Template Grid: Airy, Elegant & Balanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-5 sm:p-6 overflow-y-auto max-h-[58vh] bg-slate-50/40">
              {templatesLoading && (
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
              {filteredTemplates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 sm:p-5 hover:border-[#0052cc]/70 hover:shadow-md transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[11px] font-bold text-[#0052cc] border border-blue-100">
                        {tmpl.templateCode} · {tmpl.issueKeyPrefix}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        {tmpl.jiraBadge}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0052cc] transition-colors leading-snug">
                      {tmpl.name}
                    </h4>
                    <p className="mt-1.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {tmpl.summary}
                    </p>
                  </div>

                  {/* Actions for this template */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => applyTemplate(tmpl, "skeleton")}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0052cc] hover:bg-[#0747a6] text-white px-3 py-2 text-xs font-bold transition shadow-2xs whitespace-nowrap"
                        title="Nạp khung sườn tiêu chuẩn với các bảng trống để học viên tự điền"
                      >
                        <Sparkles size={13} className="shrink-0" />
                        <span>Nạp Khung sườn</span>
                      </button>

                      <button
                        onClick={() => openGuideForTemplate(tmpl)}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900 px-3 py-2 text-xs font-bold transition shadow-2xs whitespace-nowrap"
                        title="Mở Sổ tay Hướng dẫn ở cạnh bên để vừa xem vừa viết"
                      >
                        <BookOpen size={13} className="shrink-0 text-amber-700" />
                        <span>Mở Sổ tay Guide</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 px-0.5">
                      <span className="text-[11px] font-medium text-slate-400">
                        ✨ {tmpl.checklist?.length || 0} mục hướng dẫn
                      </span>
                      <button
                        onClick={() => applyTemplate(tmpl, "sample")}
                        className="text-[11px] font-semibold text-slate-600 hover:text-[#0052cc] hover:underline transition flex items-center gap-1"
                        title="Nạp toàn bộ văn bản mẫu của dự án tham khảo"
                      >
                        <Eye size={12} className="text-slate-400" />
                        <span>Xem / Nạp bài mẫu</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200/80 bg-white px-6 py-3 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 font-medium">
                Đang hiển thị {filteredTemplates.length} / {docTemplates.length} biểu mẫu từ hệ thống
              </span>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
