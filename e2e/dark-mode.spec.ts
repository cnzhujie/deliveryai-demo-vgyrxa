import { test, expect, type Page } from '@playwright/test'

/** Navigate from app start to the menu view. */
async function goToMenu(page: Page) {
  await page.goto('/')
  // Bind table
  await page.getByRole('button', { name: /A08/ }).first().click()
  // Welcome page - enter menu
  await page.getByRole('button', { name: /进入点餐|Start Ordering/ }).click()
}

/** Get the dark mode toggle button (Moon/Sun icon) */
function darkModeToggle(page: Page) {
  return page.getByRole('button', { name: /切换至夜间模式|切换至日间模式|Switch to Dark Mode|Switch to Light Mode/ })
}

/** Get the main content container (covers full page area) */
function mainContainer(page: Page) {
  return page.locator('.min-h-screen')
}

test.describe('夜间模式 - E2E 验收测试', () => {

  test('REQ-DARK-001: 首次访问时默认为浅色模式，进入菜单后可见 Moon 按钮', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    // Navigate to menu where TopBar is rendered
    await goToMenu(page)
    // TopBar should show Moon icon (dark mode not active)
    await expect(darkModeToggle(page)).toBeVisible()
  })

  test('REQ-DARK-002: 点击 Moon 按钮后切换为夜间模式，html 增加 dark class', async ({ page }) => {
    await goToMenu(page)
    await darkModeToggle(page).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByRole('button', { name: /切换至日间模式|Switch to Light Mode/ })).toBeVisible()
  })

  test('REQ-DARK-003: 夜间模式下页面主背景变暗', async ({ page }) => {
    await goToMenu(page)
    await darkModeToggle(page).click()
    await page.waitForTimeout(400)
    const bgColor = await mainContainer(page).evaluate(el => window.getComputedStyle(el).backgroundColor)
    expect(bgColor).toBe('rgb(33, 31, 28)') // charcoal-900
  })

  test('REQ-DARK-004: 切换夜间模式后弹出正确 Toast 提示（中文）', async ({ page }) => {
    await goToMenu(page)
    await darkModeToggle(page).click()
    await expect(page.getByText('已切换为夜间模式')).toBeVisible()
  })

  test('REQ-DARK-005: 再次点击 Sun 按钮切回浅色模式，html 移除 dark class', async ({ page }) => {
    await goToMenu(page)
    await darkModeToggle(page).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await darkModeToggle(page).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await expect(page.getByText('已切换为日间模式')).toBeVisible()
  })

  test('REQ-DARK-006: 刷新页面后夜间模式状态保持（localStorage 持久化）', async ({ page }) => {
    await goToMenu(page)
    await darkModeToggle(page).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).toHaveClass(/dark/)
  })

  test('REQ-DARK-007: 清除 localStorage 后刷新，默认恢复浅色模式', async ({ page }) => {
    await goToMenu(page)
    await darkModeToggle(page).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.evaluate(() => localStorage.removeItem('dark-mode'))
    await page.reload()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('REQ-DARK-008: 夜间模式与老人模式可同时启用，互不干扰', async ({ page }) => {
    await goToMenu(page)
    // Enable elderly mode first
    await page.getByRole('button', { name: /切换至老人模式/ }).click()
    await expect(page.locator('html')).toHaveClass(/elderly/)
    // Then enable dark mode
    await darkModeToggle(page).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    // Both classes should be present
    await expect(page.locator('html')).toHaveClass(/elderly/)
    await expect(page.locator('html')).toHaveClass(/dark/)
    // Main container background should be dark (charcoal-900)
    await page.waitForTimeout(400)
    const bgColor = await mainContainer(page).evaluate(el => window.getComputedStyle(el).backgroundColor)
    expect(bgColor).toBe('rgb(33, 31, 28)') // charcoal-900
  })

  test('REQ-DARK-009: 预览模式下夜间模式切换功能正常', async ({ page }) => {
    await page.goto('/?preview=menu')
    await expect(darkModeToggle(page)).toBeVisible()
    await darkModeToggle(page).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await darkModeToggle(page).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('REQ-DARK-010: 夜间模式切换不影响购物车数据', async ({ page }) => {
    await goToMenu(page)
    // Add a product to cart
    await page.getByRole('button', { name: '锅底' }).click()
    const productCards = page.locator('article')
    await productCards.first().locator('button').last().click()
    await page.getByRole('button', { name: '微辣' }).click()
    await page.getByRole('button', { name: '加入本桌购物车' }).click()
    await expect(page.getByText('本桌购物车').first()).toBeVisible()
    // Toggle dark mode back and forth
    await darkModeToggle(page).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await darkModeToggle(page).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    // Cart should still show the item
    await expect(page.getByText('鎏金番茄鸳鸯锅').first()).toBeVisible()
  })

  test('REQ-DARK-011: 英文环境下夜间模式切换文案正确', async ({ page }) => {
    await goToMenu(page)
    // Switch to English via the language toggle
    await page.getByRole('button', { name: /切换语言|Switch language/ }).click()
    await page.waitForTimeout(400)
    await expect(page.getByRole('button', { name: 'Switch to Dark Mode' })).toBeVisible()
    await page.getByRole('button', { name: 'Switch to Dark Mode' }).click()
    await expect(page.getByText('Switched to Dark Mode')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Switch to Light Mode' })).toBeVisible()
    await page.getByRole('button', { name: 'Switch to Light Mode' }).click()
    await expect(page.getByText('Switched to Light Mode')).toBeVisible()
  })

  test('REQ-DARK-012: TopBar 上夜间模式按钮在所有视图下均可见', async ({ page }) => {
    // Test in menu view
    await goToMenu(page)
    await expect(darkModeToggle(page)).toBeVisible()
    // Test in order view
    await page.getByRole('button', { name: '订单', exact: true }).click()
    await expect(darkModeToggle(page)).toBeVisible()
    // Test in checkout view
    await page.getByRole('button', { name: '点餐', exact: true }).click()
    // Add a product and submit order
    await page.getByRole('button', { name: '锅底' }).click()
    const productCards = page.locator('article')
    await productCards.first().locator('button').last().click()
    await page.getByRole('button', { name: '微辣' }).click()
    await page.getByRole('button', { name: '加入本桌购物车' }).click()
    await page.getByRole('button', { name: /提交|Submit/ }).click()
    await page.getByRole('button', { name: '订单', exact: true }).click()
    await page.getByRole('button', { name: /去结账|Checkout/ }).click()
    await expect(darkModeToggle(page)).toBeVisible()
  })

  test('REQ-DARK-013: 页面主容器在暗色模式下有深色背景', async ({ page }) => {
    await goToMenu(page)
    await darkModeToggle(page).click()
    await page.waitForTimeout(400)
    const mainBg = await mainContainer(page).evaluate(el => window.getComputedStyle(el).backgroundColor)
    expect(mainBg).toBe('rgb(33, 31, 28)') // charcoal-900
  })
})
