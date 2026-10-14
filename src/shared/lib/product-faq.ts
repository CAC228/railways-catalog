import { plainText } from './plain-text.ts'
import { isStarogodnySection, productGroup, TIER_NAMES, tierVolumes, type ProductGroup } from './product-groups.ts'

/**
 * «Частые вопросы» в карточке товара. Вопросы собираются из данных самой карточки:
 * одна функция кормит и видимый блок, и разметку FAQPage, поэтому они не расходятся.
 * Каждое утверждение — из фактов сайта (плашка «Наличие», блок ступеней, /delivery).
 * Нельзя: предоплата 100 % (в карточке «Условия оплаты обсуждаются»), телефоны
 * (они меняются), сроки и скидки, которых нет на сайте.
 */
export type FaqItem = { question: string; answer: string; link?: { href: string; label: string } }

export type FaqProduct = {
  title: string
  gost?: string | null
  price?: number | null
  stock?: number | null
  condition?: string | null
  categorySlug?: string | null
  subcategorySlug?: string | null
  category?: { slug?: string | null } | null
  subcategory?: { slug?: string | null } | null
  specs?: { label: string; value: string | number | null; unit?: string | null }[] | null
}

/** Больше семи вопросов блок не показывает; четыре общих остаются всегда. */
const LIMIT = 7

const DELIVERY_LINK = { href: '/delivery', label: 'Сроки доставки по городам' }
const PAYMENT_LINK = { href: '/delivery', label: 'Подробнее об оплате и документах' }

/** Срезает хвостовые «;», «,», «.» и пробелы — как значение выглядит в строке. */
const clean = (value: unknown) => plainText(value).replace(/[\s;,.]+$/, '')

/**
 * Название — только в «ёлочках» и ровно как в карточке, без склонения. Кавычки внутри
 * названия («Лягушка») по правилу вложенных кавычек становятся „лапками“; с другими
 * кавычками название не подставляем вовсе.
 */
function quoted(title: string): string | null {
  const text = plainText(title)
  if (!text || /["„“]/.test(text)) return null
  const inner = text.replace(/«([^«»]*)»/g, '„$1“')
  return /[«»]/.test(inner) ? null : `«${inner}»`
}

type Spec = { label: string; value: string }

/** Характеристики карточки по подписи: значение + единица, как в таблице «Характеристики». */
function readSpecs(product: FaqProduct): Spec[] {
  return (product.specs ?? []).flatMap((spec) => {
    const label = clean(spec.label)
    const value = clean([clean(spec.value), clean(spec.unit)].filter(Boolean).join(' '))
    return label && value ? [{ label, value }] : []
  })
}

const key = (label: string) => label.replace(/[\s.:]+$/, '').toLocaleLowerCase('ru')

function spec(specs: Spec[], label: string): string | null {
  return specs.find((item) => key(item.label) === key(label))?.value ?? null
}

/** Предложение из частей: первая буква заглавная, в конце точка. */
function sentence(parts: (string | null | false)[]): string {
  const text = parts.filter(Boolean).join(', ')
  return text ? `${text[0].toLocaleUpperCase('ru')}${text.slice(1)}.` : ''
}

const lower = (label: string) => label[0].toLocaleLowerCase('ru') + label.slice(1)

function metersItem(specs: Spec[]): FaqItem | null {
  const meters = spec(specs, 'Метров в тонне')
  if (!meters) return null
  const perMeter = spec(specs, 'Масса 1 м')
  const length = spec(specs, 'Мерная длина')
  const railMass = specs.find((item) => key(item.label).startsWith('масса рельса длиной'))
  return {
    question: 'Сколько погонных метров даёт одна тонна?',
    answer: [
      sentence([`на тонну выходит ${meters}`, perMeter && `масса 1 м — ${perMeter}`]),
      sentence([length && `мерная длина — ${length}`, railMass ? `${lower(railMass.label)} — ${railMass.value}` : null]),
    ].filter(Boolean).join(' '),
  }
}

function piecesItem(specs: Spec[]): FaqItem | null {
  const perTon = spec(specs, 'Штук в тонне')
  const perPiece = spec(specs, 'Масса 1 шт.')
  const mass = spec(specs, 'Масса')
  if (!perTon && !perPiece && !mass) return null
  const unit = spec(specs, 'Единица измерения')
  // В части карточек «Штук в тонне» — голое число: подпись уже говорит, что это штуки.
  const count = perTon && /^[\d\s,.]+$/.test(perTon) ? `${perTon} шт` : perTon
  return {
    question: perTon ? 'Сколько штук выходит на тонну?' : 'Сколько весит одно изделие?',
    answer: [
      sentence([count && `на тонну выходит ${count}`, perPiece ? `одна штука весит ${perPiece}` : mass && `масса изделия — ${mass}`]),
      sentence([unit && `единица измерения — ${unit}`]),
    ].filter(Boolean).join(' '),
  }
}

/** Документы завода обещаем только для новых: у б/у и старогодных их может не быть. */
function gostItem(product: FaqProduct, name: string | null, old: boolean): FaqItem | null {
  const gost = clean(product.gost)
  if (!gost) return null
  const papers = old ? '' : ' С партией передаём сертификат или паспорт качества завода-изготовителя.'
  return {
    question: 'По какому стандарту изготовлен товар?',
    answer: `${name ? `Стандарт для позиции ${name}` : 'Стандарт'} — ${gost}.${papers}`,
  }
}

function kitItem(specs: Spec[]): FaqItem | null {
  const kit = spec(specs, 'Комплектность')
  return kit ? { question: 'Что входит в комплект?', answer: `Комплектность — ${kit}.` } : null
}

function analogItem(specs: Spec[]): FaqItem | null {
  const analog = spec(specs, 'Аналог')
  if (!analog) return null
  const foreign = /\b(DIN|ISO|EN|ASTM|UIC)\b/.test(analog)
  return { question: foreign ? 'Есть ли зарубежный аналог?' : 'Есть ли аналог?', answer: `Да, аналог — ${analog}.` }
}

/** Общий отраслевой термин, а не обещание о конкретной партии: состояние — из карточки. */
function usedItem(specs: Spec[], old: boolean): FaqItem | null {
  if (!old) return null
  const state = spec(specs, 'Состояние')
  return {
    question: 'Что значит «старогодный»?',
    answer: `Старогодным называют материал ВСП, который был в эксплуатации, снят с пути и годится для повторного использования.${state ? ` Состояние этой позиции — ${state}.` : ''}`,
  }
}

function priceItem(product: FaqProduct, name: string | null, group: ProductGroup): FaqItem {
  const volumes = tierVolumes(group)
  const tiers = volumes
    ? ` Ступени по объёму: ${TIER_NAMES.map((tier, i) => `${tier.toLocaleLowerCase('ru')} — ${volumes[i].toLocaleLowerCase('ru')}`).join(', ')}.`
    : ''
  const lead = product.price && product.price > 0
    ? `Цена на сайте${name ? ` для позиции ${name}` : ''} — ориентир, итоговая зависит от партии.`
    : `Цена${name ? ` позиции ${name}` : ''} зависит от партии, поэтому на сайте её нет.`
  return {
    // Опорное слово «позиция» — вопрос не согласуется с числом и родом названия.
    question: name ? `Какая цена у позиции ${name}?` : 'Как узнать цену?',
    answer: `${lead}${tiers} Цену под ваш объём назовёт менеджер по заявке.`,
  }
}

/** Те же три случая и сроки, что на плашке «Наличие» этой карточки. */
function stockItem(product: FaqProduct, name: string | null): FaqItem {
  const stock = Number(product.stock) || 0
  const subject = name ? `Позиция ${name}` : 'Эта позиция'
  const answer = stock > 100
    ? `Да, ${name ?? 'позиция'} в наличии, отгрузка 1–3 дня.`
    : stock > 0
      ? `Остаток${name ? ` по позиции ${name}` : ''} — ${stock} шт.`
      : `${subject} — под заказ, срок 7–14 дней.`
  return { question: name ? `Есть ли ${name} в наличии?` : 'Есть ли товар в наличии?', answer }
}

/** У б/у и старогодных сертификаты и паспорта качества не обещаем (решение пользователя 28.09.2026). */
function paymentItem(old: boolean): FaqItem {
  const papers = old ? '' : ' сертификаты и паспорта качества,'
  return {
    question: 'Как оплатить и какие будут документы?',
    answer: `Безналичный расчёт по счёту, с НДС 22 % или без НДС. Даём договор поставки, УПД,${papers} транспортную или ж/д накладную; ЭДО — через СБИС.`,
    link: PAYMENT_LINK,
  }
}

function deliveryItem(group: ProductGroup): FaqItem {
  const ways = group === 'heavy'
    ? 'Крупные партии отправляем вагонами, небольшие — автотранспортом.'
    : 'Везём автотранспортом — на объект или на ваш склад, крупные партии — вагоном.'
  return {
    question: 'Как доставляете и можно ли забрать самим?',
    answer: `${ways} Склады — в Зеленодольске и Екатеринбурге, самовывоз — из Зеленодольска. Груз на нашем автотранспорте застрахован.`,
    link: DELIVERY_LINK,
  }
}

export function buildProductFaq(product: FaqProduct): FaqItem[] {
  const name = quoted(product.title)
  const section = product.category?.slug ?? product.categorySlug ?? undefined
  const subsection = product.subcategory?.slug ?? product.subcategorySlug ?? undefined
  const group = productGroup(section, subsection)
  // Б/у или раздел/подраздел старогодных — один признак для вопросов про стандарт, документы и «старогодный».
  const old = product.condition === 'used' || isStarogodnySection(section, subsection)
  const specs = readSpecs(product)
  const optional = [
    metersItem(specs),
    piecesItem(specs),
    gostItem(product, name, old),
    kitItem(specs),
    analogItem(specs),
    usedItem(specs, old),
  ].filter((item): item is FaqItem => item !== null)
  return [
    priceItem(product, name, group),
    stockItem(product, name),
    ...optional.slice(0, LIMIT - 4),
    paymentItem(old),
    deliveryItem(group),
  ]
}
