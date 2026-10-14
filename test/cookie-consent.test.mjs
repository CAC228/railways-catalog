import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import ts from 'typescript'
import { COOKIE_CONSENT_KEY, getCookieConsent, parseCookieConsent, saveCookieConsent, subscribeCookieConsent } from '../src/shared/privacy/cookie-consent.ts'

test('consent requires a valid explicit choice and expires after one year', () => {
  const now = 1800000000000
  for (const choice of ['accepted', 'necessary']) {
    assert.equal(parseCookieConsent(JSON.stringify({ version: 1, choice, savedAt: now - 1 }), now), choice)
  }
  for (const raw of [null, 'bad', '{}', JSON.stringify({ version: 1, choice: 'accepted', savedAt: now - 365 * 86400000 }), JSON.stringify({ version: 1, choice: 'accepted', savedAt: now + 1 }), JSON.stringify({ version: 2, choice: 'accepted', savedAt: now })]) {
    assert.equal(parseCookieConsent(raw, now), null)
  }
  assert.equal(getCookieConsent(), null, 'SSR has no saved choice')
})

test('call tracking is gone from the site', async () => {
  const files = await readdir(new URL('../src', import.meta.url), { recursive: true })
  for (const file of files.filter(name => /\.(ts|tsx)$/.test(name))) {
    const source = await readFile(new URL(`../src/${file.replaceAll('\\', '/')}`, import.meta.url), 'utf8')
    assert.doesNotMatch(source, /gudok/i, file)
  }
})

test('metrika works for every visitor except admin, the banner choice is remembered', async t => {
  const storage = new Map()
  const scripts = new Map()
  const calls = []
  const window = new EventTarget()
  window.location = { pathname: '/', href: 'http://localhost/', search: '' }
  window.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) }
  window.ym = (...args) => calls.push(args)
  const old = { window: globalThis.window, document: globalThis.document, location: globalThis.location }
  globalThis.window = window
  globalThis.location = window.location
  globalThis.document = { referrer: '', getElementById: id => scripts.get(id), createElement: () => ({}), head: { append: script => scripts.set(script.id, script) } }
  t.after(() => { Object.assign(globalThis, old) })
  const source = (await readFile(new URL('../src/shared/analytics/metrika.ts', import.meta.url), 'utf8'))
    .replaceAll('import.meta.env', '({ PROD: true, VITE_METRIKA_ID: "123456, 654321" })')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText
  const metrika = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`)
  assert.equal(metrika.startMetrika(), true)
  assert.equal(metrika.startMetrika(), false)
  assert.deepEqual([...scripts.keys()], ['metrika-script'])
  assert.deepEqual(calls.filter(call => call[1] === 'init').map(call => call[0]), [123456, 654321], 'every counter is initialized')
  metrika.metrikaReachGoal('forma')
  assert.deepEqual(calls.slice(-2), [[123456, 'reachGoal', 'forma'], [654321, 'reachGoal', 'forma']])
  window.location.pathname = '/catalog/rels-r65'
  const pochta = metrika.emailCopyGoal('Подвал')
  metrika.metrikaReachGoal(pochta.name, pochta.params?.())
  assert.deepEqual(calls.slice(-2).map(call => call[0]), [123456, 654321])
  assert.deepEqual(calls.at(-1), [654321, 'reachGoal', 'pochta', { 'Почта': { 'Подвал': '/catalog/rels-r65' } }])
  window.location.pathname = '/'
  let changes = 0
  const unsubscribe = subscribeCookieConsent(() => changes++)
  saveCookieConsent('accepted')
  assert.equal(getCookieConsent(), 'accepted')
  const count = calls.length
  metrika.metrikaReachGoal('forma'); metrika.metrikaHit('/catalog', '/')
  assert.equal(calls.length, count + 4)
  window.location.pathname = '/admin/login'
  metrika.metrikaReachGoal('forma'); metrika.metrikaHit('/admin', '/')
  assert.equal(calls.length, count + 4, 'admin pages are not tracked')
  window.location.pathname = '/'
  assert.equal(changes, 1)
  unsubscribe()
  window.localStorage.setItem = () => { throw new Error('storage blocked') }
  saveCookieConsent('accepted')
  assert.equal(getCookieConsent(), 'accepted', 'choice works in memory if writes are blocked')
  assert.ok(storage.has(COOKIE_CONSENT_KEY))
})
