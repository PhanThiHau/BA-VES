export interface SystemStat {
  id: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  subtext: string;
}

export interface MasterDomain {
  id: string;
  code: string;
  name: string;
  description: string;
  applicationsCount: number;
  scenariosCount: number;
  status: "ACTIVE" | "DRAFT";
}

export interface AiModelConfig {
  id: string;
  name: string;
  provider: "Google Gemini" | "OpenAI" | "Anthropic" | "DeepSeek";
  modelCode: string;
  status: "ACTIVE" | "DEPRECATED" | "TESTING";
  tokenCostPer1k: string;
  avgLatencyMs: number;
  isDefault: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ipAddress: string;
  status: "SUCCESS" | "WARNING" | "BLOCKED";
}

export const initialAdminStats: SystemStat[] = [
  {
    id: "users",
    label: "Tổng người dùng hoạt động",
    value: "1,248",
    change: "+12.4%",
    positive: true,
    subtext: "1,120 Học viên, 45 Giảng viên, 8 Admin",
  },
  {
    id: "sessions",
    label: "Phiên mô phỏng AI đồng thời",
    value: "38",
    change: "+5.1%",
    positive: true,
    subtext: "Cao điểm 52 phiên trong tuần",
  },
  {
    id: "tokens",
    label: "Tiêu thụ Token AI (Tháng này)",
    value: "4.82M",
    change: "-3.2%",
    positive: true,
    subtext: "Ước tính chi phí: $14.20 USD",
  },
  {
    id: "rubrics",
    label: "Hồ sơ đánh giá chuẩn hóa",
    value: "96.4%",
    change: "+2.0%",
    positive: true,
    subtext: "Bám sát 6 vùng tri thức BABOK v3",
  },
];

export const initialAiModels: AiModelConfig[] = [
  {
    id: "m-gemini-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google Gemini",
    modelCode: "gemini-2.5-flash",
    status: "ACTIVE",
    tokenCostPer1k: "$0.0001",
    avgLatencyMs: 420,
    isDefault: true,
  },
  {
    id: "m-gemini-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google Gemini",
    modelCode: "gemini-1.5-pro-latest",
    status: "ACTIVE",
    tokenCostPer1k: "$0.0012",
    avgLatencyMs: 950,
    isDefault: false,
  },
  {
    id: "m-gpt-4o",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    modelCode: "gpt-4o-mini",
    status: "ACTIVE",
    tokenCostPer1k: "$0.00015",
    avgLatencyMs: 510,
    isDefault: false,
  },
  {
    id: "m-claude-35",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    modelCode: "claude-3-5-sonnet-20241022",
    status: "TESTING",
    tokenCostPer1k: "$0.0030",
    avgLatencyMs: 880,
    isDefault: false,
  },
];

export const initialAuditLogs: AuditLogItem[] = [
  {
    id: "aud-01",
    timestamp: "26/10/2026 14:48:12",
    actor: "ThS. Nguyễn Đăng Khoa",
    action: "CẬP NHẬT ĐIỂM HỌC VIÊN",
    target: "Submission #SUB-094 (Đỗ Gia Hân)",
    ipAddress: "118.69.182.10",
    status: "SUCCESS",
  },
  {
    id: "aud-02",
    timestamp: "26/10/2026 14:30:05",
    actor: "Hệ thống AI Evaluator",
    action: "CHẤM ĐIỂM TỰ ĐỘNG RUBRIC",
    target: "BAPlan Session #SS-104",
    ipAddress: "10.0.0.8 (Internal)",
    status: "SUCCESS",
  },
  {
    id: "aud-03",
    timestamp: "26/10/2026 13:12:44",
    actor: "Võ Minh Trí (Admin)",
    action: "KÍCH HOẠT MODEL AI MỚI",
    target: "Gemini 2.5 Flash",
    ipAddress: "14.232.208.55",
    status: "SUCCESS",
  },
  {
    id: "aud-04",
    timestamp: "26/10/2026 11:05:20",
    actor: "Unknown (IP 45.144.225.1)",
    action: "ĐĂNG NHẬP THẤT BẠI LIÊN TỤC",
    target: "Tài khoản instructor_demo",
    ipAddress: "45.144.225.1",
    status: "BLOCKED",
  },
];
