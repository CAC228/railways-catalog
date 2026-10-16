import { useState } from 'react'
import { MessengerLinks } from '@/shared/ui/MessengerLinks'
import { Drawer } from '@/shared/ui/Drawer'
import { FiChevronLeft, FiChevronRight, FiPhone } from 'react-icons/fi'
import { Link } from 'react-router'
import { getCategoryUrl, getSubcategoryUrl } from '@/shared/lib'
import { MobileNavLink } from '@/widgets/header/ui/MobileNavLink'
import { Button } from '@/shared/ui/Button'
import { CopyButton, CopyValue } from '@/shared/ui/CopyButton'
import { useCopy } from '@/shared/ui/use-copy'
import { PHONE_CITY, PHONE_MOBILE, tel } from '@/shared/lib/phones'
import { useCategories } from '@/entities/category/model/hooks/useCategories'

interface MobileMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const COPY_PHONE = 'Скопировать номер телефона'

/**
 * Телефон в меню: значок трубки звонит, номер и значок рядом копируют номер.
 * Значок копирования стоит у номера, а не у края: подсказку «Скопировано»
 * под ним иначе обрезает край экрана.
 */
function PhoneRow({
  phone,
  href,
  note,
}: {
  phone: string
  href: string
  note?: string
}) {
  const copy = useCopy(phone)
  return (
    <div className="mb-3 flex min-h-12 items-center gap-1 rounded-lg bg-muted pl-1 pr-3 text-sm font-semibold">
      <a
        href={href}
        aria-label={`Позвонить: ${phone}`}
        title="Позвонить"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary/10"
      >
        <FiPhone className="h-5 w-5" />
      </a>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <CopyValue state={copy} label={COPY_PHONE} className="hover:text-primary">
            {phone}
          </CopyValue>
          <CopyButton compact state={copy} label={COPY_PHONE} />
        </div>
        {note && (
          <div className="mt-0.5 text-xs font-normal text-muted-foreground">
            {note}
          </div>
        )}
      </div>
    </div>
  )
}

function MobileMenuSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
      ))}
    </div>
  )
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const { categories, isLoading } = useCategories()

  const [catalogOpen, setCatalogOpen] = useState(false)
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(
    null,
  )

  const selectedCategory = categories.find(
    (category) => category.slug === activeCategorySlug,
  )

  const selectedSubcategories = selectedCategory?.subcategories ?? []

  const closeMenu = () => {
    onOpenChange(false)

    window.setTimeout(() => {
      setCatalogOpen(false)
      setActiveCategorySlug(null)
    }, 200)
  }

  const handleDrawerChange = (value: boolean) => {
    onOpenChange(value)

    if (!value) {
      setCatalogOpen(false)
      setActiveCategorySlug(null)
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleDrawerChange}
      title={catalogOpen ? 'Каталог' : 'Меню'}
      side="right"
    >
      <div className="flex h-full min-h-0 flex-col">
        {catalogOpen ? (
          <>
            <button
              type="button"
              className="
                mb-3 flex min-h-10 shrink-0 items-center gap-2
                rounded-lg px-2
                text-sm font-semibold
                text-muted-foreground
                transition-colors
                hover:bg-muted
                hover:text-foreground
              "
              onClick={() => {
                if (selectedCategory) {
                  setActiveCategorySlug(null)
                } else {
                  setCatalogOpen(false)
                }
              }}
            >
              <FiChevronLeft className="h-5 w-5" />
              Назад
            </button>

            {selectedCategory ? (
              <>
                <div className="mb-5 flex shrink-0 items-center gap-3 rounded-lg bg-muted p-4">
                  <div>
                    <div className="font-bold">{selectedCategory.name}</div>

                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {selectedSubcategories.length} подкатегорий
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="space-y-1 pr-1">
                    {selectedSubcategories.map((subcategory) => (
                      <Link
                        key={subcategory.slug}
                        to={getSubcategoryUrl(
                          selectedCategory.slug,
                          subcategory.slug,
                        )}
                        className="
                          flex min-h-11 items-center
                          rounded-lg px-3
                          text-sm font-medium
                          transition-colors
                          hover:bg-muted
                        "
                        onClick={closeMenu}
                      >
                        <span className="flex-1">{subcategory.name}</span>

                        <FiChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  to={getCategoryUrl(selectedCategory.slug)}
                  className="
                    mt-4 flex min-h-11 shrink-0 items-center
                    rounded-lg bg-muted px-3
                    text-sm font-semibold text-primary
                  "
                  onClick={closeMenu}
                >
                  Все товары категории
                  <FiChevronRight className="ml-auto h-4 w-4" />
                </Link>
              </>
            ) : isLoading ? (
              <MobileMenuSkeleton />
            ) : (
              <>
                <div className="mb-3 shrink-0 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Категории
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  <div className="space-y-1 pr-1">
                    {categories.map((category) => (
                      <button
                        key={category.slug}
                        type="button"
                        className="
                          flex min-h-12 w-full items-center
                          gap-3 rounded-lg px-3
                          text-left
                          transition-colors
                          hover:bg-muted
                        "
                        onClick={() => setActiveCategorySlug(category.slug)}
                      >
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">
                            {category.name}
                          </span>

                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {(category.subcategories ?? []).length} подкатегорий
                          </span>
                        </span>

                        <FiChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  to="/catalog"
                  className="
                    mt-3 flex min-h-11 shrink-0 items-center
                    rounded-lg bg-muted px-3
                    text-sm font-semibold text-primary
                  "
                  onClick={closeMenu}
                >
                  Весь каталог
                  <FiChevronRight className="ml-auto h-4 w-4" />
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <div className="space-y-1">
              <button
                type="button"
                className="
                  flex min-h-12 w-full items-center
                  rounded-lg px-3
                  text-left
                  text-base font-semibold
                  transition-colors
                  hover:bg-muted
                "
                onClick={() => setCatalogOpen(true)}
              >
                <span className="flex-1">Каталог</span>

                <FiChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>

              <MobileNavLink to="/services" onClick={closeMenu}>
                Услуги
              </MobileNavLink>

              <MobileNavLink to="/delivery" onClick={closeMenu}>
                Доставка
              </MobileNavLink>

              <MobileNavLink to="/calculator" onClick={closeMenu}>
                Калькулятор
              </MobileNavLink>

              <MobileNavLink to="/about" onClick={closeMenu}>
                О компании
              </MobileNavLink>

              <MobileNavLink to="/contacts" onClick={closeMenu}>
                Контакты
              </MobileNavLink>
            </div>

            <div className="mt-auto border-t border-border pt-5">
              <div className="mb-3"><MessengerLinks /></div>
              {/* Если городского нет, на его месте пусто — того же размера. */}
              {PHONE_CITY ? (
                <PhoneRow phone={PHONE_CITY} href={tel(PHONE_CITY)} note="Отдел продаж" />
              ) : (
                <div className="mb-3 h-12" aria-hidden="true" />
              )}
              <PhoneRow phone={PHONE_MOBILE} href={tel(PHONE_MOBILE)} />

              <Button
                className="w-full"
                onClick={() => {
                  closeMenu()
                  window.dispatchEvent(new CustomEvent('open-request-form'))
                }}
              >
                Запросить спецификацию
              </Button>
            </div>
          </>
        )}
      </div>
    </Drawer>
  )
}
