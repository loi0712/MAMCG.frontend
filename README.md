# MAMCG.frontend

Giao diện web của hệ thống MAM CG (quản lý đồ hoạ chạy chữ): màn hình người dùng (thư mục, thiết kế, CG) và trang quản trị `/admin`.

Backend: [MAMCG.Backend](https://github.com/loi0712/MAMCG.Backend) (ASP.NET, REST `api/<Controller>/...`).

## Công nghệ

React 19, TypeScript, Vite, TanStack Router (định tuyến theo file) và TanStack Query, Tailwind CSS 4 + shadcn/ui, Zustand, axios.

## Chạy ở máy local

Yêu cầu: Node 20, Yarn 1.

```bash
yarn install
cp .env.example .env.development   # điền VITE_API_URL trỏ tới backend
yarn dev
```

### Biến môi trường

| Biến | Ý nghĩa |
|---|---|
| `VITE_API_URL` | Địa chỉ MAMCG.Backend, không có `/` ở cuối. Bắt buộc. |
| `VITE_DOMAIN_URL` | Địa chỉ frontend; cổng dùng cho `yarn preview` (mặc định 6060). |
| `VITE_DEBUG_MODE` | Bật log debug phía client. |
| `VITE_ENABLE_MOCKS` | Bật API giả lập (MSW) khi chạy dev, dùng khi không có backend. |

Các biến `VITE_*` được nhúng vào bundle **lúc build**, không đọc lúc chạy container.

## Lệnh

| Lệnh | Việc làm |
|---|---|
| `yarn dev` | Chạy dev server |
| `yarn build` | Kiểm tra kiểu (`tsc -b`) rồi build vào `dist/` |
| `yarn typecheck` | Chỉ kiểm tra kiểu |
| `yarn lint:check` / `yarn lint` | Chạy ESLint / tự sửa |
| `yarn preview` | Chạy thử bản build |
| `yarn api:types [url\|file]` | Lấy Swagger của backend, lưu `openapi/mamcg-api.json`, sinh `src/api/generated/schema.ts` |
| `yarn api:types:check` | Báo lỗi nếu kiểu API lệch với spec đã commit |

## Cấu trúc thư mục

```
src/
  routes/            Route theo file (TanStack Router); routeTree.gen.ts được sinh tự động
  features/<tên>/    Màn hình theo tính năng: components/, api/ (hook React Query), data/
  features/admin/    Trang quản trị (/admin/*)
  components/ui/     Component shadcn/ui
  api/config/        apiUrls: đường dẫn API backend
  shared/lib/axios   axios dùng chung: gắn token, xử lý 401
  stores/            Zustand (auth-store: phiên đăng nhập)
```

Gọi API: khai báo đường dẫn trong `src/api/config/endpoints.ts`, viết hàm và hook React Query trong `features/<tên>/api/`, dùng `axios` từ `@/shared/lib/axios`.

## Kiểu dữ liệu API từ Swagger

Khi truy cập được backend, chạy `yarn api:types` rồi commit `openapi/mamcg-api.json` và `src/api/generated/schema.ts`. Không sửa tay file sinh ra; CI chạy `yarn api:types:check` để phát hiện lệch.

```ts
import type { components } from '@/api/generated/schema'
type User = components['schemas']['UserDto']
```

## Triển khai (Docker)

```bash
docker build \
  --build-arg VITE_API_URL=https://api.example.com \
  --build-arg VITE_DOMAIN_URL=https://mamcg.example.com \
  -t mamcg-frontend .
docker run -p 6060:8080 mamcg-frontend
```

Image chạy nginx bằng user không phải root trên cổng 8080, có SPA fallback, security header và `/healthz` cho healthcheck. `docker-compose.yml` map `6060:8080`.

## CI

GitHub Actions (`.github/workflows/ci.yml`) chạy trên PR và `main`: lint, kiểm tra kiểu API, build (gồm `tsc`), build image Docker và smoke test.
