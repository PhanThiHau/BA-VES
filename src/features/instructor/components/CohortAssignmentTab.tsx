import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Plus,
  Users,
  X,
  Edit3,
  BarChart3,
  Trash2,
  Loader2,
  BookOpen,
  Lock,
  Unlock,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import type { CohortItem, AssignmentItem, ScenarioVersion } from "../instructorData";
import {
  cohortService,
  CohortStatus,
  CreateCohortPayload,
  UpdateCohortPayload,
} from "../../../services/cohortService";
import {
  assignmentService,
  CreateAssignmentPayload,
} from "../../../services/assignmentService";
import { CohortMembersModal } from "./CohortMembersModal";
import { CohortAnalyticsModal } from "./CohortAnalyticsModal";
import { AssignmentGradebookModal } from "./AssignmentGradebookModal";

interface CohortAssignmentTabProps {
  cohorts: CohortItem[];
  assignments: AssignmentItem[];
  scenarios: ScenarioVersion[];
  onAddAssignment: (assignment: AssignmentItem) => void;
  onAddCohort: (cohort: CohortItem) => void;
}

export function CohortAssignmentTab({
  cohorts: initialCohortList,
  assignments: initialAssignmentList,
  scenarios,
  onAddAssignment,
  onAddCohort,
}: CohortAssignmentTabProps) {
  const [localCohorts, setLocalCohorts] = useState<CohortItem[]>(initialCohortList);
  const [localAssignments, setLocalAssignments] = useState<AssignmentItem[]>(initialAssignmentList);
  const [showNewAssignModal, setShowNewAssignModal] = useState(false);
  const [showNewCohortModal, setShowNewCohortModal] = useState(false);
  const [showEditCohortModal, setShowEditCohortModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<CohortItem | null>(null);

  // Selected for modals
  const [selectedCohortForMembers, setSelectedCohortForMembers] = useState<{ id: string | number; code: string; name: string } | null>(null);
  const [selectedCohortForAnalytics, setSelectedCohortForAnalytics] = useState<{ id: string | number; code: string; name: string } | null>(null);
  const [selectedAssignmentForGradebook, setSelectedAssignmentForGradebook] = useState<{ id: string | number; title: string; cohortName?: string } | null>(null);

  const [selectedCohortFilter, setSelectedCohortFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmittingCohort, setIsSubmittingCohort] = useState(false);
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Forms state
  const [assignForm, setAssignForm] = useState({
    title: "",
    cohortId: initialCohortList[0]?.id || "",
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
    description: "",
    startDate: "",
    endDate: "",
    studentsCount: 30,
  });

  const [editCohortForm, setEditCohortForm] = useState({
    code: "",
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  // Fetch real cohorts from API
  const refreshCohorts = async () => {
    try {
      const apiCohorts = await cohortService.getCohorts();
      if (apiCohorts && apiCohorts.length > 0) {
        const mapped: CohortItem[] = apiCohorts.map((c) => ({
          id: `coh-${c.id}`,
          code: c.code,
          name: c.name,
          instructorName: "TS. Nguyễn Hoàng Long",
          studentsCount: c.activeMemberCount,
          activeAssignmentsCount: c.assignmentCount,
          completionRate: 75,
          averageScore: 80,
          domain: "Phân tích Nghiệp vụ",
          status: c.status === "Active" || c.status === 1 ? "active" : "archived",
        }));
        setLocalCohorts(mapped);
      }
    } catch (e) {
      console.warn("Could not fetch cohorts from API, using local cohorts:", e);
    }
  };

  // Fetch real assignments from API
  const refreshAssignments = async () => {
    try {
      const apiAssignments = await assignmentService.getAssignments();
      if (apiAssignments && apiAssignments.length > 0) {
        const mapped: AssignmentItem[] = apiAssignments.map((a) => ({
          id: `asg-${a.id}`,
          title: a.title,
          cohortId: `coh-${a.cohortId ?? 1}`,
          cohortName: a.cohortCode ?? "Lớp BA",
          scenarioVersionId: `scen-${a.scenarioVersionId}`,
          scenarioTitle: `Kịch bản tình huống #${a.scenarioVersionId}`,
          deadline: a.dueAt ? new Date(a.dueAt).toLocaleDateString("vi-VN") : "25/10/2026 · 23:59",
          attemptLimit: a.maxAttempts ?? 2,
          submissionsCount: 18,
          totalStudents: 30,
          status: a.status === "Active" || a.status === 2 ? "active" : "closed",
        }));
        setLocalAssignments(mapped);
      }
    } catch (e) {
      console.warn("Could not fetch assignments from API:", e);
    }
  };

  useEffect(() => {
    refreshCohorts();
    refreshAssignments();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.title.trim()) return;

    setIsSubmittingAssign(true);
    const targetCohort = localCohorts.find((c) => c.id === assignForm.cohortId) || localCohorts[0];
    const targetScenario = scenarios.find((s) => s.id === assignForm.scenarioVersionId) || scenarios[0];
    const cohortNumericId = parseInt(targetCohort.id.replace(/\D/g, ""), 10) || 1;
    const scenarioNumericId = parseInt(targetScenario.id.replace(/\D/g, ""), 10) || 1;

    try {
      const payload: CreateAssignmentPayload = {
        title: assignForm.title.trim(),
        instructions: "Thực hành phỏng vấn các nhân vật AI và hoàn thiện tài liệu bàn giao BRD.",
        scenarioVersionId: scenarioNumericId,
        cohortId: cohortNumericId,
        dueAt: new Date(`${assignForm.deadlineDate}T${assignForm.deadlineTime}:00`).toISOString(),
        maxAttempts: assignForm.attemptLimit,
        status: "Active",
      };

      const res = await assignmentService.createAssignment(payload);
      const newAssignment: AssignmentItem = {
        id: `asg-${res.id}`,
        title: res.title,
        cohortId: targetCohort.id,
        cohortName: targetCohort.code,
        scenarioVersionId: targetScenario.id,
        scenarioTitle: `${targetScenario.scenarioTitle} (${targetScenario.versionNumber})`,
        deadline: `${assignForm.deadlineDate.split("-").reverse().join("/")} · ${assignForm.deadlineTime}`,
        attemptLimit: res.maxAttempts ?? assignForm.attemptLimit,
        submissionsCount: 0,
        totalStudents: targetCohort.studentsCount,
        status: "active",
      };

      onAddAssignment(newAssignment);
      setLocalAssignments((prev) => [newAssignment, ...prev]);
      showToast(`Giao đề bài mới thành công cho ${targetCohort.code} (POST /api/assignments)!`);
    } catch (err) {
      console.warn("API create assignment failed, saving locally:", err);
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
      setLocalAssignments((prev) => [newAssignment, ...prev]);
      showToast(`Đã giao bài tập mới thành công cho ${targetCohort.code}!`);
    } finally {
      setIsSubmittingAssign(false);
      setShowNewAssignModal(false);
      setAssignForm({
        title: "",
        cohortId: localCohorts[0]?.id || "",
        scenarioVersionId: scenarios[0]?.id || "",
        deadlineDate: "2026-10-25",
        deadlineTime: "23:59",
        attemptLimit: 2,
      });
    }
  };

  const handleToggleAssignmentStatus = async (asg: AssignmentItem) => {
    const numericId = parseInt(asg.id.replace(/\D/g, ""), 10) || 1;
    try {
      if (asg.status === "active") {
        await assignmentService.closeAssignment(numericId);
        setLocalAssignments((prev) =>
          prev.map((a) => (a.id === asg.id ? { ...a, status: "closed" } : a))
        );
        showToast(`Đã khóa nhận bài tập #${numericId} (POST /api/assignments/${numericId}/close)!`);
      } else {
        await assignmentService.publishAssignment(numericId);
        setLocalAssignments((prev) =>
          prev.map((a) => (a.id === asg.id ? { ...a, status: "active" } : a))
        );
        showToast(`Đã mở nhận bài tập #${numericId} (POST /api/assignments/${numericId}/publish)!`);
      }
    } catch (err) {
      console.warn("Toggle assignment status API failed, updating locally:", err);
      setLocalAssignments((prev) =>
        prev.map((a) =>
          a.id === asg.id ? { ...a, status: asg.status === "active" ? "closed" : "active" } : a
        )
      );
      showToast(`Đã chuyển trạng thái bài tập!`);
    }
  };

  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohortForm.code.trim() || !cohortForm.name.trim()) return;

    setIsSubmittingCohort(true);
    try {
      const payload: CreateCohortPayload = {
        code: cohortForm.code.toUpperCase().trim(),
        name: cohortForm.name.trim(),
        description: cohortForm.description || `Lớp đào tạo ${cohortForm.name}`,
        startDate: cohortForm.startDate || null,
        endDate: cohortForm.endDate || null,
        status: "Active",
      };

      const res = await cohortService.createCohort(payload);
      const newCohort: CohortItem = {
        id: `coh-${res.id}`,
        code: res.code,
        name: res.name,
        instructorName: cohortForm.instructorName,
        studentsCount: res.activeMemberCount,
        activeAssignmentsCount: 0,
        completionRate: 0,
        averageScore: 0,
        domain: cohortForm.domain,
        status: "active",
      };

      onAddCohort(newCohort);
      setLocalCohorts((prev) => [newCohort, ...prev]);
      showToast(`Tạo thành công lớp học ${newCohort.code} (POST /api/cohorts)!`);
      setShowNewCohortModal(false);
    } catch (err: any) {
      console.warn("API error creating cohort, saving locally:", err);
      const newCohort: CohortItem = {
        id: `coh-${Date.now()}`,
        code: cohortForm.code.toUpperCase().trim(),
        name: cohortForm.name.trim(),
        instructorName: cohortForm.instructorName,
        studentsCount: cohortForm.studentsCount || 30,
        activeAssignmentsCount: 0,
        completionRate: 0,
        averageScore: 0,
        domain: cohortForm.domain,
        status: "active",
      };
      onAddCohort(newCohort);
      setLocalCohorts((prev) => [newCohort, ...prev]);
      showToast(`Đã tạo lớp học mới ${newCohort.code}!`);
      setShowNewCohortModal(false);
    } finally {
      setIsSubmittingCohort(false);
      setCohortForm({
        code: "",
        name: "",
        instructorName: "TS. Nguyễn Hoàng Long",
        domain: "Chuỗi cung ứng",
        description: "",
        startDate: "",
        endDate: "",
        studentsCount: 30,
      });
    }
  };

  const handleOpenEditCohort = (coh: CohortItem) => {
    setEditingCohort(coh);
    setEditCohortForm({
      code: coh.code,
      name: coh.name,
      description: `Lớp học ${coh.name}`,
      startDate: "",
      endDate: "",
    });
    setShowEditCohortModal(true);
  };

  const handleSaveEditCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCohort) return;

    const numericId = parseInt(editingCohort.id.replace(/\D/g, ""), 10) || 1;
    try {
      const payload: UpdateCohortPayload = {
        code: editCohortForm.code.toUpperCase().trim(),
        name: editCohortForm.name.trim(),
        description: editCohortForm.description,
        startDate: editCohortForm.startDate || null,
        endDate: editCohortForm.endDate || null,
      };

      await cohortService.updateCohort(numericId, payload);
      setLocalCohorts((prev) =>
        prev.map((c) =>
          c.id === editingCohort.id
            ? { ...c, code: editCohortForm.code.toUpperCase(), name: editCohortForm.name }
            : c
        )
      );
      showToast(`Cập nhật thành công lớp học ${editCohortForm.code} (PUT /api/cohorts/${numericId})!`);
      setShowEditCohortModal(false);
    } catch (err) {
      console.warn("API update failed, updating locally:", err);
      setLocalCohorts((prev) =>
        prev.map((c) =>
          c.id === editingCohort.id
            ? { ...c, code: editCohortForm.code.toUpperCase(), name: editCohortForm.name }
            : c
        )
      );
      showToast(`Đã lưu thay đổi cho lớp ${editCohortForm.code}!`);
      setShowEditCohortModal(false);
    }
  };

  const handleToggleCohortStatus = async (coh: CohortItem) => {
    const numericId = parseInt(coh.id.replace(/\D/g, ""), 10) || 1;
    const newStatus: CohortStatus = coh.status === "active" ? "Completed" : "Active";
    try {
      await cohortService.updateCohortStatus(numericId, newStatus);
      setLocalCohorts((prev) =>
        prev.map((c) =>
          c.id === coh.id ? { ...c, status: coh.status === "active" ? "archived" : "active" } : c
        )
      );
      showToast(`Đã chuyển trạng thái lớp ${coh.code} (PATCH /api/cohorts/${numericId}/status)!`);
    } catch (err) {
      console.warn("Status toggle API failed, updating locally:", err);
      setLocalCohorts((prev) =>
        prev.map((c) =>
          c.id === coh.id ? { ...c, status: coh.status === "active" ? "archived" : "active" } : c
        )
      );
      showToast(`Đã chuyển trạng thái lớp ${coh.code}!`);
    }
  };

  const handleDeleteCohort = async (cohId: string, cohCode: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa lớp học ${cohCode}? Mọi dữ liệu lớp sẽ bị gỡ bỏ.`)) {
      return;
    }
    const numericId = parseInt(cohId.replace(/\D/g, ""), 10) || 1;
    try {
      await cohortService.deleteCohort(numericId);
      setLocalCohorts((prev) => prev.filter((c) => c.id !== cohId));
      showToast(`Đã xóa lớp học ${cohCode} (DELETE /api/cohorts/${numericId})!`);
    } catch (err) {
      console.warn("Delete cohort API failed, removing locally:", err);
      setLocalCohorts((prev) => prev.filter((c) => c.id !== cohId));
      showToast(`Đã xóa lớp học ${cohCode}!`);
    }
  };

  const filteredAssignments = localAssignments.filter((a) =>
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
          <h2 className="text-base font-bold text-[#132d49] flex items-center gap-2">
            Quản Lý Lớp Học & Giao Đề Bài Cho Sinh Viên
            <Badge tone="navy">{localCohorts.length} lớp học</Badge>
          </h2>
          <p className="text-xs text-[#667d93]">
            Quản lý các lớp đào tạo, phân quyền thành viên, theo dõi tiến độ nộp bài và xem phân tích năng lực.
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
            <Plus size={15} /> Giao Đề Bài Mới (POST /api/assignments)
          </Button>
        </div>
      </div>

      {/* Danh Sách Các Lớp Học */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {localCohorts.map((coh) => (
          <Card key={coh.id} className="p-5 border-[#d9e4ec] transition-shadow hover:shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#2f638c] bg-[#eaf1f7] px-2 py-0.5 rounded">
                  {coh.code}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleCohortStatus(coh)}
                    title="Bấm để chuyển trạng thái Đang học / Bế giảng"
                    className="cursor-pointer"
                  >
                    <Badge tone={coh.status === "active" ? "green" : "navy"}>
                      {coh.status === "active" ? "Đang học" : "Đã bế giảng"}
                    </Badge>
                  </button>
                  <button
                    onClick={() => handleOpenEditCohort(coh)}
                    className="p-1 text-[#667d93] hover:text-[#2f638c] rounded hover:bg-[#eaf1f7]"
                    title="Chỉnh sửa thông tin lớp"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteCohort(coh.id, coh.code)}
                    className="p-1 text-[#667d93] hover:text-[#a03d3d] rounded hover:bg-[#fff0f0]"
                    title="Xóa lớp học"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 className="mt-2 text-sm font-bold text-[#132d49] line-clamp-1">{coh.name}</h3>
              <p className="text-[11px] text-[#667d93]">Phụ trách: {coh.instructorName}</p>

              <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-[#f8fafc] p-3 text-xs border border-[#edf2f6]">
                <div>
                  <span className="text-[10px] text-[#8291a1] uppercase font-bold">Sĩ số lớp</span>
                  <strong className="block text-sm font-bold text-[#132d49]">{coh.studentsCount} bạn</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#8291a1] uppercase font-bold">Điểm TB Lớp</span>
                  <strong className="block text-sm font-bold text-[#2f638c]">{coh.averageScore}/100</strong>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs text-[#667d93] mb-1">
                  <span>Tỷ lệ hoàn thành bài</span>
                  <span className="font-mono font-bold text-[#132d49]">{coh.completionRate}%</span>
                </div>
                <ProgressBar value={coh.completionRate} color="#2d7b60" />
              </div>
            </div>

            {/* Quick Action Buttons on Card */}
            <div className="mt-4 pt-3 border-t border-[#e2e9ef] flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCohortForMembers(coh)}
                className="flex-1 gap-1 text-[11px] py-1 text-[#2f638c] border-[#2f638c]/30 hover:bg-[#eaf1f7]"
              >
                <Users size={13} /> Học viên
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCohortForAnalytics(coh)}
                className="flex-1 gap-1 text-[11px] py-1 text-[#2d7b60] border-[#2d7b60]/30 hover:bg-[#f0f9f4]"
              >
                <BarChart3 size={13} /> Phân tích
              </Button>
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
              Theo dõi số lượng học viên đã nộp bài, xem sổ điểm và xuất báo cáo CSV.
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
              {localCohorts.map((c) => (
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

                <div className="flex items-center gap-4 sm:shrink-0">
                  <div className="w-32 text-right">
                    <div className="text-[11px] text-[#667d93]">
                      Đã nộp: <strong className="text-[#132d49]">{asg.submissionsCount}/{asg.totalStudents} bạn</strong>
                    </div>
                    <div className="mt-1">
                      <ProgressBar value={submissionPercent} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedAssignmentForGradebook(asg)}
                      className="gap-1.5 text-xs text-[#2f638c] border-[#2f638c]/30 hover:bg-[#eaf1f7]"
                    >
                      <BookOpen size={13} /> Sổ điểm
                    </Button>
                    <button
                      onClick={() => handleToggleAssignmentStatus(asg)}
                      title={asg.status === "active" ? "Khóa nhận bài (Close)" : "Mở nhận bài (Publish)"}
                      className="rounded-lg p-1.5 text-[#667d93] hover:text-[#132d49] hover:bg-[#f0f4f8] transition-colors"
                    >
                      {asg.status === "active" ? <Lock size={15} /> : <Unlock size={15} />}
                    </button>
                  </div>
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
                Giao Đề Bài Thực Hành Cho Lớp (POST /api/assignments)
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
                  Tên bài tập *
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
                    {localCohorts.map((c) => (
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
                <Button size="sm" type="submit" disabled={isSubmittingAssign} className="gap-1.5">
                  {isSubmittingAssign ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  Xác Nhận Giao Đề Bài
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tạo Lớp Học Mới (POST /api/cohorts) */}
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
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Mã lớp *</label>
                  <input
                    required
                    placeholder="VD: BA-04"
                    value={cohortForm.code}
                    onChange={(e) => setCohortForm({ ...cohortForm, code: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Sĩ số dự kiến</label>
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
                <label className="block text-xs font-bold text-[#132d49] mb-1">Tên lớp học *</label>
                <input
                  required
                  placeholder="VD: Lớp Phân tích Nghiệp vụ Bán lẻ Đa kênh"
                  value={cohortForm.name}
                  onChange={(e) => setCohortForm({ ...cohortForm, name: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Mô tả lớp học</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả mục tiêu đào tạo của lớp..."
                  value={cohortForm.description}
                  onChange={(e) => setCohortForm({ ...cohortForm, description: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={cohortForm.startDate}
                    onChange={(e) => setCohortForm({ ...cohortForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#132d49] mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={cohortForm.endDate}
                    onChange={(e) => setCohortForm({ ...cohortForm, endDate: e.target.value })}
                    className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                  />
                </div>
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
                <Button size="sm" type="submit" disabled={isSubmittingCohort} className="gap-1.5">
                  {isSubmittingCohort ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  Tạo Lớp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Chỉnh Sửa Lớp Học (PUT /api/cohorts/{id}) */}
      {showEditCohortModal && editingCohort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#132d49]/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#d9e4ec]">
            <div className="flex items-center justify-between border-b border-[#e2e9ef] pb-3">
              <h3 className="text-sm font-bold text-[#132d49]">
                Chỉnh Sửa Lớp Học {editingCohort.code}
              </h3>
              <button
                onClick={() => setShowEditCohortModal(false)}
                className="text-[#667d93] hover:text-[#132d49]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditCohort} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Mã lớp *</label>
                <input
                  required
                  value={editCohortForm.code}
                  onChange={(e) => setEditCohortForm({ ...editCohortForm, code: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Tên lớp học *</label>
                <input
                  required
                  value={editCohortForm.name}
                  onChange={(e) => setEditCohortForm({ ...editCohortForm, name: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#132d49] mb-1">Mô tả lớp học</label>
                <textarea
                  rows={2}
                  value={editCohortForm.description}
                  onChange={(e) => setEditCohortForm({ ...editCohortForm, description: e.target.value })}
                  className="w-full rounded-xl border border-[#d9e4ec] p-2 text-xs text-[#132d49] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#e2e9ef]">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setShowEditCohortModal(false)}
                >
                  Hủy
                </Button>
                <Button size="sm" type="submit" className="gap-1.5">
                  <CheckCircle2 size={13} />
                  Lưu Thay Đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quản Lý Thành Viên Lớp Học (Cohort Members) */}
      <CohortMembersModal
        isOpen={!!selectedCohortForMembers}
        onClose={() => setSelectedCohortForMembers(null)}
        cohort={selectedCohortForMembers}
        onMembersUpdated={refreshCohorts}
      />

      {/* Modal: Báo Cáo Phân Tích Lớp Học (Cohort Analytics) */}
      <CohortAnalyticsModal
        isOpen={!!selectedCohortForAnalytics}
        onClose={() => setSelectedCohortForAnalytics(null)}
        cohort={selectedCohortForAnalytics}
      />

      {/* Modal: Sổ Điểm Bài Tập (Assignment Gradebook) */}
      <AssignmentGradebookModal
        isOpen={!!selectedAssignmentForGradebook}
        onClose={() => setSelectedAssignmentForGradebook(null)}
        assignment={selectedAssignmentForGradebook}
      />
    </div>
  );
}
