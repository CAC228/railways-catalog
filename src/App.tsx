// src/app/App.tsx
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { NotFoundPage } from './pages/not-found/NotFoundPage'
import { AboutPage } from './pages/about/AboutPage'
import { CatalogPage } from './pages/catalog/ui/CatalogPage'
import { ContactsPage } from './pages/contacts/ContactsPage'
import { DeliveryPage } from './pages/delivery/DeliveryPage'
import { ServicesPage } from './pages/services/ServicesPage'
import { ServicePage } from './pages/service/ServicePage'
import { CartPage } from './pages/cart/CartPage'
import { AdminLoginPage } from './entities/auth'
import { ProtectedRoute } from './shared/ui/ProtectedRoute'
import { ProductPage } from './pages/catalog'
import { ToastContainer } from 'react-toastify'
import { AdminPage } from './pages/admin'
import { HomePage } from './pages/home/HomePage'
import { PrivacyPage } from './pages/privacy/PrivacyPage'
import { CalculatorPage } from './pages/calculator/CalculatorPage'
import { CookieConsentBanner } from './widgets/cookie-consent/CookieConsentBanner'
import { usePageData } from './shared/seo/page-context'
import { legacyCatalogRedirect } from './shared/seo/route-data'
import { ChatLauncher } from './features/chat/ChatLauncher'

// Раздела или категории из адреса нет в базе — сервер ответил 404: показываем «Страница не найдена», а не весь каталог.
// Старый адрес /catalog?category=… внутри приложения переводим на ЧПУ так же, как сервер (301).
function CatalogRoute() {
  const { pathname, search } = useLocation()
  const status = usePageData().status
  const legacy = legacyCatalogRedirect(pathname, new URLSearchParams(search))
  if (legacy) return <Navigate to={legacy} replace />
  return status === 404 ? <NotFoundPage /> : <CatalogPage />
}

export function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalog" element={<CatalogRoute />} />
        <Route path="/catalog/:categorySlug" element={<CatalogRoute />} />
        <Route path="/catalog/:categorySlug/:subcategorySlug" element={<CatalogRoute />} />
        <Route
          path="/catalog/:categorySlug/:subcategorySlug/product/:productSlug"
          element={<ProductPage />}
        />
        <Route path="/catalog/:categorySlug/product/:productSlug" element={<ProductPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CookieConsentBanner />
      <ChatLauncher />
    </>
  )
}

export default App
