# Deploy Cloudflare Workers và D1

## 1. Kết luận cho repo này

Repo `simple-skill` là ứng dụng Next.js 16 SSR/App Router, đang được cấu hình để deploy bằng OpenNext Cloudflare lên **Cloudflare Workers**, không phải static Cloudflare Pages thuần. Theo docs Cloudflare, Next.js full-stack/SSR nên chạy qua Workers với OpenNext adapter; Pages guide cho Next.js hiện chỉ phù hợp static export.

Tài sản build của Next.js được OpenNext ghi vào `.open-next/assets` và deploy thông qua binding `ASSETS` trong `wrangler.jsonc`. Repo hiện **chưa dùng R2 bucket** để deploy; nếu sau này cần lưu media/object riêng thì có thể bổ sung R2 sau.

Nguồn chính:

- Cloudflare Next.js on Workers: https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- Cloudflare Pages Next.js static site: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/
- Cloudflare Pages bindings và D1: https://developers.cloudflare.com/pages/functions/bindings/
- Cloudflare D1 Wrangler commands: https://developers.cloudflare.com/d1/wrangler-commands/

## 2. Hiện trạng cấu hình

Stack deploy trong repo:

- `package.json`
  - `yarn preview`: `opennextjs-cloudflare build && opennextjs-cloudflare preview`
  - `yarn deploy`: `opennextjs-cloudflare build && opennextjs-cloudflare deploy`
- `wrangler.jsonc`
  - Worker name: `simple-skill`
  - Entry: `.open-next/worker.js`
  - Assets: `.open-next/assets`, binding `ASSETS`
  - Compatibility flag: `nodejs_compat`
  - D1 binding: `BOOKMARKS_DB`
- `open-next.config.ts`
  - Cloudflare OpenNext override cho default worker và middleware.
- `migrations/0001_create_bookmarks.sql`
  - Tạo bảng `categories`, `bookmarks` và các index liên quan.

Biến môi trường ứng dụng cần có:

- `ADMIN_TOKEN`: token quản trị cho trang bookmarks.
- `APP_TIME_ZONE`: tùy chọn, mặc định `Asia/Ho_Chi_Minh`.
- `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_CLARITY_ID`: tùy chọn cho analytics.

## 3. Chuẩn bị Cloudflare

Đăng nhập Wrangler:

```bash
yarn wrangler login
```

Kiểm tra Wrangler:

```bash
yarn wrangler --version
```

Repo đang dùng `wrangler` trong devDependencies, nên ưu tiên `yarn wrangler ...` thay vì cài global.

Với account Cloudflare mới, cần hoàn tất onboarding `workers.dev` một lần trong Dashboard trước khi publish Worker public. Nếu `yarn deploy` báo `You need to register a workers.dev subdomain`, mở link onboarding mà Wrangler in ra hoặc vào Workers & Pages trong Dashboard để claim subdomain. Không cần bật R2 nếu dự án chưa dùng bucket.

## 4. D1 cho bookmarks

Repo đã bind D1 `BOOKMARKS_DB` tới database `skill` trong `wrangler.jsonc`:

```text
database_name: skill
database_id: 46ef5404-0408-43af-95dc-cd664f8629cd
```

Chạy migration local khi preview/dev cần DB local:

```bash
yarn wrangler d1 migrations apply skill --local
```

Chạy migration remote trước khi deploy production:

```bash
yarn wrangler d1 migrations apply skill --remote
```

Nếu cần tạo lại database ở account khác, chạy `yarn wrangler d1 create skill`, sau đó cập nhật `database_id` trong `wrangler.jsonc`.

## 5. Cấu hình secrets và vars

Set secret quản trị:

```bash
yarn wrangler secret put ADMIN_TOKEN
```

Nếu cần set timezone production:

```bash
yarn wrangler secret put APP_TIME_ZONE
```

Với analytics public env, có thể cấu hình trong dashboard Workers hoặc thêm vào `vars` của `wrangler.jsonc` nếu giá trị không nhạy cảm:

```jsonc
"vars": {
  "APP_TIME_ZONE": "Asia/Ho_Chi_Minh",
  "NEXT_PUBLIC_GA_ID": "",
  "NEXT_PUBLIC_GTM_ID": "",
  "NEXT_PUBLIC_CLARITY_ID": ""
}
```

Không đưa `ADMIN_TOKEN` vào `vars`, hãy dùng secret.

## 6. Preview gần production

Chạy preview bằng workerd/Wrangler runtime:

```bash
yarn preview
```

Cloudflare docs nhấn mạnh `next dev` chạy trong Node.js, còn deployment thực tế chạy trên Workers `workerd`, nên `yarn preview` là bước quan trọng trước deploy.

Kiểm tra nhanh:

- Route `/en` và `/vi`.
- Route bookmarks: `/en/bookmarks` hoặc `/vi/bookmarks`.
- Token bookmarks dùng `ADMIN_TOKEN`.
- D1 có đủ bảng `categories` và `bookmarks`.

## 7. Deploy

Đảm bảo đã build/lint trước:

```bash
yarn lint
yarn build
```

Kiểm tra deploy dry-run:

```bash
yarn deploy:dry-run
```

Deploy lên Cloudflare Workers:

```bash
yarn deploy
```

Lệnh trên sẽ build OpenNext và deploy Worker `simple-skill`. Sau deploy, Cloudflare cung cấp domain `*.workers.dev`; custom domain cấu hình trong dashboard Workers & Pages của Cloudflare.

Nếu account chưa có `workers.dev` subdomain, deploy có thể upload Worker version thành công nhưng chưa publish ra URL public. Khi đó claim subdomain trong Dashboard rồi chạy lại `yarn deploy`.

## 8. Nếu muốn deploy qua Cloudflare Pages

Chỉ nên dùng Cloudflare Pages static guide nếu dự án chuyển sang static export. Khi đó cần:

- Cấu hình Next.js static export.
- Build command: `npx next build` hoặc tương đương với Yarn.
- Build output directory: `out`.

Với hiện trạng repo này, static Pages không phù hợp vì:

- Có Server Actions và server-side bookmark workflow.
- Dùng `getCloudflareContext` để lấy D1 binding.
- Cần runtime Workers cho OpenNext.

## 9. Checklist production

- `wrangler.jsonc` đã bind `BOOKMARKS_DB` tới database `skill`.
- Account đã claim `workers.dev` subdomain hoặc đã cấu hình custom route/domain.
- Đã chạy `yarn wrangler d1 migrations apply skill --remote`.
- Đã set `ADMIN_TOKEN` bằng Wrangler secret.
- Đã chạy `yarn preview` và test bookmarks.
- Đã chạy `yarn deploy:dry-run`.
- Đã chạy `yarn deploy`.
