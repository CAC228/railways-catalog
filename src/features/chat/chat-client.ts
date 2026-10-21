import { io, type Socket } from 'socket.io-client'
import { useEffect, useState } from 'react'

export type Message = {
  id: number
  conversationId: string
  clientId: string
  sender: 'VISITOR' | 'MANAGER'
  body: string
  createdAt: string
  readAt: string | null
}
export type Conversation = {
  id: string
  visitorName: string
  contact: string | null
  pageUrl: string | null
  closed: boolean
  createdAt: string
  updatedAt: string
  unread?: number
  lastMessage?: Message
}
export type History = {
  conversation: Conversation
  messages: Message[]
  hasMore: boolean
}
export type ReadReceipt = {
  conversationId: string
  through: number
  reader: Message['sender']
  readAt: string
}

export async function chatRequest<T>(
  socket: Socket,
  event: string,
  data: object,
): Promise<T> {
  if (!socket.connected)
    throw new Error(
      'Нет соединения. Дождитесь подключения и повторите отправку.',
    )
  const result = (await socket
    .timeout(10000)
    .emitWithAck(event, data)
    .catch(() => {
      throw new Error('Сервер не подтвердил действие. Попробуйте ещё раз.')
    })) as { ok: boolean; data: T; error?: string; code?: number }
  if (!result.ok)
    throw new Error(result.error || 'Не удалось выполнить действие')
  return result.data
}

export function useChatConnection(token: string | null, manager = false) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')
  const [expired, setExpired] = useState(false)
  useEffect(() => {
    setExpired(false)
    setError('')
    if (!token) return
    const connection = io(
      import.meta.env.VITE_CHAT_URL || window.location.origin,
      {
        path: '/api/chat/socket.io',
        transports: ['websocket'],
        auth: manager ? { adminToken: token } : { token },
        autoConnect: false,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      },
    )
    connection.on('connect', () => {
      setConnected(true)
      setError('')
    })
    connection.on('disconnect', () => setConnected(false))
    connection.on('chat:expired', () => {
      setExpired(true)
      setError('Сессия истекла. Войдите заново.')
    })
    connection.on(
      'connect_error',
      (failure: Error & { data?: { code?: string } }) => {
        setConnected(false)
        setExpired(failure.data?.code === 'UNAUTHORIZED')
        setError(
          failure.data?.code === 'UNAUTHORIZED'
            ? 'Сессия истекла. Войдите заново.'
            : 'Не удалось подключиться. Пробуем снова…',
        )
      },
    )
    setSocket(connection)
    connection.connect()
    return () => {
      connection.disconnect()
      setConnected(false)
      setSocket(null)
    }
  }, [token, manager])
  return { socket, connected, error, expired }
}

export function mergeMessages(previous: Message[], incoming: Message[]) {
  const map = new Map(previous.map((message) => [message.id, message]))
  incoming.forEach((message) => map.set(message.id, message))
  return [...map.values()].sort((a, b) => a.id - b.id)
}
