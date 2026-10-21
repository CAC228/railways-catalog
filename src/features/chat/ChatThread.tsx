import { useCallback, useEffect, useRef, useState } from 'react'
import type { Socket } from 'socket.io-client'
import { FiSend } from 'react-icons/fi'
import {
  chatRequest,
  mergeMessages,
  type History,
  type Message,
  type ReadReceipt,
} from './chat-client'

export function ChatThread({
  socket,
  conversationId,
  manager = false,
  active = true,
}: {
  socket: Socket
  conversationId: string
  manager?: boolean
  active?: boolean
}) {
  const ownRole = manager ? 'MANAGER' : 'VISITOR'
  const draftKey = `prorels-chat-draft:${conversationId}:${ownRole}`
  const [messages, setMessages] = useState<Message[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState(() => {
    try {
      return sessionStorage.getItem(draftKey) || ''
    } catch {
      return ''
    }
  })
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(socket.connected)
  const pending = useRef<{ clientId: string; body: string } | null>(null)
  const list = useRef<HTMLDivElement>(null)
  const latest = useRef<Message[]>([])
  const lastRead = useRef(0)

  useEffect(() => {
    try {
      pending.current = JSON.parse(
        sessionStorage.getItem(`${draftKey}:pending`) || 'null',
      )
    } catch {
      /* Storage may be unavailable. */
    }
  }, [draftKey])
  const changeDraft = (value: string) => {
    setDraft(value)
    try {
      sessionStorage.setItem(draftKey, value)
    } catch {
      /* Draft still works in memory. */
    }
  }
  const markRead = useCallback(() => {
    if (!active || document.visibilityState !== 'visible' || !socket.connected)
      return
    const through = latest.current
      .filter((message) => message.sender !== ownRole && !message.readAt)
      .at(-1)?.id
    if (!through || through <= lastRead.current) return
    lastRead.current = through
    chatRequest(socket, 'chat:read', { conversationId, through }).catch(() => {
      lastRead.current = 0
    })
  }, [socket, conversationId, ownRole, active])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setConnected(true)
      setLoading(true)
      try {
        const history = await chatRequest<History>(socket, 'chat:history', {
          conversationId,
        })
        if (cancelled) return
        const last = history.messages.at(-1)?.id ?? 0
        setMessages((previous) =>
          mergeMessages(
            history.messages,
            previous.filter((message) => message.id > last),
          ),
        )
        setHasMore(history.hasMore)
        setError('')
        requestAnimationFrame(() => {
          if (list.current) list.current.scrollTop = list.current.scrollHeight
        })
      } catch (failure) {
        if (!cancelled) setError((failure as Error).message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const receive = (message: Message) => {
      if (message.conversationId === conversationId)
        setMessages((previous) => mergeMessages(previous, [message]))
    }
    const receipt = (event: ReadReceipt) => {
      if (event.conversationId === conversationId)
        setMessages((previous) =>
          previous.map((message) =>
            message.id <= event.through && message.sender !== event.reader
              ? { ...message, readAt: event.readAt }
              : message,
          ),
        )
    }
    const disconnect = () => setConnected(false)
    socket
      .on('connect', load)
      .on('disconnect', disconnect)
      .on('chat:message', receive)
      .on('chat:read', receipt)
    if (socket.connected) void load()
    return () => {
      cancelled = true
      socket
        .off('connect', load)
        .off('disconnect', disconnect)
        .off('chat:message', receive)
        .off('chat:read', receipt)
    }
  }, [socket, conversationId])

  useEffect(() => {
    latest.current = messages
    markRead()
    const element = list.current
    if (
      element &&
      (messages.at(-1)?.sender === ownRole ||
        element.scrollHeight - element.scrollTop - element.clientHeight < 200)
    )
      element.scrollTop = element.scrollHeight
  }, [messages, markRead, ownRole])
  useEffect(() => {
    document.addEventListener('visibilitychange', markRead)
    markRead()
    return () => document.removeEventListener('visibilitychange', markRead)
  }, [markRead])

  const older = async () => {
    if (loading) return
    setLoading(true)
    const element = list.current
    const oldHeight = element?.scrollHeight || 0
    try {
      const history = await chatRequest<History>(socket, 'chat:history', {
        conversationId,
        before: messages[0]?.id,
      })
      setMessages((previous) => mergeMessages(history.messages, previous))
      setHasMore(history.hasMore)
      requestAnimationFrame(() => {
        if (element) element.scrollTop += element.scrollHeight - oldHeight
      })
    } catch (failure) {
      setError((failure as Error).message)
    } finally {
      setLoading(false)
    }
  }
  const send = async () => {
    if (!draft.trim() || sending || !connected) return
    const body = draft.trim()
    if (pending.current?.body !== body)
      pending.current = { body, clientId: crypto.randomUUID() }
    try {
      sessionStorage.setItem(
        `${draftKey}:pending`,
        JSON.stringify(pending.current),
      )
    } catch {
      /* Keep retry identity in memory. */
    }
    setSending(true)
    setError('')
    try {
      const message = await chatRequest<Message>(socket, 'chat:send', {
        conversationId,
        ...pending.current,
      })
      setMessages((previous) => mergeMessages(previous, [message]))
      pending.current = null
      changeDraft('')
      try {
        sessionStorage.removeItem(`${draftKey}:pending`)
      } catch {
        /* No storage. */
      }
    } catch (failure) {
      setError((failure as Error).message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chat-thread">
      <div className="chat-connection" role="status">
        <span className={connected ? 'chat-dot connected' : 'chat-dot'} />
        {connected ? 'Соединение установлено' : 'Восстанавливаем соединение…'}
      </div>
      <div
        ref={list}
        className="chat-messages"
        role="log"
        aria-label="Переписка"
        aria-live="polite"
        aria-relevant="additions"
      >
        {hasMore && (
          <button
            className="chat-older"
            onClick={() => void older()}
            disabled={loading}
          >
            Ранние сообщения
          </button>
        )}
        {loading && <p className="chat-hint">Загружаем переписку…</p>}
        {!loading && !messages.length && (
          <div className="chat-empty">
            <strong>
              {manager ? 'Сообщений пока нет' : 'Поможем подобрать материалы'}
            </strong>
            <p>
              {manager
                ? 'Здесь появится переписка с посетителем.'
                : 'Напишите название, ГОСТ или задачу. Менеджер ответит здесь.'}
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.sender === ownRole ? 'own' : ''}`}
          >
            <span className="chat-author">
              {message.sender === 'MANAGER'
                ? 'Менеджер ПроРельс'
                : manager
                  ? 'Посетитель'
                  : 'Вы'}
            </span>
            <p>{message.body}</p>
            <span className="chat-message-meta">
              <time dateTime={message.createdAt}>
                {new Date(message.createdAt).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
              {message.sender === ownRole && (
                <span>{message.readAt ? 'Прочитано' : 'Доставлено'}</span>
              )}
            </span>
          </div>
        ))}
      </div>
      {error && (
        <p className="chat-error" role="alert">
          {error}
        </p>
      )}
      <form
        className="chat-compose"
        onSubmit={(event) => {
          event.preventDefault()
          void send()
        }}
      >
        <label className="sr-only" htmlFor={`chat-message-${conversationId}`}>
          Сообщение
        </label>
        <textarea
          id={`chat-message-${conversationId}`}
          placeholder="Напишите сообщение…"
          maxLength={4000}
          rows={2}
          value={draft}
          disabled={sending}
          onChange={(event) => changeDraft(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault()
              void send()
            }
          }}
        />
        <button
          type="submit"
          className="chat-send"
          aria-label="Отправить сообщение"
          disabled={!connected || sending || !draft.trim()}
        >
          <FiSend aria-hidden="true" />
        </button>
        <span className="chat-compose-note">
          {sending
            ? 'Отправляем…'
            : `${draft.length}/4000 · Shift + Enter — новая строка`}
        </span>
      </form>
    </div>
  )
}
