# Deploy Frontend

## Kiến trúc

Dự án được tách thành hai Git repository và hai Cloudflare deployment:

- Frontend: Next.js static export, deploy thư mục `out` lên Cloudflare Pages.
- Backend: FastAPI chạy trên Cloudflare Python Workers, cung cấp REST API và
  truy cập D1.

R2 không được sử dụng. Frontend không giữ D1 binding, secret hoặc server
runtime. Backend không phục vụ giao diện.

Backend được quản lý độc lập và không nằm trong workspace hoặc Git tree của
repository frontend này.

## Frontend Pages

Tạo `.env.local` từ `.env.example`:

```bash
NEXT_PUBLIC_API_URL=https://api.<account>.workers.dev
```

Kiểm tra và build:

```bash
yarn lint
yarn build
```

Cấu hình Cloudflare Pages:

- Build command: `yarn build`
- Build output directory: `out`
- Environment variable: `NEXT_PUBLIC_API_URL`

File `public/_redirects` chuyển `/` sang `/en/`. Các route localized được tạo
tĩnh tại build time và dùng trailing slash để refresh trực tiếp trên Pages.

## Python Worker API

Backend được cài đặt, migrate và deploy theo tài liệu trong repository backend.
Repository frontend chỉ cần URL public của API qua `NEXT_PUBLIC_API_URL`.

API dùng Bearer token:

```text
Authorization: Bearer <ADMIN_TOKEN>
```

Backend production phải cho phép chính xác origin của Cloudflare Pages. Khi
chạy local, frontend mặc định dùng `http://localhost:3000`.

## API

- `GET /health`
- `GET /api/bookmarks?q=&categoryId=`
- `POST /api/bookmarks`
- `PUT /api/bookmarks/{id}`
- `DELETE /api/bookmarks/{id}`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

Mọi response nghiệp vụ có dạng:

```json
{
  "ok": true,
  "code": "ok",
  "data": {}
}
```
