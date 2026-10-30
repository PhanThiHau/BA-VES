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
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { stakeholders } from "../../constants/scenario";
import { coachPrompts, evidenceRegister } from "../../constants/trainingScenario";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";
import {
  simulationService,
  type CoachFeedbackDto,
  type SessionEventDto,
  type ScenarioEventAvailabilityDto,
  type SessionHistoryItemDto,
  type SessionDto,
} from "../../services/simulationService";

const notesByStakeholder: Record<string, string> = {
  warehouse:
    "• Lấy hàng theo đợt (Wave picking): 8h, 13h, 17h\n• Hàng trả về nằm tại khu cách ly (quarantine), chỉ cập nhật số lượng cuối ca\n• Khu vực B thường xuyên mất kết nối Wi-Fi; máy quét gửi trễ dễ tạo bản ghi trùng lặp\n\nCâu hỏi mở: Cam kết SLA kiểm định chất lượng (QC) cho hàng trả là bao lâu?",
  planner:
    "• Dự báo nhu cầu 8 tuần và định mức min-max hiện lập trên file Excel cá nhân\n• Có quy tắc ngầm: Kiểm tra kho dư thừa trước khi tạo PO mua sắm mới\n• Chưa có công thức tính safety stock cho giai đoạn khuyến mãi lớn\n\nCâu hỏi mở: Cách tính safety stock khi có khuyến mãi chuỗi?",
  finance:
    "• Yêu cầu kiểm toán khắt khe: Lưu rõ người thực hiện, người duyệt, thời gian, lý do, số lượng trước/sau\n• Phân quyền duyệt: < 10tr hệ thống tự động; 10–50tr Trưởng kho; > 50tr Giám đốc Tài chính\n\nCâu hỏi mở: Xử lý thế nào với điều chỉnh tồn kho khi đã khóa sổ kế toán tháng?",
  supply:
    "• Thử nghiệm tại 3 kho miền Nam trong vòng 3 tháng\n• Chỉ tiêu KPI: Tỷ lệ đứt hàng (stockout) < 5%; Tỷ lệ đáp ứng (fill rate) >= 96%\n• Mức tăng chi phí lưu kho không vượt quá 8%\n\nCâu hỏi mở: Ai có thẩm quyền ghi đè (override) quyết định chuyển kho?",
  operator:
    "• Khi mất mạng Wifi: Ghi giấy tạm → nhập bổ sung sau ca gây trễ dữ liệu\n• Màn hình máy quét cũ không hiển thị danh sách giao dịch đang chờ đồng bộ\n\nCâu hỏi mở: Model thiết bị quét mã vạch hiện tại và tần suất rớt mạng?",
  sponsor:
    "• Thời gian triển khai MVP 6 tháng / Ngân sách tối đa 4 tỷ VNĐ\n• Cam kết không thay đổi hệ thống POS cửa hàng và không làm gián đoạn vận hành kho\n\nCâu hỏi mở: Tiêu chí dừng dự án (stop criteria) là gì?",
};

const suggestedQuickPrompts: Record<string, string[]> = {
  warehouse: [
    "Khu vực cách ly (quarantine) mất bao lâu để kiểm định hàng trả về?",
    "Khi máy quét rớt Wi-Fi, nhân viên xử lý đơn giao dịch thế nào?",
    "Số liệu tồn khả dụng (ATP) tại kho được cập nhật tức thời hay theo lô?",
  ],
  planner: [
    "Quy tắc ưu tiên điều chuyển tồn kho nội bộ trước khi tạo PO mua mới là gì?",
    "File Excel dự báo hiện lấy dữ liệu từ những nguồn nào?",
    "Làm sao anh cân bằng giữa chi phí vận chuyển liên kho và chi phí mua mới?",
  ],
  finance: [
    "Hạn mức duyệt sai lệch tồn kho được quy định cụ thể như thế nào?",
    "Nếu điều chỉnh tồn kho rơi vào kỳ đã khóa sổ kế toán thì xử lý ra sao?",
    "Yêu cầu về bằng chứng kiểm toán (audit trail) bắt buộc những trường nào?",
  ],
  supply: [
    "Tiêu chí thành công chính của giai đoạn thử nghiệm (Pilot) là gì?",
    "Trường hợp có mâu thuẫn về điều chuyển hàng, ai là người quyết định cuối?",
    "Kế hoạch đo lường mức độ ảnh hưởng đến chi phí lưu kho sau triển khai?",
  ],
  operator: [
    "Màn hình máy quét có cảnh báo khi đơn hàng chưa đồng bộ lên WMS không?",
    "Quy trình ghi chép sổ giấy khi mất mạng có dễ gây nhầm lẫn số lượng không?",
  ],
  sponsor: [
    "Ràng buộc về ngân sách và thời gian triển khai có thể linh hoạt không?",
    "Tiêu chí nghiệm thu quan trọng nhất đối với Ban Giám đốc là gì?",
  ],
};

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
    currentSessionId,
    setCurrentSessionId,
    loadAgentMessages,
  } = useApp();

  const [draft, setDraft] = useState("");
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

  // Session Lifecycle & History state
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyList, setHistoryList] = useState<SessionHistoryItemDto[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const active = stakeholders.find((person) => person.id === activeStakeholderId) ?? stakeholders[0];
  const activeEvidence = evidenceRegister.filter((item) => item.stakeholderId === active.id);
  const prompts = coachPrompts[active.id] ?? [];
  const quickPrompts = suggestedQuickPrompts[active.id] ?? [];

  // Tải tin nhắn của agent đang chọn
  useEffect(() => {
    if (currentSessionId && activeAgents.length > 0) {
      const agent =
        activeAgents.find(
          (a) =>
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

  const handleSelectStakeholder = (person: (typeof stakeholders)[0]) => {
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
              <Badge tone="green">Đang phỏng vấn</Badge>
              <span className="font-mono text-xs text-mist">
                {currentSessionId ? `Phiên thực hành #${currentSessionId} · Đang kết nối Agent` : "INV-2026-014"}
              </span>
            </div>
            <h1 className="mt-1 truncate text-base font-bold text-white sm:text-lg">
              Mô phỏng khơi gợi yêu cầu: Quản lý tồn kho VinaSupply
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
              56:24
            </span>

            <Button
              variant="secondary"
              onClick={() => setEventOpen(true)}
              className="border-amber-400/30 bg-amber-500/10 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
            >
              <AlertTriangle size={15} className="text-amber-400" />
              Sự kiện khẩn cấp
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
              {stakeholders.map((person) => (
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
                  {person.status === "interviewed" ? (
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check size={11} />
                    </span>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                  )}
                </button>
              ))}
            </div>

            {/* Mission Progress Checklist */}
            <div className="mt-4 hidden rounded-xl border border-slate/15 bg-white p-3.5 xl:block">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate">
                Tiến độ thu thập
              </p>
              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-slate">
                    <span>Số stakeholder đã hỏi:</span>
                    <strong className="text-navy">{activeAgents.length || 6} người</strong>
                  </div>
                  <div className="mt-1.5">
                    <ProgressBar value={75} />
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
                          onClick={() => {}}
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

            {/* Quick Prompts Chips */}
            {quickPrompts.length > 0 && (
              <div className="border-t border-slate/10 bg-white/80 px-3 py-1.5">
                <div className="flex items-center gap-2 overflow-x-auto text-[11px]">
                  <span className="shrink-0 font-bold text-slate">Gợi ý câu hỏi:</span>
                  {quickPrompts.map((q) => (
                    <button
                      key={q}
                      onClick={() => setDraft(q)}
                      className="shrink-0 rounded-full border border-slate/20 bg-mist/20 px-2.5 py-1 text-slate transition hover:border-navy hover:bg-white hover:text-navy"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
                    className="min-h-32 w-full rounded-xl border border-slate/20 bg-white p-3 text-xs leading-5 text-navy outline-none focus:border-navy"
                    defaultValue={notesByStakeholder[active.id]}
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
                      // Fallback hiển thị mẫu trước khi bấm xin nhận xét
                      <div className="space-y-2">
                        {prompts.map((prompt) => (
                          <div
                            key={prompt.type}
                            className={classNames(
                              "rounded-xl p-3 border",
                              prompt.type === "strength"
                                ? "border-emerald-200 bg-emerald-50/50"
                                : prompt.type === "gap"
                                ? "border-amber-200 bg-amber-50/50"
                                : "border-slate/15 bg-white"
                            )}
                          >
                            <div className="flex gap-2">
                              <Lightbulb
                                size={14}
                                className={classNames(
                                  "mt-0.5 shrink-0",
                                  prompt.type === "strength"
                                    ? "text-emerald-700"
                                    : prompt.type === "gap"
                                    ? "text-amber-700"
                                    : "text-navy"
                                )}
                              />
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate">
                                  {prompt.type === "strength"
                                    ? "Điểm mạnh phỏng vấn"
                                    : prompt.type === "gap"
                                    ? "Lỗ hổng phân tích"
                                    : "Gợi ý đào sâu tiếp theo"}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-navy/90">{prompt.text}</p>
                              </div>
                            </div>
                          </div>
                        ))}
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
                  <Badge tone="amber">Sự kiện động · Khẩn cấp</Badge>
                  <h2 className="mt-2 text-xl font-bold text-navy">
                    Nhà cung cấp chính giao hàng trễ 5 ngày
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
              <p className="leading-7 text-slate text-sm">
                Lô hàng sữa tươi tiệt trùng MILK-01 dự kiến nhập kho ngày 18/09 bị hoãn 5 ngày do sự cố vận chuyển từ nhà máy. Kho miền Nam sẽ cạn sạch tồn kho trong 3 ngày tới, trong khi chương trình khuyến mãi toàn hệ thống sẽ bắt đầu trong 7 ngày nữa.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Phạm vi ảnh hưởng", "Bổ sung tồn kho"],
                  ["Mức độ tác động", "Rất cao"],
                  ["Thời hạn phản hồi", "20 phút"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-mist/30 p-3">
                    <span className="text-xs text-slate">{label}</span>
                    <strong className="mt-1 block text-sm text-navy">{value}</strong>
                  </div>
                ))}
              </div>

              <h3 className="mt-6 text-sm font-bold text-navy">Hành động BA cần thực hiện ngay:</h3>
              <div className="mt-3 space-y-2">
                {[
                  "Xác định các Stakeholder cần tham vấn khẩn (Planner, Finance, Trưởng kho)",
                  "Đánh giá các yêu cầu nghiệp vụ bị ảnh hưởng (FR-08, BR-01)",
                  "So sánh phương án: Điều chuyển tồn kho nội bộ vs Mua ngoài khẩn cấp",
                  "Cập nhật sổ ghi chép quyết định (Decision Log) và Nhật ký rủi ro",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs font-medium text-slate">
                    <ChevronRight size={14} className="text-navy" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-7 flex justify-end gap-3 border-t border-slate/10 pt-4">
                <Button variant="secondary" onClick={() => setEventOpen(false)}>
                  Để sau
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
