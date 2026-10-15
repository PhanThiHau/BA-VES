export interface ScenarioVersion {
  id: string;
  versionNumber: string;
  scenarioId: string;
  scenarioTitle: string;
  domain: "Chuỗi cung ứng & Kho vận" | "Ngân hàng & Tài chính" | "Y tế & Bệnh viện" | "Giáo dục & Đào tạo";
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
  aiScore: number;
  aiConfidence: number;
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

export const initialScenarios: ScenarioVersion[] = [
  {
    id: "sc-inv-01",
    versionNumber: "v1.3",
    scenarioId: "INV-2026",
    scenarioTitle: "Quản lý Tồn kho & Cung ứng Chuỗi Cửa hàng Sữa",
    domain: "Chuỗi cung ứng & Kho vận",
    status: "Đã ban hành",
    baselineProblem: "Tỷ lệ đứt hàng (hết sữa tại cửa hàng) chạm mức 12%, hàng tồn đọng ở kho đệm tăng 35% do lệch số liệu thực tế so với phần mềm.",
    groundTruth: "Sự thật ngầm hiểu: Nhân viên kho chỉ quét mã vạch hàng đổi trả vào cuối ca làm việc (17h30); máy quét tại kho Tân Bình bị mất sóng WiFi nên dữ liệu lưu tạm trong máy không đẩy lên máy chủ kịp thời.",
    stakeholdersCount: 6,
    eventsCount: 4,
    evidenceCount: 12,
    rubricCriteriaCount: 5,
    updatedAt: "14/10/2026",
  },
  {
    id: "sc-bnk-01",
    versionNumber: "v1.0",
    scenarioId: "BNK-2026",
    scenarioTitle: "Hệ thống Phê duyệt Khoản vay Doanh nghiệp Vừa và Nhỏ (SME)",
    domain: "Ngân hàng & Tài chính",
    status: "Đã ban hành",
    baselineProblem: "Thời gian xử lý hồ sơ vay kéo dài đến 14 ngày làm việc, nhiều doanh nghiệp bỏ dở hồ sơ vì khâu thẩm định bị trùng lặp giữa Chi nhánh và Ban Rủi ro.",
    groundTruth: "Sự thật ngầm hiểu: Quy trình nội bộ bắt buộc 3 cấp ký giấy tay; bảng sao kê tài chính chưa có phần mềm quét tự động (OCR) nên nhân viên tín dụng phải gõ lại từng số thủ công.",
    stakeholdersCount: 5,
    eventsCount: 3,
    evidenceCount: 10,
    rubricCriteriaCount: 5,
    updatedAt: "10/10/2026",
  },
  {
    id: "sc-med-01",
    versionNumber: "v0.9",
    scenarioId: "MED-2026",
    scenarioTitle: "Liên thông Bệnh án Điện tử & Chuyển tuyến Khám chữa bệnh",
    domain: "Y tế & Bệnh viện",
    status: "Bản nháp",
    baselineProblem: "Bệnh nhân chuyển viện phải làm lại xét nghiệm đến 60%, hồ sơ dị ứng thuốc không được truyền tải an toàn giữa các bệnh viện tuyến dưới và tuyến trên.",
    groundTruth: "Sự thật ngầm hiểu: Mỗi bệnh viện dùng một phần mềm riêng và đặt tên thuốc khác nhau; bác sĩ bận rộn từ chối nhập liệu nếu màn hình phần mềm bắt bấm quá nhiều bước.",
    stakeholdersCount: 4,
    eventsCount: 2,
    evidenceCount: 8,
    rubricCriteriaCount: 5,
    updatedAt: "08/10/2026",
  },
  {
    id: "sc-edu-01",
    versionNumber: "v0.8",
    scenarioId: "EDU-2026",
    scenarioTitle: "Hệ thống Học tập & Khảo thí Trực tuyến Cho Sinh viên",
    domain: "Giáo dục & Đào tạo",
    status: "Bản nháp",
    baselineProblem: "Giảng viên mất quá nhiều thời gian chấm bài và khó nhận biết sớm sinh viên có nguy cơ trượt môn để phụ đạo kịp thời.",
    groundTruth: "Sự thật ngầm hiểu: Dữ liệu điểm danh trên lớp và điểm làm bài trên website chưa được kết nối với nhau; đề thi cần mã hóa bảo mật nhưng đường truyền trường học vào mùa thi hay bị nghẽn.",
    stakeholdersCount: 4,
    eventsCount: 2,
    evidenceCount: 7,
    rubricCriteriaCount: 5,
    updatedAt: "02/10/2026",
  },
];

export const initialPersonas: StakeholderPersona[] = [
  {
    id: "per-01",
    scenarioId: "INV-2026",
    name: "Nguyễn Hà Anh",
    role: "Giám đốc Chuỗi cung ứng",
    department: "Ban Điều hành Chuỗi cung ứng",
    businessGoal: "Đảm bảo các cửa hàng luôn đủ sữa bán (tỷ lệ sẵn sàng > 98%) và giảm thiểu chi phí chuyển hàng lòng vòng giữa các kho.",
    authority: "Có quyền ký duyệt quy định chuyển hàng nội bộ và cho phép xuất kho vượt hạn mức quy định.",
    knowledgeBoundary: "Không nắm chi tiết kỹ thuật của máy quét mã vạch và không trực tiếp quản lý thao tác của công nhân kho.",
    hiddenInformation: "Chấp nhận trả thêm tiền xe vận chuyển nếu điều đó giúp cửa hàng lớn không bị đứt hàng đột ngột.",
    conflictingStance: "Mâu thuẫn với Kế toán: Muốn cho xuất hàng đi trước cho kịp giờ bán, giấy tờ kế toán hoàn thiện sau cũng được.",
    status: "Đã kiểm thử đạt",
  },
  {
    id: "per-02",
    scenarioId: "INV-2026",
    name: "Lê Thanh Lan",
    role: "Trưởng kho Trung tâm",
    department: "Bộ phận Vận hành Kho bãi",
    businessGoal: "Soạn hàng và đóng gói thật nhanh, không để tài xế xe tải phải đứng chờ lâu.",
    authority: "Quản lý việc xếp dỡ, kiểm đếm hàng trong kho và nhận lại hàng khách trả về.",
    knowledgeBoundary: "Không có quyền tự ý xóa số liệu hàng hư hỏng trên sổ sách kế toán.",
    hiddenInformation: "Biết rõ nhân viên kho hay tắt sóng WiFi máy quét vì mạng chập chờn làm máy bị đơ, đến chiều tối mới cắm dây đồng bộ một lần.",
    conflictingStance: "Rất ghét các quy trình bắt kiểm tra đối chiếu rườm rà vì sẽ làm chậm tốc độ đóng gói của công nhân.",
    status: "Đã kiểm thử đạt",
  },
  {
    id: "per-03",
    scenarioId: "INV-2026",
    name: "Hoàng Thu Trang",
    role: "Kế toán trưởng",
    department: "Phòng Tài chính - Kế toán",
    businessGoal: "Số liệu tồn kho trên sổ sách phải khớp từng đồng với thực tế, không được thất thoát tiền bạc của công ty.",
    authority: "Có quyền từ chối ký mọi khoản chi hoặc phiếu xuất kho sai lệch trên 5 triệu đồng.",
    knowledgeBoundary: "Không hiểu thực tế việc xếp dỡ tại kho lạnh vất vả thế nào.",
    hiddenInformation: "Rất lo lắng đợt kiểm toán cuối năm sẽ phạt công ty nếu phát hiện số liệu tồn kho bị chênh lệch.",
    conflictingStance: "Bắt buộc phải có chữ ký giấy biên nhận của cả 2 bên giao - nhận thì mới được coi là hoàn thành xuất kho.",
    status: "Đã kiểm thử đạt",
  },
  {
    id: "per-04",
    scenarioId: "INV-2026",
    name: "Phạm Đức Long",
    role: "Chuyên viên Kế hoạch Nhu cầu",
    department: "Phòng Kế hoạch Cung ứng",
    businessGoal: "Tính toán lượng tồn kho an toàn và tự động đề xuất đơn mua hàng mới (PO) đúng lúc.",
    authority: "Được phép gửi đề xuất mua hàng và lịch phân phối hàng tuần lên Giám đốc duyệt.",
    knowledgeBoundary: "Không quyết định được ngân sách chi tiền và không trực tiếp quản lý kho.",
    hiddenInformation: "Đang phải tự copy số liệu ra bảng tính Excel để tính tay vì phần mềm cũ không tự tính được ngày giao hàng của nhà cung ứng.",
    conflictingStance: "Thường xuyên cãi nhau với Trưởng kho vì hàng đặt về nhiều quá không có chỗ chứa.",
    status: "Đã kiểm thử đạt",
  },
  {
    id: "per-05",
    scenarioId: "INV-2026",
    name: "Vũ Minh Khoa",
    role: "Nhân viên Soạn hàng & Quét mã",
    department: "Tổ Vận hành Kho",
    businessGoal: "Làm việc nhanh, quét mã chuẩn để đủ chỉ tiêu 200 thùng hàng mỗi ca làm việc.",
    authority: "Chỉ làm theo phân công, không có quyền quyết định chính sách.",
    knowledgeBoundary: "Chỉ biết cầm máy quét đi lấy hàng theo danh sách được giao.",
    hiddenInformation: "Chia sẻ rằng màn hình máy quét rất nhỏ, nút bấm bé nên dễ bấm nhầm giữa nút 'Đồng ý' và 'Hủy bỏ'.",
    conflictingStance: "Nếu phần mềm mới bắt gõ mã số dài bằng tay khi mã vạch bị mờ thì nhất quyết không chịu dùng.",
    status: "Đã kiểm thử đạt",
  },
  {
    id: "per-06",
    scenarioId: "INV-2026",
    name: "Trần Quốc Minh",
    role: "Giám đốc Dự án Chuyển đổi số",
    department: "Ban Quản lý Dự án",
    businessGoal: "Đưa phần mềm vào sử dụng đúng hạn và không bị phát sinh vượt ngân sách ban đầu.",
    authority: "Quyết định tính năng nào được làm trước, tính năng nào hoãn lại (phạm vi MVP).",
    knowledgeBoundary: "Không nắm chi tiết việc quét mã hay ghi sổ hằng ngày.",
    hiddenInformation: "Sẵn sàng cắt bỏ các tính năng dự báo thông minh phức tạp để ưu tiên làm xong phần quét mã không cần mạng trước.",
    conflictingStance: "Ưu tiên phần mềm chạy được đúng ngày khai trương hơn là chờ đợi một giải pháp hoàn hảo.",
    status: "Cần kiểm tra lại",
  },
];

export const initialKnowledgeItems: AgentKnowledgeItem[] = [
  {
    id: "kno-01",
    scenarioId: "INV-2026",
    title: "Quy tắc Hoạt động Khi Mất Sóng Mạng",
    category: "Thực tế quy trình",
    content: "Máy quét mã vạch có bộ nhớ tạm; khi mất kết nối WiFi, dữ liệu quét vẫn được lưu lại trong máy và tự động tải lên máy chủ ngay khi có mạng trở lại.",
    confidentiality: "Nội bộ",
    knownByStakeholders: ["per-02", "per-05"],
  },
  {
    id: "kno-02",
    scenarioId: "INV-2026",
    title: "Nguyên tắc Kiểm soát Tài chính (Phân chia quyền hạn)",
    category: "Quy tắc nghiệp vụ",
    content: "Người lập lệnh chuyển kho tuyệt đối không được kiêm luôn việc duyệt phiếu xuất và ghi giảm số lượng hàng trên sổ sách kế toán.",
    confidentiality: "Tuyệt mật",
    knownByStakeholders: ["per-03"],
  },
  {
    id: "kno-03",
    scenarioId: "INV-2026",
    title: "Chính sách Xử lý Hàng Đổi Trả",
    category: "Quy tắc nghiệp vụ",
    content: "Hàng khách trả về do móp méo phải được để riêng ở khu chờ xử lý (Cách ly), cấm không được cộng gộp vào số lượng hàng có thể bán.",
    confidentiality: "Nội bộ",
    knownByStakeholders: ["per-01", "per-02"],
  },
  {
    id: "kno-04",
    scenarioId: "INV-2026",
    title: "Thời gian Giao hàng của Nhà Cung ứng",
    category: "Ràng buộc dữ liệu",
    content: "Nhà cung cấp bao bì sữa cần 5 ngày chuẩn bị hàng; nhà cung ứng hương liệu nhập khẩu cần ít nhất 14 ngày kể từ khi đơn hàng được duyệt.",
    confidentiality: "Công khai",
    knownByStakeholders: ["per-01", "per-04"],
  },
];

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

export const initialReviewItems: ReviewItem[] = [
  {
    id: "REV-2026-014",
    learner: "Nguyễn Minh Anh",
    cohort: "Lớp BA-01 (Chuỗi cung ứng)",
    scenarioId: "INV-2026",
    scenarioTitle: "Quản lý Tồn kho & Cung ứng Sữa",
    stage: "Đã nộp bài tập cuối kỳ",
    aiScore: 71,
    aiConfidence: 86,
    humanScore: null,
    status: "pending",
    issueSummary: "Hồ sơ có thiếu sót: Chưa có quy tắc kiểm soát phân chia quyền hạn khi duyệt chuyển kho.",
    submittedAt: "Hôm nay · 14:20",
    due: "Hôm nay · 17:00",
    tone: "red",
    deliverablesSubmitted: ["Tài liệu Yêu cầu Nghiệp vụ (BRD).docx", "Ma trận Truy vết Yêu cầu (RTM).xlsx", "Sơ đồ Quy trình Xử lý Hàng trả (BPMN).pdf"],
    moderatorNotes: "",
    criteria: [
      { id: "c1", babokArea: "Kỹ năng Khơi gợi Yêu cầu", name: "1. Kỹ năng Phỏng vấn & Khai phá Thông tin Ẩn", weight: 25, aiScore: 78, humanScore: 78, aiEvidenceQuote: "Tìm ra được chuyện công nhân hay tắt WiFi và dồn hàng đổi trả về cuối ca.", status: "Đạt" },
      { id: "c2", babokArea: "Phân tích Chiến lược", name: "2. Xác định Đúng Vấn đề Cốt lõi & Chỉ số Đo lường", weight: 20, aiScore: 68, humanScore: 68, aiEvidenceQuote: "Nhận diện được tỷ lệ đứt hàng 12% nhưng chưa đưa ra mục tiêu giảm xuống còn bao nhiêu %.", status: "Cần xem xét" },
      { id: "c3", babokArea: "Phân tích Yêu cầu", name: "3. Viết Yêu cầu Rõ ràng, Kiểm thử Đo lường được", weight: 25, aiScore: 72, humanScore: 72, aiEvidenceQuote: "Các yêu cầu phần mềm có mã số rõ ràng nhưng tiêu chí nghiệm thu còn hơi chung chung.", status: "Đạt" },
      { id: "c4", babokArea: "Quản lý Vòng đời Yêu cầu", name: "4. Truy vết Yêu cầu & Khả năng Xử lý Thay đổi", weight: 15, aiScore: 64, humanScore: 64, aiEvidenceQuote: "Chưa cập nhật phương án ứng phó sự cố trễ hàng vào ma trận truy vết.", status: "Cần xem xét" },
      { id: "c5", babokArea: "Đánh giá Giải pháp", name: "5. Giải quyết Bất đồng & Thuyết phục Stakeholder", weight: 15, aiScore: 70, humanScore: 70, aiEvidenceQuote: "Giải pháp chuyển kho cân bằng được giữa mong muốn làm nhanh của Kho và tính an toàn của Kế toán.", status: "Đạt" },
    ],
  },
  {
    id: "REV-2026-018",
    learner: "Lê Phương Thảo",
    cohort: "Lớp BA-01 (Chuỗi cung ứng)",
    scenarioId: "INV-2026",
    scenarioTitle: "Quản lý Tồn kho & Cung ứng Sữa",
    stage: "Đã hoàn thành thẩm định",
    aiScore: 78,
    aiConfidence: 89,
    humanScore: 82,
    status: "calibrated",
    issueSummary: "Học viên xử lý xung đột giữa Trưởng kho và Kế toán xuất sắc, AI chấm hơi khắt khe phần câu hỏi mở.",
    submittedAt: "Hôm nay · 11:35",
    due: "Hôm nay · 18:00",
    tone: "green",
    deliverablesSubmitted: ["Tài liệu Yêu cầu Nghiệp vụ BRD v1.2.docx", "Bảng Ma trận Truy vết.pdf"],
    moderatorNotes: "Học viên nắm rất chắc bản chất kiểm toán và có giải pháp dùng mã xác nhận OTP qua điện thoại giữa 2 thủ kho. Giảng viên đã cộng thêm 4 điểm khơi gợi yêu cầu.",
    criteria: [
      { id: "c1", babokArea: "Kỹ năng Khơi gợi Yêu cầu", name: "1. Kỹ năng Phỏng vấn & Khai phá Thông tin Ẩn", weight: 25, aiScore: 74, humanScore: 80, aiEvidenceQuote: "Đào sâu tìm hiểu được lý do tại sao công nhân không chịu gõ số sê-ri dài bằng tay.", status: "Đạt" },
      { id: "c2", babokArea: "Phân tích Chiến lược", name: "2. Xác định Đúng Vấn đề Cốt lõi & Chỉ số Đo lường", weight: 20, aiScore: 80, humanScore: 82, aiEvidenceQuote: "Tính toán được số tiền công ty bị thiệt hại do đơn hàng giao trễ.", status: "Đạt" },
      { id: "c3", babokArea: "Phân tích Yêu cầu", name: "3. Viết Yêu cầu Rõ ràng, Kiểm thử Đo lường được", weight: 25, aiScore: 82, humanScore: 84, aiEvidenceQuote: "Tiêu chí nghiệm thu viết rất chuẩn theo mẫu: Điều kiện có sẵn - Khi thực hiện - Thì kết quả đạt được.", status: "Đạt" },
      { id: "c4", babokArea: "Quản lý Vòng đời Yêu cầu", name: "4. Truy vết Yêu cầu & Khả năng Xử lý Thay đổi", weight: 15, aiScore: 76, humanScore: 78, aiEvidenceQuote: "Cập nhật kịp thời rủi ro khi nhà cung ứng trễ hàng.", status: "Đạt" },
      { id: "c5", babokArea: "Đánh giá Giải pháp", name: "5. Giải quyết Bất đồng & Thuyết phục Stakeholder", weight: 15, aiScore: 80, humanScore: 84, aiEvidenceQuote: "Đề xuất dùng mã xác nhận OTP trên điện thoại được cả Kho và Kế toán đồng thuận.", status: "Đạt" },
    ],
  },
  {
    id: "REV-2026-009",
    learner: "Trần Hải Nam",
    cohort: "Lớp BA-02 (Ngân hàng)",
    scenarioId: "BNK-2026",
    scenarioTitle: "Phê duyệt Khoản vay Doanh nghiệp SME",
    stage: "Đang chờ giảng viên duyệt",
    aiScore: 65,
    aiConfidence: 71,
    humanScore: null,
    status: "pending",
    issueSummary: "Độ tin cậy của AI thấp (71%) ở phần xử lý tranh chấp thẩm quyền duyệt vay giữa Chi nhánh và Ban Rủi ro.",
    submittedAt: "Hôm qua · 17:15",
    due: "Ngày mai · 09:00",
    tone: "amber",
    deliverablesSubmitted: ["Tài liệu Yêu cầu Tín dụng SME.docx"],
    moderatorNotes: "",
    criteria: [
      { id: "c1", babokArea: "Kỹ năng Khơi gợi Yêu cầu", name: "1. Kỹ năng Phỏng vấn & Khai phá Thông tin Ẩn", weight: 25, aiScore: 66, humanScore: 66, aiEvidenceQuote: "Học viên chỉ hỏi các câu hỏi đóng Có/Không, không gợi mở được nguyên nhân sâu xa.", status: "Cần xem xét" },
      { id: "c2", babokArea: "Phân tích Chiến lược", name: "2. Xác định Đúng Vấn đề Cốt lõi & Chỉ số Đo lường", weight: 20, aiScore: 62, humanScore: 62, aiEvidenceQuote: "Chưa phân tích được vì sao khâu kiểm tra hồ sơ mất đến 14 ngày.", status: "Cần xem xét" },
      { id: "c3", babokArea: "Phân tích Yêu cầu", name: "3. Viết Yêu cầu Rõ ràng, Kiểm thử Đo lường được", weight: 25, aiScore: 68, humanScore: 68, aiEvidenceQuote: "Viết được quy trình phê duyệt 3 bước cơ bản.", status: "Đạt" },
      { id: "c4", babokArea: "Quản lý Vòng đời Yêu cầu", name: "4. Truy vết Yêu cầu & Khả năng Xử lý Thay đổi", weight: 15, aiScore: 60, humanScore: 60, aiEvidenceQuote: "Thiếu bảng ma trận truy vết yêu cầu.", status: "Cần xem xét" },
      { id: "c5", babokArea: "Đánh giá Giải pháp", name: "5. Giải quyết Bất đồng & Thuyết phục Stakeholder", weight: 15, aiScore: 67, humanScore: 67, aiEvidenceQuote: "Chưa hòa giải được bất đồng giữa Giám đốc Chi nhánh và Trưởng phòng Rủi ro.", status: "Cần xem xét" },
    ],
  },
  {
    id: "REV-2026-021",
    learner: "Phạm Thanh Tùng",
    cohort: "Lớp BA-01 (Chuỗi cung ứng)",
    scenarioId: "INV-2026",
    scenarioTitle: "Quản lý Tồn kho & Cung ứng Sữa",
    stage: "Đang chờ giảng viên duyệt",
    aiScore: 69,
    aiConfidence: 76,
    humanScore: null,
    status: "pending",
    issueSummary: "Ma trận truy vết yêu cầu (RTM) chưa đầy đủ chứng cứ liên kết về biên bản phỏng vấn.",
    submittedAt: "Hôm nay · 08:30",
    due: "Ngày mai · 11:00",
    tone: "navy",
    deliverablesSubmitted: ["Ban_thao_Yeu_cau_BRD.docx", "Bang_truy_vet_RTM.xlsx"],
    moderatorNotes: "",
    criteria: [
      { id: "c1", babokArea: "Kỹ năng Khơi gợi Yêu cầu", name: "1. Kỹ năng Phỏng vấn & Khai phá Thông tin Ẩn", weight: 25, aiScore: 72, humanScore: 72, aiEvidenceQuote: "Khám phá được 8 trên tổng số 12 sự thật nghiệp vụ trong kịch bản.", status: "Đạt" },
      { id: "c2", babokArea: "Phân tích Chiến lược", name: "2. Xác định Đúng Vấn đề Cốt lõi & Chỉ số Đo lường", weight: 20, aiScore: 70, humanScore: 70, aiEvidenceQuote: "Nêu rõ vấn đề tồn kho nhưng giải pháp đề xuất tốn kém quá ngân sách cho phép.", status: "Đạt" },
      { id: "c3", babokArea: "Phân tích Yêu cầu", name: "3. Viết Yêu cầu Rõ ràng, Kiểm thử Đo lường được", weight: 25, aiScore: 68, humanScore: 68, aiEvidenceQuote: "Một số yêu cầu kỹ thuật còn mơ hồ về tốc độ phản hồi của phần mềm.", status: "Cần xem xét" },
      { id: "c4", babokArea: "Quản lý Vòng đời Yêu cầu", name: "4. Truy vết Yêu cầu & Khả năng Xử lý Thay đổi", weight: 15, aiScore: 62, humanScore: 62, aiEvidenceQuote: "Có 3 tính năng phần mềm không rõ nguồn gốc xuất phát từ người nào yêu cầu.", status: "Cần xem xét" },
      { id: "c5", babokArea: "Đánh giá Giải pháp", name: "5. Giải quyết Bất đồng & Thuyết phục Stakeholder", weight: 15, aiScore: 71, humanScore: 71, aiEvidenceQuote: "Đề xuất phương án dùng điện thoại thông minh để quét mã là rất thực tế.", status: "Đạt" },
    ],
  },
];

export const initialCohorts: CohortItem[] = [
  {
    id: "coh-01",
    code: "Lớp BA-01",
    name: "Lớp Chuyên viên Phân tích Nghiệp vụ Chuỗi Cung ứng",
    instructorName: "TS. Nguyễn Hoàng Long",
    studentsCount: 32,
    activeAssignmentsCount: 2,
    completionRate: 87.5,
    averageScore: 74.2,
    domain: "Chuỗi cung ứng & Kho vận",
    status: "active",
  },
  {
    id: "coh-02",
    code: "Lớp BA-02",
    name: "Lớp Chuyên viên Phân tích Nghiệp vụ Ngân hàng Số",
    instructorName: "TS. Nguyễn Hoàng Long",
    studentsCount: 28,
    activeAssignmentsCount: 1,
    completionRate: 64.3,
    averageScore: 68.8,
    domain: "Ngân hàng & Tài chính",
    status: "active",
  },
  {
    id: "coh-03",
    code: "Lớp BA-03",
    name: "Lớp Kỹ năng Phỏng vấn & Khơi gợi Yêu cầu Thực chiến",
    instructorName: "ThS. Trần Thị Mai",
    studentsCount: 25,
    activeAssignmentsCount: 1,
    completionRate: 40.0,
    averageScore: 71.0,
    domain: "Kỹ năng tổng hợp",
    status: "active",
  },
];

export const initialAssignments: AssignmentItem[] = [
  {
    id: "asg-01",
    title: "Bài tập 1: Phỏng vấn Tìm hiểu Vấn đề & Khơi gợi Yêu cầu Kho Sữa",
    cohortId: "coh-01",
    cohortName: "Lớp BA-01",
    scenarioVersionId: "sc-inv-01",
    scenarioTitle: "Quản lý Tồn kho & Cung ứng Sữa (v1.3)",
    deadline: "20/10/2026 · 23:59",
    attemptLimit: 2,
    submissionsCount: 28,
    totalStudents: 32,
    status: "active",
  },
  {
    id: "asg-02",
    title: "Bài tập 2: Ứng phó Sự cố Trễ hàng & Hoàn thiện Tài liệu Yêu cầu BRD",
    cohortId: "coh-01",
    cohortName: "Lớp BA-01",
    scenarioVersionId: "sc-inv-01",
    scenarioTitle: "Quản lý Tồn kho & Cung ứng Sữa (v1.3)",
    deadline: "24/10/2026 · 17:00",
    attemptLimit: 1,
    submissionsCount: 14,
    totalStudents: 32,
    status: "active",
  },
  {
    id: "asg-03",
    title: "Bài tập 1: Phỏng vấn Quy trình Duyệt vay & Hòa giải Xung đột Thẩm quyền",
    cohortId: "coh-02",
    cohortName: "Lớp BA-02",
    scenarioVersionId: "sc-bnk-01",
    scenarioTitle: "Phê duyệt Khoản vay Doanh nghiệp SME (v1.0)",
    deadline: "22/10/2026 · 23:59",
    attemptLimit: 2,
    submissionsCount: 18,
    totalStudents: 28,
    status: "active",
  },
];

export const cohortCompetencyAverages = [
  { area: "1. Kỹ năng Lập kế hoạch & Giám sát Phân tích", score: 72, benchmark: 70, gap: "+2%", desc: "Lập kế hoạch phỏng vấn các phòng ban và dự trù thời gian" },
  { area: "2. Kỹ năng Khơi gợi Yêu cầu & Phỏng vấn", score: 79, benchmark: 72, gap: "+7%", desc: "Đặt câu hỏi mở, đào sâu chi tiết và lắng nghe chủ động" },
  { area: "3. Quản lý Yêu cầu & Ứng phó Thay đổi", score: 66, benchmark: 70, gap: "-4%", desc: "Cập nhật yêu cầu khi có sự cố phát sinh ngoài dự kiến" },
  { area: "4. Phân tích Chiến lược & Đo lường Hiện trạng", score: 64, benchmark: 68, gap: "-4%", desc: "Xác định tổn thất kinh doanh và các rào cản nội bộ" },
  { area: "5. Đặc tả Yêu cầu & Thiết kế Giải pháp", score: 75, benchmark: 72, gap: "+3%", desc: "Viết tài liệu BRD rõ ràng, tiêu chí nghiệm thu kiểm thử được" },
  { area: "6. Đánh giá Giải pháp & Đo lường Hiệu quả", score: 61, benchmark: 68, gap: "-7%", desc: "Hòa giải xung đột mục tiêu và đo lường giá trị mang lại" },
];
