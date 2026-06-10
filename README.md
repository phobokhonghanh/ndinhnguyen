# Nguyen Dinh Nguyen

> _Personal Website & Portfolio_

![Next.js](https://img.shields.io/badge/Next.js-16.2.4-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=flat-square&logo=react&logoColor=0B1F2A) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![Yarn](https://img.shields.io/badge/Yarn-4.9.2-2C8EBB?style=flat-square&logo=yarn&logoColor=white) ![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=flat-square&logo=cloudflarepages&logoColor=white)

---

## Routes

| Route                   | Type                     | Description                                                                                  |
| ----------------------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| `/`                     | Redirect                 | Redirects to `/en/` on Cloudflare Pages using `_redirects`.                                  |
| `/[locale]/`            | Static page              | Landing page with language switcher, theme toggle, and links to the main sections.           |
| `/[locale]/bookmarks/`  | Static page + client API | Bookmark dashboard shell; the UI loads bookmark data from the Python Worker API after login. |
| `/[locale]/experience/` | Static page              | Profile and experience page with hero, tech stack, and experience sections.                  |

---

## Development

```bash
cp .env.example .env.local
yarn install
yarn dev
```

Set `NEXT_PUBLIC_API_URL` to the Worker URL. Build the Pages artifact with:

```bash
yarn lint
yarn build
```

> Cloudflare Pages must publish the generated `out` directory. Deployment and
> API integration are documented in [docs/deploy.md](docs/deploy.md).

---

## Route Check

Static export was checked locally from `out` on `http://127.0.0.1:3001`.

- `GET /[locale]/` -> `200 OK`, title `Nguyen Dinh Nguyen`
- `GET /[locale]/bookmarks/` -> `200 OK`, title `Bookmarks — Nguyen Dinh Nguyen`
- `GET /[locale]/experience/` -> `200 OK`, title `Experience — Nguyen Dinh Nguyen`
- `GET /` is redirected to `/en/` in Cloudflare Pages via `public/_redirects`
