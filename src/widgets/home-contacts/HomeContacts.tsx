import { FiPhone, FiMail, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router'
import { CopyButton, CopyValue } from '@/shared/ui/CopyButton'
import { useCopy } from '@/shared/ui/use-copy'
import { emailCopyGoal } from '@/shared/analytics/metrika'
const COPY_PHONE = 'Скопировать номер телефона'
const COPY_EMAIL = 'Скопировать адрес почты'
export function HomeContacts() {
  // Номера и почта копируются нажатием на текст или на значок рядом,
  // звонок — по значку телефона слева.
  const phoneMain = useCopy('+7 (843) 227-00-05')
  const phoneSales = useCopy('+7 (965) 615-50-59')
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
          <div className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
            <a
              href="tel:+78432270005"
              aria-label="Позвонить: +7 (843) 227-00-05"
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
              +7 (843) 227-00-05
            </CopyValue>
            <CopyButton compact state={phoneMain} label={COPY_PHONE} />
          </div>
          <div className="flex items-center gap-3 text-lg font-bold">
            <a
              href="tel:+79656155059"
              aria-label="Позвонить: +7 (965) 615-50-59"
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
              +7 (965) 615-50-59
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
              href="tel:+78432270005"
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
