import type {
  GetProductsParams,
  SortOption,
} from '../../entities/product/model/types'

const sorts = ['name', 'price-asc', 'price-desc', 'popular', 'newest']
const integer = (value: string | null, fallback: number, max: number) => {
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed > 0
    ? Math.min(parsed, max)
    : fallback
}

/** One query contract for the server and browser, including bounded pagination. */
export function catalogQuery(
  search: URLSearchParams,
  category?: string,
  subcategory?: string,
): GetProductsParams {
  const price = (key: string) => {
    const value = search.get(key)
    return value?.trim() && Number.isFinite(Number(value)) && Number(value) >= 0
      ? Number(value)
      : undefined
  }
  const attributes: Record<string, string> = Object.create(null)
  search.forEach((value, key) => {
    if (key.startsWith('attribute_') && value && value !== 'all')
      attributes[key.slice(10)] = value
  })
  return {
    page: integer(search.get('page'), 1, 100000),
    limit: integer(search.get('limit'), 20, 100),
    category,
    subcategory,
    search: search.get('search') || undefined,
    gost: search.get('gost') || undefined,
    priceMin: price('priceMin'),
    priceMax: price('priceMax'),
    condition: ['new', 'used', 'service'].includes(
      search.get('condition') || '',
    )
      ? (search.get('condition') as GetProductsParams['condition'])
      : undefined,
    stock: ['in-stock', 'on-order'].includes(search.get('stock') || '')
      ? (search.get('stock') as GetProductsParams['stock'])
      : undefined,
    sort: sorts.includes(search.get('sort') || '')
      ? (search.get('sort') as SortOption)
      : 'name',
    attributes,
  }
}

export function productQueryString(params: GetProductsParams = {}): string {
  const query = new URLSearchParams()
  const { category, subcategory, attributes, ...rest } = params
  for (const [key, value] of Object.entries({
    ...rest,
    categorySlug: category,
    subcategorySlug: subcategory,
  })) {
    if (value !== undefined && value !== 'all') query.set(key, String(value))
  }
  for (const [key, value] of Object.entries(attributes || {}))
    if (value && value !== 'all') query.set(`attribute_${key}`, value)
  query.sort()
  return query.toString()
}
