import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { cn } from '@/shared/lib/cn'
import { Link } from 'react-router'
import type { ReactNode } from 'react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  pageHref?: (page: number) => string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  pageHref,
}: PaginationProps) {
  if (totalPages <= 1) return null
  const control = (
    page: number,
    children: ReactNode,
    label?: string,
    disabled = false,
  ) => {
    const classes = cn(
      'inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
      disabled
        ? 'opacity-40'
        : page === currentPage
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted',
    )
    if (disabled)
      return (
        <span className={classes} aria-disabled="true" aria-label={label}>
          {children}
        </span>
      )
    if (pageHref)
      return (
        <Link
          to={pageHref(page)}
          className={classes}
          aria-label={label}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {children}
        </Link>
      )
    return (
      <button
        onClick={() => onPageChange(page)}
        className={classes}
        aria-label={label}
        aria-current={page === currentPage ? 'page' : undefined}
      >
        {children}
      </button>
    )
  }

  // Все номера подряд не помещаются, когда страниц много (весь каталог — 26):
  // показываем первую, последнюю и соседние с текущей, пропуски — многоточием.
  const pages: Array<number | 'gap'> = []
  for (let page = 1; page <= totalPages; page++) {
    const near = Math.abs(page - currentPage) <= 1
    const edge = page === 1 || page === totalPages
    const nearEdge =
      (currentPage <= 3 && page <= 4) ||
      (currentPage >= totalPages - 2 && page >= totalPages - 3)
    if (near || edge || nearEdge) pages.push(page)
    else if (pages.at(-1) !== 'gap') pages.push('gap')
  }

  return (
    <nav
      aria-label="Страницы каталога"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {control(
        currentPage - 1,
        <FiChevronLeft className="h-5 w-5" />,
        'Предыдущая страница',
        currentPage === 1,
      )}

      {pages.map((page, index) =>
        page === 'gap' ? (
          <span
            key={`gap-${index}`}
            className="px-1 text-muted-foreground"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <span key={page}>{control(page, page)}</span>
        ),
      )}

      {control(
        currentPage + 1,
        <FiChevronRight className="h-5 w-5" />,
        'Следующая страница',
        currentPage === totalPages,
      )}
    </nav>
  )
}
