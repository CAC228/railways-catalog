import vike from 'vike/fetch'
import type { Server } from 'vike/types'
import { apiOrigin, siteUrl } from './src/renderer/server-config'
import { hostRedirect, publicRequestUrl } from './src/renderer/site-origin'
import { attachChatUpgrade } from './src/renderer/chat-proxy'
import type { Server as HttpServer } from 'node:http'

export default {
  async fetch(request: Request) {
    const moved = hostRedirect(request.url, request.method, siteUrl)
    if (moved) return new Response(null, { status: 301, headers: { Location: moved } })
    const url = new URL(request.url)
    if (url.pathname === '/sitemap.xml' || url.pathname === '/robots.txt' || url.pathname.startsWith('/sitemaps/') || url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) {
      try {
        const headers = new Headers(request.headers)
        headers.delete('host')
        const upstream = new Request(apiOrigin + url.pathname + url.search, request)
        // Авторизация передаётся явными заголовками. Автоповтор HTTP-auth в Node
        // не может переотправить поток тела и превращает ответы 401 в ошибку 502.
        return await fetch(upstream, { headers, credentials: 'omit', redirect: 'manual', signal: AbortSignal.timeout(30000) })
      } catch {
        return new Response('Сервис временно недоступен', { status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      }
    }
    // Страницы — только GET/HEAD, у них нет тела, поэтому запрос можно пересобрать с публичным адресом.
    const page = request.method === 'GET' || request.method === 'HEAD' ? new Request(publicRequestUrl(request.url, siteUrl), request) : request
    return vike.fetch(page)
  },
  prod: {
    port: Number(process.env.PORT || 3000), hostname: process.env.HOST || '0.0.0.0',
    onReady(server) { if (server.node?.server) attachChatUpgrade(server.node.server as HttpServer, apiOrigin) },
  },
} satisfies Server
