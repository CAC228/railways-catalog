import { useState } from 'react'
import { Link } from 'react-router'
import { MessengerLinks } from '@/shared/ui/MessengerLinks'
import { CopyButton, CopyValue } from '@/shared/ui/CopyButton'
import { useCopy } from '@/shared/ui/use-copy'
import { emailCopyGoal } from '@/shared/analytics/metrika'
import { FiDownload, FiPhone } from 'react-icons/fi'
import { useCategories } from '@/entities/category/model/hooks/useCategories'
import { Button } from '@/shared/ui/Button'
import { RequestFormModal } from '@/shared/ui/RequestFormModal'
import { openCookieSettings } from '@/shared/privacy/cookie-consent'
import { catalogPath } from '@/shared/seo/route-data'
const companyLinks = [
  ['Услуги', '/services'],
  ['Доставка', '/delivery'],
  ['Калькулятор', '/calculator'],
  ['О компании', '/about'],
  ['Контакты', '/contacts'],
]
const COPY_PHONE = 'Скопировать номер телефона'
export function Footer() {
  const { categories, isLoading } = useCategories()
  const [callbackOpen, setCallbackOpen] = useState(false)
  const email = useCopy('zakaz@prorelsa.ru', emailCopyGoal('Подвал'))
  const phoneMain = useCopy('+7 (843) 227-00-05')
  const phoneSales = useCopy('+7 (965) 615-50-59')
  return (
    <footer className="site-footer">
      <div className="container mx-auto px-6 py-12 xl:px-8">
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-[1fr_1.2fr_.75fr_1.25fr]">
          <div>
            <Link
              to="/"
              aria-label="ИНВИА — главная"
              className="mb-5 inline-flex rounded"
            >
              <img src="/logo-light.png?v=invia-2026-10-09" alt="ИНВИА" className="w-28" />
            </Link>
            <p className="footer-muted max-w-xs text-sm leading-relaxed">
              Поставки железнодорожных материалов по России и СНГ.
            </p>
            <p className="mt-5 text-sm font-bold">Группа компаний ИНВИА</p>
            <p className="footer-muted mt-1 text-sm">
              Юридическое лицо — ООО «ИНВИА»
              <br />
              ИНН 1648052000
              <br />
              ОГРН 1201600037055
            </p>
            <Button
              className="mt-5 whitespace-nowrap"
              onClick={() => setCallbackOpen(true)}
            >
              <FiPhone className="h-4 w-4" />
              Обратный звонок
            </Button>
          </div>
          <div>
            <h2 className="mb-4 text-base font-bold">Контакты</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CopyValue
                  state={phoneMain}
                  label={COPY_PHONE}
                  className="whitespace-nowrap text-base font-bold"
                >
                  +7 (843) 227-00-05
                </CopyValue>
                <CopyButton state={phoneMain} compact label={COPY_PHONE} />
              </div>
              <div className="flex items-center gap-2">
                <CopyValue
                  state={phoneSales}
                  label={COPY_PHONE}
                  className="footer-muted whitespace-nowrap"
                >
                  +7 (965) 615-50-59
                </CopyValue>
                <CopyButton state={phoneSales} compact label={COPY_PHONE} />
              </div>
              <div className="flex items-center gap-2">
                <CopyValue
                  state={email}
                  label="Скопировать адрес почты"
                  className="footer-muted"
                >
                  zakaz@prorelsa.ru
                </CopyValue>
                <CopyButton state={email} compact label="Скопировать адрес почты" />
              </div>
              <div className="pt-3"><MessengerLinks /></div>
              <p className="footer-muted pt-2">
                422549, Республика Татарстан, г. Зеленодольск, ул. Московская,
                зд. 4, помещ. 1
              </p>
              <p className="footer-muted">
                Почтовый адрес: 422540, г. Зеленодольск, а/я 34
              </p>
              <a
                href="/data/Карта партнера ИНВИА1.pdf"
                download
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/30 px-3 font-bold"
              >
                <FiDownload />
                Скачать реквизиты
              </a>
            </div>
          </div>
          <div>
            <h2 className="mb-4 text-base font-bold">Компания</h2>
            <ul className="footer-muted space-y-2 text-sm">
              {companyLinks.map(([label, to]) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-4 text-base font-bold">Каталог</h2>
            <ul className="footer-muted space-y-2 text-sm">
              {isLoading ? (
                <li>Загрузка категорий…</li>
              ) : (
                categories.map((category) => (
                  <li key={category.slug}>
                    <Link to={catalogPath(category.slug)}>
                      {category.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        <div className="footer-muted mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/20 pt-6 text-[13px]">
          <p className="w-full text-xs leading-relaxed">* WhatsApp принадлежит Meta Platforms Inc., деятельность которой по реализации Facebook и Instagram признана экстремистской и запрещена в России. Это решение не распространяется на WhatsApp.</p>
          <p className="w-full text-[11px] uppercase tracking-wide opacity-60">
            Информация, представленная на сайте, не является публичной офертой
          </p>
          <span>© {new Date().getFullYear()} Группа компаний ИНВИА. Юридическое лицо: ООО «ИНВИА»</span>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Link to="/privacy">Политика конфиденциальности</Link>
            <a href="/privacy#consent">Согласие на обработку данных</a>
            <button type="button" onClick={openCookieSettings} className="text-left hover:underline focus-visible:ring-2 focus-visible:ring-ring">Настройки cookies</button>
          </div>
        </div>
      </div>
      <RequestFormModal
        open={callbackOpen}
        onOpenChange={setCallbackOpen}
        title="Обратный звонок"
        callback
        description="Оставьте контакты — перезвоним в течение 15 минут"
      />
    </footer>
  )
}
