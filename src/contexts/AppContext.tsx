import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { stakeholders } from "../constants/scenario";
import { evidenceRegister, initialInterviewMessages } from "../constants/trainingScenario";
import { sendStakeholderMessage } from "../services/mockApi";
import type { AppRole, ChatMessage } from "../types/models";

interface AppContextValue {
  role: AppRole;
  setRole: (role: AppRole) => void;
  selectedDomainId: string;
  setSelectedDomainId: (id: string) => void;
  activeStakeholderId: string;
  setActiveStakeholderId: (id: string) => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => Promise<void>;
  toggleEvidence: (id: number) => void;
  evidenceCount: number;
  eventOpen: boolean;
  setEventOpen: (open: boolean) => void;
  isReplying: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AppRole>("learner");
  const [selectedDomainId, setSelectedDomainId] = useState("all");
  const [activeStakeholderId, setActiveStakeholderId] = useState("warehouse");
  const [eventOpen, setEventOpen] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [allMessages, setAllMessages] = useState<ChatMessage[]>(initialInterviewMessages);
  const messages = allMessages.filter((message) => message.stakeholderId === activeStakeholderId);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const learner: ChatMessage = { id: Date.now(), stakeholderId: activeStakeholderId, sender: "learner", text, time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }), technique: "Follow-up question" };
    setAllMessages((current) => [...current, learner]);
    setIsReplying(true);
    const stakeholder = stakeholders.find((item) => item.id === activeStakeholderId) ?? stakeholders[2];
    const reply = await sendStakeholderMessage(stakeholder, text, messages.length);
    setAllMessages((current) => [...current, reply]);
    setIsReplying(false);
  };

  const toggleEvidence = (id: number) => setAllMessages((items) => items.map((message) => message.id === id ? { ...message, evidence: !message.evidence } : message));
  const evidenceCount = evidenceRegister.length + allMessages.filter((message) => message.evidence && message.id > 1000).length;
  const value = useMemo(() => ({ role, setRole, selectedDomainId, setSelectedDomainId, activeStakeholderId, setActiveStakeholderId, messages, sendMessage, toggleEvidence, evidenceCount, eventOpen, setEventOpen, isReplying }), [role, selectedDomainId, activeStakeholderId, messages, evidenceCount, eventOpen, isReplying]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider");
  return context;
}
