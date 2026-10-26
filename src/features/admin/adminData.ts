export interface SystemStat {
  id: string;
  label: string;
  value: string;
  change: string;
  positive: boolean;
  subtext: string;
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "INSTRUCTOR" | "BAEXPERT" | "LEARNER";
  status: "ACTIVE" | "SUSPENDED" | "INVITED";
  cohort?: string;
  lastActive: string;
  sessionsCount: number;
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

export interface BabokAreaConfig {
  code: string;
  name: string;
  tasksCount: number;
  weight: number; // percentage
  rubricCriteriaCount: number;
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

export const initialUserAccounts: UserAccount[] = [
  {
    id: "usr-01",
    fullName: "Võ Minh Trí (Quản trị viên)",
    email: "tri.vm@baves.edu.vn",
    role: "ADMIN",
    status: "ACTIVE",
    lastActive: "Vừa xong",
    sessionsCount: 0,
  },
  {
    id: "usr-02",
    fullName: "ThS. Nguyễn Đăng Khoa",
    email: "khoa.nd@baves.edu.vn",
    role: "INSTRUCTOR",
    status: "ACTIVE",
    cohort: "K2026-BA01",
    lastActive: "15 phút trước",
    sessionsCount: 42,
  },
  {
    id: "usr-03",
    fullName: "TS. Lê Hoàng Mai",
    email: "mai.lh@baves.edu.vn",
    role: "BAEXPERT",
    status: "ACTIVE",
    lastActive: "2 giờ trước",
    sessionsCount: 18,
  },
  {
    id: "usr-04",
    fullName: "Đỗ Gia Hân (Học viên)",
    email: "han.dg26@student.edu.vn",
    role: "LEARNER",
    status: "ACTIVE",
    cohort: "K2026-BA01",
    lastActive: "5 phút trước",
    sessionsCount: 9,
  },
  {
    id: "usr-05",
    fullName: "Phan Anh Vũ (Học viên)",
    email: "vu.pa26@student.edu.vn",
    role: "LEARNER",
    status: "ACTIVE",
    cohort: "K2026-BA02",
    lastActive: "Hôm qua",
    sessionsCount: 4,
  },
  {
    id: "usr-06",
    fullName: "Lâm Quốc Cường",
    email: "cuong.lq@student.edu.vn",
    role: "LEARNER",
    status: "SUSPENDED",
    cohort: "K2026-BA01",
    lastActive: "3 ngày trước",
    sessionsCount: 1,
  },
];

export const initialMasterDomains: MasterDomain[] = [
  {
    id: "dom-01",
    code: "SUPPLY_CHAIN",
    name: "Quản lý Kho & Chuỗi cung ứng (VinaSupply Retail)",
    description: "Mô phỏng đứt hàng, kiểm kê barcode WMS, đồng bộ tồn kho đa kênh",
    applicationsCount: 8,
    scenariosCount: 6,
    status: "ACTIVE",
  },
  {
    id: "dom-02",
    code: "FINTECH_BANKING",
    name: "Tài chính & Ngân hàng số (FinBank Corp)",
    description: "Quy trình mở thẻ tín dụng eKYC, chấm điểm tín dụng và đối soát giao dịch",
    applicationsCount: 6,
    scenariosCount: 4,
    status: "ACTIVE",
  },
  {
    id: "dom-03",
    code: "HEALTHCARE",
    name: "Y tế & Hồ sơ Bệnh án điện tử (MediCare Plus)",
    description: "Quản lý luồng khám ngoại trú, cấp phát thuốc BHYT và viện phí tự động",
    applicationsCount: 5,
    scenariosCount: 3,
    status: "ACTIVE",
  },
  {
    id: "dom-04",
    code: "E_COMMERCE",
    name: "Thương mại điện tử & Vận chuyển (EcoMart)",
    description: "Xử lý giỏ hàng, flash sale, hoàn tất đơn hàng và xử lý khiếu nại hoàn trả",
    applicationsCount: 5,
    scenariosCount: 2,
    status: "DRAFT",
  },
];

export const initialBabokAreas: BabokAreaConfig[] = [
  { code: "BAPM", name: "Lập kế hoạch & Giám sát BA (BA Planning & Monitoring)", tasksCount: 5, weight: 15, rubricCriteriaCount: 6 },
  { code: "EC", name: "Khai thác & Phối hợp (Elicitation & Collaboration)", tasksCount: 5, weight: 25, rubricCriteriaCount: 8 },
  { code: "RLCM", name: "Quản lý vòng đời Yêu cầu (Requirements Life Cycle Mgmt)", tasksCount: 5, weight: 15, rubricCriteriaCount: 5 },
  { code: "SA", name: "Phân tích Chiến lược (Strategy Analysis)", tasksCount: 4, weight: 10, rubricCriteriaCount: 4 },
  { code: "RADD", name: "Phân tích Yêu cầu & Xác định Thiết kế (RADD)", tasksCount: 6, weight: 25, rubricCriteriaCount: 10 },
  { code: "SE", name: "Đánh giá Giải pháp (Solution Evaluation)", tasksCount: 5, weight: 10, rubricCriteriaCount: 4 },
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
