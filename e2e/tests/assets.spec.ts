import { expect, test } from '@playwright/test'
import { login } from './helpers'

test.describe('Tài sản', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('danh sách tài sản và mở chi tiết', async ({ page }) => {
    await page.goto('/assets')
    await expect(page.getByText('TT09260001')).toBeVisible()
    await expect(page.getByText('TT09260002')).toBeVisible()

    // Bấm dòng: mở khung xem nhanh
    await page.getByText('TT09260001').click()
    await expect(page.getByText('Lịch sử dự án')).toBeVisible()
    await expect(page.getByText('Bản tin sáng - logo góc').first()).toBeVisible()

    // Trang chi tiết
    await page.goto('/assets/details/details?id=4')
    await expect(page.getByText('Thời tiết - bản đồ').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Gửi duyệt' })).toBeVisible()
  })
})
