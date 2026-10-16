import { useId, useState, type FormEvent } from 'react'
import { toast } from 'react-toastify'
import { Button } from '@/shared/ui/Button'
import { Checkbox } from '@/shared/ui/Checkbox'
import { Dialog } from '@/shared/ui/Dialog'
import { Input } from '@/shared/ui/Input'
import { PhoneInput } from '@/shared/ui/PhoneInput'
import { Textarea } from '@/shared/ui/Textarea'
import { requestApi } from '@/entities/request/api/request.api'
import { FORM_GOAL, metrikaReachGoal } from '@/shared/analytics/metrika'

// Сервер принимает телефон только полным: +7 (XXX) XXX-XX-XX.
const FULL_PHONE = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/
const EMPTY = { name: '', phone: '', email: '', comment: '', policyAccepted: false }

/**
 * Окно «Свяжитесь с нами!» по кнопке «Свяжитесь со мной» в списке контактов шапки.
 * Заявка уходит туда же, куда и из большой формы; телефон обязателен, почта — по желанию.
 */
export function ContactMeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [form, setForm] = useState(EMPTY)
  const [sending, setSending] = useState(false)
  const policyId = useId()

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!FULL_PHONE.test(form.phone)) {
      toast.error('Введите телефон полностью: +7 (XXX) XXX-XX-XX')
      return
    }
    setSending(true)
    try {
      await requestApi.create(
        {
          name: form.name.trim(),
          phone: form.phone,
          email: form.email.trim() || undefined,
          comment: form.comment.trim() || undefined,
          policyAccepted: form.policyAccepted,
        },
        {},
      )
      metrikaReachGoal(FORM_GOAL)
      toast.success('Спасибо, заявка отправлена! Свяжемся с вами в рабочее время')
      setForm(EMPTY)
      onOpenChange(false)
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Не удалось отправить. Позвоните нам или попробуйте позже'
      ;(Array.isArray(message) ? message : [message]).forEach((text: string) => toast.error(text))
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Свяжитесь с нами!"
      description="Заполните форму — мы свяжемся с вами в рабочее время"
      className="max-w-md"
    >
      <form onSubmit={submit} className="space-y-4">
        <Input
          placeholder="Ваше имя или организация *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          disabled={sending}
        />
        <PhoneInput
          placeholder="Телефон *"
          value={form.phone}
          onChange={(phone) => setForm({ ...form, phone })}
          required
          disabled={sending}
          className="h-11 bg-muted/50 px-4 text-sm"
        />
        <Input
          type="email"
          placeholder="Email (по желанию)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={sending}
        />
        <Textarea
          rows={4}
          placeholder="Ваше сообщение"
          value={form.comment}
          onChange={(e) => setForm({ ...form, comment: e.target.value })}
          disabled={sending}
        />
        <div className="flex items-start gap-2">
          <Checkbox
            id={policyId}
            checked={form.policyAccepted}
            onChange={(e) => setForm({ ...form, policyAccepted: e.target.checked })}
            required
            disabled={sending}
          />
          <label htmlFor={policyId} className="cursor-pointer text-xs leading-tight text-muted-foreground">
            Я согласен с{' '}
            <a href="/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              политикой конфиденциальности
            </a>
          </label>
        </div>
        <Button type="submit" className="w-full" disabled={sending}>
          {sending ? 'Отправка…' : 'Отправить'}
        </Button>
      </form>
    </Dialog>
  )
}
