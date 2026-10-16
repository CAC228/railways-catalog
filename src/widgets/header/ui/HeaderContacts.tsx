import { useEffect, useRef, useState } from 'react'
import { FiChevronDown, FiClock, FiPhone } from 'react-icons/fi'
import { CopyButton, CopyValue } from '@/shared/ui/CopyButton'
import { MessengerLinks } from '@/shared/ui/MessengerLinks'
import { useCopy } from '@/shared/ui/use-copy'
import { emailCopyGoal } from '@/shared/analytics/metrika'
import { PHONE_CALL, PHONE_CITY, PHONE_MOBILE, tel } from '@/shared/lib/phones'
import { HeaderContactForm } from './HeaderContactForm'

const EMAIL = 'zakaz@prorelsa.ru'
const COPY_EMAIL = 'Скопировать адрес почты'
// В шапке виден мобильный (на нём и мессенджеры), городской — в списке под ним.
const COPY_PHONE = 'Скопировать номер телефона'
// Мышь успевает дойти от номера до списка по диагонали — список закрывается не сразу.
const CLOSE_DELAY = 200

/** Строка списка: трубка звонит, номер и значок копируют — как в блоке контактов на главной. */
function PanelPhone({ phone }: { phone: string }) {
  const copy = useCopy(phone)
  return (
    <div className="mt-1.5 flex items-center gap-2 text-lg font-bold">
      <a
        href={tel(phone)}
        aria-label={`Позвонить: ${phone}`}
        title="Позвонить"
        className="-m-1 shrink-0 rounded-md p-1 text-primary hover:bg-primary/10"
      >
        <FiPhone className="h-4 w-4" />
      </a>
      <CopyValue state={copy} label={COPY_PHONE} className="whitespace-nowrap hover:text-primary">
        {phone}
      </CopyValue>
      <CopyButton compact state={copy} label={COPY_PHONE} />
    </div>
  )
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[.05em] text-muted-foreground">{children}</p>
}

/**
 * Почта и мобильный столбиком; под мобильным — список всех контактов.
 * Мышью список открывается наведением, нажатие на стрелку закрепляет его
 * (на планшете наведения нет — только стрелка). Esc и нажатие мимо закрывают.
 * Начали заполнять форму — список закрепляется, чтобы не закрылся, когда мышь уйдёт.
 */
export function HeaderContacts() {
  const [open, setOpen] = useState<false | 'hover' | 'click'>(false)
  const root = useRef<HTMLDivElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const email = useCopy(EMAIL, emailCopyGoal('Шапка'))
  const panelEmail = useCopy(EMAIL, emailCopyGoal('Шапка, список контактов'))
  const mobile = useCopy(PHONE_MOBILE)

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])
  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  const enter = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    window.clearTimeout(closeTimer.current)
    setOpen((state) => state || 'hover')
  }
  const leave = (event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    closeTimer.current = window.setTimeout(
      () => setOpen((state) => (state === 'hover' ? false : state)),
      CLOSE_DELAY,
    )
  }

  return (
    <div className="ml-auto flex shrink-0 flex-col justify-center">
      <div className="hidden h-6 items-center gap-2 px-2 text-sm md:flex">
        <CopyButton compact state={email} label={COPY_EMAIL} className="-mx-0.5" />
        {/* Почта на ступень крупнее строки (16 px, как номер), разрядка 0,1 em — зазор вдвое шире обычного. */}
        <CopyValue state={email} label={COPY_EMAIL} className="text-base font-bold tracking-widest text-current hover:text-primary">
          {EMAIL}
        </CopyValue>
      </div>
      {/* На телефоне — значок звонка, оба номера есть в меню. */}
      <a
        href={tel(PHONE_CALL)}
        className="flex h-11 items-center rounded-lg px-2 hover:opacity-75 md:hidden"
        aria-label={`Позвонить: ${PHONE_CALL}`}
      >
        <FiPhone className="h-5 w-5" />
      </a>
      <div ref={root} className="relative hidden md:block" onPointerEnter={enter} onPointerLeave={leave}>
        <div className="flex h-6 items-center gap-2 pl-2">
          <CopyButton compact state={mobile} label={COPY_PHONE} className="-mx-0.5" />
          <CopyValue state={mobile} label={COPY_PHONE} className="whitespace-nowrap font-bold text-current hover:text-primary">
            {PHONE_MOBILE}
          </CopyValue>
          <button
            ref={toggle}
            type="button"
            aria-expanded={!!open}
            aria-controls="header-contacts-panel"
            aria-label="Все телефоны и контакты"
            title="Все телефоны и контакты"
            onClick={() => setOpen((state) => (state === 'click' ? false : 'click'))}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-primary transition-colors hover:bg-primary/10"
          >
            <FiChevronDown strokeWidth={3.5} className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {open && (
          // Отступ сверху — часть списка: мышь идёт от номера к списку, не выходя из блока.
          <div
            id="header-contacts-panel"
            aria-label="Контакты"
            className="absolute right-0 top-full z-50 pt-2"
            onFocus={() => setOpen('click')}
          >
            {/* С формой список высокий: на невысоком экране он прокручивается, а не уходит за край. */}
            <div className="panel-enter max-h-[calc(100vh-8rem)] w-76 overflow-y-auto overscroll-contain rounded-lg border border-border bg-white p-5 text-left text-foreground shadow-lg">
              <PanelLabel>Мобильный и мессенджеры</PanelLabel>
              <PanelPhone phone={PHONE_MOBILE} />
              <div className="mt-3">
                <MessengerLinks compact />
              </div>
              <div className="my-4 border-t border-border" />
              {/* Если городского нет, на его месте пусто — того же размера. */}
              {PHONE_CITY ? (
                <>
                  <PanelLabel>Городской</PanelLabel>
                  <PanelPhone phone={PHONE_CITY} />
                </>
              ) : (
                <div className="h-[3.125rem]" aria-hidden="true" />
              )}
              <div className="my-4 border-t border-border" />
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiClock className="shrink-0 text-primary" aria-hidden="true" />
                Пн–Пт, 8:00–17:00
              </p>
              <div className="my-4 border-t border-border" />
              <HeaderContactForm />
              <div className="my-4 border-t border-border" />
              <p className="text-sm text-muted-foreground">Наша почта:</p>
              <div className="mt-1 flex items-center gap-2 font-bold">
                <CopyValue state={panelEmail} label={COPY_EMAIL} className="hover:text-primary">
                  {EMAIL}
                </CopyValue>
                <CopyButton compact state={panelEmail} label={COPY_EMAIL} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
