import { useSyncExternalStore } from 'react'
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
  if (!ready || pathname.startsWith('/admin') || choice) return null
  return (
    <section aria-labelledby="cookie-consent-title" className="fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-40 mx-auto max-h-[85dvh] max-w-5xl overflow-y-auto rounded-xl border border-border bg-card p-5 text-foreground shadow-[0_8px_40px_rgb(28_31_34/0.18)] sm:inset-x-6 sm:bottom-6 sm:p-6">
      <div className="flex items-start gap-3 sm:gap-4">
        <div aria-hidden="true" className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-primary sm:flex"><FiShield className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <h2 id="cookie-consent-title" className="text-base font-bold sm:text-lg">Cookies на нашем сайте</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Cookies сохраняют корзину и настройки сайта, Яндекс Метрика по ним считает посещения.{' '}
            <Link to="/privacy#cookies" className="font-semibold text-primary underline underline-offset-2">Подробнее</Link>
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button size="sm" onClick={() => saveCookieConsent('accepted')}>Понятно</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
