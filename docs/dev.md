# Tài Liệu Phát Triển Dự Án

## 1. Tổng Quan

Dự án là ứng dụng Next.js App Router được xây dựng theo hướng bền vững, dễ mở rộng và dễ bảo trì. Mục tiêu là giữ trải nghiệm người dùng (UX), trải nghiệm lập trình (DX) và chất lượng mã nguồn ổn định khi dự án lớn dần.

Tài liệu này là nơi tập trung bối cảnh dự án, cấu hình, lệnh vận hành, commit workflow và roadmap. Quy tắc coding/AI agent nằm trong `docs/rule.md`; root `AGENTS.md` chỉ là cổng vào trỏ tới các tài liệu trong `docs/`.

## 2. Stack Hiện Tại

- **Next.js 16.2.4**: App Router, cấu hình qua `next.config.ts`.
- **React 19.2.4** và **TypeScript**: nền tảng UI và ngôn ngữ chính.
- **Yarn 4.9.2**: package manager, linker `node-modules`.
- **Tailwind CSS v4**: styling qua `src/app/globals.css` và PostCSS.
- **shadcn/ui**: UI primitives trong `src/components/ui`, cấu hình tại `components.json`.
- **next-intl 4.9.1**: i18n App Router, cấu hình trong `src/i18n/`.
- **next-themes**: Light/Dark/System theme qua providers.
- **OpenNext Cloudflare**: build/preview/deploy Cloudflare qua `@opennextjs/cloudflare`.
- **Analytics**: Google Analytics, Google Tag Manager và Microsoft Clarity qua biến môi trường public khi cần.

## 3. Cấu Trúc Dự Án

```text
.
├── src/
│   ├── app/                  # App Router, root layout, localized routes
│   ├── app/[locale]/         # Routes theo ngôn ngữ: /en, /vi
│   ├── components/
│   │   ├── ui/               # UI primitives/shared components
│   │   ├── features/         # Components theo tính năng
│   │   ├── layout/           # Layout components
│   │   └── providers/        # Theme/app providers
│   ├── hooks/                # Custom hooks
│   ├── i18n/                 # next-intl routing/request config
│   ├── lib/                  # Shared utilities
│   ├── messages/             # en.json, vi.json
│   └── proxy.ts              # Proxy/middleware entry theo cấu trúc Next.js hiện tại
├── docs/
│   ├── dev.md                # Tài liệu phát triển và vận hành
│   ├── rule.md               # Quy tắc AI/coding
│   └── fix.md                # Log/ghi chú lỗi hydration
├── AGENTS.md                 # Cổng vào ngữ cảnh, trỏ sang docs/rule.md và docs/dev.md
├── public/                   # Static assets
├── infra/                    # Cấu hình hạ tầng bổ sung
├── next.config.ts            # Next.js + next-intl plugin
├── open-next.config.ts       # OpenNext Cloudflare config
├── eslint.config.mjs         # ESLint flat config
├── postcss.config.mjs        # PostCSS/Tailwind v4
└── package.json              # Scripts và dependencies
```

## 4. i18n, Theme Và Runtime Config

- Locales hiện có: `en`, `vi`.
- Default locale: `en`.
- Routes localized chạy dưới `/en` và `/vi`.
- Nội dung dịch nằm trong `src/messages/en.json` và `src/messages/vi.json`.
- `next-intl` request config nằm tại `src/i18n/request.ts`; routing helper nằm tại `src/i18n/routing.ts`.
- `next.config.ts` dùng `next-intl/plugin` và có `allowedDevOrigins` cho IP nội bộ.
- Theme được quản lý qua `next-themes` và provider trong `src/components/providers/`.
- Analytics env khi dùng:
  - `NEXT_PUBLIC_GA_ID`
  - `NEXT_PUBLIC_GTM_ID`
  - `NEXT_PUBLIC_CLARITY_ID`

## 5. Lệnh Vận Hành

Cài dependencies:

```bash
yarn install
```

Chạy dev:

```bash
yarn dev
yarn dev:turbo
```

Build và start:

```bash
yarn build
yarn start
```

Kiểm tra và định dạng:

```bash
yarn lint
yarn format
yarn depcheck
```

OpenNext Cloudflare:

```bash
yarn preview
yarn deploy
```

## 6. Chất Lượng Code Và Tooling

- **ESLint**: `eslint.config.mjs`, lệnh `yarn lint`.
- **Prettier**: `.prettierrc`, lệnh `yarn format`.
- **Stylelint**: `.stylelintrc.json`.
- **Depcheck**: lệnh `yarn depcheck`.
- **Husky**: quản lý Git hooks.
- **lint-staged**: chạy checks trên staged files trước commit.
- **Commitlint**: kiểm tra commit message theo Conventional Commits.
- Các thư mục build/cache như `.next/`, `.open-next/`, `.wrangler/`, `.yarn/` được ignore trong ESLint.

## 7. Commit Workflow

Dự án dùng Conventional Commits:

```text
<type>(<scope>): <description>
```

Types thường dùng:

- `feat`: thêm tính năng mới.
- `fix`: sửa lỗi.
- `docs`: thay đổi tài liệu.
- `style`: thay đổi format/spacing, không đổi logic.
- `refactor`: sửa cấu trúc code không thêm tính năng/sửa bug.
- `perf`: cải thiện hiệu năng.
- `test`: thêm hoặc sửa test.
- `build`: thay đổi build system hoặc dependency.
- `ci`: thay đổi CI config.
- `chore`: việc bảo trì nhỏ khác.

Ví dụ:

```text
feat(ui): add profile card
fix(styles): fix responsive header
docs: update docs/dev.md
chore(config): update lint-staged rules
```

Khi commit:

1. `pre-commit` chạy `lint-staged` cho staged files.
2. `commit-msg` chạy `commitlint` để kiểm tra format message.

## 8. RTK

RTK (Rust Token Killer) đã được cài global cho Codex và nên được dùng khi đọc output terminal dài.

Lệnh hữu ích:

```bash
rtk --version
rtk verify
rtk gain
rtk ls docs
rtk grep "pattern" src
rtk git status
```

Nếu cần raw output đầy đủ, dùng lệnh gốc hoặc `rtk proxy <cmd>`.

## 9. Roadmap

1. Tích hợp Unit Test bằng Jest hoặc Vitest.
2. Tích hợp E2E Test bằng Playwright.
3. Chuẩn hóa Design Token cho branding và theme.
