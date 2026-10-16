import { Breadcrumbs } from '@/shared/ui/Breadcrumbs'
import { MessengerLinks } from '@/shared/ui/MessengerLinks'
import { Button } from '@/shared/ui/Button'
import { CopyButton, CopyValue } from '@/shared/ui/CopyButton'
import { useCopy } from '@/shared/ui/use-copy'
import { emailCopyGoal, type MetrikaGoal } from '@/shared/analytics/metrika'
import { RequestFormModal } from '@/shared/ui/RequestFormModal'
import { PHONE_CITY, PHONE_MOBILE, tel } from '@/shared/lib/phones'
import { Layout } from '@/widgets/Layout'
import { useState } from 'react'
import {
  FiClock,
  FiDownload,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiFileText,
} from 'react-icons/fi'

const PARTNER_CARD_URL = '/data/Карта партнера ИНВИА1.pdf'
const PARTNER_CARD_FILENAME = 'Карта партнера ИНВИА1.pdf'

const CONTACTS = [
  {
    id: 'phone-1',
    icon: FiPhone,
    title: 'Телефон',
    // Если городского нет, карточка невидима, но место в сетке за ней.
    value: PHONE_CITY || PHONE_MOBILE,
    empty: !PHONE_CITY,
    href: PHONE_CITY ? tel(PHONE_CITY) : undefined,
    copy: { value: PHONE_CITY, label: 'Скопировать номер телефона' },
  },
  {
    id: 'phone-3',
    icon: FiPhone,
    title: 'Телефон',
    value: PHONE_MOBILE,
    href: tel(PHONE_MOBILE),
    copy: { value: PHONE_MOBILE, label: 'Скопировать номер телефона' },
  },
  {
    id: 'email',
    icon: FiMail,
    title: 'Email',
    value: 'zakaz@prorelsa.ru',
    copy: { value: 'zakaz@prorelsa.ru', label: 'Скопировать адрес почты', goal: emailCopyGoal('Страница «Контакты»') },
  },
  {
    id: 'work-hours',
    icon: FiClock,
    title: 'Режим работы',
    value: 'Пн-Пт 8:00 - 17:00',
    subvalue: 'Сб-Вс выходные',
  },
  {
    id: 'messengers',
    icon: FiMessageCircle,
    title: 'Мессенджеры',
    value: <MessengerLinks showPhone />,
    // Карточек пять: мессенджеры занимают две колонки, чтобы в сетке из трёх не было пустой ячейки.
    wide: true,
  },
]

const ADDRESSES = [
  {
    id: 'legal',
    title: 'Юридический/фактический адрес',
    address:
      '422549, Респ Татарстан, Зеленодольский р-н, г Зеленодольск, ул Московская, ЗД.4, помещ.1',
  },
  {
    id: 'postal',
    title: 'Почтовый адрес',
    address: '422540, г. Зеленодольск, а/я 34',
  },
]

const REQUISITES = [
  { label: 'Бренд', value: 'Группа компаний ИНВИА', full: true },
  { label: 'Наименование', value: 'ООО «ИНВИА»' },
  { label: 'ИНН', value: '1648052000' },
  { label: 'КПП', value: '164801001' },
  { label: 'ОГРН', value: '1201600037055' },
  {
    label: 'Юридический/фактический адрес',
    value:
      '422549, Респ Татарстан, Зеленодольский р-н, г Зеленодольск, ул Московская, ЗД.4, помещ.1',
    full: true,
  },
  {
    label: 'Почтовый адрес',
    value: '422540, г. Зеленодольск, а/я 34',
    full: true,
  },
  { label: 'Расчётный счёт', value: '40702810229070006758' },
  { label: 'Корр. счёт', value: '30101810200000000824' },
  { label: 'Банк', value: 'ФИЛИАЛ "НИЖЕГОРОДСКИЙ" АО "АЛЬФА-БАНК"' },
  { label: 'БИК', value: '042202824' },
]

export function ContactsPage() {
  const breadcrumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Контакты', href: undefined },
  ]

  return (
    <Layout>
      <div className="container mx-auto px-6 py-10 xl:px-8">
        <Breadcrumbs items={breadcrumbs} />

        <h1 className="page-title mb-8">Контакты</h1>

        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CONTACTS.map((contact) => (
            <ContactCard key={contact.id} {...contact} />
          ))}
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {ADDRESSES.map((address) => (
            <AddressCard key={address.id} {...address} />
          ))}
        </div>

        <div className="mb-12 rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="section-title">Реквизиты</h2>

            <a
              href={encodeURI(PARTNER_CARD_URL)}
              download={PARTNER_CARD_FILENAME}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-base font-bold text-white transition-opacity hover:opacity-90"
            >
              <FiDownload className="h-4 w-4" />
              Скачать реквизиты
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            {REQUISITES.map((req) => (
              <div key={req.label} className={req.full ? 'md:col-span-2' : ''}>
                <span className="text-muted-foreground">{req.label}:</span>
                <div className="font-medium text-foreground">{req.value}</div>
              </div>
            ))}
          </div>
        </div>

        <FeedbackForm />
      </div>
    </Layout>
  )
}

function ContactCard({
  icon: Icon,
  title,
  value,
  subvalue,
  href,
  copy,
  wide,
  empty,
}: {
  icon: React.ElementType
  title: string
  value: React.ReactNode
  subvalue?: string
  href?: string
  copy?: { value: string; label: string; goal?: MetrikaGoal }
  wide?: boolean
  empty?: boolean
}) {
  // У карточки с «Скопировать» нажатие и на значение, и на кнопку копирует его:
  // состояние у них общее, но это две разные кнопки. Звонок у телефона — по значку.
  const copyState = useCopy(copy?.value ?? '', copy?.goal)
  const content = (
    <div
      className={`h-full rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/50 ${wide ? 'sm:col-span-2 xl:col-span-2' : ''} ${empty ? 'invisible' : ''}`}
      aria-hidden={empty || undefined}
    >
      <div className="mb-3 text-primary">
        {href && copy ? (
          <a
            href={href}
            aria-label={`Позвонить: ${copy.value}`}
            title="Позвонить"
            className="-m-2 flex w-fit rounded-md p-2 hover:bg-primary/10"
          >
            <Icon className="h-6 w-6" />
          </a>
        ) : (
          <Icon className="h-6 w-6" />
        )}
      </div>
      <div className="mb-1 text-sm text-muted-foreground">{title}</div>
      {copy ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <CopyValue
            state={copyState}
            label={copy.label}
            className="whitespace-nowrap font-bold text-foreground hover:text-primary"
          >
            {value}
          </CopyValue>
          <CopyButton state={copyState} label={copy.label} className="-my-0.5" />
        </div>
      ) : (
        <div className="font-bold text-foreground">{value}</div>
      )}

      {subvalue && (
        <div className="mt-1 text-xs text-muted-foreground">{subvalue}</div>
      )}
    </div>
  )

  if (href && !copy) {
    return (
      <a href={href} className="block h-full">
        {content}
      </a>
    )
  }

  return content
}

function AddressCard({ title, address }: { title: string; address: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 font-bold text-foreground">{title}</h3>

      <p className="mb-2 text-muted-foreground">{address}</p>
    </div>
  )
}

function FeedbackForm() {
  const [open, setOpen] = useState(false)
  return (
    <section className="rounded-lg border border-border bg-muted p-6 md:p-8">
      <h2 className="section-title mb-4">Отправьте спецификацию</h2>
      <p className="mb-6 max-w-2xl text-muted-foreground">
        Укажите нужные материалы и объём поставки. В заявке можно прикрепить
        спецификацию и карту партнёра.
      </p>
      <Button onClick={() => setOpen(true)}>
        <FiFileText className="h-5 w-5 shrink-0" />
        Отправить заявку
      </Button>
      <RequestFormModal
        open={open}
        onOpenChange={setOpen}
        title="Отправить спецификацию"
      />
    </section>
  )
}
