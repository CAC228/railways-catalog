import { useState } from 'react'
import { Link } from 'react-router'
import { FiSearch } from 'react-icons/fi'
import type { Product } from '@/entities/product/model/types'
import { AddToCartButton } from '@/features/cart/ui/AddToCartButton'
import { formatPrice, getConditionLabel } from '@/shared/lib/catalog-helpers'
import { formatSpec, plainText } from '@/shared/lib/plain-text'
import { getImageUrl } from '@/shared/lib/product-helpers'
import { productPath } from '@/shared/seo/route-data'
import { ProductImage } from '@/shared/ui/ProductImage'
import { PriceNote } from '@/shared/ui/PriceNote'
import { RequestFormModal } from '@/shared/ui/RequestFormModal'
import './catalog-list.css'

export function CatalogList({
  products,
  searchAllHref,
}: {
  products: Product[]
  /** Тот же запрос без раздела — ссылка «во всех материалах» в пустой выдаче. */
  searchAllHref?: string
}) {
  const [requestedProduct, setRequestedProduct] = useState<Product | null>(null)
  if (!products.length)
    return (
      <div className="rounded-lg border border-border bg-muted px-6 py-14 text-center">
        <FiSearch
          aria-hidden="true"
          className="mx-auto mb-4 h-8 w-8 text-muted-foreground"
        />
        <h2 className="mb-2 text-2xl font-bold">Ничего не найдено</h2>
        <p className="text-muted-foreground">
          Измените параметры поиска или сбросьте фильтры.
        </p>
        {searchAllHref && (
          <p className="mt-2 text-muted-foreground">
            Попробуйте поискать{' '}
            <Link
              to={searchAllHref}
              className="font-bold text-primary underline underline-offset-4 hover:no-underline"
            >
              во всех материалах
            </Link>
            .
          </p>
        )}
      </div>
    )
  return (
    <>
      <table className="catalog-list" aria-label="Товары каталога">
        <thead>
          <tr>
            <th scope="col">Название</th>
            <th scope="col">ГОСТ</th>
            <th scope="col">Вес</th>
            <th scope="col">Цена</th>
            <th scope="col">
              <span className="sr-only">Корзина</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const weightSpec = product.specs?.find((spec) =>
              /масса|вес|weight/i.test(spec.label),
            )
            const weight = weightSpec
              ? formatSpec(weightSpec.value, weightSpec.unit).replace(
                  /[;.]$/,
                  '',
                )
              : '—'
            const unitSpec = product.specs?.find((spec) =>
              spec.label.toLowerCase().includes('единица'),
            )
            const unit = unitSpec
              ? plainText(unitSpec.value).replace(/[;.]$/, '')
              : ''
            return (
              <tr key={product.id}>
                <td className="catalog-list-name">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <Link
                      to={productPath(product)}
                      aria-hidden="true"
                      tabIndex={-1}
                      className="catalog-list-image"
                    >
                      <ProductImage
                        src={getImageUrl(product.images[0] ?? '')}
                        alt={product.title}
                        loading="lazy"
                        sizes="88px"
                        width={88}
                        height={88}
                        className="h-full w-full object-contain"
                        fallbackClassName="h-full w-full rounded-md"
                        iconClassName="h-6 w-6"
                      />
                    </Link>
                    <div className="min-w-0">
                      <Link
                        to={productPath(product)}
                        className="block text-sm font-bold leading-6 break-words transition-colors hover:text-primary xl:text-base"
                      >
                        {product.title}
                      </Link>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span>{product.sku}</span>
                        <span aria-hidden="true">·</span>
                        <span className={product.condition === 'new' ? 'font-medium text-success' : undefined}>
                          {getConditionLabel(product.condition)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-success' : 'bg-muted-foreground'}`}
                          />
                          {product.stock > 0 ? 'В наличии' : 'Под заказ'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="catalog-list-gost">
                  <span className="md:hidden">ГОСТ: </span>
                  {product.gost || '—'}
                </td>
                <td className="catalog-list-weight">
                  <span className="md:hidden">Вес: </span>
                  {weight}
                </td>
                <td className="catalog-list-price">
                  <button
                    type="button"
                    onClick={() => setRequestedProduct(product)}
                    aria-label={`Запросить цену и спецификацию: ${product.title}`}
                    className="text-left font-bold text-primary hover:underline"
                  >
                    {product.price
                      ? `${formatPrice(product.price)} ₽`
                      : 'По запросу'}
                  </button>
                  {product.price != null && product.price > 0 && unit && (
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      / {unit}
                    </span>
                  )}
                  <PriceNote className="mt-0.5" />
                </td>
                <td className="catalog-list-cart">
                  <AddToCartButton product={product} variant="accent" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <RequestFormModal
        open={!!requestedProduct}
        onOpenChange={(open) => {
          if (!open) setRequestedProduct(null)
        }}
        productId={requestedProduct?.id}
        title="Запросить цену и спецификацию"
        description={requestedProduct?.title}
      />
    </>
  )
}
