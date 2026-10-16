import { useState } from 'react'
import { FiMessageCircle, FiPhone } from 'react-icons/fi'
import { Button } from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/Dialog'
import { MessengerLinks } from '@/shared/ui/MessengerLinks'
import { PHONE_CALL, tel } from '@/shared/lib/phones'

// Городского пока нет — значок звонит на мобильный (src/shared/lib/phones.ts).
const PHONE = PHONE_CALL

const iconLink =
  'inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

// Панель внизу экрана карточки товара на телефоне и планшете: на узком экране кнопки заявки
// уходят далеко вниз, под фото и характеристики. На широком экране не нужна — там они рядом.
export function ProductActionBar({
  onPrice,
  onSpecification,
}: {
  onPrice: () => void
  onSpecification: () => void
}) {
  const [messengersOpen, setMessengersOpen] = useState(false)

  return (
    <>
      {/* Место под панелью, чтобы она не закрывала низ страницы. */}
      <div className="h-[calc(4.5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true" />

      <div
        role="region"
        aria-label="Заявка по товару"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 px-3 pt-2 pb-[max(.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgb(28_31_34/0.08)] backdrop-blur lg:hidden"
      >
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <a href={tel(PHONE)} aria-label={`Позвонить: ${PHONE}`} title={`Позвонить: ${PHONE}`} className={iconLink}>
            <FiPhone className="h-5 w-5" aria-hidden="true" />
          </a>
          {/* На совсем узком экране (меньше 360 px) места нет — мессенджеры остаются в меню и подвале. */}
          <button
            type="button"
            aria-label="Написать в мессенджер"
            title="Написать в мессенджер"
            onClick={() => setMessengersOpen(true)}
            className={`${iconLink} max-[359px]:hidden`}
          >
            <FiMessageCircle className="h-5 w-5" aria-hidden="true" />
          </button>
          <Button type="button" onClick={onPrice} className="flex-1 whitespace-nowrap px-2! text-sm!">
            Узнать цену
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onSpecification}
            className="flex-1 px-2! py-1.5! text-[13px]! leading-tight"
          >
            Запросить спецификацию
          </Button>
        </div>
      </div>

      <Dialog
        open={messengersOpen}
        onOpenChange={setMessengersOpen}
        title="Написать нам"
        description="Пн–Пт, 8:00–17:00"
      >
        <MessengerLinks showPhone />
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          * WhatsApp принадлежит Meta Platforms Inc., деятельность которой по реализации Facebook и Instagram признана экстремистской и запрещена в России. Это решение не распространяется на WhatsApp.
        </p>
      </Dialog>
    </>
  )
}
