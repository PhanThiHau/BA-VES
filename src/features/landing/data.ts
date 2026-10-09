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
  body: string;
  image: string;
  imageAlt: string;
  imageRatio: string;
  linkLabel?: string;
  route?: RouteKey;
}

export const contextThemes: ContextTheme[] = [
  {
    index: "01",
    title: "Khoảng cách lý thuyết BABOK®",
    body: "Học viên nắm vững kỹ thuật khơi gợi theo chuẩn BABOK nhưng thiếu môi trường thực hành tương tác. BA-VES mang đến doanh nghiệp ảo phản ứng linh hoạt thay cho bài tập tình huống tĩnh.",
    image: "/images/landing/theme-stakeholders.webp",
    imageAlt: "Học viên phân tích yêu cầu với các bên liên quan",
    imageRatio: "aspect-[4/3]",
  },
  {
    index: "02",
    title: "Bên liên quan đa chiều & Xung đột",
    body: "Mô phỏng các tác tử AI đa vai trò với tính cách, thông tin ẩn và mục tiêu mâu thuẫn trên 4 lĩnh vực: Ngân hàng, Y tế, Logistics và Giáo dục.",
    image: "/images/landing/theme-evidence.webp",
    imageAlt: "Phân tích bằng chứng và mâu thuẫn yêu cầu",
    imageRatio: "aspect-[4/3]",
  },
  {
    index: "03",
    title: "Đánh giá Rubric & Giảng viên hiệu chuẩn",
    body: "Chấm điểm tự động minh bạch dựa trên bằng chứng phỏng vấn đối chiếu chuẩn BABOK, kết hợp giảng viên hiệu chuẩn điểm và theo dõi năng lực.",
    image: "/images/landing/theme-operations.webp",
    imageAlt: "Đánh giá năng lực và phản hồi giảng viên",
    imageRatio: "aspect-[4/3]",
    linkLabel: "Xem kịch bản mẫu Chuỗi cung ứng",
    route: "scenario-detail",
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