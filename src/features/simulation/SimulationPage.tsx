import {
  AlertTriangle,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  History,
  Lightbulb,
  MessageSquareQuote,
  RefreshCw,
  Send,
  Sparkles,
  StickyNote,
  Users,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarStatusDot } from "@astryxdesign/core/Avatar";
import { Badge as AstryxBadge } from "@astryxdesign/core/Badge";
import { Button as AstryxButton } from "@astryxdesign/core/Button";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { List, ListItem } from "@astryxdesign/core/List";
import { SegmentedControl, SegmentedControlItem } from "@astryxdesign/core/SegmentedControl";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { ReadableProse } from "../../components/common/ReadableProse";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";
import { SprintGateBar } from "./SprintReviewPanel";
import {
  simulationService,
  type CoachFeedbackDto,
  type SessionEventDto,
  type ScenarioEventAvailabilityDto,
  type SessionHistoryItemDto,
} from "../../services/simulationService";

export function SimulationPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const {
    activeStakeholderId,
    setActiveStakeholderId,
    messages,
    sendMessage,
    toggleEvidence,
    eventOpen,
    setEventOpen,
    isReplying,
    activeAgents,
    currentSessionId,
    setCurrentSessionId,
    loadAgentMessages,
    setActiveDocTarget,
  } = useApp();

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const draft = drafts[activeStakeholderId] || "";
  const setDraft = (value: string) =>
    setDrafts((prev) => ({ ...prev, [activeStakeholderId]: value }));
  const [rightTab, setRightTab] = useState<"notes" | "evidence" | "events">("notes");
  const [learnerNotes, setLearnerNotes] = useState<Record<string, string>>({});
  const messageListRef = useRef<HTMLDivElement>(null);

  // AI Coach Feedback state
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedbackDto | null>(null);
  const [isRequestingCoach, setIsRequestingCoach] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [coachOpen, setCoachOpen] = useState(false);

  // Events & Catalog state
  const [sessionEvents, setSessionEvents] = useState<SessionEventDto[]>([]);
  const [eventCatalog, setEventCatalog] = useState<ScenarioEventAvailabilityDto[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Session Lifecycle & History state
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<SessionHistoryItemDto[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Dynamic active agent from Database
  const activeAgent =
    activeAgents.find(
      (a) =>
        a.stakeholderRole?.toLowerCase() === activeStakeholderId.toLowerCase() ||
        String(a.id) === activeStakeholderId
    ) ||
    activeAgents[0] || {
      id: 0,
      name: "Stakeholder",
      stakeholderRole: "Chưa nạp Persona",
      initials: "SH",
      color: "#e2e8f0",
    };

  const activeEvidence = messages.filter((m) => m.evidence);

  // Tải tin nhắn của agent đang chọn
  useEffect(() => {
    if (currentSessionId && activeAgents.length > 0) {
      const agent =
        activeAgents.find(
          (a) =>
            a.stakeholderRole?.toLowerCase() === activeStakeholderId.toLowerCase() ||
            String(a.id) === activeStakeholderId
        ) || activeAgents[0];
      if (agent?.id) {
        const agentKey = agent.stakeholderRole?.toLowerCase() || String(agent.id);
        loadAgentMessages(currentSessionId, agent.id, agentKey);
      }
    }
  }, [activeStakeholderId, currentSessionId, activeAgents]);

  // Tải Coach Feedback đã lưu và Danh mục sự kiện khi có session
  useEffect(() => {
    if (!currentSessionId) return;

    simulationService
      .getCoachFeedback(currentSessionId)
      .then((res) => {
        if (res) setCoachFeedback(res);
      })
      .catch(() => {});

    loadSessionEventsData(currentSessionId);
  }, [currentSessionId]);

  const loadSessionEventsData = async (sessionId: number) => {
    setIsLoadingEvents(true);
    try {
      const [eventsRes, catalogRes] = await Promise.allSettled([
        simulationService.getSessionEvents(sessionId),
        simulationService.getSessionEventCatalog(sessionId),
      ]);
      if (eventsRes.status === "fulfilled" && eventsRes.value) {
        setSessionEvents(eventsRes.value.items || []);
      }
      if (catalogRes.status === "fulfilled" && catalogRes.value) {
        setEventCatalog(catalogRes.value || []);
      }
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;

    setDraft("");
    await sendMessage(text);
  };


  // Yêu cầu AI Coach nhận xét hội thoại mới nhất
  const handleRequestCoachFeedback = async () => {
    if (!currentSessionId) {
      setCoachError("Chưa có phiên mô phỏng nào đang hoạt động.");
      return;
    }
    setIsRequestingCoach(true);
    setCoachError(null);
    try {
      const res = await simulationService.requestCoachFeedback(currentSessionId);
      setCoachFeedback(res);
      setStatusMessage("AI Coach đã đưa ra nhận xét mới cho phiên phỏng vấn!");
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error("Lỗi khi xin ý kiến AI Coach:", err);
      setCoachError(err?.message || "Không thể lấy nhận xét từ AI Coach lúc này.");
    } finally {
      setIsRequestingCoach(false);
    }
  };

  // Kết thúc phiên — chuyển sang Docs (không qua bước phân tích riêng)
  const handleCompleteSession = async () => {
    if (!currentSessionId) return;
    if (
      !window.confirm(
        "Kết thúc phiên phỏng vấn này và chuyển sang Soạn Docs? Phân tích nghiệp vụ nên ghi trực tiếp trên Docs; dùng Review Sprint khi cần hội đồng góp ý."
      )
    ) {
      return;
    }
    setIsCompleting(true);
    try {
      await simulationService.completeSession(currentSessionId);
      setStatusMessage("Đã kết thúc phiên. Hãy thể hiện phân tích trên Docs.");
      setTimeout(() => {
        setStatusMessage(null);
        navigate("docs");
      }, 1200);
    } catch (err: any) {
      alert("Lỗi khi kết thúc phiên: " + (err?.message || "Không xác định"));
    } finally {
      setIsCompleting(false);
    }
  };

  // Hủy phiên thực hành
  const handleAbandonSession = async () => {
    if (!currentSessionId) return;
    if (!window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn HỦY BỎ phiên mô phỏng này?")) {
      return;
    }
    setIsAbandoning(true);
    try {
      await simulationService.abandonSession(currentSessionId);
      setStatusMessage("Đã hủy bỏ phiên mô phỏng.");
      setTimeout(() => {
        setStatusMessage(null);
        setCurrentSessionId(null);
        navigate("scenarios");
      }, 1500);
    } catch (err: any) {
      alert("Lỗi khi hủy phiên: " + (err?.message || "Không xác định"));
    } finally {
      setIsAbandoning(false);
    }
  };

  // Mở modal lịch sử phiên
  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    setIsLoadingHistory(true);
    try {
      const list = await simulationService.getMySessions();
      setHistoryList(list || []);
    } catch (err) {
      console.error("Lỗi tải lịch sử phiên:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
  }, [activeAgent.id, isReplying, messages.length]);

  return (
    <div>
      <div className="flex flex-col rounded-2xl border border-slate/15 bg-white shadow-xs overflow-hidden min-h-[540px] xl:h-[calc(100dvh-132px)]">
      {/* Toast thông báo */}
      {statusMessage && (
        <div className="bg-emerald-600 px-4 py-1.5 text-center text-xs font-semibold text-white shadow-xs animate-fade-in shrink-0">
          {statusMessage}
        </div>
      )}

      {currentSessionId && (
        <SprintGateBar
          sessionId={currentSessionId}
          onReviewed={(result) => {
            void loadSessionEventsData(currentSessionId);
            setStatusMessage(
              `AI đã đánh giá Sprint ${result.sprintNo}. Xem chi tiết theo sprint trong hồ sơ Artifacts → AI & Chuyên gia phản biện.`
            );
            window.setTimeout(() => setStatusMessage(null), 6000);
          }}
        />
      )}

      {/* 3-Column Studio Layout */}
      <div className="grid flex-1 xl:min-h-0 xl:grid-cols-[245px_minmax(420px,1fr)_320px]">
        {/* Left Column: Stakeholders Roster & Session Controls */}
        <aside className="flex flex-col justify-between border-b border-slate/15 bg-[#f8fafc] xl:min-h-0 xl:border-b-0 xl:border-r">
          {/* Left Header */}
          <div className="flex h-13 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-navy">Stakeholders</span>
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[11px] font-bold text-blue-800">
                {activeAgents.length}
              </span>
              {currentSessionId && (
                <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                  #{currentSessionId}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleOpenHistory}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-navy hover:bg-slate-100 transition cursor-pointer shrink-0"
            >
              <History size={13} className="text-blue-700" />
              <span>Lịch sử</span>
            </button>
          </div>

          {/* Stakeholder List */}
          <div className="flex-1 overflow-x-auto p-2.5 xl:overflow-y-auto">
            {activeAgents.length > 0 ? (
              <div className="space-y-1.5">
                {activeAgents.map((agent) => {
                  const isSelected =
                    agent.stakeholderRole?.toLowerCase() === activeStakeholderId.toLowerCase() ||
                    String(agent.id) === activeStakeholderId;

                  return (
                    <button
                      type="button"
                      key={agent.id}
                      onClick={() =>
                        setActiveStakeholderId(agent.stakeholderRole?.toLowerCase() || String(agent.id))
                      }
                      className={classNames(
                        "flex w-full items-center gap-2.5 rounded-xl p-2.5 text-left transition-all cursor-pointer",
                        isSelected
                          ? "border border-blue-300 border-l-4 border-l-[#1d4ed8] bg-blue-50/90 text-navy shadow-2xs"
                          : "border border-slate-200/80 bg-white text-slate-800 hover:border-blue-200 hover:bg-slate-50"
                      )}
                    >
                      <Avatar
                        name={agent.name}
                        size="sm"
                        status={<AvatarStatusDot variant="success" label="Trực tuyến" />}
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className={classNames(
                            "truncate text-xs font-bold",
                            isSelected ? "text-[#102a43]" : "text-slate-800"
                          )}
                        >
                          {agent.name}
                        </div>
                        <div
                          className={classNames(
                            "truncate text-[11px] font-medium",
                            isSelected ? "text-[#1d4ed8]" : "text-slate-500"
                          )}
                        >
                          {agent.stakeholderRole || "Stakeholder"}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3">
                <EmptyState
                  title="Chưa có Stakeholder"
                  description="Khởi tạo phiên phỏng vấn từ trang Kịch bản để nạp tác tử AI."
                />
              </div>
            )}
          </div>

          {/* Left Footer: Session Lifecycle Controls */}
          <div className="shrink-0 space-y-2 border-t border-slate-200 bg-white p-2.5">
            <button
              type="button"
              disabled={!currentSessionId || isCompleting}
              onClick={() => void handleCompleteSession()}
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-[#1b365d] px-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#102a43] disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={14} className="text-emerald-300 shrink-0" />
              <span>{isCompleting ? "Đang lưu..." : "Kết thúc phiên → Docs"}</span>
            </button>
            <p className="px-0.5 text-[10px] leading-4 text-slate-500">
              Review Sprint để được góp ý; phân tích ghi trên Docs — không cần bước phân tích riêng.
            </p>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setEventOpen(true)}
                className="flex h-8 items-center justify-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2 text-[11px] font-bold text-amber-900 transition hover:bg-amber-100 cursor-pointer whitespace-nowrap"
              >
                <AlertTriangle size={13} className="text-amber-600 shrink-0" />
                <span>Biến cố ({sessionEvents.length})</span>
              </button>

              <button
                type="button"
                disabled={isAbandoning || !currentSessionId}
                onClick={handleAbandonSession}
                className="flex h-8 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <XCircle size={13} className="text-rose-600 shrink-0" />
                <span>Hủy phiên</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Center Column: Live Conversation Transcript */}
        <section className="flex flex-col border-b border-slate/15 xl:min-h-0 xl:border-b-0 xl:border-r">
          {/* Stakeholder Profile Header */}
          <div className="flex h-13 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                name={activeAgent.name}
                size="sm"
                status={<AvatarStatusDot variant="success" label="Sẵn sàng" />}
              />
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="truncate text-sm font-bold text-navy">{activeAgent.name}</h2>
                <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-800">
                  {activeAgent.stakeholderRole || "Stakeholder"}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center shrink-0">
              <StatusDot variant="success" label="Sẵn sàng phản hồi" />
            </div>
          </div>

          {/* Chat Transcript Area */}
          <div ref={messageListRef} className="flex-1 space-y-3.5 overflow-y-auto p-4 bg-[#f4f7fb]">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6">
                <EmptyState
                  icon={<MessageSquareQuote size={28} />}
                  title="Chưa có lượt trao đổi nào"
                  description={`Hãy đặt câu hỏi phỏng vấn với ${activeAgent.name} để khơi gợi yêu cầu và thu thập bằng chứng.`}
                />
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={classNames(
                    "flex flex-col",
                    message.sender === "learner" ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 px-1 text-[11px] font-medium text-slate-600">
                    <span>{message.sender === "learner" ? "Bạn (BA)" : activeAgent.name}</span>
                    <span>·</span>
                    <span>{message.time}</span>
                  </div>

                  <div
                    className={classNames(
                      "mt-1 max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-5 sm:max-w-[75%]",
                      message.sender === "learner"
                        ? "bg-[#1d4ed8] text-white rounded-br-xs shadow-sm"
                        : "bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-xs"
                    )}
                  >
                    <p
                      className={classNames(
                        "whitespace-pre-wrap",
                        message.sender === "learner" ? "text-white font-medium" : "text-slate-800"
                      )}
                    >
                      {message.text}
                    </p>

                    {message.sender === "agent" && (
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[11px]">
                        <button
                          onClick={() => toggleEvidence(message.id)}
                          className={classNames(
                            "flex items-center gap-1 font-semibold transition cursor-pointer",
                            message.evidence ? "text-emerald-700" : "hover:text-[#1d4ed8] text-slate-500"
                          )}
                        >
                          <Bookmark size={12} fill={message.evidence ? "currentColor" : "none"} />
                          {message.evidence ? "Đã lưu vào kho bằng chứng" : "Lưu bằng chứng"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isReplying && (
              <div className="flex">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 shadow-xs">
                  <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
                  {activeAgent.name} đang phân tích và trả lời…
                </div>
              </div>
            )}
          </div>

          {/* Text Input Area (Pinned at bottom of center column) */}
          <div className="shrink-0 border-t border-slate-200 bg-white p-2.5">
            <div className="flex items-end gap-2 rounded-xl border border-slate-300 bg-[#fafcfd] p-1.5 focus-within:border-[#1d4ed8] focus-within:ring-2 focus-within:ring-blue-500/20">
              <textarea
                rows={1}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void submit();
                  }
                }}
                className="max-h-24 min-h-9 flex-1 resize-none bg-transparent px-2.5 py-1.5 text-xs sm:text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder={`Đặt câu hỏi nghiệp vụ với ${activeAgent.name}... (Nhấn Enter để gửi)`}
              />
              <button
                type="button"
                disabled={!draft.trim() || isReplying}
                onClick={() => void submit()}
                className="inline-flex h-8.5 items-center gap-1.5 rounded-lg bg-[#1d4ed8] px-3.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-500 cursor-pointer shrink-0"
              >
                <Send size={13} />
                <span>Gửi</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: BA Notes & AI Coach & Events */}
        <aside className="flex flex-col bg-[#f8fafc] xl:min-h-0">
          {/* Right Header */}
          <div className="flex h-13 shrink-0 items-center border-b border-slate-200 bg-white px-2.5">
            <div className="grid w-full grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setRightTab("notes")}
                className={classNames(
                  "rounded-lg py-1.5 px-1.5 text-[11px] transition-all cursor-pointer whitespace-nowrap",
                  rightTab === "notes"
                    ? "bg-[#1b365d] font-bold text-white shadow-2xs"
                    : "font-semibold text-slate-600 hover:text-navy"
                )}
              >
                Ghi chú
              </button>
              <button
                type="button"
                onClick={() => setRightTab("evidence")}
                className={classNames(
                  "rounded-lg py-1.5 px-1.5 text-[11px] transition-all cursor-pointer whitespace-nowrap",
                  rightTab === "evidence"
                    ? "bg-[#1b365d] font-bold text-white shadow-2xs"
                    : "font-semibold text-slate-600 hover:text-navy"
                )}
              >
                Bằng chứng ({activeEvidence.length})
              </button>
              <button
                type="button"
                onClick={() => setRightTab("events")}
                className={classNames(
                  "rounded-lg py-1.5 px-1.5 text-[11px] transition-all cursor-pointer whitespace-nowrap",
                  rightTab === "events"
                    ? "bg-[#1b365d] font-bold text-white shadow-2xs"
                    : "font-semibold text-slate-600 hover:text-navy"
                )}
              >
                Biến cố ({sessionEvents.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5">
              {/* TAB 1: GHI CHÚ BA & AI COACH */}
              {rightTab === "notes" && (
                <>
                  <textarea
                    value={learnerNotes[activeStakeholderId] || ""}
                    onChange={(e) =>
                      setLearnerNotes((prev) => ({
                        ...prev,
                        [activeStakeholderId]: e.target.value,
                      }))
                    }
                    placeholder={`Ghi chú riêng của bạn về ${activeAgent.name}...`}
                    className="min-h-32 w-full rounded-xl border border-slate/20 bg-white p-3 text-xs leading-5 text-navy outline-none focus:border-navy"
                  />

                  {/* AI Coach — tuỳ chọn, không nằm trên đường đi chính */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setCoachOpen((open) => !open)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate/15 bg-white px-3 py-2 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-500" />
                        Gợi ý phỏng vấn (tuỳ chọn)
                      </span>
                      <span className="text-slate-400">{coachOpen ? "Ẩn" : "Mở"}</span>
                    </button>

                    {coachOpen && (
                      <div className="mt-2 space-y-3 rounded-xl border border-dashed border-slate/20 bg-white/80 p-3">
                        <p className="text-[11px] leading-4 text-slate">
                          Không bắt buộc. Phân tích chính ghi trên Docs; Review Sprint để được chất vấn artifact.
                        </p>
                        <div className="flex justify-end">
                          <AstryxButton
                            label={isRequestingCoach ? "Đang nhận xét..." : "Xin gợi ý nhanh"}
                            variant="secondary"
                            size="sm"
                            isLoading={isRequestingCoach}
                            isDisabled={!currentSessionId}
                            icon={<Zap size={12} />}
                            onClick={() => void handleRequestCoachFeedback()}
                          />
                        </div>

                        {coachError && (
                          <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                            {coachError}
                          </div>
                        )}

                        {coachFeedback ? (
                          <div className="space-y-2">
                            {coachFeedback.gaps?.length > 0 && (
                              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                                  Có thể đào sâu thêm
                                </p>
                                <ul className="mt-1 list-disc list-inside space-y-1 text-xs text-amber-950">
                                  {coachFeedback.gaps.map((g, idx) => (
                                    <li key={idx} className="leading-5">{g}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {coachFeedback.improvementHints?.length > 0 && (
                              <div className="rounded-xl border border-slate/15 bg-white p-3 shadow-xs">
                                <p className="text-[10px] font-bold uppercase tracking-wide text-navy">
                                  Gợi ý câu hỏi tiếp
                                </p>
                                <ul className="mt-1 list-disc list-inside space-y-1 text-xs text-navy/90">
                                  {coachFeedback.improvementHints.map((hint, idx) => (
                                    <li key={idx} className="leading-5">{hint}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-center text-[11px] text-slate">
                            Chỉ dùng khi đang bí câu hỏi — không thay cho Docs hay Review Sprint.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB 2: BẰNG CHỨNG THU THẬP */}
              {rightTab === "evidence" && (
                <div className="space-y-2.5">
                  {activeEvidence.length > 0 ? (
                    activeEvidence.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate/15 bg-white p-3 shadow-xs">
                        <div className="flex items-start gap-2.5">
                          <MessageSquareQuote size={15} className="mt-0.5 shrink-0 text-navy" />
                          <div>
                            <p className="text-xs font-medium leading-5 text-navy">“{item.text}”</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge tone="green">Bằng chứng</Badge>
                              <span className="font-mono text-[11px] font-bold text-slate">{item.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate/20 p-6 text-center text-xs text-slate">
                      Chưa lưu bằng chứng nào từ hội thoại này. Bấm &quot;Lưu bằng chứng&quot; ở các câu trả lời quan trọng.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BIẾN CỐ & SỰ KIỆN KỊCH BẢN (EVENTS) */}
              {rightTab === "events" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate">
                      Sự kiện đã kích hoạt ({sessionEvents.length})
                    </p>
                    <button
                      onClick={() => currentSessionId && loadSessionEventsData(currentSessionId)}
                      className="text-[11px] font-semibold text-navy hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={11} className={isLoadingEvents ? "animate-spin" : ""} /> Tải lại
                    </button>
                  </div>

                  {sessionEvents.length > 0 ? (
                    <div className="space-y-2.5">
                      {sessionEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="rounded-xl border border-amber-300/60 bg-amber-50/40 p-3 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800">
                              <AlertTriangle size={13} className="text-amber-600" />
                              Biến cố #{evt.sequenceNo}
                            </span>
                            <Badge tone="amber">{evt.triggerSource}</Badge>
                          </div>
                          <div className="mt-1.5">
                            <ReadableProse
                              text={
                                evt.eventContentSnapshot ||
                                "Sự kiện thay đổi yêu cầu hoặc biến cố vận hành."
                              }
                              lineClassName="text-xs leading-5 text-navy/90"
                            />
                          </div>
                          <p className="mt-2 text-[10px] text-slate">
                            Kích hoạt lúc: {new Date(evt.triggeredAt).toLocaleTimeString("vi-VN")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate/20 p-5 text-center text-xs text-slate">
                      Chưa có biến cố nghiệp vụ nào được kích hoạt trong phiên này.
                    </div>
                  )}

                  {/* Danh mục sự kiện kịch bản */}
                  {eventCatalog.length > 0 && (
                    <div className="border-t border-slate/15 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate mb-2">
                        Danh mục sự kiện kịch bản
                      </p>
                      <div className="space-y-2">
                        {eventCatalog.map((cat) => (
                          <div
                            key={cat.id}
                            className="rounded-lg border border-slate/15 bg-white p-2.5 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-navy">{cat.title}</span>
                              {cat.isTriggered ? (
                                <Badge tone="green">Đã xảy ra</Badge>
                              ) : cat.isUnlocked === false ? (
                                <Badge tone="gray">Chưa tới lúc</Badge>
                              ) : (
                                <Badge tone="gray">Chưa kích hoạt</Badge>
                              )}
                            </div>
                            {cat.unlockHint && (
                              <p className="mt-1 text-[10px] font-semibold text-slate">
                                Thời điểm: {cat.unlockHint}
                              </p>
                            )}
                            <div className="mt-1">
                              <ReadableProse
                                text={cat.description}
                                lineClassName="text-[11px] leading-5 text-slate"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Dynamic Emergency Event Modal */}
      {eventOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy-deep/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl overflow-hidden border-amber-400/30 shadow-2xl">
            <div className="flex items-start justify-between bg-amber-500/10 p-6">
              <div className="flex gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/20 text-amber-700">
                  <AlertTriangle size={22} />
                </span>
                <div>
                  <Badge tone="amber">Sự kiện kịch bản</Badge>
                  <h2 className="mt-2 text-xl font-bold text-navy">
                    {sessionEvents.length > 0
                      ? `Biến cố #${sessionEvents[sessionEvents.length - 1].sequenceNo}`
                      : "Sự kiện thay đổi yêu cầu"}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setEventOpen(false)}
                className="text-slate hover:text-navy text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <ReadableProse
                text={
                  sessionEvents.length > 0
                    ? sessionEvents[sessionEvents.length - 1].eventContentSnapshot
                    : "Chưa có biến cố khẩn cấp nào được ghi nhận cho phiên hiện tại."
                }
                lineClassName="text-sm leading-7 text-slate"
              />

              <div className="mt-7 flex justify-end gap-3 border-t border-slate/10 pt-4">
                <Button variant="secondary" onClick={() => setEventOpen(false)}>
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    setEventOpen(false);
                    navigate("docs");
                  }}
                  className="bg-navy hover:bg-navy-light"
                >
                  Cập nhật Docs theo biến cố →
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Lịch sử các phiên mô phỏng (Session History) */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy-deep/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate/15 bg-white p-5">
              <div className="flex items-center gap-2.5">
                <History className="text-navy" size={20} />
                <h2 className="text-base font-bold text-navy">Lịch sử các phiên mô phỏng của bạn</h2>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate hover:text-navy text-lg font-bold"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-5">
              {isLoadingHistory ? (
                <div className="py-8 text-center text-xs text-slate">
                  <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-navy" />
                  Đang tải lịch sử các phiên...
                </div>
              ) : historyList.length > 0 ? (
                <div className="space-y-3">
                  {historyList.map((item) => (
                    <div
                      key={item.id}
                      className={classNames(
                        "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between transition",
                        item.id === currentSessionId
                          ? "border-navy bg-navy/5 shadow-xs"
                          : "border-slate/15 bg-white hover:border-slate/30"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-navy">
                            Phiên thực hành #{item.id}
                          </strong>
                          {item.id === currentSessionId && <Badge tone="navy">Đang chọn</Badge>}
                          <Badge
                            tone={
                              String(item.status).toLowerCase().includes("completed")
                                ? "green"
                                : String(item.status).toLowerCase().includes("abandoned")
                                ? "amber"
                                : "gray"
                            }
                          >
                            Trạng thái: {String(item.status)}
                          </Badge>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate">
                          <span>Kịch bản v{item.scenarioVersionId}</span>
                          <span>· Lượt làm: #{item.attemptNo}</span>
                          <span>· {item.agentCount} Stakeholders</span>
                          <span>· {item.messageCount} tin nhắn</span>
                        </div>
                        <div className="mt-1 text-[11px] text-slate/80">
                          Bắt đầu: {new Date(item.startedAt).toLocaleString("vi-VN")}
                          {item.completedAt && ` · Hoàn thành: ${new Date(item.completedAt).toLocaleString("vi-VN")}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.id !== currentSessionId && (
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setCurrentSessionId(item.id);
                              setShowHistoryModal(false);
                            }}
                            className="text-xs"
                          >
                            Mở phiên này
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate">
                  Bạn chưa có phiên thực hành nào được ghi nhận.
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-slate/15 bg-[#fafcfd] p-4">
              <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
                Đóng
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
