// 'necessary' — выбор «Без коллтрекинга» с прежней плашки: такие посетители уведомление уже видели.
export type CookieChoice = 'accepted' | 'necessary'
export const COOKIE_CONSENT_KEY = 'invia-cookie-consent-v1'
export const COOKIE_CONSENT_EVENT = 'invia:cookie-consent'
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000
let memoryChoice: CookieChoice | null = null
let memoryOnly = false

export function parseCookieConsent(raw: string | null, now = Date.now()): CookieChoice | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw)
    if (value?.version !== 1 || !['accepted', 'necessary'].includes(value.choice)) return null
    if (!Number.isFinite(value.savedAt) || value.savedAt > now || now - value.savedAt >= MAX_AGE_MS) return null
    return value.choice
  } catch { return null }
}

export function getCookieConsent(): CookieChoice | null {
  if (typeof window === 'undefined') return null
  if (memoryOnly) return memoryChoice
  try { return parseCookieConsent(window.localStorage.getItem(COOKIE_CONSENT_KEY)) }
  catch { return memoryChoice }
}

export function saveCookieConsent(choice: CookieChoice) {
  memoryChoice = choice
  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({ version: 1, choice, savedAt: Date.now() }))
    memoryOnly = false
  } catch { memoryOnly = true }
  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
}

export function subscribeCookieConsent(callback: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === COOKIE_CONSENT_KEY || event.key === null) callback()
  }
  window.addEventListener(COOKIE_CONSENT_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(COOKIE_CONSENT_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}
