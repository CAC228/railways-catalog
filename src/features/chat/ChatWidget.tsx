import { useEffect, useRef, useState } from 'react'
import { FiMessageSquare, FiX } from 'react-icons/fi'
import { useLocation } from 'react-router'
import { ChatThread } from './ChatThread'
import {
  useChatConnection,
  type Conversation,
  type Message,
} from './chat-client'
import './chat.css'

const SESSION_KEY = 'prorels-chat-session-v1'
type Session = { conversation: Conversation; token: string }

export default function ChatWidget() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
      return stored?.token && stored?.conversation?.id ? stored : null
    } catch {
      return null
    }
  })
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [unread, setUnread] = useState(0)
  const opener = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLElement>(null)
  const {
    socket,
    error: connectionError,
    expired,
  } = useChatConnection(session?.token || null)
  useEffect(() => {
    if (!socket) return
    const receive = (message: Message) => {
      if (message.sender === 'MANAGER' && !open) setUnread((count) => count + 1)
    }
    socket.on('chat:message', receive)
    return () => {
      socket.off('chat:message', receive)
    }
  }, [socket, open])
  useEffect(() => {
    if (!open) return
    panel.current?.focus()
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        opener.current?.focus()
      }
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [open])
  const start = async () => {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const base = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${base}/chat/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          contact,
          policyAccepted: accepted,
          pageUrl: pathname,
        }),
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(
          typeof result.message === 'string'
            ? result.message
            : 'Не удалось начать чат. Попробуйте позже.',
        )
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify(result))
      } catch {
        /* The current tab remains usable. */
      }
      setSession(result)
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Не удалось начать чат',
      )
    } finally {
      setBusy(false)
    }
  }
  const reset = () => {
    setSession(null)
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      /* No storage. */
    }
  }
  if (pathname.startsWith('/admin')) return null
  return (
    <div className="chat-widget">
      <button
        ref={opener}
        className="chat-launcher"
        aria-label={open ? 'Свернуть чат' : 'Написать менеджеру'}
        aria-expanded={open}
        aria-controls="prorels-chat"
        onClick={() => {
          setOpen((value) => !value)
          setUnread(0)
        }}
      >
        <FiMessageSquare aria-hidden="true" />
        <span>Написать нам</span>
        {unread > 0 && <b className="chat-badge">{unread}</b>}
      </button>
      <section
        ref={panel}
        id="prorels-chat"
        className="chat-panel"
        role="dialog"
        aria-labelledby="prorels-chat-title"
        hidden={!open}
        tabIndex={-1}
      >
        <header className="chat-panel-header">
          <div>
            <span className="chat-eyebrow">ПРОРЕЛЬС · ПОДБОР МАТЕРИАЛОВ</span>
            <h2 id="prorels-chat-title">На связи с вами</h2>
            <p>Пн–Пт, 8:00–17:00 · ответим в рабочее время</p>
          </div>
          <button
            aria-label="Свернуть чат"
            className="chat-icon-button"
            onClick={() => {
              setOpen(false)
              opener.current?.focus()
            }}
          >
            <FiX />
          </button>
        </header>
        {expired ? (
          <div className="chat-start">
            <p role="alert">Сессия чата истекла. Начните новую переписку.</p>
            <button className="chat-primary" onClick={reset}>
              Начать новый чат
            </button>
          </div>
        ) : session && socket ? (
          <ChatThread
            key={session.conversation.id}
            socket={socket}
            conversationId={session.conversation.id}
            active={open}
          />
        ) : (
          <form
            className="chat-start"
            onSubmit={(event) => {
              event.preventDefault()
              void start()
            }}
          >
            <p>
              Подскажем наличие, подберём крепёж и поможем с расчётом поставки.
            </p>
            <label>
              Как к вам обращаться
              <input
                autoComplete="name"
                name="name"
                required
                maxLength={80}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ваше имя"
              />
            </label>
            <label>
              Телефон или почта{' '}
              <span className="chat-optional">необязательно</span>
              <input
                autoComplete="email"
                maxLength={160}
                value={contact}
                onChange={(event) => setContact(event.target.value)}
                placeholder="Чтобы связаться, если вы уйдёте"
              />
            </label>
            <label className="chat-consent">
              <input
                type="checkbox"
                required
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              <span>
                Согласен на{' '}
                <a href="/privacy#consent" target="_blank" rel="noreferrer">
                  обработку персональных данных
                </a>{' '}
                и ознакомлен с{' '}
                <a href="/privacy" target="_blank" rel="noreferrer">
                  политикой конфиденциальности
                </a>
                .
              </span>
            </label>
            {error && (
              <p className="chat-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="chat-primary"
              type="submit"
              disabled={busy || !accepted || !name.trim()}
            >
              {busy ? 'Подключаем…' : 'Начать переписку'}
            </button>
          </form>
        )}
        {connectionError && !expired && (
          <p className="chat-error" role="status">
            {connectionError}
          </p>
        )}
      </section>
    </div>
  )
}
