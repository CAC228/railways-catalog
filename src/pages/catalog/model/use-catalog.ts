import { categoryApi, type Category } from '@/entities/category'
import {
  productApi,
  type GetProductsParams,
  type Product,
} from '@/entities/product'
import type { SortOption } from '@/entities/product/model/types'
import type { PaginationMeta } from '@/shared/api'
import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { useCategoryData } from '@/shared/seo/page-context'

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

  // Категории, которые сервер уже загрузил для /catalog: с ними H1, описание и хлебные крошки
  // категории есть в исходном HTML, а первая отрисовка в браузере совпадает с серверной.
  const { categories: preloadedCategories } = useCategoryData()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>(preloadedCategories)
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Раздел и категория — в пути (/catalog/<раздел>/<категория>), фильтры и страница — в параметрах.
  const { categorySlug, subcategorySlug } = useParams()
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const search = searchParams.get('search') ?? ''
  const gost = searchParams.get('gost') ?? ''
  const priceMin = searchParams.get('priceMin') ?? ''
  const priceMax = searchParams.get('priceMax') ?? ''
  const condition = (searchParams.get('condition') as FilterCondition) ?? 'all'
  const sort = (searchParams.get('sort') as SortOption) ?? 'name'
  const stock = (searchParams.get('stock') as FilterStock) ?? 'all'

  const attributeFilters = useMemo(() => {
    const attrs: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      if (key.startsWith('attribute_')) {
        const attrKey = key.replace('attribute_', '')
        attrs[attrKey] = value
      }
    })
    return attrs
  }, [searchParams])

  useEffect(() => {
    let cancelled = false

    async function loadCategories() {
      try {
        const response = await categoryApi.getAll({ limit: 100 })
        if (!cancelled) {
          setCategories(response.items)
        }
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }

    loadCategories()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        setLoading(true)
        setError(null)

        const params: GetProductsParams = {
          page,
          limit,
          category: categorySlug,
          subcategory: subcategorySlug,
          search: search || undefined,
          gost: gost || undefined,
          priceMin: priceMin === '' ? undefined : Number(priceMin),
          priceMax: priceMax === '' ? undefined : Number(priceMax),
          condition: condition !== 'all' ? condition : undefined,
          stock: stock !== 'all' ? stock : undefined,
          sort,
          attributes: attributeFilters,
        }

        const response = await productApi.getAll(params)
        if (!cancelled) {
          setProducts(response.items)
          setPagination(response.pagination)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Ошибка загрузки продуктов')
          console.error('Failed to load products:', err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()
    return () => {
      cancelled = true
    }
  }, [
    page,
    limit,
    categorySlug,
    subcategorySlug,
    search,
    gost,
    priceMin,
    priceMax,
    condition,
    stock,
    sort,
    attributeFilters,
  ])

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
