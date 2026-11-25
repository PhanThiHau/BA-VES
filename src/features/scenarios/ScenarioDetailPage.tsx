import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Database,
  FileCode,
  FileText,
  FolderCheck,
  Layers,
  ListChecks,
  Loader2,
  MessageSquareText,
  Network,
  Play,
  ShieldAlert,
  Sparkles,
  Target,
  Users,
  Waypoints,
  Workflow,
  XCircle,
  Zap,
} from "lucide-react";
import { catalogService, type ScenarioContextDto } from "../../services/catalogService";
import { commerceService, entitlementCoversScenario, type OrderDto } from "../../services/commerceService";
import { ApiError } from "../../services/apiClient";
import { simulationService } from "../../services/simulationService";
import { assignmentService, LearnerAssignmentDto } from "../../services/assignmentService";
import { scenarioAuthoringService, type ScenarioSprintDto } from "../../services/scenarioAuthoringService";
import { artifactService } from "../../services/artifactService";
import { toListItems } from "../../components/common/ReadableProse";
import { useApp } from "../../contexts/AppContext";
import type { RouteKey } from "../../types/models";
import { classNames } from "../../utils/format";
import { PayOsCheckoutModal } from "../commerce/PayOsCheckoutModal";
import { formatVnd } from "../commerce/learnerPlansCatalog";
import { difficultyLabelVi, planCodeForDifficulty, priceForDifficulty } from "../commerce/scenarioPricing";

const systemsByScenarioCode: Record<
  string,
  { name: string; badge: string; desc: string; issue: string }[]
> = {
  "OMNI-001": [
    {
      name: "POS RetailPro (25 Cửa hàng)",
      badge: "POS Bán lẻ",
      desc: "Bán tại quầy, xuất kho trực tiếp. Đồng bộ dữ liệu theo lô (Batch Sync) định kỳ.",
      issue: "Đồng bộ trễ 15-30 phút khiến hệ thống online không nắm bắt kịp tồn kho thực tế.",
    },
    {
      name: "WMS Infor (Tổng kho DC & Kho đệm)",
      badge: "WMS Kho",
      desc: "Quản lý tồn kho vật lý, số lượng khả dụng (ATP) và phân bổ đóng gói hàng hóa.",
      issue: "Chưa hỗ trợ tự động điều phối nguồn hàng theo vị trí địa lý của khách mua.",
    },
    {
      name: "Website eCommerce (Magento 2)",
      badge: "eCommerce",
      desc: "Kênh bán lẻ trực tuyến 24/7, tạm trừ số lượng tồn trên giỏ hàng và thanh toán.",
      issue: "Cơ chế trừ tồn kho lệch pha với cửa hàng vật lý, gây tỷ lệ hủy đơn cao.",
    },
    {
      name: "ERP SAP Business One (Hệ thống lõi)",
      badge: "ERP Lõi",
      desc: "Ghi nhận hạch toán doanh thu, đối soát tài chính và phê duyệt hoàn tiền.",
      issue: "Quy trình hoàn tiền duyệt thủ công 3 cấp mất nhiều ngày, dễ quá tải khi đơn tăng.",
    },
  ],
  "SCM-001": [
    {
      name: "Cold Chain WMS (3 Tổng kho DC)",
      badge: "WMS Kho lạnh",
      desc: "Quản lý nhập xuất 45.000 pallet ở vùng nhiệt độ Âm sâu (-25°C) và Mát (2°C - 8°C).",
      issue: "Thủ kho ghi chép vị trí kệ bằng tay gây lệch vị trí 6%, thiếu luồng Cross-docking tự động.",
    },
    {
      name: "IoT Telemetry & MQTT Gateway",
      badge: "IoT Cảm biến",
      desc: "Thu thập dữ liệu cảm biến nhiệt độ/độ ẩm gắn trên pallet và hầm lạnh theo thời gian thực.",
      issue: "Vách panel kho lạnh bọc tôn dày 150mm gây suy hao sóng, cần chuẩn hóa chu kỳ gửi 3 phút/lần.",
    },
    {
      name: "Fleet Telematics & e-POD (150 Xe lạnh)",
      badge: "Vận tải Lạnh",
      desc: "Giám sát hành trình, nhiệt độ thùng xe tải lạnh và biên bản bàn giao điện tử e-POD.",
      issue: "Chưa gắn kết biểu đồ nhiệt độ vào e-POD dẫn tới tranh chấp trách nhiệm khi hàng rã đông.",
    },
    {
      name: "Industrial Handheld Scanner (-25°C)",
      badge: "Thiết bị Quét",
      desc: "Thiết bị quét mã QR/Barcode chuyên dụng cho công nhân vận hành trong kho âm sâu.",
      issue: "Nhiệt độ âm sâu làm hao pin nhanh gấp 3 lần và đơ cảm ứng trên thiết bị thông thường.",
    },
  ],
  "FIN-001": [
    {
      name: "Digital LOS & Credit Decision Engine",
      badge: "LOS Tín dụng",
      desc: "Hệ thống khởi tạo khoản vay số trên ứng dụng FinNova Cash (15.000 hồ sơ/ngày).",
      issue: "Tỷ lệ duyệt thẳng tự động (STP) mới đạt 22%, 78% hồ sơ bị nghẽn ở khâu thẩm định thủ công.",
    },
    {
      name: "eKYC Liveness & C06 Verification",
      badge: "Định danh eKYC",
      desc: "Xác thực giấy tờ CCCD gắn chip và nhận diện khuôn mặt người thật trên thiết bị di động.",
      issue: "Chưa chặn triệt để ảnh chụp màn hình và video Deepfake, gây thất thoát nợ xấu gian lận 2.8%.",
    },
    {
      name: "Cổng Tra cứu Tín dụng CIC & Telco Scoring",
      badge: "Dữ liệu Bên thứ 3",
      desc: "Kết nối API tra cứu lịch sử tín dụng CIC và điểm tín nhiệm viễn thông cho lao động tự do.",
      issue: "Truy vấn CIC tốn phí cao và trễ 30s - 3 phút, cần phễu lọc đa tầng trước khi gọi API.",
    },
    {
      name: "Core Banking & e-Contract Gateway",
      badge: "Hệ thống Lõi",
      desc: "Ký hợp đồng tín dụng điện tử bằng OTP/chữ ký số và lệnh giải ngân tức thì 24/7.",
      issue: "Cần đối soát chặt chẽ tên chủ tài khoản nhận tiền trùng khớp 100% với định danh CCCD.",
    },
  ],
  "RET-001": [
    {
      name: "Central Promotion & Loyalty Engine",
      badge: "Promo Engine",
      desc: "Động cơ tính toán khuyến mãi tập trung, quản lý hạng thẻ và điểm thưởng cho 1,2 triệu hội viên.",
      issue: "Đang tách rời giữa kênh E-Commerce Cloud và hệ thống POS tại cửa hàng vật lý.",
    },
    {
      name: "Hệ thống POS (65 Showroom MegaFashion)",
      badge: "POS Showroom",
      desc: "Phần mềm tính tiền tại quầy thu ngân, quét mã voucher và xử lý đổi trả hàng trực tiếp.",
      issue: "Lưu dữ liệu cục bộ, kiểm tra điều kiện gộp mã phức tạp làm thu ngân mất 3-4 phút/khách.",
    },
    {
      name: "Ứng dụng Di động MegaClub & Website",
      badge: "Omni-Channel",
      desc: "Cổng tích điểm, thăng hạng hội viên (Silver, Gold, Diamond) và ví voucher điện tử.",
      issue: "Độ trễ đồng bộ 4-12 giờ khiến khách lợi dụng dùng 1 mã Single-use trên cả Web và POS.",
    },
    {
      name: "Hệ thống Kế toán & Đối soát Tài chính",
      badge: "Tài chính ERP",
      desc: "Kiểm soát ngân sách chiết khấu (trần 8% doanh thu ròng) và hạch toán hoàn trả hàng.",
      issue: "Thu ngân tính tay tiền hoàn và điểm thu hồi khi khách trả lẻ món trong combo khuyến mãi.",
    },
  ],
  // --- Beginner starters (không fallback về OMNI-001) ---
  "BEG-OMS-01": [
    {
      name: "Website & App bán hàng OmniMart Starter",
      badge: "eCommerce nhẹ",
      desc: "Kênh online hiển thị trạng thái New / Paid / Shipping / Done cho ~180–250 đơn/ngày.",
      issue: "Tên trạng thái tiếng Anh lệch với sổ cửa hàng tiếng Việt; khách không hiểu “đơn đang ở đâu”.",
    },
    {
      name: "Bảng Excel điều phối + chat nội bộ Ops",
      badge: "Vận hành thủ công",
      desc: "Ops Coordinator theo dõi đơn treo và nhờ cửa hàng cập nhật qua Zalo/Excel.",
      issue: "Đối soát cuối ngày thủ công; thiếu danh mục trạng thái chuẩn dùng chung.",
    },
    {
      name: "Hotline & Facebook inbox CSKH",
      badge: "CSKH",
      desc: "Agent trả lời ticket hỏi trạng thái; ghi chú tự do trên ticket.",
      issue: "~35% ticket tuần chỉ để hỏi trạng thái — phải gọi cửa hàng xác minh.",
    },
    {
      name: "Sổ/chat nhóm 3 cửa hàng",
      badge: "Cửa hàng",
      desc: "Store Staff ghi Chờ lấy / Đang gói / Đã giao khi đóng gói và bàn giao shipper.",
      issue: "Cập nhật trễ hoặc quên; không đồng bộ realtime lên website.",
    },
  ],
  "BEG-WMS-01": [
    {
      name: "Cảm biến nhiệt độ IoT (1 kho đông)",
      badge: "IoT lạnh",
      desc: "Ghi nhiệt độ kho đông mỗi 5 phút; mục tiêu -18°C ± 2°C (~800 pallet).",
      issue: "Mọi mức bất thường đều đẩy cùng một tin — không phân Info / Warning / Critical.",
    },
    {
      name: "Nhóm Zalo “Kho đông” (~12 người)",
      badge: "Kênh cảnh báo",
      desc: "Giám sát, QA và ca đêm nhận tin chung; chưa có app alert riêng.",
      issue: "Ca đêm dễ bỏ lỡ tin lẫn với thông báo xe vào/ra; không rõ ai đã acknowledge.",
    },
    {
      name: "Biên bản QA / nhật ký sự cố thủ công",
      badge: "QA giấy/Excel",
      desc: "QA Assistant đối chiếu nhiệt độ và giữ hàng khi nghi lệch nhiệt.",
      issue: "Không có form chuẩn; phải hỏi lại bằng chat để đủ trường cho khách 3PL.",
    },
    {
      name: "Ca đêm kho lạnh (22:00–06:00)",
      badge: "Ca vận hành",
      desc: "Night Shift Lead quyết định gọi bảo trì hoặc đóng cụm kệ tạm thời.",
      issue: "Phản ứng chậm hơn ca ngày; bàn giao ca sáng thiếu dấu vết sự cố.",
    },
  ],
  "BEG-LOS-01": [
    {
      name: "Digital LOS — hàng đợi eKYC",
      badge: "LOS nhẹ",
      desc: "Hồ sơ vay tiêu dùng online; bước CCCD + selfie trước khi vào thẩm định.",
      issue: "Ops thấy “chờ đối soát” nhưng không có hold reason rõ trên UI.",
    },
    {
      name: "Luồng chụp CCCD & selfie trên app",
      badge: "eKYC cơ bản",
      desc: "Khách tải ảnh giấy tờ và selfie; một phần hồ sơ bị hold bổ sung.",
      issue: "Ảnh mờ/lóa và selfie lệch góc chiếm phần lớn hold — thiếu taxonomy lý do.",
    },
    {
      name: "Hàng đợi Credit Ops (SLA 4 giờ)",
      badge: "Credit Ops",
      desc: "Credit Ops Officer xử lý hold, gọi khách hoặc chuyển Onboarding.",
      issue: "Phải mở nhiều màn hình/log thô để đoán nguyên nhân — dễ trễ SLA.",
    },
    {
      name: "CRM nhẹ + checklist Compliance",
      badge: "Onboarding / Tuân thủ",
      desc: "Onboarding hướng dẫn chụp lại; Compliance rà mẫu hold/reject tuần.",
      issue: "Lý do reject chưa chuẩn hóa; rủi ro ghi PII ra chat cá nhân.",
    },
  ],
  "BEG-PROMO-01": [
    {
      name: "Promotion Engine — voucher GIẢM50K",
      badge: "Promo nhẹ",
      desc: "Cấu hình mã giảm tiền cố định, min order, danh mục Áo, không cộng dồn FREESHIP.",
      issue: "Banner ghi “mọi sản phẩm” trong khi hệ thống chỉ áp dụng danh mục Áo.",
    },
    {
      name: "App/Website banner chiến dịch",
      badge: "Marketing",
      desc: "Marketing Ops soạn copy và theo dõi redemption.",
      issue: "Kỳ vọng khách lệch cấu hình thật → inbox khiếu nại tăng.",
    },
    {
      name: "POS quầy thu ngân cửa hàng",
      badge: "POS",
      desc: "POS Supervisor đảm bảo thu ngân áp dụng đúng điều kiện tại quầy.",
      issue: "App vs POS hiểu điều kiện khác nhau; mã lỗi xử lý thủ công.",
    },
    {
      name: "Inbox / hotline CX",
      badge: "CSKH",
      desc: "CX Specialist trả lời mã không dùng được và đề xuất bồi hoàn theo guideline.",
      issue: "Thiếu bảng điều kiện as-is rõ ràng để giải thích thống nhất cho khách.",
    },
  ],
  "BEG-CAFE-01": [
    {
      name: "Zalo NCC A / NCC B",
      badge: "Đặt hàng thủ công",
      desc: "Quán trưởng nhắn đặt sữa/ly (NCC A) và đậu (NCC B) mỗi thứ Hai sáng.",
      issue: "Không có checklist nhu cầu tuần chung trước khi nhắn — dễ thiếu hoặc trùng.",
    },
    {
      name: "Giấy dán tủ lạnh (ca barista)",
      badge: "Ghi nhận thiếu hàng",
      desc: "Barista ca sáng ghi “hết sữa / hết đậu” trên giấy dán trong tuần.",
      issue: "Không báo nếu hết cuối ca; không đồng bộ với Excel kế toán.",
    },
    {
      name: "Excel Chi_phi_NL.xlsx",
      badge: "Kế toán part-time",
      desc: "Đối chiếu hóa đơn NCC và chi phí nguyên liệu theo tuần/tháng.",
      issue: "File không chia sẻ cho barista; đôi khi đặt bù mà quán trưởng không biết.",
    },
    {
      name: "Ca pha chế & trải nghiệm khách",
      badge: "Vận hành quán",
      desc: "~40–60 khách/ngày; sữa oat và đậu đậm là mặt hàng nhạy cảm.",
      issue: "Thiếu giữa tuần ảnh hưởng trải nghiệm; đặt thừa tăng lãng phí.",
    },
  ],
};

type ScenarioSprintPreview = {
  sprintNo: number;
  name: string;
  timebox: string;
  focus: string;
  deliverables: { code: string; title: string }[];
};

function formatDurationLabel(value: number, unit: string): string {
  const n = Math.max(1, Math.floor(value || 1));
  if ((unit || "").toLowerCase().startsWith("d")) return n === 1 ? "1 ngày" : `${n} ngày`;
  return n === 1 ? "1 tuần" : `${n} tuần`;
}

function mapApiSprintsToPreview(
  sprints: ScenarioSprintDto[],
  templateNameByCode: Record<string, string>
): ScenarioSprintPreview[] {
  return sprints.map((s) => ({
    sprintNo: s.sprintNo,
    name: `Sprint ${s.sprintNo}`,
    timebox: formatDurationLabel(s.durationValue, s.durationUnit),
    focus: s.focus,
    deliverables: (s.templateCodes ?? []).map((code) => {
      const normalized = code.trim().toUpperCase();
      const name = templateNameByCode[normalized];
      return {
        code: normalized,
        title: name ? `${normalized} · ${name}` : normalized,
      };
    }),
  }));
}

const stakeholdersByScenarioCode: Record<
  string,
  { name: string; role: string; dept: string; focus: string }[]
> = {
  "OMNI-001": [
    {
      name: "Trần Minh Quân",
      role: "Operations Manager",
      dept: "Khối Vận hành & Kho",
      focus: "Tồn kho thực tế, giảm hủy đơn và tối ưu hóa quy trình đóng gói.",
    },
    {
      name: "Lê Hoàng Yến",
      role: "Sales & CS Lead",
      dept: "Khối Kinh doanh & CSKH",
      focus: "Trải nghiệm mua sắm, giảm khiếu nại và rút ngắn thời gian xử lý đổi trả.",
    },
    {
      name: "Nguyễn Quốc Tuấn",
      role: "IT Lead",
      dept: "Khối CNTT",
      focus: "Đồng bộ dữ liệu POS-WMS-ERP, duy trì độ ổn định của hệ thống lõi.",
    },
  ],
  "SCM-001": [
    {
      name: "Hoàng Minh Đức",
      role: "DC Operations Director",
      dept: "Vận hành Kho vận",
      focus: "Tăng thông lượng bốc dỡ tại cửa Dock và tối ưu chi phí điện lạnh 3 tổng kho DC.",
    },
    {
      name: "Trần Thị Mai Lan",
      role: "QA/QC & Compliance Lead",
      dept: "Quản lý Chất lượng & Tuân thủ",
      focus: "Kiểm soát nghiêm ngặt chuỗi lạnh GSP/GDP và nhật ký nhiệt độ bất biến.",
    },
    {
      name: "Nguyễn Văn Hùng",
      role: "Fleet & Transport Manager",
      dept: "Vận tải & Điều phối Đội xe",
      focus: "Điều phối 150 xe tải lạnh, giảm thời gian chờ tại kho và minh bạch bàn giao e-POD.",
    },
    {
      name: "Lê Đăng Khoa",
      role: "WMS & IoT Systems Engineer",
      dept: "Công nghệ & Tự động hóa",
      focus: "Tích hợp cảm biến IoT Telemetry và thiết bị Handheld hoạt động ở môi trường -25°C.",
    },
  ],
  "FIN-001": [
    {
      name: "Nguyễn Trí Dũng",
      role: "Credit Risk Management Lead",
      dept: "Quản trị Rủi ro Tín dụng",
      focus: "Thiết lập ngưỡng điểm cắt phê duyệt (Cut-off Score) và kiểm soát tỷ lệ nợ xấu NPL.",
    },
    {
      name: "Trần Thanh Sơn",
      role: "Digital Lending Business Director",
      dept: "Phát triển Kinh doanh Số",
      focus: "Tăng trưởng doanh số giải ngân và tối ưu tỷ lệ chuyển đổi trên Mobile App.",
    },
    {
      name: "Lê Kim Oanh",
      role: "Underwriting & Fraud Prevention Lead",
      dept: "Thẩm định & Chống Gian lận",
      focus: "Phát hiện giả mạo sinh trắc học eKYC, Deepfake và quản lý Fraud Blacklist.",
    },
    {
      name: "Phạm Quốc Huy",
      role: "Legal & Compliance Manager",
      dept: "Pháp chế & Tuân thủ",
      focus: "Tuân thủ quy định NHNN và Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.",
    },
    {
      name: "Ngô Thanh Tùng",
      role: "Fintech Enterprise Architect & CISO",
      dept: "CNTT & An ninh mạng",
      focus: "Kiến trúc Digital LOS, kết nối CIC/Core Banking và bảo mật chữ ký số e-Contract.",
    },
  ],
  "RET-001": [
    {
      name: "Vũ Bích Ngọc",
      role: "Head of Marketing & Loyalty",
      dept: "Khối Marketing",
      focus: "Chiến lược khuyến mãi đa tầng, quản trị hạng thẻ MegaClub và tăng tỷ lệ chuyển đổi.",
    },
    {
      name: "Đặng Văn Bình",
      role: "Chief Accountant / Finance Manager",
      dept: "Tài chính - Kế toán",
      focus: "Kiểm soát trần ngân sách khuyến mãi, chống cộng dồn lỗ và thu hồi điểm khi trả hàng.",
    },
    {
      name: "Lê Trọng Nghĩa",
      role: "Retail Store Operations Director",
      dept: "Vận hành Bán lẻ",
      focus: "Tốc độ thanh toán tại 65 showroom và trải nghiệm đổi trả hàng chéo kênh.",
    },
    {
      name: "Phạm Thế Anh",
      role: "IT Integration Lead",
      dept: "Khối CNTT",
      focus: "Xây dựng Central Promotion Engine hợp nhất giữa POS cửa hàng, Web và Mobile App.",
    },
  ],
  "BEG-OMS-01": [
    {
      name: "Phạm Thu Hà",
      role: "Operations Coordinator",
      dept: "Vận hành",
      focus: "Điều phối đơn website ↔ 3 cửa hàng; thống nhất danh mục trạng thái; giảm đơn treo quá SLA 4 giờ.",
    },
    {
      name: "Nguyễn Minh Anh",
      role: "CSKH Lead",
      dept: "Chăm sóc khách hàng",
      focus: "Giảm ticket “đơn đang ở đâu?”; ngôn ngữ trạng thái dễ giải thích cho khách trên hotline/Facebook.",
    },
    {
      name: "Trần Quốc Bảo",
      role: "Store Staff",
      dept: "Cửa hàng Quận 7",
      focus: "Đóng gói và cập nhật trạng thái thật khi bàn giao shipper — không muốn thêm bước phức tạp.",
    },
  ],
  "BEG-WMS-01": [
    {
      name: "Đỗ Văn Khoa",
      role: "Warehouse Supervisor",
      dept: "Kho lạnh — ca ngày",
      focus: "Phân mức cảnh báo nhiệt độ; template sự cố hoàn tất trong ~2 phút; bảo vệ hàng 3PL.",
    },
    {
      name: "Lê Thu Trang",
      role: "QA Assistant",
      dept: "Đảm bảo chất lượng",
      focus: "Nhật ký sự cố đủ trường cho khách 3PL; giữ hàng khi nghi lệch nhiệt; đối chiếu biên bản QA.",
    },
    {
      name: "Phạm Hoàng Nam",
      role: "Night Shift Lead",
      dept: "Kho lạnh — ca đêm",
      focus: "Acknowledge cảnh báo đêm; quyết định gọi bảo trì/đóng kệ; bàn giao ca sáng có dấu vết.",
    },
  ],
  "BEG-LOS-01": [
    {
      name: "Ngô Minh Châu",
      role: "Credit Ops Officer",
      dept: "Vận hành tín dụng",
      focus: "Hold reason rõ trên hàng đợi eKYC; đóng case trong SLA 4 giờ; giảm đoán nguyên nhân từ log thô.",
    },
    {
      name: "Hoàng Nhật Lê",
      role: "Onboarding Specialist",
      dept: "Chăm sóc mở tài khoản vay",
      focus: "Hướng dẫn khách chụp lại CCCD/selfie; cập nhật trạng thái chờ khách trên CRM nhẹ.",
    },
    {
      name: "Đặng Thu Hà",
      role: "Compliance Junior",
      dept: "Tuân thủ",
      focus: "Taxonomy hold/reject chuẩn; đủ dấu vết giải trình; không để PII lan ra chat cá nhân.",
    },
  ],
  "BEG-PROMO-01": [
    {
      name: "Vũ Thanh Tâm",
      role: "Marketing Ops",
      dept: "Marketing",
      focus: "Điều kiện voucher GIẢM50K khớp banner vs hệ thống; giảm khiếu nại mã không dùng được.",
    },
    {
      name: "Lý Quang Dũng",
      role: "POS Supervisor",
      dept: "Cửa hàng — Vận hành quầy",
      focus: "Thu ngân áp dụng đúng min order / danh mục / không cộng dồn; xử lý mã lỗi nhanh.",
    },
    {
      name: "Phan Ngọc Mai",
      role: "CX Specialist",
      dept: "Chăm sóc khách hàng",
      focus: "Giải thích điều kiện mã thống nhất; ticket khiếu nại và bồi hoàn theo guideline.",
    },
  ],
  "BEG-CAFE-01": [
    {
      name: "Nguyễn Thị Mai",
      role: "Owner / Store Manager",
      dept: "Vận hành",
      focus: "Duyệt & gửi đơn tuần qua Zalo; hết tuần không thiếu hàng, không lãng phí.",
    },
    {
      name: "Trần Minh Tuấn",
      role: "Barista (ca sáng)",
      dept: "Pha chế",
      focus: "Đề xuất thiếu hàng qua giấy dán; luôn đủ sữa oat & đậu trong ca.",
    },
    {
      name: "Lê Thu Hà",
      role: "Accountant (part-time)",
      dept: "Tài chính",
      focus: "Kiểm soát chi phí nguyên liệu; chống đặt trùng / đặt thừa trên Excel.",
    },
  ],
};

function splitNumberedList(text?: string | null, fallback: string[] = []): string[] {
  const parts = toListItems(text);
  return parts.length > 0 ? parts : fallback;
}

export function ScenarioDetailPage({ navigate }: { navigate: (route: RouteKey) => void }) {
  const { currentScenarioVersionId, setCurrentSessionId, setActiveAgents, setActiveDocTarget } = useApp();

  const [context, setContext] = useState<ScenarioContextDto | null>(null);
  const [myAssignment, setMyAssignment] = useState<LearnerAssignmentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [needsPurchase, setNeedsPurchase] = useState(false);
  const [scenarioCatalogId, setScenarioCatalogId] = useState<number | null>(null);
  const [buying, setBuying] = useState(false);
  const [checkoutOrder, setCheckoutOrder] = useState<OrderDto | null>(null);
  const [activeTab, setActiveTab] = useState<"context" | "sprints">("context");
  const [sprintPreviews, setSprintPreviews] = useState<ScenarioSprintPreview[]>([]);

  const versionId = currentScenarioVersionId || 1;
  const scenarioListPrice = priceForDifficulty(context?.difficulty);

  useEffect(() => {
    async function loadContext() {
      setLoading(true);
      try {
        const [data, myAsgs, sprintRes, templateRes] = await Promise.allSettled([
          catalogService.getScenarioContext(versionId),
          assignmentService.getMyAssignments(),
          scenarioAuthoringService.getSprints(versionId),
          artifactService.getTemplates(),
        ]);
        if (data.status === "fulfilled") {
          setContext(data.value);
        }
        const templateNameByCode: Record<string, string> = {};
        if (templateRes.status === "fulfilled") {
          for (const tmpl of templateRes.value) {
            const code = (tmpl.code || tmpl.deliverableCode || "").trim().toUpperCase();
            if (code) templateNameByCode[code] = tmpl.name;
          }
        }
        if (sprintRes.status === "fulfilled") {
          setSprintPreviews(mapApiSprintsToPreview(sprintRes.value.sprints ?? [], templateNameByCode));
        } else {
          setSprintPreviews([]);
        }
        const matchedAssignment =
          myAsgs.status === "fulfilled"
            ? myAsgs.value.find((a) => a.scenarioVersionId === versionId) ?? null
            : null;
        if (matchedAssignment) setMyAssignment(matchedAssignment);

        if (!matchedAssignment) {
          try {
            const [ents, scenarios, apps] = await Promise.all([
              commerceService.getMyEntitlements(),
              catalogService.getScenarios(undefined, true),
              catalogService.getApplications(),
            ]);
            const match = scenarios.find(
              (item) => (item.publishedVersionId || item.id) === versionId || item.id === versionId
            );
            setScenarioCatalogId(match?.id ?? null);
            const industryId = apps.find((app) => app.id === match?.applicationId)?.industry.id;
            setNeedsPurchase(
              !entitlementCoversScenario(ents, {
                scenarioId: match?.id,
                versionId,
                applicationId: match?.applicationId,
                industryId,
                isFreeAccess: Boolean(match?.isFreeAccess) || Boolean((data.status === "fulfilled" ? data.value : null)?.isFreeAccess),
              })
            );
          } catch (accessErr) {
            console.warn("Không kiểm tra được quyền mua gói:", accessErr);
          }
        } else {
          setNeedsPurchase(false);
        }
      } catch (err) {
        console.warn("Không tải được bối cảnh từ API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadContext();
  }, [versionId]);

  const refreshAccess = async () => {
    try {
      const [ents, scenarios, apps] = await Promise.all([
        commerceService.getMyEntitlements(),
        catalogService.getScenarios(undefined, true),
        catalogService.getApplications(),
      ]);
      const match = scenarios.find(
        (item) => (item.publishedVersionId || item.id) === versionId || item.id === versionId
      );
      setScenarioCatalogId(match?.id ?? null);
      const industryId = apps.find((app) => app.id === match?.applicationId)?.industry.id;
      setNeedsPurchase(
        !entitlementCoversScenario(ents, {
          scenarioId: match?.id,
          versionId,
          applicationId: match?.applicationId,
          industryId,
          isFreeAccess: Boolean(match?.isFreeAccess) || Boolean(context?.isFreeAccess),
        })
      );
    } catch {
      /* ignore */
    }
  };

  const handleBuyThisScenario = async () => {
    if (!scenarioCatalogId) {
      setStartError("Không xác định được kịch bản để mua. Thử tải lại trang.");
      return;
    }
    setBuying(true);
    setStartError(null);
    try {
      const plans = await commerceService.getPlans();
      const code = planCodeForDifficulty(context?.difficulty);
      const plan = plans.find((p) => p.code === code);
      if (!plan) {
        setStartError(`Chưa có gói ${code} trên hệ thống. Chạy seed-learner-plans-v2.sql.`);
        return;
      }
      const order = await commerceService.createOrder({
        planId: plan.id,
        targetScopeId: scenarioCatalogId,
        returnUrl: window.location.href,
        cancelUrl: window.location.href,
      });
      if (order.status === "Paid" || plan.price === 0) {
        await refreshAccess();
        alert("Đã mở khóa kịch bản này.");
      } else {
        setCheckoutOrder(order);
      }
    } catch (err: unknown) {
      setStartError(err instanceof Error ? err.message : "Không tạo được đơn mua kịch bản.");
    } finally {
      setBuying(false);
    }
  };

  const handleAddScenarioToCart = async () => {
    if (!scenarioCatalogId) {
      setStartError("Không xác định được kịch bản để thêm giỏ.");
      return;
    }
    setBuying(true);
    setStartError(null);
    try {
      const plans = await commerceService.getPlans();
      const code = planCodeForDifficulty(context?.difficulty);
      const plan = plans.find((p) => p.code === code);
      if (!plan) {
        setStartError(`Chưa có gói ${code} trên hệ thống.`);
        return;
      }
      const label = `${context?.scenarioCode || ""} — ${context?.scenarioTitle || plan.name}`.trim();
      await commerceService.addCartItem({
        planId: plan.id,
        targetScopeId: scenarioCatalogId,
        targetLabel: label,
      });
      alert("Đã thêm kịch bản vào giỏ hàng.");
    } catch (err: unknown) {
      setStartError(err instanceof Error ? err.message : "Không thêm được vào giỏ.");
    } finally {
      setBuying(false);
    }
  };

  const handleStartSession = async (targetRoute: RouteKey = "simulation") => {
    if (needsPurchase && !myAssignment) {
      setStartError("Bạn chưa mua gói cho kịch bản này.");
      return;
    }
    setStarting(true);
    setStartError(null);
    try {
      let session;
      if (myAssignment) {
        session = await assignmentService.startAssignmentSession(myAssignment.id);
      } else {
        session = await simulationService.startSession(versionId);
      }
      if (session?.id) {
        setCurrentSessionId(session.id);
      }
      if (session?.agents && session.agents.length > 0) {
        setActiveAgents(session.agents);
      }
      navigate(targetRoute);
    } catch (err: unknown) {
      console.warn("Lỗi tạo phiên trên máy chủ:", err);
      const paymentRequired = err instanceof ApiError && err.data?.code === "PAYMENT_REQUIRED";
      if (paymentRequired) setNeedsPurchase(true);
      setStartError(
        paymentRequired
          ? "Bạn chưa mua gói hoặc đã hết lượt thực hành cho kịch bản này."
          : err instanceof Error
            ? err.message
            : "Không thể khởi tạo phiên thực hành trên máy chủ."
      );
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate text-xs font-semibold">
        <Loader2 className="animate-spin text-navy mb-3" size={28} />
        Đang nạp dữ liệu kịch bản...
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans pb-10">
      {/* Top Bar: Back & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate/15 pb-3">
        <button
          onClick={() => navigate("applications")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate hover:text-navy transition cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Quay lại danh sách kịch bản</span>
        </button>

        <div className="flex items-center rounded-xl bg-offwhite p-1 border border-slate/20">
          <button
            onClick={() => setActiveTab("context")}
            className={classNames(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer",
              activeTab === "context"
                ? "bg-white text-navy shadow-xs"
                : "text-slate hover:text-navy"
            )}
          >
            <Building2 size={14} />
            <span>Tổng quan Nghiệp vụ</span>
          </button>
          <button
            onClick={() => setActiveTab("sprints")}
            className={classNames(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer",
              activeTab === "sprints"
                ? "bg-white text-navy shadow-xs"
                : "text-slate hover:text-navy"
            )}
          >
            <Workflow size={14} />
            <span>Lộ trình 4 Sprint</span>
          </button>
        </div>
      </div>

      {needsPurchase && !myAssignment && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-950">
          <div>
            <p className="font-bold">Chưa mở khóa kịch bản này</p>
            <p className="mt-0.5 text-amber-900/80">
              Gói 1: mua riêng kịch bản này ({formatVnd(scenarioListPrice)}, AI chấm — giá theo độ khó).
              Hoặc xem Gói 2–4 nếu muốn mở theo Application / Industry / All + lượt Expert.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={buying}
              onClick={() => void handleBuyThisScenario()}
              className="rounded-lg bg-navy px-3 py-1.5 font-bold text-white disabled:opacity-60"
            >
              {buying ? "Đang tạo đơn..." : `Mua kịch bản này · ${formatVnd(scenarioListPrice)}`}
            </button>
            <button
              type="button"
              disabled={buying}
              onClick={() => void handleAddScenarioToCart()}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-bold text-navy disabled:opacity-60"
            >
              Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = "#/payment?tab=cart";
                navigate("payment");
              }}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-bold text-navy"
            >
              Xem giỏ
            </button>
            <button
              type="button"
              onClick={() => navigate("payment")}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-bold text-navy"
            >
              Xem Gói 2–4
            </button>
          </div>
        </div>
      )}

      {startError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
          ⚠️ {startError}
        </div>
      )}

      {/* Main Grid: Content (Left) + Actions & Metadata (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* LEFT COLUMN: Main Scenario Information */}
        <div className="space-y-6">
          {/* Scenario Hero Summary */}
          <div className="rounded-2xl border border-slate/15 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-navy bg-navy/5 px-2.5 py-0.5 rounded-md border border-navy/15">
                {context?.scenarioCode || "OMNI-001"}
              </span>
              <span className="rounded-md bg-amber-500/15 text-amber-700 px-2.5 py-0.5 text-xs font-bold border border-amber-500/25">
                {difficultyLabelVi(context?.difficulty)}
              </span>
              {context?.isFreeAccess && (
                <span className="rounded-md bg-emerald-500/15 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-500/25">
                  Miễn phí · Beginner
                </span>
              )}
              <span className="rounded-md bg-emerald-500/15 text-emerald-700 px-2.5 py-0.5 text-xs font-bold border border-emerald-500/25">
                Chuẩn BABOK® v3
              </span>
            </div>

            <h1 className="mt-3 font-display text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
              {context?.scenarioTitle || "OmniMart - Cải tiến xử lý đơn hàng đa kênh"}
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-slate">
              {context?.businessContext ||
                "OmniMart là chuỗi 25 siêu thị bán lẻ kết hợp website thương mại điện tử, phục vụ 5.000 - 8.000 đơn hàng/ngày. Hệ thống gặp vấn đề lệch pha dữ liệu tồn kho khả dụng (ATP) giữa kênh trực tuyến và cửa hàng thực tế, dẫn đến tỷ lệ hủy đơn cao."}
            </p>
          </div>

          {/* TAB 1: BUSINESS CONTEXT */}
          {activeTab === "context" && (
            <div className="space-y-6">
              {/* Problem & Objectives Side-by-Side */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Core Problem */}
                <div className="rounded-2xl border border-rose-200/70 bg-rose-50/30 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle size={15} />
                    <span>Thách thức hiện tại</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate">
                    {splitNumberedList(context?.businessProblem, [
                      "POS chỉ đồng bộ theo lô 15-30p, gây hủy đơn online 12-15%.",
                      "Khóa giữ tồn kho sai thời điểm, phát sinh tình trạng hết hàng ảo.",
                      "Đơn hàng không được tự động định tuyến về cửa hàng gần nhất.",
                      "Quy trình hoàn tiền duyệt thủ công 3 cấp mất từ 5-7 ngày.",
                    ]).map((prob, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-500 font-bold">•</span>
                        <span>{prob}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Target Goals */}
                <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/30 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    <Target size={15} />
                    <span>Mục tiêu giải pháp (SMART)</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate">
                    {splitNumberedList(context?.businessObjectives, [
                      "Giảm tỷ lệ hủy đơn do lệch tồn kho xuống dưới 3%.",
                      "Áp dụng quy tắc Hold Reservation 30p và Safety Stock.",
                      "Rút ngắn thời gian xử lý hoàn tiền online xuống dưới 48 giờ.",
                      "Tự động điều phối đơn hàng về cửa hàng trong bán kính 10km.",
                    ]).map((obj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stakeholders to Interview */}
              {(() => {
                const code = context?.scenarioCode || "OMNI-001";
                const list =
                  stakeholdersByScenarioCode[code] ||
                  (code.startsWith("BEG-")
                    ? stakeholdersByScenarioCode["BEG-OMS-01"]
                    : stakeholdersByScenarioCode["OMNI-001"]);
                return (
                  <div className="rounded-2xl border border-slate/15 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-navy" />
                        <h3 className="font-display text-sm font-extrabold text-navy">
                          Các Bên Liên Quan Chủ Chốt (Stakeholders)
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate">
                        {list.length} Tác tử AI
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {list.map((s) => (
                        <div
                          key={s.name}
                          className="rounded-xl border border-slate/15 bg-offwhite/60 p-3.5 space-y-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy text-xs font-bold text-white font-display">
                              {s.name.slice(0, 1)}
                            </div>
                            <div>
                              <strong className="block text-xs font-bold text-navy leading-tight">
                                {s.name}
                              </strong>
                              <span className="text-[10px] text-slate font-medium">{s.role}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate/90 pt-1 leading-snug">{s.focus}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Connected Systems */}
              {(() => {
                const code = context?.scenarioCode || "OMNI-001";
                const systems =
                  systemsByScenarioCode[code] ||
                  (code.startsWith("BEG-")
                    ? systemsByScenarioCode["BEG-OMS-01"]
                    : systemsByScenarioCode["OMNI-001"]);
                return (
                  <div className="rounded-2xl border border-slate/15 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Database size={16} className="text-navy" />
                        <h3 className="font-display text-sm font-extrabold text-navy">
                          Hệ Thống Công Nghệ Liên Quan
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold text-slate">
                        {systems.length} Nền tảng
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {systems.map((sys) => (
                        <div
                          key={sys.name}
                          className="rounded-xl border border-slate/15 bg-offwhite/40 p-3.5 space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <strong className="text-xs font-bold text-navy">{sys.name}</strong>
                            <span className="rounded bg-navy/10 px-1.5 py-0.2 text-[9px] font-bold text-navy uppercase">
                              {sys.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate leading-relaxed">{sys.desc}</p>
                          <p className="text-[10px] text-amber-800 font-medium bg-amber-50 p-1.5 rounded border border-amber-200">
                            ⚠️ Điểm nghẽn: {sys.issue}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 2: SPRINTS ROADMAP */}
          {activeTab === "sprints" && (
            <div className="space-y-4">
              {sprintPreviews.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate/25 bg-white px-4 py-6 text-center text-xs text-slate">
                  Chưa có lộ trình sprint hoặc chưa gắn mã template (DEL-xx) cho kịch bản này.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {sprintPreviews.map((s) => (
                    <div key={s.sprintNo} className="rounded-2xl border border-slate/15 bg-white p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-slate/10 pb-2.5">
                        <span className="rounded-md bg-navy px-2 py-0.5 font-mono text-[10px] font-bold text-white">
                          Sprint {String(s.sprintNo).padStart(2, "0")}
                        </span>
                        <span className="text-[11px] font-semibold text-slate font-mono">{s.timebox}</span>
                      </div>

                      <h4 className="font-display text-sm font-bold text-navy">{s.name}</h4>
                      <p className="text-xs text-slate leading-relaxed">{s.focus}</p>

                      <div className="border-t border-slate/10 pt-2.5">
                        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate">
                          Tài liệu cần nộp (template):
                        </span>
                        {s.deliverables.length === 0 ? (
                          <p className="text-[11px] text-amber-800">Chưa gắn mã template cho sprint này.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {s.deliverables.map((d) => (
                              <span
                                key={d.code}
                                className="rounded-md border border-slate/20 bg-offwhite px-2 py-0.5 text-[11px] font-semibold text-navy"
                                title={d.title}
                              >
                                <span className="font-mono font-bold">{d.code}</span>
                                {d.title.includes("·") ? (
                                  <span className="font-normal text-slate">
                                    {" "}
                                    · {d.title.split("·").slice(1).join("·").trim()}
                                  </span>
                                ) : null}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ACTION CENTER */}
        <aside className="space-y-4">
          {/* Main Action Card */}
          <div className="sticky top-20 rounded-2xl border border-slate/15 bg-white p-5 shadow-sm space-y-5">
            <div>
              <h3 className="font-display text-base font-extrabold text-navy">Bắt đầu thực hành</h3>
              <p className="text-xs text-slate mt-0.5">
                {needsPurchase && !myAssignment
                  ? "Kịch bản này chưa nằm trong gói bạn đã thanh toán."
                  : "Chọn phương thức tiếp cận kịch bản:"}
              </p>
            </div>

            {needsPurchase && !myAssignment && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={buying}
                  onClick={() => void handleBuyThisScenario()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brass px-4 py-3 text-xs font-extrabold text-navy-deep shadow-sm hover:brightness-95 disabled:opacity-60"
                >
                  {buying
                    ? "Đang tạo đơn..."
                    : `Mua kịch bản này · ${formatVnd(scenarioListPrice)}`}
                </button>
                <button
                  type="button"
                  disabled={buying}
                  onClick={() => void handleAddScenarioToCart()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate/20 bg-white px-4 py-2.5 text-xs font-bold text-navy hover:bg-offwhite disabled:opacity-60"
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div className="space-y-2.5">
              {/* Primary Action: Phỏng vấn AI */}
              <button
                type="button"
                disabled={starting || (needsPurchase && !myAssignment)}
                onClick={() => handleStartSession("simulation")}
                className="group flex w-full items-center justify-between rounded-xl bg-navy px-4 py-3 text-left text-white shadow-sm hover:bg-navy-deep transition cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-brass">
                    <MessageSquareText size={16} />
                  </span>
                  <div>
                    <span className="block text-xs font-bold leading-tight">Phỏng vấn AI</span>
                    <span className="text-[10px] text-white/70">Trao đổi với Stakeholders</span>
                  </div>
                </div>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </button>

              {/* Secondary Action: Soạn Kế hoạch */}
              <button
                type="button"
                disabled={starting || (needsPurchase && !myAssignment)}
                onClick={() => {
                  setActiveDocTarget({ templateId: "bap" });
                  handleStartSession("docs");
                }}
                className="group flex w-full items-center justify-between rounded-xl border border-slate/20 bg-offwhite/60 px-4 py-3 text-left text-navy hover:bg-white hover:border-brass/50 transition cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-brass/15 text-brass">
                    <FileText size={16} />
                  </span>
                  <div>
                    <span className="block text-xs font-bold leading-tight">Lập Kế hoạch BA</span>
                    <span className="text-[10px] text-slate">Soạn biểu mẫu BAP</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Scenario Meta Info Table */}
            <div className="border-t border-slate/10 pt-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate">Mã kịch bản:</span>
                <span className="font-mono font-bold text-navy">{context?.scenarioCode || "OMNI-001"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate">Phiên bản:</span>
                <span className="font-mono font-bold text-navy">v{context?.versionNo || 1}.0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate">Độ khó:</span>
                <span className="font-bold text-amber-700">{difficultyLabelVi(context?.difficulty)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate">Phạm vi:</span>
                <span className="font-bold text-navy">4 Sprints Agile</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate">Chế độ:</span>
                <span className="font-bold text-emerald-700">
                  {myAssignment ? `Lớp ${myAssignment.cohortName}` : "Thực hành tự do"}
                </span>
              </div>
            </div>

            {/* Workflow Steps Preview */}
            <div className="rounded-xl bg-offwhite/70 p-3.5 border border-slate/15 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate block">
                Luồng thực hiện khuyến nghị:
              </span>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div className="rounded-lg bg-white p-1.5 border border-slate/10">
                  <span className="block font-mono text-[10px] font-bold text-navy">1. Phỏng vấn</span>
                  <span className="text-[9px] text-slate">Hỏi & thu thập</span>
                </div>
                <div className="rounded-lg bg-white p-1.5 border border-slate/10">
                  <span className="block font-mono text-[10px] font-bold text-navy">2. Soạn Docs</span>
                  <span className="text-[9px] text-slate">Phân tích trên hồ sơ</span>
                </div>
                <div className="rounded-lg bg-white p-1.5 border border-slate/10">
                  <span className="block font-mono text-[10px] font-bold text-navy">3. Review</span>
                  <span className="text-[9px] text-slate">Góp ý & nghiệm thu</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {checkoutOrder && (
        <PayOsCheckoutModal
          order={checkoutOrder}
          onClose={() => {
            setCheckoutOrder(null);
            void refreshAccess();
          }}
          onSuccess={() => {
            setCheckoutOrder(null);
            void refreshAccess();
            alert("Thanh toán thành công — kịch bản đã được mở khóa.");
          }}
        />
      )}
    </div>
  );
}
