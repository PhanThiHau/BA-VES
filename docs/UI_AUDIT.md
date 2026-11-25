# BÁO CÁO AUDIT GIAO DIỆN HIỆN TẠI & KẾ HOẠCH NÂNG CẤP UI/UX

## 1. Tổng quan Dự án (Project Context)
- **Tên dự án:** BA-VES (Business Analyst Virtual Enterprise Simulation)
- **Kiến trúc:** Web App (React 19 + TypeScript + Vite + Tailwind CSS v4) + Desktop App (Electron).
- **Backend liên kết:** ASP.NET Core Web API (Catalog, Scenarios, Assessments, Simulation, Users, Cohorts, Bookings, Commerce).
- **Nguyên tắc cốt lõi:** Nâng cấp UI/UX cao cấp (Premium Operations Studio), giữ nguyên 100% nghiệp vụ, API, DTO, data contracts hiện có.

---

## 2. Kết quả Audit Hiện trạng

### A. Role Quản trị viên (Admin Portal)
- **Hiện trạng:** `src/features/admin/AdminPage.tsx`
- **Các phân hệ chính:**
  1. `overview`: Thống kê hệ thống, người dùng, ngành học, BABOK v3 tasks, lớp học.
  2. `users`: Bảng tài khoản API, tìm kiếm, lọc vai trò, toggle trạng thái Active/Suspended, cập nhật Roles (RBAC).
  3. `domains`: Danh mục Ngành (Industries) và Ứng dụng nghiệp vụ (Applications).
  4. `babok`: 6 Knowledge Areas của BABOK® v3, danh sách nhiệm vụ và tiêu chí năng lực.
  5. `ai`: Quản lý mô hình LLM (Gemini, Claude, GPT, DeepSeek), token pricing, latency, tham số temperature.
  6. `audit`: Nhật ký bảo mật, địa chỉ IP, hành động và severity.
- **Vấn đề UI/UX cần cải tiến:**
  - Bố cục thiếu khoảng thở, chưa phân cấp rõ ràng theo phong cách SaaS Operations Studio.
  - Các bảng dữ liệu (Users, Tasks, Audit) còn thô, thiếu filter chips tương tác, phân trang đẹp mắt và visual indicators.
  - Modal phân quyền (Role Modal) còn đơn giản, dùng checkbox thô và `alert()` trình duyệt.
  - Cần nâng cấp hệ thống thẻ thống kê (Metric Cards), typography Cascadia Mono cho số liệu, badge trạng thái sang trọng.

### B. Role Giảng viên (Instructor Portal)
- **Hiện trạng:** `src/features/instructor/InstructorPage.tsx` cùng các sub-components.
- **Các phân hệ chính:**
  1. `overview`: Thống kê tiến độ giảng dạy, lớp học đang mở, bài tập sắp đến hạn.
  2. `authoring`: Thiết kế đề bài, phiên bản kịch bản, nhân vật AI (Personas), kho tri thức (Knowledge base), biến cố phát sinh (Events), chuẩn hóa Rubric và Mẫu tài liệu (SRS/BRD/User Story).
  3. `live`: Quan sát hội thoại trực tiếp giữa học viên và tác tử AI theo thời gian thực.
  4. `review`: Hàng đợi thẩm định hồ sơ giải pháp (Dossiers), chấm điểm rubric, hiệu chuẩn so với điểm AI sơ bộ (`ReviewCaseDossierModal`).
  5. `cohorts`: Quản trị lớp học, thành viên lớp (`CohortMembersModal`), giao bài tập, bảng điểm lớp (`AssignmentGradebookModal`).
  6. `analytics`: Phân tích ma trận năng lực BABOK v3, biểu đồ radar học viên.
- **Vấn đề UI/UX cần cải tiến:**
  - Thanh chuyển tab và header của giảng viên cần sắc sảo hơn, đồng bộ màu nhận diện (Slate / Deep Navy / Brass accent).
  - Bố cục các component con trong `AuthoringTab`, `ReviewModerationTab`, `LiveSessionsTab` cần chuẩn hóa spacing (24-32px), bo góc (16-24px), viền mảnh tinh tế (`border-slate/15`).
  - Nâng cấp trải nghiệm duyệt bài nộp: hiển thị rõ tiêu chí BABOK, thanh trượt điểm số mượt mà, phản hồi giàu ngữ cảnh.

### C. Role Chuyên gia BA (Expert Portal - Hội đồng Đánh giá & Mentor)
- **Hiện trạng:**
  - Chưa được định nghĩa thành một Role độc lập hạng nhất trong `AppRole` và `Sidebar.tsx`.
  - Nghiệp vụ thực tế đã có sẵn trong hệ thống:
    + Thẩm định hồ sơ bài nộp học viên (`ReviewCaseDossierModal.tsx`, `HumanReviewDto`, `expertFinalScore`).
    + Tiếp nhận và xử lý lịch hẹn tư vấn 1-on-1 (`bookingService.getExpertBookings()`, `BookingChatRoomModal.tsx`, `expertSummaryNote`).
    + Đóng góp chuẩn hóa Rubric thực chiến doanh nghiệp.
  - Trang chọn vai trò `RoleSelectionPage.tsx` mới chỉ có 3 card (Learner, Instructor, Admin), thiếu hoàn toàn card cho Expert.
- **Giải pháp nâng cấp:**
  - Bổ sung `"expert"` vào `AppRole` và cấu hình vai trò riêng biệt trong `roleConfig` với visual sang trọng (Huy hiệu Chuyên gia, tông màu Amber/Emerald danh giá).
  - Thêm thẻ chọn vai trò Chuyên gia BA trong `RoleSelectionPage.tsx`.
  - Xây dựng không gian làm việc chuyên biệt `ExpertPage.tsx`:
    + Tab 1: **Hàng đợi Thẩm định Hồ sơ (Dossier Review Queue)** — Chấm điểm hồ sơ BABOK với tiêu chuẩn cao cấp.
    + Tab 2: **Lịch hẹn Cố vấn 1-on-1 (Consultation Schedule)** — Quản lý lịch hẹn, xác nhận/hoàn thành và phòng trao đổi trực tiếp với học viên.
    + Tab 3: **Tiêu chuẩn & Rubric Chuyên gia (Standards & Calibration)** — Tham chiếu chuẩn mực thực hành quốc tế.

### D. Ứng dụng Desktop (Electron Integration)
- **Hiện trạng:**
  - Electron cấu hình trong `electron/main.js` và `electron/preload.js`.
  - Đã có CSS kéo thả `.app-header-drag` trong `Header.tsx`.
  - Chưa có thanh điều khiển cửa sổ tùy biến cao cấp (Minimize, Maximize/Restore, Close) đồng điệu với design system, chưa có badge nhận diện môi trường Desktop App, chưa tận dụng tối đa không gian màn hình ứng dụng desktop.
- **Giải pháp nâng cấp:**
  - Mở rộng `preload.js` an toàn với IPC (`minimizeWindow`, `maximizeWindow`, `closeWindow`, `isMaximized`).
  - Xử lý IPC trong `electron/main.js` tuân thủ nghiêm ngặt bảo mật (`contextIsolation: true`, `nodeIntegration: false`).
  - Bổ sung Desktop Title Bar và điều khiển cửa sổ cao cấp vào `Header.tsx` (chỉ hiển thị khi chạy dưới môi trường Electron, hiển thị trạng thái kết nối và phím tắt Desktop).

---

## 3. Lộ trình Triển khai Chi tiết

1. **Giai đoạn chuẩn bị & Token:** Cập nhật `docs/DESIGN_SYSTEM.md`, hoàn thiện types `AppRole`.
2. **Giai đoạn Layout & Navigation:** Nâng cấp `Sidebar.tsx`, `Header.tsx`, `RoleSelectionPage.tsx`.
3. **Giai đoạn Admin Portal:** Tái thiết kế toàn diện `AdminPage.tsx` (Overview, RBAC User Manager, Domains, BABOK, AI Token, Audit Logs) với UI/UX chuẩn Modern Operations Studio.
4. **Giai đoạn Instructor Portal:** Tinh chỉnh và đồng bộ hoá `InstructorPage.tsx` cùng các tabs (Authoring, Review, Live, Cohorts, Analytics).
5. **Giai đoạn Expert Portal:** Xây dựng màn hình `ExpertPage.tsx` hội tụ đầy đủ chức năng thẩm định Dossier và tư vấn 1-on-1.
6. **Giai đoạn Desktop App:** Nâng cấp `preload.js`, `main.js` và Header controls cho Electron.
7. **Kiểm thử & Nghiệm thu:** Run build TypeScript/Vite, kiểm tra console, kiểm thử tương tác và xác thực hoàn thiện.
