export interface ScenarioVersion {
  id: string;
  versionNumber: string;
  scenarioId: string;
  scenarioTitle: string;
  domain: "Bán lẻ" | "Chuỗi cung ứng" | "Tài chính";
  status: "Đã ban hành" | "Bản nháp" | "Lưu trữ";
  baselineProblem: string;
  groundTruth: string;
  stakeholdersCount: number;
  eventsCount: number;
  evidenceCount: number;
  rubricCriteriaCount: number;
  updatedAt: string;
}

export interface StakeholderPersona {
  id: string;
  scenarioId: string;
  name: string;
  role: string;
  department: string;
  businessGoal: string;
  authority: string;
  knowledgeBoundary: string;
  hiddenInformation: string;
  conflictingStance: string;
  status: "Đã kiểm thử đạt" | "Cần kiểm tra lại";
}

export interface AgentKnowledgeItem {
  id: string;
  scenarioId: string;
  title: string;
  category: "Quy tắc nghiệp vụ" | "Thực tế quy trình" | "Ràng buộc dữ liệu" | "Kiến trúc hệ thống";
  content: string;
  confidentiality: "Công khai" | "Nội bộ" | "Tuyệt mật";
  knownByStakeholders: string[];
}

export interface ScenarioEventConfig {
  id: string;
  scenarioId: string;
  title: string;
  triggerType: "manual_instructor" | "message_count" | "time_elapsed";
  triggerCondition: string;
  description: string;
  impactedRequirements: string[];
  injectedFact: string;
}

export interface LiveSessionItem {
  id: string;
  learner: string;
  scenario: string;
  version: string;
  currentStakeholder: string;
  stage: string;
  progress: number;
  elapsed: string;
  messagesCount: number;
  signal: string;
  severity: "Đang làm tốt" | "Cần nhắc nhở" | "Thiếu bằng chứng" | "Có sự kiện thay đổi";
  transcript: Array<{
    sender: "learner" | "agent";
    stakeholderName?: string;
    text: string;
    time: string;
    isEvidence?: boolean;
    technique?: string;
  }>;
}

export interface CriterionReview {
  id: string;
  babokArea: string;
  name: string;
  weight: number;
  aiScore: number;
  humanScore: number;
  aiEvidenceQuote: string;
  status: "Đạt" | "Cần xem xét";
}

export interface ReviewItem {
  id: string;
  learner: string;
  cohort: string;
  scenarioId: string;
  scenarioTitle: string;
  stage: string;
  aiScore: number | null;
  aiConfidence: number | null;
  humanScore: number | null;
  status: "pending" | "calibrated" | "revision_requested";
  issueSummary: string;
  submittedAt: string;
  due: string;
  tone: "red" | "amber" | "navy" | "green";
  deliverablesSubmitted: string[];
  moderatorNotes: string;
  criteria: CriterionReview[];
}

export interface CohortItem {
  id: string;
  code: string;
  name: string;
  instructorName: string;
  studentsCount: number;
  activeAssignmentsCount: number;
  completionRate: number;
  averageScore: number;
  domain: string;
  status: "active" | "archived";
}

export interface AssignmentItem {
  id: string;
  title: string;
  cohortId: string;
  cohortName: string;
  scenarioVersionId: string;
  scenarioTitle: string;
  deadline: string;
  attemptLimit: number;
  submissionsCount: number;
  totalStudents: number;
  status: "active" | "upcoming" | "closed";
}

// Giữ lại dữ liệu mẫu cho LiveSessionsTab vì Backend chưa có API lấy danh sách phiên trực tiếp của toàn bộ học viên.
export const initialScenarioEvents: ScenarioEventConfig[] = [
  {
    id: "evt-01",
    scenarioId: "INV-2026",
    title: "Nhà cung ứng vỏ hộp thông báo trễ hàng 7 ngày",
    triggerType: "message_count",
    triggerCondition: "Tự động kích hoạt khi học viên gửi câu hỏi thứ 8",
    description: "Nhà cung cấp bao bì chính gặp sự cố hỏng máy, toàn bộ đợt giao vỏ hộp sữa trong tuần bị hoãn lại 7 ngày làm việc.",
    impactedRequirements: ["Kế hoạch điều phối hàng giữa các kho", "Cập nhật bảng quản lý rủi ro", "Phương án dùng bao bì dự phòng"],
    injectedFact: "Kho Tân Bình chỉ còn đủ vỏ hộp sữa dùng trong 48 giờ tới nếu không được chi viện từ kho Bình Dương.",
  },
  {
    id: "evt-02",
    scenarioId: "INV-2026",
    title: "Phòng Kế toán khóa sổ tháng sớm hơn 3 ngày",
    triggerType: "manual_instructor",
    triggerCondition: "Giảng viên bấm nút kích hoạt thủ công trong lúc học viên thực hành",
    description: "Ban Giám đốc yêu cầu kế toán chốt toàn bộ số liệu xuất nhập sớm hơn thường lệ để phục vụ thanh tra tài chính.",
    impactedRequirements: ["Thời hạn phê duyệt phiếu xuất kho", "Quy trình xử lý đơn hàng khẩn cấp"],
    injectedFact: "Sau 18h00 ngày 25, mọi giao dịch chuyển hàng sẽ bị phong tỏa số liệu sang tháng sau.",
  },
  {
    id: "evt-03",
    scenarioId: "INV-2026",
    title: "Cắt giảm 25% ngân sách phần mềm ban đầu",
    triggerType: "manual_instructor",
    triggerCondition: "Giảng viên bấm nút kích hoạt thủ công trong lúc học viên thực hành",
    description: "Giám đốc dự án thông báo bị cắt giảm 25% kinh phí, yêu cầu học viên lọc lại xem tính năng nào làm trước, tính năng nào bỏ bớt.",
    impactedRequirements: ["Phân loại ưu tiên tính năng (Bắt buộc / Nên có / Có thể bỏ)", "Kế hoạch mua sắm thiết bị quét mã mới"],
    injectedFact: "Công ty không đủ tiền mua thêm máy quét chuyên dụng mới; phần mềm phải cho phép công nhân dùng điện thoại cá nhân để quét mã.",
  },
  {
    id: "evt-04",
    scenarioId: "INV-2026",
    title: "Chiến dịch Siêu khuyến mãi được đẩy lên sớm 5 ngày",
    triggerType: "manual_instructor",
    triggerCondition: "Giảng viên bấm nút kích hoạt thủ công trong lúc học viên thực hành",
    description: "Phòng Marketing quyết định mở đợt giảm giá toàn hệ thống sớm hơn kế hoạch.",
    impactedRequirements: ["Khả năng chịu tải của hệ thống kho", "Tốc độ xuất đơn hàng trong giờ cao điểm"],
    injectedFact: "Lượng đơn hàng xuất kho dự kiến sẽ tăng gấp đôi trong 3 ngày đầu tiên của chương trình.",
  },
];

export const initialLiveSessions: LiveSessionItem[] = [
  {
    id: "ses-01",
    learner: "Lê Phương Thảo",
    scenario: "Quản lý Tồn kho & Cung ứng Sữa",
    version: "v1.3",
    currentStakeholder: "Chuyên viên Kế hoạch Nhu cầu",
    stage: "Phỏng vấn tìm hiểu nhu cầu",
    progress: 54,
    elapsed: "42:18",
    messagesCount: 14,
    signal: "Đang hỏi câu hỏi dẫn dắt (định hướng câu trả lời sẵn cho nhân vật)",
    severity: "Cần nhắc nhở",
    transcript: [
      { sender: "learner", text: "Chào anh Long, anh có nghĩ nếu phần mềm tự động tạo đơn mua hàng thì sẽ giải quyết được hết chuyện đứt hàng không?", time: "10:14", technique: "Câu hỏi dẫn dắt (Leading question)" },
      { sender: "agent", stakeholderName: "Phạm Đức Long", text: "Tự tạo đơn chỉ là một phần thôi em. Nếu không biết chính xác nhà cung ứng mất bao nhiêu ngày mới giao hàng tới, hoặc kho thực tế bị lệch số thì đơn tạo ra vẫn sai bét.", time: "10:15", isEvidence: true },
      { sender: "learner", text: "Vậy hiện tại anh đang theo dõi thời gian giao hàng của các nhà cung ứng như thế nào?", time: "10:18", technique: "Câu hỏi mở khám phá (Open question)" },
      { sender: "agent", stakeholderName: "Phạm Đức Long", text: "Tôi phải tự làm trên file Excel. Bên bao bì họ mất 5 ngày, còn bên hương liệu nhập khẩu thì phải mất đến 14 ngày lận.", time: "10:20", isEvidence: true },
    ],
  },
  {
    id: "ses-02",
    learner: "Đoàn Gia Bảo",
    scenario: "Quản lý Tồn kho & Cung ứng Sữa",
    version: "v1.3",
    currentStakeholder: "Giám đốc Chuỗi cung ứng",
    stage: "Phân tích xử lý tình huống thay đổi",
    progress: 74,
    elapsed: "68:04",
    messagesCount: 22,
    signal: "Đang ứng biến với sự cố nhà cung ứng giao trễ 7 ngày",
    severity: "Có sự kiện thay đổi",
    transcript: [
      { sender: "learner", text: "Thưa chị Hà Anh, bên bao bì vừa báo trễ 7 ngày, kho Tân Bình chỉ còn đủ vỏ hộp dùng trong 48 giờ. Chị có đồng ý duyệt chuyển gấp từ kho Bình Dương sang không?", time: "09:48", technique: "Đề xuất phương án thích ứng" },
      { sender: "agent", stakeholderName: "Nguyễn Hà Anh", text: "Chị duyệt cho chuyển kho ngay, nhưng em phải làm việc với kế toán xem họ có chịu xác nhận phiếu chuyển điện tử hay không, và chi phí vận chuyển phát sinh ai chịu.", time: "09:50", isEvidence: true },
    ],
  },
  {
    id: "ses-03",
    learner: "Hoàng Mỹ Linh",
    scenario: "Quản lý Tồn kho & Cung ứng Sữa",
    version: "v1.3",
    currentStakeholder: "Kế toán trưởng",
    stage: "Làm rõ và xác nhận yêu cầu",
    progress: 62,
    elapsed: "58:12",
    messagesCount: 18,
    signal: "Còn 2 giả định chưa được chứng minh bằng quy định thực tế",
    severity: "Thiếu bằng chứng",
    transcript: [
      { sender: "learner", text: "Chị Trang cho em hỏi nếu công nhân quét mã lúc mất mạng thì chứng từ có được xem là hợp lệ không?", time: "10:02" },
      { sender: "agent", stakeholderName: "Hoàng Thu Trang", text: "Nguyên tắc kế toán là giờ xuất trên máy phải đúng với giờ giao hàng thực tế. Khi có mạng lại, hệ thống phải tự ghi lại nhật ký giờ quét lúc offline thì chị mới duyệt.", time: "10:04", isEvidence: true },
    ],
  },
  {
    id: "ses-04",
    learner: "Vũ Đức Anh",
    scenario: "Quản lý Tồn kho & Cung ứng Sữa",
    version: "v1.3",
    currentStakeholder: "Hệ thống Đánh giá Tự động",
    stage: "Nộp hồ sơ bàn giao (BRD & RTM)",
    progress: 92,
    elapsed: "84:10",
    messagesCount: 29,
    signal: "Tiến độ rất tốt, đã nộp đủ hồ sơ yêu cầu nghiệp vụ",
    severity: "Đang làm tốt",
    transcript: [
      { sender: "learner", text: "Em đã hoàn thành tài liệu yêu cầu nghiệp vụ BRD v1.2, ma trận truy vết yêu cầu RTM và sơ đồ quy trình xử lý hàng trả về.", time: "08:50" },
      { sender: "agent", stakeholderName: "Hệ thống Chấm điểm AI", text: "Đã tiếp nhận đầy đủ tài liệu và đang phân tích đối chiếu với dữ kiện thực tế của kịch bản.", time: "08:51" },
    ],
  },
];
