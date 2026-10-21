import { test, expect } from '@playwright/test'

test.beforeEach(async ({ context, baseURL }) => {
  if (!baseURL || new URL(baseURL).hostname !== '127.0.0.1')
    throw Error('Only local test servers are allowed')
  await context.route(/mc\.yandex\./, route => route.abort())
})

test('empty preview response is readable and retry establishes a real chat', async ({ page }) => {
  await page.setViewportSize({ width: 414, height: 800 })
  let attempts = 0
  await page.route('**/api/chat/session', route => {
    attempts++
    return attempts === 1
      ? route.fulfill({ status: 200, contentType: 'application/json', body: '' })
      : route.continue()
  })
  await page.goto('/catalog')
  await page.getByRole('button', { name: 'Написать менеджеру' }).click()
  await page.getByLabel('Как к вам обращаться').fill(`Проверка preview ${Date.now()}`)
  await page.getByRole('checkbox').last().check()
  await page.getByRole('button', { name: 'Начать переписку' }).click()
  await expect(page.getByRole('alert')).toHaveText('Чат временно недоступен. Попробуйте ещё раз через минуту.')
  await expect(page.getByLabel('Как к вам обращаться')).not.toHaveValue('')
  await expect(page.getByRole('checkbox').last()).toBeChecked()
  await page.getByRole('button', { name: 'Начать переписку' }).click()
  await expect(page.getByText('Соединение установлено', { exact: true })).toBeVisible()
  await page.getByRole('textbox', { name: 'Сообщение', exact: true }).fill('Сообщение после повторной попытки')
  await page.getByRole('button', { name: 'Отправить сообщение' }).click()
  await expect(page.locator('.chat-message')).toContainText('Сообщение после повторной попытки')
  expect(attempts).toBe(2)
})

test('cookie notice stays complete after scrolling and resizing an embedded mobile preview', async ({ page }) => {
  await page.setViewportSize({ width: 414, height: 900 })
  await page.route('**/preview-harness', route => route.fulfill({
    contentType: 'text/html',
    body: '<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body{height:100%;margin:0}header{height:104px;background:#111;color:white}iframe{display:block;border:0;width:100%;height:calc(100% - 104px)}</style><header>Computer preview</header><iframe title="Предпросмотр" src="/catalog"></iframe>',
  }))
  await page.goto('/preview-harness')
  const frame = page.frameLocator('iframe')
  const notice = frame.getByRole('region', { name: 'Cookies на нашем сайте' })
  const button = notice.getByRole('button', { name: 'Понятно' })
  await expect(button).toBeVisible()
  await frame.locator('body').evaluate(() => window.scrollTo(0, 280))
  await page.setViewportSize({ width: 414, height: 400 })
  await page.setViewportSize({ width: 414, height: 900 })
  await expect.poll(() => notice.evaluate(element => ({
    clipped: element.scrollHeight > element.clientHeight + 1,
    outside: element.getBoundingClientRect().bottom > window.innerHeight,
  }))).toEqual({ clipped: false, outside: false })
  await expect(notice.getByRole('heading')).toBeInViewport({ ratio: 1 })
  await expect(button).toBeInViewport({ ratio: 1 })
  await page.screenshot({ path: '../local/cookie-embedded-preview.png' })
  await button.click()
  await expect(notice).toHaveCount(0)
})
