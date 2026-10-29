import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Plus,
  Users,
  X,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import type { CohortItem, AssignmentItem, ScenarioVersion } from "../instructorData";

interface CohortAssignmentTabProps {
  cohorts: CohortItem[];
  assignments: AssignmentItem[];
  scenarios: ScenarioVersion[];
  onAddAssignment: (assignment: AssignmentItem) => void;
  onAddCohort: (cohort: CohortItem) => void;
}

export function CohortAssignmentTab({
  cohorts,
  assignments,
  scenarios,
  onAddAssignment,
  onAddCohort,
}: CohortAssignmentTabProps) {
  const [showNewAssignModal, setShowNewAssignModal] = useState(false);
  const [showNewCohortModal, setShowNewCohortModal] = useState(false);
  const [selectedCohortFilter, setSelectedCohortFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [assignForm, setAssignForm] = useState({
    title: "",
    cohortId: cohorts[0]?.id || "",
    scenarioVersionId: scenarios.find((s) => s.status === "Đã ban hành")?.id || scenarios[0]?.id || "",
    deadlineDate: "2026-10-25",
    deadlineTime: "23:59",
    attemptLimit: 2,
  });

  const [cohortForm, setCohortForm] = useState({
    code: "",
    name: "",
    instructorName: "TS. Nguyễn Hoàng Long",
    domain: "Chuỗi cung ứng",
    studentsCount: 30,
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.title.trim()) return;

    const targetCohort = cohorts.find((c) => c.id === assignForm.cohortId) || cohorts[0];
    const targetScenario = scenarios.find((s) => s.id === assignForm.scenarioVersionId) || scenarios[0];

    const newAssignment: AssignmentItem = {
      id: `asg-${Date.now()}`,
      title: assignForm.title,
      cohortId: targetCohort.id,
      cohortName: targetCohort.code,
      scenarioVersionId: targetScenario.id,
      scenarioTitle: `${targetScenario.scenarioTitle} (${targetScenario.versionNumber})`,
      deadline: `${assignForm.deadlineDate.split("-").reverse().join("/")} · ${assignForm.deadlineTime}`,
      attemptLimit: assignForm.attemptLimit,
      submissionsCount: 0,
      totalStudents: targetCohort.studentsCount,
      status: "active",
    };

    onAddAssignment(newAssignment);
    setShowNewAssignModal(false);
    setToastMessage(`Đã giao bài tập mới thành công cho ${targetCohort.code}!`);
    setTimeout(() => setToastMessage(null), 4000);
    setAssignForm({
      title: "",
      cohortId: cohorts[0]?.id || "",
      scenarioVersionId: scenarios[0]?.id || "",
      deadlineDate: "2026-10-25",
      deadlineTime: "23:59",
      attemptLimit: 2,
    });
  };

  const handleCreateCohort = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortForm.code.trim() || !cohortForm.name.trim()) return;

    const newCohort: CohortItem = {
      id: `coh-${Date.now()}`,
      code: cohortForm.code.toUpperCase(),
      name: cohortForm.name,
      instructorName: cohortForm.instructorName,
      studentsCount: cohortForm.studentsCount || 30,
      activeAssignmentsCount: 0,
      completionRate: 0,
      averageScore: 0,
      domain: cohortForm.domain,
      status: "active",
    };

    onAddCohort(newCohort);
    setShowNewCohortModal(false);
    setToastMessage(`Đã tạo lớp học mới ${newCohort.code}!`);
    setTimeout(() => setToastMessage(null), 4000);
    setCohortForm({
      code: "",
      name: "",
      instructorName: "TS. Nguyễn Hoàng Long",
      domain: "Chuỗi cung ứng",
      studentsCount: 30,
    });
  };

  const filteredAssignments = assignments.filter((a) =>
    selectedCohortFilter === "all" ? true : a.cohortId === selectedCohortFilter
  );

  return (
    <div className="space-y-6">
      {/* Toast thông báo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-[#132d49] px-4 py-3 text-xs font-bold text-white shadow-xl animate-fade-in border border-[#2f638c]">
          <CheckCircle2 size={16} className="text-[#32b583]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Thanh Tiêu Đề & Nút Thao Tác */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-[#132d49]">
            Quản Lý Lớp Học & Giao Đề Bài Cho Sinh Viên
          </h2>
          <p className="text-xs text-[#667d93]">
            Thầy cô chọn đề bài tình huống, đặt hạn chót nộp bài và số lần tối đa học viên được làm lại.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowNewCohortModal(true)}
            className="gap-1.5 text-xs"
          >
            <Users size={15} /> Tạo Lớp Học Mới
          </Button>
          <Button
            size="sm"
            onClick={() => setShowNewAssignModal(true)}
            className="gap-1.5 text-xs"
          >
            <Plus size={15} /> Giao Đề Bài Mới
          </Button>
        </div>
      </div>

      {/* Danh Sách Các Lớp Học */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cohorts.map((coh) => (
          <Card key={coh.id} className="p-5 border-[#d9e4ec] transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs font-bold text-[#2f638c] bg-[#eaf1f7] px-2 py-0.5 rounded">
                {coh.code}
              </span>
              <Badge tone={coh.status === "active" ? "green" : "navy"}>
                {coh.status === "active" ? "Đang học" : "Đã bế giảng"}
              </Badge>
            </div>

            <h3 className="mt-2 text-sm font-bold text-[#132d49] line-clamp-1">{coh.name}</h3>
            <p className="text-[11px] text-[#667d93]">Phụ trách: {coh.instructorName}</p>

            <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-[#f8fafc] p-3 text-xs border border-[#edf2f6]">
              <div>
                <span className="text-[10px] text-[#8291a1] uppercase font-bold">Sĩ số lớp</span>
                <strong className="block text-sm font-bold text-[#132d49]">{coh.studentsCount} bạn</strong>
              </div>
              <div>
                <span className="text-[10px] text-[#8291a1] uppercase font-bold">Điểm TB Lớp</span>
                <strong className="block text-sm font-bold text-[#2f638c]">{coh.averageScore}/100</strong>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-[#667d93] mb-1">
                <span>Tỷ lệ hoàn thành bài</span>
                <span className="font-mono font-bold text-[#132d49]">{coh.completionRate}%</span>
              </div>
              <ProgressBar value={coh.completionRate} color="#2d7b60" />
            </div>
          </Card>
        ))}
      </div>

      {/* Bảng Các Đề Bài Đang Giao */}
      <Card className="overflow-hidden border-[#d9e4ec]">
        <div className="flex flex-col gap-3 border-b border-[#e2e9ef] bg-[#f8fafc] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#132d49]">
              Danh Sách Các Đề Bài Đang Giao Cho Lớp ({filteredAssignments.length})
            </h3>
            <p className="text-xs text-[#667d93]">
              Theo dõi số lượng học viên đã nộp bài và thời gian còn lại trước khi hết hạn.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#667d93]">Lọc theo lớp:</span>
            <select
              value={selectedCohortFilter}
              onChange={(e) => setSelectedCohortFilter(e.target.value)}
              className="rounded-xl border border-[#d9e4ec] bg-white px-3 py-1.5 text-xs text-[#132d49] outline-none"
            >
              <option value="all">Tất cả lớp học</option>
              {cohorts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="divide-y divide-[#e6edf2]">
          {filteredAssignments.map((asg) => {
            const submissionPercent = Math.round((asg.submissionsCount / asg.totalStudents) * 100);
            return (
              <div
                key={asg.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-[#fafcfd]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#2f638c] bg-[#eaf1f7] px-2 py-0.5 rounded">
                      {asg.cohortName}
                    </span>
                    <Badge tone={asg.status === "active" ? "green" : "amber"}>
                      {asg.status === "active" ? "Đang mở nhận bài" : "Đã khóa bài"}
                    </Badge>
                  </div>
                  <h4 className="text-xs font-bold text-[#132d49]">{asg.title}</h4>
                  <p className="text-[11px] text-[#667d93]">
                    Kịch bản áp dụng: <span className="font-semibold text-[#132d49]">{asg.scenarioTitle}</span>
                  </p>
                  <div className="flex flex-wrap gap-3 text-[11px] text-[#8291a1] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={13} /> Hạn chót: {asg.deadline}
                    </span>
                    <span>•</span>
                    <span>Được làm tối đa: {asg.attemptLimit} lần</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:shrink-0">
                  <div className="w-36 text-right">
                    <div className="text-[11px] text-[#667d93]">
                      Đã nộp: <strong className="text-[#132d49]">{asg.submissionsCount}/{asg.totalStudents} bạn</strong>
                    </div>
                    <div className="mt-1">
                      <ProgressBar value={submissionPercent} />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => alert(`Xem danh sách chi tiết ${asg.submissionsCount} bạn đã nộp bài tập này.`)}
                    className="text-xs"
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Modal: Giao Đề Bài Mới */}
      {showNewAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <h3 className="text-sm font-bold text-[#132d49]">
                Giao Đề Bài Thực Hành Cho Lớp
              </h3>
              <button
                onClick={() => setShowNewAssignModal(false)}
                className="text-[#667d93] hover:text-[#132d49]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">
                  Tên bài tập
                </label>
                <input
                  required
                  placeholder="VD: Bài tập số 1: Phỏng vấn tìm hiểu quy trình kho"
                  value={assignForm.title}
                  onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none focus:border-[#2f638c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">
                    Giao cho Lớp học
                  </label>
                  <select
                    value={assignForm.cohortId}
                    onChange={(e) => setAssignForm({ ...assignForm, cohortId: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none"
                  >
                    {cohorts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">
                    Chọn đề bài kịch bản
                  </label>
                  <select
                    value={assignForm.scenarioVersionId}
                    onChange={(e) => setAssignForm({ ...assignForm, scenarioVersionId: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2.5 text-xs text-[#132d49] outline-none"
                  >
                    {scenarios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.scenarioTitle} ({s.versionNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Hạn nộp ngày</label>
                  <input
                    type="date"
                    required
                    value={assignForm.deadlineDate}
                    onChange={(e) => setAssignForm({ ...assignForm, deadlineDate: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Giờ nộp</label>
                  <input
                    type="time"
                    required
                    value={assignForm.deadlineTime}
                    onChange={(e) => setAssignForm({ ...assignForm, deadlineTime: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Số lần làm tối đa</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    required
                    value={assignForm.attemptLimit}
                    onChange={(e) => setAssignForm({ ...assignForm, attemptLimit: parseInt(e.target.value) || 1 })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e9ef]">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowNewAssignModal(false)}
                >
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Xác Nhận Giao Đề Bài
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tạo Lớp Học Mới */}
      {showNewCohortModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <h3 className="text-sm font-bold text-[#132d49]">Tạo Lớp Học Mới</h3>
              <button
                onClick={() => setShowNewCohortModal(false)}
                className="text-[#667d93] hover:text-[#132d49]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCohort} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Mã lớp</label>
                  <input
                    required
                    placeholder="VD: Lớp BA-04"
                    value={cohortForm.code}
                    onChange={(e) => setCohortForm({ ...cohortForm, code: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Sĩ số học viên</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={cohortForm.studentsCount}
                    onChange={(e) => setCohortForm({ ...cohortForm, studentsCount: parseInt(e.target.value) || 30 })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Tên lớp học</label>
                <input
                  required
                  placeholder="VD: Lớp Phân tích Nghiệp vụ Bán lẻ Đa kênh"
                  value={cohortForm.name}
                  onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Giảng viên đứng lớp</label>
                <input
                  value={cohortForm.instructorName}
                  onChange={(e) => setCohortForm({ ...cohortForm, instructorName: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e9ef]">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowNewCohortModal(false)}
                >
                  Hủy
                </Button>
                <Button size="sm" type="submit">
                  Tạo Lớp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
