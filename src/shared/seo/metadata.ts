import { plainText } from '../lib/plain-text.ts'
import { PHONE_CITY, PHONE_MOBILE } from '../lib/phones.ts'
import { buildProductFaq } from '../lib/product-faq.ts'
import { catalogPath, catalogSelection, detailRoute, isKnownPath, productPath, type PageData } from './route-data.ts'
import { catalogMeta, pageMeta, type MetaPair } from './meta-traer.ts'

export type Metadata = { title: string; description: string; socialDescription: string; canonical: string; robots: string; image: string; jsonLd: Record<string, unknown>[] }
// Title и description страниц, услуг, каталога и товаров — из таблицы мета-тегов (meta-traer.ts, meta-tovary.ts).
// Ниже — запасные шаблоны в том же стиле: для корзины и для того, что появится на сайте позже таблицы.
const pages: Record<string, MetaPair> = {
  '/cart': ['Корзина — заявка на материалы | ИНВИА', 'Выбранные материалы и количество для заявки в ИНВИА. Укажите контакты, чтобы согласовать стоимость и поставку.'],
}
const notFound: MetaPair = ['Страница не найдена | ИНВИА', 'Страница не найдена. Перейдите в каталог материалов или свяжитесь с ИНВИА.']

// Бренд — группа компаний ИНВИА, юрлицо — ООО «ИНВИА».
const company = { '@type': 'Organization', name: 'ИНВИА', legalName: 'ООО «ИНВИА»', taxID: '1648052000' }

const summary = (value: string) => { const text = plainText(value); return text.length <= 170 ? text : text.slice(0, 167).replace(/\s+\S*$/, '') + '…' }

/** `products` — мета товаров из meta-tovary.ts: сервер передаёт её всегда, браузер — когда догрузит. */
export function getMetadata(urlValue: string, data: PageData, products: Record<string, MetaPair> = {}): Metadata {
  const url = new URL(urlValue, data.siteUrl)
  const path = url.pathname.replace(/\/$/, '') || '/'
  let [title, description] = pageMeta[path] ?? pages[path] ?? notFound
  let canonicalPath = path
  let noindex = data.status >= 400 || path === '/cart' || path.startsWith('/admin') || !isKnownPath(path)
  const jsonLd: Record<string, unknown>[] = []
  let image = `${data.siteUrl}/logo.png`
  let searchDescription = ''
  if (path.startsWith('/admin')) [title, description] = ['Управление сайтом | ИНВИА', 'Вход в панель управления ИНВИА.']
  const selection = catalogSelection(path)
  if (selection) {
    const category = data.categories?.find((item) => item.slug === selection.categorySlug)
    const subcategory = category?.subcategories?.find((item) => item.slug === selection.subcategorySlug)
    const params = new URLSearchParams()
    if (category) {
      const label = subcategory?.name ?? category.name
      ;[title, description] = catalogMeta[subcategory ? `${category.slug}/${subcategory.slug}` : category.slug] ?? [
        `${label}: купить, цена | ИНВИА`,
        subcategory ? `${label}: позиции каталога ИНВИА, ГОСТ и технические характеристики. Цена по запросу, доставка по России и СНГ.` : category.description,
      ]
      canonicalPath = catalogPath(category.slug, subcategory?.slug)
    } else [title, description] = pageMeta['/catalog'] ?? [title, description]
    const page = Number(url.searchParams.get('page'))
    if (Number.isInteger(page) && page > 1) {
      params.set('page', String(page))
      title = title.endsWith(' | ИНВИА') ? title.replace(/ \| ИНВИА$/, ` — страница ${page} | ИНВИА`) : `${title} — страница ${page}`
      description += ` Страница ${page}.`
    }
    canonicalPath += params.size ? `?${params}` : ''
    // Поиск, фильтры и сортировка (?search=, ?gost=, ?sort=…) — варианты раздела, а не страницы: в индекс не пускаем.
    noindex ||= [...url.searchParams.keys()].some((key) => !['page', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].includes(key))
    noindex ||= (!!selection.categorySlug && !category) || (!!selection.subcategorySlug && !subcategory)
    if (data.status === 404) [title, description] = notFound
  }
  const route = detailRoute(path)
  if (route?.kind === 'product' && data.product?.slug === route.slug) {
    const product = data.product
    const productTitle = plainText(product.title)
    const productText = plainText(product.description)
    ;[title, description] = products[product.slug] ?? [`${productTitle}: купить, цена | ИНВИА`, `${productTitle}. Материалы ВСП в каталоге ИНВИА. Цена по запросу, отгрузка от 48 часов, доставка по России и СНГ.`]
    // «SEO-описание» из админки, если заполнено, важнее таблицы — так одну карточку можно поправить без выкатки.
    searchDescription = plainText(product.descriptionTags)
    canonicalPath = productPath(product)
    if (product.images[0]) image = new URL(product.images[0], data.siteUrl).href
    // Хлебные крошки уже размечены microdata в Breadcrumbs — здесь только сам товар.
    const condition = { new: 'https://schema.org/NewCondition', used: 'https://schema.org/UsedCondition' }[product.condition as string]
    const properties = [...(product.gost ? [{ '@type': 'PropertyValue', name: 'ГОСТ', value: plainText(product.gost) }] : []), ...(product.specs ?? []).filter((spec) => !product.gost || plainText(spec.label).toLocaleLowerCase('ru') !== 'гост').map((spec) => ({ '@type': 'PropertyValue', name: plainText(spec.label), value: plainText(spec.value), ...(plainText(spec.unit) ? { unitText: plainText(spec.unit) } : {}) }))].filter((item) => item.name && item.value)
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'Product', name: productTitle, sku: product.sku, url: data.siteUrl + canonicalPath,
      ...(productText ? { description: productText } : {}),
      ...(product.images.length ? { image: product.images.map((item) => new URL(item, data.siteUrl).href) } : {}),
      ...(product.category?.name ? { category: [product.category.name, product.subcategory?.name].filter(Boolean).map(plainText).join(' / ') } : {}),
      ...(condition ? { itemCondition: condition } : {}),
      ...(properties.length ? { additionalProperty: properties } : {}),
      // Цены на сайте пока не заполнены; предложение без цены поисковики считают ошибкой, поэтому только при цене.
      ...(product.price && product.price > 0 ? { offers: { '@type': 'Offer', price: product.price, priceCurrency: 'RUB', availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder', url: data.siteUrl + canonicalPath, ...(condition ? { itemCondition: condition } : {}), seller: company } } : {}),
    })
    // Те же пары, что в блоке «Частые вопросы» карточки: одна функция на оба места, разойтись им негде.
    const faq = buildProductFaq(product)
    if (faq.length) jsonLd.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) })
  } else if (route?.kind === 'service' && data.service?.slug === route.slug) {
    const service = data.service
    ;[title, description] = pageMeta[`/services/${service.slug}`] ?? [`${plainText(service.title)}: услуга и расчёт стоимости | ИНВИА`, `${plainText(service.title)}. ${plainText(service.description)} Отправьте заявку в ИНВИА для расчёта стоимости.`]
    canonicalPath = `/services/${encodeURIComponent(service.slug)}`
    if (service.image) image = new URL(service.image, data.siteUrl).href
    jsonLd.push({ '@context': 'https://schema.org', '@type': 'Service', name: plainText(service.title), description: plainText(service.fullDescription || service.description), url: data.siteUrl + canonicalPath, provider: { ...company, url: data.siteUrl } })
  } else if (route) {
    title = data.status === 404 ? (route.kind === 'product' ? 'Товар не найден | ИНВИА' : 'Услуга не найдена | ИНВИА') : 'Загрузка страницы | ИНВИА'
    description = data.status >= 500 ? 'Не удалось загрузить данные. Повторите попытку позже.' : 'Каталог материалов и услуг ИНВИА.'
  }
  if (data.status >= 500) title = 'Страница временно недоступна | ИНВИА'
  if (path === '/') jsonLd.push({ '@context': 'https://schema.org', ...company, url: data.siteUrl, logo: `${data.siteUrl}/logo.png`, telephone: [PHONE_CITY, PHONE_MOBILE].filter(Boolean), email: 'zakaz@prorelsa.ru' })
  const socialDescription = summary(description)
  return { title, description: searchDescription || socialDescription, socialDescription, canonical: data.siteUrl + canonicalPath, robots: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large', image, jsonLd }
}
