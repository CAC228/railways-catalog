import { request as httpRequest, type Server } from 'node:http'
import { request as httpsRequest } from 'node:https'

/** Fetch proxies cannot forward WebSocket upgrades; bridge only this fixed API route. */
export function attachChatUpgrade(server: Server, apiOrigin: string) {
  server.on('upgrade', (request, downstream, head) => {
    let url: URL
    try {
      url = new URL(request.url || '/', 'http://localhost')
    } catch {
      downstream.destroy()
      return
    }
    if (url.pathname.replace(/\/$/, '') !== '/api/chat/socket.io') {
      downstream.destroy()
      return
    }
    const target = new URL(url.pathname + url.search, apiOrigin)
    const upstream = (
      target.protocol === 'https:' ? httpsRequest : httpRequest
    )(target, {
      method: 'GET',
      headers: { ...request.headers, host: target.host },
      timeout: 10000,
    })
    downstream.on('error', () => upstream.destroy())
    downstream.on('close', () => upstream.destroy())
    upstream.on('error', () => downstream.destroy())
    upstream.on('timeout', () => {
      upstream.destroy()
      downstream.destroy()
    })
    upstream.on('response', (response) => {
      response.resume()
      downstream.destroy()
    })
    upstream.on('upgrade', (response, tunnel, upstreamHead) => {
      upstream.setTimeout(0)
      tunnel.setTimeout(0)
      const headers = response.rawHeaders.reduce<string[]>(
        (lines, value, index, all) => {
          if (index % 2 === 0) lines.push(`${value}: ${all[index + 1]}`)
          return lines
        },
        [],
      )
      downstream.write(
        `HTTP/1.1 101 Switching Protocols\r\n${headers.join('\r\n')}\r\n\r\n`,
      )
      if (upstreamHead.length) downstream.write(upstreamHead)
      if (head.length) tunnel.write(head)
      tunnel.on('error', () => downstream.destroy())
      tunnel.on('close', () => downstream.destroy())
      downstream.on('close', () => tunnel.destroy())
      downstream.pipe(tunnel).pipe(downstream)
    })
    upstream.end()
  })
}
