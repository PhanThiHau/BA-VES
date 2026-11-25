# HỆ THỐNG THIẾT KẾ: BA-VES OPERATIONS STUDIO

## 1. Triết lý Thiết kế (Design Philosophy)
- Không gian điều hành hiện đại, tinh giản, sắc sảo (Clean Modern SaaS Studio).
- Tôn vinh dữ liệu và nội dung nghiệp vụ: Tối ưu cho việc đọc văn bản đặc tả, biểu đồ số liệu, phân tích mô phỏng.
- Sự tương phản tinh tế: Viền mảnh sắc nét (Hairline borders), đổ bóng nhuộm sắc nhẹ, viền bo hiện đại (14px - 24px).
- Tuyệt đối không dùng hiệu ứng sặc sỡ gây mỏi mắt hay animation cồng kềnh.

## 2. Bảng màu Chuẩn (Color Tokens)
- **Cloud Canvas (`#F3F7FA`):** Nền chính của toàn bộ ứng dụng, tạo cảm giác nhẹ nhàng, thông thoáng.
- **Pure Surface (`#FFFFFF`):** Mặt phẳng nội dung, thẻ (card), sidebar, modals.
- **Deep Navy Ink (`#102A43` / `#0B1F33`):** Tiêu đề chính, văn bản quan trọng cấp cao.
- **Steel Slate (`#60758A`):** Nhãn phụ, mô tả, breadcrumbs, icon trung tính.
- **Mist Border (`#D8E5EE` / `#E2EDF5`):** Đường kẻ phân chia và viền thẻ mảnh dẻ, sắc nét.
- **Harbor Blue (`#2F638C`):** Màu nhấn chủ đạo cho liên kết, trạng thái tương tác và chỉ số chính.
- **Warm Brass Gold (`#C58B52`):** Điểm xao xuyến sang trọng dành cho danh hiệu, tiêu chuẩn BABOK®, AI capabilities.
- **Role Accents:**
  + **Learner:** Ocean Blue / Navy (`#2F638C`)
  + **Instructor:** Warm Brass / Gold Navy (`#C58B52`)
  + **Expert:** Emerald / Teal (`#0D9488` / `#059669`) — Biểu trưng cho sự thẩm định, chuẩn xác và uy tín chuyên môn.
  + **Admin:** Royal Indigo / Violet (`#7C3AED` / `#6366F1`) — Biểu trưng cho quyền lực hệ thống tối cao và kiểm toán an ninh.

## 3. Kiểu chữ (Typography Hierarchy)
- **Display Font:** Manrope / Segoe UI Variable Display (font-display: 600, 700, 800) với tracking âm nhẹ (-0.02em).
- **Body Font:** Inter / Segoe UI Variable / Aptos (font-sans: 400, 500, 600) với line-height từ 1.5 đến 1.6.
- **Code & Metrics:** Cascadia Mono / ui-monospace cho các số liệu thống kê dashboard, mã định danh kịch bản (INV-2026-014), token counter.

## 4. Thành phần Giao diện Chuẩn (Component Rules)
- **Cards:** Bo góc `rounded-2xl` (16px) hoặc `rounded-[20px]`, viền mảnh `border border-slate/15`, nền `bg-white`, shadow mềm `shadow-[0_4px_20px_rgba(16,42,67,0.03)]`.
- **Buttons:**
  + Primary: Nền `bg-navy`, chữ trắng, hover `bg-navy-deep`, active lún nhẹ `translate-y-[1px]`.
  + Accent: Nền `bg-brass`, chữ trắng/navy, hiệu ứng sang trọng.
  + Secondary / Outline: Nền trắng, viền `border-slate/20`, chữ navy, hover `bg-offwhite`.
- **Badges:** Bo tròn pill `rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider`.
- **Tables:** Header có nền `bg-offwhite/80`, chữ in hoa cỡ nhỏ `text-[10px] font-bold text-slate tracking-wider`, dòng phân chia `border-b border-slate/10`, hover highlight `hover:bg-slate-50/70`.
- **States:** Mọi danh sách và bảng phải luôn có đầy đủ trạng thái Loading (Skeleton / Spinner), Empty State (Icon minh họa tinh tế, mô tả và nút thao tác khôi phục), Error State (Cảnh báo kèm nút Thử lại).
