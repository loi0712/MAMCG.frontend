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
| `VITE_ENABLE_MOCKS` | Bật API giả lập (MSW) khi không có backend (dev, hoặc bản build cho E2E). Không đặt khi build bản triển khai. |

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
| `yarn e2e` | Chạy E2E Playwright trên bản build có API giả lập (`E2E_PORT`, mặc định 4173) |
| `yarn e2e:report` | Mở báo cáo HTML của lần chạy E2E gần nhất |

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

## Chạy không cần backend (API giả lập)

Đặt `VITE_ENABLE_MOCKS=true` trong `.env.development` rồi `yarn dev`. [MSW](https://mswjs.io) sẽ trả lời các request tới `VITE_API_URL` bằng dữ liệu trong bộ nhớ (`src/mocks/`), mô phỏng hành vi của MAMCG.Backend: phân trang, tìm kiếm, tạo/sửa/xoá, 404.

- Đăng nhập bằng tên bất kỳ có trong dữ liệu giả (ví dụ `admin`) và mật khẩu bất kỳ; mật khẩu `wrong` để thử đăng nhập sai.
- Tải lại trang sẽ khôi phục dữ liệu gốc.
- Chỉ hoạt động khi `VITE_ENABLE_MOCKS=true`; bản build production (không đặt biến) không chứa mã giả lập.

Màn hình quản trị đã nối API: Tài khoản, Nhóm quyền, Phân quyền, Trường dữ liệu, Panel hiển thị. Các màn hình còn lại hiện thông báo "Dữ liệu minh hoạ" cho tới khi backend có API.

## E2E (Playwright)

`yarn e2e` build bản có API giả lập (`VITE_ENABLE_MOCKS=true`, `dist-e2e/`), chạy `vite preview` rồi chạy các kịch bản trong `e2e/tests`: đăng nhập sai/đúng, danh sách tài sản + chi tiết, các màn quản trị (người dùng, quy trình tạo/sửa, cài đặt, nhật ký kiểm toán + xuất CSV), F5 giữ trang. Lần đầu cần cài trình duyệt: `npx playwright install chromium`. Kết quả lỗi (ảnh, trace) ở `e2e/test-results`, báo cáo HTML ở `e2e/playwright-report` (`yarn e2e:report`). Dữ liệu giả reset khi tải lại trang, vì vậy kịch bản tạo/sửa điều hướng trong app thay vì `page.goto`.

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

GitHub Actions (`.github/workflows/ci.yml`) chạy trên PR và `main`: lint, kiểm tra kiểu API, build (gồm `tsc`), E2E Playwright (job `e2e`, cài chromium bằng `npx playwright install --with-deps chromium`, tải báo cáo `playwright-report` lên artifact khi lỗi), build image Docker và smoke test.
