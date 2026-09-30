import { expect, test } from '@playwright/test'
import { login } from './helpers'

test.describe('Tài sản', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('danh sách tài sản và mở chi tiết', async ({ page }) => {
    await page.goto('/assets')
    await expect(page.getByText('TS-0001')).toBeVisible()
    await expect(page.getByText('TT-0002')).toBeVisible()

    // Bấm dòng: mở khung xem nhanh
    await page.getByText('TS-0001').click()
    await expect(page.getByText('Lịch sử dự án')).toBeVisible()
    await expect(page.getByText('Bar tên khách mời 2 dòng').first()).toBeVisible()

    // Trang chi tiết
    await page.goto('/assets/details/details?id=101')
    await expect(page.getByText('Lower third Thời sự 19h').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Gửi duyệt' })).toBeVisible()
  })
})
