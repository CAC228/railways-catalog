import { lazy, Suspense, useState } from 'react'
import { Route, Routes } from 'react-router'
import { AdminLoginPage } from '@/entities/auth/ui/AdminLoginPage'
import { AdminHeader } from '@/widgets/admin-header'
import { AdminSidebar } from '@/widgets/admin-sidebar'
import { getToken, removeToken } from '@/entities/auth/model/auth.model'
import { AdminProductsPage } from './products'
import { AdminOrdersPage } from './orders'
import { AdminServicesPage } from './services/AdminServicesPage'
import { AdminRequestsPage } from './requests/AdminRequestsPage'
import { AdminSettingsPage } from './settings/AdminSettingsPage'
import { AdminDashboardPage as Dashboard } from './dashboard/AdminDashboardPage'
const AdminChatsPage = lazy(() => import('./chats/AdminChatsPage').then(module => ({ default: module.AdminChatsPage })))

export function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!getToken()
  })

  const handleLogout = () => {
    removeToken()
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <AdminHeader onLogout={handleLogout} />
      <AdminSidebar />

      <main className="lg:ml-64 pt-16 min-h-[calc(100vh-4rem)]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<AdminProductsPage />} />
          <Route path="/orders" element={<AdminOrdersPage />} />
          <Route path="/services" element={<AdminServicesPage />} />
          <Route path="/requests" element={<AdminRequestsPage />} />
          <Route path="/chats" element={<Suspense fallback={<p className="p-8">Загружаем чаты…</p>}><AdminChatsPage /></Suspense>} />
          <Route path="/settings" element={<AdminSettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}
