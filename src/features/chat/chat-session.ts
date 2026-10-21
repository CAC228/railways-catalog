import type { Conversation } from './chat-client'

export type ChatSession = { conversation: Conversation; token: string }
export class ChatSessionError extends Error {}

const unavailable = 'Чат временно недоступен. Попробуйте ещё раз через минуту.'

/** A proxy may return an empty body or HTML instead of the API's JSON. */
export async function readChatSession(response: Response): Promise<ChatSession> {
  if (!response.ok) {
    if (response.status === 429)
      throw new ChatSessionError('Слишком много попыток. Подождите немного и попробуйте снова.')
    if (response.status === 400 || response.status === 403)
      throw new ChatSessionError('Проверьте имя и согласие на обработку данных.')
    throw new ChatSessionError(unavailable)
  }
  let value: ChatSession | null
  try {
    value = await response.json()
  } catch {
    throw new ChatSessionError(unavailable)
  }
  if (
    !value ||
    typeof value.token !== 'string' ||
    !/^[0-9a-f]{64}$/.test(value.token) ||
    typeof value.conversation?.id !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.conversation.id) ||
    typeof value.conversation.visitorName !== 'string'
  ) throw new ChatSessionError(unavailable)
  return value
}
