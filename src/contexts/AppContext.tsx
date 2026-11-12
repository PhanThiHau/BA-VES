import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, type UserProfile } from "../services/authService";
import { getStoredTokens } from "../services/apiClient";
import { simulationService, type SessionAgentDto } from "../services/simulationService";
import type { AppRole, ChatMessage } from "../types/models";

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
  activeStakeholderId: string;
  setActiveStakeholderId: (id: string) => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  loadAgentMessages: (sessionId: number, agentId: number) => Promise<void>;
  toggleEvidence: (id: number) => void;
  evidenceCount: number;
  eventOpen: boolean;
  setEventOpen: (open: boolean) => void;
  isReplying: boolean;
  instructorTab: string;
  setInstructorTab: (tab: string) => void;
  adminTab: string;
  setAdminTab: (tab: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>("learner");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [byokModalOpen, setByokModalOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [currentSubmissionId, setCurrentSubmissionId] = useState<number | null>(null);
  const [currentScenarioVersionId, setCurrentScenarioVersionId] = useState<number | null>(1);
  const [activeAgents, setActiveAgents] = useState<SessionAgentDto[]>([]);

  const [selectedDomainId, setSelectedDomainId] = useState("all");
  const [activeStakeholderId, setActiveStakeholderId] = useState("warehouse");
  const [eventOpen, setEventOpen] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [instructorTab, setInstructorTab] = useState("overview");
  const [adminTab, setAdminTab] = useState("overview");
  const [allMessages, setAllMessages] = useState<ChatMessage[]>([]);

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
      if (me.roles.includes("INSTRUCTOR") || me.roles.includes("ADMIN") || me.roles.includes("BAEXPERT")) {
        setRole("instructor");
      } else {
        setRole("learner");
      }
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

  const messages = allMessages.filter((message) => message.stakeholderId === activeStakeholderId);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const learner: ChatMessage = {
      id: Date.now(),
      stakeholderId: activeStakeholderId,
      sender: "learner",
      text,
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      technique: "Follow-up question",
    };
    setAllMessages((current) => [...current, learner]);
    setIsReplying(true);

    try {
      // Find active agent ID from backend agent list
      const agent = activeAgents.find(
        (a) =>
          String(a.id) === activeStakeholderId ||
          a.stakeholderRole?.toLowerCase().includes(activeStakeholderId.toLowerCase()) ||
          a.name?.toLowerCase().includes(activeStakeholderId.toLowerCase())
      ) || activeAgents[0];

      if (currentSessionId && agent?.id) {
        // API 13: POST /api/sessions/{sessionId}/agents/{agentId}/messages
        const res = await simulationService.sendMessage(currentSessionId, agent.id, text);
        if (res?.stakeholderMessage) {
          const aiReply: ChatMessage = {
            id: res.stakeholderMessage.id || Date.now() + 1,
            stakeholderId: activeStakeholderId,
            sender: "agent",
            text: res.stakeholderMessage.content,
            time: new Date(res.stakeholderMessage.createdAt || Date.now()).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          setAllMessages((current) => [...current, aiReply]);
          setIsReplying(false);
          return;
        }
      }

      const systemNotice: ChatMessage = {
        id: Date.now() + 1,
        stakeholderId: activeStakeholderId,
        sender: "agent",
        text: "Chưa có phiên thực hành hoặc nhân vật AI đang hoạt động. Vui lòng chọn kịch bản và nhấn 'Bắt đầu phiên thực hành'.",
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setAllMessages((current) => [...current, systemNotice]);
    } catch (err: any) {
      const errorNotice: ChatMessage = {
        id: Date.now() + 1,
        stakeholderId: activeStakeholderId,
        sender: "agent",
        text: `Không thể nhận phản hồi từ máy chủ AI: ${err?.message || "Vui lòng kiểm tra cấu hình BYOK API Key hoặc kết nối Backend."}`,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      };
      setAllMessages((current) => [...current, errorNotice]);
    } finally {
      setIsReplying(false);
    }
  };

  // API 14: GET /api/sessions/{sessionId}/agents/{agentId}/messages
  const loadAgentMessages = async (sessionId: number, agentId: number) => {
    try {
      const data = await simulationService.getMessages(sessionId, agentId);
      if (data?.messages && data.messages.length > 0) {
        const loaded: ChatMessage[] = data.messages.map((m) => ({
          id: m.id,
          stakeholderId: activeStakeholderId,
          sender: m.senderRole?.toLowerCase() === "learner" ? "learner" : "agent",
          text: m.content,
          time: new Date(m.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        }));
        setAllMessages((prev) => {
          const other = prev.filter((p) => p.stakeholderId !== activeStakeholderId);
          return [...other, ...loaded];
        });
      }
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
    }),
    [
      role,
      user,
      isLoadingUser,
      byokModalOpen,
      currentSessionId,
      currentSubmissionId,
      currentScenarioVersionId,
      activeAgents,
      selectedDomainId,
      activeStakeholderId,
      messages,
      evidenceCount,
      eventOpen,
      isReplying,
      instructorTab,
      adminTab,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
