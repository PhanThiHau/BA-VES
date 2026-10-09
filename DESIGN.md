# Design System: BA-VES Operations Studio

## 1. Visual Theme & Atmosphere
Một không gian đào tạo BA sáng, tự tin và có nhịp điệu như một operations studio hiện đại. Mật độ cân bằng (5/10), bất đối xứng có kiểm soát (6/10), chuyển động CSS nhẹ (5/10). Nội dung nghiệp vụ luôn là trung tâm; trang có chiều sâu nhưng không phô trương.

## 2. Color Palette & Roles
- **Cloud Canvas** (#F3F7FA) — nền ứng dụng chính.
- **Pure Surface** (#FFFFFF) — card, sidebar và vùng tương tác.
- **Deep Navy Ink** (#132D49) — tiêu đề và nội dung ưu tiên cao.
- **Steel Copy** (#667D93) — mô tả và metadata.
- **Mist Border** (#D9E4EC) — đường phân tách cấu trúc.
- **Harbor Blue** (#2F638C) — màu nhấn duy nhất cho CTA, trạng thái active và focus.

## 3. Typography Rules
- **Display:** Segoe UI Variable Display / Aptos Display, tracking âm nhẹ, phân cấp bằng weight.
- **Body:** Segoe UI Variable / Aptos, line-height thoáng, nội dung mô tả tối đa khoảng 65 ký tự mỗi dòng.
- **Numbers:** Cascadia Mono cho số liệu dashboard khi cần nhấn mạnh.
- Không dùng serif, Inter hoặc chữ đen tuyệt đối.

## 4. Component Stylings
- **Buttons:** bo 14px, active dịch xuống 1px, transition có trọng lượng; không glow.
- **Cards:** bo 22–28px, viền sáng, shadow nhuộm xanh nhẹ; hover chỉ nâng 3–4px.
- **Inputs:** nền trắng, label rõ, focus ring xanh mờ.
- **Badges:** pill nhỏ, tương phản thấp, trạng thái đọc được bằng cả màu và chữ.
- **Empty states:** icon, mô tả và hành động khôi phục rõ ràng.

## 5. Layout Principles
Bố cục grid-first, dashboard dùng nhịp bento bất đối xứng thay cho các hàng ba card giống nhau. Nội dung giới hạn 1540px. Dưới 768px mọi khối trở về một cột, không tạo cuộn ngang ngoài vùng filter chủ ý.

## 6. Motion & Interaction
Danh sách xuất hiện theo cascade ngắn. Hover/active chỉ dùng transform và opacity. Active workspace có pulse rất nhẹ. Tôn trọng prefers-reduced-motion.

## 7. Anti-Patterns
Không emoji, neon, gradient chữ, pure black, serif, glow tím, card ba cột đồng đều, nội dung chồng lấn, CTA dư thừa hoặc animation gây mất tập trung.
