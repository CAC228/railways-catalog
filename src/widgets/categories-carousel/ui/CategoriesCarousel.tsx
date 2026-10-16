import { useCallback, useSyncExternalStore } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { Link } from 'react-router'
import { FiArrowUpRight } from 'react-icons/fi'
import { useCategoriesCarousel } from '../model/use-categories-carousel'
import { CatalogImage } from '@/shared/ui/CatalogImage'
import { CarouselArrows } from '@/shared/ui/CarouselArrows'
import { catalogPath } from '@/shared/seo/route-data'

const slideClassName =
  'min-w-0 flex-[0_0_85%] pl-4 sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%] xl:flex-[0_0_25%]'

const countLabel = (count: number) => {
  const mod = count % 100
  return `${count} ${mod >= 11 && mod <= 14 ? 'позиций' : count % 10 === 1 ? 'позиция' : count % 10 >= 2 && count % 10 <= 4 ? 'позиции' : 'позиций'}`
}
export function CategoriesCarousel() {
  const { categories, loading } = useCategoriesCarousel()
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  })
  const subscribeToScroll = useCallback(
    (onChange: () => void) => {
      emblaApi?.on('select', onChange)
      emblaApi?.on('reInit', onChange)
      return () => {
        emblaApi?.off('select', onChange)
        emblaApi?.off('reInit', onChange)
      }
    },
    [emblaApi],
  )
  const canScrollPrev = useSyncExternalStore(
    subscribeToScroll,
    () => emblaApi?.canScrollPrev() ?? false,
    () => false,
  )
  const canScrollNext = useSyncExternalStore(
    subscribeToScroll,
    () => emblaApi?.canScrollNext() ?? false,
    () => false,
  )
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <section
      className="bg-white py-12 md:py-16"
      aria-labelledby="categories-title"
      aria-roledescription="карусель"
    >
      <div className="container mx-auto px-6 xl:px-8">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 id="categories-title" className="section-title">
            Каталог материалов
          </h2>
          <Link
            to="/catalog"
            className="inline-flex min-h-11 items-center gap-2 font-bold text-primary"
          >
            Весь каталог
            <FiArrowUpRight />
          </Link>
        </div>
        {loading ? (
          <div role="status" className="overflow-hidden">
            <div className="-ml-4 flex">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={slideClassName}>
                  <div className="h-80 animate-pulse rounded-lg bg-muted" />
                </div>
              ))}
            </div>
            <span className="sr-only">Загрузка категорий</span>
          </div>
        ) : categories.length ? (
          // Стрелки по бокам карусели: relative-обёртка вне overflow-hidden, чтобы кнопки
          // могли выступать за край карточек наполовину.
          <div className="relative">
            {categories.length > 1 && (
              <CarouselArrows
                placement="sides"
                onPrev={scrollPrev}
                onNext={scrollNext}
                canScrollPrev={canScrollPrev}
                canScrollNext={canScrollNext}
              />
            )}
            <div ref={emblaRef} className="overflow-hidden">
              <ul className="-ml-4 flex touch-pan-y touch-pinch-zoom">
                {categories.map((category) => (
                  <li key={category.slug} className={slideClassName}>
                    <Link
                      to={catalogPath(category.slug)}
                      className="group flex h-full flex-col overflow-hidden rounded-lg border border-border transition-colors duration-200 hover:border-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                    >
                      <div className="aspect-[3/2] shrink-0 overflow-hidden border-b border-border bg-muted p-3">
                        <CatalogImage
                          src={category.image}
                          alt={category.name}
                          sizes="(min-width: 1280px) 270px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(85vw - 70px)"
                          className="mix-blend-darken"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="mb-4 text-xl font-bold leading-tight xl:text-2xl">
                          {category.name}
                        </h3>
                        <div className="mt-auto flex items-center justify-between gap-3">
                          <span className="text-sm text-muted-foreground">
                            {category.productCount === undefined
                              ? 'Посмотреть товары'
                              : countLabel(category.productCount)}
                          </span>
                          <FiArrowUpRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-border p-6 text-muted-foreground">
            Категории пока недоступны.{' '}
            <Link to="/catalog" className="text-primary underline">
              Перейти в каталог
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
