import { test } from 'node:test'
import assert from 'node:assert/strict'
import { plainText, formatSpec, jsonForHtml, paragraphs } from '../src/shared/lib/plain-text.ts'
import { getMetadata } from '../src/shared/seo/metadata.ts'
import { pageMeta, catalogMeta } from '../src/shared/seo/meta-traer.ts'
import { productMeta } from '../src/shared/seo/meta-tovary.ts'
import { buildProductFaq } from '../src/shared/lib/product-faq.ts'
import { detailRoute, productPath, rendersOnServer, isUnknownCatalogSelection, catalogPath, catalogSelection, legacyCatalogRedirect, isKnownPath } from '../src/shared/seo/route-data.ts'
import { siteOrigin, hostRedirect, publicRequestUrl } from '../src/renderer/site-origin.ts'
import { apiOriginList, fetchFromApi } from '../src/renderer/api-fetch.ts'

test('legacy HTML units become safe readable text without changing units', () => {
  assert.equal(formatSpec('0,25', 'м<sup>3</sup>'), '0,25 м³')
  assert.equal(plainText('м&lt;sup&gt;2&lt;/sup&gt; &amp; &nbsp;'), 'м² &')
  assert.equal(plainText('<script>alert(1)</script><b>15</b>&nbsp;мм'), '15 мм')
  assert.equal(plainText('x < 5'), 'x < 5')
  assert.equal(plainText('&#99999999;'), '')
})
test('JSON serialization cannot terminate the containing script', () => {
  const value = { description: '</script><script>alert(1)</script>\u2028&' }
  const json = jsonForHtml(value)
  assert.ok(!json.includes('<') && !json.includes('&'))
  assert.deepEqual(JSON.parse(json), value)
})
test('product metadata is unique, self canonical and uses the configured domain', () => {
  const product = { slug: 'bolt', title: 'Болт М22', gost: 'ГОСТ 16017', images: [], categorySlug: 'fasteners', description: 'Закладной болт' }
  const url = productPath(product)
  const data = { url, siteUrl: 'https://catalog.example', status: 200, ssr: true, product }
  const meta = getMetadata(url + '?utm_source=test', data)
  assert.equal(meta.canonical, 'https://catalog.example/catalog/fasteners/product/bolt')
  assert.match(meta.title, /Болт М22/)
  assert.match(meta.description, /^Болт М22\. /)
  assert.deepEqual(detailRoute(url), { kind: 'product', slug: 'bolt' })
})
test('public navigation clears noindex and stale service metadata', () => {
  const data = { url: '/', siteUrl: 'https://catalog.example', status: 200, ssr: false }
  assert.match(getMetadata('/cart', data).robots, /noindex/)
  assert.match(getMetadata('/about', data).robots, /^index/)
  assert.notEqual(getMetadata('/about', data).title, getMetadata('/contacts', data).title)
  assert.deepEqual(getMetadata('/about', data).jsonLd, [])
})

test('words for site search never reach meta tags or structured data', () => {
  const product = { slug: 'bolt', title: 'Болт М22', gost: 'ГОСТ 16017', images: [], categorySlug: 'fasteners', description: 'Описание на странице' }
  const url = productPath(product)
  const data = { url, siteUrl: 'https://catalog.example', status: 200, ssr: true, product }
  const plain = getMetadata(url, data)
  for (const descriptionTags of [undefined, null, '', 'болд балт м-22 м22 крепеж', '<b>М22</b> &quot;ГОСТ&quot;']) {
    const meta = getMetadata(url, { ...data, product: { ...product, descriptionTags } })
    assert.deepEqual(meta, plain)
    assert.match(meta.description, /^Болт М22\. Материалы ВСП в каталоге ПроРельс/)
    assert.ok(!JSON.stringify(meta).includes('болд'))
  }
})
test('category pagination has its own canonical; filter variants remain out of the index', () => {
  const data = { url: '/catalog', siteUrl: 'https://catalog.example', status: 200, ssr: false, categories: [{ slug: 'rails', name: 'Рельсы', description: 'Железнодорожные рельсы разных профилей', subcategories: [] }] }
  const meta = getMetadata('/catalog/rails?page=2', data)
  assert.equal(meta.canonical, 'https://catalog.example/catalog/rails?page=2')
  assert.match(meta.title, /страница 2/)
  assert.match(meta.robots, /^index/)
  assert.match(getMetadata('/catalog?search=rails', data).robots, /noindex/)
  for (const url of ['/catalog/rails?search=Р65', '/catalog/rails?sort=newest', '/catalog/rails?gost=7173', '/catalog/rails?attribute_type=r65', '/catalog/rails?category=rails']) {
    const variant = getMetadata(url, data)
    assert.match(variant.robots, /noindex/, url)
    assert.equal(variant.canonical, 'https://catalog.example/catalog/rails', url)
  }
})
test('sections live on static addresses; old ?category= addresses are moved there with a 301', () => {
  assert.equal(catalogPath(), '/catalog')
  assert.equal(catalogPath('rails'), '/catalog/rails')
  assert.equal(catalogPath('rails', 'r-65'), '/catalog/rails/r-65')
  assert.equal(catalogPath('', 'r-65'), '/catalog')
  assert.deepEqual(catalogSelection('/catalog'), { categorySlug: undefined, subcategorySlug: undefined })
  assert.deepEqual(catalogSelection('/catalog/rails'), { categorySlug: 'rails', subcategorySlug: undefined })
  assert.deepEqual(catalogSelection('/catalog/rails/r-65'), { categorySlug: 'rails', subcategorySlug: 'r-65' })
  for (const path of ['/catalog/rails/r-65/product/r65', '/catalog/rails/product/r65', '/catalogue', '/services/x', '/catalog/%E0'])
    assert.equal(catalogSelection(path), null, path)
  const legacy = (url) => { const parsed = new URL(url, 'https://x'); return legacyCatalogRedirect(parsed.pathname, parsed.searchParams) }
  assert.equal(legacy('/catalog?category=rails'), '/catalog/rails')
  assert.equal(legacy('/catalog?category=rails&subcategory=r-65'), '/catalog/rails/r-65')
  assert.equal(legacy('/catalog?category=rails&subcategory=r-65&page=3&search=%D1%80'), '/catalog/rails/r-65?page=3&search=%D1%80')
  assert.equal(legacy('/catalog?category=rails&subcategory='), '/catalog/rails')
  for (const url of ['/catalog', '/catalog?search=x', '/catalog?category=', '/catalog/rails?category=bolts', '/about?category=rails'])
    assert.equal(legacy(url), null, url)
  const categories = [{ slug: 'rails', name: 'Рельсы', description: 'Описание', subcategories: [{ slug: 'r-65', name: 'Р65' }] }]
  const meta = getMetadata('/catalog/rails/r-65', { url: '/catalog/rails/r-65', siteUrl: 'https://catalog.example', status: 200, ssr: true, categories })
  assert.equal(meta.canonical, 'https://catalog.example/catalog/rails/r-65')
  assert.match(meta.robots, /^index/)
  assert.ok(isKnownPath('/catalog/rails') && isKnownPath('/catalog/rails/r-65'))
})
test('product descriptions keep their paragraphs', () => {
  assert.deepEqual(paragraphs('Первый абзац.\r\n\r\nВторой абзац.\n\n\nТретий'), ['Первый абзац.', 'Второй абзац.', 'Третий'])
  assert.deepEqual(paragraphs('Одна строка\nс переносом'), ['Одна строка с переносом'])
  assert.deepEqual(paragraphs('  \n\n  '), [])
  assert.deepEqual(paragraphs(null), [])
  assert.deepEqual(paragraphs('<b>15</b>&nbsp;мм\n\nдалее'), ['15 мм', 'далее'])
})

test('the retired tatrels.ru origin becomes traer.ru in canonical and social links', () => {
  for (const old of ['https://tatrels.ru', 'https://tatrels.ru/', 'http://tatrels.ru', 'https://www.tatrels.ru', 'https://www.traer.ru']) {
    assert.equal(siteOrigin(old), 'https://traer.ru')
  }
  assert.equal(siteOrigin('https://traer.ru'), 'https://traer.ru')
  assert.equal(siteOrigin('http://localhost:3000'), 'http://localhost:3000')
  assert.throws(() => siteOrigin('https://tatrels.ru/catalog'), /must be an HTTP\(S\) origin/)
  assert.throws(() => siteOrigin(undefined), /SITE_URL is required/)

  const service = { slug: 'rezka-rels', title: 'Резка рельсов', description: 'Режем рельсы.', image: '/uploads/rezka.jpg' }
  const url = '/services/rezka-rels'
  const meta = getMetadata(url, { url, siteUrl: siteOrigin('https://tatrels.ru'), status: 200, ssr: true, service })
  assert.equal(meta.canonical, 'https://traer.ru/services/rezka-rels')
  assert.equal(meta.image, 'https://traer.ru/uploads/rezka.jpg')
  assert.ok(!JSON.stringify(meta).includes('tatrels.ru/'))

  const home = getMetadata('/', { url: '/', siteUrl: siteOrigin('https://tatrels.ru'), status: 200, ssr: true })
  const organization = home.jsonLd.find((item) => item['@type'] === 'Organization')
  assert.equal(organization.url, 'https://traer.ru')
  assert.equal(organization.email, 'zakaz@prorelsa.ru')
  assert.deepEqual([organization.name, organization.alternateName, organization.legalName, organization.taxID], ['ИНВИА', undefined, 'ООО «ИНВИА»', '1648052000'], 'brand and legal entity are tied together')
  assert.equal(meta.jsonLd[0].provider.legalName, 'ООО «ИНВИА»')
  assert.ok(!JSON.stringify(home).includes('tatrels'))
})

test('SSR falls back to the public API origin when the configured one fails', async () => {
  assert.deepEqual(apiOriginList('http://api:3001', 'https://traer.ru', 'https://traer.ru'), ['http://api:3001', 'https://traer.ru'])
  const calls = []
  const fakeFetch = (responses) => async (url) => {
    calls.push(url)
    const next = responses.shift()
    if (next instanceof Error) throw next
    return new Response('{}', { status: next })
  }
  const origins = ['http://dead', 'https://traer.ru']

  const recovered = await fetchFromApi(origins, '/api/product/bolt', 1000, fakeFetch([new Error('ECONNREFUSED'), 200]))
  assert.equal(recovered.status, 200)
  assert.deepEqual(calls, ['http://dead/api/product/bolt', 'https://traer.ru/api/product/bolt'])

  calls.length = 0
  assert.equal((await fetchFromApi(origins, '/api/product/x', 1000, fakeFetch([502, 200]))).status, 200)
  assert.equal(calls.length, 2)

  calls.length = 0
  assert.equal((await fetchFromApi(origins, '/api/product/x', 1000, fakeFetch([404]))).status, 404)
  assert.equal(calls.length, 1, 'a real 404 must not be retried')

  assert.equal((await fetchFromApi(origins, '/api/product/x', 1000, fakeFetch([500, 503]))).status, 503)
  await assert.rejects(fetchFromApi(origins, '/api/product/x', 1000, fakeFetch([new Error('a'), new Error('b')])), /b/)
})

test('meta from the table wins; templates in the same style cover what the table lacks', () => {
  const at = (url, extra = {}) => getMetadata(url, { url, siteUrl: 'https://traer.ru', status: 200, ssr: true, ...extra }, productMeta)
  assert.deepEqual([at('/about').title, at('/about').description], pageMeta['/about'])
  const service = { slug: 'rezka-rels', title: 'Резка рельсов', description: 'Режем рельсы.' }
  assert.deepEqual([at('/services/rezka-rels', { service }).title, at('/services/rezka-rels', { service }).description], pageMeta['/services/rezka-rels'])
  assert.equal(at('/services/novaya', { service: { ...service, slug: 'novaya' } }).title, 'Резка рельсов: услуга и расчёт стоимости | ПроРельс')

  const categories = [{ slug: 'zhd-shpaly', name: 'ЖД шпалы', description: 'Описание из базы', subcategories: [{ slug: 'derevyannye-shpaly', name: 'Деревянные шпалы' }, { slug: 'novaya', name: 'Новая категория' }] }]
  assert.equal(at('/catalog/zhd-shpaly', { categories }).title, catalogMeta['zhd-shpaly'][0])
  assert.equal(at('/catalog/zhd-shpaly/derevyannye-shpaly', { categories }).description, catalogMeta['zhd-shpaly/derevyannye-shpaly'][1])
  assert.equal(at('/catalog/zhd-shpaly?page=2', { categories }).title, catalogMeta['zhd-shpaly'][0].replace(/ \| ПроРельс$/, ' — страница 2 | ПроРельс'))
  assert.equal(at('/catalog/zhd-shpaly/novaya', { categories }).title, 'Новая категория: купить, цена | ПроРельс')

  const slug = Object.keys(productMeta)[0]
  const product = { slug, title: 'Название из базы', images: [], categorySlug: 'x', description: 'Текст карточки' }
  const own = at(productPath(product), { product })
  assert.deepEqual([own.title, own.description, own.socialDescription], [...productMeta[slug], productMeta[slug][1]])
  const fresh = { ...product, slug: 'novyj-tovar', title: 'Новый товар' }
  assert.equal(at(productPath(fresh), { product: fresh }).title, 'Новый товар: купить, цена | ПроРельс')
  assert.equal(at(productPath(product), { product: { ...product, descriptionTags: 'слова для поиска по сайту' } }).description, productMeta[slug][1], 'search words do not replace the table')
})
test('the table covers every public page and gives each page its own title', () => {
  for (const path of ['/', '/catalog', '/services', '/about', '/contacts', '/delivery', '/calculator', '/privacy']) assert.ok(pageMeta[path]?.[0] && pageMeta[path]?.[1], path)
  const titles = [...Object.values(pageMeta), ...Object.values(catalogMeta), ...Object.values(productMeta)].map(([title]) => title)
  assert.equal(new Set(titles).size, titles.length)
})
test('public pages are rendered on the server; cart and admin stay in the browser', () => {
  for (const path of ['/', '/catalog', '/services', '/about', '/contacts', '/delivery', '/price', '/privacy', '/catalog/rails/product/r65', '/services/rezka', '/missing']) assert.equal(rendersOnServer(path), true, path)
  for (const path of ['/cart', '/admin', '/admin/login', '/admin/products']) assert.equal(rendersOnServer(path), false, path)
  assert.equal(rendersOnServer('/administration'), true)
})
test('product page carries Product markup without an offer until a price is set', () => {
  const product = { sku: 'TM-0033', slug: 'bolt', title: 'Болт закладной М22х175', gost: 'ГОСТ 16017-79', condition: 'new', price: null, stock: 0, images: ['/uploads/bolt.jpg'], categorySlug: 'zhd-krepezh', subcategorySlug: 'bolty', category: { name: 'ЖД крепеж' }, subcategory: { name: 'Болты' }, description: 'Закладной болт крепит подкладку к шпале.', specs: [{ label: 'ГОСТ', value: '16017-79.' }, { label: 'Масса', value: '0,65', unit: 'кг' }, { label: 'Пусто', value: '' }] }
  const url = productPath(product)
  const markup = (value) => getMetadata(url, { url, siteUrl: 'https://traer.ru', status: 200, ssr: true, product: value }).jsonLd.find((item) => item['@type'] === 'Product')
  const item = markup(product)
  assert.equal(item.name, 'Болт закладной М22х175')
  assert.equal(item.sku, 'TM-0033')
  assert.equal(item.url, 'https://traer.ru/catalog/zhd-krepezh/bolty/product/bolt')
  assert.deepEqual(item.image, ['https://traer.ru/uploads/bolt.jpg'])
  assert.equal(item.category, 'ЖД крепеж / Болты')
  assert.equal(item.itemCondition, 'https://schema.org/NewCondition')
  assert.deepEqual(item.additionalProperty.map((property) => [property.name, property.value, property.unitText]), [['ГОСТ', 'ГОСТ 16017-79', undefined], ['Масса', '0,65', 'кг']])
  assert.equal(item.offers, undefined)
  assert.equal(getMetadata(url, { url, siteUrl: 'https://traer.ru', status: 200, ssr: true, product }).jsonLd.filter((entry) => entry['@type'] === 'BreadcrumbList').length, 0, 'breadcrumbs are already microdata in the page')

  const priced = markup({ ...product, price: 1250, stock: 40, images: [] })
  assert.deepEqual(priced.offers, { '@type': 'Offer', price: 1250, priceCurrency: 'RUB', availability: 'https://schema.org/InStock', url: item.url, itemCondition: 'https://schema.org/NewCondition', seller: { '@type': 'Organization', name: 'ИНВИА', legalName: 'ООО «ИНВИА»', taxID: '1648052000' } })
  assert.equal(priced.image, undefined)
  assert.equal(markup({ ...product, price: 900, stock: 0 }).offers.availability, 'https://schema.org/BackOrder')
})
test('www and the retired domain redirect to the same page on traer.ru; the main host keeps https in redirects', () => {
  const site = 'https://traer.ru'
  assert.equal(hostRedirect('http://www.traer.ru/catalog?category=rails&page=2', 'GET', site), 'https://traer.ru/catalog?category=rails&page=2')
  assert.equal(hostRedirect('http://tatrels.ru/catalog/zhd/product/bolt', 'HEAD', site), 'https://traer.ru/catalog/zhd/product/bolt')
  assert.equal(hostRedirect('http://www.tatrels.ru/', 'GET', site), 'https://traer.ru/')
  assert.equal(hostRedirect('http://traer.ru/catalog', 'GET', site), null)
  assert.equal(hostRedirect('http://www.traer.ru/api/request', 'POST', site), null, 'form posts are never redirected')
  assert.equal(hostRedirect('http://app:3000/catalog', 'GET', site), null, 'internal requests pass through')
  assert.equal(hostRedirect('http://tatrels.ru/', 'GET', 'http://localhost:3000'), null, 'old domain maps only to the real site')
  assert.equal(hostRedirect('http://www.localhost:3000/', 'GET', 'http://localhost:3000'), 'http://localhost:3000/')

  assert.equal(publicRequestUrl('http://traer.ru/catalog/?page=2', site), 'https://traer.ru/catalog/?page=2')
  assert.equal(publicRequestUrl('http://127.0.0.1:3011/catalog/', site), 'http://127.0.0.1:3011/catalog/')
  assert.equal(publicRequestUrl('http://localhost:3000/x', 'http://localhost:3000'), 'http://localhost:3000/x')
})

test('moved product slugs lead straight to a current slug', async () => {
  const { PRODUCT_SLUG_MOVES, movedProductSlug } = await import('../src/shared/seo/product-slug-moves.ts')
  const olds = Object.keys(PRODUCT_SLUG_MOVES)
  const news = Object.values(PRODUCT_SLUG_MOVES)
  assert.equal(new Set(news).size, news.length)
  for (const slug of news) assert.equal(movedProductSlug(slug), undefined)
  assert.ok(olds.every((slug) => /^[a-z0-9-]+$/.test(slug)) && news.every((slug) => /^[a-z0-9-]+$/.test(slug)))
  assert.equal(movedProductSlug('bashmak-kolesosbrasyvayushchij-ksb-r'), 'bashmak-kolesosbrasyvayushchij-ksb-r-tm0376')
  assert.equal(movedProductSlug('__proto__'), undefined)
  assert.equal(movedProductSlug('bolt'), undefined)
})

test('product page carries FAQPage with the same questions and answers as the visible block; Product markup stays', () => {
  const product = { slug: 'r65', title: 'Железнодорожные рельсы Р-65', gost: 'ГОСТ Р 51685-2013', price: null, stock: 0, condition: 'new', images: [], categorySlug: 'zheleznodorozhnye-relsy', sku: 'TM-0039', description: 'Рельс', specs: [{ label: 'Метров в тонне', value: '15,4', unit: 'м' }] }
  const url = productPath(product)
  const meta = getMetadata(url, { url, siteUrl: 'https://catalog.example', status: 200, ssr: true, product })
  assert.deepEqual(meta.jsonLd.map((item) => item['@type']), ['Product', 'FAQPage'])
  const faq = meta.jsonLd[1]
  assert.equal(faq['@context'], 'https://schema.org')
  const visible = buildProductFaq(product)
  assert.deepEqual(faq.mainEntity, visible.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })))
  assert.ok(faq.mainEntity.length >= 4)
  assert.ok(!JSON.stringify(meta.jsonLd[0]).includes('Question'))
  assert.equal(getMetadata('/about', { url: '/about', siteUrl: 'https://catalog.example', status: 200, ssr: false }).jsonLd.length, 0)
})

test('catalog address with a section or category missing from the database is a 404, not an empty catalog', () => {
  const categories = [{ slug: 'rails', subcategories: [{ slug: 'r-65' }] }, { slug: 'bolts', subcategories: [] }]
  const unknown = (path) => isUnknownCatalogSelection(catalogSelection(path), categories)
  for (const path of ['/catalog', '/catalog/rails', '/catalog/rails/r-65', '/catalog/bolts'])
    assert.equal(unknown(path), false, path)
  for (const path of ['/catalog/test', '/catalog/rails/test', '/catalog/bolts/r-65', '/catalog/RAILS'])
    assert.equal(unknown(path), true, path)
  const meta = getMetadata('/catalog/test', { url: '/catalog/test', siteUrl: 'https://catalog.example', status: 404, ssr: true, categories })
  assert.equal(meta.title, 'Страница не найдена | ПроРельс')
  assert.match(meta.robots, /noindex/)
})
