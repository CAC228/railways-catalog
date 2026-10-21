import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ChatSessionError, readChatSession } from '../src/features/chat/chat-session.ts'

test('chat handles empty, HTML and malformed proxy responses without exposing parser errors', async () => {
  for (const body of ['', '<html>Bad gateway</html>', '{', '{}', 'null', '{"token":"invalid","conversation":{}}']) {
    await assert.rejects(readChatSession(new Response(body)), error =>
      error instanceof ChatSessionError && error.message.includes('временно недоступен'))
  }
  await assert.rejects(readChatSession(new Response(null, { status: 502 })), /временно недоступен/)
})

test('chat uses actionable validation and rate-limit errors', async () => {
  for (const status of [400, 403])
    await assert.rejects(readChatSession(new Response(null, { status })), /Проверьте имя и согласие/)
  await assert.rejects(readChatSession(new Response(null, { status: 429 })), /Слишком много попыток/)
})

test('chat accepts a valid server-issued session', async () => {
  const session = { token: 'a'.repeat(64), conversation: { id: '11111111-1111-4111-8111-111111111111', visitorName: 'Посетитель' } }
  assert.deepEqual(await readChatSession(Response.json(session, { status: 201 })), session)
})
