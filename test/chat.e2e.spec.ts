import { test, expect } from '@playwright/test'

test.beforeEach(async ({ context, baseURL }) => {
  if (!baseURL || new URL(baseURL).hostname !== '127.0.0.1')
    throw Error('Only local test servers are allowed')
  await context.route(/mc\.yandex\./, (route) => route.abort())
})

test('catalog HTML contains products, working pagination, categories and filtered results without JavaScript', async ({
  browser,
  baseURL,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  const response = await page.goto(`${baseURL}/catalog`)
  expect(response?.status()).toBe(200)
  await expect(page.locator('table.catalog-list tbody tr')).toHaveCount(20)
  const first = await page
    .locator('table.catalog-list tbody tr')
    .first()
    .innerText()
  await expect(page.getByText('Загрузка товаров', { exact: true })).toHaveCount(
    0,
  )
  await page
    .getByRole('navigation', { name: 'Страницы каталога' })
    .getByRole('link', { name: 'Следующая страница' })
    .click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.locator('table.catalog-list tbody tr')).toHaveCount(20)
  expect(
    await page.locator('table.catalog-list tbody tr').first().innerText(),
  ).not.toBe(first)
  await page.goto(`${baseURL}/catalog/vagonnye-zapchasti`)
  await expect(page.locator('h1')).toHaveText('Вагонные запчасти')
  expect(
    await page.locator('table.catalog-list tbody tr').count(),
  ).toBeGreaterThan(0)
  await page.goto(`${baseURL}/catalog?search=265`)
  await expect(page.locator('table.catalog-list')).toContainText('Авторежим')
  await expect(page.locator('meta[name=robots]')).toHaveAttribute(
    'content',
    /noindex/,
  )
  expect((await request.get('/catalog/unknown-test-category')).status()).toBe(
    404,
  )
  expect((await request.get('/catalog?page=99999')).status()).toBe(404)
  await context.close()
})

test('hydration keeps SSR rows, client filters and pagination work', async ({
  page,
}) => {
  const errors: string[] = []
  const products: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      /hydrat|minified react/i.test(message.text())
    )
      errors.push(message.text())
  })
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/product')
      products.push(request.url())
  })
  await page.goto('/catalog')
  await expect(
    page.getByRole('button', { name: 'Написать менеджеру' }),
  ).toBeVisible()
  await expect(page.locator('table.catalog-list tbody tr')).toHaveCount(20)
  // Header's existing total-count request uses limit=1; it is independent of the catalog rows.
  expect(
    products.filter((url) => new URL(url).searchParams.get('limit') !== '1'),
  ).toHaveLength(0)
  const firstRow = await page.locator('table.catalog-list tbody tr').first().textContent()
  await page
    .getByRole('navigation', { name: 'Страницы каталога' })
    .getByRole('link', { name: 'Следующая страница' })
    .click()
  await expect(page).toHaveURL(/page=2/)
  await expect(page.locator('table.catalog-list tbody tr')).toHaveCount(20)
  await expect.poll(() => products.some((url) => url.includes('page=2'))).toBe(true)
  await expect(page.locator('table.catalog-list tbody tr').first()).not.toHaveText(firstRow || '')
  await page.getByLabel('Сортировка', { exact: true }).selectOption('price-desc')
  await expect(page).toHaveURL(/sort=price-desc/)
  await expect.poll(() => products.some(url => url.includes('sort=price-desc'))).toBe(true)
  await expect(page.locator('table.catalog-list tbody tr')).toHaveCount(20)
  expect(errors).toEqual([])
})

test('visitor and administrator exchange WebSocket messages, retain history and reconnect; mobile fits', async ({
  browser,
  page: visitor,
  baseURL,
}) => {
  const failures: string[] = []
  visitor.on('pageerror', (error) => failures.push(error.message))
  const name = `Алексей, проверка ${Date.now()}`
  await visitor.goto('/catalog')
  await visitor.getByRole('button', { name: 'Написать менеджеру' }).click()
  await visitor.getByLabel('Как к вам обращаться').fill(name)
  await visitor.getByLabel(/Телефон или почта/).fill('test@example.invalid')
  await visitor.getByRole('checkbox').last().check()
  await visitor.getByRole('button', { name: 'Начать переписку' }).click()
  await expect(
    visitor.getByText('Соединение установлено', { exact: true }),
  ).toBeVisible()
  await visitor
    .getByRole('textbox', { name: 'Сообщение', exact: true })
    .fill('Здравствуйте! Нужны болты М22, 500 штук.')
  await visitor.getByRole('button', { name: 'Отправить сообщение' }).click()
  await expect(visitor.locator('.chat-message')).toContainText(
    'Здравствуйте! Нужны болты М22, 500 штук.',
  )
  const adminContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  })
  await adminContext.route(/mc\.yandex\./, (route) => route.abort())
  const admin = await adminContext.newPage()
  admin.on('pageerror', (error) => failures.push(error.message))
  await admin.goto(`${baseURL}/admin/chats`)
  await admin.getByLabel('Логин', { exact: true }).fill('admin')
  await admin.getByLabel('Пароль', { exact: true }).fill('admin')
  await admin.getByRole('button', { name: 'Войти', exact: true }).click()
  await expect(
    admin.getByRole('heading', { name: 'Чаты с посетителями' }),
  ).toBeVisible()
  await admin.getByRole('button', { name: new RegExp(name) }).click()
  await expect(admin.locator('.chat-message')).toContainText('500 штук')
  await admin
    .getByRole('textbox', { name: 'Сообщение', exact: true })
    .fill('Добрый день! Уточните ГОСТ и город доставки — подготовим расчёт.')
  await admin.getByRole('button', { name: 'Отправить сообщение' }).click()
  await expect(visitor.locator('.chat-message').last()).toContainText(
    'подготовим расчёт',
  )
  await visitor.reload()
  await visitor.getByRole('button', { name: 'Написать менеджеру' }).click()
  await expect(visitor.locator('.chat-message')).toHaveCount(2)
  await visitor.context().setOffline(true)
  await expect(
    visitor.getByRole('button', { name: 'Отправить сообщение' }),
  ).toBeDisabled()
  await visitor.context().setOffline(false)
  await expect(
    visitor.getByText('Соединение установлено', { exact: true }),
  ).toBeVisible({ timeout: 20000 })
  await visitor
    .getByRole('textbox', { name: 'Сообщение', exact: true })
    .fill('ГОСТ 11530-2014, доставка в Казань.')
  await visitor.getByRole('button', { name: 'Отправить сообщение' }).click()
  await expect(admin.locator('.chat-message').last()).toContainText(
    'доставка в Казань',
  )
  await admin.getByRole('button', { name: 'Завершить', exact: true }).click()
  await expect(
    admin.getByRole('button', { name: 'Завершён', exact: true }),
  ).toBeDisabled()
  await admin.screenshot({
    path: '../local/admin-chat-desktop.png',
    fullPage: true,
  })
  await visitor.screenshot({
    path: '../local/visitor-chat-desktop.png',
    fullPage: true,
  })
  await visitor.setViewportSize({ width: 390, height: 844 })
  const panel = await visitor.getByRole('dialog').boundingBox()
  expect(panel!.x).toBeGreaterThanOrEqual(0)
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(390)
  expect(panel!.height).toBeLessThanOrEqual(844)
  await visitor.screenshot({ path: '../local/visitor-chat-mobile.png' })
  await admin.setViewportSize({ width: 390, height: 844 })
  await expect.poll(() => admin.locator('aside.fixed').evaluate(element => element.getBoundingClientRect().right)).toBeLessThanOrEqual(1)
  await expect(admin.getByRole('button', { name: '← Все чаты' })).toBeVisible()
  expect(await admin.locator('.chat-compose').evaluate(element => element.getBoundingClientRect().bottom)).toBeLessThanOrEqual(844)
  expect(await admin.locator('.chat-message').evaluateAll(elements => elements.every(element => element.scrollWidth <= element.clientWidth + 1))).toBe(true)
  await admin.screenshot({ path: '../local/admin-chat-mobile.png', animations: 'disabled' })
  expect(failures).toEqual([])
  await adminContext.close()
})
