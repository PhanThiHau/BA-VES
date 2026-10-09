import { AlertTriangle, ArrowRight, CheckCircle2, CircleHelp, ClipboardList, FileQuestion, FileSearch, GitMerge, Link2, MessageSquareQuote, RefreshCcw, SearchCheck, ShieldAlert, Truck, Users } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { stakeholders } from "../../constants/scenario";
import { requirements } from "../../constants/scenario";
import { confirmations, conflicts, decisions, evidenceRegister, findings, openQuestions, risks, traceabilityRows } from "../../constants/trainingScenario";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";

const tabs = [
  "Tổng quan phiên",
  "Phát hiện & Bằng chứng",
  "Giả định & Lỗ hổng",
  "Xung đột & Câu hỏi mở",
  "Đặc tả yêu cầu",
  "Thẩm định Stakeholder",
  "Ma trận truy vết (RTM)",
  "Tác động thay đổi",
  "Rủi ro & Quyết định",
] as const;
type Tab = typeof tabs[number];

const statusBadge = (status: string) => {
  if (status === "confirmed" || status === "Complete" || status === "resolved" || status === "Approved") {
    return <Badge tone="green">{status === "confirmed" ? "Đã xác nhận" : status === "resolved" ? "Đã giải quyết" : status === "Approved" ? "Đã phê duyệt" : "Hoàn tất"}</Badge>;
  }
  return <Badge tone="amber">{status === "needs-clarification" ? "Cần làm rõ" : status === "open" ? "Đang mở" : status === "unconfirmed" ? "Chưa kiểm chứng" : status}</Badge>;
};

export function AnalysisHubPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const [tab, setTab] = useState<Tab>("Tổng quan phiên");

  return (
    <>
      <PageHeader
        eyebrow="Bước 3/5 · Phân tích & Thẩm định"
        title="Trung tâm Phân tích & Bằng chứng"
        description="Đối soát bằng chứng phỏng vấn, giải quyết xung đột, phân loại giả định và kiểm soát tính truy vết theo chuẩn BABOK® v3."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("simulation")} className="border-slate/20 text-xs">
              Biên bản phỏng vấn
            </Button>
            <Button onClick={() => navigate("artifacts")} className="bg-navy text-xs font-semibold hover:bg-navy-light">
              Tài liệu bàn giao (BRD, RTM) <ArrowRight size={16} />
            </Button>
          </>
        }
      />

      {/* Metrics Ribbon */}
      <Card className="mb-5 flex divide-x divide-slate/15 overflow-x-auto border-slate/15">
        {[
          ["6/6", "Stakeholder đã phỏng vấn", "bg-navy/10 text-navy"],
          ["9", "Bằng chứng đã lưu", "bg-emerald-500/10 text-emerald-800"],
          ["4", "Phát hiện nghiệp vụ", "bg-purple-500/10 text-purple-800"],
          ["4", "Giả định cần kiểm chứng", "bg-amber-500/10 text-amber-800"],
          ["5", "Yêu cầu đã đặc tả", "bg-sky-500/10 text-sky-800"],
          ["1", "Điểm nghẽn cần giải quyết", "bg-rose-500/10 text-rose-800"],
        ].map(([value, label, tone]) => (
          <div key={label} className="flex min-w-[170px] flex-1 items-center gap-3 px-4 py-3">
            <span className={classNames("grid h-9 min-w-9 place-items-center rounded-xl px-2 text-sm font-black", tone)}>
              {value}
            </span>
            <span className="text-xs font-medium text-slate">{label}</span>
          </div>
        ))}
      </Card>

      {/* Tabs navigation */}
      <div className="mb-5 flex gap-1.5 overflow-x-auto rounded-2xl border border-slate/15 bg-white p-1.5 shadow-xs">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={classNames(
              "shrink-0 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all",
              tab === item
                ? "bg-navy text-white shadow-xs"
                : "text-slate hover:bg-mist/30 hover:text-navy"
            )}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Tab: Session Summary */}
      {tab === "Tổng quan phiên" && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="overflow-hidden border-slate/15">
            <div className="border-b border-slate/10 p-5">
              <h2 className="text-base font-bold text-navy">Sổ ghi chép các phiên khơi gợi yêu cầu (Elicitation Register)</h2>
              <p className="mt-1 text-xs text-slate">Mỗi cuộc phỏng vấn có kỹ thuật áp dụng, phạm vi thông tin thu thập và kết quả cụ thể.</p>
            </div>
            <div className="divide-y divide-slate/10">
              {stakeholders.map((person, index) => (
                <div key={person.id} className="grid gap-4 p-5 md:grid-cols-[220px_1fr_auto] md:items-center">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl text-xs font-bold text-navy shadow-xs" style={{ backgroundColor: person.color }}>
                      {person.initials}
                    </span>
                    <div>
                      <strong className="block text-sm font-bold text-navy">{person.name}</strong>
                      <span className="text-xs text-slate">{person.role}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy/90">
                      {[
                        "Thời gian, ngân sách & các mục nằm ngoài phạm vi",
                        "Chỉ số KPI, phạm vi thử nghiệm & quyền ghi đè",
                        "Quy trình kho, hàng trả về & độ chính xác tồn kho",
                        "Dự báo nhu cầu, định mức min-max & ưu tiên chuyển kho",
                        "Máy quét offline, rớt mạng & sai sót thao tác",
                        "Điều chỉnh số liệu, kiểm toán & phân quyền duyệt",
                      ][index]}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {([
                        ["Ràng buộc", "Phạm vi", "Quản trị"],
                        ["KPI", "Phạm vi", "Quyết định"],
                        ["Quy trình", "Điểm đau", "Dữ liệu"],
                        ["Quy tắc", "Dữ liệu", "Ngoại lệ"],
                        ["Quan sát", "Điểm đau", "Phi chức năng"],
                        ["Quy tắc", "Kiểm soát", "Kiểm toán"],
                      ][index]).map((item) => (
                        <span key={item} className="rounded-md bg-mist/50 px-2 py-0.5 text-[10px] font-semibold text-navy/70">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge tone={index < 4 ? "green" : "amber"}>
                      {index < 4 ? "Đủ dữ liệu" : "Cần làm rõ thêm"}
                    </Badge>
                    <p className="mt-1.5 text-[11px] text-slate">
                      {[
                        "Khơi gợi ràng buộc",
                        "Khơi gợi KPI",
                        "Phỏng vấn + Đối soát",
                        "Phân tích quyết định",
                        "Quan sát thực địa",
                        "Quy tắc nghiệp vụ",
                      ][index]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <aside className="space-y-5">
            <Card className="p-5 border-slate/15">
              <div className="flex items-center gap-2.5">
                <SearchCheck className="text-navy" size={20} />
                <h2 className="text-sm font-bold text-navy">Tiêu chuẩn hoàn tất (Definition of Done)</h2>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  ["Nguồn gốc và thời điểm cho từng bằng chứng", true],
                  ["Phân biệt rõ sự thật (fact) và nhận định chủ quan", true],
                  ["Xung đột có người chịu trách nhiệm giải quyết", true],
                  ["Stakeholder xác nhận tính chính xác của phát hiện", false],
                  ["Yêu cầu có tiêu chí chấp nhận đo lường được", true],
                ].map(([label, done]) => (
                  <div key={String(label)} className="flex items-start gap-2.5 text-xs">
                    <span className={classNames("mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full", done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {done ? <CheckCircle2 size={12} /> : <CircleHelp size={12} />}
                    </span>
                    <span className="leading-5 text-slate font-medium">{String(label)}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-amber-400/30 bg-amber-500/5 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
                <div>
                  <h3 className="text-xs font-bold text-amber-900 uppercase">Điểm nghẽn cần giải quyết (FND-04)</h3>
                  <p className="mt-1.5 text-xs leading-5 text-amber-900/80">
                    Phát hiện FND-04 chưa được nhân viên kho xác thực vì máy quét cũ không hiển thị hàng đợi giao dịch đang chờ đồng bộ dữ liệu.
                  </p>
                  <button onClick={() => setTab("Xung đột & Câu hỏi mở")} className="mt-3 text-xs font-bold text-amber-800 hover:underline">
                    Xem câu hỏi tồn đọng →
                  </button>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      )}

      {/* Tab: Findings & Evidence */}
      {tab === "Phát hiện & Bằng chứng" && (
        <div className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            {findings.map((finding) => (
              <Card key={finding.id} className="p-5 border-slate/15">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy/10 font-mono text-xs font-bold text-navy">
                      {finding.id.replace("FND-", "")}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate">{finding.id} · Phụ trách: {finding.owner}</p>
                      <h3 className="mt-1 text-sm font-bold text-navy">{finding.title}</h3>
                    </div>
                  </div>
                  {statusBadge(finding.status)}
                </div>
                <p className="mt-3 text-xs leading-5 text-slate">{finding.interpretation}</p>
                <div className="mt-4 flex items-center gap-2 border-t border-slate/10 pt-3 text-xs font-semibold text-navy">
                  <Link2 size={13} className="text-brass" /> Bằng chứng liên kết: {finding.evidenceIds.join(" · ")}
                </div>
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden border-slate/15">
            <div className="flex items-center gap-3 border-b border-slate/10 p-5">
              <MessageSquareQuote className="text-navy" size={20} />
              <div>
                <h2 className="text-base font-bold text-navy">Kho lưu trữ bằng chứng phỏng vấn (Evidence Register)</h2>
                <p className="text-xs text-slate">Dữ liệu gốc giữ nguyên ngữ cảnh, người cung cấp, mức độ tin cậy và liên kết tới yêu cầu.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-xs">
                <thead className="bg-mist/30 text-[11px] uppercase tracking-wider text-slate">
                  <tr>
                    <th className="px-5 py-3.5">Mã ID</th>
                    <th className="px-5 py-3.5">Trích dẫn bằng chứng</th>
                    <th className="px-5 py-3.5">Nguồn cung cấp</th>
                    <th className="px-5 py-3.5">Phân loại</th>
                    <th className="px-5 py-3.5">Độ tin cậy</th>
                    <th className="px-5 py-3.5">Trạng thái</th>
                    <th className="px-5 py-3.5">Yêu cầu liên kết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate/10">
                  {evidenceRegister.map((item) => (
                    <tr key={item.id} className="hover:bg-mist/10">
                      <td className="px-5 py-4 font-mono font-bold text-navy">{item.id}</td>
                      <td className="max-w-md px-5 py-4 font-medium leading-5 text-navy/90">“{item.quote}”</td>
                      <td className="px-5 py-4 text-slate">{item.source}</td>
                      <td className="px-5 py-4"><Badge tone="navy">{item.category}</Badge></td>
                      <td className="px-5 py-4 text-slate">{item.confidence}</td>
                      <td className="px-5 py-4">{statusBadge(item.status)}</td>
                      <td className="px-5 py-4 font-mono font-semibold text-navy">{item.linkedRequirements.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Conflicts & Questions */}
      {tab === "Xung đột & Câu hỏi mở" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {conflicts.map((conflict) => (
              <Card key={conflict.id} className="p-6 border-slate/15">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate">{conflict.id}</p>
                    <h2 className="mt-1 text-base font-bold text-navy">{conflict.topic}</h2>
                  </div>
                  {statusBadge(conflict.status)}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {conflict.positions.map((item) => (
                    <div key={item.stakeholder} className="rounded-xl border border-slate/10 bg-mist/20 p-3.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-navy">{item.stakeholder}</p>
                      <p className="mt-1.5 text-xs leading-5 text-slate">{item.position}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3.5 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3.5">
                  <strong className="text-xs font-bold text-amber-800">Tác động nếu không xử lý</strong>
                  <p className="mt-1 text-xs leading-5 text-amber-900/80">{conflict.impact}</p>
                </div>
                <div className="mt-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <strong className="text-xs font-bold text-emerald-800">Giải pháp / Hướng quyết định</strong>
                  <p className="mt-1 text-xs leading-5 text-emerald-900/80">{conflict.resolution}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="h-fit p-5 border-slate/15">
            <div className="flex items-center gap-2.5">
              <CircleHelp className="text-brass" size={20} />
              <h2 className="text-sm font-bold text-navy">Sổ theo dõi câu hỏi mở</h2>
            </div>
            <div className="mt-4 space-y-3">
              {openQuestions.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate/10 p-3.5">
                  <div className="flex items-center justify-between">
                    <Badge tone="amber">{item.id}</Badge>
                    <span className="text-[11px] text-slate">Hạn: {item.due}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold leading-5 text-navy">{item.question}</p>
                  <p className="mt-2 text-[11px] text-slate">Phụ trách: {item.owner} · {item.relatedTo}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Confirmation */}
      {tab === "Thẩm định Stakeholder" && (
        <div className="grid gap-5 lg:grid-cols-2">
          {confirmations.map((item) => {
            const finding = findings.find((entry) => entry.id === item.findingId);
            return (
              <Card key={item.id} className="p-6 border-slate/15">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate">{item.id} · {item.findingId}</p>
                    <h2 className="mt-1 text-sm font-bold text-navy">{finding?.title}</h2>
                  </div>
                  {statusBadge(item.status)}
                </div>
                <div className="mt-4 flex gap-3 rounded-xl bg-mist/30 p-4">
                  <Users className="mt-0.5 shrink-0 text-navy" size={18} />
                  <div>
                    <strong className="text-xs font-bold text-navy">{item.stakeholder}</strong>
                    <p className="mt-1.5 text-xs leading-5 text-slate italic">“{item.response}”</p>
                    {item.confirmedAt && (
                      <p className="mt-2 text-[11px] text-slate/80">Phản hồi lúc: {item.confirmedAt}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab: Traceability Matrix */}
      {tab === "Ma trận truy vết (RTM)" && (
        <Card className="overflow-hidden border-slate/15">
          <div className="flex items-center gap-3 border-b border-slate/10 p-5">
            <GitMerge className="text-navy" size={20} />
            <div>
              <h2 className="text-base font-bold text-navy">Chuỗi truy vết: Mục tiêu → Phát hiện → Bằng chứng → Yêu cầu → Tiêu chí nghiệm thu</h2>
              <p className="text-xs text-slate">Đảm bảo từng yêu cầu phần mềm đều bắt nguồn từ nhu cầu kinh doanh và có thể kiểm thử được.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-xs">
              <thead className="bg-mist/30 text-[11px] uppercase tracking-wider text-slate">
                <tr>
                  {["Mục tiêu kinh doanh", "Phát hiện", "Bằng chứng", "Yêu cầu hệ thống", "Tiêu chí nghiệm thu", "Độ phủ"].map((h) => (
                    <th key={h} className="px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {traceabilityRows.map((row, index) => (
                  <tr key={index} className="align-top hover:bg-mist/10">
                    <td className="px-5 py-4 font-semibold text-navy">{row.objective}</td>
                    <td className="px-5 py-4 font-mono font-bold text-navy">{row.finding}</td>
                    <td className="px-5 py-4 text-slate">{row.evidence}</td>
                    <td className="px-5 py-4 font-mono font-bold text-navy">{row.requirement}</td>
                    <td className="max-w-sm px-5 py-4 leading-5 text-slate">{row.acceptance}</td>
                    <td className="px-5 py-4">{statusBadge(row.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab: Risks & Decisions */}
      {tab === "Rủi ro & Quyết định" && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <Card className="overflow-hidden border-slate/15">
            <div className="flex items-center gap-3 border-b border-slate/10 p-5">
              <ShieldAlert className="text-amber-600" size={20} />
              <h2 className="text-base font-bold text-navy">Nhật ký rủi ro (Risk Register)</h2>
            </div>
            <div className="divide-y divide-slate/10">
              {risks.map((risk) => (
                <div key={risk.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate">{risk.id}</span>
                      <h3 className="mt-0.5 text-sm font-bold text-navy">{risk.title}</h3>
                    </div>
                    <div className="flex gap-1.5">
                      <Badge tone={risk.probability === "High" ? "red" : "amber"}>Xác suất: {risk.probability}</Badge>
                      <Badge tone={risk.impact === "High" ? "red" : "amber"}>Tác động: {risk.impact}</Badge>
                    </div>
                  </div>
                  <p className="mt-2.5 text-xs leading-5 text-slate">
                    <strong className="text-navy">Biện pháp ứng phó:</strong> {risk.response}
                  </p>
                  <p className="mt-1 text-[11px] text-slate">Phụ trách: {risk.owner}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="h-fit p-5 border-slate/15">
            <div className="flex items-center gap-3">
              <FileSearch className="text-navy" size={20} />
              <h2 className="text-base font-bold text-navy">Sổ ghi chép quyết định (Decision Log)</h2>
            </div>
            <div className="mt-4 space-y-3.5">
              {decisions.map((decision) => (
                <div key={decision.id} className="rounded-xl border border-slate/10 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate">{decision.id}</span>
                    {statusBadge(decision.status)}
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-navy">{decision.title}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate">{decision.rationale}</p>
                  <p className="mt-2 text-[11px] text-slate/80">{decision.decidedBy} · {decision.date}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Change Impact */}
      {tab === "Tác động thay đổi" && <ChangeImpactSection />}

      {/* Tab: Assumptions & Gaps */}
      {tab === "Giả định & Lỗ hổng" && <AssumptionsAndGapsSection />}

      {/* Tab: Requirements */}
      {tab === "Đặc tả yêu cầu" && <RequirementAnalysisSection />}
    </>
  );
}

function AssumptionsAndGapsSection() {
  const assumptions = [
    {
      id: "ASM-01",
      statement: "Độ trễ truyền tin của POS là nguyên nhân chính gây đứt gãy tồn kho.",
      basis: "Báo cáo vận hành Quý 3",
      impact: "Giải pháp có thể sai hướng nếu nguyên nhân thực sự nằm ở khâu phân bổ hoặc khu cách ly.",
      owner: "Giám đốc Chuỗi cung ứng",
      status: "needs-clarification",
      linked: "FND-01 · RSK-01",
    },
    {
      id: "ASM-02",
      statement: "Tất cả các kho đều dùng chung mã SKU và đơn vị tính (UOM).",
      basis: "Hồ sơ dự án (Project Brief)",
      impact: "Nếu sai, quy tắc ưu tiên chuyển kho sẽ gây sai lệch tồn kho vật lý.",
      owner: "Trưởng nhóm Dữ liệu chủ",
      status: "confirmed",
      linked: "FR-08 · DATA-02",
    },
    {
      id: "ASM-03",
      statement: "Điều chuyển tồn kho nội bộ luôn có chi phí rẻ hơn tạo đơn mua hàng mới.",
      basis: "Ý kiến ban đầu của Chuyên viên Kế hoạch",
      impact: "Chi phí có thể đội lên nếu cung đường chuyển kho quá xa hoặc nhà cung cấp có chiết khấu cao.",
      owner: "Kế toán trưởng",
      status: "needs-clarification",
      linked: "CF-02 · DEC-01",
    },
    {
      id: "ASM-04",
      statement: "Máy quét mã vạch hiện tại hỗ trợ lưu hàng đợi offline và sinh mã giao dịch duy nhất.",
      basis: "Tài liệu kỹ thuật thiết bị chưa được kiểm chứng",
      impact: "Thiết kế nghiệp vụ offline có thể không khả thi trên thiết bị hiện có.",
      owner: "Bộ phận IT Kho vận",
      status: "unconfirmed",
      linked: "FND-04 · NFR-03",
    },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card className="overflow-hidden border-slate/15">
        <div className="flex items-center gap-3 border-b border-slate/10 p-5">
          <FileQuestion className="text-navy" size={20} />
          <div>
            <h2 className="text-base font-bold text-navy">Sổ ghi nhận giả định (Assumption Register)</h2>
            <p className="text-xs text-slate">Những điều học viên đang ngầm định là đúng nhưng cần kiểm chứng trước khi đưa vào thiết kế hệ thống.</p>
          </div>
        </div>
        <div className="divide-y divide-slate/10">
          {assumptions.map((item) => (
            <div key={item.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-bold text-slate">{item.id}</p>
                  <h3 className="mt-0.5 text-sm font-bold text-navy">{item.statement}</h3>
                </div>
                {statusBadge(item.status)}
              </div>
              <div className="mt-3.5 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-mist/30 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate">Cơ sở giả định</p>
                  <p className="mt-1 text-xs leading-5 text-navy">{item.basis}</p>
                </div>
                <div className="rounded-xl border border-amber-400/20 bg-amber-500/5 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Rủi ro nếu sai</p>
                  <p className="mt-1 text-xs leading-5 text-amber-900/80">{item.impact}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate">Xác minh với: <strong className="text-navy">{item.owner}</strong></span>
                <span className="font-mono text-[11px] font-bold text-navy">Liên kết: {item.linked}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <aside className="space-y-5">
        <Card className="p-5 border-slate/15">
          <div className="flex items-center gap-2.5">
            <CircleHelp className="text-brass" size={20} />
            <h2 className="text-sm font-bold text-navy">Lỗ hổng thông tin & Câu hỏi mở</h2>
          </div>
          <div className="mt-4 space-y-3">
            {openQuestions.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate/10 p-3.5">
                <div className="flex items-center justify-between">
                  <Badge tone="amber">{item.id}</Badge>
                  <span className="text-[11px] text-slate">Hạn: {item.due}</span>
                </div>
                <p className="mt-2 text-xs font-semibold leading-5 text-navy">{item.question}</p>
                <p className="mt-2 text-[11px] text-slate">Phụ trách: {item.owner} · {item.relatedTo}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-navy/15 bg-navy/5 p-5">
          <h3 className="text-xs font-bold text-navy uppercase tracking-wider">AI & Chuyên gia đánh giá điều gì?</h3>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-slate">
            <li>• Học viên có phân biệt rõ sự thật (fact) và giả định (assumption)?</li>
            <li>• Mỗi giả định có cơ sở và đánh giá tác động rủi ro?</li>
            <li>• Trách nhiệm xác thực có được giao đúng Stakeholder?</li>
            <li>• Các điểm nghẽn cản trở yêu cầu có được theo dõi sát sao?</li>
          </ul>
        </Card>
      </aside>
    </div>
  );
}

function RequirementAnalysisSection() {
  const details: Record<string, { rationale: string; acceptance: string; trace: string; gap?: string }> = {
    "BR-01": {
      rationale: "Bảo vệ mục tiêu giảm đứt hàng (stockout) và tỷ lệ đáp ứng (fill rate) trong phạm vi thử nghiệm.",
      acceptance: "Tỷ lệ đứt hàng < 5% và tỷ lệ đáp ứng >= 96% sau 8 tuần thử nghiệm.",
      trace: "OBJ-01 · EV-03 · FND-02",
    },
    "SR-04": {
      rationale: "Chuyên viên Kế hoạch phải đối soát kho dư thừa trong toàn mạng lưới trước khi mua mới.",
      acceptance: "Mọi gợi ý nhập hàng phải tự động kiểm tra lượng hàng khả chuyển trước khi cho phép tạo PO.",
      trace: "EV-03 · EV-04 · FND-02",
    },
    "FR-08": {
      rationale: "Cắt giảm mua mới khi các kho vùng khác đang có tồn kho dư thừa.",
      acceptance: "Kiểm tra tồn dư thừa trước khi tạo PO mua hàng; hiển thị số lượng, ETA, chi phí vận chuyển và lý do nếu người dùng ghi đè.",
      trace: "OBJ-01 · EV-03 · EV-04 · FND-02",
    },
    "NFR-03": {
      rationale: "Kho phải tiếp tục ghi nhận xuất nhập tồn ngay cả khi kết nối mạng chập chờn.",
      acceptance: "Mỗi giao dịch có ID duy nhất; đồng bộ lại không sinh bản ghi trùng; màn hình hiển thị hàng đợi đang chờ.",
      trace: "EV-08 · FND-04",
      gap: "Khả năng lưu trữ của thiết bị và ngưỡng thời gian thử lại chưa được kiểm định.",
    },
    "TR-02": {
      rationale: "Đảm bảo số liệu tồn ban đầu chính xác tuyệt đối trước khi golive hệ thống thử nghiệm.",
      acceptance: "100% SKU thử nghiệm được đối soát và Kế toán ký biên bản nghiệm thu trước khi chuyển giao.",
      trace: "RSK-04 · Xác nhận từ Kế toán trưởng",
    },
  };

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-slate/15">
        <div className="flex flex-col gap-3 border-b border-slate/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ClipboardList className="text-navy" size={20} />
            <div>
              <h2 className="text-base font-bold text-navy">Sổ đặc tả yêu cầu nghiệp vụ sơ bộ</h2>
              <p className="text-xs text-slate">Các yêu cầu do học viên phân tích từ dữ liệu thu thập; làm cơ sở cho BRD và RTM.</p>
            </div>
          </div>
          <Button variant="secondary" className="border-slate/20 text-xs">+ Thêm yêu cầu</Button>
        </div>
        <div className="divide-y divide-slate/10">
          {requirements.map((item) => {
            const detail = details[item.id];
            return (
              <div key={item.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <span className="grid h-10 min-w-10 place-items-center rounded-xl bg-navy/10 px-2 font-mono text-xs font-black text-navy">
                      {item.id}
                    </span>
                    <div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge tone="gray">{item.type}</Badge>
                        <Badge tone={item.priority === "Must" ? "red" : "amber"}>{item.priority}</Badge>
                      </div>
                      <h3 className="mt-1.5 text-sm font-bold text-navy">{item.title}</h3>
                    </div>
                  </div>
                  {statusBadge(item.status)}
                </div>
                <div className="mt-3.5 grid gap-3 lg:grid-cols-3">
                  <div className="rounded-xl bg-mist/30 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate">Lý do nghiệp vụ (Rationale)</p>
                    <p className="mt-1 text-xs leading-5 text-slate">{detail?.rationale}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Tiêu chí chấp nhận (Acceptance Criteria)</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-900/80">{detail?.acceptance}</p>
                  </div>
                  <div className="rounded-xl bg-mist/20 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-navy">Nguồn & Truy vết (Trace)</p>
                    <p className="mt-1 font-mono text-xs font-semibold text-navy">{detail?.trace}</p>
                  </div>
                </div>
                {detail?.gap && (
                  <div className="mt-3 flex gap-2 rounded-xl border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-900">
                    <AlertTriangle className="mt-0.5 shrink-0 text-amber-700" size={15} />
                    {detail.gap}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5 border-slate/15">
          <p className="text-xs font-bold uppercase tracking-wider text-slate">Độ phủ nguồn gốc</p>
          <strong className="mt-2 block text-3xl font-bold text-navy">4/5</strong>
          <p className="mt-1.5 text-xs text-slate">Yêu cầu có đủ chứng cứ và phát hiện liên kết.</p>
        </Card>
        <Card className="p-5 border-slate/15">
          <p className="text-xs font-bold uppercase tracking-wider text-slate">Tiêu chí đo lường được</p>
          <strong className="mt-2 block text-3xl font-bold text-navy">80%</strong>
          <p className="mt-1.5 text-xs text-slate">Yêu cầu NFR-03 vẫn thiếu ngưỡng thời gian cụ thể.</p>
        </Card>
        <Card className="p-5 border-slate/15">
          <p className="text-xs font-bold uppercase tracking-wider text-slate">Tiêu chuẩn chấm điểm AI</p>
          <p className="mt-2 text-xs leading-5 text-slate">Đánh giá tính rõ ràng, khả thi, kiểm thử được, tạo ra giá trị và truy vết về mục tiêu.</p>
        </Card>
      </div>
    </div>
  );
}

function ChangeImpactSection() {
  const impacts = [
    ["Mục tiêu kinh doanh", "Mục tiêu đứt hàng < 5% và đáp ứng >= 96% đứng trước nguy cơ đổ vỡ."],
    ["Quy trình nghiệp vụ", "Quy trình chuyển kho nội bộ phải kích hoạt sớm hơn và ưu tiên theo vùng."],
    ["Yêu cầu hệ thống", "FR-08 phải tích hợp lịch trình khuyến mãi và thời gian giao hàng thực tế."],
    ["Dữ liệu & API", "Cần dữ liệu tồn khả dụng (ATP), dự báo nhu cầu đột biến và ETA của nhà máy."],
    ["Stakeholder tham vấn", "Kế hoạch, Kho, Kế toán, Bán hàng và Giám đốc điều hành phải cùng thẩm định."],
    ["Rủi ro vận hành", "Đứt hàng, chi phí điều xe khẩn cấp và phân bổ không đồng đều giữa các cửa hàng."],
  ];

  const options = [
    [
      "Điều chuyển 1.800 hộp từ tổng kho trung tâm",
      "Đến trong 2 ngày, tận dụng nguồn tồn dư thừa",
      "Chi phí vận chuyển +9%; kho nguồn mất lượng dự phòng an toàn",
      "Ưu tiên số 1",
    ],
    [
      "Tạo đơn mua hàng khẩn cấp từ nhà cung ứng phụ",
      "Bảo toàn tồn kho cho các vùng miền khác",
      "Phí vận chuyển hỏa tốc rất cao; vẫn trễ 4 ngày",
      "Dự phòng",
    ],
    [
      "Giới hạn số lượng bán khuyến mãi tại cửa hàng",
      "Bảo vệ các cửa hàng trọng điểm",
      "Ảnh hưởng trải nghiệm khách hàng và doanh số cam kết",
      "Chỉ áp dụng khi thiếu",
    ],
  ];

  const consultations = [
    ["Chuyên viên Kế hoạch", "Xác thực lượng hàng dư thừa và dự báo nhu cầu tăng thêm"],
    ["Trưởng kho vận", "Năng lực bốc xếp, giờ chốt xe (cut-off) và ETA chuyển kho"],
    ["Kế toán trưởng", "Hạn mức chi phí phát sinh và thẩm quyền duyệt"],
    ["Trưởng phòng Bán lẻ", "Thứ tự ưu tiên phân bổ hàng cho các cửa hàng"],
  ];

  const updates: Array<[string, string, boolean]> = [
    ["Nhật ký rủi ro", "Bổ sung rủi ro trễ hẹn nhà cung cấp và thiếu hụt hàng khuyến mãi", true],
    ["Sổ quyết định", "Ghi nhận phương án điều chuyển nội bộ 1.800 hộp", true],
    ["Backlog / FR-08", "Bổ sung quy tắc ưu tiên lịch khuyến mãi và ETA", false],
    ["Tiêu chí nghiệm thu", "Bổ sung đo lường thời gian phản hồi và tỷ lệ đáp ứng", false],
  ];

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-amber-400/30">
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-amber-700 shadow-xs">
                <Truck size={23} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Sự kiện động · 16/09 · 15:10</p>
                <h2 className="mt-1 text-lg font-bold text-navy">Nhà cung cấp sữa MILK-01 trễ hẹn giao 5 ngày</h2>
                <p className="mt-2 max-w-3xl text-xs leading-5 text-slate">
                  Số lượng hàng khả dụng chỉ đủ đáp ứng 3 ngày bán, trong khi đợt khuyến mãi toàn hệ thống sẽ bắt đầu sau 7 ngày nữa. Sponsor yêu cầu BA phân tích lại phương án MVP trước cuộc họp Ban Giám đốc chiều nay.
                </p>
              </div>
            </div>
            <Badge tone="amber">Đang xử lý</Badge>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card className="p-6 border-slate/15">
            <div className="flex items-center gap-2.5">
              <RefreshCcw className="text-navy" size={20} />
              <h2 className="text-base font-bold text-navy">Bản đồ tác động thay đổi (Impact Map)</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {impacts.map(([label, copy]) => (
                <div key={label} className="rounded-xl border border-slate/10 bg-mist/20 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-navy">{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate">{copy}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden border-slate/15">
            <div className="border-b border-slate/10 p-5">
              <h2 className="text-base font-bold text-navy">Phân tích phương án & Đánh đổi (Trade-off Analysis)</h2>
              <p className="text-xs text-slate">BA so sánh các khía cạnh lợi ích - chi phí trước khi đưa ra khuyến nghị chính thức.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-mist/30 text-[11px] uppercase tracking-wider text-slate">
                  <tr>
                    <th className="px-5 py-3.5">Phương án đề xuất</th>
                    <th className="px-5 py-3.5">Lợi ích mang lại</th>
                    <th className="px-5 py-3.5">Đánh đổi / Chi phí</th>
                    <th className="px-5 py-3.5">Khuyến nghị BA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate/10">
                  {options.map(([option, benefit, cost, recommendation]) => (
                    <tr key={option} className="hover:bg-mist/10">
                      <td className="px-5 py-4 font-bold text-navy">{option}</td>
                      <td className="px-5 py-4 text-emerald-800">{benefit}</td>
                      <td className="px-5 py-4 text-amber-900">{cost}</td>
                      <td className="px-5 py-4">
                        <Badge tone={recommendation === "Ưu tiên số 1" ? "green" : "navy"}>{recommendation}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="space-y-5">
          <Card className="p-5 border-slate/15">
            <h2 className="text-sm font-bold text-navy">Stakeholder cần tham vấn</h2>
            <div className="mt-4 space-y-3">
              {consultations.map(([role, ask], index) => (
                <div key={role} className="rounded-xl border border-slate/10 p-3">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-navy">{role}</strong>
                    <Badge tone={index < 2 ? "green" : "amber"}>{index < 2 ? "Đã tham vấn" : "Cần hỏi thêm"}</Badge>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate">{ask}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border-slate/15">
            <h2 className="text-sm font-bold text-navy">Tài liệu cần cập nhật</h2>
            <div className="mt-4 space-y-3">
              {updates.map(([name, copy, done]) => (
                <div key={name} className="flex gap-2.5">
                  <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[10px] ${done ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {done ? <CheckCircle2 size={12} /> : <CircleHelp size={12} />}
                  </span>
                  <div>
                    <strong className="text-xs font-bold text-navy">{name}</strong>
                    <p className="mt-0.5 text-xs leading-5 text-slate">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
