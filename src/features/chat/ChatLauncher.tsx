import { lazy, Suspense, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router'
const ChatWidget = lazy(() => import('./ChatWidget'))
const subscribe = () => () => {}

export function ChatLauncher() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  const { pathname } = useLocation()
  if (!mounted || pathname.startsWith('/admin')) return null
  return (
    <Suspense fallback={null}>
      <ChatWidget />
    </Suspense>
  )
}
