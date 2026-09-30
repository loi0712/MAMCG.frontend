import { expect, test } from '@playwright/test'
import { login } from './helpers'

// F5 giữ nguyên trang (không quay về trang chủ / đăng nhập)
test.describe('Tải lại trang', () => {
  for (const [path, text] of [
    ['/admin/users', 'Quản lý người dùng và quyền truy cập'],
    ['/admin/settings', 'Cấu hình các thiết lập hệ thống'],
    ['/admin/logs', 'Nhật ký hệ thống'],
    ['/assets/details/details?id=3', 'Thể thao 24h - bảng tỉ số'],
  ] as const) {
    test(`F5 tại ${path}`, async ({ page }) => {
      await login(page)
      await page.goto(path)
      await expect(page.getByText(text).first()).toBeVisible()
      await page.reload()
      expect(new URL(page.url()).pathname).toBe(path.split('?')[0])
      await expect(page.getByText(text).first()).toBeVisible()
    })
  }
})
