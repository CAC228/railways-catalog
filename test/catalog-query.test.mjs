import { test } from 'node:test'
import assert from 'node:assert/strict'
import { catalogQuery, productQueryString } from '../src/shared/lib/catalog-query.ts'

test('catalog SSR and browser use the same bounded filters and API names', () => {
  const params = new URLSearchParams('page=2&limit=500&search=болт+м22&condition=used&sort=price-asc&stock=in-stock&attribute_Длина=25&utm_source=test')
  const query = catalogQuery(params, 'relsy', 'r65')
  assert.equal(query.page, 2); assert.equal(query.limit, 100)
  const api = new URLSearchParams(productQueryString(query))
  assert.equal(api.get('categorySlug'), 'relsy'); assert.equal(api.get('subcategorySlug'), 'r65')
  assert.equal(api.get('search'), 'болт м22'); assert.equal(api.get('attribute_Длина'), '25')
  assert.equal(api.has('utm_source'), false)
})
test('invalid and empty query values cannot send NaN, negative pages or unsupported enums to API', () => {
  const query = catalogQuery(new URLSearchParams('page=-1&limit=abc&condition=bad&stock=bad&sort=bad&priceMin=NaN&priceMax=-4'))
  assert.equal(query.page, 1); assert.equal(query.limit, 20); assert.equal(query.sort, 'name')
  assert.equal(query.priceMin, undefined); assert.equal(query.priceMax, undefined)
  assert.equal(query.condition, undefined); assert.equal(query.stock, undefined)
  assert.equal(catalogQuery(new URLSearchParams('priceMin=0')).priceMin, 0)
})
