import { renderToString } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import type { PageContextServer } from 'vike/types'
import { AppRoot } from '@/renderer/AppRoot'
import { getMetadata } from '@/shared/seo/metadata'
import { productMeta } from '@/shared/seo/meta-tovary'
import type { PageData } from '@/shared/seo/route-data'
import { siteUrl } from '@/renderer/server-config'
import { jsonForHtml } from '@/shared/lib/plain-text'
import { metrikaIds } from '@/shared/analytics/metrika'

// Пиксель Метрики для посетителей без JavaScript — как в коде счётчика из кабинета.
const metrikaNoscript = metrikaIds.map(id => `<noscript><div><img src="https://mc.yandex.ru/watch/${id}" style="position:absolute; left:-9999px;" alt="" /></div></noscript>`).join('')

export function onRenderHtml(pageContext: PageContextServer) {
  const data = (pageContext.data ?? pageContext.abortReason ?? { url: pageContext.urlOriginal, siteUrl, status: pageContext.is404 ? 404 : 500, ssr: true }) as PageData
  const meta = getMetadata(data.url, data, productMeta)
  const html = data.ssr ? renderToString(<AppRoot data={data} server />) : ''
  return {
    documentHtml: escapeInject`<!DOCTYPE html>
      <html lang="ru"><head>
      <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#1c1f22" /><link rel="icon" href="/favicon.ico?v=2026-10-09" sizes="32x32" /><link rel="icon" href="/favicon.svg?v=2026-10-09" type="image/svg+xml" /><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2026-10-09" />
      <meta name="google-site-verification" content="Gb-69uubJew9MOxsK3Cl-z5IAMLNVpHmYKjMNE-o-bI" />
      <meta name="google-site-verification" content="f-ZuXpPViE8132C3rBaGD-G1fxgUyyVxv92Qnz4SGDk" />
      <title>${meta.title}</title><meta name="description" content="${meta.description}" />
      <meta name="robots" content="${meta.robots}" /><link rel="canonical" href="${meta.canonical}" />
      <meta property="og:type" content="website" /><meta property="og:site_name" content="ИНВИА" /><meta property="og:locale" content="ru_RU" />
      <meta property="og:title" content="${meta.title}" /><meta property="og:description" content="${meta.socialDescription}" /><meta property="og:url" content="${meta.canonical}" /><meta property="og:image" content="${meta.image}" />
      <meta name="twitter:card" content="summary" /><meta name="twitter:title" content="${meta.title}" /><meta name="twitter:description" content="${meta.socialDescription}" /><meta name="twitter:image" content="${meta.image}" />
      ${meta.jsonLd.length ? escapeInject`<script id="seo-json-ld" type="application/ld+json">${dangerouslySkipEscape(jsonForHtml(meta.jsonLd))}</script>` : ''}
      </head><body><div id="root">${dangerouslySkipEscape(html)}</div>${dangerouslySkipEscape(metrikaNoscript)}</body></html>`,
    pageContext: { data },
  }
}
