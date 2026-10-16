import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { FiChevronDown } from 'react-icons/fi'
import type { Category } from '@/entities/category'
import { catalogPath } from '@/shared/seo/route-data'

export function CatalogCategories({ categories }: { categories: Category[] }) {
  const [params] = useSearchParams()
  const { categorySlug: currentCategory = '', subcategorySlug: currentSubcategory = '' } = useParams()
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  // Раздел — в пути; поиск и общие фильтры переносим, страницу и фильтры раздела — нет.
  const categoryHref = (category = '', subcategory = '') => {
    const next = new URLSearchParams(params)
    next.delete('page')
    for (const key of Array.from(next.keys()))
      if (key.startsWith('attribute_')) next.delete(key)
    return `${catalogPath(category, subcategory)}${next.size ? `?${next}` : ''}`
  }
  return (
    <aside
      aria-label="Категории каталога"
      className="min-w-0 rounded-lg border border-border bg-muted"
    >
      <h2 className="hidden px-4 pt-5 pb-3 text-xl font-bold lg:block">
        Категории
      </h2>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="catalog-categories"
        onClick={() => setOpen(!open)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left font-bold lg:hidden"
      >
        <span>
          Категории
          {currentCategory && (
            <span className="mt-1 block text-xs font-normal text-muted-foreground">
              {
                categories.find((category) => category.slug === currentCategory)
                  ?.name
              }
            </span>
          )}
        </span>
        <FiChevronDown
          aria-hidden="true"
          className={`shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <nav
        id="catalog-categories"
        aria-label="Выбор категории"
        className={`${open ? 'block' : 'hidden'} pb-3 lg:block`}
      >
        <Link
          to={categoryHref()}
          onClick={() => setOpen(false)}
          aria-current={!currentCategory ? 'page' : undefined}
          className={`flex min-h-11 items-center justify-between gap-2 border-l-2 px-4 py-2.5 text-sm ${!currentCategory ? 'border-primary bg-white font-bold text-primary' : 'border-transparent hover:bg-white hover:text-primary'}`}
        >
          Все материалы
          {categories.length > 0 &&
            categories.every((category) => category.productCount != null) && (
              <span className="text-xs font-normal tabular-nums text-muted-foreground">
                {categories.reduce(
                  (total, category) => total + (category.productCount ?? 0),
                  0,
                )}
              </span>
            )}
        </Link>
        {categories.map((category) => {
          const selected = category.slug === currentCategory
          const expandedCategory = expanded[category.slug] ?? selected
          const subcategories = category.subcategories ?? []
          return (
            <div key={category.slug}>
              <div
                className={`flex items-center border-l-2 ${selected ? 'border-primary bg-white' : 'border-transparent hover:bg-white'}`}
              >
                <Link
                  to={categoryHref(category.slug)}
                  onClick={() => setOpen(false)}
                  aria-current={
                    selected && !currentSubcategory ? 'page' : undefined
                  }
                  className={`flex min-h-12 min-w-0 flex-1 items-center justify-between gap-2 py-2.5 pl-4 pr-1 text-sm leading-5 hover:text-primary ${selected ? 'font-bold text-primary' : ''}`}
                >
                  <span className="min-w-0 break-words">{category.name}</span>
                  {category.productCount != null && (
                    <span className="text-xs font-normal tabular-nums text-muted-foreground">
                      {category.productCount}
                    </span>
                  )}
                </Link>
                {subcategories.length > 0 && (
                  <button
                    type="button"
                    aria-label={`Подкатегории: ${category.name}`}
                    aria-expanded={expandedCategory}
                    aria-controls={`subcategories-${category.id}`}
                    onClick={() =>
                      setExpanded({
                        ...expanded,
                        [category.slug]: !expandedCategory,
                      })
                    }
                    className="flex h-11 w-9 shrink-0 items-center justify-center text-muted-foreground hover:text-primary"
                  >
                    <FiChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 ${expandedCategory ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
              </div>
              {expandedCategory && subcategories.length > 0 && (
                <ul
                  id={`subcategories-${category.id}`}
                  className="space-y-0.5 px-3 py-2"
                >
                  {subcategories.map((subcategory) => (
                    <li key={subcategory.id}>
                      <Link
                        to={categoryHref(category.slug, subcategory.slug)}
                        onClick={() => setOpen(false)}
                        aria-current={
                          selected && subcategory.slug === currentSubcategory
                            ? 'page'
                            : undefined
                        }
                        className={`block rounded-md py-2 pr-2 pl-4 text-[13px] leading-5 hover:bg-white hover:text-primary ${selected && subcategory.slug === currentSubcategory ? 'bg-white font-bold text-primary' : 'text-muted-foreground'}`}
                      >
                        {subcategory.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
