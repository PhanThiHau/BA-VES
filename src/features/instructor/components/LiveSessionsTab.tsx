import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Play,
  Radio,
  Send,
  X,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { classNames } from "../../../utils/format";
import type { LiveSessionItem, ScenarioEventConfig } from "../instructorData";

interface LiveSessionsTabProps {
  sessions: LiveSessionItem[];
  availableEvents: ScenarioEventConfig[];
  onTriggerEventToSession: (sessionId: string, event: ScenarioEventConfig) => void;
  onSendCoachHint: (sessionId: string, hint: string) => void;
}

export function LiveSessionsTab({
  sessions,
  availableEvents,
  onTriggerEventToSession,
  onSendCoachHint,
}: LiveSessionsTabProps) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || "");
  const [showTriggerEventModal, setShowTriggerEventModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>(availableEvents[0]?.id || "");
  const [coachHintInput, setCoachHintInput] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const selectedEvent = availableEvents.find((e) => e.id === selectedEventId) || availableEvents[0];

  const handleTriggerEvent = () => {
    if (!activeSession || !selectedEvent) return;
    onTriggerEventToSession(activeSession.id, selectedEvent);
    setShowTriggerEventModal(false);
    setToastMessage(`Đã đưa tình huống "${selectedEvent.title}" vào phiên của học viên ${activeSession.learner}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSendHint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachHintInput.trim() || !activeSession) return;
    onSendCoachHint(activeSession.id, coachHintInput);
    setCoachHintInput("");
    setToastMessage(`Đã gửi lời nhắc phương pháp tới học viên ${activeSession.learner}.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#132d49] px-4 py-3 text-xs font-bold text-white shadow-xl animate-fade-in border border-[#2f638c]">
          <CheckCircle2 size={16} className="text-[#32b583]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Thanh Điều Hướng Trên Cùng */}
      <Card className="p-5 border-[#d9e4ec] bg-[#f8fafc]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#2d7b60]" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#132d49]">
                Phòng Quan Sát Phỏng Vấn Trực Tiếp (Live Command Center)
              </h2>
              <p className="text-xs text-[#667d93]">
                Theo dõi luồng đối thoại giữa học viên và nhân vật AI. Bấm chọn một học viên bên trái để xem trực tiếp đoạn chat bên phải.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-[#eaf1f7] px-3 py-1.5 text-xs font-bold text-[#2f638c]">
              {sessions.length} phiên đang trực tuyến
            </span>
            <Button
              size="sm"
              onClick={() => setShowTriggerEventModal(true)}
              className="gap-1.5 text-xs bg-[#9b681d] hover:bg-[#825615] text-white font-bold"
            >
              <Radio size={14} /> Gửi sự cố thử thách
            </Button>
          </div>
        </div>
      </Card>

      {/* Bố Cục Hai Cột: Cột Trái Danh Sách Học Viên - Cột Phải Luồng Chat Trực Tiếp */}
      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Cột Trái: Danh Sách Phiên Đang Chạy */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#667d93]">
              Học viên đang thực hành ({sessions.length})
            </span>
            <span className="text-[11px] text-[#8291a1]">Bấm để xem đối thoại</span>
          </div>

          <div className="space-y-3">
            {sessions.map((session) => {
              const isSelected = session.id === activeSession?.id;
              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={classNames(
                    "w-full rounded-2xl border p-4 text-left transition-all duration-200",
                    isSelected
                      ? "border-[#2f638c] bg-[#f4f9fd] shadow-md ring-2 ring-[#2f638c]/20"
                      : "border-[#d9e4ec] bg-white hover:border-[#b8cfdf] hover:bg-[#fafcfd]"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eaf1f7] text-xs font-black text-[#2f638c]">
                        {session.learner
                          .split(" ")
                          .slice(-2)
                          .map((p) => p[0])
                          .join("")}
                      </span>
                      <div>
                        <strong className="text-xs font-bold text-[#132d49]">
                          {session.learner}
                        </strong>
                        <p className="text-[11px] text-[#667d93]">{session.stage}</p>
                      </div>
                    </div>
                    <Badge
                      tone={
                        session.severity === "Đang làm tốt"
                          ? "green"
                          : session.severity === "Có sự kiện thay đổi"
                          ? "navy"
                          : "amber"
                      }
                    >
                      {session.severity}
                    </Badge>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] text-[#667d93] mb-1">
                      <span>Tiến độ khám phá</span>
                      <span className="font-mono font-bold text-[#132d49]">{session.progress}%</span>
                    </div>
                    <ProgressBar
                      value={session.progress}
                      color={session.progress >= 70 ? "#2d7b60" : "#2f638c"}
                    />
                  </div>

                  <div className="mt-2.5 flex items-center justify-between border-t border-[#edf2f6] pt-2 text-[10px] text-[#8291a1]">
                    <span>Phỏng vấn: <strong className="text-[#132d49]">{session.currentStakeholder}</strong></span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock3 size={11} /> {session.elapsed}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cột Phải: Khung Hội Thoại Trực Tiếp (Live Stream) */}
        {activeSession ? (
          <Card className="flex flex-col h-[680px] overflow-hidden border-[#d9e4ec] shadow-md">
            {/* Thanh Tiêu Đề Khung Chat */}
            <div className="flex flex-col gap-2 border-b border-[#e2e9ef] bg-[#f8fafc] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-[#132d49]">
                    {activeSession.learner}
                  </h3>
                  <span className="text-xs text-[#667d93]">
                    • Đang nói chuyện với: <strong className="text-[#2f638c]">{activeSession.currentStakeholder}</strong>
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#8291a1]">
                  Đề bài: {activeSession.scenario} · Thời gian thực hành: {activeSession.elapsed}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowTriggerEventModal(true)}
                  className="h-8 px-2.5 text-xs text-[#9b681d] border-[#f2d3a3] hover:bg-[#fff9f0] font-bold"
                >
                  <Radio size={13} className="mr-1" /> Gửi sự cố
                </Button>
              </div>
            </div>

            {/* Dấu Hiệu AI Nhận Diện */}
            <div className="border-b border-[#fae2c5] bg-[#fffaf1] px-4 py-2 text-xs text-[#72664f] flex items-center gap-2">
              <AlertTriangle size={14} className="text-[#9b681d] shrink-0" />
              <span><strong>AI nhận diện:</strong> {activeSession.signal}</span>
            </div>

            {/* Nội Dung Các Tin Nhắn Đối Thoại */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#fafbfc]">
              {activeSession.transcript.map((msg, index) => (
                <div
                  key={index}
                  className={classNames(
                    "flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs leading-5 shadow-xs transition-all",
                    msg.sender === "learner"
                      ? "ml-auto bg-[#132d49] text-white rounded-br-xs"
                      : "mr-auto bg-white border border-[#d9e4ec] text-[#132d49] rounded-bl-xs"
                  )}
                >
                  <div className="flex items-center justify-between gap-3 text-[10px] opacity-75 mb-1">
                    <span className="font-bold">
                      {msg.sender === "learner" ? "Học viên (Đặt câu hỏi)" : msg.stakeholderName || "Nhân vật AI"}
                    </span>
                    <span>{msg.time}</span>
                  </div>
                  <p>{msg.text}</p>
                  {msg.technique && (
                    <span className="mt-1.5 self-start rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">
                      Cách hỏi: {msg.technique}
                    </span>
                  )}
                  {msg.isEvidence && (
                    <span className="mt-1.5 self-start rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                      ★ Đã phát hiện được sự thật quan trọng
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Khung Gửi Lời Nhắc Nhở Phương Pháp Dành Cho Giảng Viên */}
            <form onSubmit={handleSendHint} className="border-t border-[#e2e9ef] p-4 bg-white">
              <label className="block text-xs font-bold text-[#132d49] mb-1">
                Gửi lời nhắc nhở phương pháp tới học viên (không nhắc đáp án)
              </label>
              <div className="flex gap-2">
                <input
                  value={coachHintInput}
                  onChange={(e) => setCoachHintInput(e.target.value)}
                  placeholder="VD: Em hãy hỏi thêm về quy định khóa sổ kế toán tháng và ai có quyền duyệt..."
                  className="flex-1 rounded-xl border border-[#d9e4ec] px-3.5 py-2 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
                <Button size="sm" type="submit" className="gap-1.5 text-xs font-bold">
                  <Send size={14} /> Gửi lời nhắc
                </Button>
              </div>
            </form>
          </Card>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#d9e4ec] bg-white text-xs text-[#667d93]">
            Chọn một bạn học viên từ danh sách bên trái để mở phòng quan sát.
          </div>
        )}
      </div>

      {/* Cửa Sổ Bắn Sự Cố Vào Buổi Phỏng Vấn (Modal) */}
      {showTriggerEventModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <div className="flex items-center gap-2 text-[#9b681d]">
                <Radio size={18} />
                <h3 className="text-sm font-bold text-[#132d49]">
                  Gửi Sự Cố Bất Ngờ Vào Phiên Phỏng Vấn
                </h3>
              </div>
              <button
                onClick={() => setShowTriggerEventModal(false)}
                className="text-[#667d93] hover:text-[#132d49]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-[#f5f8fa] p-3 text-xs border border-[#e5edf2]">
                <span className="text-[#667d93]">Học viên nhận tình huống:</span>
                <strong className="block text-sm text-[#132d49] mt-0.5">
                  {activeSession.learner} ({activeSession.scenario})
                </strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">
                  Chọn tình huống bất ngờ muốn thử thách học viên:
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                >
                  {availableEvents.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvent && (
                <div className="rounded-xl border border-[#dfe8ee] p-4 bg-[#fffaf1]">
                  <strong className="text-xs font-bold text-[#9b681d]">Diễn biến sự việc:</strong>
                  <p className="mt-1 text-xs text-[#72664f]">{selectedEvent.description}</p>
                  <div className="mt-2 text-xs">
                    <span className="font-bold text-[#132d49]">Nhân vật AI sẽ bắt đầu nói:</span>
                    <p className="mt-0.5 text-[#526b81] italic">&quot;{selectedEvent.injectedFact}&quot;</p>
                  </div>
                </div>
              )}

              <p className="text-[11px] leading-5 text-[#667d93]">
                Khi thầy cô bấm xác nhận, nhân vật AI sẽ lập tức nhận sự cố này và sẽ phản hồi khi học viên đặt câu hỏi tiếp theo.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e9ef]">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowTriggerEventModal(false)}
                >
                  Hủy
                </Button>
                <Button size="sm" onClick={handleTriggerEvent} className="gap-1.5 font-bold">
                  <Play size={14} /> Xác Nhận Gửi Sự Cố Ngay
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
