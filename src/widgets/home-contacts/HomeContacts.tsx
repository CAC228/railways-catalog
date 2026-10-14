import { FiPhone, FiMail, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router'
import { CopyButton, CopyValue } from '@/shared/ui/CopyButton'
import { useCopy } from '@/shared/ui/use-copy'
import { emailCopyGoal } from '@/shared/analytics/metrika'
import { PHONE_CALL, PHONE_CITY, PHONE_MOBILE, tel } from '@/shared/lib/phones'
const COPY_PHONE = 'Скопировать номер телефона'
const COPY_EMAIL = 'Скопировать адрес почты'
export function HomeContacts() {
  // Номера и почта копируются нажатием на текст или на значок рядом,
  // звонок — по значку телефона слева.
  const phoneMain = useCopy(PHONE_CITY)
  const phoneSales = useCopy(PHONE_MOBILE)
  const email = useCopy('zakaz@prorelsa.ru', emailCopyGoal('Главная, блок контактов'))
  return (
    <section className="border-t border-border bg-muted py-12 md:py-16">
      <div className="container mx-auto grid gap-8 px-6 md:grid-cols-2 xl:px-8">
        <div>
          <h2 className="section-title mb-5">Обсудим вашу поставку</h2>
          <p className="max-w-lg text-muted-foreground">
            Позвоните или отправьте спецификацию. Подберём материалы и согласуем
            условия отгрузки.
          </p>
        </div>
        <div className="space-y-4">
          {/* Пока городского нет, на его месте пусто — того же размера. */}
          <div className={`flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl ${PHONE_CITY ? '' : 'invisible'}`} aria-hidden={!PHONE_CITY || undefined}>
            <a
              href={PHONE_CITY ? tel(PHONE_CITY) : undefined}
              aria-label={`Позвонить: ${PHONE_CITY}`}
              title="Позвонить"
              className="-m-1 shrink-0 rounded-md p-1 text-primary hover:bg-primary/10"
            >
              <FiPhone className="h-6 w-6" />
            </a>
            <CopyValue
              state={phoneMain}
              label={COPY_PHONE}
              className="whitespace-nowrap hover:text-primary"
            >
              {PHONE_CITY || PHONE_MOBILE}
            </CopyValue>
            <CopyButton compact state={phoneMain} label={COPY_PHONE} />
          </div>
          <div className="flex items-center gap-3 text-lg font-bold">
            <a
              href={tel(PHONE_MOBILE)}
              aria-label={`Позвонить: ${PHONE_MOBILE}`}
              title="Позвонить"
              className="-m-1 shrink-0 rounded-md p-1 text-primary hover:bg-primary/10"
            >
              <FiPhone />
            </a>
            <CopyValue
              state={phoneSales}
              label={COPY_PHONE}
              className="whitespace-nowrap hover:text-primary"
            >
              {PHONE_MOBILE}
            </CopyValue>
            <CopyButton compact state={phoneSales} label={COPY_PHONE} />
          </div>
          <div className="flex items-center gap-3 text-lg">
            <FiMail className="shrink-0 text-primary" />
            <CopyValue state={email} label={COPY_EMAIL} className="hover:text-primary">
              zakaz@prorelsa.ru
            </CopyValue>
            <CopyButton compact state={email} label={COPY_EMAIL} />
          </div>
          <p className="text-sm text-muted-foreground">
            Зеленодольск, ул. Московская, зд. 4, помещ. 1<br />
            Пн–Пт, 8:00–17:00
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href={tel(PHONE_CALL)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-accent px-5 font-bold text-accent-foreground md:hidden"
            >
              <FiPhone />
              Позвонить
            </a>
            <Link
              to="/contacts"
              className="inline-flex min-h-12 items-center gap-2 font-bold text-primary"
            >
              Все контакты
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
