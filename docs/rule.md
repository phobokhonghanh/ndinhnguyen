# Quy Tắc AI Agent Và Coding

## 1. Tài Liệu Bắt Buộc

- Luôn đọc root `AGENTS.md` như cổng vào ngữ cảnh repo.
- Trước khi sửa code, đọc phần liên quan trong `docs/dev.md` để nắm bối cảnh dự án, cấu trúc, lệnh vận hành và workflow hiện tại.
- Khi yêu cầu chỉ liên quan một khu vực nhỏ, chỉ cần đọc thêm phần liên quan trong `docs/dev.md` và source/config gần nhất để tiết kiệm token.

## 2. Cảnh Báo Next.js

Dự án dùng Next.js 16 với nhiều thay đổi về API, convention và cấu trúc file. Trước khi viết hoặc sửa code liên quan đến Next.js, agent phải đọc tài liệu phù hợp trong `node_modules/next/dist/docs/` và không được giả định hành vi theo các phiên bản cũ.

## 3. Nguyên Tắc Làm Việc

- Đọc logic hiện có, config liên quan và component gần nhất trước khi sửa.
- Nếu yêu cầu nghiệp vụ còn mơ hồ, hỏi lại trước khi chọn hướng có ảnh hưởng lớn.
- Ưu tiên thay đổi nhỏ, đúng module, đúng ranh giới trách nhiệm.
- Không bỏ qua lỗi lint, format, typecheck hoặc build nếu chúng xuất hiện trong phạm vi thay đổi.
- Sau thay đổi lớn về code, kiến trúc hoặc quy trình, cập nhật tài liệu trong `docs/` nhưng phải bảo tồn ngữ cảnh nền tảng và roadmap hiện có.

## 4. Chuẩn Code

- TypeScript first: không dùng `any`; định nghĩa `type`/`interface` rõ ràng cho props, data và API.
- Dùng Functional Components và Arrow Functions cho React components.
- Ưu tiên Server Components; chỉ dùng Client Components khi cần state, effect, event handler hoặc browser API.
- Đặt tên component theo PascalCase/CamelCase phù hợp, ví dụ `DataCard.tsx`.
- Logic phức tạp cần comment ngắn gọn về lý do; các hàm quan trọng trong `src/lib` nên có JSDoc.

## 5. UI, Performance Và Accessibility

- Không tạo lại component đã có trong `src/components/ui`; ưu tiên shadcn/ui và các primitive hiện có.
- Feature components nằm trong `src/components/features`; shared layout nằm trong `src/components/layout`; provider nằm trong `src/components/providers`.
- Tối ưu ảnh bằng `next/image` khi dùng ảnh trong UI.
- Hạn chế re-render không cần thiết ở Client Components.
- Dùng semantic HTML và thuộc tính accessibility phù hợp như `main`, `section`, `header`, `aria-label`.

## 6. Chống Trùng Lặp Và Phình Code

- Trước khi tạo file, component, hook hoặc helper mới, phải tìm trong `src/components`, `src/hooks`, `src/lib` và các feature liên quan để xem đã có logic tương tự chưa.
- Không copy/paste logic sang module mới nếu có thể tái sử dụng, tách helper nhỏ hoặc mở rộng module hiện có một cách rõ ràng.
- Không viết chồng chéo trách nhiệm: component chỉ nên render/compose UI, hook quản lý logic UI tái sử dụng, `src/lib` chứa utility thuần, provider chứa context/cấu hình runtime.
- Tách data, business logic và code render khi dữ liệu hoặc nghiệp vụ có khả năng thay đổi thường xuyên. Component `.tsx` nên ưu tiên nhận/import data đã chuẩn hóa và tập trung render UI; data tĩnh theo feature nên đặt ở file riêng gần feature đó.
- Thiết kế data theo hướng có thể scale: nếu một feature có nhiều loại dữ liệu có thể tăng dần như skills, chứng chỉ, kinh nghiệm, nav items hoặc badges, đặt chúng trong thư mục `data/` của feature và dùng type rõ ràng. Không nhét data dài vào component chỉ vì hiện tại mới có ít item.
- Chỉ thêm abstraction khi nó giảm lặp thật sự, làm rõ luồng dữ liệu hoặc giảm độ phức tạp bảo trì.
- Nếu có hai cách triển khai, chọn cách ít tăng diện tích code hơn nhưng vẫn rõ ràng và dễ test.
- Khi xóa/thay thế logic cũ, đảm bảo không để lại code chết, import thừa, key i18n thừa hoặc component không còn được dùng.

## 7. i18n Và Nội Dung

- Mỗi UI text mới phải có key tương ứng trong `src/messages/en.json` và `src/messages/vi.json`.
- Không hard-code text hiển thị trong component nếu text đó cần hiển thị cho người dùng.
- Khi thêm route localized, đảm bảo phù hợp cấu trúc `[locale]` và cấu hình `src/i18n/`.

## 8. Vận Hành Và Commit

- Lệnh chạy dự án, cấu hình, commit workflow và roadmap được ghi trong `docs/dev.md`.
- Commit phải theo Conventional Commits.
- Khi làm việc với terminal output dài, ưu tiên dùng RTK (`rtk`) để tiết kiệm token nếu không cần raw output đầy đủ.
