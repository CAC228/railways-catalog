// src/widgets/sidebar-catalog/ui/CatalogSidebar.tsx
import { useState } from 'react'
import { Link } from 'react-router'
import { FiChevronDown } from 'react-icons/fi'
import type { Category } from '@/entities/category'
import { useCatalogSidebar } from '../model/use-catalog-sidebar'
import { catalogPath } from '@/shared/seo/route-data'

interface CatalogSidebarProps {
  activeCategory?: string
  activeSubcategory?: string
}

export function CatalogSidebar({
  activeCategory,
  activeSubcategory,
}: CatalogSidebarProps) {
  const { categories, loading, error } = useCatalogSidebar()

  if (loading) {
    return (
      <aside className="z-10 w-full flex-shrink-0 lg:w-64">
        <div className="sticky top-20 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </aside>
    )
  }

  if (error) {
    return (
      <aside className="z-10 w-full flex-shrink-0 lg:w-64">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Ошибка загрузки каталога
        </div>
      </aside>
    )
  }

  return (
    <aside className="z-10 w-full flex-shrink-0 lg:w-64">
      <nav className="sticky top-20 space-y-2">
        {categories.map((category) => (
          <SidebarCategory
            key={category.slug}
            category={category}
            isActive={activeCategory === category.slug}
            activeSubcategory={activeSubcategory}
          />
        ))}
      </nav>
    </aside>
  )
}

interface SidebarCategoryProps {
  category: Category
  isActive: boolean
  activeSubcategory?: string
}

function SidebarCategory({
  category,
  isActive,
  activeSubcategory,
}: SidebarCategoryProps) {
  const [isOpen, setIsOpen] = useState(isActive)
  const subcategories = category.subcategories ?? []
  const hasSubcategories = subcategories.length > 0

  return (
    <div className="relative z-10">
      <div
        className={`flex items-center gap-1 rounded-lg transition-colors ${
          isActive
            ? 'bg-[hsl(var(--primary))/0.1]'
            : 'hover:bg-[hsl(var(--muted))]'
        }`}
      >
        <Link
          to={catalogPath(category.slug)}
          className={`flex-1 rounded-lg px-4 py-3 text-left font-medium transition-colors ${
            isActive
              ? 'text-[hsl(var(--primary))]'
              : 'text-[hsl(var(--foreground))]'
          }`}
        >
          <span>{category.name}</span>
        </Link>

        {hasSubcategories && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[hsl(var(--muted))] hover:text-foreground"
            aria-label={isOpen ? 'Свернуть подкатегории' : 'Развернуть подкатегории'}
          >
            <FiChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
      </div>

      {hasSubcategories && (
        <div
          className={`overflow-hidden transition-all duration-200 ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="space-y-1 px-4 pb-2 pt-1">
            {subcategories.map((subcategory) => {
              const isSubActive = activeSubcategory === subcategory.slug

              return (
                <Link
                  key={subcategory.slug}
                  to={catalogPath(category.slug, subcategory.slug)}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    isSubActive
                      ? 'bg-[hsl(var(--primary))/0.1] font-medium text-[hsl(var(--primary))]'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{subcategory.name}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}