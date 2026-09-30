import { expect, type Page } from '@playwright/test'

// Tài khoản của dữ liệu giả (src/mocks/handlers/auth.ts)
export const ADMIN = { username: 'admin', password: 'Admin@123' }

export async function fillLogin(page: Page, username: string, password: string) {
  await page.goto('/sign-in')
  await page.getByPlaceholder('Nhập tên đăng nhập').fill(username)
  await page.getByPlaceholder('********').fill(password)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
}

export async function login(page: Page) {
  await fillLogin(page, ADMIN.username, ADMIN.password)
  await expect(page).not.toHaveURL(/\/sign-in/)
}
