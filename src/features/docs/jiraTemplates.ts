export interface TemplateChecklistItem {
  id: string;
  title: string;
  description: string;
  rubricHint: string;
  snippetHtml: string;
}

export interface JiraDocTemplate {
  id: string;
  templateCode: string;
  name: string;
  category: "Business Analysis" | "Requirements & Specs" | "Process & Traceability" | string;
  jiraBadge: string;
  summary: string;
  issueKeyPrefix: string;
  defaultTitle: string;
  htmlContent: string; // Sample HTML from API
  skeletonHtmlContent: string; // Scaffold HTML from API
  checklist: TemplateChecklistItem[];
}

export interface BuildingBlockItem {
  id: string;
  name: string;
  category: "Bảng biểu" | "Khung ghi chú" | "Yêu cầu & Phân tích";
  description: string;
  iconName: string;
  htmlContent: string;
}

export const COMMON_BUILDING_BLOCKS: BuildingBlockItem[] = [
  {
    id: "block-doc-prop",
    name: "Khung Thuộc tính Tài liệu (Document Properties)",
    category: "Khung ghi chú",
    description: "Bảng macro thuộc tính chuẩn Confluence: Tác giả, Nhà tài trợ, Trạng thái DRAFT, Mã Jira",
    iconName: "FileSpreadsheet",
    htmlContent: `
<div style="background-color: #f4f5f7; border-left: 4px solid #0052cc; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
  <strong>ℹ️ Thuộc tính Tài liệu (Document Properties):</strong><br/>
  • <strong>Chủ sở hữu (Lead BA):</strong> [Họ tên Học viên] &nbsp;|&nbsp; <strong>Nhà tài trợ:</strong> Ban Giám đốc Vận hành<br/>
  • <strong>Trạng thái:</strong> <span style="background-color: #dfe1e6; color: #42526e; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 11px;">DRAFT</span> &nbsp;|&nbsp; <strong>Phiên bản:</strong> v1.0<br/>
  • <strong>Mã Jira:</strong> <span style="background-color: #eae6ff; color: #403294; padding: 2px 6px; border-radius: 3px; font-weight: bold;">INIT-OMS-2026</span>
</div>
`
  },
  {
    id: "block-info-callout",
    name: "Khung Hướng dẫn Lưu ý (Info Callout)",
    category: "Khung ghi chú",
    description: "Khung thông báo xanh dương Confluence kèm viền xanh Jira",
    iconName: "Info",
    htmlContent: `
<div style="background-color: #deebff; border-left: 4px solid #0052cc; padding: 12px 16px; margin: 14px 0; border-radius: 4px;">
  <strong>💡 LƯU Ý NGHIỆP VỤ:</strong> [Nhập hướng dẫn, lưu ý đối soát hoặc quy tắc cần chú ý tại đây...]
</div>
`
  },
  {
    id: "block-warning-callout",
    name: "Khung Cảnh báo Rủi ro (Warning Callout)",
    category: "Khung ghi chú",
    description: "Khung màu vàng cam Confluence dùng cho rủi ro hoặc giả định nguy cơ",
    iconName: "AlertTriangle",
    htmlContent: `
<div style="background-color: #fff0b3; border-left: 4px solid #ff991f; padding: 12px 16px; margin: 14px 0; border-radius: 4px;">
  <strong>⚠️ CẢNH BÁO / RỦI RO NGHIỆP VỤ:</strong> [Nêu rõ nguy cơ xảy ra, xác suất và phương án giảm thiểu rủi ro...]
</div>
`
  },
  {
    id: "block-goal-callout",
    name: "Khung Tầm nhìn & Mục tiêu (Goal Callout)",
    category: "Khung ghi chú",
    description: "Khung màu xanh lá Confluence dùng cho định hướng giải pháp hoặc kết quả kỳ vọng",
    iconName: "Target",
    htmlContent: `
<div style="background-color: #e3fcef; border-left: 4px solid #00875a; padding: 12px 16px; margin: 14px 0; border-radius: 4px;">
  <strong>🎯 TẦM NHÌN & KẾT QUẢ KỲ VỌNG:</strong> [Mô tả trạng thái mong đợi của doanh nghiệp sau khi triển khai...]
</div>
`
  },
  {
    id: "block-table-5whys",
    name: "Bảng Phân tích 5 Whys (5 Nguyên nhân Cốt lõi)",
    category: "Bảng biểu",
    description: "Cấu trúc 5 Whys dạng danh sách phân cấp bóc tách nguyên nhân gốc rễ",
    iconName: "HelpCircle",
    htmlContent: `
<ol style="line-height: 1.8; margin-left: 20px;">
  <li><strong>Tại sao triệu chứng bề mặt 1 xảy ra?</strong><br/>↳ [Học viên trả lời nguyên nhân trực tiếp...]</li>
  <li><strong>Tại sao nguyên nhân trên lại phát sinh?</strong><br/>↳ [Học viên phân tích bước 2...]</li>
  <li><strong>Tại sao bước 2 không được kiểm soát?</strong><br/>↳ [Học viên đào sâu quy trình hoặc hệ thống...]</li>
  <li><strong>Tại sao thiếu quy trình / công cụ phòng ngừa?</strong><br/>↳ [Học viên xem xét khía cạnh công nghệ hoặc chính sách...]</li>
  <li><strong>Tại sao chính sách / kiến trúc chưa được cập nhật?</strong><br/>↳ <strong>[NGUYÊN NHÂN GỐC RỄ]:</strong> [Xác định điểm mấu chốt cần giải quyết...]</li>
</ol>
`
  },
  {
    id: "block-table-raci",
    name: "Bảng Ma trận Trách nhiệm RACI (5 vai trò)",
    category: "Bảng biểu",
    description: "Bảng phân định R (Responsible), A (Accountable), C (Consulted), I (Informed)",
    iconName: "Users",
    htmlContent: `
<table style="width: 100%; border-collapse: collapse; margin: 14px 0;">
  <thead>
    <tr style="background-color: #f4f5f7; border-bottom: 2px solid #dfe1e6; text-align: left;">
      <th style="padding: 8px; border: 1px solid #dfe1e6;">Hoạt động BA / Phân tích</th>
      <th style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">Lead BA</th>
      <th style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">IT Lead</th>
      <th style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">Kho / Logistics</th>
      <th style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">Cửa hàng / POS</th>
      <th style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">Sponsor / PO</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #dfe1e6;">[Tên hoạt động 1]</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6; text-align: center; font-weight: bold; color: #0052cc;">R / A</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">C</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">C</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">I</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">A</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #dfe1e6;">[Tên hoạt động 2]</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6; text-align: center; font-weight: bold; color: #0052cc;">R</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">C</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">I</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">I</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6; text-align: center;">A</td>
    </tr>
  </tbody>
</table>
`
  },
  {
    id: "block-table-asis-tobe",
    name: "Bảng So sánh Hiện trạng (As-Is) & Tương lai (To-Be)",
    category: "Yêu cầu & Phân tích",
    description: "Bảng đối chiếu 2 cột làm nổi bật giá trị cải tiến",
    iconName: "GitCompare",
    htmlContent: `
<table style="width: 100%; border-collapse: collapse; margin: 14px 0;">
  <thead>
    <tr style="background-color: #f4f5f7; border-bottom: 2px solid #dfe1e6; text-align: left;">
      <th style="padding: 10px; border: 1px solid #dfe1e6; width: 50%;">Quy trình Hiện trạng (As-Is - Có vấn đề)</th>
      <th style="padding: 10px; border: 1px solid #dfe1e6; width: 50%;">Quy trình Cải tiến Đề xuất (To-Be)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 10px; border: 1px solid #dfe1e6; vertical-align: top; background-color: #fafbfc;">
        1. [Mô tả bước 1 trong hiện trạng...]<br/>
        2. [Bước 2 phát sinh nghẽn hoặc sai sót...]<br/>
        3. [Hậu quả dẫn đến chậm trễ hoặc hủy đơn...]
      </td>
      <td style="padding: 10px; border: 1px solid #dfe1e6; vertical-align: top; background-color: #f3f9f4;">
        1. [Bước 1 đã được tự động hóa...]<br/>
        2. [Bước 2 có cơ chế kiểm tra / khóa dữ liệu...]<br/>
        3. [Kết quả diễn ra tự động và gửi thông báo...]
      </td>
    </tr>
  </tbody>
</table>
`
  },
  {
    id: "block-table-moscow",
    name: "Bảng Phân loại Yêu cầu MoSCoW",
    category: "Yêu cầu & Phân tích",
    description: "Bảng phân loại mức độ ưu tiên Must, Should, Could, Won't Have",
    iconName: "ListFilter",
    htmlContent: `
<table style="width: 100%; border-collapse: collapse; margin: 14px 0;">
  <thead>
    <tr style="background-color: #f4f5f7; border-bottom: 2px solid #dfe1e6; text-align: left;">
      <th style="padding: 8px; border: 1px solid #dfe1e6; width: 100px;">Mã Yêu cầu</th>
      <th style="padding: 8px; border: 1px solid #dfe1e6; width: 120px;">Mức ưu tiên</th>
      <th style="padding: 8px; border: 1px solid #dfe1e6;">Mô tả Yêu cầu Nghiệp vụ</th>
      <th style="padding: 8px; border: 1px solid #dfe1e6; width: 200px;">Căn cứ / Lý do xếp loại</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 8px; border: 1px solid #dfe1e6;"><code>REQ-01</code></td>
      <td style="padding: 8px; border: 1px solid #dfe1e6;"><span style=\"background-color: #ffebe6; color: #de350b; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 11px;\">MUST HAVE</span></td>
      <td style="padding: 8px; border: 1px solid #dfe1e6;">[Hệ thống bắt buộc phải...]</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6;">[Nếu thiếu sẽ gây sập luồng kinh doanh]</td>
    </tr>
    <tr>
      <td style="padding: 8px; border: 1px solid #dfe1e6;"><code>REQ-02</code></td>
      <td style="padding: 8px; border: 1px solid #dfe1e6;"><span style=\"background-color: #deebff; color: #0747a6; padding: 2px 8px; border-radius: 3px; font-weight: bold; font-size: 11px;\">SHOULD HAVE</span></td>
      <td style="padding: 8px; border: 1px solid #dfe1e6;">[Hệ thống nên hỗ trợ...]</td>
      <td style="padding: 8px; border: 1px solid #dfe1e6;">[Nâng cao trải nghiệm người dùng]</td>
    </tr>
  </tbody>
</table>
`
  },
  {
    id: "block-table-gherkin",
    name: "Khung User Story BDD (Gherkin Given-When-Then)",
    category: "Yêu cầu & Phân tích",
    description: "Cấu trúc User Story tiêu chuẩn Agile kèm kịch bản kiểm thử hành vi BDD",
    iconName: "CheckSquare",
    htmlContent: `
<div style="background-color: #fafbfc; border: 1px solid #dfe1e6; border-radius: 6px; padding: 14px; margin: 14px 0;">
  <strong>User Story US-01:</strong> <em>Là một [Vai trò người dùng], tôi muốn [Hành động mong muốn], để [Giá trị mang lại].</em>
  <div style="background-color: #ffffff; border: 1px solid #dfe1e6; border-radius: 4px; padding: 10px; margin-top: 8px; font-size: 12px; font-family: Consolas, monospace;">
    <strong>Kịch bản BDD (Acceptance Criteria):</strong><br/>
    <strong>Given:</strong> [Điều kiện tiên quyết ban đầu...]<br/>
    <strong>When:</strong> [Hành động của người dùng xảy ra...]<br/>
    <strong>Then:</strong> [Kết quả hệ thống phải thực hiện...]<br/>
    <strong>And:</strong> [Hệ thống cập nhật dữ liệu / gửi thông báo...]
  </div>
</div>
`
  }
];

export const JIRA_DOC_TEMPLATES: JiraDocTemplate[] = [];
// Document templates DEL-01..DEL-08 are stored in DB and loaded via GET /api/artifact-templates.
