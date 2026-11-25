/** Catalog hiển thị 6 vùng tri thức BABOK® v3 — đồng bộ code với seed-babok-v3-catalog.sql */

export interface BabokKnowledgeAreaMeta {
  code: string;
  nameVi: string;
  nameEn: string;
  shortDesc: string;
  badge: string;
  order: number;
}

export const BABOK_KA_ORDER = ["BAPM", "EC", "RLCM", "SA", "RADD", "SE"] as const;

export const BABOK_KNOWLEDGE_AREAS: Record<string, BabokKnowledgeAreaMeta> = {
  BAPM: {
    code: "BAPM",
    nameVi: "Lập kế hoạch & Giám sát BA",
    nameEn: "Business Analysis Planning and Monitoring",
    shortDesc: "Tiếp cận phân tích, stakeholder/RACI và quản trị thông tin BA.",
    badge: "Khởi tạo & Quản trị",
    order: 1,
  },
  EC: {
    code: "EC",
    nameVi: "Khơi gợi & Cộng tác",
    nameEn: "Elicitation and Collaboration",
    shortDesc: "Chuẩn bị/tiến hành phỏng vấn, xác nhận biên bản và bằng chứng.",
    badge: "Tương tác thực chiến",
    order: 2,
  },
  RLCM: {
    code: "RLCM",
    nameVi: "Quản lý vòng đời yêu cầu",
    nameEn: "Requirements Life Cycle Management",
    shortDesc: "Truy vết (RTM), ưu tiên hóa và đánh giá thay đổi yêu cầu.",
    badge: "Kiểm soát biến động",
    order: 3,
  },
  SA: {
    code: "SA",
    nameVi: "Phân tích chiến lược",
    nameEn: "Strategy Analysis",
    shortDesc: "AS-IS / TO-BE, mục tiêu nghiệp vụ và rủi ro chuyển đổi.",
    badge: "Định vị bài toán",
    order: 4,
  },
  RADD: {
    code: "RADD",
    nameVi: "Phân tích yêu cầu & Định nghĩa thiết kế",
    nameEn: "Requirements Analysis and Design Definition",
    shortDesc: "Đặc tả/mô hình hóa yêu cầu, xác minh và phương án thiết kế.",
    badge: "Chuẩn hóa tài liệu",
    order: 5,
  },
  SE: {
    code: "SE",
    nameVi: "Đánh giá giải pháp",
    nameEn: "Solution Evaluation",
    shortDesc: "KPI/ROI, hạn chế giải pháp và khuyến nghị tối ưu giá trị.",
    badge: "Đo lường giá trị",
    order: 6,
  },
};

export function resolveBabokAreaMeta(code: string, fallbackName?: string): BabokKnowledgeAreaMeta {
  const key = code.trim().toUpperCase();
  const known = BABOK_KNOWLEDGE_AREAS[key];
  if (known) return known;
  return {
    code: key || "UNKNOWN",
    nameVi: fallbackName || key || "Vùng tri thức",
    nameEn: fallbackName || key || "Knowledge Area",
    shortDesc: "Vùng tri thức gắn với bằng chứng chấm theo BABOK® v3.",
    badge: "BABOK® v3",
    order: 99,
  };
}

export function sortBabokAreas<T extends { code: string }>(areas: T[]): T[] {
  return [...areas].sort((a, b) => {
    const ao = resolveBabokAreaMeta(a.code).order;
    const bo = resolveBabokAreaMeta(b.code).order;
    return ao - bo || a.code.localeCompare(b.code);
  });
}
