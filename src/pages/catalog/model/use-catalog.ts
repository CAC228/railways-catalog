import { catalogQuery, productQueryString } from '@/shared/lib/catalog-query'
import { type Category } from '@/entities/category'
import { productApi, type Product } from '@/entities/product'
import type { PaginationMeta } from '@/shared/api'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useCategoryData, usePageData } from '@/shared/seo/page-context'

type FilterCondition = 'new' | 'used' | 'service' | 'all'
type FilterStock = 'all' | 'in-stock' | 'on-order'

import type { FilterState } from '@/features/product-filter/ProductFilter'
export type { FilterState } from '@/features/product-filter/ProductFilter'

export interface UseCatalogReturn {
  products: Product[]
  categories: Category[]
  currentCategory?: Category
  currentSubcategory?: Category['subcategories'] extends (infer U)[] | undefined
    ? U
    : never
  filterValue: FilterState
  pagination: PaginationMeta
  loading: boolean
  error: string | null
  handleFilterChange: (nextFilters: FilterState) => void
  handlePageChange: (page: number) => void
}

export function useCatalog(): UseCatalogReturn {
  const [searchParams, setSearchParams] = useSearchParams()

  const { categories } = useCategoryData()
  const { catalog: preloaded, status } = usePageData()
  const { categorySlug, subcategorySlug } = useParams()
  const query = useMemo(
    () => catalogQuery(searchParams, categorySlug, subcategorySlug),
    [searchParams, categorySlug, subcategorySlug],
  )
  const key = productQueryString(query)
  const [loaded, setLoaded] = useState(preloaded)
  const [failure, setFailure] = useState<{
    key: string
    message: string
  } | null>(null)
  const current =
    loaded?.key === key
      ? loaded
      : preloaded?.key === key
        ? preloaded
        : undefined
  const error =
    status >= 500
      ? 'Каталог временно недоступен. Попробуйте позже.'
      : failure?.key === key
        ? failure.message
        : null
  const loading = !current && !error
  const products = current?.response.items ?? []
  const pagination: PaginationMeta = current?.response.pagination ?? {
    total: 0,
    page: query.page || 1,
    limit: query.limit || 20,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  }
  const search = query.search ?? ''
  const gost = query.gost ?? ''
  const priceMin = query.priceMin === undefined ? '' : String(query.priceMin)
  const priceMax = query.priceMax === undefined ? '' : String(query.priceMax)
  const condition = (query.condition ?? 'all') as FilterCondition
  const stock = (query.stock ?? 'all') as FilterStock
  const sort = query.sort ?? 'name'
  const attributeFilters = query.attributes ?? {}

  useEffect(() => {
    if (current) return
    let cancelled = false
    productApi
      .getAll(query)
      .then((response) => {
        if (!cancelled) {
          setLoaded({ key, response })
          setFailure(null)
        }
      })
      .catch(() => {
        if (!cancelled)
          setFailure({
            key,
            message:
              'Не удалось загрузить товары. Обновите страницу или попробуйте позже.',
          })
      })
    return () => {
      cancelled = true
    }
  }, [key, query, current])

  const handleFilterChange = (nextFilters: FilterState) => {
    const params = new URLSearchParams(searchParams)

    params.set('page', '1')
    for (const key of ['gost', 'priceMin', 'priceMax'] as const) {
      if (nextFilters[key].trim()) params.set(key, nextFilters[key].trim())
      else params.delete(key)
    }

    if (nextFilters.search) {
      params.set('search', nextFilters.search)
    } else {
      params.delete('search')
    }

    if (nextFilters.condition !== 'all') {
      params.set('condition', nextFilters.condition)
    } else {
      params.delete('condition')
    }

    if (nextFilters.stock !== 'all') {
      params.set('stock', nextFilters.stock)
    } else {
      params.delete('stock')
    }

    if (nextFilters.sort !== 'name') {
      params.set('sort', nextFilters.sort)
    } else {
      params.delete('sort')
    }

    Array.from(params.keys())
      .filter((key) => key.startsWith('attribute_'))
      .forEach((key) => params.delete(key))

    Object.entries(nextFilters.attributes).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(`attribute_${key}`, value)
      }
    })

    setSearchParams(params)
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(newPage))
    setSearchParams(params)
  }

  const currentCategory = categories.find((c) => c.slug === categorySlug)
  const currentSubcategory = currentCategory?.subcategories?.find(
    (s) => s.slug === subcategorySlug,
  )

  const filterValue: FilterState = {
    search,
    gost,
    priceMin,
    priceMax,
    condition,
    stock,
    sort,
    attributes: attributeFilters,
  }

  return {
    products,
    categories,
    currentCategory,
    currentSubcategory,
    filterValue,
    pagination,
    loading,
    error,
    handleFilterChange,
    handlePageChange,
  }
}
