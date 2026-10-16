import { useEffect, useRef, useState } from 'react'
import { FiMenu, FiShoppingCart } from 'react-icons/fi'
import { Link, NavLink } from 'react-router'
import { Button } from '@/shared/ui/Button'
import { MobileMenu } from './MobileMenu'
import { CatalogMegaMenu } from './CatalogMegaMenu'
import { CatalogSearch } from './CatalogSearch'
import { useCart } from '@/entities/cart/model/use-cart'
import { RequestFormModal } from '@/shared/ui/RequestFormModal'
import { MessengerLinks } from '@/shared/ui/MessengerLinks'
import { positionsLabel } from '@/shared/lib/positions-count'
import { usePositionsCount } from '@/entities/product'
import { HeaderContacts } from './HeaderContacts'

const links = [
  ['Услуги', '/services'],
  ['Доставка', '/delivery'],
  ['Калькулятор', '/calculator'],
  ['О компании', '/about'],
  ['Контакты', '/contacts'],
]

export function Header() {
  const headerRef = useRef<HTMLElement>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItems } = useCart()
  const positions = usePositionsCount()
  useEffect(() => {
    const scroll = () => {
      const scrollY = Math.max(0, window.scrollY)
      const headerHeight = headerRef.current?.offsetHeight
      if (headerHeight === undefined) return

      // Keep the thresholds apart so scroll anchoring during the height
      // transition cannot immediately trigger the opposite state.
      setScrolled((wasScrolled) =>
        wasScrolled ? scrollY > 8 : scrollY > headerHeight,
      )
    }
    const request = () => setRequestOpen(true)
    scroll()
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('resize', scroll)
    window.addEventListener('open-request-form', request)
    return () => {
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('resize', scroll)
      window.removeEventListener('open-request-form', request)
    }
  }, [])
  return (
    <header
      ref={headerRef}
      className={`site-header sticky top-0 z-40 border-b border-border bg-white ${scrolled ? 'is-scrolled' : ''}`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:p-3 focus:text-foreground"
      >
        Перейти к содержимому
      </a>
      <div
        className="header-meta bg-muted text-muted-foreground"
        inert={scrolled}
      >
        <div>
          <div className="container mx-auto flex items-center justify-between gap-4 px-6 py-2 text-[13px] xl:px-8">
            {/* Счётчик ведёт в каталог; город и доставка — там, где хватает места. */}
            <div className="flex min-w-0 items-center gap-1 whitespace-nowrap">
              <Link to="/catalog" className="font-bold text-foreground hover:text-primary">
                {positionsLabel(positions)}
              </Link>
              <span className="hidden xl:inline">· Зеленодольск · Поставки по России и СНГ</span>
            </div>
            <nav
              aria-label="Основная навигация"
              className="hidden items-center gap-4 lg:flex"
            >
              {links.map(([label, to]) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-sm hover:text-primary ${isActive ? 'font-bold text-primary' : ''}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="hidden items-center gap-5 md:flex">
              <span>Пн–Пт, 8:00–17:00</span>
              <MessengerLinks compact />
            </div>
          </div>
        </div>
      </div>
      <div className="container relative mx-auto px-6 xl:px-8">
        <div className="header-main flex items-center gap-3 xl:gap-5">
          <Link
            to="/"
            aria-label="ИНВИА — главная"
            className="shrink-0 rounded px-1 py-1"
          >
            {/* ?v= — версия файла: адрес /logo.png тот же, что у прежнего логотипа, и без неё браузеры
                показывают старую картинку из своей памяти. Меняется логотип — меняется и v. */}
            {/* Фон у логотипа прозрачный: на белой шапке — обычный, на тёмной
                при прокрутке — светлый (переключает index.css по .is-scrolled). */}
            <img src="/logo.png?v=invia-2026-10-09" alt="ИНВИА" className="header-logo-light w-25 xl:w-28" />
            <img src="/logo-light.png?v=invia-2026-10-09" alt="ИНВИА" className="header-logo-dark w-25 xl:w-28" />
          </Link>
          {/* «Каталог» и «Заказать звонок» — с 1024 px: на 17-дюймовом мониторе
              с масштабом 125 % окно уже 1280 px, а кнопки там нужны. Меню
              с тремя полосками тогда не нужно — всё из него уже в шапке. */}
          <div className="hidden lg:block">
            <CatalogMegaMenu />
          </div>
          {/* Поиск не растягивается на всю свободную ширину: иначе на экранах
              уже xl он отжимает номер телефона и тот остаётся одной иконкой.
              Не шире 300 px — на больших мониторах длинная строка ни к чему. */}
          <div className="hidden min-w-0 max-w-75 flex-1 md:block">
            <CatalogSearch />
          </div>
          {/* Почта и мобильный столбиком по 24 px — влезает и в сжатую шапку;
              городской и остальное — в списке под мобильным. */}
          <HeaderContacts onRequestCall={() => setRequestOpen(true)} />
          <Link
            to="/cart"
            aria-label={`Корзина${totalItems ? `, товаров: ${totalItems}` : ''}`}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-current/20 hover:opacity-75"
          >
            <FiShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 rounded bg-accent px-1 text-xs font-bold text-accent-foreground">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>
          <div className="hidden shrink-0 lg:block">
            {/* Срок перезвона прямо на кнопке. Две строки — кнопка 48 px,
                помещается и в сжатую шапку (72 px). */}
            <Button
              className="flex-col gap-0! whitespace-nowrap px-4! py-1.5! leading-tight"
              onClick={() => setRequestOpen(true)}
            >
              Заказать звонок
              <span className="text-xs font-medium opacity-90">
                перезвоним за 15 мин
              </span>
            </Button>
          </div>
          <button
            type="button"
            aria-label="Открыть меню"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-current/20 lg:hidden"
          >
            <FiMenu className="h-6 w-6" />
          </button>
        </div>
        <div className="header-meta" inert={scrolled}>
          <div>
            <div className="pb-3 md:hidden">
              <CatalogSearch />
            </div>
          </div>
        </div>
      </div>
      <MobileMenu open={mobileOpen} onOpenChange={setMobileOpen} />
      <RequestFormModal
        open={requestOpen}
        onOpenChange={setRequestOpen}
        title="Заказать звонок"
        description="Оставьте контакты — перезвоним в течение 15 минут"
        callback
      />
    </header>
  )
}
