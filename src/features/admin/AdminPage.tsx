import { useState, useEffect, type ReactNode } from "react";
import {
  Award,
  Building2,
  Cpu,
  Download,
  Edit3,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { PageHeader } from "../../components/common/PageHeader";
import { Button } from "../../components/ui/Button";
import { userService } from "../../services/userService";
import type { UserProfile } from "../../services/authService";
import type { AuditLogItem } from "./adminData";
import {
  catalogService,
  type IndustryItem,
  type ApplicationItem,
  type ScenarioItem,
} from "../../services/catalogService";
import { assessmentService, type BabokTaskDto } from "../../services/assessmentService";
import { cohortService, type CohortSummaryDto } from "../../services/cohortService";
import { apiClient } from "../../services/apiClient";
import { classNames } from "../../utils/format";
import {
  isAdminRole,
  isExpertRole,
  isInstructorRole,
  isLearnerRole,
  normalizeRole,
} from "../../utils/roles";
import { AdminOverviewTab } from "./components/AdminOverviewTab";
import { AdminAuthoringTab } from "./components/AdminAuthoringTab";

type AdminTabId = "overview" | "authoring" | "users" | "domains" | "babok" | "ai" | "audit";
const VALID_ADMIN_TABS: AdminTabId[] = [
  "overview",
  "authoring",
  "users",
  "domains",
  "babok",
  "ai",
  "audit",
];

export function AdminPage() {
  const { adminTab, setAdminTab, user: currentUser, setByokModalOpen } = useApp();
  const currentTab = VALID_ADMIN_TABS.includes(adminTab as AdminTabId)
    ? (adminTab as AdminTabId)
    : "overview";
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dữ liệu thực từ Database
  const [industries, setIndustries] = useState<IndustryItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [babokTasks, setBabokTasks] = useState<BabokTaskDto[]>([]);
  const [cohorts, setCohorts] = useState<CohortSummaryDto[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [healthStatus, setHealthStatus] = useState<{
    healthy: boolean;
    latencyMs: number | null;
  }>({ healthy: false, latencyMs: null });

  const [searchUser, setSearchUser] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");

  // In-app Notification / Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // API Users State
  const [apiUsers, setApiUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Create / Edit user modal
  const [userFormMode, setUserFormMode] = useState<"create" | "edit" | null>(null);
  const [userFormTarget, setUserFormTarget] = useState<UserProfile | null>(null);
  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    roles: ["LEARNER"] as string[],
  });
  const [isSavingUser, setIsSavingUser] = useState(false);

  const mapRolesForUi = (roles: string[] | undefined) => {
    const mapped = (roles || ["LEARNER"]).map((r) => {
      const n = normalizeRole(r);
      if (n === "BAEXPERT" || n === "EXPERT") return "BAEXPERT";
      if (n === "ADMIN") return "ADMIN";
      if (n === "INSTRUCTOR") return "INSTRUCTOR";
      if (n === "LEARNER") return "LEARNER";
      return n;
    });
    return [...new Set(mapped)];
  };

  const mapRolesForApi = (roles: string[]) =>
    roles.map((r) => (r === "BAEXPERT" ? "EXPERT" : r));

  // Load users from backend API
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setUserError(null);
    try {
      const roleFilter =
        filterRole === "ALL"
          ? undefined
          : filterRole === "BAEXPERT"
            ? "EXPERT"
            : filterRole;
      const res = await userService.getUsers({
        search: searchUser.trim() || undefined,
        role: roleFilter,
      });
      setApiUsers(res || []);
    } catch (err: any) {
      console.warn("Backend users API failed:", err);
      setUserError(err?.message || "Không thể tải danh sách tài khoản từ server.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadAdminData = async () => {
    const start = performance.now();
    try {
      const [healthRes, indRes, appRes, scenRes, tasksRes, cohRes] = await Promise.allSettled([
        apiClient.get<{ status: string }>("/health"),
        catalogService.getIndustries(),
        catalogService.getApplications(),
        catalogService.getScenarios(),
        assessmentService.getBabokTasks(),
        cohortService.getCohorts(),
      ]);

      const elapsed = Math.round(performance.now() - start);
      setHealthStatus({
        healthy: healthRes.status === "fulfilled",
        latencyMs: healthRes.status === "fulfilled" ? elapsed : null,
      });

      if (indRes.status === "fulfilled" && indRes.value) {
        setIndustries(indRes.value);
      }
      if (appRes.status === "fulfilled" && appRes.value) {
        setApplications(appRes.value);
      }
      if (scenRes.status === "fulfilled" && scenRes.value) {
        setScenarios(scenRes.value);
      }
      if (tasksRes.status === "fulfilled" && tasksRes.value) {
        setBabokTasks(tasksRes.value);
      }
      if (cohRes.status === "fulfilled" && cohRes.value) {
        setCohorts(cohRes.value);
      }
    } catch (err) {
      console.warn("Could not load admin catalog/babok data:", err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [searchUser, filterRole]);

  // Handle Toggle Status via API
  const handleToggleApiUserStatus = async (user: UserProfile) => {
    const isCurrentlyActive = user.status?.toLowerCase() === "active";
    const nextStatus = isCurrentlyActive ? "Suspended" : "Active";
    try {
      await userService.updateUserStatus(user.id, nextStatus);
      setAuditLogs((prev) => [
        {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString("vi-VN"),
          actor: currentUser?.fullName || "Admin",
          action: isCurrentlyActive ? "KHÓA TÀI KHOẢN" : "MỞ KHÓA TÀI KHOẢN",
          target: `${user.fullName} (#${user.id})`,
          ipAddress: "Client Session",
          status: "SUCCESS",
        },
        ...prev,
      ]);
      showToast(
        isCurrentlyActive
          ? `Đã khóa tài khoản ${user.fullName} thành công.`
          : `Đã mở khóa tài khoản ${user.fullName} thành công.`
      );
      await loadUsers();
    } catch (err: any) {
      showToast("Lỗi khi cập nhật trạng thái: " + (err?.message || "Không xác định"), "error");
    }
  };

  const handleToggleRoleSelection = (role: string) => {
    setUserForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const openCreateUser = () => {
    setUserFormMode("create");
    setUserFormTarget(null);
    setUserForm({ fullName: "", email: "", password: "", roles: ["LEARNER"] });
  };

  const openEditUser = (user: UserProfile) => {
    setUserFormMode("edit");
    setUserFormTarget(user);
    setUserForm({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
      roles: mapRolesForUi(user.roles),
    });
  };

  const closeUserForm = () => {
    setUserFormMode(null);
    setUserFormTarget(null);
    setUserForm({ fullName: "", email: "", password: "", roles: ["LEARNER"] });
  };

  const handleSaveUserForm = async () => {
    if (!userForm.fullName.trim() || !userForm.email.trim()) {
      showToast("Cần nhập họ tên và email.", "error");
      return;
    }
    if (userForm.roles.length === 0) {
      showToast("Cần chọn ít nhất 1 vai trò.", "error");
      return;
    }
    if (userFormMode === "create" && userForm.password.trim().length < 8) {
      showToast("Mật khẩu tối thiểu 8 ký tự.", "error");
      return;
    }
    if (userFormMode === "edit" && userForm.password && userForm.password.trim().length < 8) {
      showToast("Mật khẩu mới tối thiểu 8 ký tự.", "error");
      return;
    }

    setIsSavingUser(true);
    try {
      const apiRoles = mapRolesForApi(userForm.roles);
      if (userFormMode === "create") {
        const created = await userService.createUser({
          email: userForm.email.trim(),
          fullName: userForm.fullName.trim(),
          password: userForm.password,
          roles: apiRoles,
        });
        setAuditLogs((prev) => [
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleString("vi-VN"),
            actor: currentUser?.fullName || "Admin",
            action: "TẠO TÀI KHOẢN",
            target: `${created.fullName} (#${created.id})`,
            ipAddress: "Client Session",
            status: "SUCCESS",
          },
          ...prev,
        ]);
        showToast(`Đã tạo ${created.fullName}.`);
      } else if (userFormMode === "edit" && userFormTarget) {
        const updated = await userService.updateUser(userFormTarget.id, {
          email: userForm.email.trim(),
          fullName: userForm.fullName.trim(),
          newPassword: userForm.password.trim() || null,
          roles: apiRoles,
        });
        setAuditLogs((prev) => [
          {
            id: `aud-${Date.now()}`,
            timestamp: new Date().toLocaleString("vi-VN"),
            actor: currentUser?.fullName || "Admin",
            action: "SỬA TÀI KHOẢN",
            target: `${updated.fullName} (#${updated.id})`,
            ipAddress: "Client Session",
            status: "SUCCESS",
          },
          ...prev,
        ]);
        showToast(`Đã cập nhật ${updated.fullName}.`);
      }
      closeUserForm();
      await loadUsers();
    } catch (err: any) {
      showToast(err?.message || "Không lưu được tài khoản.", "error");
    } finally {
      setIsSavingUser(false);
    }
  };

  const learnerCount = apiUsers.filter((u) => isLearnerRole(u.roles)).length;
  const instructorCount = apiUsers.filter((u) => isInstructorRole(u.roles)).length;
  const expertCount = apiUsers.filter((u) => isExpertRole(u.roles)).length;
  const adminCount = apiUsers.filter((u) => isAdminRole(u.roles)).length;

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([loadUsers(), loadAdminData()]);
      showToast("Đã làm mới dữ liệu từ server!");
    } finally {
      setIsRefreshing(false);
    }
  };

  const storedProvider = localStorage.getItem("baves_ai_provider");
  const storedModel = localStorage.getItem("baves_ai_model");
  const hasStoredKey = Boolean(localStorage.getItem("baves_ai_key"));

  const tabHeaders: Record<AdminTabId, { title: string; description?: string; actions?: ReactNode }> = {
    overview: {
      title: "Tổng quan hệ thống",
      description: "Sức khỏe nền tảng, catalog và ưu tiên vận hành.",
      actions: (
        <Button
          variant="secondary"
          onClick={() => void handleRefreshAll()}
          className="gap-1.5 border-navy/20 bg-white text-xs font-semibold text-navy"
        >
          <RefreshCw size={14} className={isRefreshing || isLoadingUsers ? "animate-spin" : ""} />
          Làm mới
        </Button>
      ),
    },
    authoring: {
      title: "Kịch bản hệ thống",
      description:
        "Soạn kịch bản toàn hệ thống. Sau Expert duyệt sẽ xuất bản lên Scenario Library.",
    },
    users: {
      title: "Tài khoản & phân quyền",
      description: "RBAC, khóa/mở tài khoản và vai trò hệ thống.",
    },
    domains: {
      title: "Lĩnh vực & ứng dụng",
      description: "Ngành, ứng dụng và kịch bản trong catalog.",
    },
    babok: {
      title: "Khung chuẩn BABOK",
      description: "Vùng tri thức và tác vụ đánh giá năng lực.",
    },
    ai: {
      title: "Cấu hình AI",
      description: "Kết nối BYOK cho mô phỏng và chấm điểm.",
    },
    audit: {
      title: "Nhật ký kiểm toán",
      description: "Thao tác quản trị trong phiên hiện tại.",
    },
  };

  const currentHeader = tabHeaders[currentTab];

  return (
    <>
      {toast && (
        <div
          className={classNames(
            "fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-xs font-bold shadow-xl backdrop-blur-md",
            toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/90 text-emerald-100"
              : toast.type === "error"
                ? "border-rose-500/40 bg-rose-950/90 text-rose-100"
                : "border-white/20 bg-navy-deep/90 text-white"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle size={16} className="shrink-0 text-rose-400" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-white/60 transition hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      <PageHeader
        eyebrow="Quản trị"
        title={currentHeader.title}
        description={currentHeader.description}
        actions={currentHeader.actions}
      />

      {currentTab === "overview" && (
        <AdminOverviewTab
          users={apiUsers}
          industries={industries}
          applications={applications}
          scenarios={scenarios}
          babokTasks={babokTasks}
          cohorts={cohorts}
          auditLogs={auditLogs}
          healthStatus={healthStatus}
          aiConfigured={hasStoredKey}
          aiProvider={storedProvider}
          aiModel={storedModel}
          onSelectTab={setAdminTab}
          onRefresh={() => void handleRefreshAll()}
          refreshing={isRefreshing || isLoadingUsers}
        />
      )}

      {currentTab === "authoring" && <AdminAuthoringTab />}

      {currentTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate/15 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex max-w-md flex-1 items-center gap-2 rounded-xl border border-slate/20 bg-offwhite/50 px-3 py-2">
              <Search size={15} className="text-slate/60" />
              <input
                type="text"
                placeholder="Tìm tên, email, ID..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-navy outline-none placeholder:text-slate/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl border border-slate/20 bg-offwhite p-1 text-xs">
                {[
                  { key: "ALL", label: `Tất cả (${apiUsers.length})` },
                  { key: "LEARNER", label: `HV (${learnerCount})` },
                  { key: "INSTRUCTOR", label: `GV (${instructorCount})` },
                  { key: "BAEXPERT", label: `CG (${expertCount})` },
                  { key: "ADMIN", label: `Admin (${adminCount})` },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFilterRole(item.key)}
                    className={classNames(
                      "cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                      filterRole === item.key
                        ? "bg-white text-navy shadow-xs"
                        : "text-slate hover:text-navy"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <Button size="sm" onClick={openCreateUser} className="gap-1.5 text-xs font-bold">
                <Plus size={14} /> Thêm
              </Button>
            </div>
          </div>

          {userError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              {userError}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate/15 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate/15 bg-offwhite/80 text-[10px] font-bold uppercase tracking-wider text-slate">
                <tr>
                  <th className="px-4 py-3.5">Họ tên</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Vai trò</th>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                  <th className="px-4 py-3.5">Tham gia</th>
                  <th className="px-4 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate">
                      <RefreshCw size={20} className="mx-auto mb-2 animate-spin text-navy" />
                      Đang tải tài khoản...
                    </td>
                  </tr>
                ) : apiUsers.length > 0 ? (
                  apiUsers.map((u) => {
                    const isActive = String(u.status).toLowerCase() === "active";
                    return (
                      <tr key={u.id} className="transition hover:bg-offwhite/50">
                        <td className="px-4 py-3.5 font-bold text-navy">
                          <div className="flex items-center gap-2.5">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <span className="font-display grid h-8 w-8 place-items-center rounded-xl bg-navy/10 text-xs font-bold text-navy">
                                {u.fullName?.slice(0, 1) || "U"}
                              </span>
                            )}
                            <span className="block font-bold text-navy">{u.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate">{u.email || "—"}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {u.roles?.map((r) => {
                              const n = normalizeRole(r);
                              const isExp = n === "BAEXPERT" || n === "EXPERT";
                              return (
                                <span
                                  key={r}
                                  className={classNames(
                                    "rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                    n === "ADMIN"
                                      ? "border-navy/20 bg-navy/10 text-navy"
                                      : n === "INSTRUCTOR"
                                        ? "border-sky-300/40 bg-sky-100 text-sky-800"
                                        : isExp
                                          ? "border-teal-300/40 bg-teal-100 text-teal-800"
                                          : "border-slate-300/40 bg-slate-100 text-slate-700"
                                  )}
                                >
                                  {isExp ? "EXPERT" : r}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-slate">#{u.id}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={classNames(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                              isActive
                                ? "border-emerald-300/30 bg-emerald-100 text-emerald-700"
                                : "border-rose-300/30 bg-rose-100 text-rose-700"
                            )}
                          >
                            {isActive ? <UserCheck size={11} /> : <UserX size={11} />}
                            {isActive ? "Active" : "Khóa"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[11px] text-slate">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditUser(u)}
                              title="Sửa tài khoản"
                              className="cursor-pointer rounded-lg border border-slate/20 bg-white px-2.5 py-1 text-[11px] font-bold text-navy transition hover:border-navy/40 hover:bg-mist/40"
                            >
                              <span className="inline-flex items-center gap-1">
                                <Edit3 size={12} /> Sửa
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleToggleApiUserStatus(u)}
                              title={isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                              className={classNames(
                                "cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-bold transition",
                                isActive
                                  ? "border border-rose-300 text-rose-600 hover:bg-rose-50"
                                  : "border border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                              )}
                            >
                              {isActive ? "Khóa" : "Mở"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-xs text-slate">
                      Không có tài khoản khớp bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DOMAINS & CONTENT */}
      {currentTab === "domains" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate/15 shadow-sm">
            <div>
              <h3 className="font-display text-sm font-extrabold text-navy">Ngành & Ứng dụng Mô phỏng Doanh nghiệp</h3>
              <p className="text-xs text-slate">Dữ liệu thực tế từ bảng `content.Industries` và `content.Applications`</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {industries.length > 0 ? (
              industries.map((ind) => {
                const indApps = applications.filter((a) => a.industry?.id === ind.id || a.industry?.code === ind.code);
                const isActive = ind.status === 1 || ind.status === "Active" || ind.status === "ACTIVE";
                return (
                  <div key={ind.id} className="rounded-2xl border border-slate/15 bg-white p-5 shadow-sm space-y-3 transition hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="rounded-md bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold uppercase font-mono">
                          {ind.code}
                        </span>
                        <h4 className="mt-1.5 font-display text-base font-extrabold text-navy">{ind.name}</h4>
                      </div>
                      <span
                        className={classNames(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate/15 text-slate"
                        )}
                      >
                        {isActive ? "Đang áp dụng" : "Bản nháp"}
                      </span>
                    </div>
                    <p className="text-xs text-slate leading-relaxed">{ind.description || "—"}</p>
                    {indApps.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {indApps.map((app) => (
                          <span
                            key={app.id}
                            className="rounded-md border border-slate/15 bg-offwhite px-2 py-0.5 text-[11px] font-semibold text-navy"
                          >
                            {app.name} ({app.code})
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-6 border-t border-slate/10 pt-3 text-xs text-slate">
                      <span><strong>{indApps.length}</strong> Ứng dụng nghiệp vụ</span>
                      <span>Thứ tự hiển thị: <strong>{ind.displayOrder}</strong></span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center text-xs text-slate bg-white rounded-2xl border border-slate/15">
                Chưa có ngành lĩnh vực nào trong cơ sở dữ liệu.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BABOK & RUBRICS */}
      {currentTab === "babok" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate/15 shadow-sm">
            <h3 className="font-display text-sm font-extrabold text-navy">
              Danh mục Vùng Tri thức & Tác vụ BABOK® v3 trong Database
            </h3>
            <p className="text-xs text-slate mt-0.5">
              Dữ liệu thực tế từ bảng `assessment.BabokTasks` ({babokTasks.length} tác vụ)
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {babokTasks.length > 0 ? (
              babokTasks.map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate/15 bg-white p-5 shadow-sm space-y-2.5 transition hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-navy px-2.5 py-0.5 text-[10px] font-bold text-white font-mono">
                      {task.code}
                    </span>
                    <span className="font-bold text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      {task.knowledgeAreaCode} · BABOK® {task.babokVersion}
                    </span>
                  </div>
                  <h4 className="font-display text-sm font-extrabold text-navy">{task.name}</h4>
                  <p className="text-xs text-slate">{task.knowledgeAreaName}</p>
                  {task.description && (
                    <p className="text-xs text-slate/80 border-t border-slate/10 pt-2">{task.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-xs text-slate bg-white rounded-2xl border border-slate/15">
                Chưa có dữ liệu tác vụ BABOK trong cơ sở dữ liệu.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AI & CONNECTION */}
      {currentTab === "ai" && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate/15 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-sm font-extrabold text-navy">Cấu hình Kết nối AI Runtime (BYOK)</h3>
              <p className="text-xs text-slate mt-0.5">
                Thiết lập khóa kết nối AI hiện tại trên trình duyệt hoặc dùng cấu hình mặc định của AI Runtime Server
              </p>
            </div>
            <button
              onClick={() => setByokModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-navy-deep transition cursor-pointer"
            >
              <KeyRound size={14} />
              Thiết lập BYOK Key
            </button>
          </div>

          <div className="rounded-2xl border border-slate/15 bg-white p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate/10 pb-2.5">
              <span className="text-slate">Nhà cung cấp (Provider) trên trình duyệt:</span>
              <strong className="font-mono text-navy">{storedProvider || "Mặc định từ AI Runtime (.env)"}</strong>
            </div>
            <div className="flex items-center justify-between border-b border-slate/10 pb-2.5">
              <span className="text-slate">Model đang chọn:</span>
              <strong className="font-mono text-navy">{storedModel || "Mặc định từ AI Runtime (.env)"}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate">Trạng thái khóa BYOK cá nhân:</span>
              <span
                className={classNames(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                  hasStoredKey ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                )}
              >
                {hasStoredKey ? "Đã cấu hình Key cá nhân" : "Đang dùng Key mặc định của Server"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {currentTab === "audit" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate/15 shadow-sm">
            <h3 className="font-display text-sm font-extrabold text-navy">Nhật ký Thao tác Quản trị</h3>
            <p className="text-xs text-slate mt-0.5">Danh sách các hành động phân quyền hoặc khóa/mở khóa tài khoản thực tế</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate/15 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate/15 bg-offwhite/80 font-bold uppercase tracking-wider text-[10px] text-slate">
                <tr>
                  <th className="px-4 py-3.5">Thời gian</th>
                  <th className="px-4 py-3.5">Người thực hiện</th>
                  <th className="px-4 py-3.5">Hành động</th>
                  <th className="px-4 py-3.5">Đối tượng tác động</th>
                  <th className="px-4 py-3.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-offwhite/50 transition">
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate">{log.timestamp}</td>
                      <td className="px-4 py-3.5 font-bold text-navy">{log.actor}</td>
                      <td className="px-4 py-3.5 text-navy font-medium">{log.action}</td>
                      <td className="px-4 py-3.5 text-slate">{log.target}</td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-xs text-slate">
                      Chưa có nhật ký thao tác quản trị nào phát sinh.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {userFormMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate/15 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate/15 pb-3">
              <h3 className="font-display text-sm font-extrabold text-navy">
                {userFormMode === "create" ? "Thêm tài khoản" : `Sửa · ${userFormTarget?.fullName || ""}`}
              </h3>
              <button type="button" onClick={closeUserForm} className="cursor-pointer text-slate transition hover:text-navy">
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-navy">
                Họ tên *
                <input
                  required
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate/20 px-3 py-2 text-xs font-normal outline-none focus:border-navy/40"
                  placeholder="Nguyễn Văn A"
                />
              </label>
              <label className="block text-xs font-bold text-navy">
                Email *
                <input
                  required
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate/20 px-3 py-2 text-xs font-normal outline-none focus:border-navy/40"
                  placeholder="email@example.com"
                />
              </label>
              <label className="block text-xs font-bold text-navy">
                {userFormMode === "create" ? "Mật khẩu *" : "Mật khẩu mới (tuỳ chọn)"}
                <input
                  type="password"
                  required={userFormMode === "create"}
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate/20 px-3 py-2 text-xs font-normal outline-none focus:border-navy/40"
                  placeholder={userFormMode === "create" ? "Tối thiểu 8 ký tự" : "Để trống nếu giữ mật khẩu cũ"}
                />
              </label>

              <div>
                <p className="mb-2 text-xs font-bold text-navy">Vai trò *</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { key: "LEARNER", label: "Học viên", desc: "Luyện tập & nộp bài" },
                    { key: "INSTRUCTOR", label: "Giảng viên", desc: "Lớp & chấm bài" },
                    { key: "BAEXPERT", label: "Chuyên gia", desc: "Thẩm định dossier" },
                    { key: "ADMIN", label: "Admin", desc: "Quản trị hệ thống" },
                  ].map((r) => {
                    const isSelected = userForm.roles.includes(r.key);
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => handleToggleRoleSelection(r.key)}
                        className={classNames(
                          "flex cursor-pointer items-start gap-2.5 rounded-xl border p-2.5 text-left transition",
                          isSelected
                            ? "border-navy/40 bg-navy/5 text-navy"
                            : "border-slate/15 text-slate hover:border-slate/30"
                        )}
                      >
                        <div
                          className={classNames(
                            "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                            isSelected ? "border-navy bg-navy text-white" : "border-slate/30 bg-white"
                          )}
                        >
                          {isSelected && <Check size={11} strokeWidth={3} />}
                        </div>
                        <div>
                          <strong className="block text-xs font-bold text-navy">{r.label}</strong>
                          <span className="text-[11px] text-slate">{r.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate/15 pt-4">
              <Button variant="secondary" size="sm" type="button" onClick={closeUserForm}>
                Hủy
              </Button>
              <Button
                size="sm"
                type="button"
                disabled={isSavingUser}
                onClick={() => void handleSaveUserForm()}
                className="gap-1.5"
              >
                {isSavingUser ? <RefreshCw size={13} className="animate-spin" /> : null}
                {userFormMode === "create" ? "Tạo" : "Lưu"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
