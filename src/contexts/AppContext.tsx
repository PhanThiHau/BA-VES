import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, type UserProfile } from "../services/authService";
import { getStoredTokens } from "../services/apiClient";
import { simulationService, type SessionAgentDto } from "../services/simulationService";
import type { AppRole, ChatMessage } from "../types/models";
import { resolveAppRole } from "../utils/roles";

export type SettingsTab = "profile" | "password" | "ai" | "usage";

interface AppContextValue {
  role: AppRole;
  setRole: (role: AppRole) => void;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  isLoadingUser: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;

  byokModalOpen: boolean;
  setByokModalOpen: (open: boolean) => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  settingsTab: SettingsTab;
  setSettingsTab: (tab: SettingsTab) => void;
  openSettings: (tab?: SettingsTab) => void;

  currentSessionId: number | null;
  setCurrentSessionId: (id: number | null) => void;
  currentSubmissionId: number | null;
  setCurrentSubmissionId: (id: number | null) => void;
  currentScenarioVersionId: number | null;
  setCurrentScenarioVersionId: (id: number | null) => void;
  activeAgents: SessionAgentDto[];
  setActiveAgents: (agents: SessionAgentDto[]) => void;

  selectedDomainId: string;
  setSelectedDomainId: (id: string) => void;
  /** Lưu vị trí duyệt Ngành → Ứng dụng → Kịch bản để quay lại từ scenario-detail không bị mất state. */
  catalogBrowse: {
    view: "industries" | "applications" | "scenarios";
    industryId: number | null;
    applicationId: number | null;
  };
  setCatalogBrowse: (
    browse:
      | {
          view: "industries" | "applications" | "scenarios";
          industryId: number | null;
          applicationId: number | null;
        }
      | ((prev: {
          view: "industries" | "applications" | "scenarios";
          industryId: number | null;
          applicationId: number | null;
        }) => {
          view: "industries" | "applications" | "scenarios";
          industryId: number | null;
          applicationId: number | null;
        })
  ) => void;
  activeStakeholderId: string;
  setActiveStakeholderId: (id: string) => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  loadAgentMessages: (sessionId: number, agentId: number, stakeholderKey?: string) => Promise<void>;
  toggleEvidence: (id: number) => void;
  evidenceCount: number;
  eventOpen: boolean;
  setEventOpen: (open: boolean) => void;
  isReplying: boolean;
  instructorTab: string;
  setInstructorTab: (tab: string) => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;
  expertTab: string;
  setExpertTab: (tab: string) => void;
  activeDocTarget: { templateId: string; artifactId?: number } | null;
  setActiveDocTarget: (target: { templateId: string; artifactId?: number } | null) => void;
}


const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>("learner");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("profile");
  const openSettings = (tab: SettingsTab = "profile") => {
    setSettingsTab(tab);
    setSettingsModalOpen(true);
  };
  const byokModalOpen = settingsModalOpen && settingsTab === "ai";
  const setByokModalOpen = (open: boolean) => {
    if (open) {
      setSettingsTab("ai");
      setSettingsModalOpen(true);
    } else {
      setSettingsModalOpen(false);
    }
  };
  const [currentSessionId, setCurrentSessionIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem("baves_current_session_id");
    return saved ? parseInt(saved, 10) : null;
  });

  const setCurrentSessionId = (id: number | null) => {
    setCurrentSessionIdState(id);
    if (id !== null) {
      localStorage.setItem("baves_current_session_id", String(id));
    } else {
      localStorage.removeItem("baves_current_session_id");
    }
  };

  const [currentSubmissionId, setCurrentSubmissionId] = useState<number | null>(null);
  const [currentScenarioVersionId, setCurrentScenarioVersionId] = useState<number | null>(1);
  const [activeAgents, setActiveAgents] = useState<SessionAgentDto[]>([]);

  const [selectedDomainId, setSelectedDomainId] = useState("all");
  const [catalogBrowse, setCatalogBrowse] = useState<{
    view: "industries" | "applications" | "scenarios";
    industryId: number | null;
    applicationId: number | null;
  }>({ view: "industries", industryId: null, applicationId: null });
  const [activeStakeholderId, setActiveStakeholderId] = useState("warehouse");
  const [eventOpen, setEventOpen] = useState(false);
  const [replyingAgents, setReplyingAgents] = useState<Record<string, boolean>>({});
  const [instructorTab, setInstructorTab] = useState("overview");
  const [adminTab, setAdminTab] = useState("overview");
  const [expertTab, setExpertTab] = useState("overview");
  const [activeDocTarget, setActiveDocTarget] = useState<{ templateId: string; artifactId?: number } | null>(null);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);

  // Automatically load session agents when session is active
  useEffect(() => {
    if (!currentSessionId) return;
    simulationService
      .getSessionAgents(currentSessionId)
      .then((agents) => {
        if (agents && agents.length > 0) {
          setActiveAgents(agents);
          if (agents[0].stakeholderRole) {
            setActiveStakeholderId(agents[0].stakeholderRole.toLowerCase());
          }
        }
      })
      .catch((err) => {
        console.warn("Failed to load session agents from API:", err);
        if (err?.status === 404) {
          setCurrentSessionId(null);
        }
      });
  }, [currentSessionId]);

  // If no session ID is stored, try to auto-restore the user's latest active session
  useEffect(() => {
    if (currentSessionId || !user) return;
    simulationService
      .getMySessions()
      .then((sessions) => {
        if (sessions && sessions.length > 0) {
          const activeWithMsgs = sessions.find(
            (s) =>
              (String(s.status).toLowerCase() === "active" || s.status === 0) &&
              s.messageCount > 0
          );
          const active = sessions.find(
            (s) => String(s.status).toLowerCase() === "active" || s.status === 0
          );
          const target = activeWithMsgs || active || sessions[0];
          if (target?.id) {
            setCurrentSessionId(target.id);
          }
        }
      })
      .catch((err) => {
        console.warn("Could not auto-restore session from history:", err);
      });
  }, [user, currentSessionId]);

  // Load current user profile if token is present
  const refreshUser = async () => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      setUser(null);
      setIsLoadingUser(false);
      return;
    }
    try {
      const me = await authService.getMe();
      setUser(me);
      setRole(resolveAppRole(me.roles));
    } catch {
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    await authService.logout();
    setUser(null);
    window.location.hash = "#/login";
  };

  const activeAgent = useMemo(() => {
    return (
      activeAgents.find(
        (a) =>
          a.stakeholderRole?.toLowerCase() === activeStakeholderId.toLowerCase() ||
          String(a.id) === activeStakeholderId
      ) || activeAgents[0]
    );
  }, [activeAgents, activeStakeholderId]);

  const activeReplyKey = activeAgent?.id
    ? `agent-${activeAgent.id}`
    : `role-${activeStakeholderId.toLowerCase()}`;
  const isReplying = Boolean(replyingAgents[activeReplyKey]);

  const messages = allMessages.filter((message) => {
    if (activeAgent?.id && message.sessionAgentId !== undefined) {
      return message.sessionAgentId === activeAgent.id;
    }
    return message.stakeholderId === activeStakeholderId;
  });

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const targetStakeholderId = activeStakeholderId;

    // Find active agent ID from backend agent list
    const agent =
      activeAgents.find(
        (a) =>
          a.stakeholderRole?.toLowerCase() === targetStakeholderId.toLowerCase() ||
          String(a.id) === targetStakeholderId
      ) || activeAgents[0];

    const currentAgentId = agent?.id;
    const replyKey = currentAgentId
      ? `agent-${currentAgentId}`
      : `role-${targetStakeholderId.toLowerCase()}`;

    const learner: ChatMessage = {
      id: Date.now(),
      sessionAgentId: currentAgentId,
      stakeholderId: targetStakeholderId,
      sender: "learner",
      text,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      technique: "Follow-up question",
    };
    setAllMessages((current) => [...current, learner]);
    setReplyingAgents((prev) => ({ ...prev, [replyKey]: true }));

    try {
      if (currentSessionId && agent?.id) {
        // API 13: POST /api/sessions/{sessionId}/agents/{agentId}/messages
        const res = await simulationService.sendMessage(currentSessionId, agent.id, text);
        if (res?.stakeholderMessage) {
          const aiReply: ChatMessage = {
            id: res.stakeholderMessage.id || Date.now() + 1,
            sessionAgentId: currentAgentId,
            stakeholderId: targetStakeholderId,
            sender: "agent",
            text: res.stakeholderMessage.content,
            time: new Date(res.stakeholderMessage.createdAt || Date.now()).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setAllMessages((current) => [...current, aiReply]);
          return;
        }
      } else {
        const errorReply: ChatMessage = {
          id: Date.now() + 1,
          sessionAgentId: currentAgentId,
          stakeholderId: targetStakeholderId,
          sender: "agent",
          text: "Chưa có phiên mô phỏng (Session) hoặc Stakeholder hợp lệ từ máy chủ. Vui lòng bắt đầu một phiên kịch bản trước khi phỏng vấn.",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };
        setAllMessages((current) => [...current, errorReply]);
        return;
      }
    } catch (err: any) {
      console.warn("Backend chat message API error:", err);
      const errorReply: ChatMessage = {
        id: Date.now() + 1,
        sessionAgentId: currentAgentId,
        stakeholderId: targetStakeholderId,
        sender: "agent",
        text: `Lỗi kết nối tới Stakeholder: ${err?.message || "Không thể gửi tin nhắn"}. Vui lòng thử lại.`,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setAllMessages((current) => [...current, errorReply]);
      return;
    } finally {
      setReplyingAgents((prev) => ({ ...prev, [replyKey]: false }));
    }
  };

  // API 14: GET /api/sessions/{sessionId}/agents/{agentId}/messages
  const loadAgentMessages = async (sessionId: number, agentId: number, stakeholderKey?: string) => {
    try {
      const data = await simulationService.getMessages(sessionId, agentId, 1, 100);
      const rawList = data?.items || (data as any)?.messages || [];
      const key = stakeholderKey || activeStakeholderId;
      const loaded: ChatMessage[] = (rawList || []).map((m: any) => {
        const isLearner =
          m.senderType === 0 ||
          m.senderType === "Learner" ||
          m.senderRole?.toLowerCase() === "learner";
        return {
          id: m.id,
          sessionAgentId: m.sessionAgentId || agentId,
          stakeholderId: key,
          sender: isLearner ? "learner" : "agent",
          text: m.content,
          time: new Date(m.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        };
      });

      setAllMessages((prev) => {
        const other = prev.filter(
          (p) =>
            (p.sessionAgentId !== undefined && p.sessionAgentId !== agentId) ||
            (p.sessionAgentId === undefined && p.stakeholderId !== key)
        );
        // Giữ lại các tin nhắn tạm (optimistic) chưa được đồng bộ lên DB nếu agent đang trả lời
        const pendingOptimistic = prev.filter(
          (p) =>
            ((p.sessionAgentId !== undefined && p.sessionAgentId === agentId) ||
              (p.sessionAgentId === undefined && p.stakeholderId === key)) &&
            p.id > 1_000_000_000_000 &&
            !loaded.some((l) => l.sender === p.sender && l.text === p.text)
        );
        return [...other, ...loaded, ...pendingOptimistic];
      });
    } catch (err) {
      console.warn("Failed to load transcript messages from backend:", err);
    }
  };

  const toggleEvidence = (id: number) =>
    setAllMessages((items) =>
      items.map((message) =>
        message.id === id ? { ...message, evidence: !message.evidence } : message
      )
    );

  const evidenceCount = allMessages.filter((message) => message.evidence).length;

  const value = useMemo(
    () => ({
      role,
      setRole,
      user,
      setUser,
      isLoadingUser,
      logout,
      refreshUser,
      byokModalOpen,
      setByokModalOpen,
      settingsModalOpen,
      setSettingsModalOpen,
      settingsTab,
      setSettingsTab,
      openSettings,
      currentSessionId,
      setCurrentSessionId,
      currentSubmissionId,
      setCurrentSubmissionId,
      currentScenarioVersionId,
      setCurrentScenarioVersionId,
      activeAgents,
      setActiveAgents,
      selectedDomainId,
      setSelectedDomainId,
      catalogBrowse,
      setCatalogBrowse,
      activeStakeholderId,
      setActiveStakeholderId,
      messages,
      sendMessage,
      loadAgentMessages,
      toggleEvidence,
      evidenceCount,
      eventOpen,
      setEventOpen,
      isReplying,
      instructorTab,
      setInstructorTab,
      adminTab,
      setAdminTab,
      expertTab,
      setExpertTab,
      activeDocTarget,
      setActiveDocTarget,
    }),
    [
      role,
      user,
      isLoadingUser,
      byokModalOpen,
      settingsModalOpen,
      settingsTab,
      currentSessionId,
      currentSubmissionId,
      currentScenarioVersionId,
      activeAgents,
      selectedDomainId,
      catalogBrowse,
      activeStakeholderId,
      messages,
      evidenceCount,
      eventOpen,
      isReplying,
      instructorTab,
      adminTab,
      expertTab,
      activeDocTarget,
    ]

  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
