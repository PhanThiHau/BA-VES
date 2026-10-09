# BA-VES Frontend

Frontend cho **BA-VES — Business Analysis Virtual Enterprise Simulation**. Ứng dụng mô phỏng môi trường doanh nghiệp để learner thực hành Business Analysis với stakeholder agents, evidence, requirements, BA artifacts và đánh giá năng lực.

## Công nghệ

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Lucide React

## Chạy dự án

Yêu cầu Node.js 20 trở lên.

```bash
npm install
npm run dev
```

Mặc định ứng dụng chạy tại `http://localhost:5173`.

## Build production

```bash
npm run build
npm run preview
```

Kết quả build nằm trong thư mục `dist/`.

## Cấu trúc source

```text
src/
├── components/       # Component giao diện dùng chung
├── constants/        # Route, catalog và seed data
├── contexts/         # Global React state
├── features/         # Các màn hình theo chức năng nghiệp vụ
├── hooks/            # Custom React hooks
├── routes/           # Điều phối màn hình
├── services/         # API client và mock service
├── styles/           # Global styles và Tailwind
├── types/            # TypeScript models
├── utils/            # Helper functions
├── App.tsx           # Application root
└── main.tsx          # Vite entry point
```

## Nhóm chức năng

- Landing page và lựa chọn role
- Learner dashboard, domain và application catalog
- Scenario planning và stakeholder simulation
- Analysis, confirmation và traceability
- BA artifact submission
- Assessment và competency profile
- Instructor workspace

Hiện tại giao diện sử dụng seed data và mock service. Khi xây dựng backend, có thể thay nội dung trong `src/services/` bằng API thật mà không cần thay đổi cấu trúc giao diện.
