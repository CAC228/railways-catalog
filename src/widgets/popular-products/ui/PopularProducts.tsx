import { useState } from 'react'
import { Link } from 'react-router'
import { ProductCard } from '@/entities/product/ui/ProductCard'
import { usePopularProducts } from '../model/use-popular-products'
import { catalogPath } from '@/shared/seo/route-data'
const tabs = [
  ['Рельсы', 'zheleznodorozhnye-relsy'],
  ['Шпалы', 'zhd-shpaly'],
  ['Скрепления', 'relsovoe-skreplenie-zhbr-ars'],
]
export function PopularProducts() {
  const [active, setActive] = useState(0)
  const { products, loading, error } = usePopularProducts(tabs[active][1])
  return (
    <section
      className="border-y border-border bg-muted py-12 md:py-16"
      aria-labelledby="popular-title"
    >
      <div className="container mx-auto px-6 xl:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <h2 id="popular-title" className="section-title">
            Популярные материалы
          </h2>
          <div
            role="tablist"
            aria-label="Тип популярных материалов"
            className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-white p-1"
          >
            {tabs.map(([label], index) => (
              <button
                key={label}
                type="button"
                role="tab"
                id={`popular-tab-${index}`}
                aria-controls="popular-panel"
                aria-selected={active === index}
                tabIndex={active === index ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => {
                  const next =
                    event.key === 'ArrowRight'
                      ? (active + 1) % tabs.length
                      : event.key === 'ArrowLeft'
                        ? (active + tabs.length - 1) % tabs.length
                        : event.key === 'Home'
                          ? 0
                          : event.key === 'End'
                            ? tabs.length - 1
                            : null
                  if (next !== null) {
                    event.preventDefault()
                    setActive(next)
                    document.getElementById(`popular-tab-${next}`)?.focus()
                  }
                }}
                className={`min-h-11 whitespace-nowrap rounded px-3 text-sm font-bold transition-colors ${active === index ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-primary'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div
          id="popular-panel"
          role="tabpanel"
          aria-labelledby={`popular-tab-${active}`}
          aria-busy={loading}
          className="min-h-80"
        >
          {loading ? (
            <div
              role="status"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-lg border border-border bg-white"
                />
              ))}
              <span className="sr-only">Загрузка товаров</span>
            </div>
          ) : error ? (
            <p role="alert">
              Не удалось загрузить товары.{' '}
              <Link to="/catalog" className="text-primary underline">
                Открыть каталог
              </Link>
            </p>
          ) : products.length ? (
            <div
              key={active}
              className="results-enter grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p>В этой категории пока нет товаров.</p>
          )}
        </div>
        <div className="mt-7 text-right">
          <Link
            to={catalogPath(tabs[active][1])}
            className="inline-flex min-h-11 items-center font-bold text-primary"
          >
            Все товары категории →
          </Link>
        </div>
      </div>
    </section>
  )
}
