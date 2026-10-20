// src/features/admin-products/ui/ProductFormModal.tsx
import { useId, useMemo, useState } from 'react'
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi'
import type { Category } from '@/entities/category'
import type { Subcategory } from '@/entities/subcategory'
import type { CreateProductDto, Product, UpdateProductDto } from '@/entities/product'
import { getImageUrl, sanitizeSlug, slugify } from '@/shared/lib'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { MultipleImageUpload } from '@/shared/ui/MultipleImageUploads'
import { Select } from '@/shared/ui/Select'

interface SpecDraft {
  id: string
  label: string
  value: string
  unit: string
}

interface ProductFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onCreate: (dto: CreateProductDto, images: File[]) => Promise<Product | null>
  onUpdate?: (id: string, dto: UpdateProductDto, images: File[]) => Promise<boolean>
  categories: Category[]
}



function clampNonNegative(value: string): string {
  const num = Number(value)
  if (Number.isNaN(num)) return ''
  if (num < 0) return '0'
  return String(num)
}

export function ProductFormModal(props: ProductFormModalProps) {
  if (!props.open) return null
  return <ProductFormModalContent key={props.product?.id ?? 'new'} {...props} />
}

function ProductFormModalContent({
  open,
  onOpenChange,
  product,
  onCreate,
  onUpdate,
  categories,
}: ProductFormModalProps) {
  const isEditMode = !!product

  const [sku, setSku] = useState(product?.sku ?? '')
  const [title, setTitle] = useState(product?.title ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(!!product)
  const [gost, setGost] = useState(product?.gost ?? '')
  const [price, setPrice] = useState(product?.price == null ? '' : String(product.price))
  const [priceOnRequest, setPriceOnRequest] = useState(!!product && !product.price)
  const [stock, setStock] = useState(String(product?.stock ?? 1))
  const [condition, setCondition] = useState<Product['condition']>(product?.condition ?? 'new')
  const [categorySlug, setCategorySlug] = useState(product?.categorySlug ?? '')
  const [subcategorySlug, setSubcategorySlug] = useState(product?.subcategorySlug ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [descriptionTags, setDescriptionTags] = useState(product?.descriptionTags ?? '')
  const formId = useId()
  const descriptionId = `${formId}-description`
  const descriptionTagsId = `${formId}-description-tags`
  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? [])
  const [newImages, setNewImages] = useState<File[]>([])
  const [specs, setSpecs] = useState<SpecDraft[]>(() => (product?.specs ?? []).map(spec => ({ id: crypto.randomUUID(), label: spec.label, value: String(spec.value), unit: spec.unit ?? '' })))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCategory = useMemo<Category | null>(
    () => categories.find((category) => category.slug === categorySlug) || null,
    [categories, categorySlug],
  )

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slugTouched) {
      setSlug(slugify(value))
    }
  }

  const handleSlugChange = (value: string) => {
    setSlug(sanitizeSlug(value))
    setSlugTouched(true)
  }

  const handlePriceChange = (value: string) => {
    setPrice(clampNonNegative(value))
  }

  const handleStockChange = (value: string) => {
    setStock(clampNonNegative(value))
  }

  const handleAddSpec = () => {
    setSpecs([
      ...specs,
      {
        id: crypto.randomUUID(),
        label: '',
        value: '',
        unit: '',
      },
    ])
  }

  const handleRemoveSpec = (id: string) => {
    setSpecs((prev) => prev.filter((s) => s.id !== id))
  }

  const handleSpecChange = (
    id: string,
    field: 'label' | 'value' | 'unit',
    value: string,
  ) => {
    setSpecs((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s
        return { ...s, [field]: value }
      }),
    )
  }

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sku.trim() || !title.trim() || !slug.trim() || !categorySlug) {
      setError('SKU, название, slug и категория обязательны')
      return
    }

    const invalidSpec = specs.find((s) => !s.label.trim() || !s.value.trim())
    if (invalidSpec) {
      setError('Заполните название и значение для всех характеристик')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const productSpecs = specs.map((s) => {
        const numValue = Number(s.value)

        return {
          label: s.label.trim(),
          value:
            !isNaN(numValue) && s.value.trim() !== ''
              ? numValue
              : s.value.trim(),
          unit: s.unit.trim() || undefined,
        }
      })

      const finalPrice = priceOnRequest ? null : Math.max(0, Number(price) || 0)
      const finalStock = Math.max(0, Number(stock) || 0)

      const baseDto = {
        sku: sku.trim(),
        title: title.trim(),
        slug: slug.trim(),
        gost: gost.trim(),
        price: finalPrice,
        stock: finalStock,
        condition,
        categorySlug,
        subcategorySlug,
        description: description.trim(),
        descriptionTags: descriptionTags.trim(),
        specs: productSpecs,
      }

      if (isEditMode && product && onUpdate) {
        const saved = await onUpdate(product.id, { ...baseDto, retainedImages: existingImages }, newImages)
        if (!saved) throw new Error('Не удалось сохранить товар. Изменения оставлены в форме. Проверьте данные и повторите попытку.')
      } else {
        const saved = await onCreate(baseDto, newImages)
        if (!saved) throw new Error('Не удалось создать товар. Проверьте данные и повторите попытку.')
      }

      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? 'Ошибка при обновлении продукта'
            : 'Ошибка при создании продукта',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setSku('')
    setTitle('')
    setSlug('')
    setSlugTouched(false)
    setGost('')
    setPrice('')
    setPriceOnRequest(false)
    setStock('1')
    setCondition('new')
    setCategorySlug('')
    setSubcategorySlug('')
    setDescription('')
    setDescriptionTags('')
    setExistingImages([])
    setNewImages([])
    setSpecs([])
    setError(null)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title={isEditMode ? 'Редактировать продукт' : 'Добавить продукт'}
      description={
        isEditMode
          ? 'Измените информацию о продукте'
          : 'Заполните информацию о новом продукте'
      }
      className="sm:max-w-3xl"
      footer={
        <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button type="submit" form={formId} disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? 'Сохранение...'
                : 'Создание...'
              : isEditMode
                ? 'Сохранить'
                : 'Создать'}
          </Button>
        </div>
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              SKU *
            </label>
            <Input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Например: RL-001"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Slug *
            </label>
            <Input
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="Например: rels-r65"
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Генерируется автоматически. Только латиница, цифры и дефисы.
            </p>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Название *
          </label>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Например: Рельс железнодорожный Р65"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            ГОСТ
          </label>
          <Input
            value={gost}
            onChange={(e) => setGost(e.target.value)}
            placeholder="Например: ГОСТ Р 51685-2013"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Цена
            </label>
            <Input
              type="number"
              inputMode="numeric"
              min="0"
              step="any"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              onBlur={() => setPrice((prev) => clampNonNegative(prev))}
              placeholder="0"
              disabled={isSubmitting || priceOnRequest}
            />
          </div>

          <div className="flex items-end">
            <label className="flex min-h-11 cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={priceOnRequest}
                onChange={(e) => setPriceOnRequest(e.target.checked)}
                disabled={isSubmitting}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground">Цена по запросу</span>
            </label>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Остаток на складе
          </label>
          <Input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={stock}
            onChange={(e) => handleStockChange(e.target.value)}
            onBlur={() => setStock((prev) => clampNonNegative(prev))}
            placeholder="0"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Состояние
          </label>
          <Select
            options={[
              { value: 'new', label: 'Новый' },
              { value: 'used', label: 'Б/У' },
              { value: 'service', label: 'Сервисный' },
            ]}
            value={condition}
            onChange={(e) =>
              setCondition(e.target.value as Product['condition'])
            }
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Категория *
            </label>
            <Select
              options={[
                { value: '', label: 'Выберите категорию' },
                ...categories.map((cat: Category) => ({
                  value: cat.slug,
                  label: cat.name,
                })),
              ]}
              value={categorySlug}
              onChange={(e) => {
                setCategorySlug(e.target.value)
                setSubcategorySlug('')
              }}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Субкатегория
            </label>
            <Select
              options={[
                { value: '', label: 'Выберите субкатегорию' },
                ...(selectedCategory?.subcategories ?? []).map(
                  (sub: Subcategory) => ({
                    value: sub.slug,
                    label: sub.name,
                  }),
                ),
              ]}
              value={subcategorySlug}
              onChange={(e) => setSubcategorySlug(e.target.value)}
              disabled={isSubmitting || !categorySlug}
            />
          </div>
        </div>

        {isEditMode && existingImages.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Текущие изображения
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {existingImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`Изображение ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label={`Удалить изображение ${index + 1}`}
                    onClick={() => handleRemoveExistingImage(index)}
                    disabled={isSubmitting}
                    className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <MultipleImageUpload
          value={newImages}
          onChange={setNewImages}
          disabled={isSubmitting}
          label={isEditMode ? 'Добавить новые изображения' : 'Изображения'}
          maxFiles={Math.max(0, 10 - existingImages.length)}
        />

        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Характеристики
              </h3>
              <p className="text-xs text-muted-foreground">
                {specs.length}{' '}
                {specs.length === 1
                  ? 'характеристика'
                  : specs.length < 5
                    ? 'характеристики'
                    : 'характеристик'}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddSpec}
              disabled={isSubmitting}
            >
              <FiPlus className="h-4 w-4" />
              Добавить
            </Button>
          </div>

          {specs.length > 0 && (
            <div className="space-y-2">
              {specs.map((spec, index) => (
                <div
                  key={spec.id}
                  className="grid grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-2 rounded-lg border border-border bg-card p-2 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1.7fr)_2.75rem]"
                >
                  <Input
                    aria-label={`Название характеристики ${index + 1}`}
                    className="min-w-0"
                    value={spec.label}
                    onChange={(e) =>
                      handleSpecChange(spec.id, 'label', e.target.value)
                    }
                    placeholder="Название (Масса)"
                    disabled={isSubmitting}
                  />
                  <div className="col-span-2 row-start-2 grid min-w-0 grid-cols-2 gap-2 sm:col-span-1 sm:row-start-auto sm:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
                    <Input
                      aria-label={`Значение характеристики ${index + 1}`}
                      className="min-w-0"
                      value={spec.value}
                      onChange={(e) =>
                        handleSpecChange(spec.id, 'value', e.target.value)
                      }
                      placeholder="Значение (65)"
                      disabled={isSubmitting}
                    />
                    <Input
                      aria-label={`Единица измерения характеристики ${index + 1}`}
                      className="min-w-0"
                      value={spec.unit}
                      onChange={(e) =>
                        handleSpecChange(spec.id, 'unit', e.target.value)
                      }
                      placeholder="Ед. изм."
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="button"
                    aria-label={`Удалить характеристику ${index + 1}`}
                    onClick={() => handleRemoveSpec(spec.id)}
                    disabled={isSubmitting}
                    className="col-start-2 row-start-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:col-start-3"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {specs.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Характеристики ещё не добавлены
            </p>
          )}
        </div>

        <div>
          <label htmlFor={descriptionId} className="mb-2 block text-sm font-medium text-foreground">
            Описание
          </label>
          <textarea
            id={descriptionId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Краткое описание продукта"
            disabled={isSubmitting}
            rows={5}
            className="block min-h-40 w-full resize-y rounded-lg border border-border bg-muted/50 p-3 text-base leading-6 text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor={descriptionTagsId} className="mb-2 block text-sm font-medium text-foreground">
            Слова для поиска по сайту
          </label>
          <textarea
            id={descriptionTagsId}
            value={descriptionTags}
            onChange={(e) => setDescriptionTags(e.target.value)}
            aria-describedby={`${descriptionTagsId}-hint`}
            placeholder="р18 р-18 p18 релсы клема кастыль"
            disabled={isSubmitting}
            rows={3}
            className="block min-h-28 w-full resize-y rounded-lg border border-border bg-muted/50 p-3 text-base leading-6 text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          />
          <p id={`${descriptionTagsId}-hint`} className="mt-2 text-xs leading-5 text-muted-foreground">
            Только для поиска по сайту: в карточке не видно, в Яндекс и Google не уходит. Через пробел — варианты обозначений, ошибки, сленг. Каждое слово запроса ищется отдельно в названии, артикуле, ГОСТе и здесь.
          </p>
        </div>

        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      </form>
    </Dialog>
  )
}
