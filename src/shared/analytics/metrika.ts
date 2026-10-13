/**
 * Номера счётчиков Яндекс.Метрики через запятую. Не являются секретом: они
 * видны в исходном коде каждой страницы. Хранятся в коде, потому что настройки
 * боевой сборки лежат в секрете VITE_ENV, прочитать который нельзя, а значит
 * нельзя и дописать в него ключ, не потеряв остальные значения.
 * 112450496 — счётчик со времён traer.ru (к нему привязаны Директ и Gudok),
 * 113577737 — счётчик prorelsa.ru. Каждое событие уходит в оба.
 */
const DEFAULT_METRIKA_ID = '112450496,113577737'

const configured = (import.meta.env.VITE_METRIKA_ID ?? '').trim()

/**
 * В сборке для боевого сервера счётчики включены по умолчанию, при разработке —
 * выключены, чтобы не искажать статистику. VITE_METRIKA_ID переопределяет
 * номера (один или несколько через запятую), любое нечисловое значение
 * (например off) отключает Метрику совсем.
 */
const resolved: string[] = (configured === '' ? (import.meta.env.PROD ? DEFAULT_METRIKA_ID : '') : configured)
  .split(',').map((id: string) => id.trim())

export const metrikaIds: number[] = resolved.every(id => /^\d+$/.test(id)) ? resolved.map(Number) : []

/** Вызов во все счётчики сразу. */
function ymAll(action: string, ...args: unknown[]) {
  for (const id of metrikaIds) window.ym?.(id, action, ...args)
}

/**
 * Метрика работает у всех посетителей сразу, не дожидаясь выбора на плашке
 * cookies: иначе визиты с рекламы, где плашку закрыли или не тронули, не
 * считались, и Директ расходился с Метрикой. Согласие нужно только
 * коллтрекингу (gudok.ts). Админку не считаем.
 */
function metrikaAllowed() {
  return typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')
}

declare global {
  interface Window {
    ym?: ((id: number, action: string, ...args: unknown[]) => void) & { a?: unknown[][]; l?: number }
  }
}

/** Сообщает Метрике о переходе на новый адрес внутри сайта. */
export function metrikaHit(url: string, referrer: string): void {
  if (!metrikaAllowed() || !metrikaIds.length || typeof window.ym !== 'function') return
  ymAll('hit', url, { referer: referrer })
}

/**
 * Цель «Отправка формы» в Метрике. Вызывать только после успешной отправки:
 * сервер ответил успехом и пользователь видит подтверждение. На ошибках
 * валидации, ошибках отправки и открытии формы цель не засчитывается.
 */
export const FORM_GOAL = 'forma'

/**
 * Цель «Копирование почты»: нажатие на адрес zakaz@prorelsa.ru или на значок
 * копирования рядом с ним — в шапке, подвале, на главной и в «Контактах».
 */
export const EMAIL_COPY_GOAL = 'pochta'

/**
 * Параметры визита, которые уходят вместе с целью. В Метрике они видны
 * в отчёте «Параметры визитов» деревом: вложенный объект — уровень ниже.
 */
export type MetrikaParams = Record<string, unknown>

/** Цель и её параметры; параметры собираются в момент действия, а не при отрисовке. */
export type MetrikaGoal = { name: string; params?: () => MetrikaParams }

/** Места на сайте, где можно скопировать почту. */
export type EmailPlace =
  | 'Шапка'
  | 'Шапка, список контактов'
  | 'Подвал'
  | 'Главная, блок контактов'
  | 'Страница «Контакты»'

/**
 * «Копирование почты» с местом и страницей: в отчёте «Параметры визитов» это
 * дерево «Почта» → место → адрес страницы. Источник перехода (Директ, поиск,
 * прямой заход) Метрика привязывает к цели сама.
 */
export function emailCopyGoal(place: EmailPlace): MetrikaGoal {
  return { name: EMAIL_COPY_GOAL, params: () => ({ Почта: { [place]: window.location.pathname } }) }
}

/**
 * Засчитывает цель в Метрике. Ошибка счётчика сюда не выходит: действие,
 * ради которого засчитывается цель (отправка формы, копирование), не должно
 * от неё зависеть.
 */
export function metrikaReachGoal(goal: string, params?: MetrikaParams): void {
  if (!metrikaAllowed() || !metrikaIds.length || typeof window.ym !== 'function') return
  try {
    if (params) ymAll('reachGoal', goal, params)
    else ymAll('reachGoal', goal)
  } catch {
    // Счётчик сломан или заблокирован — цель теряется, сайт работает.
  }
}

let initialized = false

export function startMetrika(): boolean {
  if (!metrikaAllowed() || !metrikaIds.length || initialized) return false
  initialized = true
  if (!window.ym) {
    const queue: NonNullable<Window['ym']> = (...args) => { (queue.a ??= []).push(args) }
    queue.l = Date.now()
    window.ym = queue
  }
  if (!document.getElementById('metrika-script')) {
    const script = document.createElement('script')
    script.id = 'metrika-script'
    script.async = true
    script.src = `https://mc.yandex.ru/metrika/tag.js?id=${metrikaIds[0]}`
    document.head.append(script)
  }
  ymAll('init', { ssr: true, webvisor: true, clickmap: true, ecommerce: 'dataLayer', referrer: document.referrer, url: location.href, accurateTrackBounce: true, trackLinks: true })
  return true
}

export function stopMetrika() {
  if (initialized && window.ym) {
    try { ymAll('destruct') } catch { /* Сайт не зависит от счётчика. */ }
    if (window.ym.a) window.ym.a = []
  }
  initialized = false
}
