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
  Mic,
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
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";
import {
  simulationService,
  type CoachFeedbackDto,
  type SessionEventDto,
  type ScenarioEventAvailabilityDto,
  type SessionHistoryItemDto,
} from "../../services/simulationService";

const avatarPalette = ["#dbeafe", "#fef3c7", "#d1fae5", "#fae8ff", "#ffe4e6", "#e0e7ff"];

export function SimulationPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const {
    activeStakeholderId,
    setActiveStakeholderId,
    messages,
    sendMessage,
    eventOpen,
    setEventOpen,
    isReplying,
    activeAgents,
    setActiveAgents,
    currentSessionId,
    setCurrentSessionId,
    loadAgentMessages,
    toggleEvidence,
  } = useApp();

  const [notesMap, setNotesMap] = useState<Record<string, string>>({});

  const [draft, setDraft] = useState("");
  // Voice Speech-to-Text state
  const [isRecording, setIsRecording] = useState(false);

  const handleToggleVoice = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setStatusMessage("Trình duyệt chưa hỗ trợ nhập giọng nói (Speech Recognition). Vui lòng nhập câu hỏi trực tiếp.");
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    try {
      const recognition = new SpeechRec();
      recognition.lang = "vi-VN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setDraft((prev) => prev ? `${prev} ${text}` : text);
        setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const [rightTab, setRightTab] = useState<"notes" | "evidence" | "events">("notes");
  const messageListRef = useRef<HTMLDivElement>(null);

  // AI Coach Feedback state
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedbackDto | null>(null);
  const [isRequestingCoach, setIsRequestingCoach] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);

  // Events & Catalog state
  const [sessionEvents, setSessionEvents] = useState<SessionEventDto[]>([]);
  const [eventCatalog, setEventCatalog] = useState<ScenarioEventAvailabilityDto[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [triggeringEventId, setTriggeringEventId] = useState<number | null>(null);
  const [eventError, setEventError] = useState<string | null>(null);

  // Session Lifecycle & History state
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<SessionHistoryItemDto[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const displayStakeholders = activeAgents.map((agent, idx) => {
    const parts = (agent.name || "AI").trim().split(" ");
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : (agent.name || "AI").slice(0, 2).toUpperCase();
    return {
      id: String(agent.id),
      agentId: agent.id,
      name: agent.name,
      role: agent.stakeholderRole,
      focus: `Tin cậy: ${agent.trustLevel}/100 · Hợp tác: ${agent.cooperationLevel}/100`,
      initials,
      color: avatarPalette[idx % avatarPalette.length],
      status: "available" as const,
    };
  });

  const active = displayStakeholders.find(
    (person) =>
      person.id === activeStakeholderId ||
      person.role.toLowerCase().includes(activeStakeholderId.toLowerCase()) ||
      person.name.toLowerCase().includes(activeStakeholderId.toLowerCase())
  ) ||
    displayStakeholders[0] || {
      id: "none",
      agentId: 0,
      name: "Chưa có nhân vật AI",
      role: "Chưa bắt đầu phiên",
      focus: "Vui lòng chọn kịch bản từ thư viện để khởi tạo phòng phỏng vấn",
      initials: "AI",
      color: "#e2e8f0",
      status: "unavailable" as const,
    };

  const activeEvidence = messages
    .filter((m) => m.evidence)
    .map((m) => ({
      id: `EV-${m.id}`,
      quote: m.text,
      category: "Phỏng vấn AI",
      source: `${active.name} (${m.time})`,
      confidence: "Cao",
    }));

  // Tải danh sách agents nếu có session mà activeAgents rỗng
  useEffect(() => {
    if (currentSessionId && activeAgents.length === 0) {
      simulationService
        .getSessionAgents(currentSessionId)
        .then((agents) => {
          if (agents && agents.length > 0) {
            setActiveAgents(agents);
            setActiveStakeholderId(String(agents[0].id));
          }
        })
        .catch(() => {});
    }
  }, [currentSessionId]);

  // Tải tin nhắn của agent đang chọn
  useEffect(() => {
    if (currentSessionId && activeAgents.length > 0) {
      const agent =
        activeAgents.find(
          (a) =>
            String(a.id) === activeStakeholderId ||
            a.stakeholderRole?.toLowerCase().includes(activeStakeholderId.toLowerCase()) ||
            a.name?.toLowerCase().includes(activeStakeholderId.toLowerCase())
        ) || activeAgents[0];
      if (agent?.id) {
        loadAgentMessages(currentSessionId, agent.id);
      }
    }
  }, [activeStakeholderId, currentSessionId, activeAgents]);

  // Tải Coach Feedback đã lưu và Danh mục sự kiện khi có session
  useEffect(() => {
    if (!currentSessionId) return;

    // Load Coach Feedback đã lưu
    simulationService
      .getCoachFeedback(currentSessionId)
      .then((res) => {
        if (res) setCoachFeedback(res);
      })
      .catch(() => {
        // Chưa có nhận xét nào trước đó, bình thường
      });

    // Load Events & Event Catalog
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

  const handleTriggerSessionEvent = async (eventId: number) => {
    if (!currentSessionId) return;
    setTriggeringEventId(eventId);
    setEventError(null);
    try {
      const res = await simulationService.triggerSessionEvent(currentSessionId, eventId);
      setStatusMessage(`Đã kích hoạt sự kiện "${res.eventTitle}" vào phiên #${currentSessionId}!`);
      setTimeout(() => setStatusMessage(null), 4000);
      await loadSessionEventsData(currentSessionId);
    } catch (err: any) {
      setEventError(err?.message || "Không thể kích hoạt sự kiện cho phiên hiện tại.");
    } finally {
      setTriggeringEventId(null);
    }
  };

  const handleSelectStakeholder = (person: { id: string }) => {
    setActiveStakeholderId(person.id);
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

  // Hoàn thành phiên thực hành
  const handleCompleteSession = async () => {
    if (!currentSessionId) return;
    if (!window.confirm("Bạn có chắc chắn muốn hoàn thành phiên mô phỏng này và chuyển sang bước Tổng hợp Bằng chứng?")) {
      return;
    }
    setIsCompleting(true);
    try {
      await simulationService.completeSession(currentSessionId);
      setStatusMessage("Đã hoàn thành phiên mô phỏng thành công!");
      setTimeout(() => {
        setStatusMessage(null);
        navigate("analysis");
      }, 1500);
    } catch (err: any) {
      alert("Lỗi khi hoàn thành phiên: " + (err?.message || "Không xác định"));
    } finally {
      setIsCompleting(false);
    }
  };

  // Hủy phiên thực hành
  const handleAbandonSession = async () => {
    if (!currentSessionId) return;
    if (!window.confirm("CẢNH BÁO: Bạn có chắc chắn muốn HỦY BỎ phiên mô phỏng này? Phiên bị hủy sẽ không thể tiếp tục.")) {
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
  }, [active.id, isReplying, messages.length]);

  return (
    <div className="-m-3 sm:-m-5 lg:-m-7">
      <div className="flex min-h-[calc(100vh-64px)] flex-col bg-white xl:h-[calc(100dvh-56px)] xl:min-h-0">
        {/* Toast thông báo */}
        {statusMessage && (
          <div className="bg-emerald-600 px-4 py-2 text-center text-xs font-semibold text-white shadow-md animate-fade-in">
            {statusMessage}
          </div>
        )}

        {/* Top Control Bar */}
        <div className="flex flex-col gap-2 border-b border-slate/15 bg-navy-deep px-4 py-3 text-white lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-brass/25 px-2 py-0.5 text-[11px] font-bold text-brass uppercase tracking-wide">
                Bước 2/5 · Mô phỏng Khơi gợi
              </span>
              <Badge tone="green">Đang phỏng vấn</Badge>
              <span className="font-mono text-xs text-mist">
                {currentSessionId ? `Phiên thực hành #${currentSessionId} · Đang kết nối Agent` : "Chưa khởi tạo phiên"}
              </span>
            </div>
            <h1 className="mt-1 truncate text-base font-bold text-white sm:text-lg">
              {currentSessionId
                ? `Phòng phỏng vấn Stakeholder AI · Phiên #${currentSessionId}`
                : "Phòng phỏng vấn Stakeholder AI"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleOpenHistory}
              title="Lịch sử các phiên mô phỏng"
              className="flex items-center gap-1.5 rounded-lg border border-slate/30 bg-navy/60 px-2.5 py-1.5 text-xs font-semibold text-mist hover:bg-navy hover:text-white transition"
            >
              <History size={14} />
              <span className="hidden sm:inline">Lịch sử phiên</span>
            </button>

            <span className="flex items-center gap-1.5 rounded-lg bg-navy/80 px-2.5 py-1.5 text-xs font-semibold text-mist">
              <Clock3 size={15} className="text-brass" />
              {activeAgents.length} Stakeholder · {messages.length} tin nhắn
            </span>

            <Button
              variant="secondary"
              onClick={() => {
                setEventError(null);
                setEventOpen(true);
                if (currentSessionId) loadSessionEventsData(currentSessionId);
              }}
              className="border-amber-400/30 bg-amber-500/10 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
            >
              <AlertTriangle size={15} className="text-amber-400" />
              Sự kiện kịch bản ({eventCatalog.length})
            </Button>

            {/* Hoàn thành phiên */}
            <Button
              disabled={isCompleting || !currentSessionId}
              onClick={handleCompleteSession}
              className="bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              <CheckCircle2 size={14} />
              {isCompleting ? "Đang chốt..." : "Chốt phiên"}
            </Button>

            {/* Hủy phiên */}
            <Button
              disabled={isAbandoning || !currentSessionId}
              onClick={handleAbandonSession}
              className="bg-rose-700/80 text-xs font-semibold text-white hover:bg-rose-600 disabled:opacity-50"
            >
              <XCircle size={14} />
              {isAbandoning ? "Đang hủy..." : "Hủy"}
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate("planning")}
              className="border-slate/30 bg-navy/60 text-xs font-semibold text-mist hover:bg-navy hover:text-white"
            >
              ← Kế hoạch
            </Button>

            <Button
              onClick={() => navigate("analysis")}
              className="bg-brass text-xs font-semibold text-navy-deep hover:bg-brass-light"
            >
              Tổng hợp bằng chứng →
            </Button>
          </div>
        </div>

        {/* 3-Column Studio Layout */}
        <div className="grid flex-1 xl:min-h-0 xl:grid-cols-[230px_minmax(420px,1fr)_330px]">
          {/* Left Column: Stakeholders Roster */}
          <aside className="border-b border-slate/15 bg-[#f8fafc] p-3 xl:overflow-y-auto xl:border-b-0 xl:border-r">
            <div className="mb-2.5 flex items-center justify-between px-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate">
                Danh sách Stakeholder
              </p>
              <Users size={14} className="text-slate" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 xl:flex-col xl:overflow-visible">
              {displayStakeholders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate/20 bg-white p-4 text-center text-xs text-slate">
                  Chưa có nhân vật AI trong phiên này. Hãy chọn kịch bản từ thư viện để khởi tạo.
                </div>
              ) : (
                displayStakeholders.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => handleSelectStakeholder(person)}
                    className={classNames(
                      "group relative flex min-w-[180px] items-center gap-2.5 rounded-xl border p-2.5 text-left transition xl:min-w-0",
                      person.id === active.id
                        ? "border-navy bg-white shadow-sm ring-1 ring-navy/10"
                        : "border-transparent hover:bg-white/80"
                    )}
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-navy shadow-xs"
                      style={{ backgroundColor: person.color }}
                    >
                      {person.initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-xs font-bold text-navy">
                        {person.name}
                      </strong>
                      <small className="block truncate text-[11px] text-slate">
                        {person.role}
                      </small>
                    </span>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </button>
                ))
              )}
            </div>

            {/* Mission Progress Checklist */}
            <div className="mt-4 hidden rounded-xl border border-slate/15 bg-white p-3.5 xl:block">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate">
                Tiến độ thu thập
              </p>
              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-slate">
                    <span>Tổng số nhân vật AI:</span>
                    <strong className="text-navy">{activeAgents.length} người</strong>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar value={activeAgents.length > 0 ? Math.min(100, messages.length * 10) : 0} />
                  </div>
                </div>
                <div className="pt-2 text-[11px] text-slate">
                  Phiên ID: <span className="font-mono text-navy font-semibold">{currentSessionId ?? "Chưa kết nối"}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Center Column: Live Conversation Transcript */}
          <section className="flex flex-col border-b border-slate/15 xl:min-h-0 xl:border-b-0 xl:border-r">
            {/* Stakeholder Profile Header */}
            <div className="flex items-center justify-between border-b border-slate/15 bg-[#fafcfd] px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-navy"
                  style={{ backgroundColor: active.color }}
                >
                  {active.initials}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-navy">{active.name}</h2>
                    <Badge tone="navy">{active.role}</Badge>
                  </div>
                  <p className="text-xs text-slate">Trọng tâm: {active.focus}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate">Trạng thái:</span>
                <Badge tone={active.status === "available" ? "green" : "gray"}>
                  {active.status === "available" ? "Sẵn sàng trao đổi" : active.status}
                </Badge>
              </div>
            </div>

            {/* Chat Transcript Area */}
            <div ref={messageListRef} className="flex-1 space-y-4 overflow-y-auto p-4 bg-[#fbfcfd]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={classNames(
                    "flex flex-col",
                    message.sender === "learner" ? "items-end" : "items-start"
                  )}
                >
                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate">
                    <span>{message.sender === "learner" ? "Bạn (BA)" : active.name}</span>
                    <span>·</span>
                    <span>{message.time}</span>
                  </div>

                  <div
                    className={classNames(
                      "mt-1 max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-5 shadow-xs sm:max-w-[75%]",
                      message.sender === "learner"
                        ? "bg-navy text-white rounded-br-xs"
                        : "bg-white text-navy border border-slate/15 rounded-bl-xs"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>

                    <div className="mt-2 flex items-center justify-between border-t border-slate/10 pt-1.5 text-[10px]">
                      {message.sender === "agent" && (
                        <button
                          onClick={() => toggleEvidence(message.id)}
                          className={classNames(
                            "flex items-center gap-1 font-semibold transition",
                            message.evidence ? "text-emerald-700" : "hover:text-navy text-slate"
                          )}
                        >
                          <Bookmark size={12} fill={message.evidence ? "currentColor" : "none"} />
                          {message.evidence ? "Đã lưu vào kho" : "Lưu bằng chứng"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isReplying && (
                <div className="flex">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs border border-slate/15 bg-white px-4 py-2.5 text-xs text-slate shadow-xs">
                    <span className="h-2 w-2 animate-ping rounded-full bg-brass" />
                    {active.name} đang suy nghĩ và trả lời…
                  </div>
                </div>
              )}
            </div>

            {/* Text Input Area */}
            <div className="shrink-0 border-t border-slate/15 bg-white p-3">
              <div className="flex items-end gap-2 rounded-xl border border-slate/20 bg-[#fafcfd] p-1.5 focus-within:border-navy focus-within:ring-1 focus-within:ring-navy/20">
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      submit();
                    }
                  }}
                  className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-2.5 py-1.5 text-sm leading-5 text-navy outline-none placeholder:text-slate/60"
                  placeholder={`Đặt câu hỏi hoặc đào sâu nghiệp vụ với ${active.name} (${active.role})... Nhấn Enter để gửi`}
                />
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  title={isRecording ? "Đang lắng nghe giọng nói... Bấm để dừng" : "Bật micro phỏng vấn bằng giọng nói (Speech-to-Text)"}
                  className={classNames(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-lg transition",
                    isRecording
                      ? "bg-rose-600 text-white animate-pulse"
                      : "bg-slate/10 text-slate hover:bg-slate/20 hover:text-navy"
                  )}
                >
                  <Mic size={16} />
                </button>
                <button
                  disabled={!draft.trim() || isReplying}
                  onClick={submit}
                  aria-label="Send question"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-navy text-white transition hover:bg-navy-light disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </section>

          {/* Right Column: BA Notes & AI Coach & Events */}
          <aside className="bg-[#f8fafc] xl:overflow-y-auto">
            <div className="grid grid-cols-3 border-b border-slate/15 bg-white">
              <button
                onClick={() => setRightTab("notes")}
                className={classNames(
                  "flex items-center justify-center gap-1 border-b-2 py-3 text-xs font-semibold transition",
                  rightTab === "notes"
                    ? "border-navy text-navy"
                    : "border-transparent text-slate hover:text-navy"
                )}
              >
                <StickyNote size={13} /> Ghi chú
              </button>
              <button
                onClick={() => setRightTab("evidence")}
                className={classNames(
                  "flex items-center justify-center gap-1 border-b-2 py-3 text-xs font-semibold transition",
                  rightTab === "evidence"
                    ? "border-navy text-navy"
                    : "border-transparent text-slate hover:text-navy"
                )}
              >
                <FileText size={13} /> Bằng chứng ({activeEvidence.length})
              </button>
              <button
                onClick={() => setRightTab("events")}
                className={classNames(
                  "flex items-center justify-center gap-1 border-b-2 py-3 text-xs font-semibold transition",
                  rightTab === "events"
                    ? "border-navy text-navy"
                    : "border-transparent text-slate hover:text-navy"
                )}
              >
                <AlertTriangle size={13} /> Biến cố ({sessionEvents.length})
              </button>
            </div>

            <div className="p-3.5">
              {/* TAB 1: GHI CHÚ BA & AI COACH */}
              {rightTab === "notes" && (
                <>
                  <textarea
                    key={active.id}
                    value={notesMap[active.id] || ""}
                    onChange={(e) => setNotesMap((prev) => ({ ...prev, [active.id]: e.target.value }))}
                    placeholder={`Ghi chú nhanh nội dung phỏng vấn với ${active.name}...`}
                    className="min-h-32 w-full rounded-xl border border-slate/20 bg-white p-3 text-xs leading-5 text-navy outline-none focus:border-navy"
                  />

                  {/* AI Coach Feedback Section */}
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-500" /> Nhận xét AI Coach
                      </p>
                      <button
                        disabled={isRequestingCoach || !currentSessionId}
                        onClick={handleRequestCoachFeedback}
                        className="flex items-center gap-1 rounded-lg bg-navy px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-navy-light disabled:opacity-50"
                      >
                        {isRequestingCoach ? (
                          <>
                            <RefreshCw size={11} className="animate-spin" /> Đang nhận xét...
                          </>
                        ) : (
                          <>
                            <Zap size={11} className="text-amber-300" /> Xin nhận xét
                          </>
                        )}
                      </button>
                    </div>

                    {coachError && (
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                        {coachError}
                      </div>
                    )}

                    {/* Hiển thị nhận xét từ Backend nếu có */}
                    {coachFeedback ? (
                      <div className="space-y-2">
                        {/* Điểm mạnh */}
                        {coachFeedback.strengths?.length > 0 && (
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                              Điểm mạnh phỏng vấn
                            </p>
                            <ul className="mt-1 list-disc list-inside space-y-1 text-xs text-emerald-950">
                              {coachFeedback.strengths.map((s, idx) => (
                                <li key={idx} className="leading-5">{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Thiếu sót / Gaps */}
                        {coachFeedback.gaps?.length > 0 && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
                              Lỗ hổng / Thông tin còn thiếu
                            </p>
                            <ul className="mt-1 list-disc list-inside space-y-1 text-xs text-amber-950">
                              {coachFeedback.gaps.map((g, idx) => (
                                <li key={idx} className="leading-5">{g}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Điểm chưa rõ */}
                        {coachFeedback.unclearPoints?.length > 0 && (
                          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-800">
                              Điểm chưa làm rõ được
                            </p>
                            <ul className="mt-1 list-disc list-inside space-y-1 text-xs text-blue-950">
                              {coachFeedback.unclearPoints.map((u, idx) => (
                                <li key={idx} className="leading-5">{u}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Gợi ý đào sâu tiếp theo */}
                        {coachFeedback.improvementHints?.length > 0 && (
                          <div className="rounded-xl border border-slate/15 bg-white p-3 shadow-xs">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-navy">
                              Gợi ý câu hỏi đào sâu tiếp theo
                            </p>
                            <ul className="mt-1 list-disc list-inside space-y-1 text-xs text-navy/90">
                              {coachFeedback.improvementHints.map((hint, idx) => (
                                <li key={idx} className="leading-5">{hint}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-right text-[10px] text-slate">
                          Cập nhật lúc: {new Date(coachFeedback.createdAt).toLocaleTimeString("vi-VN")}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate/20 bg-white p-4 text-center text-xs text-slate">
                        <Lightbulb size={18} className="mx-auto mb-1.5 text-amber-500/70" />
                        Chưa có nhận xét từ AI Coach. Hãy bấm <strong>&quot;Xin nhận xét&quot;</strong> sau khi trao đổi vài câu hỏi với Stakeholder.
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* TAB 2: BẰNG CHỨNG THU THẬP */}
              {rightTab === "evidence" && (
                <div className="space-y-2.5">
                  {activeEvidence.length ? (
                    activeEvidence.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate/15 bg-white p-3 shadow-xs">
                        <div className="flex items-start gap-2.5">
                          <MessageSquareQuote size={15} className="mt-0.5 shrink-0 text-navy" />
                          <div>
                            <p className="text-xs font-medium leading-5 text-navy">“{item.quote}”</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge tone="navy">{item.category}</Badge>
                              <span className="font-mono text-[11px] font-bold text-slate">{item.id}</span>
                            </div>
                            <p className="mt-1.5 text-[11px] text-slate">
                              {item.source} · Độ tin cậy: {item.confidence}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate/20 p-6 text-center text-xs text-slate">
                      Chưa lưu bằng chứng nào từ buổi phỏng vấn này. Hãy bấm &quot;Lưu bằng chứng&quot; ở các câu trả lời quan trọng.
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
                          <p className="mt-1.5 text-xs text-navy/90 leading-5">
                            {evt.eventContentSnapshot || "Sự kiện thay đổi yêu cầu hoặc biến cố vận hành."}
                          </p>
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
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-navy">{cat.title}</span>
                              {cat.isTriggered ? (
                                <Badge tone="green">Đã xảy ra</Badge>
                              ) : (
                                <Badge tone="gray">Chưa kích hoạt</Badge>
                              )}
                            </div>
                            <p className="mt-1 text-[11px] text-slate leading-4">{cat.description}</p>
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

      {/* Dynamic Scenario Event Modal (Connected to Event Catalog & Trigger API) */}
      {eventOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy-deep/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-2xl overflow-hidden border-amber-400/30 shadow-2xl">
            <div className="flex items-start justify-between bg-amber-500/10 p-6">
              <div className="flex gap-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-amber-500/20 text-amber-700">
                  <AlertTriangle size={22} />
                </span>
                <div>
                  <Badge tone="amber">Sự kiện kịch bản · Real-time API</Badge>
                  <h2 className="mt-2 text-xl font-bold text-navy">
                    Danh mục Biến cố & Sự kiện Thay đổi
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

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {eventError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {eventError}
                </div>
              )}

              {!currentSessionId ? (
                <div className="rounded-xl border border-dashed border-slate/20 p-6 text-center text-xs text-slate">
                  Vui lòng khởi tạo một phiên thực hành từ Thư viện kịch bản để tải danh sách sự kiện.
                </div>
              ) : isLoadingEvents ? (
                <div className="py-8 text-center text-xs text-slate">
                  <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-navy" />
                  Đang tải danh mục sự kiện từ máy chủ...
                </div>
              ) : eventCatalog.length === 0 && sessionEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate/20 p-6 text-center text-xs text-slate">
                  Kịch bản này chưa cấu hình biến cố bổ sung nào trên hệ thống.
                </div>
              ) : (
                <>
                  {eventCatalog.length > 0 && (
                    <div className="space-y-3">
                      {eventCatalog.map((evt) => (
                        <div key={evt.id} className="rounded-xl border border-slate/15 bg-white p-4 shadow-xs">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <strong className="text-sm font-bold text-navy">{evt.title}</strong>
                                <Badge tone={evt.isTriggered ? "green" : "amber"}>
                                  {evt.isTriggered ? "Đã kích hoạt" : evt.triggerType}
                                </Badge>
                              </div>
                              <p className="mt-1.5 text-xs leading-5 text-slate">{evt.description}</p>
                              {evt.triggeredAt && (
                                <p className="mt-1 text-[11px] text-emerald-700">
                                  Kích hoạt lúc: {new Date(evt.triggeredAt).toLocaleString("vi-VN")}
                                </p>
                              )}
                            </div>
                            {!evt.isTriggered && (
                              <Button
                                size="sm"
                                disabled={triggeringEventId === evt.id}
                                onClick={() => handleTriggerSessionEvent(evt.id)}
                                className="text-xs bg-amber-600 text-white hover:bg-amber-700 shrink-0"
                              >
                                {triggeringEventId === evt.id ? "Đang kích hoạt..." : "Kích hoạt sự kiện"}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sessionEvents.length > 0 && (
                    <div className="border-t border-slate/15 pt-4 space-y-2.5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate">
                        Lịch sử sự kiện đã xảy ra trong phiên ({sessionEvents.length})
                      </h3>
                      {sessionEvents.map((se) => (
                        <div key={se.id} className="rounded-xl border border-amber-300/50 bg-amber-50/40 p-3 text-xs">
                          <div className="flex items-center justify-between">
                            <strong className="text-amber-900">Biến cố #{se.sequenceNo}</strong>
                            <Badge tone="amber">{se.triggerSource}</Badge>
                          </div>
                          <p className="mt-1 text-navy/90 leading-5">{se.eventContentSnapshot}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-slate/10 pt-4">
                <Button variant="secondary" onClick={() => setEventOpen(false)}>
                  Đóng
                </Button>
                <Button
                  onClick={() => {
                    setEventOpen(false);
                    navigate("analysis");
                  }}
                  className="bg-navy hover:bg-navy-light"
                >
                  Phân tích tác động thay đổi →
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
