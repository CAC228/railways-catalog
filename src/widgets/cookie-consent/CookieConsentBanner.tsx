import { useEffect, useRef, useSyncExternalStore } from 'react'
import { Link, useLocation } from 'react-router'
import { FiShield } from 'react-icons/fi'
import { Button } from '@/shared/ui/Button'
import { useCookieConsent } from '@/shared/privacy/use-cookie-consent'
import { saveCookieConsent } from '@/shared/privacy/cookie-consent'

const subscribeHydration = () => () => {}

/** Уведомление о cookies: выбирать нечего, Метрика работает у всех, «Понятно» скрывает его на год. */
export function CookieConsentBanner() {
  const choice = useCookieConsent()
  const { pathname } = useLocation()
  const ready = useSyncExternalStore(subscribeHydration, () => true, () => false)
  const banner = useRef<HTMLElement>(null)
  useEffect(() => {
    const element = banner.current
    if (!element) return
    const updateClearance = () => {
      const bottom = Number.parseFloat(getComputedStyle(element).bottom) || 0
      document.documentElement.style.setProperty(
        '--cookie-banner-clearance',
        `${Math.ceil(element.getBoundingClientRect().height + bottom + 12)}px`,
      )
    }
    updateClearance()
    const observer = new ResizeObserver(updateClearance)
    observer.observe(element)
    window.addEventListener('resize', updateClearance)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateClearance)
      document.documentElement.style.removeProperty('--cookie-banner-clearance')
    }
  }, [ready, choice, pathname])
  if (!ready || pathname.startsWith('/admin') || choice) return null
  return (
    <section ref={banner} aria-labelledby="cookie-consent-title" className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-h-[calc(100%-1.5rem)] max-w-5xl overflow-y-auto rounded-xl border border-border bg-card p-4 text-foreground shadow-[0_8px_40px_rgb(28_31_34/0.18)] sm:inset-x-6 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))] sm:p-5">
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4">
        <div aria-hidden="true" className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-primary sm:flex"><FiShield className="h-5 w-5" /></div>
        <div className="min-w-0">
          <h2 id="cookie-consent-title" className="text-sm font-bold sm:text-base">Cookies на нашем сайте</h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
            Cookies сохраняют корзину и настройки сайта, Яндекс Метрика по ним считает посещения.{' '}
            <Link to="/privacy#cookies" className="font-semibold text-primary underline underline-offset-2">Подробнее</Link>
          </p>
        </div>
        <Button size="sm" className="w-full sm:w-auto" onClick={() => saveCookieConsent('accepted')}>Понятно</Button>
      </div>
    </section>
  )
}
