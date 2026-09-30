import { expect, test } from '@playwright/test'
import { login } from './helpers'

test.describe('Quản trị', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('người dùng', async ({ page }) => {
    await page.goto('/admin/users')
    await expect(page.getByText('Quản lý người dùng và quyền truy cập')).toBeVisible()
    await expect(page.getByText('Nguyễn Văn An')).toBeVisible()
  })

  test('cài đặt', async ({ page }) => {
    await page.goto('/admin/settings')
    await expect(page.getByText('Cấu hình các thiết lập hệ thống')).toBeVisible()
  })

  test('quy trình: tạo mới rồi sửa tên', async ({ page }) => {
    const name = `Quy trình E2E ${Date.now()}`
    await page.goto('/admin/workflow')
    await page.getByRole('button', { name: 'Tạo workflow mới' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('vd: Quy trình duyệt tin').fill(name)
    await dialog.getByRole('button', { name: 'Tạo và thiết kế' }).click()

    // Trình thiết kế của quy trình vừa tạo
    await expect(page).toHaveURL(/\/admin\/workflow\/\d+/)
    const nameInput = page.getByPlaceholder('Tên workflow...')
    await expect(nameInput).toHaveValue(name)
    await nameInput.fill(`${name} (sửa)`)
    await page.getByRole('button', { name: /^Lưu/ }).click()
    await expect(page.getByText(/Đã lưu/).first()).toBeVisible()

    // Danh sách có tên mới (điều hướng trong app: dữ liệu giả MSW mất khi tải lại trang)
    await page.getByText('Quay lại').click()
    await expect(page.getByText(`${name} (sửa)`)).toBeVisible()
  })

  test('nhật ký: tab kiểm toán, xem trước/sau và xuất CSV', async ({ page }) => {
    await page.goto('/admin/logs')
    await page.getByRole('tab', { name: 'Kiểm toán' }).click()
    await expect(page.getByText('email.smtp.host').or(page.getByText('ConfigValue')).first()).toBeVisible()

    await page.getByRole('button', { name: 'Xem chi tiết' }).first().click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText('smtp.old.vtv.vn')).toBeVisible()
    await expect(dialog.getByText('smtp.vtv.vn', { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Xuất CSV' }).last().click(),
    ])
    expect(download.suggestedFilename()).toMatch(/^nhat-ky-audit-.*\.csv$/)
  })
})
