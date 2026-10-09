import { AlertTriangle, Bookmark, Check, ChevronRight, Clock3, FileText, Lightbulb, MessageSquareQuote, MoreHorizontal, Send, Sparkles, StickyNote, Users } from "lucide-react";
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

const notesByStakeholder: Record<string, string> = {
  warehouse: "• Lấy hàng theo đợt (Wave picking): 8h, 13h, 17h\n• Hàng trả về nằm tại khu cách ly (quarantine), chỉ cập nhật số lượng cuối ca\n• Khu vực B thường xuyên mất kết nối Wi-Fi; máy quét gửi trễ dễ tạo bản ghi trùng lặp\n\nCâu hỏi mở: Cam kết SLA kiểm định chất lượng (QC) cho hàng trả là bao lâu?",
  planner: "• Dự báo nhu cầu 8 tuần và định mức min-max hiện lập trên file Excel cá nhân\n• Có quy tắc ngầm: Kiểm tra kho dư thừa trước khi tạo PO mua sắm mới\n• Chưa có công thức tính safety stock cho giai đoạn khuyến mãi lớn\n\nCâu hỏi mở: Cách tính safety stock khi có khuyến mãi chuỗi?",
  finance: "• Yêu cầu kiểm toán khắt khe: Lưu rõ người thực hiện, người duyệt, thời gian, lý do, số lượng trước/sau\n• Phân quyền duyệt: < 10tr hệ thống tự động; 10–50tr Trưởng kho; > 50tr Giám đốc Tài chính\n\nCâu hỏi mở: Xử lý thế nào với điều chỉnh tồn kho khi đã khóa sổ kế toán tháng?",
  supply: "• Thử nghiệm tại 3 kho miền Nam trong vòng 3 tháng\n• Chỉ tiêu KPI: Tỷ lệ đứt hàng (stockout) < 5%; Tỷ lệ đáp ứng (fill rate) >= 96%\n• Mức tăng chi phí lưu kho không vượt quá 8%\n\nCâu hỏi mở: Ai có thẩm quyền ghi đè (override) quyết định chuyển kho?",
  operator: "• Khi mất mạng Wifi: Ghi giấy tạm → nhập bổ sung sau ca gây trễ dữ liệu\n• Màn hình máy quét cũ không hiển thị danh sách giao dịch đang chờ đồng bộ\n\nCâu hỏi mở: Model thiết bị quét mã vạch hiện tại và tần suất rớt mạng?",
  sponsor: "• Thời gian triển khai MVP 6 tháng / Ngân sách tối đa 4 tỷ VNĐ\n• Cam kết không thay đổi hệ thống POS cửa hàng và không làm gián đoạn vận hành kho\n\nCâu hỏi mở: Tiêu chí dừng dự án (stop criteria) là gì?",
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
    toggleEvidence,
    evidenceCount,
    eventOpen,
    setEventOpen,
    isReplying,
  } = useApp();

  const [draft, setDraft] = useState("");
  const [rightTab, setRightTab] = useState<"notes" | "evidence">("notes");
  const messageListRef = useRef<HTMLDivElement>(null);

  const active = stakeholders.find((person) => person.id === activeStakeholderId) ?? stakeholders[2];
  const activeEvidence = evidenceRegister.filter((item) => item.stakeholderId === active.id);
  const prompts = coachPrompts[active.id] ?? [];
  const quickPrompts = suggestedQuickPrompts[active.id] ?? [];

  const submit = async () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    await sendMessage(text);
  };

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
  }, [active.id, isReplying, messages.length]);

  return (
    <div className="-m-3 sm:-m-5 lg:-m-7">
      <div className="flex min-h-[calc(100vh-64px)] flex-col bg-white xl:h-[calc(100dvh-56px)] xl:min-h-0">
        {/* Top Control Bar */}
        <div className="flex flex-col gap-2 border-b border-slate/15 bg-navy-deep px-4 py-3 text-white lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="green">Đang phỏng vấn</Badge>
              <span className="font-mono text-xs text-mist">
                INV-2026-014 · Phỏng vấn 4/6 nhân sự
              </span>
            </div>
            <h1 className="mt-1 truncate text-base font-bold text-white sm:text-lg">
              Mô phỏng khơi gợi yêu cầu: Quản lý tồn kho VinaSupply
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex items-center gap-1.5 rounded-lg bg-navy/80 px-2.5 py-1 text-xs font-semibold text-mist">
              <Clock3 size={15} className="text-brass" />
              56:24
            </span>
            <div className="hidden w-24 sm:block">
              <ProgressBar value={67} />
            </div>
            <Button
              variant="secondary"
              onClick={() => setEventOpen(true)}
              className="border-amber-400/30 bg-amber-500/10 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
            >
              <AlertTriangle size={15} className="text-amber-400" />
              Sự kiện khẩn cấp
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
        <div className="grid flex-1 xl:min-h-0 xl:grid-cols-[230px_minmax(420px,1fr)_310px]">
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
                  onClick={() => setActiveStakeholderId(person.id)}
                  className={classNames(
                    "flex min-w-[180px] items-center gap-2.5 rounded-xl border p-2.5 text-left transition xl:min-w-0",
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate">
                Tiến độ nhiệm vụ
              </p>
              <div className="mt-3 space-y-2.5 text-xs">
                {[
                  ["Kế hoạch BA đã duyệt", true],
                  ["Đã phỏng vấn 4/6 nhân sự", true],
                  [`${evidenceCount}/12 bằng chứng đã lưu`, false],
                  ["Xác thực 3/4 phát hiện nghiệp vụ", false],
                ].map(([label, done]) => (
                  <div key={String(label)} className="flex items-center gap-2">
                    <span
                      className={classNames(
                        "grid h-4 w-4 place-items-center rounded-full text-[10px]",
                        done
                          ? "bg-emerald-100 text-emerald-700 font-bold"
                          : "border border-slate/30 text-slate"
                      )}
                    >
                      {done && <Check size={11} />}
                    </span>
                    <span className="text-slate font-medium">{String(label)}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Center Column: Interactive Chat Stream */}
          <section className="flex min-h-[560px] flex-col border-b border-slate/15 xl:min-h-0 xl:border-b-0 xl:border-r">
            {/* Active Stakeholder Bar */}
            <div className="flex items-center justify-between border-b border-slate/15 bg-white px-4 py-2.5">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-xs font-bold text-navy shadow-xs"
                  style={{ backgroundColor: active.color }}
                >
                  {active.initials}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="block truncate text-sm font-bold text-navy">
                      {active.name}
                    </strong>
                    <span className="rounded-full bg-mist/60 px-2 py-0.5 text-[10px] font-bold text-navy">
                      {active.role}
                    </span>
                  </div>
                  <span className="block truncate text-xs text-slate">
                    Trọng tâm: {active.focus}
                  </span>
                </div>
              </div>
              <button aria-label="More options" className="grid h-8 w-8 place-items-center text-slate hover:text-navy">
                <MoreHorizontal size={17} />
              </button>
            </div>

            {/* Message Stream */}
            <div
              ref={messageListRef}
              className="min-h-0 flex-1 space-y-3.5 overflow-y-auto overscroll-contain bg-[#f9fafc] p-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={classNames(
                    "flex",
                    message.sender === "learner" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={classNames(
                      "max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-xs sm:max-w-[80%]",
                      message.sender === "learner"
                        ? "rounded-br-xs bg-navy text-white"
                        : "rounded-bl-xs border border-slate/15 bg-white text-navy"
                    )}
                  >
                    {message.technique && (
                      <span className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        <Sparkles size={11} /> {message.technique}
                      </span>
                    )}
                    <p className="leading-6 text-[13px]">{message.text}</p>
                    <div
                      className={classNames(
                        "mt-1.5 flex items-center gap-2 text-[11px]",
                        message.sender === "learner"
                          ? "justify-end text-mist"
                          : "text-slate"
                      )}
                    >
                      <span>{message.time}</span>
                      {message.sender === "agent" && (
                        <button
                          onClick={() => toggleEvidence(message.id)}
                          className={classNames(
                            "flex items-center gap-1 font-semibold transition-colors",
                            message.evidence
                              ? "text-emerald-700"
                              : "hover:text-navy"
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

          {/* Right Column: BA Notes & Evidence Vault */}
          <aside className="bg-[#f8fafc] xl:overflow-y-auto">
            <div className="grid grid-cols-2 border-b border-slate/15 bg-white">
              <button
                onClick={() => setRightTab("notes")}
                className={classNames(
                  "flex items-center justify-center gap-1.5 border-b-2 py-3 text-xs font-semibold transition",
                  rightTab === "notes"
                    ? "border-navy text-navy"
                    : "border-transparent text-slate hover:text-navy"
                )}
              >
                <StickyNote size={14} /> Ghi chú BA
              </button>
              <button
                onClick={() => setRightTab("evidence")}
                className={classNames(
                  "flex items-center justify-center gap-1.5 border-b-2 py-3 text-xs font-semibold transition",
                  rightTab === "evidence"
                    ? "border-navy text-navy"
                    : "border-transparent text-slate hover:text-navy"
                )}
              >
                <FileText size={14} /> Bằng chứng ({activeEvidence.length})
              </button>
            </div>

            <div className="p-3.5">
              {rightTab === "notes" ? (
                <>
                  <textarea
                    key={active.id}
                    className="min-h-36 w-full rounded-xl border border-slate/20 bg-white p-3 text-xs leading-5 text-navy outline-none focus:border-navy"
                    defaultValue={notesByStakeholder[active.id]}
                  />

                  {/* Coach Prompts */}
                  <div className="mt-4 space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate">
                      Gợi ý từ AI Coach & BABOK®
                    </p>
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
                </>
              ) : (
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
    </div>
  );
}
