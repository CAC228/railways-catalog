import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { FiCheck, FiMessageSquare } from 'react-icons/fi'
import { getToken } from '@/entities/auth/model/auth.model'
import { ChatThread } from '@/features/chat/ChatThread'
import {
  chatRequest,
  useChatConnection,
  type Conversation,
  type History,
} from '@/features/chat/chat-client'
import '@/features/chat/chat.css'

export function AdminChatsPage() {
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('conversation') || ''
  const {
    socket,
    connected,
    error: connectionError,
    expired,
  } = useChatConnection(getToken(), true)
  const [items, setItems] = useState<Conversation[]>([])
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const listGeneration = useRef(0)
  const refresh = useCallback(async () => {
    if (!socket?.connected) return
    const generation = ++listGeneration.current
    try {
      const response = await chatRequest<{
        items: Conversation[]
        total: number
      }>(socket, 'chat:list', { page, search })
      if (generation !== listGeneration.current) return
      setItems(response.items)
      setTotal(response.total)
      setError('')
    } catch (failure) {
      if (generation === listGeneration.current)
        setError((failure as Error).message)
    }
  }, [socket, page, search])
  useEffect(() => {
    if (!socket) return
    const timer = setTimeout(() => void refresh(), 150)
    const changed = () => {
      void refresh()
    }
    socket
      .on('connect', changed)
      .on('chat:message', changed)
      .on('chat:read', changed)
      .on('chat:closed', changed)
    return () => {
      listGeneration.current++
      clearTimeout(timer)
      socket
        .off('connect', changed)
        .off('chat:message', changed)
        .off('chat:read', changed)
        .off('chat:closed', changed)
    }
  }, [socket, refresh])
  useEffect(() => {
    if (!selectedId || !socket?.connected) return
    let cancelled = false
    chatRequest<History>(socket, 'chat:history', { conversationId: selectedId })
      .then((response) => {
        if (!cancelled) setSelected(response.conversation)
      })
      .catch((failure) => {
        if (!cancelled) setError((failure as Error).message)
      })
    return () => {
      cancelled = true
    }
  }, [selectedId, socket, connected, items])
  const close = async () => {
    if (!socket || !selected) return
    try {
      await chatRequest(socket, 'chat:close', { conversationId: selected.id })
      await refresh()
    } catch (failure) {
      setError((failure as Error).message)
    }
  }
  return (
    <div className="admin-chats-page">
      <div className="admin-chat-title">
        <div>
          <span className="chat-eyebrow">ОБРАЩЕНИЯ С САЙТА</span>
          <h1>Чаты с посетителями</h1>
        </div>
        <span role="status">
          {connected ? 'Соединение установлено' : 'Подключение…'}
        </span>
      </div>
      {(error || connectionError) && (
        <p className="chat-error" role="alert">
          {error || connectionError}
          {expired && (
            <>
              {' '}
              <a href="/admin/login">Войти заново</a>
            </>
          )}
        </p>
      )}
      <div
        className={`admin-chat-workspace ${selectedId ? 'has-selection' : ''}`}
      >
        <aside className="admin-chat-inbox" aria-label="Переписки">
          <label className="admin-chat-search">
            <span className="sr-only">Поиск переписок</span>
            <input
              type="search"
              placeholder="Имя, телефон или почта"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </label>
          <p className="chat-inbox-count">Переписок: {total}</p>
          <div className="chat-conversation-list">
            {items.map((item) => (
              <button
                key={item.id}
                className={`chat-conversation ${selectedId === item.id ? 'selected' : ''}`}
                onClick={() => setParams({ conversation: item.id })}
              >
                <span className="chat-conversation-top">
                  <strong>{item.visitorName}</strong>
                  {!!item.unread && <b className="chat-badge">{item.unread}</b>}
                </span>
                <span className="chat-contact">
                  {item.contact || 'Посетитель сайта'}
                </span>
                <span className="chat-preview">
                  {item.lastMessage?.sender === 'MANAGER' ? 'Менеджер: ' : ''}
                  {item.lastMessage?.body}
                </span>
                <span className="chat-conversation-bottom">
                  {item.closed ? 'Завершён' : 'Открыт'}
                  <time>
                    {new Date(item.updatedAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </time>
                </span>
              </button>
            ))}
            {!items.length && (
              <p className="chat-hint">
                {search
                  ? 'Переписки не найдены'
                  : 'Здесь появятся сообщения посетителей'}
              </p>
            )}
          </div>
          {total > 30 && (
            <div className="chat-list-pages">
              <button
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Назад
              </button>
              <span>
                {page} / {Math.ceil(total / 30)}
              </span>
              <button
                disabled={page * 30 >= total}
                onClick={() => setPage((value) => value + 1)}
              >
                Далее
              </button>
            </div>
          )}
        </aside>
        <section className="admin-chat-detail" aria-label="Выбранная переписка">
          {selected && selected.id === selectedId && socket ? (
            <>
              <header className="admin-chat-detail-header">
                <div>
                  <button className="chat-back" onClick={() => setParams({})}>
                    ← Все чаты
                  </button>
                  <h2>{selected.visitorName}</h2>
                  <p>{selected.contact || 'Контакт не указан'}</p>
                  {selected.pageUrl && (
                    <a href={selected.pageUrl} target="_blank" rel="noreferrer">
                      Страница обращения ↗
                    </a>
                  )}
                </div>
                <button
                  className="chat-close-conversation"
                  onClick={() => void close()}
                  disabled={selected.closed || !connected}
                >
                  <FiCheck />
                  {selected.closed ? 'Завершён' : 'Завершить'}
                </button>
              </header>
              <ChatThread
                key={selected.id}
                socket={socket}
                conversationId={selected.id}
                manager
              />
            </>
          ) : (
            <div className="admin-chat-empty">
              <FiMessageSquare />
              <h2>
                {selectedId ? 'Загружаем переписку…' : 'Выберите переписку'}
              </h2>
              <p>Ответы посетителям и вся история сообщений — здесь.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
