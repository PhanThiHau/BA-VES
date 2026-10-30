import { useState, useEffect } from "react";
import {
  Award,
  BarChart3,
  Building2,
  Cpu,
  Download,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  UserX,
  Shield,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { useApp } from "../../contexts/AppContext";
import { userService } from "../../services/userService";
import type { UserProfile } from "../../services/authService";
import {
  initialAdminStats,
  initialUserAccounts,
  initialMasterDomains,
  initialBabokAreas,
  initialAiModels,
  initialAuditLogs,
  type UserAccount,
  type MasterDomain,
  type AiModelConfig,
} from "./adminData";

export function AdminPage() {
  const { adminTab, setAdminTab } = useApp();
  const currentTab = adminTab || "overview";

  // State quản trị
  const [users, setUsers] = useState<UserAccount[]>(initialUserAccounts);
  const [domains, setDomains] = useState<MasterDomain[]>(initialMasterDomains);
  const [aiModels, setAiModels] = useState<AiModelConfig[]>(initialAiModels);
  const [searchUser, setSearchUser] = useState("");
  const [filterRole, setFilterRole] = useState<string>("ALL");

  // API Users State
  const [apiUsers, setApiUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);

  // Role Edit Modal State
  const [roleModalUser, setRoleModalUser] = useState<UserProfile | null>(null);
  const [editRoles, setEditRoles] = useState<string[]>([]);
  const [isUpdatingRoles, setIsUpdatingRoles] = useState(false);

  // Load users from backend API
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setUserError(null);
    try {
      const res = await userService.getUsers({
        search: searchUser.trim() || undefined,
        role: filterRole !== "ALL" ? filterRole : undefined,
      });
      setApiUsers(res || []);
    } catch (err: any) {
      console.warn("Backend users API failed, fallback to mock data:", err);
      setUserError(err?.message || "Không thể tải danh sách tài khoản từ server.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (currentTab === "users") {
      loadUsers();
    }
  }, [currentTab, searchUser, filterRole]);

  // Handle Toggle Status via API
  const handleToggleApiUserStatus = async (user: UserProfile) => {
    const isCurrentlyActive = user.status?.toLowerCase() === "active";
    const nextStatus = isCurrentlyActive ? "Suspended" : "Active";
    try {
      await userService.updateUserStatus(user.id, nextStatus);
      await loadUsers();
    } catch (err: any) {
      alert("Lỗi khi cập nhật trạng thái: " + (err?.message || "Không xác định"));
    }
  };

  // Handle Role Update via API
  const handleOpenRoleModal = (user: UserProfile) => {
    setRoleModalUser(user);
    setEditRoles(user.roles || ["LEARNER"]);
  };

  const handleToggleRoleSelection = (role: string) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSaveRoles = async () => {
    if (!roleModalUser) return;
    if (editRoles.length === 0) {
      alert("Người dùng phải có ít nhất 1 vai trò.");
      return;
    }
    setIsUpdatingRoles(true);
    try {
      await userService.updateUserRoles(roleModalUser.id, editRoles);
      setRoleModalUser(null);
      await loadUsers();
    } catch (err: any) {
      alert("Lỗi khi cập nhật vai trò: " + (err?.message || "Không xác định"));
    } finally {
      setIsUpdatingRoles(false);
    }
  };

  // Xử lý khóa / mở khóa tài khoản mock (fallback)
  const handleToggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE" } : u
      )
    );
  };

  // Lọc tài khoản mock (fallback)
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchRole = filterRole === "ALL" || u.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="mx-auto max-w-[1540px] space-y-6 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate/15 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-brass">
              <ShieldAlert size={14} />
              Trung tâm Quản trị Tối cao
            </span>
            <span className="rounded-full bg-navy/10 px-2 py-0.5 text-[10px] font-bold text-navy">
              System Admin
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
            Admin Operations Studio
          </h1>
          <p className="mt-1 text-xs text-slate">
            Giám sát vận hành hệ sinh thái BA-VES, phân quyền bảo mật, quản trị dữ liệu gốc và cấu hình AI Multi-Agent.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (currentTab === "users") loadUsers();
              else alert("Đã đồng bộ dữ liệu mới nhất từ database.");
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate/20 bg-white px-3 py-2 text-xs font-bold text-navy shadow-sm hover:border-slate/40 transition"
          >
            <RefreshCw size={14} className={`text-slate ${isLoadingUsers ? "animate-spin" : ""}`} />
            Đồng bộ hệ thống
          </button>
          <button
            onClick={() => alert("Xuất báo cáo hệ thống thành công.")}
            className="flex items-center gap-1.5 rounded-xl bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-navy-deep transition"
          >
            <Download size={14} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate/15 pb-px">
        {[
          { id: "overview", label: "Tổng quan", icon: BarChart3 },
          { id: "users", label: "Tài khoản & Phân quyền", icon: Users },
          { id: "domains", label: "Lĩnh vực & Ứng dụng", icon: Building2 },
          { id: "babok", label: "Khung chuẩn BABOK", icon: Award },
          { id: "ai", label: "Cấu hình AI & Token", icon: Cpu },
          { id: "audit", label: "Nhật ký kiểm toán", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "border-navy text-navy"
                  : "border-transparent text-slate hover:border-slate/30 hover:text-navy"
              }`}
            >
              <Icon size={15} className={isActive ? "text-brass" : "text-slate"} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {currentTab === "overview" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {initialAdminStats.map((stat) => (
              <div
                key={stat.id}
                className="rounded-2xl border border-slate/15 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate">{stat.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      stat.positive ? "bg-emerald-500/15 text-emerald-600" : "bg-brass/15 text-brass"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="mt-3 font-display text-3xl font-extrabold tracking-tight text-navy">
                  {stat.value}
                </div>
                <p className="mt-2 text-xs text-slate/80">{stat.subtext}</p>
              </div>
            ))}
          </div>

          {/* Bento Grid Overview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* System Health */}
            <div className="rounded-2xl border border-slate/15 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-display text-sm font-extrabold text-navy">
                <Server size={16} className="text-brass" />
                Trạng thái Dịch vụ & Máy chủ
              </h3>
              <p className="mt-1 text-xs text-slate">Thời gian hoạt động liên tục: 99.98% (30 ngày)</p>

              <div className="mt-5 space-y-3.5">
                {[
                  { name: "BAVES Core API (.NET 9)", status: "Ổn định", latency: "24ms", color: "bg-emerald-500" },
                  { name: "SQL Server (40 MVP Tables)", status: "Ổn định", latency: "12ms", color: "bg-emerald-500" },
                  { name: "Gemini AI Agent Gateway", status: "Ổn định", latency: "420ms", color: "bg-emerald-500" },
                  { name: "Simulation Session Socket", status: "Bình thường", latency: "45ms", color: "bg-emerald-500" },
                  { name: "Blob Storage (Artifact Files)", status: "Ổn định", latency: "18ms", color: "bg-emerald-500" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-xl bg-offwhite p-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2 w-2 rounded-full ${item.color}`} />
                      <span className="font-bold text-navy">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate text-[11px]">{item.latency}</span>
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Cost & Token Consumption */}
            <div className="rounded-2xl border border-slate/15 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-display text-sm font-extrabold text-navy">
                <Cpu size={16} className="text-brass" />
                Hạn mức & Chi phí Token AI
              </h3>
              <p className="mt-1 text-xs text-slate">Phân bổ token theo từng mục đích mô phỏng</p>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-navy">Phỏng vấn Stakeholder AI (Simulation)</span>
                    <span className="text-slate">68% (3.27M)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate/15">
                    <div className="h-full bg-navy rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-navy">Chấm điểm & Phản hồi Rubric (Assessment)</span>
                    <span className="text-slate">22% (1.06M)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate/15">
                    <div className="h-full bg-brass rounded-full" style={{ width: "22%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-navy">Gợi ý câu hỏi BAPlan (Planning)</span>
                    <span className="text-slate">10% (0.49M)</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate/15">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "10%" }} />
                  </div>
                </div>

                <div className="rounded-xl border border-brass/25 bg-brass/10 p-3 mt-4 text-xs text-navy">
                  <div className="font-bold flex items-center gap-1.5">
                    <KeyRound size={13} className="text-brass" />
                    Chế độ BYOK (Bring Your Own Key)
                  </div>
                  <p className="mt-1 text-slate text-[11px]">
                    Hiện có <strong>28/45</strong> giảng viên đang dùng API Key cá nhân để tiết kiệm ngân sách chung của trường.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Audit feed */}
            <div className="rounded-2xl border border-slate/15 bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-display text-sm font-extrabold text-navy">
                <ShieldCheck size={16} className="text-brass" />
                Hoạt động Hệ thống Mới nhất
              </h3>
              <p className="mt-1 text-xs text-slate">Nhật ký can thiệp điểm số và phân quyền</p>

              <div className="mt-4 space-y-3">
                {initialAuditLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="rounded-xl border border-slate/10 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-navy">{log.action}</span>
                      <span className="text-[10px] text-slate">{log.timestamp}</span>
                    </div>
                    <p className="mt-1 text-slate text-[11px]">
                      Thực hiện: <strong>{log.actor}</strong> &rarr; {log.target}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS & RBAC */}
      {currentTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-slate/15 shadow-sm">
            <div className="flex flex-1 items-center gap-2 max-w-md rounded-xl border border-slate/20 bg-offwhite px-3 py-1.5">
              <Search size={16} className="text-slate" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full bg-transparent text-xs text-navy outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="rounded-xl border border-slate/20 bg-white px-3 py-2 text-xs font-bold text-navy outline-none shadow-sm"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">Admin</option>
                <option value="INSTRUCTOR">Giảng viên</option>
                <option value="BAEXPERT">Chuyên gia BA</option>
                <option value="LEARNER">Học viên</option>
              </select>

              <button
                onClick={() => alert("Mở form thêm người dùng mới")}
                className="flex items-center gap-1.5 rounded-xl bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-navy-deep transition"
              >
                <UserPlus size={14} />
                Thêm tài khoản
              </button>
            </div>
          </div>

          {userError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Lưu ý: {userError} (Đang hiển thị danh sách bộ nhớ mẫu)
            </div>
          )}

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-slate/15 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate/15 bg-offwhite font-bold text-slate">
                <tr>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">ID / Lớp học</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Ngày tạo / Hoạt động</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-xs text-slate">
                      <RefreshCw size={18} className="mx-auto mb-2 animate-spin text-navy" />
                      Đang tải danh sách tài khoản từ server...
                    </td>
                  </tr>
                ) : apiUsers.length > 0 ? (
                  apiUsers.map((u) => {
                    const isActive = String(u.status).toLowerCase() === "active";
                    return (
                      <tr key={u.id} className="hover:bg-offwhite/50 transition">
                        <td className="px-4 py-3.5 font-bold text-navy">
                          <div className="flex items-center gap-2">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
                            ) : (
                              <span className="grid h-7 w-7 place-items-center rounded-full bg-navy/10 text-[10px] font-bold text-navy">
                                {u.fullName?.slice(0, 1) || "U"}
                              </span>
                            )}
                            <span>{u.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate">{u.email || "—"}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {u.roles?.map((r) => (
                              <span
                                key={r}
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  r === "ADMIN"
                                    ? "bg-purple-100 text-purple-700"
                                    : r === "INSTRUCTOR"
                                    ? "bg-blue-100 text-blue-700"
                                    : r === "BAEXPERT"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate/15 text-slate"
                                }`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate font-mono text-[11px]">#{u.id}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isActive
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {isActive ? <UserCheck size={11} /> : <UserX size={11} />}
                            {isActive ? "Hoạt động" : "Bị khóa"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "—"}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenRoleModal(u)}
                              title="Phân quyền vai trò"
                              className="rounded-lg border border-slate/20 bg-white px-2 py-1 text-[11px] font-bold text-navy hover:border-brass hover:text-brass transition"
                            >
                              Phân quyền
                            </button>
                            <button
                              onClick={() => handleToggleApiUserStatus(u)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                                isActive
                                  ? "border border-rose-300 text-rose-600 hover:bg-rose-50"
                                  : "border border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                              }`}
                            >
                              {isActive ? "Khóa" : "Mở khóa"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-offwhite/50 transition">
                      <td className="px-4 py-3.5 font-bold text-navy">{u.fullName}</td>
                      <td className="px-4 py-3.5 text-slate">{u.email}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            u.role === "ADMIN"
                              ? "bg-purple-100 text-purple-700"
                              : u.role === "INSTRUCTOR"
                              ? "bg-blue-100 text-blue-700"
                              : u.role === "BAEXPERT"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate/15 text-slate"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate">{u.cohort || "—"}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {u.status === "ACTIVE" ? <UserCheck size={11} /> : <UserX size={11} />}
                          {u.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate">{u.lastActive}</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                            u.status === "ACTIVE"
                              ? "border border-rose-300 text-rose-600 hover:bg-rose-50"
                              : "border border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          {u.status === "ACTIVE" ? "Khóa" : "Mở khóa"}
                        </button>
                      </td>
                    </tr>
                  ))
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
              <p className="text-xs text-slate">Quản trị danh mục ContentDbContext (Industries & Applications)</p>
            </div>
            <button
              onClick={() => alert("Thêm lĩnh vực mới")}
              className="flex items-center gap-1.5 rounded-xl bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-navy-deep transition"
            >
              <Plus size={14} />
              Thêm lĩnh vực
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {domains.map((dom) => (
              <div key={dom.id} className="rounded-2xl border border-slate/15 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-brass/15 px-2 py-0.5 text-[10px] font-bold text-brass uppercase">
                      {dom.code}
                    </span>
                    <h4 className="mt-1 font-display text-base font-extrabold text-navy">{dom.name}</h4>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      dom.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate/15 text-slate"
                    }`}
                  >
                    {dom.status === "ACTIVE" ? "Đang áp dụng" : "Bản nháp"}
                  </span>
                </div>
                <p className="text-xs text-slate leading-relaxed">{dom.description}</p>
                <div className="flex items-center gap-6 border-t border-slate/10 pt-3 text-xs text-slate">
                  <span><strong>{dom.applicationsCount}</strong> Ứng dụng nghiệp vụ</span>
                  <span><strong>{dom.scenariosCount}</strong> Kịch bản đào tạo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BABOK & RUBRICS */}
      {currentTab === "babok" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate/15 shadow-sm">
            <h3 className="font-display text-sm font-extrabold text-navy">
              Khung Năng lực 6 Vùng Tri thức BABOK® v3 & Bộ Tiêu chí Chấm điểm
            </h3>
            <p className="text-xs text-slate mt-0.5">
              Ánh xạ trực tiếp với bảng `BabokKnowledgeAreas`, `BabokTasks` và `Rubrics` trong Assessment module.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {initialBabokAreas.map((area) => (
              <div key={area.code} className="rounded-2xl border border-slate/15 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-navy px-2 py-0.5 text-[10px] font-bold text-white font-mono">
                    {area.code}
                  </span>
                  <span className="font-bold text-xs text-brass">Trọng số: {area.weight}%</span>
                </div>
                <h4 className="font-display text-sm font-extrabold text-navy">{area.name}</h4>
                <div className="flex items-center justify-between text-xs text-slate border-t border-slate/10 pt-3">
                  <span>{area.tasksCount} Tasks nghiệp vụ chuẩn</span>
                  <span>{area.rubricCriteriaCount} Tiêu chí rubric AI thẩm định</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AI & TOKEN GOVERNANCE */}
      {currentTab === "ai" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate/15 shadow-sm flex items-center justify-between">
            <div>
              <h3 className="font-display text-sm font-extrabold text-navy">Cấu hình Mô hình Ngôn ngữ Lớn (LLM)</h3>
              <p className="text-xs text-slate mt-0.5">Điều phối các Agent Stakeholder AI và Engine chấm điểm tự động</p>
            </div>
            <button
              onClick={() => alert("Thêm Model Provider")}
              className="flex items-center gap-1.5 rounded-xl bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-navy-deep transition"
            >
              <Plus size={14} />
              Thêm Model
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {aiModels.map((model) => (
              <div key={model.id} className="rounded-2xl border border-slate/15 bg-white p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display text-sm font-extrabold text-navy">{model.name}</h4>
                      {model.isDefault && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[9px] font-bold text-emerald-700">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate">{model.modelCode}</span>
                  </div>
                  <span className="rounded-md bg-offwhite px-2 py-0.5 text-[10px] font-bold text-slate">
                    {model.provider}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-slate/10 pt-3 text-xs">
                  <div>
                    <span className="text-slate block text-[11px]">Độ trễ trung bình:</span>
                    <strong className="text-navy">{model.avgLatencyMs} ms</strong>
                  </div>
                  <div>
                    <span className="text-slate block text-[11px]">Chi phí ước tính / 1k:</span>
                    <strong className="text-navy">{model.tokenCostPer1k}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: AUDIT LOGS */}
      {currentTab === "audit" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate/15 shadow-sm">
            <h3 className="font-display text-sm font-extrabold text-navy">Nhật ký Hoạt động & Kiểm toán Bảo mật</h3>
            <p className="text-xs text-slate mt-0.5">Lưu vết mọi hành vi chấm điểm, đổi quyền, kích hoạt kịch bản</p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate/15 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate/15 bg-offwhite font-bold text-slate">
                <tr>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Người thực hiện</th>
                  <th className="px-4 py-3">Hành động</th>
                  <th className="px-4 py-3">Đối tượng tác động</th>
                  <th className="px-4 py-3">Địa chỉ IP</th>
                  <th className="px-4 py-3 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate/10">
                {initialAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-offwhite/50 transition">
                    <td className="px-4 py-3.5 font-mono text-slate">{log.timestamp}</td>
                    <td className="px-4 py-3.5 font-bold text-navy">{log.actor}</td>
                    <td className="px-4 py-3.5 text-navy font-semibold">{log.action}</td>
                    <td className="px-4 py-3.5 text-slate">{log.target}</td>
                    <td className="px-4 py-3.5 font-mono text-slate">{log.ipAddress}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-700"
                            : log.status === "WARNING"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Phân quyền Vai trò người dùng (Update Roles) */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-navy-deep/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate/15 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate/15 p-5">
              <div className="flex items-center gap-2">
                <Shield className="text-navy" size={18} />
                <h3 className="font-bold text-navy text-sm">Phân quyền tài khoản #{roleModalUser.id}</h3>
              </div>
              <button
                onClick={() => setRoleModalUser(null)}
                className="text-slate hover:text-navy text-lg font-bold"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate">Người dùng:</p>
                <strong className="text-sm text-navy">{roleModalUser.fullName}</strong>
                <p className="text-xs text-slate/80">{roleModalUser.email}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-navy mb-2">Chọn các vai trò áp dụng:</label>
                <div className="space-y-2">
                  {[
                    { id: "LEARNER", label: "LEARNER", desc: "Học viên thực hành tình huống & nộp bài" },
                    { id: "INSTRUCTOR", label: "INSTRUCTOR", desc: "Giảng viên quản lý lớp, bài tập & chấm điểm" },
                    { id: "BAEXPERT", label: "BAEXPERT", desc: "Chuyên gia BA tham gia review & thẩm định bài nộp" },
                    { id: "ADMIN", label: "ADMIN", desc: "Quản trị viên toàn quyền cấu hình hệ thống" },
                  ].map((role) => {
                    const isSelected = editRoles.includes(role.id);
                    return (
                      <button
                        type="button"
                        key={role.id}
                        onClick={() => handleToggleRoleSelection(role.id)}
                        className={`w-full flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? "border-navy bg-navy/5 ring-1 ring-navy"
                            : "border-slate/20 hover:border-slate/40"
                        }`}
                      >
                        <div
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                            isSelected ? "border-navy bg-navy text-white" : "border-slate/30 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                        </div>
                        <div>
                          <strong className="block text-xs font-bold text-navy">{role.label}</strong>
                          <span className="block text-[11px] text-slate">{role.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate/10">
                <button
                  type="button"
                  onClick={() => setRoleModalUser(null)}
                  className="rounded-xl border border-slate/20 px-3.5 py-2 text-xs font-bold text-slate hover:text-navy transition"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={isUpdatingRoles}
                  onClick={handleSaveRoles}
                  className="rounded-xl bg-navy px-4 py-2 text-xs font-bold text-white hover:bg-navy-light transition disabled:opacity-50"
                >
                  {isUpdatingRoles ? "Đang lưu..." : "Cập nhật quyền"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
