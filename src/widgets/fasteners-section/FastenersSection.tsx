import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CarouselArrows } from '@/shared/ui/CarouselArrows'
import { useCategories } from '@/entities/category/model/hooks/useCategories'
import { normalizeText } from '@/shared/lib'
import { catalogPath } from '@/shared/seo/route-data'

const FASTENER_CATEGORY_NAME = 'крепежные элементы'

export function FastenersSection() {
  const { categories, isLoading } = useCategories()

  const fastenerSubcategories = useMemo(() => {
    const fastenerCategory = categories.find(
      (cat) => normalizeText(cat.name) === FASTENER_CATEGORY_NAME,
    )
    return fastenerCategory?.subcategories ?? []
  }, [categories])

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateButtons = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    updateButtons()

    emblaApi.on('select', updateButtons)
    emblaApi.on('reInit', updateButtons)

    return () => {
      emblaApi.off('select', updateButtons)
      emblaApi.off('reInit', updateButtons)
    }
  }, [emblaApi, updateButtons])

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  if (!isLoading && fastenerSubcategories.length === 0) {
    return null
  }

  return (
    <section className="bg-muted/40 py-14">
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="mb-7 flex items-center justify-between gap-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-black tracking-tight text-foreground md:text-4xl"
          >
            Крепёжные элементы
          </motion.h2>

          {!isLoading && fastenerSubcategories.length > 4 && (
            <CarouselArrows
              onPrev={scrollPrev}
              onNext={scrollNext}
              canScrollPrev={canScrollPrev}
              canScrollNext={canScrollNext}
            />
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-[150px] rounded-xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div ref={emblaRef} className="overflow-hidden">
            <div className="-ml-3 flex">
              {fastenerSubcategories.map((subcat, index) => (
                <div
                  key={subcat.id}
                  className="min-w-0 flex-[0_0_75%] pl-3 sm:flex-[0_0_50%] md:flex-[0_0_33.333%] lg:flex-[0_0_25%] xl:flex-[0_0_20%]"
                >
                  <motion.a
                    href={catalogPath(subcat.categorySlug, subcat.slug)}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: index * 0.04,
                      duration: 0.35,
                    }}
                    className="group relative flex h-[150px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                  >
                    <div className="pointer-events-none absolute -right-7 -top-7 h-24 w-24 rounded-full bg-muted transition-transform duration-500 group-hover:scale-125" />

                    <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-lg">
                      🔩
                    </div>

                    <div className="relative z-10 flex items-end justify-between gap-3">
                      <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {subcat.name}
                      </h3>

                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        <svg
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 12h14m-6-6 6 6-6 6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      </span>
                    </div>
                  </motion.a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}