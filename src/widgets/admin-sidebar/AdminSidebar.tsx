import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { FiBarChart2, FiBox, FiMenu, FiShoppingCart, FiTool, FiInbox, FiSettings, FiX } from 'react-icons/fi'
import { cn } from '@/shared/lib/cn'

export function AdminSidebar() {
  const location = useLocation()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const menuItems = [
    { to: '/admin', label: 'Дашборд', icon: FiBarChart2 },
    { to: '/admin/products', label: 'Продукты', icon: FiBox },
    { to: '/admin/services', label: 'Услуги', icon: FiTool },
    { to: '/admin/requests', label: 'Заявки', icon: FiInbox },
    { to: '/admin/chats', label: 'Чаты', icon: FiInbox },
    { to: '/admin/orders', label: 'Заказы', icon: FiShoppingCart },
    { to: '/admin/settings', label: 'Настройки', icon: FiSettings },
  ]

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-20 z-40 rounded-lg border border-border bg-[hsl(var(--background))] p-2 shadow-sm lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <FiX className="h-6 w-6" />
        ) : (
          <FiMenu className="h-6 w-6" />
        )}
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-border bg-[hsl(var(--background))] transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:z-30 lg:translate-x-0'
        )}
      >
        <nav className="space-y-2 p-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to
              const Icon = item.icon
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[hsl(var(--primary))/0.1] text-[hsl(var(--primary))]'
                      : 'text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>
    </>
  )
}
