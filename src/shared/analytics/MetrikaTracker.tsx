import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { metrikaHit, startMetrika, stopMetrika } from './metrika'

/**
 * Метрика включается сразу у всех посетителей, кроме админки.
 * Начальный просмотр учитывает init.
 */
export function MetrikaTracker() {
  const { pathname, search } = useLocation()
  const previous = useRef<string | null>(null)
  const active = useRef(false)

  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      if (active.current) {
        active.current = false
        stopMetrika()
        window.location.reload()
      }
      previous.current = null
      return
    }
    active.current = true
    const initialized = startMetrika()
    const current = pathname + search
    if (!initialized && previous.current !== null && previous.current !== current) {
      metrikaHit(window.location.origin + current, window.location.origin + previous.current)
    }
    previous.current = current
  }, [pathname, search])

  return null
}
