import { expect, test } from '@playwright/test'
import { fillLogin, login } from './helpers'

test.describe('Đăng nhập', () => {
  test('sai mật khẩu: báo lỗi và ở lại trang đăng nhập', async ({ page }) => {
    await fillLogin(page, 'admin', 'wrong')
    await expect(page.getByText('Tên đăng nhập hoặc mật khẩu không đúng')).toBeVisible()
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test('đúng mật khẩu: vào ứng dụng', async ({ page }) => {
    await login(page)
    await expect(page.getByRole('button', { name: 'Đăng nhập' })).toHaveCount(0)
  })

  test('chưa đăng nhập mở trang quản trị thì chuyển về đăng nhập', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page).toHaveURL(/\/sign-in/)
  })
})
