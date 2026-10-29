import type { RouteKey } from "../../types/models";

export interface NavItem {
  label: string;
  section: string;
}

export const navItems: NavItem[] = [
  { label: "Bối cảnh & BABOK", section: "context" },
  { label: "Hành trình", section: "journey" },
  { label: "Kịch bản đa miền", section: "scenario" },
  { label: "Không gian làm việc", section: "workspaces" },
];

export interface ContextTheme {
  index: string;
  title: string;
  tabLabel?: string;
  tagline?: string;
  badge?: string;
  body: string;
  image: string;
  imageAlt: string;
  imageRatio: string;
  linkLabel?: string;
  route?: RouteKey;
  tags?: string[];
  stats?: { label: string; value: string }[];
  comparison?: {
    traditional: string;
    baves: string;
  };
  personas?: {
    name: string;
    role: string;
    quote: string;
    badge: string;
  }[];
  rubricItems?: {
    title: string;
    desc: string;
    weight: string;
  }[];
}

export const contextThemes: ContextTheme[] = [
  {
    index: "01",
    title: "Khoảng cách lý thuyết BABOK®",
    tabLabel: "01 · Khoảng cách lý thuyết",
    tagline: "Thu hẹp khoảng cách từ sách vở đến thực tế phòng họp",
    badge: "Đột phá phương pháp",
    body: "Học viên nắm vững kỹ thuật khơi gợi theo chuẩn BABOK nhưng thiếu môi trường thực hành tương tác. BA-VES mang đến doanh nghiệp ảo phản ứng linh hoạt thay cho bài tập tình huống tĩnh.",
    image: "/images/landing/theme-stakeholders.webp",
    imageAlt: "Học viên phân tích yêu cầu với các bên liên quan",
    imageRatio: "aspect-[4/3]",
    tags: ["Khơi gợi tương tác", "Phản biện thời gian thực", "Xử lý dữ liệu nhiễu"],
    stats: [
      { label: "Mức độ nhập vai", value: "98%" },
      { label: "Chuẩn hóa IIBA®", value: "100%" },
    ],
    comparison: {
      traditional: "Tình huống tĩnh trên giấy, dữ liệu dọn sẵn hoàn chỉnh, thiếu áp lực tâm lý và không có phản hồi tương tác ngược từ nhân vật.",
      baves: "Doanh nghiệp ảo đa tác tử AI phản ứng linh hoạt theo thời gian thực; stakeholder có cảm xúc, che giấu dữ liệu và thay đổi quyết định theo biến động.",
    },
  },
  {
    index: "02",
    title: "Bên liên quan đa chiều & Xung đột",
    tabLabel: "02 · Tác tử & Xung đột",
    tagline: "Mô phỏng áp lực quyền lợi và thông tin bất đối xứng",
    badge: "Tác tử AI Đa vai trò",
    body: "Mô phỏng các tác tử AI đa vai trò với tính cách, thông tin ẩn và mục tiêu mâu thuẫn trên 3 lĩnh vực trọng yếu: Bán lẻ, Chuỗi cung ứng và Tài chính.",
    image: "/images/landing/theme-evidence.webp",
    imageAlt: "Phân tích bằng chứng và mâu thuẫn yêu cầu",
    imageRatio: "aspect-[4/3]",
    tags: ["Xung đột lợi ích", "Thông tin phân mảnh", "3 Miền nghiệp vụ"],
    stats: [
      { label: "Miền nghiệp vụ", value: "3 Ngành" },
      { label: "Tác tử mô phỏng", value: "Multi-Agent" },
    ],
    personas: [
      {
        name: "Trần Bảo Khang",
        role: "COO (Vận hành)",
        quote: "Hệ thống mới phải cắt giảm 40% thời gian xử lý kho, nhưng tuyệt đối không được gián đoạn đơn hàng hiện tại!",
        badge: "Ưu tiên tốc độ",
      },
      {
        name: "Lê Hoàng Nam",
        role: "CFO (Tài chính)",
        quote: "Ngân sách tối đa chỉ tăng 5%. Tôi cần số liệu chứng minh ROI đạt được trong vòng 6 tháng đầu triển khai.",
        badge: "Khắt khe chi phí",
      },
      {
        name: "Nguyễn Phương Linh",
        role: "Trưởng phòng Tuân thủ",
        quote: "Mọi luồng dữ liệu khách hàng phải tuân thủ nghiêm ngặt quy định bảo mật; rủi ro pháp lý sẽ do dự án chịu trách nhiệm.",
        badge: "Kiểm soát rủi ro",
      },
    ],
  },
  {
    index: "03",
    title: "Đánh giá Rubric & Giảng viên hiệu chuẩn",
    tabLabel: "03 · Rubric & Hiệu chuẩn",
    tagline: "Minh bạch hóa năng lực dựa trên bằng chứng xác thực",
    badge: "Chuẩn IIBA® Rubric",
    body: "Chấm điểm tự động minh bạch dựa trên bằng chứng phỏng vấn đối chiếu chuẩn BABOK, kết hợp giảng viên hiệu chuẩn điểm và theo dõi tiến trình làm chủ năng lực.",
    image: "/images/landing/theme-operations.webp",
    imageAlt: "Đánh giá năng lực và phản hồi giảng viên",
    imageRatio: "aspect-[4/3]",
    linkLabel: "Khám phá kịch bản Chuỗi cung ứng",
    route: "scenario-detail",
    tags: ["Đối soát bằng chứng", "Hiệu chuẩn giảng viên", "Phân tích khoảng trống"],
    stats: [
      { label: "Tiêu chí Rubric", value: "12 Tiêu chuẩn" },
      { label: "Độ tin cậy điểm", value: "Kép (AI + Mentor)" },
    ],
    rubricItems: [
      {
        title: "Kỹ năng Khơi gợi & Khai thác thông tin",
        desc: "Độ sâu câu hỏi, phát hiện thông tin ẩn từ tác tử AI và xác thực dữ liệu.",
        weight: "35% Trọng số",
      },
      {
        title: "Cấu trúc hóa Hồ sơ Nghiệp vụ (BRD/Stories)",
        desc: "Tính đầy đủ, mạch lạc và truy vết theo chuẩn BABOK v3 (RADD).",
        weight: "40% Trọng số",
      },
      {
        title: "Xử lý Biến động & Đàm phán Xung đột",
        desc: "Khả năng ứng biến khi kịch bản phát sinh sự kiện cắt giảm ngân sách.",
        weight: "25% Trọng số",
      },
    ],
  },
];

export interface BabokArea {
  id: string;
  code: string;
  nameVi: string;
  nameEn: string;
  description: string;
  shortDesc?: string;
  tasks: string[];
  deliverables: string;
  iconName: string;
  badge: string;
  image?: string;
  tags?: string[];
}

export const babokKnowledgeAreas: BabokArea[] = [
  {
    id: "bapm",
    code: "KA-01",
    nameVi: "Lập kế hoạch & Giám sát BA",
    nameEn: "Business Analysis Planning & Monitoring",
    description: "Tổ chức và điều phối toàn bộ nỗ lực phân tích nghiệp vụ, xác định các bên liên quan và quy trình quản trị thông tin.",
    shortDesc: "Tổ chức nỗ lực phân tích, thiết lập quy trình quản trị và ma trận RACI các bên liên quan.",
    tasks: ["Lập kế hoạch tiếp cận phân tích", "Phân tích ma trận các bên liên quan (RACI)", "Quản trị thông tin và chỉ số đánh giá"],
    deliverables: "Kế hoạch BA & Ma trận Stakeholders",
    iconName: "Compass",
    badge: "Khởi tạo & Quản trị",
    image: "/images/landing/journey-receive.webp",
    tags: ["Ma trận RACI", "Kế hoạch tiếp cận", "Quản trị thông tin"],
  },
  {
    id: "ec",
    code: "KA-02",
    nameVi: "Khơi gợi & Cộng tác",
    nameEn: "Elicitation & Collaboration",
    description: "Khai thác thông tin tiềm ẩn từ các bên liên quan, xác nhận kết quả khơi gợi và duy trì sự phối hợp thông suốt.",
    shortDesc: "Phỏng vấn tác tử AI đa vai trò, khai thác thông tin ẩn và ghi nhận biên bản xác thực.",
    tasks: ["Chuẩn bị phỏng vấn tác tử AI", "Tiến hành khơi gợi đa kênh", "Xác nhận kết quả & ghi nhận biên bản"],
    deliverables: "Biên bản phỏng vấn & Bằng chứng xác thực",
    iconName: "MessagesSquare",
    badge: "Tương tác thực chiến",
    image: "/images/landing/journey-elicit.webp",
    tags: ["Phỏng vấn AI tác tử", "Khơi gợi đa kênh", "Xác nhận biên bản"],
  },
  {
    id: "rlcm",
    code: "KA-03",
    nameVi: "Quản lý vòng đời yêu cầu",
    nameEn: "Requirements Life Cycle Management",
    description: "Quản lý và duy trì tính khả thi của yêu cầu từ lúc khởi tạo đến khi kết thúc, xử lý thay đổi và đảm bảo truy vết.",
    shortDesc: "Thiết lập ma trận truy vết (RTM), kiểm soát biến động thay đổi và bảo toàn tính toàn vẹn yêu cầu.",
    tasks: ["Thiết lập ma trận truy vết (Traceability)", "Đánh giá tác động thay đổi yêu cầu", "Ưu tiên hóa danh mục yêu cầu"],
    deliverables: "Ma trận truy vết (RTM) & Yêu cầu ưu tiên",
    iconName: "Layers",
    badge: "Kiểm soát biến động",
    image: "/images/landing/journey-analyze.webp",
    tags: ["Ma trận RTM", "Đánh giá thay đổi", "Ưu tiên yêu cầu"],
  },
  {
    id: "sa",
    code: "KA-04",
    nameVi: "Phân tích chiến lược",
    nameEn: "Strategy Analysis",
    description: "Xác định nhu cầu nghiệp vụ, định hình trạng thái hiện tại (AS-IS), trạng thái tương lai (TO-BE) và rủi ro chuyển đổi.",
    shortDesc: "Định vị bài toán kinh doanh, phân tích khoảng cách AS-IS/TO-BE và đề xuất chiến lược giải pháp.",
    tasks: ["Phân tích hiện trạng & điểm nghẽn", "Xác định mục tiêu tương lai & phạm vi", "Đánh giá rủi ro & đề xuất chiến lược"],
    deliverables: "Báo cáo phân tích khoảng cách & Chiến lược giải pháp",
    iconName: "Target",
    badge: "Định vị bài toán",
    image: "/images/landing/journey-respond.webp",
    tags: ["Khoảng cách AS-IS/TO-BE", "Đánh giá rủi ro", "Chiến lược giải pháp"],
  },
  {
    id: "radd",
    code: "KA-05",
    nameVi: "Phân tích yêu cầu & Định nghĩa thiết kế",
    nameEn: "Requirements Analysis & Design Definition",
    description: "Cấu trúc và mô hình hóa yêu cầu, xác định các phương án thiết kế khả thi để đáp ứng nhu cầu doanh nghiệp.",
    shortDesc: "Mô hình hóa quy trình BPMN, viết User Stories và chuẩn hóa bộ hồ sơ BRD toàn diện.",
    tasks: ["Mô hình hóa quy trình (BPMN/Use Case)", "Viết User Stories & Tiêu chí chấp nhận", "Xác thực và thẩm định yêu cầu"],
    deliverables: "Hồ sơ BRD, User Stories, Use Case Specs",
    iconName: "FileCheck",
    badge: "Chuẩn hóa tài liệu",
    image: "/images/landing/journey-deliver.webp",
    tags: ["Quy trình BPMN", "User Stories & AC", "Hồ sơ BRD chuẩn"],
  },
  {
    id: "se",
    code: "KA-06",
    nameVi: "Đánh giá giải pháp",
    nameEn: "Solution Evaluation",
    description: "Đánh giá hiệu suất của giải pháp đang sử dụng, nhận diện hạn chế và đề xuất giải pháp tăng trưởng giá trị.",
    shortDesc: "Đo lường chỉ số ROI/KPI giải pháp, nhận diện rào cản và đề xuất hành động tối ưu hóa giá trị.",
    tasks: ["Đo lường chỉ số hiệu quả giải pháp", "Phân tích rào cản tổ chức & công nghệ", "Đề xuất hành động tối ưu hóa giá trị"],
    deliverables: "Báo cáo đánh giá hiệu năng & Khuyến nghị",
    iconName: "Award",
    badge: "Đo lường giá trị",
    image: "/images/landing/theme-evidence.webp",
    tags: ["Đo lường hiệu năng", "Đánh giá giá trị", "Khuyến nghị tối ưu"],
  },
];

export const whyPrinciples = [
  { index: "01", text: "Tác tử AI (Multi-Agent) mang tính cách, thông tin ẩn và mục tiêu riêng biệt." },
  { index: "02", text: "Sự kiện kịch bản động (cắt giảm ngân sách, đổi phạm vi) thử thách khả năng ứng biến." },
  { index: "03", text: "Chuẩn hóa tài liệu BA (BRD, User Stories, Use Cases) từ bằng chứng phỏng vấn." },
  { index: "04", text: "Đánh giá Rubric gắn với BABOK kết hợp giảng viên hiệu chuẩn và phản hồi." },
];

export interface JourneyStep {
  index: string;
  label: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  babokArea?: string;
  keyOutcome?: string;
  icon?: string;
}

export const journeySteps: JourneyStep[] = [
  {
    index: "01",
    label: "Tiếp nhận",
    title: "Nhận bối cảnh & ràng buộc dự án",
    body: "Bắt đầu với bản tóm tắt mục tiêu, ngân sách, phạm vi và tài liệu ban đầu từ doanh nghiệp.",
    image: "/images/landing/journey-receive.webp",
    imageAlt: "Tiếp nhận hồ sơ dự án",
    babokArea: "Strategy Analysis",
    keyOutcome: "Điều lệ dự án & Ràng buộc ban đầu",
    icon: "FileText",
  },
  {
    index: "02",
    label: "Khơi gợi",
    title: "Phỏng vấn các tác tử AI",
    body: "Đối thoại trực tiếp với các bên liên quan AI có tính cách, mục tiêu trái ngược và thông tin ẩn.",
    image: "/images/landing/journey-elicit.webp",
    imageAlt: "Phỏng vấn tác tử AI",
    babokArea: "Elicitation & Collaboration",
    keyOutcome: "Biên bản phỏng vấn & Bằng chứng xác thực",
    icon: "MessagesSquare",
  },
  {
    index: "03",
    label: "Ứng biến",
    title: "Xử lý sự kiện biến động & Xung đột",
    body: "Ứng phó sự kiện kịch bản động (cắt giảm ngân sách, đổi phạm vi); phân tích nguyên nhân gốc rễ.",
    image: "/images/landing/journey-analyze.webp",
    imageAlt: "Xử lý biến động và xung đột",
    babokArea: "Requirements Life Cycle",
    keyOutcome: "Ma trận giải quyết xung đột nghiệp vụ",
    icon: "Zap",
  },
  {
    index: "04",
    label: "Đề xuất",
    title: "Soạn thảo hồ sơ tài liệu BA",
    body: "Tổng hợp các bằng chứng thành tài liệu BRD, User Stories và Use Cases có thể bảo vệ được.",
    image: "/images/landing/journey-respond.webp",
    imageAlt: "Soạn thảo tài liệu phân tích nghiệp vụ",
    babokArea: "Requirements Analysis & Design",
    keyOutcome: "Hồ sơ BRD & User Stories chuẩn hóa",
    icon: "FileCheck",
  },
  {
    index: "05",
    label: "Đánh giá",
    title: "Chấm điểm Rubric & Hiệu chuẩn",
    body: "Nhận đánh giá AI tức thì theo tiêu chí BABOK; giảng viên xem xét, hiệu chuẩn điểm và phản hồi.",
    image: "/images/landing/journey-deliver.webp",
    imageAlt: "Đánh giá Rubric và phản hồi giảng viên",
    babokArea: "Solution Evaluation",
    keyOutcome: "Điểm Rubric & Radar năng lực BABOK",
    icon: "Award",
  },
];

export const scenarioFacts = {
  heading: "Quản lý tồn kho Chuỗi cung ứng",
  tagline: "Ba kho vùng. Hai mươi cửa hàng. Xung đột ưu tiên. Một quyết định nghiệp vụ chuẩn mực.",
  code: "FA26SE185 · INV-2026-014",
  company: "VinaSupply Retail",
  network: ["1 trung tâm phân phối", "3 kho vùng", "20 cửa hàng bán lẻ"],
} as const;

export const scenarioChallenges = [
  { label: "Tỷ lệ đáp ứng vs. Chi phí lưu kho", detail: "Giảm đứt hàng dưới 5% mà không làm tăng chi phí lưu kho vượt quá 8%." },
  { label: "Điều chuyển nội bộ vs. Mua hàng mới", detail: "Cân bằng chính sách ưu tiên điều chuyển nội bộ trước thời gian đặt hàng nhà cung cấp." },
  { label: "Tốc độ vận hành vs. Kiểm soát tài chính", detail: "Phân cấp phê duyệt điều chỉnh tồn kho theo ngưỡng giá trị để tránh tắc nghẽn kho." },
  { label: "Gián đoạn vận hành & Quét mã offline", detail: "Xử lý mất kết nối quét mã vạch và chống trùng lặp dữ liệu khi kết nối trở lại." },
];

export const workspacePoints = {
  learner: [
    "Phỏng vấn tác tử AI có trí nhớ phiên và thông tin ẩn riêng biệt",
    "Trích xuất bằng chứng phỏng vấn và lập ma trận xung đột yêu cầu",
    "Ứng phó sự kiện kịch bản biến động (thay đổi phạm vi, cắt giảm ngân sách)",
    "Nộp tài liệu BA (BRD, User Stories) và nhận phản hồi Rubric chuẩn BABOK",
  ],
  instructor: [
    "Thiết lập kịch bản đa miền: Ngân hàng, Y tế, Logistics và Giáo dục",
    "Cấu hình vai trò tác tử AI, ranh giới tri thức và thông tin ẩn",
    "Kích hoạt sự kiện động giữa phiên hoặc tự động theo số tin nhắn",
    "Hiệu chuẩn kết quả chấm của AI và theo dõi năng lực theo chuẩn BABOK",
  ],
} as const;