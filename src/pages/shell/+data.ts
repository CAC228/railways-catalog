import type { PageContextServer } from 'vike/types'
import { redirect, render } from 'vike/abort'
import { apiOrigins, siteUrl } from '@/renderer/server-config'
import { fetchFromApi } from '@/renderer/api-fetch'
import { catalogSelection, detailRoute, isKnownPath, isUnknownCatalogSelection, legacyCatalogRedirect, productPath, rendersOnServer, type PageData } from '@/shared/seo/route-data'
import { movedProductSlug } from '@/shared/seo/product-slug-moves'

export async function data(pageContext: PageContextServer): Promise<PageData> {
  const url = new URL(pageContext.urlOriginal, siteUrl)
  const pathname = url.pathname.replace(/\/$/, '') || '/'
  if (pathname !== url.pathname) throw redirect(pathname + url.search, 301)
  const legacy = legacyCatalogRedirect(pathname, url.searchParams)
  if (legacy) throw redirect(legacy, 301)
  const catalog = catalogSelection(pathname)
  const route = detailRoute(pathname)
  const result: PageData = { url: pathname + url.search, siteUrl, status: isKnownPath(pathname) ? 200 : 404, ssr: rendersOnServer(pathname) }
  const categories = route || catalog
    ? fetchFromApi(apiOrigins, '/api/product-category?limit=100', 8000).then(async (response) => response.ok ? (await response.json()).items : undefined).catch(() => undefined)
    : Promise.resolve(undefined)
  if (route) {
    try {
      let response = await fetchFromApi(apiOrigins, `/api/${route.kind}/${encodeURIComponent(route.slug)}`, 8000)
      const moved = route.kind === 'product' && response.status === 404 ? movedProductSlug(route.slug) : undefined
      if (moved) response = await fetchFromApi(apiOrigins, `/api/product/${encodeURIComponent(moved)}`, 8000)
      if (response.status === 404) result.status = 404
      else if (!response.ok) result.status = 503
      else {
        const value = await response.json()
        if (route.kind === 'product') result.product = value
        else result.service = value
      }
    } catch { result.status = 503 }
  }
  result.categories = await categories
  // Без списка категорий (API не ответил) проверить адрес нечем — каталог открывается как раньше.
  if (catalog && result.categories && isUnknownCatalogSelection(catalog, result.categories)) result.status = 404
  if (result.product) {
    const canonical = productPath(result.product)
    if (pathname !== canonical) throw redirect(canonical + url.search, 301)
  }
  if (result.service) {
    const canonical = `/services/${encodeURIComponent(result.service.slug)}`
    if (pathname !== canonical) throw redirect(canonical + url.search, 301)
  }
  if (result.status >= 400) throw render(result.status === 404 ? 404 : 503, result)
  return result
}
